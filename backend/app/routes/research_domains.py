from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import require_admin
from app.schemas.research_domain import ResearchDomainCreate, ResearchDomainUpdate
from app.services.research_domain_service import (
    InvalidResearchDomainIdError,
    ResearchDomainCodeExistsError,
    ResearchDomainService,
)


router = APIRouter(
    prefix="/api/research-domains",
    tags=["Research Domains"],
)


def _research_domain_id_error(
    error: InvalidResearchDomainIdError,
) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail=str(error),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_research_domain(
    body: ResearchDomainCreate,
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    try:
        research_domain = await ResearchDomainService.create_research_domain(body)
    except ResearchDomainCodeExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return {
        "message": "Research domain created successfully",
        "data": research_domain,
    }


@router.get("")
async def get_research_domains(
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    research_domains = await ResearchDomainService.get_research_domains()

    return {
        "message": "Research domains retrieved",
        "data": research_domains,
    }


@router.get("/{research_domain_id}")
async def get_research_domain_by_id(
    research_domain_id: str,
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    try:
        research_domain = await ResearchDomainService.get_research_domain_by_id(
            research_domain_id
        )
    except InvalidResearchDomainIdError as error:
        raise _research_domain_id_error(error) from error

    if research_domain is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research domain not found",
        )

    return {
        "message": "Research domain retrieved",
        "data": research_domain,
    }


@router.put("/{research_domain_id}")
async def update_research_domain(
    research_domain_id: str,
    body: ResearchDomainUpdate,
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    try:
        research_domain = await ResearchDomainService.update_research_domain(
            research_domain_id,
            body,
        )
    except InvalidResearchDomainIdError as error:
        raise _research_domain_id_error(error) from error
    except ResearchDomainCodeExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    if research_domain is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research domain not found",
        )

    return {
        "message": "Research domain updated successfully",
        "data": research_domain,
    }


@router.delete("/{research_domain_id}")
async def delete_research_domain(
    research_domain_id: str,
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    try:
        deleted = await ResearchDomainService.delete_research_domain(
            research_domain_id
        )
    except InvalidResearchDomainIdError as error:
        raise _research_domain_id_error(error) from error

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research domain not found",
        )

    return {"message": "Research domain deleted successfully"}
