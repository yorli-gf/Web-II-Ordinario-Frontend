import React, { useState, useEffect } from "react";
import API from "../../api/axiosConfig";

function DetallePedido({ pedido, productos, onUpdate }) {
  const [detalles, setDetalles] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);

  const cargarDetalles = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/detalles/?pedido=${pedido.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      setDetalles(res.data);
    } catch (error) {
      console.error("Error cargando detalles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalles();
  }, [pedido]);

  const agregarProducto = async () => {
    if (!productoId || cantidad < 1) return;
    try {
      await API.post(
        "/detalles/",
        {
          pedido: pedido.id,
          producto: productoId,
          cantidad,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setProductoId("");
      setCantidad(1);
      await cargarDetalles();
      onUpdate();
    } catch (error) {
      console.error("Error agregando producto:", error);
    }
  };

  const eliminarProducto = async (detalleId) => {
    if (!window.confirm("¿Eliminar este producto del pedido?")) return;
    try {
      await API.delete(`/detalles/${detalleId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      await cargarDetalles();
      onUpdate();
    } catch (error) {
      console.error("Error eliminando producto:", error);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await API.patch(
        `/pedidos/${pedido.id}/`,
        { estado: nuevoEstado },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      onUpdate();
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  return (
    <div className="detalle-pedido">
      <div className="cabecera-detalles">
        <h3>Detalles del Pedido #{pedido.id}</h3>
        <select
          value={pedido.estado}
          onChange={(e) => cambiarEstado(e.target.value)}
          disabled={loading}
        >
          <option value="pendiente">Pendiente</option>
          <option value="preparando">Preparando</option>
          <option value="entregado">Entregado</option>
        </select>
      </div>

      <div className="agregar-producto">
        <select
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
          disabled={loading || !productos.length}
        >
          <option value="">Selecciona un producto</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} - ${p.precio}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          disabled={loading}
        />
        <button
          onClick={agregarProducto}
          disabled={loading || !productoId}
        >
          Agregar
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((d) => (
            <tr key={d.id}>
              <td>{d.producto.nombre}</td>
              <td>{d.cantidad}</td>
              <td>${d.producto.precio}</td>
              <td>${d.cantidad * d.producto.precio}</td>
              <td>
                <button
                  onClick={() => eliminarProducto(d.id)}
                  className="btn-eliminar"
                  disabled={loading}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DetallePedido;