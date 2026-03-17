import zipfile
import re
import os

def fix_and_insert_conditionals():
    template_path = "d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template_NxFjjV0.docx"
    
    with zipfile.ZipFile(template_path, 'r') as docx:
        xml_content = docx.read('word/document.xml').decode('utf-8')
        
    print("Fixing the tenant2_father jinja math division operator...")
    
    # Clean the `tenant2_father/husband_name` to just `tenant2_father`
    # Pattern to match anything between `{{` and `}}` having `tenant2` and `husband`
    pattern1 = r'\{\{\s*tenant2_father.*?_name.*?\}\}'
    xml_content = re.sub(pattern1, '{{ tenant2_father }}', xml_content)
    
    # We also need to do the conditional wraps
    # Replace "and wife of" with "{% if tenant2_name %} and {{ tenant2_relation }}"
    xml_content = re.sub(
        r'<w:t>and</w:t>.*?<w:t[^>]*>\s*wife of\s*</w:t>',
        r'<w:t xml:space="preserve">{% p if tenant2_name %} and {{ tenant2_relation }} </w:t>',
        xml_content,
        flags=re.DOTALL
    )
    
    # Add endif after tenant2_aadhar
    xml_content = re.sub(
        r'(\{\{\s*tenant2_aadhar\s*\}\}.*?Aadhar No\.\s*\).*?)(\(hereinafter)',
        r'\1{% p endif %}\2',
        xml_content,
        flags=re.DOTALL
    )
    
    # Replace S/o for Tenant 1
    xml_content = re.sub(
        r'<w:t>S/o</w:t>',
        r'<w:t>{{ tenant1_relation }}</w:t>',
        xml_content,
        count=1
    )
    
    # Replace S/o for Lessor
    xml_content = re.sub(
        r'<w:t>S/o</w:t>',
        r'<w:t>{{ lessor_relation }}</w:t>',
        xml_content,
        count=1
    )
    
    temp_docx = template_path + ".temp3"
    with zipfile.ZipFile(template_path, 'r') as zin:
        with zipfile.ZipFile(temp_docx, 'w') as zout:
            for item in zin.infolist():
                if item.filename == 'word/document.xml':
                    zout.writestr(item, xml_content.encode('utf-8'))
                else:
                    zout.writestr(item, zin.read(item.filename))
                    
    os.replace(temp_docx, template_path)
    print("Template conditionals inserted and logic sanitized.")

if __name__ == '__main__':
    fix_and_insert_conditionals()
