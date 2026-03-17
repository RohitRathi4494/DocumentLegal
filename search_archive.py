import zipfile

def search_full_archive():
    template_path = "d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template.docx"
    
    found = False
    with zipfile.ZipFile(template_path, 'r') as docx:
        for file_info in docx.infolist():
            content = docx.read(file_info.filename)
            try:
                decoded = content.decode('utf-8')
                if 'husband_name' in decoded:
                    print(f"FOUND in {file_info.filename}:")
                    # print some context
                    idx = decoded.find('husband_name')
                    start = max(0, idx - 60)
                    end = min(len(decoded), idx + 60)
                    print("...", decoded[start:end], "...")
                    found = True
            except UnicodeDecodeError:
                pass
                
    if not found:
        print("Not found in any file in the docx.")

if __name__ == "__main__":
    search_full_archive()
