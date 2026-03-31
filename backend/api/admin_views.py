from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.contrib.auth.models import User
from .models import Document, DocumentType, Subscription, Tenant
from django.db.models import Sum, Count

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_writers = User.objects.filter(is_staff=False).count()
        total_documents = Document.objects.all().count()
        total_templates = DocumentType.objects.all().count()
        
        # Simple revenue calculation based on active subscriptions
        # FREE: 0, PRO: 999, ADVANCED: 2999
        revenue_map = {
            'FREE': 0,
            'PRO': 999,
            'ADVANCED': 2999
        }
        
        active_subs = Subscription.objects.filter(status='ACTIVE')
        total_revenue = sum(revenue_map.get(sub.plan, 0) for sub in active_subs)
        
        return Response({
            'total_writers': total_writers,
            'total_documents': total_documents,
            'total_templates': total_templates,
            'total_revenue': total_revenue,
            'active_sub_count': active_subs.count()
        })

class AdminUserListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all().select_related('profile').prefetch_related('owned_tenants__subscription')
        data = []
        for user in users:
            # Get the first tenant for simplicity
            tenant = user.owned_tenants.first()
            subscription = getattr(tenant, 'subscription', None) if tenant else None
            
            data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'date_joined': user.date_joined,
                'tenant_name': tenant.name if tenant else "No Tenant",
                'plan': subscription.plan if subscription else "FREE",
                'sub_status': subscription.status if subscription else "INACTIVE",
                'docs_generated': tenant.total_docs_generated if tenant else 0
            })
class AdminUserActionView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            action = request.data.get('action')
            
            if action == 'change_plan':
                new_plan = request.data.get('plan')
                if new_plan not in ['FREE', 'PRO', 'ADVANCED']:
                    return Response({"error": "Invalid plan"}, status=status.HTTP_400_BAD_REQUEST)
                
                tenant = user.owned_tenants.first()
                if tenant:
                    sub, _ = Subscription.objects.get_or_create(tenant=tenant)
                    sub.plan = new_plan
                    sub.status = 'ACTIVE'
                    sub.save()
                    return Response({"message": f"Plan updated to {new_plan}"})
            
            elif action == 'toggle_status':
                user.is_active = not user.is_active
                user.save()
                return Response({"message": f"User active status: {user.is_active}", "is_active": user.is_active})
                
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
