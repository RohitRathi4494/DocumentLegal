from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client, DocumentType, Document, WriterProfile, Tenant

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'name']

class WriterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WriterProfile
        fields = ['slug', 'business_name', 'bio']

class UserSerializer(serializers.ModelSerializer):
    profile = WriterProfileSerializer(read_only=True)
    tenant = TenantSerializer(source='profile.tenant', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile', 'tenant', 'is_staff', 'is_superuser']

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['tenant']

class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = '__all__'
        read_only_fields = ['tenant']

class DocumentSerializer(serializers.ModelSerializer):
    document_type_details = DocumentTypeSerializer(source='document_type', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['generated_file', 'pdf_file', 'created_by', 'is_public_entry', 'tenant']
