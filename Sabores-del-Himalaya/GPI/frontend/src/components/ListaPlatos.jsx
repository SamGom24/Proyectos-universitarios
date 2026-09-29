import { API_URL } from "../services/api.js";
import "./ListaPlatos.css";

function ListaPlatos({ platos, categorias, onModificar, modo }) {
  function obtenerNombreCategoria(id) {
    const cat = categorias.find((c) => c.id === id);
    return cat ? cat.nombre : "Sin categoría";
  }

  return (
    <div className="lista-platos">
      {platos.length === 0 && <p>No hay platos registrados.</p>}

      {platos.map((plato, index) => (
        <div key={plato.id || index} className="plato-card">
          <div className="plato-info-horizontal">
            {plato.imagen_url && (
              <img
                src={`${API_URL}${plato.imagen_url}`}
                alt={plato.nombre}
                className="plato-imagen"
              />
            )}

            <div className="plato-texto">
              <h3>{plato.nombre}</h3>

              <p>{plato.descripcion}</p>

              <p>
                <strong>Categoría:</strong>{" "}
                {obtenerNombreCategoria(plato.categoria_id)}
              </p>

              <p>
                <strong>Precio:</strong> {plato.precio} €
              </p>

              {modo === "borrar" ? (
                <button
                  className="borrar-btn"
                  onClick={() => onModificar(index)}
                >
                  Eliminar
                </button>
              ) : (
                <button
                  className="modificar-btn"
                  onClick={() => onModificar(index)}
                >
                  Modificar
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListaPlatos;