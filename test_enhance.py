import os
import django
import sys

sys.path.append('d:/MYDOCWRITER/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legal_engine.settings')
django.setup()

from api.utils import enhance_data_payload
import json

dummy_data = {
    'lease_duration': '11',
    'lease_start_date': '2026-03-16',
    'monthly_rent': '30000',
    'security_deposit': '60000',
    'lockin_period': '6'
}

enhanced = enhance_data_payload(dummy_data)
print(json.dumps(enhanced, indent=2))
