import { useState } from "react";
import "./CrearCategoria.css";

function CrearCategoria({ onCrearCategoria }) {
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
  });

  const [guardando, setGuardando] = useState(false);

  function manejarCambio(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  async function manejarEnvio(e) {
    e.preventDefault();

    try {
      setGuardando(true);

      await onCrearCategoria({
        nombre: formulario.nombre,
        descripcion: formulario.descripcion,
      });

      setFormulario({ nombre: "", descripcion: "" });
      alert("Categoría creada correctamente");
    } catch (error) {
      console.error("Error al crear categoría:", error);
      alert(error.message || "No se pudo crear la categoría");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="form-plato-contenedor">
      <h3>Crear Categoría</h3>

      <form onSubmit={manejarEnvio} className="form-plato">
        <label>Nombre</label>
        <input
          name="nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
          required
        />

        <label>Descripción</label>
        <textarea
          name="descripcion"
          value={formulario.descripcion}
          onChange={manejarCambio}
          required
        />

        <button type="submit" className="guardar-btn" disabled={guardando}>
          {guardando ? "Guardando..." : "Crear categoría"}
        </button>
      </form>
    </div>
  );
}

export default CrearCategoria;