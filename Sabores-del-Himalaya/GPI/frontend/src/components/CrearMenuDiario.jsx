// Formulario para configurar el menú diario
// Incluye entrantes, principales, postres, bebidas, fecha y precio

import { useState } from "react";
import "./CrearMenuDiario.css";

function CrearMenuDiario({ categorias, onGuardarMenu }) {

  // Obtener listas reales de platos según la categoría
  const entrantes = categorias.find(c => c.nombre === "Entrantes")?.platos || [];
  const principales = categorias.find(c => c.nombre === "Principales")?.platos || [];
  const postres = categorias.find(c => c.nombre === "Postres")?.platos || [];
  const bebidas = categorias.find(c => c.nombre === "Bebidas")?.platos || [];

  // Estado del menú diario
  const [menu, setMenu] = useState({
    entrantes: ["", "", ""],
    principales: ["", "", ""],
    postres: ["", ""],
    bebidas: ["", ""],
    fecha: "",
    precio: 15
  });

  // Seleccionar un plato en una posición concreta
  function seleccionarPlato(tipo, index, plato) {
    setMenu(prev => {
      const copia = { ...prev };
      copia[tipo][index] = plato;
      return copia;
    });
  }

  // Devuelve la lista de platos disponibles sin repetir
  function platosDisponibles(tipo, index) {
    const seleccionados = menu[tipo].filter((p, i) => p && i !== index);

    const listaOriginal =
      tipo === "entrantes" ? entrantes :
      tipo === "principales" ? principales :
      tipo === "postres" ? postres :
      bebidas; 

    return listaOriginal.filter(p => !seleccionados.includes(p.nombre));
  }

  // Guardar el menú completo
  async function guardarMenu(e) {
    e.preventDefault();

    // VALIDACIÓN DE CAMPOS OBLIGATORIOS
    if (menu.entrantes.some(p => p === "")) {
      alert("Debes seleccionar 3 entrantes.");
      return;
    }

    if (menu.principales.some(p => p === "")) {
      alert("Debes seleccionar 3 platos principales.");
      return;
    }

    if (menu.postres.some(p => p === "")) {
      alert("Debes seleccionar 2 postres.");
      return;
   }

    if (menu.bebidas.some(p => p === "")) {
      alert("Debes seleccionar 2 bebidas.");
      return;
    }

    if (!menu.fecha) {
      alert("Debes seleccionar una fecha.");
      return;
    }

    // Validar que la fecha NO sea sábado ni domingo
    const fechaSeleccionada = new Date(menu.fecha);
    const diaSemana = fechaSeleccionada.getDay(); // 0 = domingo, 6 = sábado

    if (diaSemana === 0 || diaSemana === 6) {
      alert("No se puede crear menú diario en fines de semana.");
      return;
    }

    //  Precio a 15€ fijo
    const menuFinal = {
      ...menu,
      precio: 15
    };

    try {
      await onGuardarMenu(menuFinal);
    } catch (error) {
      alert("Ya existe un menú para esa fecha. Debes elegir otra.");
      return;
    }

    // Limpiar formulario
    setMenu({
      entrantes: ["", "", ""],
      principales: ["", "", ""],
      postres: ["", ""],
      bebidas: ["", ""],
      fecha: "",
      precio: 15
    });
  }

  
  return (
    <div className="menu-form">
      <h2>Crear Menú Diario</h2>

      <form onSubmit={guardarMenu}>

        {/* ENTRANTES */}
        <h3>Entrantes</h3>
        {menu.entrantes.map((plato, index) => (
          <div key={index} className="campo-selector">
            <label>Entrante {index + 1}</label>
            <select
              value={plato}
              onChange={(e) => seleccionarPlato("entrantes", index, e.target.value)}
            >
              <option value="">Seleccionar plato</option>
              {platosDisponibles("entrantes", index).map((p, i) => (
                <option key={i} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
          </div>
        ))}

        {/* PRINCIPALES */}
        <h3>Platos principales</h3>
        {menu.principales.map((plato, index) => (
          <div key={index} className="campo-selector">
            <label>Principal {index + 1}</label>
            <select
              value={plato}
              onChange={(e) => seleccionarPlato("principales", index, e.target.value)}
            >
              <option value="">Seleccionar plato</option>
              {platosDisponibles("principales", index).map((p, i) => (
                <option key={i} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
          </div>
        ))}

        {/* POSTRES */}
        <h3>Postres</h3>
        {menu.postres.map((plato, index) => (
          <div key={index} className="campo-selector">
            <label>Postre {index + 1}</label>
            <select
              value={plato}
              onChange={(e) => seleccionarPlato("postres", index, e.target.value)}
            >
              <option value="">Seleccionar plato</option>
              {platosDisponibles("postres", index).map((p, i) => (
                <option key={i} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
          </div>
        ))}

        {/* BEBIDAS */}
        <h3>Bebidas</h3>
        {menu.bebidas.map((plato, index) => (
          <div key={index} className="campo-selector">
            <label>Bebida {index + 1}</label>
            <select
              value={plato}
              onChange={(e) => seleccionarPlato("bebidas", index, e.target.value)}
            >
              <option value="">Seleccionar plato</option>
              {platosDisponibles("bebidas", index).map((p, i) => (
                <option key={i} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
          </div>
        ))}

        {/* FECHA */}
        <label>Fecha</label>
        <input
          type="date"
          value={menu.fecha}
          onChange={(e) => setMenu({ ...menu, fecha: e.target.value })}
          required
        />

        <button type="submit" className="guardar-btn">
          Guardar menú
        </button>
      </form>
    </div>
  );
}

export default CrearMenuDiario;

