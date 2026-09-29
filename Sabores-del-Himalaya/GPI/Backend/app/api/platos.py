from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.plato import Plato
from app.models.categoria import Categoria
import os
import shutil
import uuid

router = APIRouter(prefix="/platos", tags=["Platos"])

# Carpeta donde se guardarán las imágenes
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --- Schemas ---
class PlatoCreate(BaseModel):
    nombre: str
    descripcion: str | None = None
    precio: float
    disponible: bool = True
    en_carta: bool = True
    categoria_id: int
    imagen_url: str | None = None


class PlatoUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    precio: float | None = None
    disponible: bool | None = None
    en_carta: bool | None = None
    categoria_id: int | None = None
    imagen_url: str | None = None


class PlatoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str | None
    precio: float
    disponible: bool
    en_carta: bool
    categoria_id: int
    imagen_url: str | None = None

    model_config = {"from_attributes": True}


# --- Endpoint para subir imagen ---
@router.post("/upload-image")
def subir_imagen(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

    extension = os.path.splitext(file.filename)[1]
    nombre_unico = f"{uuid.uuid4()}{extension}"
    ruta_archivo = os.path.join(UPLOAD_DIR, nombre_unico)

    with open(ruta_archivo, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"imagen_url": f"/uploads/{nombre_unico}"}


# --- Endpoints ---
@router.get("/", response_model=list[PlatoResponse])
def listar_platos(db: Session = Depends(get_db)):
    return db.query(Plato).all()


@router.get("/{plato_id}", response_model=PlatoResponse)
def obtener_plato(plato_id: int, db: Session = Depends(get_db)):
    plato = db.query(Plato).filter(Plato.id == plato_id).first()
    if not plato:
        raise HTTPException(status_code=404, detail="Plato no encontrado")
    return plato


@router.post("/", response_model=PlatoResponse, status_code=201)
def crear_plato(datos: PlatoCreate, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == datos.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    nuevo = Plato(
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        precio=datos.precio,
        disponible=datos.disponible,
        en_carta=datos.en_carta,
        categoria_id=datos.categoria_id,
        imagen_url=datos.imagen_url
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{plato_id}", response_model=PlatoResponse)
def modificar_plato(plato_id: int, datos: PlatoUpdate, db: Session = Depends(get_db)):
    plato = db.query(Plato).filter(Plato.id == plato_id).first()
    if not plato:
        raise HTTPException(status_code=404, detail="Plato no encontrado")

    if datos.categoria_id:
        categoria = db.query(Categoria).filter(Categoria.id == datos.categoria_id).first()
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(plato, campo, valor)

    db.commit()
    db.refresh(plato)
    return plato


@router.delete("/{plato_id}", status_code=204)
def eliminar_plato(plato_id: int, db: Session = Depends(get_db)):
    plato = db.query(Plato).filter(Plato.id == plato_id).first()
    if not plato:
        raise HTTPException(status_code=404, detail="Plato no encontrado")

    db.delete(plato)
    db.commit()