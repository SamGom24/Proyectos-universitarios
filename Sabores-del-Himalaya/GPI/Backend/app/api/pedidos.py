from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, Field, validator
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.models.pedido import Pedido, PedidoItem
from app.models.plato import Plato

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


# ============================
# SCHEMAS
# ============================

class PedidoItemSchema(BaseModel):
    plato_id: int
    cantidad: int

    class Config:
        from_attributes = True


class PedidoCreateSchema(BaseModel):
    items: List[PedidoItemSchema]
    direccion: str
    hora_entrega: str
    tarjeta: str

    @validator("tarjeta")
    def validar_tarjeta(cls, v):
        if len(v) != 16 or not v.isdigit():
            raise ValueError("La tarjeta debe tener exactamente 16 dígitos")
        return v


class PedidoResponseSchema(BaseModel):
    id: int
    items: List[PedidoItemSchema]
    total_pagado: float
    tarjeta: str
    direccion: str
    hora_entrega: str
    estado: str
    fecha_hora: str  

    class Config:
        from_attributes = True


# ============================
# ENDPOINTS
# ============================

@router.post("/", response_model=PedidoResponseSchema)
def crear_pedido(data: PedidoCreateSchema, db: Session = Depends(get_db)):
    pedido = Pedido(
        estado="pendiente",
        direccion=data.direccion,
        hora_entrega=data.hora_entrega,
        tarjeta=data.tarjeta,
        fecha=datetime.utcnow()
    )

    db.add(pedido)
    db.commit()
    db.refresh(pedido)

    total = 0

    for item in data.items:
        plato = db.query(Plato).filter(Plato.id == item.plato_id).first()
        if not plato:
            raise HTTPException(status_code=404, detail="Plato no encontrado")

        pedido_item = PedidoItem(
            pedido_id=pedido.id,
            plato_id=item.plato_id,
            cantidad=item.cantidad
        )
        db.add(pedido_item)

        total += plato.precio * item.cantidad

    pedido.total = total
    db.commit()
    db.refresh(pedido)

    return {
        "id": pedido.id,
        "items": data.items,
        "total_pagado": pedido.total,
        "tarjeta": pedido.tarjeta,
        "direccion": pedido.direccion,
        "hora_entrega": pedido.hora_entrega,
        "estado": pedido.estado,
        "fecha_hora": pedido.fecha.strftime("%Y-%m-%d a las %H:%M:%S")
    }


@router.get("/", response_model=List[PedidoResponseSchema])
def listar_pedidos(db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).options(joinedload(Pedido.items)).all()

    respuesta = []
    for p in pedidos:
        items = [
            {"plato_id": item.plato_id, "cantidad": item.cantidad}
            for item in p.items
        ]

        respuesta.append({
            "id": p.id,
            "items": items,
            "total_pagado": p.total,
            "tarjeta": p.tarjeta,
            "direccion": p.direccion,
            "hora_entrega": p.hora_entrega,
            "estado": p.estado,
            "fecha_hora": p.fecha.strftime("%Y-%m-%d a las %H:%M:%S")
        })

    return respuesta


@router.delete("/{pedido_id}")
def eliminar_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    db.delete(pedido)
    db.commit()

    return {"mensaje": "Pedido eliminado correctamente"}
