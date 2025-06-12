import { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "./Pedidos.css";

function Pedidos() {
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detallesPedido, setDetallesPedido] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState({
    detalles: false,
    general: false
  });

  // Obtener datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(prev => ({...prev, general: true}));
      try {
        const [resProductos, resPedidos] = await Promise.all([
          API.get("/productos/"),
          API.get("/pedidos/")
        ]);
        setProductos(resProductos.data);
        setPedidos(resPedidos.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(prev => ({...prev, general: false}));
      }
    };
    cargarDatos();
  }, []);

  // Crear nuevo pedido
  const crearPedido = async () => {
    try {
      const res = await API.post("/pedidos/", { estado: "pendiente" });
      setPedidos(prev => [...prev, res.data]);
      setPedidoSeleccionado(res.data);
      setDetallesPedido([]);
    } catch (error) {
      console.error("Error al crear pedido:", error);
    }
  };

  // Obtener detalles del pedido
  const getDetalles = async (pedidoId) => {
    setLoading(prev => ({...prev, detalles: true}));
    try {
      const res = await API.get(`/detalles/?pedido=${pedidoId}`);
      setDetallesPedido(res.data);
    } catch (error) {
      console.error("Error al obtener detalles:", error);
    } finally {
      setLoading(prev => ({...prev, detalles: false}));
    }
  };

  // Agregar producto al pedido
  const agregarProducto = async () => {
    if (!pedidoSeleccionado || !productoId || cantidad < 1) return;
    
    try {
      await API.post("/detalles/", {
        pedido: pedidoSeleccionado.id,
        producto: productoId,
        cantidad: cantidad
      });
      await getDetalles(pedidoSeleccionado.id);
      setProductoId("");
      setCantidad(1);
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  };

  // Eliminar producto del pedido
  const eliminarProducto = async (detalleId) => {
    if (!window.confirm("¿Eliminar este producto del pedido?")) return;
    try {
      await API.delete(`/detalles/${detalleId}/`);
      await getDetalles(pedidoSeleccionado.id);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  // Cambiar estado del pedido
  const cambiarEstado = async (nuevoEstado) => {
    try {
      await API.patch(`/pedidos/${pedidoSeleccionado.id}/`, { estado: nuevoEstado });
      setPedidos(pedidos.map(p => 
        p.id === pedidoSeleccionado.id ? {...p, estado: nuevoEstado} : p
      ));
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  return (
    <div className="pedidos-container">
      <div className="pedidos-card">
        <div className="pedidos-header">
          <h2>Gestión de Pedidos</h2>
          <p>Administra los pedidos del restaurante</p>
        </div>

        <div className="pedidos-actions">
          <button 
            onClick={crearPedido} 
            className="btn-primary"
            disabled={loading.general}
          >
            {loading.general ? "Cargando..." : "Nuevo Pedido"}
          </button>

          <div className="pedido-selector">
            <select
              value={pedidoSeleccionado?.id || ""}
              onChange={(e) => {
                const pedido = pedidos.find(p => p.id === Number(e.target.value));
                setPedidoSeleccionado(pedido || null);
                if (pedido) getDetalles(pedido.id);
              }}
              disabled={loading.general}
            >
              <option value="">-- Selecciona un pedido --</option>
              {pedidos.map((p) => (
                <option key={p.id} value={p.id}>
                  Pedido #{p.id} - {p.estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pedidoSeleccionado && (
          <div className="pedido-detalles">
            <div className="detalles-header">
              <h3>Pedido #{pedidoSeleccionado.id}</h3>
              <select
                value={pedidoSeleccionado.estado}
                onChange={(e) => cambiarEstado(e.target.value)}
                disabled={loading.detalles}
              >
                <option value="pendiente">Pendiente</option>
                <option value="preparando">Preparando</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="agregar-producto">
              <select
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                disabled={loading.detalles}
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
                disabled={loading.detalles}
              />
              <button
                onClick={agregarProducto}
                className="btn-secondary"
                disabled={loading.detalles || !productoId}
              >
                Agregar
              </button>
            </div>

            <div className="productos-list">
              <h4>Productos en el pedido</h4>
              {loading.detalles ? (
                <p>Cargando productos...</p>
              ) : detallesPedido.length === 0 ? (
                <p>No hay productos agregados</p>
              ) : (
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
                    {detallesPedido.map((d) => (
                      <tr key={d.id}>
                        <td>{d.producto.nombre}</td>
                        <td>{d.cantidad}</td>
                        <td>${d.producto.precio}</td>
                        <td>${(d.cantidad * d.producto.precio).toFixed(2)}</td>
                        <td>
                          <button
                            onClick={() => eliminarProducto(d.id)}
                            className="btn-danger"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pedidos;



