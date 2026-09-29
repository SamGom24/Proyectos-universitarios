from __future__ import annotations
from sqlalchemy import Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Plato(Base):
    __tablename__ = "platos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    precio: Mapped[float] = mapped_column(Float, nullable=False)
    disponible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    en_carta: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


    imagen_url: Mapped[str] = mapped_column(String(255), nullable=True)
    # Clave foránea → categorias
    categoria_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("categorias.id"),
        nullable=False
    )

    # Relación hacia Categoria
    categoria: Mapped["Categoria"] = relationship(
        "Categoria",
        back_populates="platos"
    )

    def __repr__(self):
        return f"<Plato id={self.id} nombre={self.nombre} precio={self.precio}>"