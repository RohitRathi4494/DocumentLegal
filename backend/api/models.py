from django.db import models
from django.contrib.auth.models import User

class WriterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    slug = models.SlugField(unique=True, help_text="Unique URL slug for public intake")
    business_name = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.slug})"

class Client(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    aadhar = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class DocumentType(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    description = models.TextField(blank=True, null=True)
    version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    template_file = models.FileField(upload_to='templates/')
    form_schema = models.JSONField(help_text="JSON representation of dynamic form")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} v{self.version}"

class Document(models.Model):
    STATUS_CHOICES = [
        ('SUBMITTED', 'Submitted by Client'),
        ('COMPLETED', 'Completed & Finalized'),
    ]
    
    document_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE, related_name='documents')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    data_json = models.JSONField(help_text="JSON representation of user input data")
    generated_file = models.FileField(upload_to='generated_docs/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    is_public_entry = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document {self.id} ({self.document_type.name}) - {self.status}"
