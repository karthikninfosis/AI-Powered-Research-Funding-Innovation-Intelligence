from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import get_current_user
from app.schemas.patent import PatentCreate, PatentResponse, PatentUpdate
from app.services.patent_service import (
    PatentConflictError,
    PatentForbiddenError,
    PatentUserNotFoundError,
    assert_can_create_for_user,
    assert_patent_owner,
    create_patent,
    delete_patent,
    get_patent,
    get_patents,
    is_valid_patent_id,
    update_patent,
)


router = APIRouter(prefix="/api/patents", tags=["Patents"])


def _require_valid_id(patent_id: str) -> None:
    if not is_valid_patent_id(patent_id):
        raise HTTPException(status_code=400, detail="Invalid patent ID")


@router.post("", response_model=PatentResponse, status_code=status.HTTP_201_CREATED)
def create_new_patent(data: PatentCreate, current_user: dict = Depends(get_current_user)):
    try:
        assert_can_create_for_user(data.user_id, current_user)
        return create_patent(data.model_dump())
    except PatentForbiddenError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except PatentUserNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PatentConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("", response_model=list[PatentResponse])
def get_all_patents(_: dict = Depends(get_current_user)):
    return get_patents()


@router.get("/{patent_id}", response_model=PatentResponse)
def get_patent_by_id(patent_id: str, _: dict = Depends(get_current_user)):
    _require_valid_id(patent_id)
    patent = get_patent(patent_id)
    if patent is None:
        raise HTTPException(status_code=404, detail="Patent not found")
    return patent


@router.put("/{patent_id}", response_model=PatentResponse)
def update_patent_by_id(
    patent_id: str,
    data: PatentUpdate,
    current_user: dict = Depends(get_current_user),
):
    _require_valid_id(patent_id)
    try:
        assert_patent_owner(patent_id, current_user)
        patent = update_patent(patent_id, data.model_dump(exclude_unset=True))
    except PatentForbiddenError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except PatentConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if patent is None:
        raise HTTPException(status_code=404, detail="Patent not found")
    return patent


@router.delete("/{patent_id}")
def delete_patent_by_id(patent_id: str, current_user: dict = Depends(get_current_user)):
    _require_valid_id(patent_id)
    try:
        assert_patent_owner(patent_id, current_user)
    except PatentForbiddenError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    if not delete_patent(patent_id):
        raise HTTPException(status_code=404, detail="Patent not found")
    return {"message": "Patent deleted successfully"}
