// Componente raíz de la aplicación
// Controla qué vista se muestra en cada momento

import { useState } from "react";
import Admin from "./pages/Admin.jsx";
import Cliente from "./pages/Cliente.jsx";
import "./App.css";
import ClienteMenu from "./pages/ClienteMenu.jsx";
import ConsultarPedidos from "./pages/ConsultarPedidos.jsx";


function App() {

  // Estado que controla la vista actual
  // Posibles valores: "inicio" | "loginAdmin" | "cliente" | "admin"
  const [vista, setVista] = useState("inicio");

  return (
    <div className="app-contenedor">

      {/* ----------------------------- */}
      {/* VISTA INICIAL (pantalla de elección) */}
      {/* ----------------------------- */}
      {vista === "inicio" && (
        <>
          <h1>¡Identifícate!</h1>

          <div className="tarjetas-contenedor">

            {/* Botón para entrar como cliente */}
            <div
              className="tarjeta-boton"
              onClick={() => setVista("clienteMenu")}
            >
              <p>Cliente</p>
            </div>

            {/* Botón para ir al login de admin */}
            <div
              className="tarjeta-boton"
              onClick={() => setVista("loginAdmin")}
            >
              <p>Admin</p>
            </div>
          </div>
        </>
      )}

      {/* ----------------------------- */}
      {/* VISTA CLIENTE */}
      {/* ----------------------------- */}
      {vista === "cliente" && (
        <Cliente onVolver={() => setVista("clienteMenu")}
        onPedidoCompletado={() => setVista("clienteMenu")}
        />
      )}

      {/* ----------------------------- */}
      {/* LOGIN ADMIN */}
      {/* ----------------------------- */}
      {vista === "loginAdmin" && (
        <LoginAdmin
          onLoginCorrecto={() => setVista("admin")}  // Si login OK → panel admin
          onVolver={() => setVista("inicio")}        // Botón volver
        />
      )}

      {/* ----------------------------- */}
      {/* PANEL ADMIN */}
      {/* ----------------------------- */}
      {vista === "admin" && (
        <Admin onCerrarSesion={() => setVista("inicio")} />
      )}

      {/* ----------------------------- */}
      {/* PANEL CLIENTE */}
      {/* ----------------------------- */}
      {vista === "clienteMenu" && (
        <ClienteMenu
          onAñadirPedido={() => setVista("cliente")}
          onConsultarPedido={() => setVista("consultarPedidos")}
          onVolver={() => setVista("inicio")}
        />
      )}

      {/* ----------------------------- */}
      {/* LISTA DE PEDIDOS */}
      {/* ----------------------------- */}
      {vista === "consultarPedidos" && (
        <ConsultarPedidos onVolver={() => setVista("clienteMenu")} />
      )}


    </div>
  );
}

export default App;



// ======================================================
// COMPONENTE LOGIN ADMIN
// ======================================================

function LoginAdmin({ onLoginCorrecto, onVolver }) {

  // Estados controlados para usuario y contraseña
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  // Maneja el envío del formulario de login
  function manejarLogin(e) {
    e.preventDefault(); // Evita recargar la página

    // Validación simple (luego se conectará con backend)
    if (usuario === "admin" && password === "1234") {
      onLoginCorrecto();
    }

    // Segundo usuario permitido (easter egg)
    else if (usuario === "jojosiwa" && password === "karma") {
      onLoginCorrecto();
    }

    // Si no coincide ninguna credencial
    else {
      alert("Credenciales incorrectas");
    }
  }

  return (
    <div className="login-contenedor">
      <h2>Inicio de sesión Admin</h2>

      {/* Formulario de login */}
      <form onSubmit={manejarLogin} className="login-form">

        {/* Campo usuario */}
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        {/* Campo contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Botón enviar */}
        <button type="submit">Entrar</button>

        {/* Botón volver */}
        <button type="button" onClick={onVolver}>
          Volver
        </button>
      </form>
    </div>
  );
}


