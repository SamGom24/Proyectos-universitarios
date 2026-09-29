from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.categoria import Categoria

router = APIRouter(prefix="/categorias", tags=["Categorías"])


# --- Schemas ---
class CategoriaCreate(BaseModel):
    nombre: str
    descripcion: str | None = None


class CategoriaResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str | None

    model_config = {"from_attributes": True}


# --- Endpoints ---
@router.get("/", response_model=list[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    """Devuelve todas las categorías de la carta."""
    return db.query(Categoria).all()


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def obtener_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Devuelve una categoría por su ID."""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


@router.post("/", response_model=CategoriaResponse, status_code=201)
def crear_categoria(datos: CategoriaCreate, db: Session = Depends(get_db)):
    """Crea una nueva categoría."""
    existe = db.query(Categoria).filter(Categoria.nombre == datos.nombre).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")
    nueva = Categoria(nombre=datos.nombre, descripcion=datos.descripcion)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.delete("/{categoria_id}", status_code=204)
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Elimina una categoría por su ID."""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(categoria)
    db.commit()