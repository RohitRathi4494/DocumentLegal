from docxtpl import DocxTemplate

def debug_template():
    try:
        doc = DocxTemplate("d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template.docx")
        
        # Build dummy context with integers where likely expected
        context = {
            "agreement_city": "City",
            "agreement_date": "Date",
            "lessor_name": "Lessor",
            "husband_name": "-",
            "lessor_father_name": "Father",
            "lessor_address": "Address",
            "tenant1_name": "T1",
            "tenant1_father_name": "F1",
            "tenant1_aadhar": "123",
            "tenant1_address": "A1",
            "tenant2_name": "T2",
            "tenant2_father": "F2",
            "tenant2_aadhar": "456",
            "tenant2_address": "A2",
            "property_address": "P Addr",
            "property_description": "P Desc",
            "furniture_items": "Furn",
            "maintenance_charges": 1000,
            "electricity_rate": 10,
            "monthly_rent": 15000,
            "rent_in_words": "Fifteen Thousand",
            "security_deposit": 30000,
            "lease_start_date": "L Start",
            "lease_duration": 11,
            "lease_end_date": "L End",
            "lockin_period": 6,
            "witness1": "W1",
            "witness2": "W2"
        }
        
        # Test render
        doc.render(context)
        print("Success! The context works.")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_template()
