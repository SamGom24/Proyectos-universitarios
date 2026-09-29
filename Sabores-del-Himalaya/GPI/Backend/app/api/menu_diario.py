from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date, datetime
from app.db.session import get_db
from app.models.menu_diario import MenuDiario
from app.models.plato import Plato

router = APIRouter(prefix="/menu-diario", tags=["Menú Diario"])


# --- Schemas ---
class MenuDiarioCreate(BaseModel):
    fecha: date
    entrante_1_id: int | None = None
    entrante_2_id: int | None = None
    entrante_3_id: int | None = None
    principal_1_id: int | None = None
    principal_2_id: int | None = None
    principal_3_id: int | None = None
    postre_1_id: int | None = None
    postre_2_id: int | None = None
    bebida_1_id: int | None = None
    bebida_2_id: int | None = None



class MenuDiarioResponse(BaseModel):
    id: int
    fecha: date
    precio: float
    entrante_1_id: int | None
    entrante_2_id: int | None
    entrante_3_id: int | None
    principal_1_id: int | None
    principal_2_id: int | None
    principal_3_id: int | None
    postre_1_id: int | None
    postre_2_id: int | None
    bebida_1_id: int | None
    bebida_2_id: int | None


    model_config = {"from_attributes": True}


# --- Función auxiliar de validación horaria ---
def validar_horario_menu():
    """
    Valida que la petición se hace de lunes a viernes entre las 13:00 y las 16:00.
    Lanza HTTPException 400 si no se cumple la condición.
    """
    ahora = datetime.now()

    # weekday(): 0=lunes, 1=martes, ..., 5=sábado, 6=domingo
    es_fin_de_semana = ahora.weekday() >= 5

    if es_fin_de_semana:
        raise HTTPException(
            status_code=400,
            detail="El menú diario no está disponible los fines de semana. Solo puedes pedir a la carta."
        )

    hora_actual = ahora.hour
    if hora_actual < 13 or hora_actual >= 16:
        raise HTTPException(
            status_code=400,
            detail=f"El menú diario solo está disponible de lunes a viernes entre las 13:00 y las 16:00. Hora actual: {ahora.strftime('%H:%M')}."
        )


# --- Endpoints ---

# Endpoint adicional para listar todos los menús diarios (solo para admin) (No se muestra en el frontend, pero puede ser útil para pruebas o futuras funcionalidades)
@router.get("/admin", response_model=list[MenuDiarioResponse])
def listar_menus_admin(db: Session = Depends(get_db)):
    """
    Devuelve la lista completa de menús diarios creados.
    Sin restricciones de horario.
    """
    menus = db.query(MenuDiario).order_by(MenuDiario.fecha.asc()).all()
    return menus


@router.get("/admin/{fecha}", response_model=MenuDiarioResponse)
def obtener_menu_admin(fecha: date, db: Session = Depends(get_db)):
    """
    Endpoint especial para administradores.
    Permite consultar el menú diario sin restricciones de horario.
    """
    menu = db.query(MenuDiario).filter(MenuDiario.fecha == fecha).first()

    if not menu:
        raise HTTPException(
            status_code=404,
            detail=f"No existe un menú para la fecha {fecha}"
        )

    return menu

@router.get("/{fecha}", response_model=MenuDiarioResponse)
def obtener_menu(fecha: date, db: Session = Depends(get_db)):
    """
    Devuelve el menú diario de una fecha concreta.
    Solo disponible de lunes a viernes entre las 13:00 y las 16:00.
    """
    validar_horario_menu()

    menu = db.query(MenuDiario).filter(MenuDiario.fecha == fecha).first()
    if not menu:
        raise HTTPException(
            status_code=404,
            detail=f"No hay menú configurado para el {fecha}"
        )
    return menu





@router.post("/", response_model=MenuDiarioResponse, status_code=201)
def configurar_menu(datos: MenuDiarioCreate, db: Session = Depends(get_db)):
    """
    Configura el menú diario para una fecha.
    El chef puede configurarlo en cualquier momento del día.
    """
    existe = db.query(MenuDiario).filter(MenuDiario.fecha == datos.fecha).first()
    if existe:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe un menú para el {datos.fecha}"
        )

    ids_platos = [
        datos.entrante_1_id, datos.entrante_2_id, datos.entrante_3_id,
        datos.principal_1_id, datos.principal_2_id, datos.principal_3_id,
        datos.postre_1_id, datos.postre_2_id,
        datos.bebida_1_id, datos.bebida_2_id
    ]

    for plato_id in ids_platos:
        if plato_id is not None:
            plato = db.query(Plato).filter(Plato.id == plato_id).first()
            if not plato:
                raise HTTPException(
                    status_code=404,
                    detail=f"Plato con id {plato_id} no encontrado"
                )

    nuevo_menu = MenuDiario(
        fecha=datos.fecha,
        precio=15.0,
        entrante_1_id=datos.entrante_1_id,
        entrante_2_id=datos.entrante_2_id,
        entrante_3_id=datos.entrante_3_id,
        principal_1_id=datos.principal_1_id,
        principal_2_id=datos.principal_2_id,
        principal_3_id=datos.principal_3_id,
        postre_1_id=datos.postre_1_id,
        postre_2_id=datos.postre_2_id,
        bebida_1_id=datos.bebida_1_id,
        bebida_2_id=datos.bebida_2_id,
    )
    db.add(nuevo_menu)
    db.commit()
    db.refresh(nuevo_menu)
    return nuevo_menu

# Endpoint adicional para eliminar un menú diario por fecha (solo para admin). No se muestra en el frontend, pero puede ser útil para pruebas o futuras funcionalidades.
@router.delete("/admin/{fecha}")
def borrar_menu_admin(fecha: date, db: Session = Depends(get_db)):
    """
    Elimina un menú diario por fecha (solo para administradores).
    """
    menu = db.query(MenuDiario).filter(MenuDiario.fecha == fecha).first()

    if not menu:
        raise HTTPException(
            status_code=404,
            detail=f"No existe un menú para la fecha {fecha}"
        )

    db.delete(menu)
    db.commit()

    return {"detail": f"Menú del {fecha} eliminado correctamente"}



