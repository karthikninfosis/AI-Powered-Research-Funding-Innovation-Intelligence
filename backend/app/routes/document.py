from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional

from app.services.document_service import DocumentService


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


# ============================================================
# UPLOAD DOCUMENT
# ============================================================

@router.post("")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    document_type: str = Form("other")
):
    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )

        document = await DocumentService.upload_document(
            file_bytes=file_bytes,
            file_name=file.filename,
            content_type=file.content_type,
            user_id=user_id,
            document_type=document_type
        )

        return document

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(e)}"
        )


# ============================================================
# GET ALL DOCUMENTS / FILTER BY USER / DOCUMENT TYPE
# ============================================================

@router.get("")
async def get_documents(
    user_id: Optional[str] = None,
    document_type: Optional[str] = None
):
    try:

        documents = await DocumentService.get_documents(
            user_id=user_id,
            document_type=document_type
        )

        return documents

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get documents: {str(e)}"
        )


# ============================================================
# GET SINGLE DOCUMENT
# ============================================================

@router.get("/{document_id}")
async def get_document(document_id: str):

    try:

        document = await DocumentService.get_document(
            document_id
        )

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )

        return document

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get document: {str(e)}"
        )


# ============================================================
# UPDATE DOCUMENT
# ============================================================

@router.put("/{document_id}")
async def update_document(
    document_id: str,
    file: UploadFile = File(...)
):

    try:

        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )

        document = await DocumentService.update_document(
            document_id=document_id,
            file_bytes=file_bytes,
            file_name=file.filename,
            content_type=file.content_type
        )

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )

        return document

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document update failed: {str(e)}"
        )


# ============================================================
# DELETE DOCUMENT
# ============================================================

@router.delete("/{document_id}")
async def delete_document(document_id: str):

    try:

        success = await DocumentService.delete_document(
            document_id
        )

        if not success:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )

        return {
            "message": "Document deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document deletion failed: {str(e)}"
        )