import os
import django
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legal_engine.settings')
django.setup()

from api.models import DocumentType

def seed_global_templates():
    print("Seeding global templates...")
    templates = [
        {
            "name": "Rent Agreement (Premium)",
            "slug": "rent-agreement",
            "description": "Comprehensive rental agreement for residential properties. Includes maintenance, security deposit, and termination clauses.",
            "form_schema": {
                "sections": [
                    {
                        "title": "Parties Details",
                        "fields": [
                            {"name": "lessor_name", "label": "Lessor (Owner) Name", "type": "text", "required": True},
                            {"name": "lessee_name", "label": "Lessee (Tenant) Name", "type": "text", "required": True}
                        ]
                    },
                    {
                        "title": "Property & Terms",
                        "fields": [
                            {"name": "property_address", "label": "Property Address", "type": "textarea", "required": True},
                            {"name": "monthly_rent", "label": "Monthly Rent (₹)", "type": "number", "required": True},
                            {"name": "security_deposit", "label": "Security Deposit (₹)", "type": "number", "required": True}
                        ]
                    }
                ]
            }
        },
        {
            "name": "General Affidavit",
            "slug": "general-affidavit",
            "description": "Standard legal affidavit for declarations, name changes, or address verification.",
            "form_schema": {
                "sections": [
                    {
                        "title": "Deponent Details",
                        "fields": [
                            {"name": "deponent_name", "label": "Full Name", "type": "text", "required": True},
                            {"name": "deponent_address", "label": "Residential Address", "type": "textarea", "required": True}
                        ]
                    },
                    {
                        "title": "Declaration",
                        "fields": [
                            {"name": "declaration_text", "label": "Statement of Facts", "type": "textarea", "required": True}
                        ]
                    }
                ]
            }
        }
    ]

    for t_data in templates:
        # Check if already exists
        if not DocumentType.objects.filter(slug=t_data["slug"], is_global=True).exists():
            # For this seed, we assume the actual .docx file is already in media/templates/ or we'll create a dummy empty one
            # Ideally, we should have a 'base_templates' directory in the project
            base_dir = "d:/MYDOCWRITER/backend/media/templates"
            os.makedirs(base_dir, exist_ok=True)
            
            # Using an existing template or creating a placeholder
            # For Milestone 3, we'll try to find any .docx in the templates dir
            existing_files = [f for f in os.listdir(base_dir) if f.endswith('.docx')]
            if existing_files:
                template_file_path = os.path.join(base_dir, existing_files[0])
            else:
                # Create a very basic dummy docx if none exists
                from docx import Document
                dummy_path = os.path.join(base_dir, f"{t_data['slug']}_base.docx")
                Document().save(dummy_path)
                template_file_path = dummy_path

            with open(template_path := template_file_path, 'rb') as f:
                dt = DocumentType.objects.create(
                    name=t_data["name"],
                    slug=t_data["slug"],
                    description=t_data["description"],
                    is_global=True,
                    is_active=True,
                    form_schema=t_data["form_schema"],
                )
                dt.template_file.save(os.path.basename(template_path), File(f))
                print(f"Created global template: {t_data['name']}")
        else:
            print(f"Global template {t_data['name']} already exists.")

if __name__ == "__main__":
    seed_global_templates()
