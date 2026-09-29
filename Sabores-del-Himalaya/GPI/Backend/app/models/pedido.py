from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    estado = Column(String, default="pendiente")
    direccion = Column(String)
    hora_entrega = Column(String)
    tarjeta = Column(String)  # ← AÑADIR ESTA LÍNEA
    total = Column(Float)
    fecha = Column(DateTime, default=datetime.utcnow)

    items = relationship("PedidoItem", back_populates="pedido", cascade="all, delete")


class PedidoItem(Base):
    __tablename__ = "pedido_items"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    plato_id = Column(Integer)
    cantidad = Column(Integer)

    pedido = relationship("Pedido", back_populates="items")

