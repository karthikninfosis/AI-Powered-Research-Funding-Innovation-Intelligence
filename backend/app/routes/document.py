from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Form
)

from typing import Optional

from app.services.document_service import (
    DocumentService
)


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


# =========================================================
# Upload PDF
# =========================================================
@router.post("")
async def upload_document(

    file: UploadFile = File(...),

    entity_type: str = Form(...),

    entity_id: Optional[str] = Form(None),

    user_id: Optional[str] = Form(None),

    profile_id: Optional[str] = Form(None)

):

    try:

        # Read PDF
        file_bytes = await file.read()

        if not file_bytes:

            raise HTTPException(

                status_code=400,

                detail="Uploaded file is empty"
            )

        # Process PDF
        document = (
            await DocumentService.upload_document(

                file_bytes=file_bytes,

                file_name=file.filename,

                content_type=file.content_type,

                entity_type=entity_type,

                entity_id=entity_id,

                user_id=user_id,

                profile_id=profile_id
            )
        )

        return document

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=(
                f"Document processing failed: {str(e)}"
            )
        )


# =========================================================
# Get all documents
# =========================================================
@router.get("")
async def get_documents(

    entity_type: Optional[str] = None,

    entity_id: Optional[str] = None

):

    try:

        return await DocumentService.get_documents(

            entity_type=entity_type,

            entity_id=entity_id
        )

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"Failed to get documents: {str(e)}"
        )


# =========================================================
# Get document by ID
# =========================================================
@router.get("/{document_id}")
async def get_document(

    document_id: str

):

    document = (
        await DocumentService.get_document(
            document_id
        )
    )

    if not document:

        raise HTTPException(

            status_code=404,

            detail="Document not found"
        )

    return document


# =========================================================
# Update document
# =========================================================
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

        document = (
            await DocumentService.update_document(

                document_id=document_id,

                file_bytes=file_bytes,

                file_name=file.filename,

                content_type=file.content_type
            )
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


# =========================================================
# Delete document
# =========================================================
@router.delete("/{document_id}")
async def delete_document(

    document_id: str

):

    success = (
        await DocumentService.delete_document(
            document_id
        )
    )

    if not success:

        raise HTTPException(

            status_code=404,

            detail="Document not found"
        )

    return {

        "message":
            "Document deleted successfully"
    }

