from fastapi import APIRouter, HTTPException

from app.schemas.publication import (
    PublicationUpdate,
    PublicationResponse
)

from app.services.publication_service import (
    get_publications,
    get_publication,
    update_publication,
    delete_publication
)


router = APIRouter(
    prefix="/api/publications",
    tags=["Publications"]
)


# GET /api/publications
@router.get("", response_model=list[PublicationResponse])
def get_all_publications():
    return get_publications()


# GET /api/publications/{id}
@router.get("/{id}", response_model=PublicationResponse)
def get_publication_by_id(id: str):

    publication = get_publication(id)

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    return publication


# PUT /api/publications/{id}
@router.put("/{id}", response_model=PublicationResponse)
def update_publication_by_id(
    id: str,
    publication: PublicationUpdate
):

    updated_publication = update_publication(
        id,
        publication.model_dump(exclude_unset=True)
    )

    if not updated_publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    return updated_publication


# DELETE /api/publications/{id}
@router.delete("/{id}")
def delete_publication_by_id(id: str):

    deleted = delete_publication(id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    return {
        "message": "Publication deleted successfully"
    }