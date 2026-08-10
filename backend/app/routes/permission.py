from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import require_admin
from app.schemas.permission import (
    PermissionAssignment,
    PermissionCreate,
    PermissionUpdate,
)
from app.services.permission_service import (
    InvalidPermissionIdError,
    InvalidRoleIdError,
    PermissionCodeExistsError,
    PermissionService,
    RoleNotFoundError,
)

router = APIRouter(
    prefix="/api/permissions",
    tags=["Permissions"]
)


def _permission_id_error(error: InvalidPermissionIdError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=str(error),
    )


def _role_id_error(error: InvalidRoleIdError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=str(error),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_permission(
    body: PermissionCreate,
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    try:
        permission = await PermissionService.create_permission(body)
    except PermissionCodeExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    return {
        "message": "Permission created successfully",
        "data": permission,
    }


@router.get("")
async def get_permissions(
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    permissions = await PermissionService.get_permissions()

    return {
        "message": "Permissions retrieved",
        "data": permissions,
    }


@router.get("/{permission_id}")
async def get_permission_by_id(
    permission_id: str,
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    try:
        permission = await PermissionService.get_permission_by_id(permission_id)
    except InvalidPermissionIdError as error:
        raise _permission_id_error(error) from error

    if permission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found",
        )

    return {
        "message": "Permission retrieved",
        "data": permission,
    }


@router.put("/{permission_id}")
async def update_permission(
    permission_id: str,
    body: PermissionUpdate,
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    try:
        permission = await PermissionService.update_permission(
            permission_id,
            body,
        )
    except InvalidPermissionIdError as error:
        raise _permission_id_error(error) from error
    except PermissionCodeExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    if permission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found",
        )

    return {
        "message": "Permission updated successfully",
        "data": permission,
    }


@router.delete("/{permission_id}")
async def delete_permission(
    permission_id: str,
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    try:
        deleted = await PermissionService.delete_permission(permission_id)
    except InvalidPermissionIdError as error:
        raise _permission_id_error(error) from error

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found",
        )

    return {
        "message": "Permission deleted successfully"
    }


@router.post("/roles/{role_id}")
async def assign_permission(
    role_id: str,
    body: PermissionAssignment,
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    try:
        assigned = await PermissionService.assign_permission_to_role(
            role_id,
            body.permission_id,
        )
    except InvalidRoleIdError as error:
        raise _role_id_error(error) from error
    except InvalidPermissionIdError as error:
        raise _permission_id_error(error) from error
    except RoleNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    if not assigned:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found",
        )

    return {
        "message": "Permission assigned successfully"
    }


@router.delete("/roles/{role_id}/{permission_id}")
async def remove_permission(
    role_id: str,
    permission_id: str,
    _: Annotated[dict[str, Any], Depends(require_admin)],
):
    try:
        removed = await PermissionService.remove_permission_from_role(
            role_id,
            permission_id,
        )
    except InvalidRoleIdError as error:
        raise _role_id_error(error) from error
    except InvalidPermissionIdError as error:
        raise _permission_id_error(error) from error
    except RoleNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found",
        )

    return {
        "message": "Permission removed successfully"
    }