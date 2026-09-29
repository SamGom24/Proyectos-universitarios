import "./ClienteMenu.css";
import { FaPlus, FaSearch } from "react-icons/fa";

function ClienteMenu({ onAñadirPedido, onConsultarPedido, onVolver }) {
  return (
    <div className="app-contenedor">
      <h1>¿Qué desea hacer?</h1>

      <div className="tarjetas-contenedor">

        <div className="tarjeta-boton" onClick={onAñadirPedido}>
          <FaPlus className="cliente-menu-icono" />
          <p>Crear</p>
        </div>

        <div className="tarjeta-boton" onClick={onConsultarPedido}>
          <FaSearch className="cliente-menu-icono" />
          <p>Consultar</p>
        </div>

      </div>

      <button className="cliente-menu-volver" onClick={onVolver}>
        Volver
      </button>
    </div>
  );
}

export default ClienteMenu;
