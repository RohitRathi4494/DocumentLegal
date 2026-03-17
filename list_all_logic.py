import zipfile
import re

def list_all_logic():
    template_path = "d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template.docx"
    
    with zipfile.ZipFile(template_path, 'r') as docx:
        xml = docx.read('word/document.xml').decode('utf-8')
        
    print("All tags:")
    # Remove XML tags to see just the text
    text_only = re.sub(r'<[^>]+>', '', xml)
    
    tags = re.findall(r'\{%.*?%\}', text_only)
    for t in tags:
        print(t)

if __name__ == "__main__":
    list_all_logic()
