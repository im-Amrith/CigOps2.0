from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import List
import io

# Import libraries for document parsing (install these: pip install PyMuPDF python-docx)
try:
    import fitz # PyMuPDF
except ImportError:
    fitz = None
try:
    import docx # python-docx
except ImportError:
    docx = None

# Import the document analysis function from the document analyzer service
from services.document_analyzer_service import analyze_document_with_watsonx

router = APIRouter()

async def parse_document_content(document: UploadFile) -> str:
    """Reads and extracts text content from uploaded document files."""
    content = await document.read()
    file_extension = document.filename.split('.')[-1].lower()
    text_content = ""

    if file_extension == 'pdf':
        if not fitz:
            raise HTTPException(status_code=500, detail="PyMuPDF not installed. Cannot process PDF files.")
        try:
            pdf_document = fitz.open(stream=content, filetype="pdf")
            for page_num in range(pdf_document.page_count):
                page = pdf_document.load_page(page_num)
                text_content += page.get_text()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error parsing PDF: {e}")
        finally:
            if 'pdf_document' in locals() and pdf_document:
                pdf_document.close()

    elif file_extension in ['doc', 'docx']:
        if not docx:
             raise HTTPException(status_code=500, detail="python-docx not installed. Cannot process DOC/DOCX files.")
        try:
            # python-docx requires a file path or a file-like object that is seekable
            # We can use io.BytesIO to create a file-like object from bytes
            doc_obj = docx.Document(io.BytesIO(content))
            for paragraph in doc_obj.paragraphs:
                text_content += paragraph.text + "\n"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error parsing DOC/DOCX: {e}")

    elif file_extension == 'txt':
        try:
            text_content = content.decode('utf-8') # Basic decoding
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"Error decoding TXT: {e}")
             
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_extension}")

    return text_content


@router.post("/api/analyze-document")
async def analyze_document(document: UploadFile = File(...)):
    text_content = await parse_document_content(document)
    
    # Use the function from the new document analyzer service
    analysis_result = await analyze_document_with_watsonx(text_content)

    return JSONResponse(content=analysis_result)

@router.post("/api/chat-document")
async def chat_document(document: UploadFile = File(...), question: str = Form(...), analysis_context: str = Form("")):
    text_content = await parse_document_content(document)

    # Use the chat function from the groq service
    from services import groq_service
    # In a real application, you would pass the actual chat history
    # For simplicity here, we'll pass an empty list or fetch it from session/DB
    chat_history = [] # Replace with actual chat history if available
    # Pass the analysis_context to the chat function
    chat_response = await groq_service.chat_with_document_groq(text_content, question, chat_history, analysis_context=analysis_context)

    # The chat_with_document_groq function returns a string, so wrap it in a dict
    return JSONResponse(content={"response": chat_response}) 