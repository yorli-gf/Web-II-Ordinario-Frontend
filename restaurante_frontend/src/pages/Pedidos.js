import { useEffect, useState } from "react";
import API from "../api/axiosConfig";

function Pedidos() {
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detallesPedido, setDetallesPedido] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // Obtener productos
  const getProductos = async () => {
    try {
      const res = await API.get("/productos/");
      setProductos(res.data);
    } catch (error) {
      console.error("Error al obtener productos", error);
    }
  };

  // Obtener pedidos
  const getPedidos = async () => {
    try {
      const res = await API.get("/pedidos/");
      setPedidos(res.data);
    } catch (error) {
      console.error("Error al obtener pedidos", error);
    }
  };

  // Crear nuevo pedido
  const crearPedido = async () => {
    try {
      const res = await API.post("/pedidos/", { estado: "pendiente" });
      setPedidos((prev) => [...prev, res.data]);
      setPedidoSeleccionado(res.data);
      setDetallesPedido([]);
      setProductoId("");
      setCantidad(1);
    } catch (error) {
      console.error("Error al crear pedido", error);
    }
  };

  // Obtener detalles del pedido seleccionado
  const getDetalles = async (pedidoId) => {
    try {
      setLoadingDetalles(true);
      const res = await API.get(`/detalles/?pedido=${pedidoId}`);
      setDetallesPedido(res.data);
    } catch (error) {
      console.error("Error al obtener detalles", error);
    } finally {
      setLoadingDetalles(false);
    }
  };

  // Agregar detalle (producto) al pedido
  const agregarDetalle = async () => {
    if (!pedidoSeleccionado) {
      alert("Selecciona un pedido primero.");
      return;
    }
    if (!productoId) {
      alert("Selecciona un producto.");
      return;
    }
    if (cantidad < 1) {
      alert("Cantidad debe ser al menos 1.");
      return;
    }
    try {
      await API.post("/detalles/", {
        pedido: pedidoSeleccionado.id,
        producto: productoId,
        cantidad: cantidad,
      });
      alert("Producto agregado al pedido.");
      setProductoId("");
      setCantidad(1);
      getDetalles(pedidoSeleccionado.id); // refrescar detalles
    } catch (error) {
      console.error("Error al agregar detalle", error);
    }
  };

  // Cuando se selecciona un pedido, carga sus detalles
  const handlePedidoChange = (e) => {
    const id = e.target.value;
    const pedido = pedidos.find((p) => p.id === Number(id));
    setPedidoSeleccionado(pedido || null);
    if (pedido) {
      getDetalles(pedido.id);
    } else {
      setDetallesPedido([]);
    }
  };

  // Carga inicial
  useEffect(() => {
    getProductos();
    getPedidos();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h2>Pedidos</h2>
      <button onClick={crearPedido} style={{ padding: "10px 20px", marginBottom: 20 }}>
        Nuevo Pedido
      </button>

      <div style={{ marginBottom: 20 }}>
        <label>
          Seleccionar pedido:
          <select
            value={pedidoSeleccionado ? pedidoSeleccionado.id : ""}
            onChange={handlePedidoChange}
            style={{ marginLeft: 10, padding: 5 }}
          >
            <option value="">-- Ninguno --</option>
            {pedidos.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.id} - Estado: {p.estado}
              </option>
            ))}
          </select>
        </label>
      </div>

      {pedidoSeleccionado && (
        <>
          <h3>Agregar productos al pedido #{pedidoSeleccionado.id}</h3>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
            <select
              onChange={(e) => setProductoId(e.target.value)}
              value={productoId}
              style={{ flexGrow: 1, padding: 5 }}
            >
              <option value="">Seleccione producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              style={{ width: 70, padding: 5 }}
            />
            <button onClick={agregarDetalle} style={{ padding: "8px 16px" }}>
              Agregar
            </button>
          </div>

          <h3>Detalles del pedido</h3>
          {loadingDetalles ? (
            <p>Cargando detalles...</p>
          ) : detallesPedido.length === 0 ? (
            <p>No hay productos agregados aún.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Producto</th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {detallesPedido.map((d) => (
                  <tr key={d.id}>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{d.producto.nombre}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{d.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default Pedidos;



