import { useEffect, useMemo, useState } from "react";
import {
  consultarMenuDiario,
  obtenerPlatos,
  obtenerCategorias,
  API_URL,
  crearPedido,
} from "../services/api.js";
import "./Cliente.css";

function Cliente({ onVolver, onPedidoCompletado }) {
  const [vistaActiva, setVistaActiva] = useState("menuDiario");

  const [menuDiario, setMenuDiario] = useState(null);
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);

  const [menuSeleccionado, setMenuSeleccionado] = useState({
    entrante: "",
    principal: "",
    postre: "",
    bebida: "",
  });

  const [datosPedido, setDatosPedido] = useState({
    direccion: "",
    horaEntrega: "13:00",
    tarjeta: "",
  });

  const [mensajePedido, setMensajePedido] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatosCliente();
  }, []);

  async function cargarDatosCliente() {
    try {
      setCargando(true);
      setError("");

      const hoy = new Date().toISOString().split("T")[0];

      const [menuData, platosData, categoriasData] = await Promise.all([
        consultarMenuDiario(hoy).catch(() => null),
        obtenerPlatos(),
        obtenerCategorias(),
      ]);

      setMenuDiario(menuData);
      setPlatos(platosData || []);
      setCategorias(categoriasData || []);
    } catch (err) {
      setError(err.message || "Error al cargar los datos del cliente.");
    } finally {
      setCargando(false);
    }
  }

  function obtenerUrlImagen(plato) {
    if (!plato.imagen_url) return null;
    return `${API_URL}${plato.imagen_url}`;
  }

  function obtenerNombreCategoria(plato) {
    if (plato.categoria) return plato.categoria;
    if (plato.categoria_nombre) return plato.categoria_nombre;

    const categoriaId = plato.categoria_id;
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria ? categoria.nombre : "Sin categoría";
  }

  function obtenerPlatoPorId(id) {
    return platos.find((plato) => Number(plato.id) === Number(id));
  }

  function obtenerNombrePlatoPorId(id) {
    const plato = obtenerPlatoPorId(id);
    return plato ? plato.nombre : "No disponible";
  }

  function idsMenu(campo1, campo2, campo3 = null) {
    return [menuDiario?.[campo1], menuDiario?.[campo2], campo3 ? menuDiario?.[campo3] : null]
      .filter(Boolean)
      .map((id) => obtenerPlatoPorId(id))
      .filter(Boolean);
  }

  const opcionesMenu = useMemo(() => {
    if (!menuDiario) {
      return { entrantes: [], principales: [], postres: [], bebidas: [] };
    }

    return {
      entrantes: idsMenu("entrante_1_id", "entrante_2_id", "entrante_3_id"),
      principales: idsMenu("principal_1_id", "principal_2_id", "principal_3_id"),
      postres: idsMenu("postre_1_id", "postre_2_id"),
      bebidas: idsMenu("bebida_1_id", "bebida_2_id"),
    };
  }, [menuDiario, platos]);

  function obtenerMenuFormateado() {
    if (!menuDiario) return null;

    return {
      fecha: menuDiario.fecha,
      precio: menuDiario.precio || 15,
    };
  }

  const menuFormateado = obtenerMenuFormateado();

  const nombresCategorias = useMemo(() => {
    return categorias.map((c) => c.nombre);
  }, [categorias]);

  const platosAdaptados = useMemo(() => {
    return platos.map((plato) => ({
      ...plato,
      categoriaNombre: obtenerNombreCategoria(plato),
      disponible: plato.disponible ?? true,
    }));
  }, [platos, categorias]);

  const platosFiltrados = useMemo(() => {
    return platosAdaptados.filter((plato) => {
      const coincideCategoria =
        categoriaSeleccionada === "Todas" ||
        plato.categoriaNombre === categoriaSeleccionada;

      const texto = `${plato.nombre} ${plato.descripcion || ""}`.toLowerCase();
      const coincideBusqueda = texto.includes(busqueda.toLowerCase());

      return coincideCategoria && coincideBusqueda;
    });
  }, [platosAdaptados, categoriaSeleccionada, busqueda]);

  function añadirPlatoAlCarrito(plato) {
    if (!plato.disponible) return;

    const nuevoPlato = {
      ...plato,
      tipo: "plato",
      carritoId: `plato-${plato.id}-${Date.now()}-${Math.random()}`,
    };

    setSeleccionados((prev) => [...prev, nuevoPlato]);
    setMensajePedido("");
  }

  function cantidadPlatoEnCarrito(id) {
    return seleccionados.filter(
      (item) => item.tipo === "plato" && Number(item.id) === Number(id)
    ).length;
  }

  function añadirMenuAlCarrito() {
    setMensajePedido("");

    if (!menuDiario) {
      setMensajePedido("No hay menú diario disponible para hoy.");
      return;
    }

    const { entrante, principal, postre, bebida } = menuSeleccionado;

    if (!entrante || !principal || !postre || !bebida) {
      setMensajePedido("Elige un entrante, un principal, un postre y una bebida.");
      return;
    }

    const nuevoMenu = {
      id: `menu-${Date.now()}-${Math.random()}`,
      carritoId: `menu-${Date.now()}-${Math.random()}`,
      tipo: "menu",
      nombre: "Menú diario",
      precio: Number(menuDiario.precio || 15),
      entrante,
      principal,
      postre,
      bebida,
      entranteNombre: obtenerNombrePlatoPorId(entrante),
      principalNombre: obtenerNombrePlatoPorId(principal),
      postreNombre: obtenerNombrePlatoPorId(postre),
      bebidaNombre: obtenerNombrePlatoPorId(bebida),
    };

    setSeleccionados((prev) => [...prev, nuevoMenu]);
    setVistaActiva("carrito");
  }

  function quitarItemCarrito(item) {
    setSeleccionados(
      seleccionados.filter((actual) => actual.carritoId !== item.carritoId)
    );
  }

  function añadirUnidadCarrito(item) {
    if (item.tipo === "plato") {
      añadirPlatoAlCarrito(item);
      return;
    }

    if (item.tipo === "menu") {
      const nuevoMenu = {
        ...item,
        carritoId: `menu-${Date.now()}-${Math.random()}`,
      };

      setSeleccionados((prev) => [...prev, nuevoMenu]);
    }
  }

  function quitarUnidadCarrito(item) {
    const index = seleccionados.findIndex((actual) => {
      if (item.tipo === "plato") {
        return actual.tipo === "plato" && Number(actual.id) === Number(item.id);
      }

      return actual.carritoId === item.carritoId;
    });

    if (index === -1) return;

    setSeleccionados(seleccionados.filter((_, i) => i !== index));
  }

  const carritoAgrupado = useMemo(() => {
    const agrupado = [];

    seleccionados.forEach((item) => {
      if (item.tipo === "plato") {
        const existente = agrupado.find(
          (actual) =>
            actual.tipo === "plato" && Number(actual.id) === Number(item.id)
        );

        if (existente) {
          existente.cantidad += 1;
        } else {
          agrupado.push({ ...item, cantidad: 1 });
        }
      } else {
        agrupado.push({ ...item, cantidad: 1 });
      }
    });

    return agrupado;
  }, [seleccionados]);

  const totalPedido = seleccionados.reduce(
    (acc, item) => acc + Number(item.precio || 0),
    0
  );

  function actualizarDatosPedido(e) {
    const { name, value } = e.target;
    setDatosPedido({ ...datosPedido, [name]: value });
  }

  function validarHoraMenu() {
    const hayMenu = seleccionados.some((item) => item.tipo === "menu");
    if (!hayMenu) return true;

    const hora = Number(datosPedido.horaEntrega.split(":")[0]);
    return hora >= 13 && hora < 16;
  }

  function convertirCarritoAItems() {
    const items = [];

    for (const item of seleccionados) {
      if (item.tipo === "plato") {
        items.push({
          plato_id: item.id,
          cantidad: 1,
        });
      }

      if (item.tipo === "menu") {
        items.push({ plato_id: item.entrante, cantidad: 1 });
        items.push({ plato_id: item.principal, cantidad: 1 });
        items.push({ plato_id: item.postre, cantidad: 1 });
        items.push({ plato_id: item.bebida, cantidad: 1 });
      }
    }

    return items;
  }

  async function pagarPedido(e) {
    e.preventDefault();
    setMensajePedido("");

    const tarjetaLimpia = datosPedido.tarjeta.replaceAll(" ", "");

    if (seleccionados.length === 0) {
      setMensajePedido("El carrito está vacío.");
      return;
    }

    if (totalPedido < 15) {
      setMensajePedido("El pedido mínimo es de 15 €.");
      return;
    }

    if (!datosPedido.direccion.trim()) {
      setMensajePedido("Introduce una dirección de entrega.");
      return;
    }

    if (!validarHoraMenu()) {
      setMensajePedido(
        "El menú diario solo está disponible para entregas de 13:00 a 16:00."
      );
      return;
    }

    if (!/^\d{16}$/.test(tarjetaLimpia)) {
      setMensajePedido("La tarjeta debe tener exactamente 16 dígitos.");
      return;
    }

    const items = convertirCarritoAItems();

    const pedidoData = {
      items,
      direccion: datosPedido.direccion,
      hora_entrega: datosPedido.horaEntrega,
      tarjeta: tarjetaLimpia,
    };

    try {
      const respuesta = await crearPedido(pedidoData);

      alert("Pedido realizado correctamente. Pago aceptado.");
      console.log("Pedido creado:", respuesta);

      setSeleccionados([]);
      setDatosPedido({ direccion: "", horaEntrega: "13:00", tarjeta: "" });

      if (onPedidoCompletado) {
        onPedidoCompletado();
      }
    } catch (err) {
      setMensajePedido(err.message || "Error al crear el pedido.");
    }
  }

  function renderLista(items) {
    if (!items || items.length === 0) return <p>No disponible</p>;

    return (
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  function renderSelectorMenu(titulo, nombre, opciones) {
    return (
      <div className="menu-bloque">
        <h3>{titulo}</h3>

        {renderLista(opciones.map((plato) => plato.nombre))}

        <select
          value={menuSeleccionado[nombre]}
          onChange={(e) =>
            setMenuSeleccionado({
              ...menuSeleccionado,
              [nombre]: e.target.value,
            })
          }
        >
          <option value="">Elige una opción</option>
          {opciones.map((plato) => (
            <option key={plato.id} value={plato.id}>
              {plato.nombre}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function renderPlatoCard(plato, conBoton = false) {
    const cantidad = cantidadPlatoEnCarrito(plato.id);

    return (
      <div
        key={plato.id}
        className={`plato-card ${cantidad > 0 ? "seleccionado" : ""} ${
          !plato.disponible ? "deshabilitado" : ""
        }`}
      >
        <div className="plato-info-horizontal">
          {plato.imagen_url && (
            <img
              src={obtenerUrlImagen(plato)}
              alt={plato.nombre}
              className="plato-imagen"
            />
          )}

          <div className="plato-texto">
            <h3>{plato.nombre}</h3>
            <p>{plato.descripcion || "Sin descripción"}</p>
            <p>
              <strong>Categoría:</strong> {plato.categoriaNombre}
            </p>
            <p>
              <strong>Precio:</strong> {Number(plato.precio).toFixed(2)} €
            </p>

            {conBoton ? (
              <>
                {cantidad > 0 && (
                  <p>
                    <strong>En carrito:</strong> {cantidad}
                  </p>
                )}

                <button
                  onClick={() => añadirPlatoAlCarrito(plato)}
                  disabled={!plato.disponible}
                >
                  {!plato.disponible ? "No disponible" : "Añadir"}
                </button>
              </>
            ) : (
              <p>
                <strong>Estado:</strong>{" "}
                {plato.disponible ? "Disponible" : "No disponible"}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cliente-contenedor">
      <button
        className={`carrito-boton ${seleccionados.length > 0 ? "activo" : ""}`}
        onClick={() => setVistaActiva("carrito")}
      >
        🛒 ({seleccionados.length})
      </button>

      <div className="cliente-header">
        <h1>Restaurante Nepalí 🍛</h1>
        <h2>Himalayan Taste</h2>
        <p>Consulta el menú, filtra por categorías y realiza tu pedido.</p>

        <div className="cliente-acciones-superiores">
          <button onClick={() => setVistaActiva("menuDiario")}>Menú diario</button>
          <button onClick={() => setVistaActiva("categorias")}>Categorías</button>
          <button onClick={() => setVistaActiva("listaPlatos")}>Lista de platos</button>
          <button onClick={() => setVistaActiva("seleccionar")}>Seleccionar platos</button>
          <button onClick={cargarDatosCliente}>Recargar</button>

          {onVolver && (
            <button className="boton-volver" onClick={onVolver}>
              Volver
            </button>
          )}
        </div>
      </div>

      {cargando && (
        <section className="cliente-seccion">
          <p className="texto-ayuda">Cargando datos...</p>
        </section>
      )}

      {!cargando && error && (
        <section className="cliente-seccion">
          <div className="menu-diario-card">
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        </section>
      )}

      {!cargando && !error && vistaActiva === "menuDiario" && (
        <section className="cliente-seccion">
          <h2>Menú del día</h2>

          {!menuFormateado ? (
            <div className="menu-diario-card">
              <p>No hay menú diario disponible para hoy.</p>
            </div>
          ) : (
            <div className="menu-diario-card">
              <p>
                <strong>Fecha:</strong> {menuFormateado.fecha}
              </p>
              <p>
                <strong>Precio:</strong> {Number(menuFormateado.precio).toFixed(2)} €
              </p>
              <p>Elige una opción de cada bloque para añadir el menú al carrito.</p>

              <div className="menu-bloques">
                {renderSelectorMenu("Entrante", "entrante", opcionesMenu.entrantes)}
                {renderSelectorMenu("Principal", "principal", opcionesMenu.principales)}
                {renderSelectorMenu("Postre", "postre", opcionesMenu.postres)}
                {renderSelectorMenu("Bebida", "bebida", opcionesMenu.bebidas)}
              </div>

              <button className="boton-principal" onClick={añadirMenuAlCarrito}>
                Añadir menú al carrito
              </button>

              {mensajePedido && <p className="mensaje-error">{mensajePedido}</p>}
            </div>
          )}
        </section>
      )}

      {!cargando && !error && vistaActiva === "categorias" && (
        <section className="cliente-seccion">
          <h2>Categorías</h2>

          <div className="categorias-grid">
            <div
              className={`categoria-card ${
                categoriaSeleccionada === "Todas" ? "activa" : ""
              }`}
              onClick={() => setCategoriaSeleccionada("Todas")}
            >
              Todas
            </div>

            {nombresCategorias.map((categoria) => (
              <div
                key={categoria}
                className={`categoria-card ${
                  categoriaSeleccionada === categoria ? "activa" : ""
                }`}
                onClick={() => setCategoriaSeleccionada(categoria)}
              >
                {categoria}
              </div>
            ))}
          </div>

          <p className="texto-ayuda">
            Categoría seleccionada: <strong>{categoriaSeleccionada}</strong>
          </p>

          <div className="platos-grid">
            {platosFiltrados.map((plato) => renderPlatoCard(plato))}
          </div>
        </section>
      )}

      {!cargando && !error && vistaActiva === "listaPlatos" && (
        <section className="cliente-seccion">
          <h2>Lista de platos</h2>

          <div className="filtros-cliente">
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="Todas">Todas</option>
              {nombresCategorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Buscar plato..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="platos-grid">
            {platosFiltrados.map((plato) => renderPlatoCard(plato))}
          </div>
        </section>
      )}

      {!cargando && !error && vistaActiva === "seleccionar" && (
        <section className="cliente-seccion">
          <h2>Seleccionar platos</h2>

          <div className="filtros-cliente">
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="Todas">Todas</option>
              {nombresCategorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Buscar plato..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="platos-grid">
            {platosFiltrados.map((plato) => renderPlatoCard(plato, true))}
          </div>
        </section>
      )}

      {!cargando && !error && vistaActiva === "carrito" && (
        <section className="cliente-seccion">
          <h2>Carrito y pago</h2>

          <div className="resumen-pedido">
            {seleccionados.length === 0 ? (
              <p>No has añadido platos todavía.</p>
            ) : (
              <>
                <ul>
                  {carritoAgrupado.map((item) => (
                    <li key={item.carritoId} className="item-carrito">
                      <span>
                        {item.tipo === "menu" ? (
                          <>
                            <strong>Menú diario</strong> -{" "}
                            {Number(item.precio).toFixed(2)} €
                            <br />
                            Entrante: {item.entranteNombre} | Principal:{" "}
                            {item.principalNombre} | Postre: {item.postreNombre} | Bebida:{" "}
                            {item.bebidaNombre}
                          </>
                        ) : (
                          <>
                            {item.nombre} - {Number(item.precio).toFixed(2)} €
                          </>
                        )}
                      </span>

                      <div className="control-cantidad">
                        <button type="button" onClick={() => quitarUnidadCarrito(item)}>
                          -
                        </button>

                        <strong>{item.cantidad}</strong>

                        <button type="button" onClick={() => añadirUnidadCarrito(item)}>
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <p>
                  <strong>Total:</strong> {totalPedido.toFixed(2)} €
                </p>

                <form className="formulario-pago" onSubmit={pagarPedido}>
                  <input
                    name="direccion"
                    type="text"
                    placeholder="Dirección de entrega"
                    value={datosPedido.direccion}
                    onChange={actualizarDatosPedido}
                  />

                  <input
                    name="horaEntrega"
                    type="time"
                    value={datosPedido.horaEntrega}
                    onChange={actualizarDatosPedido}
                  />

                  <input
                    name="tarjeta"
                    type="text"
                    placeholder="Tarjeta: 16 dígitos"
                    maxLength="19"
                    value={datosPedido.tarjeta}
                    onChange={actualizarDatosPedido}
                  />

                  <button type="submit">Pagar y confirmar pedido</button>
                </form>

                {mensajePedido && <p className="mensaje-error">{mensajePedido}</p>}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default Cliente;