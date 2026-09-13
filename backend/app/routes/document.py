from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional

from app.services.document_service import DocumentService

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


@router.post("")
async def upload_document(
    file: UploadFile = File(...),
    entity_type: str = Form(...),
    entity_id: Optional[str] = Form(None)
):
    file_bytes = await file.read()

    document = await DocumentService.upload_document(
        file_bytes,
        file.filename,
        file.content_type,
        entity_type,
        entity_id
    )

    return document


@router.get("")
async def get_documents(entity_type: Optional[str] = None, entity_id: Optional[str] = None):
    return await DocumentService.get_documents(entity_type, entity_id)


@router.get("/{document_id}")
async def get_document(document_id: str):

    document = await DocumentService.get_document(document_id)

    if not document:
        raise HTTPException(404, "Document not found")

    return document


@router.put("/{document_id}")
async def update_document(document_id: str, file: UploadFile = File(...)):

    file_bytes = await file.read()

    document = await DocumentService.update_document(
        document_id,
        file_bytes,
        file.filename,
        file.content_type
    )

    if not document:
        raise HTTPException(404, "Document not found")

    return document


@router.delete("/{document_id}")
async def delete_document(document_id: str):

    success = await DocumentService.delete_document(document_id)

    if not success:
        raise HTTPException(404, "Document not found")

    return {"message": "Document deleted successfully"}