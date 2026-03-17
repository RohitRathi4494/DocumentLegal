import zipfile
import re
import os

def insert_conditional_blocks():
    template_path = "d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template.docx"
    
    with zipfile.ZipFile(template_path, 'r') as docx:
        xml_content = docx.read('word/document.xml').decode('utf-8')
        
    print("Finding the text block that contains tenant 2 information...")
    
    # In Word XML, text is mixed with a lot of formatting tags. 
    # Example of what is visible: "and wife of R/o (Aadhar No. )"
    # This corresponds to: tenant2_name S/o tenant2_father R/o tenant2_address (Aadhar No. tenant2_aadhar)
    
    # We want to find the word 'and' that precedes tenant2_name, and wrap everything up to tenant2_aadhar in an {% if tenant2_name %} block.
    # To do this safely strictly inside Word XML without breaking the tree, 
    # we can use a script to replace the tag  {{ tenant2_name }} with {% if tenant2_name %} and {{ tenant2_name }}
    # AND replace {{ tenant2_aadhar }} with {{ tenant2_aadhar }} {% endif %}
    # However, this doesn't remove the hardcoded text "and wife of" and "R/o" and "(Aadhar No. )" if we just wrap the variables.
    
    # Let's inspect the raw XML near tenant2_name to see how to wrap the whole phrase.
    blocks = xml_content.split('{{ tenant2_name }}')
    if len(blocks) > 1:
        # Just print a bit of context around tenant2_name to understand the XML structure
        print("Before tenant2_name:", blocks[0][-200:])
        print("After tenant2_name:", blocks[1][:200])
        
if __name__ == '__main__':
    insert_conditional_blocks()
