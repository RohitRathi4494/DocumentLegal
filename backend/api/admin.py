from django.contrib import admin
from .models import Client, DocumentType, Document

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'aadhar', 'created_at')
    search_fields = ('name', 'phone', 'aadhar')

@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'is_active', 'created_at')
    list_filter = ('is_active', 'version')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'document_type', 'created_by', 'created_at')
    list_filter = ('document_type', 'created_at')
