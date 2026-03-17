import zipfile
import re
import os

def insert_conditional_blocks():
    template_path = "d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template.docx"
    
    with zipfile.ZipFile(template_path, 'r') as docx:
        xml_content = docx.read('word/document.xml').decode('utf-8')
        
    print("Finding the text block that contains tenant 2 information...")
    
    # We need to surround the text starting before "and" and ending after tenant2_aadhar with jinja if tags
    # Let's find the exact phrasing in the XML to replace it. 
    # The text we saw in the screenshot is "and wife of R/o (Aadhar No. )"
    # But in the XML it's spread across many tags.
    # An easier way than regex is just replacing the closest tags.
    # We will insert {% if tenant2_name %} right before the "and"
    # We will insert {% endif %} right after the closing parenthesis of Aadhar.
    
    # Let's just find the text block `and` `wife of` and replace it with `{% if tenant2_name %} and {{ tenant2_relation }}`
    xml_content = xml_content.replace(
        '<w:t>and</w:t></w:r><w:r w:rsidR="00516453"><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t xml:space="preserve"> wife of </w:t>',
        '<w:t xml:space="preserve">{% if tenant2_name %} and {{ tenant2_relation }} </w:t>'
    )
    # The above replace might fail if the XML is slightly different. Let's do a more robust regex.
    
    # We want to replace "and wife of" with "{% if tenant2_name %} and {{ tenant2_relation }}"
    # And we want to replace ") (hereinafter called the" with ") {% endif %} (hereinafter called the"
    
    # Clean up the XML "and wife of"
    new_xml = re.sub(
        r'<w:t>and</w:t>.*?<w:t[^>]*>\s*wife of\s*</w:t>',
        r'<w:t xml:space="preserve">{% p if tenant2_name %} and {{ tenant2_relation }} </w:t>',
        xml_content,
        flags=re.DOTALL
    )
    
    # Add endif after tenant2_aadhar
    new_xml = re.sub(
        r'(\{\{\s*tenant2_aadhar\s*\}\}.*?Aadhar No\.\s*\).*?)(\(hereinafter)',
        r'\1{% p endif %}\2',
        new_xml,
        flags=re.DOTALL
    )
    
    # We also need to do the same for Tenant 1 relation!
    # "S/o" -> "{{ tenant1_relation }}"
    new_xml = re.sub(
        r'<w:t>S/o</w:t>',
        r'<w:t>{{ tenant1_relation }}</w:t>',
        new_xml,
        count=1
    )
    
    # Also replace lessor relation
    new_xml = re.sub(
        r'<w:t>S/o</w:t>',
        r'<w:t>{{ lessor_relation }}</w:t>',
        new_xml,
        count=1
    )
    
    temp_docx = template_path + ".temp3"
    with zipfile.ZipFile(template_path, 'r') as zin:
        with zipfile.ZipFile(temp_docx, 'w') as zout:
            for item in zin.infolist():
                if item.filename == 'word/document.xml':
                    zout.writestr(item, new_xml.encode('utf-8'))
                else:
                    zout.writestr(item, zin.read(item.filename))
                    
    os.replace(temp_docx, template_path)
    print("Template conditionals inserted.")

if __name__ == '__main__':
    insert_conditional_blocks()
