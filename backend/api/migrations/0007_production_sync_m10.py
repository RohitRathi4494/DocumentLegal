import os
from django.db import migrations
from django.core.files import File
from django.conf import settings

def promote_rohit_and_seed_templates(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Tenant = apps.get_model('api', 'Tenant')
    DocumentType = apps.get_model('api', 'DocumentType')
    Subscription = apps.get_model('api', 'Subscription')

    # 1. Promote Rohit
    try:
        u = User.objects.get(username='Rohit')
        u.is_staff = True
        u.is_superuser = True
        u.save()
        print("Successfully promoted Rohit to Admin in production!")
    except User.DoesNotExist:
        print("User 'Rohit' not found yet. Seeding empty library first.")

    # 2. Find/Create Global Tenant
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        return

    system_tenant, _ = Tenant.objects.get_or_create(
        name="MYDOCWRITER GLOBAL",
        defaults={'owner': admin_user}
    )

    # 3. Seed Rent Agreement
    form_schema = [
        {"name": "agreement_city", "label": "Agreement City", "type": "text", "required": True},
        {"name": "agreement_date", "label": "Agreement Date", "type": "date", "required": True},
        {"name": "lessor_name", "label": "Landlord Name", "type": "text", "required": True},
        {"name": "lessor_father_name", "label": "Landlord Father's Name", "type": "text", "required": True},
        {"name": "lessor_address", "label": "Landlord Address", "type": "textarea", "required": True},
        {"name": "tenant1_name", "label": "Primary Tenant Name", "type": "text", "required": True},
        {"name": "tenant1_father_name", "label": "Tenant Father's Name", "type": "text", "required": True},
        {"name": "tenant1_address", "label": "Tenant Permanant Address", "type": "textarea", "required": True},
        {"name": "tenant1_aadhar", "label": "Tenant Aadhar Number", "type": "text", "required": True},
        {"name": "property_address", "label": "Leased Property Address", "type": "textarea", "required": True},
        {"name": "property_description", "label": "Description of Property", "type": "text", "required": False},
        {"name": "monthly_rent", "label": "Monthly Rent (INR)", "type": "number", "required": True},
        {"name": "rent_in_words", "label": "Rent in Words", "type": "text", "required": True},
        {"name": "security_deposit", "label": "Security Deposit (INR)", "type": "number", "required": True},
        {"name": "lease_start_date", "label": "Lease Start Date", "type": "date", "required": True},
        {"name": "lease_end_date", "label": "Lease End Date", "type": "date", "required": True},
        {"name": "lease_duration", "label": "Total Duration (Months)", "type": "number", "required": True},
        {"name": "lockin_period", "label": "Lock-in Period (Months)", "type": "number", "required": False},
        {"name": "electricity_rate", "label": "Electricity Rate per Unit", "type": "number", "required": False},
        {"name": "maintenance_charges", "label": "Monthly Maintenance (INR)", "type": "number", "required": False},
        {"name": "furniture_items", "label": "Provided Furniture/Items", "type": "textarea", "required": False},
        {"name": "witness1", "label": "First Witness Name/Details", "type": "text", "required": False},
        {"name": "witness2", "label": "Second Witness Name/Details", "type": "text", "required": False},
    ]

    file_name = 'Rent_Agreement_Template.docx'
    # Use the root-level whitelisted template if available, otherwise look in media
    source_path = os.path.join(settings.BASE_DIR, '..', file_name)
    if not os.path.exists(source_path):
         source_path = os.path.join(settings.BASE_DIR, 'media', 'templates', file_name)

    doc_type, created = DocumentType.objects.update_or_create(
        slug='rent-agreement-elite-v1',
        defaults={
            'tenant': system_tenant,
            'name': 'Residential Rent Agreement (2024)',
            'description': 'High-fidelity residential rental agreement with automated clauses for Indian jurisdiction. (Production Sync)',
            'version': 1,
            'form_schema': form_schema,
            'is_global': True,
            'is_active': True
        }
    )

    # Note: On Render Free, newly saved files in MEDIA_ROOT will disappear on restart.
    # Our DocumentEngine now has a fallback to the whitelisted repository file 'Rent_Agreement_Template.docx'.
    # We still try to save it for local environments where media persists.
    if (created or not doc_type.template_file) and os.path.exists(source_path):
        try:
            with open(source_path, 'rb') as f:
                doc_type.template_file.save(file_name, File(f), save=True)
        except Exception as e:
            print(f"Warning: Could not save template file to media storage: {e}. Falling back to repo template.")

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_document_pdf_file'),
    ]

    operations = [
        migrations.RunPython(promote_rohit_and_seed_templates),
    ]
