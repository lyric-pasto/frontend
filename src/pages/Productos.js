// src/pages/Productos.js
import React, { useState, useMemo } from "react";
import "./pages.css";
import { exportToCSV, printElement } from "../utils/export";

/*
  Productos (mejorado)
  Campos por producto:
  id, sku, nombre, categoria, precio, stock, unidad, proveedor,
  tallas (array string), colores (array string), estado, fecha, descripcion
*/

const MOCK = [
  {
    id: 1,
    sku: "SKU-001",
    nombre: "Polo Algodón Básico",
    categoria: "Polo",
    precio: 25.0,
    stock: 120,
    unidad: "unidad",
    proveedor: "Fabrics S.A.",
    tallas: ["S","M","L"],
    colores: ["Blanco","Negro"],
    estado: "Disponible",
    fecha: "2025-03-01",
    descripcion: "Polo 100% algodón, corte clásico."
  },
  {
    id: 2,
    sku: "SKU-002",
    nombre: "Chompa Lana",
    categoria: "Chompa",
    precio: 60.0,
    stock: 30,
    unidad: "unidad",
    proveedor: "Lanas del Norte",
    tallas: ["M","L","XL"],
    colores: ["Azul","Gris"],
    estado: "Disponible",
    fecha: "2025-03-02",
    descripcion: "Chompa de lana merino, ideal para invierno."
  }
];

function csvFriendly(product) {
  return {
    id: product.id,
    sku: product.sku,
    nombre: product.nombre,
    categoria: product.categoria,
    precio: product.precio,
    stock: product.stock,
    unidad: product.unidad,
    proveedor: product.proveedor,
    tallas: (product.tallas || []).join("|"),
    colores: (product.colores || []).join("|"),
    estado: product.estado,
    fecha: product.fecha,
    descripcion: product.descripcion
  };
}

export default function Productos() {
  const [data, setData] = useState(MOCK);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((p) =>
      (p.nombre || "").toLowerCase().includes(s) ||
      (p.sku || "").toLowerCase().includes(s) ||
      (p.categoria || "").toLowerCase().includes(s)
    );
  }, [q, data]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  function openNew() {
    setEditing({
      sku: "",
      nombre: "",
      categoria: "",
      precio: 0,
      stock: 0,
      unidad: "unidad",
      proveedor: "",
      tallas: [],
      colores: [],
      estado: "Disponible",
      fecha: new Date().toISOString().slice(0, 10),
      descripcion: ""
    });
    setModalOpen(true);
  }

  function openEdit(p) {
    // clonar y asegurar arrays
    setEditing({
      ...p,
      tallas: Array.isArray(p.tallas) ? [...p.tallas] : (p.tallas ? String(p.tallas).split("|") : []),
      colores: Array.isArray(p.colores) ? [...p.colores] : (p.colores ? String(p.colores).split("|") : [])
    });
    setModalOpen(true);
  }

  function save(obj) {
    // validaciones
    if (!obj.nombre || !obj.sku) return alert("SKU y Nombre son obligatorios.");
    if (isNaN(Number(obj.precio)) || Number(obj.precio) < 0) return alert("Precio inválido.");
    if (!Number.isFinite(Number(obj.stock)) || Number(obj.stock) < 0) return alert("Stock inválido.");

    const normalized = {
      ...obj,
      precio: Number(obj.precio),
      stock: Number(obj.stock),
      tallas: (obj.tallas || []).map(t => String(t).trim()).filter(Boolean),
      colores: (obj.colores || []).map(c => String(c).trim()).filter(Boolean)
    };

    if (normalized.id) {
      setData(d => d.map(x => (x.id === normalized.id ? normalized : x)));
    } else {
      normalized.id = Date.now();
      setData(d => [normalized, ...d]);
    }
    setModalOpen(false);
  }

  function remove(id) {
    if (!window.confirm("¿Eliminar producto?")) return;
    setData(d => d.filter(x => x.id !== id));
  }

  // helpers para edición de arrays de tallas/colores
  function addArrayValue(field, value) {
    setEditing(e => ({ ...e, [field]: [...(e[field] || []), value] }));
  }
  function removeArrayValue(field, index) {
    setEditing(e => {
      const arr = [...(e[field] || [])];
      arr.splice(index, 1);
      return { ...e, [field]: arr };
    });
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2 className="page-title">Productos</h2>
          <div className="small-muted">Administra los productos que se usan en pedidos</div>
        </div>

        <div className="controls">
          <button className="btn" onClick={openNew}>Nuevo producto</button>
          <button className="btn ghost" onClick={() => exportToCSV("productos.csv", data.map(csvFriendly))}>Exportar CSV</button>
          <button className="btn ghost" onClick={() => printElement("productos-table")}>Imprimir</button>

          <div className="search">
            <input placeholder="Buscar por nombre, SKU o categoría..." value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
          </div>
        </div>
      </div>

      <div className="card" id="productos-table">
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Unidad</th>
              <th>Proveedor</th>
              <th>Tallas / Colores</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(p => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>S/ {Number(p.precio).toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>{p.unidad}</td>
                <td>{p.proveedor}</td>
                <td>
                  <div style={{fontSize:12}}>
                    {((p.tallas||[]) .join(", "))}
                    <br />
                    <span className="small-muted">{((p.colores||[]) .join(", "))}</span>
                  </div>
                </td>
                <td>{p.estado}</td>
                <td>{p.fecha}</td>
                <td style={{textAlign:"right"}}>
                  <button className="btn ghost" onClick={() => openEdit(p)}>Editar</button>
                  <button className="btn ghost" onClick={() => remove(p.id)} style={{marginLeft:8}}>Eliminar</button>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && <tr><td colSpan={11} className="small-muted">No hay productos.</td></tr>}
          </tbody>
        </table>

        <div className="pager" style={{marginTop:16}}>
          {Array.from({length:pages}).map((_,i)=>(
            <div key={i} className={`page-num ${i+1===page?"active":""}`} onClick={()=>setPage(i+1)}>{i+1}</div>
          ))}
        </div>
      </div>

      {modalOpen && editing && (
        <div className="modal-backdrop">
          <div className="modal" style={{maxWidth:900}}>
            <h3 style={{marginBottom:8}}>{editing.id ? "Editar producto" : "Nuevo producto"}</h3>

            <div className="form-row">
              <input placeholder="SKU" value={editing.sku||""} onChange={e=>setEditing({...editing, sku:e.target.value})} />
              <input placeholder="Nombre" value={editing.nombre||""} onChange={e=>setEditing({...editing, nombre:e.target.value})} />
            </div>

            <div className="form-row">
              <input placeholder="Categoría" value={editing.categoria||""} onChange={e=>setEditing({...editing, categoria:e.target.value})} />
              <input type="number" min="0" step="0.01" placeholder="Precio unitario" value={editing.precio||0} onChange={e=>setEditing({...editing, precio: e.target.value})} />
            </div>

            <div className="form-row">
              <input type="number" placeholder="Stock" value={editing.stock||0} onChange={e=>setEditing({...editing, stock: e.target.value})} />
              <input placeholder="Unidad (ej. unidad, metros)" value={editing.unidad||"unidad"} onChange={e=>setEditing({...editing, unidad:e.target.value})} />
            </div>

            <div className="form-row">
              <input placeholder="Proveedor" value={editing.proveedor||""} onChange={e=>setEditing({...editing, proveedor:e.target.value})} />
              <input type="date" value={editing.fecha||""} onChange={e=>setEditing({...editing, fecha:e.target.value})} />
            </div>

            <div style={{marginTop:6}}>
              <label className="small-muted">Tallas (separadas por coma)</label>
              <input placeholder="S,M,L,XL" value={(editing.tallas||[]).join(",")} onChange={e=>{
                const arr = String(e.target.value).split(",").map(x=>x.trim()).filter(Boolean);
                setEditing({...editing, tallas: arr});
              }} />
              <label className="small-muted">Colores (separados por coma)</label>
              <input placeholder="Blanco,Negro,Azul" value={(editing.colores||[]).join(",")} onChange={e=>{
                const arr = String(e.target.value).split(",").map(x=>x.trim()).filter(Boolean);
                setEditing({...editing, colores: arr});
              }} />
            </div>

            <div className="form-row" style={{marginTop:6}}>
              <select value={editing.estado||"Disponible"} onChange={e=>setEditing({...editing, estado:e.target.value})}>
                <option>Disponible</option><option>No disponible</option><option>Agotado</option>
              </select>

              <input placeholder="Breve descripción" value={editing.descripcion||""} onChange={e=>setEditing({...editing, descripcion:e.target.value})} />
            </div>

            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12}}>
              <div className="small-muted">Al guardar, el producto quedará disponible para ser seleccionado en Pedidos (cuando enlaces).</div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn ghost" onClick={()=>setModalOpen(false)}>Cancelar</button>
                <button className="btn" onClick={()=>save(editing)}>Guardar producto</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
