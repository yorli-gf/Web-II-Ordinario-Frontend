import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import "../styles/Productos.css";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    disponible: true,
  });
  const [productoEditando, setProductoEditando] = useState(null);

  const navigate = useNavigate();

  const getProductos = async () => {
    try {
      const res = await API.get("/productos/");
      setProductos(res.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  useEffect(() => {
    getProductos();
  }, []);

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      if (productoEditando) {
        // Actualizar producto existente
        await API.put(`/productos/${productoEditando.id}/`, {
          ...form,
          precio: parseFloat(form.precio),
        });
      } else {
        // Crear nuevo producto
        await API.post("/productos/", {
          ...form,
          precio: parseFloat(form.precio),
        });
      }
      setForm({ nombre: "", descripcion: "", precio: "", disponible: true });
      setProductoEditando(null);
      getProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error.response?.data || error);
      alert("Error al guardar producto");
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await API.delete(`/productos/${id}/`);
      getProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar producto");
    }
  };

  const editarProducto = (producto) => {
    setProductoEditando(producto);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio.toString(),
      disponible: producto.disponible,
    });
  };

  const cancelarEdicion = () => {
    setProductoEditando(null);
    setForm({ nombre: "", descripcion: "", precio: "", disponible: true });
  };

  return (
    <div className="productos-container">
      <div className="productos-card">
        <div className="productos-header">
          <h2>Gestión de Productos</h2>
          <button className="btn-volver-mini" onClick={() => navigate("/home")}>
            ← Volver
          </button>
        </div>

        <form className="productos-form" onSubmit={guardarProducto}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Precio</label>
            <input
              placeholder="Precio"
              value={form.precio}
              type="number"
              step="0.01"
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>
              Disponible:
              <input
                type="checkbox"
                checked={form.disponible}
                onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
              />
            </label>
          </div>

          <button className="productos-button" type="submit">
            {productoEditando ? "Actualizar" : "Agregar"}
          </button>

          {productoEditando && (
            <button
              type="button"
              className="productos-button cancelar"
              onClick={cancelarEdicion}
            >
              Cancelar
            </button>
          )}
        </form>

        <ul className="productos-lista">
          {productos.map((p) => (
            <li key={p.id} className="producto-item">
              <div className="producto-info">
                <strong>{p.nombre}</strong>
                <p>{p.descripcion}</p>
                <p>${Number(p.precio).toFixed(2)}</p>
              </div>
              <button
                className="producto-editar"
                onClick={() => editarProducto(p)}
              >
                Editar
              </button>
              <button
                className="producto-eliminar"
                onClick={() => eliminarProducto(p.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Productos;







