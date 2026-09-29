import { useState } from "react";
import "./CrearMenuDiario.css";

function ConsultarMenuDiario({ platos }) {
  const [fecha, setFecha] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  // Convierte un ID en el nombre del plato
  function nombrePlatoPorId(id) {
    const plato = platos.find((p) => p.id === id);
    return plato ? plato.nombre : "(desconocido)";
  }

  async function consultar() {
    setError("");
    setResultado(null);

    if (!fecha) {
      setError("Por favor, selecciona una fecha.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/menu-diario/admin/${fecha}`);

      if (!res.ok) {
        setError("No existe un menú para la fecha seleccionada.");
        return;
      }

      const data = await res.json();
      setResultado(data);

    } catch (err) {
      setError("Error al consultar el menú.");
    }
  }

  return (
    <div className="menu-form">
      <h2>🔍 Consultar Menú Diario</h2>

      <div className="campo-selector">
        <label>Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <button className="consultar-btn" onClick={consultar}>
        🔍 Consultar
      </button>

      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}

      {resultado && (
        <div style={{ marginTop: "20px" }}>
          <h3>Menú del {resultado.fecha}</h3>

          <p><strong>Precio:</strong> {resultado.precio} €</p>

          {/* ENTRANTES */}
          <h3>Entrantes</h3>
          <p>{nombrePlatoPorId(resultado.entrante_1_id)}</p>
          <p>{nombrePlatoPorId(resultado.entrante_2_id)}</p>
          <p>{nombrePlatoPorId(resultado.entrante_3_id)}</p>

          {/* PRINCIPALES */}
          <h3>Platos principales</h3>
          <p>{nombrePlatoPorId(resultado.principal_1_id)}</p>
          <p>{nombrePlatoPorId(resultado.principal_2_id)}</p>
          <p>{nombrePlatoPorId(resultado.principal_3_id)}</p>

          {/* POSTRES */}
          <h3>Postres</h3>
          <p>{nombrePlatoPorId(resultado.postre_1_id)}</p>
          <p>{nombrePlatoPorId(resultado.postre_2_id)}</p>

          {/* BEBIDAS */}
          {resultado.bebida_1_id !== undefined && (
            <>
              <h3>Bebidas</h3>
              <p>{nombrePlatoPorId(resultado.bebida_1_id)}</p>
              <p>{nombrePlatoPorId(resultado.bebida_2_id)}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ConsultarMenuDiario;

