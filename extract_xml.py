import zipfile

def extract_xml():
    with zipfile.ZipFile("d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template.docx", 'r') as docx:
        xml_content = docx.read('word/document.xml').decode('utf-8')
        
    import re
    # Find all jinja-like tags
    tags = re.findall(r'\{[^{}]*\}', xml_content)
    
    # Let's just print the raw context around a division slash inside tags
    for i, window in enumerate(xml_content.split('{{')):
        if i == 0: continue
        tag_content = window.split('}}')[0]
        print(f"Tag {i}: {{{{ {tag_content} }}}}")

if __name__ == '__main__':
    extract_xml()
