import { useEffect, useState } from "react";
import { obtenerPedidos, obtenerPlatos } from "../services/api.js";
import "./ConsultarPedidos.css";

function ConsultarPedidos({ onVolver }) {
  const [pedidos, setPedidos] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [platosPorId, setPlatosPorId] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [detallesAbiertos, setDetallesAbiertos] = useState({});

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [pedidosData, platosData] = await Promise.all([
        obtenerPedidos(),
        obtenerPlatos(),
      ]);

      setPedidos(pedidosData);
      setPlatos(platosData);

      const diccionario = {};
      platosData.forEach((p) => {
        diccionario[p.id] = p;
      });
      setPlatosPorId(diccionario);

    } catch (err) {
      setError(err.message || "Error al cargar los pedidos.");
    } finally {
      setCargando(false);
    }
  }

  async function cancelarPedido(id) {
    const confirmar = window.confirm("¿Seguro que deseas cancelar este pedido?");
    if (!confirmar) return;

    try {
      await fetch(`http://127.0.0.1:8000/pedidos/${id}`, {
        method: "DELETE",
      });

      setPedidos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Error al cancelar el pedido.");
    }
  }

  function agruparItems(items) {
    const mapa = {};

    for (const item of items) {
      const plato = platosPorId[item.plato_id];
      if (!plato) continue;

      if (!mapa[plato.nombre]) {
        mapa[plato.nombre] = 0;
      }
      mapa[plato.nombre] += item.cantidad;
    }

    return mapa;
  }

  function toggleDetalles(id) {
    setDetallesAbiertos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="cliente-contenedor">
      <div className="cliente-header">
        <h1>Mis pedidos</h1>
        <button className="boton-volver" onClick={onVolver}>
          Volver
        </button>
      </div>

      {cargando && <p>Cargando pedidos...</p>}
      {error && <p className="mensaje-error">{error}</p>}

      {!cargando && pedidos.length === 0 && (
        <p>No tienes pedidos en curso.</p>
      )}

      <div className="platos-grid">
        {pedidos.map((pedido) => {
          const itemsAgrupados = agruparItems(pedido.items || []);

          return (
            <div key={pedido.id} className="menu-diario-card">
              <h3>Pedido #{pedido.id}</h3>

              <p><strong>Estado:</strong> {pedido.estado}</p>
              <p><strong>Dirección:</strong> {pedido.direccion}</p>
              <p><strong>Hora entrega:</strong> {pedido.hora_entrega}</p>
              <p><strong>Total:</strong> {pedido.total_pagado} €</p>
              <p><strong>Fecha:</strong> {pedido.fecha_hora}</p>

              <button
                className="boton-detalles"
                onClick={() => toggleDetalles(pedido.id)}
              >
                {detallesAbiertos[pedido.id] ? "Ocultar detalles" : "Ver detalles"}
              </button>

              {detallesAbiertos[pedido.id] && (
                <ul className="lista-platos-pedido">
                  {Object.entries(itemsAgrupados).map(([nombre, cantidad]) => (
                    <li key={nombre}>
                      {nombre} x{cantidad}
                    </li>
                  ))}
                </ul>
              )}

              <button
                className="boton-cancelar"
                onClick={() => cancelarPedido(pedido.id)}
              >
                Cancelar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConsultarPedidos;
