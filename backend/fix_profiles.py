import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legal_engine.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import WriterProfile
import uuid

def fix_profiles():
    users = User.objects.all()
    count = 0
    for u in users:
        p, created = WriterProfile.objects.get_or_create(
            user=u, 
            defaults={'slug': u.username.lower() or uuid.uuid4().hex[:8]}
        )
        if created:
            print(f"Created missing profile for user: {u.username} (slug: {p.slug})")
            count += 1
        else:
            print(f"Profile already exists for user: {u.username}")
    
    print(f"\nFinished. Fixed {count} users.")

if __name__ == "__main__":
    fix_profiles()
