from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.conf import settings
import os

from .models import Client, DocumentType, Document, WriterProfile
from .serializers import ClientSerializer, DocumentTypeSerializer, DocumentSerializer, UserSerializer, WriterProfileSerializer
from .services import DocumentEngine

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
        user = User.objects.create_user(username=username, email=email, password=password)
        # Create a default profile with a slug
        import uuid
        WriterProfile.objects.create(user=user, slug=username.lower() or uuid.uuid4().hex[:8])
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]


class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = DocumentTypeSerializer
    permission_classes = [AllowAny] 
    lookup_field = 'slug'

    @action(detail=True, methods=['get'])
    def schema(self, request, slug=None):
        doc_type = self.get_object()
        return Response(doc_type.form_schema)


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(created_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, status='COMPLETED')

    @action(detail=False, methods=['post'])
    def preview(self, request):
        doc_type_id = request.data.get('document_type')
        data_json = request.data.get('data')

        try:
            doc_type = DocumentType.objects.get(id=doc_type_id)
            template_path = doc_type.template_file.path
            temp_file_rel_path = DocumentEngine.render_document(template_path, data_json, is_preview=True)
            preview_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{temp_file_rel_path}")
            
            return Response({"preview_url": preview_url}, status=status.HTTP_200_OK)
        except DocumentType.DoesNotExist:
            return Response({"error": "DocumentType not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        doc_type_id = request.data.get('document_type')
        data_json = request.data.get('data')

        try:
            doc_type = DocumentType.objects.get(id=doc_type_id)
            template_path = doc_type.template_file.path
            
            # Generate the actual document
            generated_file_rel_path = DocumentEngine.render_document(template_path, data_json, is_preview=False)
            
            # Save Document Record
            document = Document.objects.create(
                document_type=doc_type,
                created_by=request.user,
                data_json=data_json,
                generated_file=generated_file_rel_path,
                status='COMPLETED'
            )
            
            download_url = request.build_absolute_uri(document.generated_file.url)
            return Response({"download_url": download_url, "document_id": document.id}, status=status.HTTP_201_CREATED)
            
        except DocumentType.DoesNotExist:
            return Response({"error": "DocumentType not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        document = self.get_object()
        data_json = request.data.get('data')

        try:
            doc_type = document.document_type
            template_path = doc_type.template_file.path
            
            # Generate the actual document
            generated_file_rel_path = DocumentEngine.render_document(template_path, data_json, is_preview=False)
            
            # Update Document Record
            document.data_json = data_json
            document.generated_file = generated_file_rel_path
            document.status = 'COMPLETED'
            document.save()
            
            download_url = request.build_absolute_uri(document.generated_file.url)
            return Response({"download_url": download_url, "document_id": document.id}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicIntakeViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, slug=None):
        print(f"DEBUG: PublicIntake.retrieve called with slug='{slug}'")
        try:
            profile = WriterProfile.objects.get(slug=slug)
            return Response(WriterProfileSerializer(profile).data)
        except WriterProfile.DoesNotExist:
            print(f"DEBUG: WriterProfile not found for slug='{slug}'")
            return Response({"error": "Writer not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def submit(self, request, slug=None):
        try:
            profile = WriterProfile.objects.get(slug=slug)
            doc_type_id = request.data.get('document_type')
            data_json = request.data.get('data')
            
            doc_type = DocumentType.objects.get(id=doc_type_id)
            
            document = Document.objects.create(
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

