from docxtpl import DocxTemplate

def list_variables():
    template_path = "d:/MYDOCWRITER/backend/media/templates/Rent_Agreement_Template.docx"
    doc = DocxTemplate(template_path)
    # The get_undeclared_variables method of jinja env can find all variables
    print("Variables in template:")
    variables = doc.get_undeclared_template_variables()
    for v in variables:
        print("-", v)

if __name__ == '__main__':
    list_variables()
