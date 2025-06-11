import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h2>Menú Principal</h2>
      <ul>
        <li><Link to="/productos">Gestión de Productos</Link></li>
        <li><Link to="/pedidos">Gestión de Pedidos</Link></li>
      </ul>
    </div>
  );
}

export default Home;
