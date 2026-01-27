from aiogram import Router
from . import common, auth, engineer, procurement, director

# Initialize the main router
router = Router()

# Include all sub-routers
router.include_router(common.router)
router.include_router(auth.router)
router.include_router(engineer.router)
router.include_router(procurement.router)
router.include_router(director.router)
