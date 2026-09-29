from sqlalchemy import Integer, Float, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import date

from app.models.plato import Plato

class MenuDiario(Base):
    __tablename__ = "menus_diarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fecha: Mapped[date] = mapped_column(Date, nullable=False, unique=True)
    precio: Mapped[float] = mapped_column(Float, nullable=False, default=15.0)

    # Entrantes (3 opciones)
    entrante_1_id: Mapped[int] = mapped_column(Integer, ForeignKey("platos.id"), nullable=True)
    entrante_2_id: Mapped[int] = mapped_column(Integer, ForeignKey("platos.id"), nullable=True)
    entrante_3_id: Mapped[int] = mapped_column(Integer, ForeignKey("platos.id"), nullable=True)

    # Platos principales (3 opciones)
    principal_1_id: Mapped[int] = mapped_column(Integer, ForeignKey("platos.id"), nullable=True)
    principal_2_id: Mapped[int] = mapped_column(Integer, ForeignKey("platos.id"), nullable=True)
    principal_3_id: Mapped[int] = mapped_column(Integer, ForeignKey("platos.id"), nullable=True)

    # Postres (2 opciones)
    postre_1_id: Mapped[int] = mapped_column(Integer, ForeignKey("platos.id"), nullable=True)
    postre_2_id: Mapped[int] = mapped_column(Integer, ForeignKey("platos.id"), nullable=True)

    # Bebidas (2 opciones)
    bebida_1_id: Mapped[int] = mapped_column(Integer, ForeignKey("platos.id"), nullable=True)
    bebida_2_id: Mapped[int] = mapped_column(Integer, ForeignKey("platos.id"), nullable=True)

    # Relaciones hacia Plato
    entrante_1: Mapped["Plato"] = relationship("Plato", foreign_keys=[entrante_1_id])
    entrante_2: Mapped["Plato"] = relationship("Plato", foreign_keys=[entrante_2_id])
    entrante_3: Mapped["Plato"] = relationship("Plato", foreign_keys=[entrante_3_id])

    principal_1: Mapped["Plato"] = relationship("Plato", foreign_keys=[principal_1_id])
    principal_2: Mapped["Plato"] = relationship("Plato", foreign_keys=[principal_2_id])
    principal_3: Mapped["Plato"] = relationship("Plato", foreign_keys=[principal_3_id])

    postre_1: Mapped["Plato"] = relationship("Plato", foreign_keys=[postre_1_id])
    postre_2: Mapped["Plato"] = relationship("Plato", foreign_keys=[postre_2_id])

    bebida_1: Mapped["Plato"] = relationship("Plato", foreign_keys=[bebida_1_id])
    bebida_2: Mapped["Plato"] = relationship("Plato", foreign_keys=[bebida_2_id])

    def __repr__(self):
        return f"<MenuDiario id={self.id} fecha={self.fecha} precio={self.precio}>"