// src/pages/Clientes.js
import React, { useState, useEffect, useMemo } from "react";
import "./pages.css";
import { exportToCSV, printElement } from "../utils/export";

const API_URL = "http://localhost:3001/api/clientes";

export default function Clientes() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     CARGAR CLIENTES (READ)
  ========================== */
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);//activa el estado
      const res = await fetch(API_URL);//fech a la api
      const json = await res.json();//convertir a json

      setData(Array.isArray(json) ? json : json.data || []);
    } catch (err) {
      alert("Error al cargar clientes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FILTRO segun texto de busqueda
  ========================== */
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((r) =>
      r.nombre.toLowerCase().includes(s) ||
      r.identificacion.toLowerCase().includes(s) ||
      r.correo.toLowerCase().includes(s)
    );
  }, [q, data]);


  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  /* =========================
     CRUD prepara un objeto vacio para nuevo cliente
  ========================== */ 
  const openNew = () => {
    setEditing({
      tipoCliente: "Natural",
      nombre: "",
      identificacion: "",
      telefono: "",
      correo: ""
    });
    setModalOpen(true);
  };
//Copia los datos del cliente seleccionado en
  const openEdit = (row) => {
    setEditing({ ...row });
    setModalOpen(true);
  };

  const validar = (c) => {
    if (!c.nombre) return "El nombre es obligatorio";
    if (!c.identificacion) return "Documento obligatorio";
    if (!c.telefono) return "Teléfono obligatorio";
    if (!c.correo || !c.correo.includes("@")) return "Correo inválido";
    return null;
  };
//valida los datos antes de guardar si es put o post
  const saveEdit = async () => {
    const error = validar(editing);
    if (error) return alert(error);

    try {
      const method = editing.idCliente ? "PUT" : "POST";
      const url = editing.idCliente
        ? `${API_URL}/${editing.idCliente}`
        : API_URL;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing)
      });

      if (!res.ok) throw new Error("Error guardando");

      setModalOpen(false);
      cargarClientes();
    } catch (err) {
      alert("Error al guardar cliente");
      console.error(err);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar cliente?")) return;

    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      cargarClientes();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2 className="page-title">Gestión de Clientes</h2>
          <div className="small-muted">CRUD completo conectado a BD</div>
        </div>

        <div className="controls">
          <button className="btn" onClick={openNew}>Agregar</button>
          <button className="btn ghost" onClick={() => exportToCSV("clientes.csv", data)}>Exportar CSV</button>
          <button className="btn ghost" onClick={() => printElement("clientes-table")}>Imprimir</button>

          <div className="search">
            <input
              placeholder="Buscar..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              
            />
                        <button
              className="btn ghost"
              title="Recargar"
              onClick={cargarClientes}
              style={{
                borderRadius: "50%",
                width: 40,
                height: 40,
                fontSize: 18
              }}
            >
              🔄
            </button>

          </div>
        </div>
      </div>

      <div className="card" id="clientes-table">
        {loading ? (// si esta en true muestra cargando
          <p>Cargando...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Tipo</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th></th> 
              </tr>
            </thead>
            <tbody>
              {pageData.map((r) => (
                <tr key={r.idCliente}>
                  <td>{r.nombre}</td>
                  <td>{r.identificacion}</td>
                  <td>{r.tipoCliente}</td>
                  <td>{r.correo}</td>
                  <td>{r.telefono}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn ghost" onClick={() => openEdit(r)}>Editar</button>
                    <button className="btn ghost" onClick={() => remove(r.idCliente)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={6}>No hay clientes</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editing.idCliente ? "Editar cliente" : "Nuevo cliente"}</h3>

            <input placeholder="Nombre" value={editing.nombre} onChange={e => setEditing({ ...editing, nombre: e.target.value })} />
            <input placeholder="Documento" value={editing.identificacion} onChange={e => setEditing({ ...editing, identificacion: e.target.value })} />
            <input placeholder="Correo" value={editing.correo} onChange={e => setEditing({ ...editing, correo: e.target.value })} />
            <input placeholder="Teléfono" value={editing.telefono} onChange={e => setEditing({ ...editing, telefono: e.target.value })} />

            <select value={editing.tipoCliente} onChange={e => setEditing({ ...editing, tipoCliente: e.target.value })}>
              <option>Natural</option>
              <option>Juridico</option>
            </select>

            <div className="form-actions">
              <button className="btn ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn" onClick={saveEdit}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
