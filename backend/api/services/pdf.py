import os
import subprocess
import logging

logger = logging.getLogger(__name__)

class PDFService:
    @staticmethod
    def convert_docx_to_pdf(docx_path, outdir):
        """
        Converts a DOCX file to PDF using LibreOffice in headless mode.
        """
        if not os.path.exists(docx_path):
            raise FileNotFoundError(f"Source file not found at {docx_path}")
            
        os.makedirs(outdir, exist_ok=True)
        
        # Command for LibreOffice conversion
        # On Windows, path to soffice.exe might be needed if not in PATH
        # On Linux/Docker, 'libreoffice' or 'soffice' is usually available
        cmd = [
            'libreoffice', 
            '--headless', 
            '--convert-to', 'pdf', 
            '--outdir', outdir, 
            docx_path
        ]
        
        try:
            # We use a timeout to prevent hanging
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode != 0:
                logger.error(f"LibreOffice error: {result.stderr}")
                # Fallback check: sometimes it fails but produces the file
                
            # Construct the expected PDF path
            filename = os.path.basename(docx_path)
            pdf_filename = os.path.splitext(filename)[0] + ".pdf"
            pdf_path = os.path.join(outdir, pdf_filename)
            
            if os.path.exists(pdf_path):
                return pdf_path
            else:
                raise Exception(f"PDF conversion failed: Output file not found. {result.stderr}")
                
        except subprocess.TimeoutExpired:
            logger.error("LibreOffice conversion timed out.")
            raise Exception("PDF conversion timed out.")
        except Exception as e:
            logger.error(f"PDF conversion exception: {str(e)}")
            raise e
