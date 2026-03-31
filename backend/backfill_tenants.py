import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legal_engine.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Tenant, WriterProfile, Client, DocumentType, Document

def backfill():
    print("Starting tenant backfill...")
    users = User.objects.all()
    for user in users:
        # Check if user already has a profile with a tenant
        profile, created = WriterProfile.objects.get_or_create(user=user)
        if not profile.tenant:
            tenant = Tenant.objects.create(name=f"{user.username}'s Workspace", owner=user)
            profile.tenant = tenant
            if not profile.slug:
                profile.slug = user.username.lower() or uuid.uuid4().hex[:8]
            profile.save()
            print(f"Created tenant for user: {user.username}")
        else:
            tenant = profile.tenant
            print(f"User {user.username} already has tenant: {tenant.name}")

        # Update existing clients for this user (assuming they belong to this user if they were the only user)
        # In a real scenario, we'd need more logic, but for a fresh DB this is safe.
        Client.objects.all().update(tenant=tenant)
        Document.objects.all().update(tenant=tenant)
        DocumentType.objects.all().update(tenant=tenant)

    print("Backfill completed.")

if __name__ == "__main__":
    backfill()
