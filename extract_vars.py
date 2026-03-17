from docxtpl import DocxTemplate

try:
    doc = DocxTemplate("d:/MYDOCWRITER/Rent_Agreement_Template.docx")
    variables = doc.get_undeclared_template_variables()
    print("Variables found:", variables)
except Exception as e:
    print(f"Error parsing template: {e}")
