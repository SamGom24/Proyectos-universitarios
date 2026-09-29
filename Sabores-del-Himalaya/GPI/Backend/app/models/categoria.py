from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    descripcion: Mapped[str] = mapped_column(String(255), nullable=True)

    # Una categoría tiene muchos platos
    platos: Mapped[list["Plato"]] = relationship(
        "Plato",
        back_populates="categoria",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Categoria id={self.id} nombre={self.nombre}>"
