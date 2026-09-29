import { useState, useEffect } from "react";
import { subirImagenPlato, API_URL } from "../services/api.js";
import "./CrearPlato.css";

function CrearPlato({ categorias, platoInicial, onGuardar }) {
  function obtenerNombreCategoria(id) {
    const cat = categorias.find((c) => c.id === id);
    return cat ? cat.nombre : "";
  }

  function obtenerIdCategoria(nombre) {
    const cat = categorias.find((c) => c.nombre === nombre);
    return cat ? cat.id : null;
  }

  const [nombre, setNombre] = useState(platoInicial?.nombre || "");
  const [precio, setPrecio] = useState(platoInicial?.precio || "");
  const [descripcion, setDescripcion] = useState(platoInicial?.descripcion || "");
  const [imagenUrl, setImagenUrl] = useState(platoInicial?.imagen_url || "");
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(
    platoInicial ? obtenerNombreCategoria(platoInicial.categoria_id) : ""
  );

  const [mostrarLista, setMostrarLista] = useState(false);

  useEffect(() => {
    if (platoInicial) {
      setNombre(platoInicial.nombre || "");
      setPrecio(platoInicial.precio || "");
      setDescripcion(platoInicial.descripcion || "");
      setImagenUrl(platoInicial.imagen_url || "");
      setCategoriaSeleccionada(obtenerNombreCategoria(platoInicial.categoria_id));
    }
  }, [platoInicial, categorias]);

  async function guardar(e) {
    e.preventDefault();

    const categoria_id = obtenerIdCategoria(categoriaSeleccionada);

    if (!categoria_id) {
      alert("Selecciona una categoría válida");
      return;
    }

    // Validación de precio negativo
    if (Number(precio) < 0) {
      alert("Precio inválido: no puede ser negativo.");
      return;
    }

    let urlFinalImagen = imagenUrl;

    try {
      if (archivoImagen) {
        setSubiendoImagen(true);
        const respuestaSubida = await subirImagenPlato(archivoImagen);
        urlFinalImagen = respuestaSubida.imagen_url;
      }

      const plato = {
        nombre,
        precio: Number(precio),
        descripcion,
        categoria_id,
        disponible: true,
        en_carta: true,
        imagen_url: urlFinalImagen || null,
      };

      onGuardar(plato);

      if (!platoInicial) {
        setNombre("");
        setPrecio("");
        setDescripcion("");
        setCategoriaSeleccionada("");
        setImagenUrl("");
        setArchivoImagen(null);
      }
    
    } catch (error) {
      alert(error.message || "Error al guardar el plato");
    } finally {
      setSubiendoImagen(false);
    }
  }

  return (
    <div className="form-plato-contenedor">
      <h3>{platoInicial ? "Modificar Plato" : "Registro de plato"}</h3>

      <form onSubmit={guardar} className="form-plato">
        <label>Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label>Categoría</label>
        <div className="categoria-selector">
          <div
            className="categoria-input"
            onClick={() => setMostrarLista(!mostrarLista)}
          >
            {categoriaSeleccionada || "Seleccionar categoría"}
          </div>

          {mostrarLista && (
            <div className="categoria-lista">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="categoria-item"
                  onClick={() => {
                    setCategoriaSeleccionada(cat.nombre);
                    setMostrarLista(false);
                  }}
                >
                  {cat.nombre}
                </div>
              ))}
            </div>
          )}
        </div>

        <label>Precio</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />

        <label>Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />

        <label>Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setArchivoImagen(e.target.files?.[0] || null)}
        />

        {imagenUrl && !archivoImagen && (
          <div style={{ marginTop: "10px" }}>
            <p>Imagen actual:</p>
            <img
              src={`${API_URL}${imagenUrl}`}
              alt={nombre || "Vista previa"}
              style={{
                width: "120px",
                height: "90px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        )}

        {archivoImagen && (
          <p style={{ marginTop: "8px" }}>
            Imagen seleccionada: {archivoImagen.name}
          </p>
        )}

        <button type="submit" className="guardar-btn" disabled={subiendoImagen}>
          {subiendoImagen
            ? "Subiendo imagen..."
            : platoInicial
            ? "Guardar cambios"
            : "Guardar"}
        </button>
      </form>
    </div>
  );
}

export default CrearPlato;