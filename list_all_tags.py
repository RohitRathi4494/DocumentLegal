import zipfile
import re

def list_all_tags():
    template_path = "d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template_NxFjjV0.docx"
    
    with zipfile.ZipFile(template_path, 'r') as docx:
        xml = docx.read('word/document.xml').decode('utf-8')
        
    print("All tags:")
    text_only = re.sub(r'<[^>]+>', '', xml)
    
    tags = re.findall(r'\{\{.*?\}\}', text_only)
    for t in tags:
        print(t)

if __name__ == "__main__":
    list_all_tags()
