import os
import logging
from celery import shared_task
from django.conf import settings
from .models import Document, DocumentType, Tenant
from .services import DocumentEngine, PDFService

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def generate_document_task(self, document_id, template_id, data_json):
    """
    Background task to generate DOCX and PDF documents.
    """
    try:
        document = Document.objects.get(id=document_id)
        doc_type = DocumentType.objects.get(id=template_id)
        tenant = document.tenant
        
        template_path = doc_type.template_file.path
        
        # 1. Generate DOCX
        logger.info(f"Generating DOCX for document {document_id}")
        docx_rel_path = DocumentEngine.render_document(template_path, data_json, is_preview=False)
        document.generated_file = docx_rel_path
        document.save()
        
        # 2. Convert to PDF
        logger.info(f"Converting document {document_id} to PDF")
        docx_abs_path = os.path.join(settings.MEDIA_ROOT, docx_rel_path)
        outdir = os.path.join(settings.MEDIA_ROOT, 'generated_docs')
        
        try:
            pdf_abs_path = PDFService.convert_docx_to_pdf(docx_abs_path, outdir)
            pdf_rel_path = os.path.relpath(pdf_abs_path, settings.MEDIA_ROOT).replace('\\', '/')
            document.pdf_file = pdf_rel_path
        except Exception as pdf_err:
            logger.error(f"PDF conversion failed for document {document_id}: {str(pdf_err)}")
            # We still have the DOCX, so we don't fail the whole task if PDF fails
            # but we should log it
            
        document.status = 'COMPLETED'
        document.save()
        
        return {
            "status": "success",
            "document_id": document_id,
            "docx": document.generated_file.url if document.generated_file else None,
            "pdf": document.pdf_file.url if document.pdf_file else None
        }
        
    except Exception as e:
        logger.error(f"Task failed for document {document_id}: {str(e)}")
        if document_id:
            try:
                doc = Document.objects.get(id=document_id)
                doc.status = 'FAILED'
                doc.save()
            except:
                pass
        raise e
