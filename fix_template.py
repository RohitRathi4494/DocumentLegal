import zipfile
import re
import os

def fix_template():
    template_path = "d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template.docx"
    backup_path = "d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template.bak.docx"
    
    # 1. Backup original
    import shutil
    shutil.copy2(template_path, backup_path)
    print("Backed up original template.")
    
    # 2. Read and modify the XML
    with zipfile.ZipFile(template_path, 'r') as docx:
        xml_content = docx.read('word/document.xml').decode('utf-8')
        
    # Python-docx-template fails if there is a '/' inside a jinja tag because it tries to divide. 
    # The tag from extract_xml is: {{ tenant2_father</w:t></w:r><w:r><w:rPr><w:b/><w:bCs/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>/</w:t></w:r><w:proofErr w:type="spellStart"/><w:r><w:rPr><w:b/><w:bCs/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>husband</w:t></w:r><w:r w:rsidRPr="00516453"><w:rPr><w:b/><w:bCs/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>_name</w:t></w:r><w:proofErr w:type="spellEnd"/><w:r w:rsidRPr="00516453"><w:rPr><w:b/><w:bCs/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t> }}
    
    # We will just strictly replace "tenant2_father" slash "husband_name" nonsense with a clean "tenant2_father"
    
    # Regex to find the whole tag that starts with {{ tenant2_father and ends with }}
    pattern = r'\{\{\s*tenant2_father.*?_name.*?\}\}'
    
    def replacer(match):
        print(f"Replacing this ugly tag: {match.group(0)}")
        return '{{ tenant2_father }}'
        
    new_xml = re.sub(pattern, replacer, xml_content)
    
    # 3. Write back to a new zip structure
    temp_docx = template_path + ".temp"
    with zipfile.ZipFile(template_path, 'r') as zin:
        with zipfile.ZipFile(temp_docx, 'w') as zout:
            for item in zin.infolist():
                if item.filename == 'word/document.xml':
                    zout.writestr(item, new_xml.encode('utf-8'))
                else:
                    zout.writestr(item, zin.read(item.filename))
                    
    # Replace original
    os.replace(temp_docx, template_path)
    print("Template successfully sanitized!")

if __name__ == '__main__':
    fix_template()
