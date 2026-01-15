from fastapi import APIRouter
from app.routes import users

router = APIRouter()
router.include_router(users.router, prefix="/api/users", tags=["users"])

__all__ = ["router"]
