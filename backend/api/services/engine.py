import os
import uuid
from docxtpl import DocxTemplate
from django.conf import settings
from ..utils import enhance_data_payload # Adjusted for package structure

class DocumentEngine:
    """
    Core service to render Word documents from templates and JSON data.
    """
    
    @staticmethod
    def render_document(template_path, data_json, is_preview=False):
        """
        Renders a document based on template and data.
        Returns the absolute path to the generated file.
        """
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Template not found at {template_path}")
            
        doc = DocxTemplate(template_path)
        
        # Pre-process data (add calculated fields, loops etc)
        context = enhance_data_payload(data_json)
        
        # Render the template
        doc.render(context)
        
        # Determine output directory (preview or final)
        output_dir = os.path.join(settings.MEDIA_ROOT, 'previews' if is_preview else 'generated_docs')
        os.makedirs(output_dir, exist_ok=True)
        
        import re
        
        # Generate unique filename
        if is_preview:
            filename = f"preview_{uuid.uuid4().hex}.docx"
        else:
            lessor_name = str(data_json.get('lessor_name', 'Owner')).strip()
            
            # The user requested 'property name', Property details are in 'property_address' or 'property_description'
            # Typically taking the first line of the address or description is a good 'name'
            property_name = str(data_json.get('property_address', 'Property')).strip().split('\n')[0]
            
            # Sanitize removing spaces and special characters
            lessor_safe = re.sub(r'[^A-Za-z0-9]+', '_', lessor_name)[:30].strip('_')
            property_safe = re.sub(r'[^A-Za-z0-9]+', '_', property_name)[:30].strip('_')
            
            if not lessor_safe: lessor_safe = 'Owner'
            if not property_safe: property_safe = 'Property'
            
            # Adding a short hash to prevent filename collisions for the same owner/property
            short_hash = uuid.uuid4().hex[:6]
            filename = f"{lessor_safe}_{property_safe}_{short_hash}.docx"
            
        output_path = os.path.join(output_dir, filename)
        
        doc.save(output_path)
        
        # Return the relative path to be saved in DB or sent to frontend
        return f"{'previews' if is_preview else 'generated_docs'}/{filename}"

    @staticmethod
    def render_to_html(template_path, data_json):
        """
        Renders the document and returns the HTML string for preview.
        """
        import mammoth
        from io import BytesIO

        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Template not found at {template_path}")
            
        doc = DocxTemplate(template_path)
        context = enhance_data_payload(data_json)
        doc.render(context)
        
        # Save to a byte stream
        target_stream = BytesIO()
        doc.save(target_stream)
        target_stream.seek(0)
        
        # Convert to HTML
        result = mammoth.convert_to_html(target_stream)
        html = result.value # The generated HTML
        messages = result.messages # Any messages, such as warnings of unsupported elements
        
        return html
