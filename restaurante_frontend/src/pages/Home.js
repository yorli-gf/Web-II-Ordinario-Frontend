import { Link } from "react-router-dom";
import "../styles/Home.css"; // Archivo de estilos nuevo

function Home() {
  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-header">
          <h2>Menú Principal</h2>
          <p>Selecciona una opción para comenzar</p>
        </div>

        <div className="menu-options">
          <Link to="/productos" className="menu-card">
            <div className="menu-icon">📦</div>
            <h3>Gestión de Productos</h3>
            <p>Administra tu inventario de productos</p>
          </Link>

          <Link to="/pedidos" className="menu-card">
            <div className="menu-icon">📝</div>
            <h3>Gestión de Pedidos</h3>
            <p>Controla los pedidos del restaurante</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
