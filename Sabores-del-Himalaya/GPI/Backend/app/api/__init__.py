from fastapi import APIRouter

from .categorias import router as categorias_router
from .platos import router as platos_router
from .menu_diario import router as menu_diario_router
from .pedidos import router as pedidos_router

api_router = APIRouter()

api_router.include_router(categorias_router)
api_router.include_router(platos_router)
api_router.include_router(menu_diario_router)
api_router.include_router(pedidos_router)
