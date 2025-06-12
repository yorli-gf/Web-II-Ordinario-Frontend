import API from "../../api/axiosConfig";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DetallePedido from "./DetallePedido";
import "./styles.css";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      navigate("/login");
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resProductos, resPedidos] = await Promise.all([
        API.get("/productos/"),
        API.get("/pedidos/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }),
      ]);
      setProductos(resProductos.data);
      setPedidos(resPedidos.data);
    } catch (err) {
      setError("Error al cargar datos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const crearPedido = async () => {
    try {
      const res = await API.post(
        "/pedidos/",
        { estado: "pendiente" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setPedidos([...pedidos, res.data]);
      setPedidoSeleccionado(res.data);
    } catch (err) {
      setError("No se pudo crear el pedido.");
      console.error(err);
    }
  };

  const eliminarPedido = async (pedidoId) => {
    if (!window.confirm("¿Eliminar este pedido y todos sus detalles?")) return;
    try {
      await API.delete(`/pedidos/${pedidoId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      setPedidos(pedidos.filter((p) => p.id !== pedidoId));
      if (pedidoSeleccionado?.id === pedidoId) {
        setPedidoSeleccionado(null);
      }
    } catch (err) {
      setError("No se pudo eliminar el pedido.");
      console.error(err);
    }
  };

  return (
    <div className="pedidos-container">
      <div className="header-with-back">
        <Link to="/home" className="back-button">
          &larr; Volver al Inicio
        </Link>
        <h2>Administración de Pedidos</h2>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="pedidos-actions">
        <button onClick={crearPedido} disabled={loading} className="btn-primary">
          {loading ? "Cargando..." : "Nuevo Pedido"}
        </button>

        <div className="seleccion-pedido">
          <select
            value={pedidoSeleccionado?.id || ""}
            onChange={(e) => {
              const pedido = pedidos.find((p) => p.id === Number(e.target.value));
              setPedidoSeleccionado(pedido || null);
            }}
            disabled={loading}
          >
            <option value="">-- Selecciona un pedido --</option>
            {pedidos.map((p) => (
              <option key={p.id} value={p.id}>
                Pedido #{p.id} - {p.estado}
              </option>
            ))}
          </select>
          {pedidoSeleccionado && (
            <button
              onClick={() => eliminarPedido(pedidoSeleccionado.id)}
              className="btn-eliminar"
              disabled={loading}
            >
              Eliminar Pedido
            </button>
          )}
        </div>
      </div>

      {pedidoSeleccionado && (
        <DetallePedido
          pedido={pedidoSeleccionado}
          productos={productos}
          onUpdate={cargarDatos}
        />
      )}
    </div>
  );
}

export default Pedidos;
