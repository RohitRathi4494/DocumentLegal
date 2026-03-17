from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client, DocumentType, Document, WriterProfile

class WriterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WriterProfile
        fields = ['slug', 'business_name', 'bio']

class UserSerializer(serializers.ModelSerializer):
    profile = WriterProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    document_type_details = DocumentTypeSerializer(source='document_type', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['generated_file', 'created_by', 'is_public_entry']
