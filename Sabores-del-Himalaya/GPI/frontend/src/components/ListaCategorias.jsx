// Lista de categorías con opción de borrar

import "./ListaCategorias.css";

function ListaCategorias({ categorias, onBorrar }) {

  // Si no hay categorías reales (solo "Todos")
  const categoriasReales = categorias.slice(1);

  return (
    <div className="lista-categorias">

      {categoriasReales.length === 0 && (
        <p>No hay categorías creadas.</p>
      )}

      {categoriasReales.map((cat, index) => (
        <div key={cat.id || index} className="categoria-card">

          {/* Nombre */}
          <h3>{cat.nombre}</h3>

          {/* Descripción */}
          <p>{cat.descripcion}</p>

          {/* Número de platos */}
          <p>
            <strong>Platos asociados:</strong> {cat.platos.length}
          </p>

          {/* Botón único: borrar */}
          <button
            className="borrar-btn"
            onClick={() => onBorrar(index + 1)}
          >
            Eliminar
          </button>

        </div>
      ))}

    </div>
  );
}

export default ListaCategorias;

