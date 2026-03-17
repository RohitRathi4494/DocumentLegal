import zipfile
import re

def check_husband_name():
    template_path = "d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template.docx"
    
    with zipfile.ZipFile(template_path, 'r') as docx:
        xml_content = docx.read('word/document.xml').decode('utf-8')
        
    print("Searching for 'husband_name' in the XML...")
    matches = re.finditer(r'.{0,50}husband_name.{0,50}', xml_content)
    
    found = False
    for match in matches:
        found = True
        print(f"Found context: {match.group(0)}")
        
    if not found:
        print("Could not find 'husband_name' in the XML.")

if __name__ == '__main__':
    check_husband_name()
