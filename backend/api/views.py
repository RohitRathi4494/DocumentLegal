from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.conf import settings
from django.db import transaction
import os

from .models import Client, DocumentType, Document, WriterProfile, Tenant, Subscription
from .serializers import UserSerializer, ClientSerializer, DocumentTypeSerializer, DocumentSerializer, WriterProfileSerializer, TenantSerializer
from .services import DocumentEngine, RazorpayService
from .services.plans import PlanManager
from .tasks import generate_document_task
from django.db.models import Count, Sum
from django.db.models.functions import TruncDay
from django.utils import timezone
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

class MeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email", "")
        
        if not username or not password:
            return Response({"error": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            user = User.objects.create_user(username=username, email=email, password=password)
            
            # Create a new Tenant for the user
            tenant = Tenant.objects.create(name=f"{username}'s Workspace", owner=user)
            
            # Create a FREE subscription for the tenant
            Subscription.objects.create(tenant=tenant, plan='FREE', status='ACTIVE')
            
            # Create a profile and link to the Tenant
            import uuid
            profile = WriterProfile.objects.create(
                user=user, 
                tenant=tenant,
                slug=username.lower() or uuid.uuid4().hex[:8]
            )
            
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)


from .serializers import ClientSerializer, DocumentTypeSerializer, DocumentSerializer, UserSerializer, WriterProfileSerializer, TenantSerializer

class SubscriptionViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'webhook':
            return [AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['post'])
    def initiate(self, request):
        """
        Creates a Razorpay subscription for the current tenant.
        """
        tenant = request.user.profile.tenant
        plan_name = request.data.get('plan') # 'PRO' or 'ADVANCED'
        
        # Get Plan ID from config
        plan_config = PlanManager.get_plan_config_by_name(plan_name)
        if not plan_config or not plan_config.get('razorpay_plan_id'):
            return Response({"error": "Invalid plan name or Plan ID not configured."}, status=status.HTTP_400_BAD_GATEWAY)
        
        try:
            rzp_sub = RazorpayService.create_subscription(
                plan_id=plan_config['razorpay_plan_id'],
                customer_email=request.user.email
            )
            
            # Save ID to subscription model (create if not exists)
            sub, _ = Subscription.objects.get_or_create(tenant=tenant)
            sub.razorpay_subscription_id = rzp_sub['id']
            sub.plan = plan_name
            sub.status = 'INACTIVE' # Will be active once webhook fires
            sub.save()
            
            return Response({
                "subscription_id": rzp_sub['id'],
                "razorpay_key": settings.RAZORPAY_KEY_ID
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def cancel(self, request):
        tenant = request.user.profile.tenant
        try:
            sub = tenant.subscription
            if sub.razorpay_subscription_id:
                RazorpayService.cancel_subscription(sub.razorpay_subscription_id)
            sub.status = 'CANCELLED'
            sub.save()
            return Response({"message": "Subscription cancelled successfully."})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=['post'])
    def webhook(self, request):
        """
        Razorpay Webhook listener.
        """
        signature = request.headers.get('X-Razorpay-Signature')
        body = request.body.decode('utf-8')
        
        if not RazorpayService.verify_webhook(body, signature):
            return Response({"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)
            
        payload = json.loads(body)
        event = payload.get('event')
        
        if event in ['subscription.charged', 'subscription.activated']:
            sub_id = payload['payload']['subscription']['entity']['id']
            try:
                sub = Subscription.objects.get(razorpay_subscription_id=sub_id)
                sub.status = 'ACTIVE'
                # Set end date based on Razorpay period end if available
                # current_end = payload['payload']['subscription']['entity']['current_end']
                sub.save()
                logger.info(f"Subscription {sub_id} updated to ACTIVE via webhook.")
            except Subscription.DoesNotExist:
                logger.error(f"Subscription {sub_id} not found for webhook.")
                
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        tenant = self.request.user.profile.tenant
        serializer.save(tenant=tenant)


class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = DocumentTypeSerializer
    permission_classes = [AllowAny] 
    lookup_field = 'slug'

    def perform_create(self, serializer):
        tenant = self.request.user.profile.tenant
        # Check if plan allows custom upload
        if not PlanManager.get_plan_config(tenant)['can_upload_custom']:
            return Response({"error": "Your current plan does not allow custom template uploads. Please upgrade to ADVANCED."}, status=status.HTTP_403_FORBIDDEN)
        serializer.save(tenant=tenant)

    @action(detail=True, methods=['post'])
    def clone(self, request, slug=None):
        """
        Clones a global template into the user's workspace.
        """
        global_template = self.get_object()
        if not global_template.is_global:
            return Response({"error": "Only global templates can be cloned."}, status=status.HTTP_400_BAD_REQUEST)
        
        tenant = request.user.profile.tenant
        
        # Check if already cloned
        if DocumentType.objects.filter(tenant=tenant, name=global_template.name).exists():
            return Response({"message": "Template already exists in your workspace."}, status=status.HTTP_200_OK)

        # Create a copy
        cloned = DocumentType.objects.create(
            tenant=tenant,
            name=global_template.name,
            slug=f"{global_template.slug}-{tenant.id}",
            description=global_template.description,
            version=global_template.version,
            is_active=True,
            template_file=global_template.template_file,
            form_schema=global_template.form_schema
        )
        return Response(DocumentTypeSerializer(cloned).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def seed_examples(self, request):
        """
        Clones all global templates into the tenant's workspace simultaneously.
        """
        tenant = request.user.profile.tenant
        global_templates = DocumentType.objects.filter(is_global=True, is_active=True)
        cloned_count = 0

        for gt in global_templates:
            # Avoid duplicating templates with the same name in the same tenant
            if not DocumentType.objects.filter(tenant=tenant, name=gt.name).exists():
                DocumentType.objects.create(
                    tenant=tenant,
                    name=gt.name,
                    slug=f"{gt.slug}-{tenant.id}",
                    description=gt.description,
                    version=gt.version,
                    is_active=True,
                    template_file=gt.template_file,
                    form_schema=gt.form_schema
                )
                cloned_count += 1
        
        return Response({
            "message": f"Successfully seeded {cloned_count} templates into your workspace.",
            "count": cloned_count
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def schema(self, request, slug=None):
        doc_type = self.get_object()
        return Response(doc_type.form_schema)


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # We rely on TenantAwareManager for tenant filtering
        # But we still filter by user for specific document ownership if needed
        return Document.objects.filter(created_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        tenant = self.request.user.profile.tenant
        serializer.save(tenant=tenant, created_by=self.request.user, status='PENDING')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Returns high-fidelity analytics for the Milestone 6 dashboard.
        """
        tenant = request.user.profile.tenant
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        
        # 1. Total Counts
        total_docs = Document.objects.filter(tenant=tenant).count()
        completed_docs = Document.objects.filter(tenant=tenant, status='COMPLETED').count()
        total_clients = Client.objects.filter(tenant=tenant).count()
        
        # 2. Daily Trends (Last 30 Days)
        daily_trends = Document.objects.filter(
            tenant=tenant, 
            created_at__gte=thirty_days_ago
        ).annotate(
            day=TruncDay('created_at')
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')

        # 3. Top Templates
        top_templates = Document.objects.filter(
            tenant=tenant
        ).values(
            'document_type__name', 
            'document_type__slug'
        ).annotate(
            usage=Count('id')
        ).order_by('-usage')[:5]

        # 4. Recent Activity (Latest 10)
        recent_activity = Document.objects.filter(
            tenant=tenant
        ).order_by('-created_at')[:10]

        activity_data = []
        for doc in recent_activity:
            activity_data.append({
                "id": doc.id,
                "type": "DOCUMENT_CREATED",
                "description": f"Generated {doc.document_type.name}",
                "status": doc.status,
                "timestamp": doc.created_at,
                "user": doc.created_by.username if doc.created_by else "System"
            })

        return Response({
            "total_documents": total_docs,
            "completed_documents": completed_docs,
            "total_clients": total_clients,
            "daily_trends": daily_trends,
            "top_templates": top_templates,
            "recent_activity": activity_data,
            "plan_usage": {
                "used": tenant.total_docs_generated,
                "limit": PlanManager.get_plan_config(tenant)['max_documents'],
                "plan_name": tenant.subscription.plan if hasattr(tenant, 'subscription') else 'FREE'
            }
        })

    @action(detail=False, methods=['post'])
    def preview(self, request):
        doc_type_id = request.data.get('document_type')
        data_json = request.data.get('data')

        try:
            doc_type = DocumentType.objects.get(id=doc_type_id)
            tenant = request.user.profile.tenant
            
            # SaaS Check: Template Access
            if not PlanManager.can_access_template(tenant, doc_type):
                return Response({"error": f"The template '{doc_type.name}' is not available on your current plan."}, status=status.HTTP_403_FORBIDDEN)

            template_path = doc_type.template_file.path
            temp_file_rel_path = DocumentEngine.render_document(template_path, data_json, is_preview=True)
            preview_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{temp_file_rel_path}")
            
            return Response({"preview_url": preview_url}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def preview_as_html(self, request):
        doc_type_id = request.data.get('document_type')
        data_json = request.data.get('data')

        try:
            doc_type = DocumentType.objects.get(id=doc_type_id)
            tenant = request.user.profile.tenant
            
            if not PlanManager.can_access_template(tenant, doc_type):
                return Response({"error": f"Template not available on your plan."}, status=status.HTTP_403_FORBIDDEN)

            template_path = doc_type.template_file.path
            html_content = DocumentEngine.render_to_html(template_path, data_json)
            
            return Response({"html": html_content}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        doc_type_id = request.data.get('document_type')
        data_json = request.data.get('data')

        try:
            doc_type = DocumentType.objects.get(id=doc_type_id)
            tenant = request.user.profile.tenant

            # SaaS Checks
            can_gen, error = PlanManager.can_generate_document(tenant)
            if not can_gen:
                return Response({"error": error}, status=status.HTTP_403_FORBIDDEN)
            
            if not PlanManager.can_access_template(tenant, doc_type):
                return Response({"error": f"Template '{doc_type.name}' restricted."}, status=status.HTTP_403_FORBIDDEN)

            with transaction.atomic():
                document = Document.objects.create(
                    tenant=tenant,
                    document_type=doc_type,
                    created_by=request.user,
                    data_json=data_json,
                    status='PROCESSING'
                )
                tenant.total_docs_generated += 1
                tenant.save()
            
            # Trigger Background Task
            generate_document_task.delay(document.id, doc_type.id, data_json)
            
            return Response({"message": "Generation started", "document_id": document.id}, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        document = self.get_object()
        data_json = request.data.get('data')

        try:
            document.data_json = data_json
            document.status = 'PROCESSING'
            document.save()
            
            # Trigger Background Task
            generate_document_task.delay(document.id, document.document_type.id, data_json)
            
            return Response({"message": "Finalization started", "document_id": document.id}, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicIntakeViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, slug=None):
        try:
            profile = WriterProfile.objects.get(slug=slug)
            return Response(WriterProfileSerializer(profile).data)
        except WriterProfile.DoesNotExist:
            return Response({"error": "Writer not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def submit(self, request, slug=None):
        try:
            profile = WriterProfile.objects.get(slug=slug)
            doc_type_id = request.data.get('document_type')
            data_json = request.data.get('data')
            
            doc_type = DocumentType.objects.get(id=doc_type_id)
            tenant = profile.tenant

            # SaaS Check: Document Generation Limit (checked for the writer/tenant)
            can_gen, error = PlanManager.can_generate_document(tenant)
            if not can_gen:
                return Response({"error": "The writer has reached their plan's document generation limit. Please contact them directly."}, status=status.HTTP_403_FORBIDDEN)
            
            document = Document.objects.create(
                tenant=tenant,
                document_type=doc_type,
                created_by=profile.user,
                data_json=data_json,
                status='SUBMITTED',
                is_public_entry=True
            )
            
            return Response({"message": "Successfully submitted", "document_id": document.id}, status=status.HTTP_201_CREATED)
        except WriterProfile.DoesNotExist:
            return Response({"error": "Writer not found"}, status=status.HTTP_404_NOT_FOUND)
        except DocumentType.DoesNotExist:
            return Response({"error": "DocumentType not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

