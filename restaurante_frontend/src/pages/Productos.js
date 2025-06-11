import { useState, useEffect } from "react";
import API from "../api/axiosConfig";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    disponible: true,
  });

  const getProductos = async () => {
    const res = await API.get("/productos/");
    setProductos(res.data);
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    try {
      await API.post("/productos/", {
        ...form,
        precio: parseFloat(form.precio),
      });
      setForm({ nombre: "", descripcion: "", precio: "", disponible: true });
      getProductos();
    } catch (error) {
      console.error("Error al crear producto:", error.response?.data);
      alert("Error al crear producto");
    }
  };

  const eliminarProducto = async (id) => {
    await API.delete(`/productos/${id}/`);
    getProductos();
  };

  useEffect(() => {
    getProductos();
  }, []);

  return (
    <div>
      <h2>Productos</h2>
      <form onSubmit={crearProducto}>
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          required
        />
        <input
          placeholder="Precio"
          value={form.precio}
          type="number"
          step="0.01"
          onChange={(e) => setForm({ ...form, precio: e.target.value })}
          required
        />
        <label>
          Disponible:
          <input
            type="checkbox"
            checked={form.disponible}
            onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
          />
        </label>
        <button>Agregar</button>
      </form>
      <ul>
        {productos.map((p) => (
          <li key={p.id}>
            {p.nombre} - ${p.precio}
            <button onClick={() => eliminarProducto(p.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Productos;

