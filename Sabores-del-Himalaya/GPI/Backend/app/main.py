from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import api_router
import os

app = FastAPI(
    title="Sabor del Himalaya - API",
    description="Sistema de Petición de Comida a Domicilio",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear carpeta uploads si no existe
os.makedirs("uploads", exist_ok=True)

# Servir archivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Aquí incluimos TODOS los routers (categorías, platos, menú diario, pedidos)
app.include_router(api_router)

@app.get("/")
def root():
    return {"mensaje": "API Sabor del Himalaya funcionando"}
