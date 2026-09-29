import { useState, useEffect } from "react";

// Iconos para los botones del panel
import {
  FaUtensils,
  FaTags,
  FaCalendarAlt,
  FaPlus,
  FaCog,
  FaTrash,
  FaSearch,
} from "react-icons/fa";

// Componentes del panel
import CrearPlato from "../components/CrearPlato.jsx";
import CrearCategoria from "../components/CrearCategoria.jsx";
import ListaPlatos from "../components/ListaPlatos.jsx";
import ListaCategorias from "../components/ListaCategorias.jsx";
import CrearMenuDiario from "../components/CrearMenuDiario.jsx";
import ConsultarMenuDiario from "../components/ConsultarMenuDiario.jsx";

import "./Admin.css";

// API del backend
import {
  obtenerCategorias,
  crearCategoria,
  borrarCategoria as borrarCategoriaAPI,
  obtenerPlatos,
  crearPlato,
  borrarPlato as borrarPlatoAPI,
  modificarPlato,
  crearMenuDiario,
} from "../services/api.js";

function Admin({ onCerrarSesion }) {
  const [seccionActiva, setSeccionActiva] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [platoEditando, setPlatoEditando] = useState(null);
  const [menusDiarios, setMenusDiarios] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const cats = await obtenerCategorias();
    const platos = await obtenerPlatos();

    const categoriasTransformadas = [
      {
        id: 0,
        nombre: "Todos",
        descripcion: "Todos los platos",
        platos: platos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          categoria_id: p.categoria_id,
          imagen_url: p.imagen_url,
          disponible: p.disponible,
          en_carta: p.en_carta,
        })),
      },
      ...cats.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        descripcion: c.descripcion,
        platos: platos.filter((p) => p.categoria_id === c.id),
      })),
    ];

    setCategorias(categoriasTransformadas);
  }

  function abrirSeccion(nombre) {
    setSeccionActiva(nombre);
  }

  async function agregarCategoria(nuevaCat) {
    try {
      await crearCategoria({
        nombre: nuevaCat.nombre,
        descripcion: nuevaCat.descripcion,
      });

      await cargarDatos();
      setSeccionActiva("categorias");
    } catch (error) {
      console.error("Error al crear categoría:", error);
      alert(error.message || "Error al crear la categoría");
      throw error;
    }
  }

  async function borrarCategoria(index) {
    const categoria = categorias[index];
    if (!categoria || categoria.id === 0) return;

    await borrarCategoriaAPI(categoria.id);
    await cargarDatos();
  }

  async function guardarPlato(plato, indexOriginal = null) {
    if (indexOriginal !== null) {
      const idPlato = categorias[0].platos[indexOriginal].id;

      await modificarPlato(idPlato, {
        nombre: plato.nombre,
        descripcion: plato.descripcion,
        precio: parseFloat(plato.precio),
        categoria_id: plato.categoria_id,
        disponible: plato.disponible,
        en_carta: plato.en_carta,
        imagen_url: plato.imagen_url,
      });
    } else {
      await crearPlato({
        nombre: plato.nombre,
        descripcion: plato.descripcion,
        precio: parseFloat(plato.precio),
        categoria_id: plato.categoria_id,
        disponible: plato.disponible,
        en_carta: plato.en_carta,
        imagen_url: plato.imagen_url,
      });
    }

    await cargarDatos();
    setPlatoEditando(null);
    setSeccionActiva("platos");
  }

  async function borrarPlato(index) {
    const plato = categorias[0].platos[index];
    await borrarPlatoAPI(plato.id);
    await cargarDatos();
  }

  function obtenerIdPlato(nombre) {
    const todas = categorias.flatMap((c) => c.platos);
    const plato = todas.find((p) => p.nombre === nombre);
    return plato ? plato.id : null;
  }

  async function guardarMenuDiario(menu) {
    try {
      await crearMenuDiario({
        fecha: menu.fecha,
        entrante_1_id: obtenerIdPlato(menu.entrantes[0]),
        entrante_2_id: obtenerIdPlato(menu.entrantes[1]),
        entrante_3_id: obtenerIdPlato(menu.entrantes[2]),
        principal_1_id: obtenerIdPlato(menu.principales[0]),
        principal_2_id: obtenerIdPlato(menu.principales[1]),
        principal_3_id: obtenerIdPlato(menu.principales[2]),
        postre_1_id: obtenerIdPlato(menu.postres[0]),
        postre_2_id: obtenerIdPlato(menu.postres[1]),
        bebida_1_id: obtenerIdPlato(menu.bebidas[0]),
        bebida_2_id: obtenerIdPlato(menu.bebidas[1]),
      });
    } catch (error) {
      throw error;
    }

    await cargarDatos();
    setSeccionActiva("menu");
  }

  return (
    <div className="admin-contenedor">
      <h1>Panel de Administración</h1>

      <button className="cerrar-sesion" onClick={onCerrarSesion}>
        Cerrar sesión
      </button>

      <div className="tarjetas-contenedor">
        <div className="tarjeta-boton" onClick={() => abrirSeccion("platos")}>
          <FaUtensils size={55} />
          <p>Platos</p>
        </div>

        <div className="tarjeta-boton" onClick={() => abrirSeccion("categorias")}>
          <FaTags size={55} />
          <p>Categorías</p>
        </div>

        <div className="tarjeta-boton" onClick={() => abrirSeccion("menu")}>
          <FaCalendarAlt size={55} />
          <p>Menú diario</p>
        </div>
      </div>

      {seccionActiva === "platos" && (
        <div className="tarjeta-contenido">
          <h2>Gestión de Platos</h2>

          <div className="acciones-platos">
            <div className="accion-boton" onClick={() => abrirSeccion("añadirPlato")}>
              <FaPlus size={40} />
              <p>Añadir</p>
            </div>

            <div className="accion-boton" onClick={() => abrirSeccion("modificarPlato")}>
              <FaCog size={40} />
              <p>Modificar</p>
            </div>

            <div className="accion-boton" onClick={() => abrirSeccion("borrarPlato")}>
              <FaTrash size={40} />
              <p>Borrar</p>
            </div>
          </div>
        </div>
      )}

      {seccionActiva === "añadirPlato" && (
        <CrearPlato categorias={categorias} onGuardar={guardarPlato} />
      )}

      {seccionActiva === "modificarPlato" && categorias[0]?.platos?.length > 0 && (
        <ListaPlatos
          platos={categorias[0].platos}
          categorias={categorias}
          onModificar={(index) => {
            setPlatoEditando({ ...categorias[0].platos[index], index });
            setSeccionActiva("editarPlato");
          }}
        />
      )}

      {seccionActiva === "modificarPlato" && categorias[0]?.platos?.length === 0 && (
        <p>No hay platos registrados.</p>
      )}

      {seccionActiva === "editarPlato" && (
        <CrearPlato
          categorias={categorias}
          platoInicial={platoEditando}
          onGuardar={(plato) => guardarPlato(plato, platoEditando.index)}
        />
      )}

      {seccionActiva === "borrarPlato" && categorias[0]?.platos?.length > 0 && (
        <ListaPlatos
          platos={categorias[0].platos}
          categorias={categorias}
          onModificar={(index) => borrarPlato(index)}
          modo="borrar"
        />
      )}

      {seccionActiva === "borrarPlato" && categorias[0]?.platos?.length === 0 && (
        <p>No hay platos registrados.</p>
      )}

      {seccionActiva === "categorias" && (
        <div className="tarjeta-contenido">
          <h2>Gestión de Categorías</h2>

          <div className="acciones-categorias">
            <div className="accion-boton" onClick={() => abrirSeccion("añadirCategoria")}>
              <FaPlus size={40} />
              <p>Añadir</p>
            </div>

            <div className="accion-boton" onClick={() => abrirSeccion("borrarCategoria")}>
              <FaTrash size={40} />
              <p>Borrar</p>
            </div>
          </div>
        </div>
      )}

      {seccionActiva === "añadirCategoria" && (
        <CrearCategoria onCrearCategoria={agregarCategoria} />
      )}

      {seccionActiva === "borrarCategoria" && (
        <ListaCategorias
          categorias={categorias}
          onBorrar={(index) => borrarCategoria(index)}
        />
      )}

      {seccionActiva === "menu" && (
        <div className="tarjeta-contenido">
          <h2>Gestión de Menú Diario</h2>

          <div className="acciones-categorias">
            <div className="accion-boton" onClick={() => abrirSeccion("añadirMenu")}>
              <FaPlus size={40} />
              <p>Añadir</p>
            </div>

            <div className="accion-boton" onClick={() => abrirSeccion("consultarMenu")}>
              <FaSearch size={40} />
              <p>Consultar</p>
            </div>
          </div>
        </div>
      )}

      {seccionActiva === "añadirMenu" && (
        <CrearMenuDiario
          categorias={categorias}
          onGuardarMenu={guardarMenuDiario}
        />
      )}

      {seccionActiva === "consultarMenu" && (
        <ConsultarMenuDiario platos={categorias.flatMap((c) => c.platos)} />
      )}
    </div>
  );
}

export default Admin;