import os
import json
from django.core.management.base import BaseCommand
from django.core.files import File
from django.contrib.auth.models import User
from api.models import DocumentType, Tenant
from django.conf import settings

class Command(BaseCommand):
    help = 'Seeds initial global legal templates for MYDOCWRITER Milestone 9'

    def handle(self, *args, **options):
        self.stdout.write('Seeding high-fidelity global templates...')
        
        # 1. Ensure a System Tenant exists for Global Templates
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('No superuser found. Please create one first.'))
            return

        system_tenant, created = Tenant.objects.get_or_create(
            name="MYDOCWRITER GLOBAL",
            defaults={'owner': admin_user}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created System Tenant: {system_tenant.name}'))

        # 2. Template Definitions
        templates = [
            {
                'name': 'Residential Rent Agreement (2024)',
                'slug': 'rent-agreement-elite-v1',
                'description': 'High-fidelity residential rental agreement with automated clauses for Indian jurisdiction. Compliant with 2024 legal standards.',
                'version': 1,
                'file_name': 'Rent_Agreement_Template.docx',
                'form_schema': [
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
            }
        ]

        # 3. Create / Update Global Templates
        for t_data in templates:
            source_path = os.path.join(settings.MEDIA_ROOT, 'templates', t_data['file_name'])
            
            if not os.path.exists(source_path):
                self.stdout.write(self.style.WARNING(f"File missing at {source_path}. Skipping {t_data['name']}."))
                continue

            doc_type, created = DocumentType.objects.update_or_create(
                slug=t_data['slug'],
                defaults={
                    'tenant': system_tenant,
                    'name': t_data['name'],
                    'description': t_data['description'],
                    'version': t_data['version'],
                    'form_schema': t_data['form_schema'],
                    'is_global': True,
                    'is_active': True
                }
            )

            # Assign the file if newly created or file needs update
            if created or not doc_type.template_file:
                with open(source_path, 'rb') as f:
                    doc_type.template_file.save(t_data['file_name'], File(f), save=True)

            status = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{status} Global Template: {doc_type.name}'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded Milestone 9 Global Templates! 🚀'))
