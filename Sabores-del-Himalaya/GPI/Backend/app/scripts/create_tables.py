import sys
import os

# Ruta absoluta al directorio Backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(BASE_DIR)

from app.db.base import Base
from app.db.session import engine

# IMPORTAR TODOS LOS MODELOS
from app.models.categoria import Categoria
from app.models.plato import Plato
from app.models.menu_diario import MenuDiario
from app.models.pedido import Pedido, PedidoItem


def recreate_tables():
    print("Eliminando tablas existentes...")
    Base.metadata.drop_all(bind=engine)

    print("Creando tablas nuevas...")
    Base.metadata.create_all(bind=engine)

    print("Tablas creadas correctamente:")
    print(" - categorias")
    print(" - platos")
    print(" - menus_diarios")
    print(" - pedidos")
    print(" - pedido_items")


if __name__ == "__main__":
    recreate_tables()
