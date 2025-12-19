// src/pages/Material.jsx
import React, { useEffect, useState } from "react";
import * as svc from "../services/materialsService";
import { downloadCsvFromArray } from "../utils/exportCsv";

export default function MaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [filterLow, setFilterLow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [selected, setSelected] = useState(null);

  async function fetchMaterials() {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (filterLow) params.stock = "low";
      const items = await svc.listMaterials(params);
      setMaterials(items);
    } catch (e) {
      alert("Error cargando materiales: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMaterials();
  }, [q, filterLow]);

  function openCreate() {
    setEditing({ nombre: "", tipo: "", unidad: "unidad", stock_actual: 0, stock_minimo: 0 });
    setShowForm(true);
  }
  function openEdit(m) {
    setEditing(m);
    setShowForm(true);
  }

  async function saveMaterial(payload) {
    try {
      if (editing && editing.id) {
        await svc.updateMaterial(editing.id, payload);
      } else {
        await svc.createMaterial({ ...payload, usuario: "jhoseph" });
      }
      setShowForm(false);
      fetchMaterials();
    } catch (e) {
      alert("Error guardando: " + e.message);
    }
  }

  async function handleAdjustSubmit({ materialId, tipo_mov, cantidad, comentario }) {
    try {
      await svc.adjustStock(materialId, { tipo_mov, cantidad, comentario, usuario: "jhoseph" });
      setShowAdjust(false);
      setSelected(null);
      fetchMaterials();
    } catch (e) {
      alert("Error ajustando stock: " + e.message);
    }
  }

  async function handleExport() {
    try {
      const blob = await svc.exportMaterialsCsv({});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "materiales.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // fallback: export from client data
      downloadCsvFromArray(materials, "materiales_local.csv");
    }
  }

  // Delete with a safe ESLint bypass line (if your linter errors on confirm).
  async function handleDelete(id) {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm("¿Eliminar material? (esto es lógico)")) return;
    try {
      await svc.deleteMaterial(id);
      fetchMaterials();
    } catch (e) {
      alert("Error eliminando: " + e.message);
    }
  }

  return (
    <div style={{ padding: 8 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2>Materiales</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..." />
          <label style={{ fontSize: 13 }}>
            <input type="checkbox" checked={filterLow} onChange={e => setFilterLow(e.target.checked)} /> Críticos
          </label>
          <button onClick={openCreate}>Nuevo</button>
          <button onClick={handleExport}>Exportar</button>
        </div>
      </header>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>Nombre</th>
              <th>Tipo</th>
              <th style={{ textAlign: "center" }}>Unidad</th>
              <th style={{ textAlign: "center" }}>Stock</th>
              <th style={{ textAlign: "center" }}>Umbral</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => {
              const low = Number(m.stock_actual) <= Number(m.stock_minimo);
              return (
                <tr key={m.id} style={{ background: low ? "rgba(255,80,80,0.04)" : "transparent" }}>
                  <td>{m.nombre}</td>
                  <td>{m.tipo}</td>
                  <td style={{ textAlign: "center" }}>{m.unidad}</td>
                  <td style={{ textAlign: "center" }}>{m.stock_actual}</td>
                  <td style={{ textAlign: "center" }}>{m.stock_minimo}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(m)}>Editar</button>
                    <button onClick={() => { setSelected(m); setShowAdjust(true); }}>Ajustar</button>
                    <button onClick={() => handleDelete(m.id)}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
            {materials.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 12 }}>No hay materiales registrados</td></tr>
            )}
          </tbody>
        </table>
      )}

      {showForm && (
        <MaterialForm
          material={editing}
          onClose={() => setShowForm(false)}
          onSave={saveMaterial}
        />
      )}

      {showAdjust && selected && (
        <AdjustStockModal
          material={selected}
          onClose={() => { setShowAdjust(false); setSelected(null); }}
          onSubmit={handleAdjustSubmit}
        />
      )}
    </div>
  );
}

/* ----- Subcomponentes ----- */

function MaterialForm({ material, onClose, onSave }) {
  const [form, setForm] = useState(material || {});
  useEffect(() => setForm(material || {}), [material]);

  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.nombre || form.nombre.trim() === "") return alert("Nombre obligatorio");
    if (Number(form.stock_actual) < 0) return alert("Stock no puede ser negativo");
    await onSave(form);
  }

  return (
    <div style={modalStyle}>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, width: 420 }}>
        <h3>{form && form.id ? "Editar material" : "Nuevo material"}</h3>
        <input placeholder="Nombre" value={form.nombre || ""} onChange={e => setField("nombre", e.target.value)} />
        <input placeholder="Tipo" value={form.tipo || ""} onChange={e => setField("tipo", e.target.value)} />
        <input placeholder="Unidad" value={form.unidad || ""} onChange={e => setField("unidad", e.target.value)} />
        <input type="number" step="0.01" placeholder="Stock inicial" value={form.stock_actual || 0} onChange={e => setField("stock_actual", e.target.value)} />
        <input type="number" step="0.01" placeholder="Stock mínimo" value={form.stock_minimo || 0} onChange={e => setField("stock_minimo", e.target.value)} />
        <input type="number" step="0.01" placeholder="Peso" value={form.peso || ""} onChange={e => setField("peso", e.target.value)} />
        <input placeholder="Color" value={form.color || ""} onChange={e => setField("color", e.target.value)} />
        <textarea placeholder="Descripción" value={form.descripcion || ""} onChange={e => setField("descripcion", e.target.value)} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button type="submit">Guardar</button>
        </div>
      </form>
    </div>
  );
}

function AdjustStockModal({ material, onClose, onSubmit }) {
  const [tipo, setTipo] = useState("entrada");
  const [cantidad, setCantidad] = useState(0);
  const [comentario, setComentario] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!cantidad && tipo !== "ajuste") return alert("Ingrese cantidad");
    await onSubmit({ materialId: material.id, tipo_mov: tipo, cantidad: Number(cantidad), comentario });
  }

  return (
    <div style={modalStyle}>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, width: 360 }}>
        <h3>Ajustar stock: {material.nombre}</h3>
        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
          <option value="ajuste">Ajuste (establece cantidad)</option>
        </select>
        <input type="number" step="0.01" value={cantidad} onChange={e => setCantidad(e.target.value)} />
        <input placeholder="Comentario" value={comentario} onChange={e => setComentario(e.target.value)} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button type="submit">Aceptar</button>
        </div>
      </form>
    </div>
  );
}

const modalStyle = {
  position: "fixed",
  left: "50%",
  top: "50%",
  transform: "translate(-50%,-50%)",
  background: "white",
  color: "#041017",
  padding: 16,
  zIndex: 9999,
  borderRadius: 8,
  boxShadow: "0 6px 30px rgba(0,0,0,.2)",
};
