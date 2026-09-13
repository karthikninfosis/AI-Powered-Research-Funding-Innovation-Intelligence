from fastapi import APIRouter, HTTPException

from app.schemas.role import RoleCreate, RoleUpdate
from app.services.role_service import RoleService


router = APIRouter(
    prefix="/api/roles",
    tags=["Roles"]
)


@router.get("/get")
async def get_roles():
    return await RoleService.get_roles()


@router.post("/post")
async def create_role(role: RoleCreate):
    try:
        return await RoleService.create_role(role)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{role_id}")
async def update_role(role_id: str, role: RoleUpdate):

    return await RoleService.update_role(role_id, role)


@router.put("/{role_id}/remove-permission")
async def remove_permission(role_id: str, permission: str):

    role = await RoleService.remove_permission(role_id, permission)

    if not role:
        raise HTTPException(404, "Role not found")

    return role


@router.delete("/{role_id}")
async def delete_role(role_id: str):

    success = await RoleService.delete_role(role_id)

    if not success:
        raise HTTPException(404, "Role not found")

    return {
        "message": "Role deleted successfully"
    }
    