// src/pages/Clientes.js
import React, { useState, useMemo } from "react";
import "./pages.css";
import { exportToCSV, printElement } from "../utils/export";

const MOCK = [
  { id: 1, nombre: "María López", documento: "45625672", tipo: "Natural", email: "maria@gmail.co", telefono: "999111222", estado: "Activo" },
  { id: 2, nombre: "Textiles Aurora SAC", documento: "64235678902", tipo: "Jurídico", email: "ventas@aurora.pe", telefono: "987000111", estado: "Activo" },
  { id: 3, nombre: "Textiles Aurora SAC", documento: "72635418395", tipo: "Jurídico", email: "maria@gmail.co", telefono: "987000111", estado: "Activo" },
];

export default function Clientes(){
  const [data, setData] = useState(MOCK);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if(!s) return data;
    return data.filter(r =>
      r.nombre.toLowerCase().includes(s) ||
      r.documento.toString().includes(s) ||
      r.email.toLowerCase().includes(s)
    );
  }, [q,data]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page-1)*perPage, page*perPage);

  function openNew(){ setEditing({}); setModalOpen(true); }
  function openEdit(row){ setEditing({...row}); setModalOpen(true); }
  function saveEdit(obj){
    if(!obj) return;
    if(obj.id){
      setData(d => d.map(x => x.id === obj.id ? obj : x));
    } else {
      obj.id = Date.now();
      setData(d => [obj, ...d]);
    }
    setModalOpen(false);
  }
  function remove(id){
    // usar window.confirm para evitar la regla eslint
    if (!window.confirm("¿Eliminar cliente?")) return;
    setData(d => d.filter(x=>x.id!==id));
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2 className="page-title">Gestión de Clientes</h2>
          <div className="small-muted">Administra clientes y contactos</div>
        </div>

        <div className="controls">
          <button className="btn" onClick={openNew}>Agregar cliente</button>
          <button className="btn ghost" onClick={() => exportToCSV("clientes.csv", data)}>Exportar CSV</button>
          <button className="btn ghost" onClick={() => printElement("clientes-table")}>Imprimir / PDF</button>

          <div className="search">
            <input placeholder="Buscar..." value={q} onChange={e=>{setQ(e.target.value); setPage(1);}}/>
          </div>
        </div>
      </div>

      <div className="card" id="clientes-table">
        <table className="table">
          <thead><tr>
            <th>Nombre</th><th>N° Documento</th><th>Tipo de Cliente</th><th>Correo electrónico</th><th>Teléfono</th><th>Estado</th><th></th>
          </tr></thead>
          <tbody>
            {pageData.map(r => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                <td>{r.documento}</td>
                <td>{r.tipo}</td>
                <td>{r.email}</td>
                <td>{r.telefono}</td>
                <td>{r.estado}</td>
                <td style={{width:140, textAlign:"right"}}>
                  <button className="btn ghost" onClick={()=>openEdit(r)}>Editar</button>
                  <button className="btn ghost" onClick={()=>remove(r.id)} style={{marginLeft:6}}>Eliminar</button>
                </td>
              </tr>
            ))}
            {pageData.length===0 && <tr><td colSpan={7} className="small-muted">No hay registros.</td></tr>}
          </tbody>
        </table>

        <div className="pager" style={{marginTop:16}}>
          {Array.from({length:pages}).map((_,i)=>(
            <div key={i} className={`page-num ${i+1===page?"active":""}`} onClick={()=>setPage(i+1)}>{i+1}</div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editing?.id ? "Editar cliente" : "Nuevo cliente"}</h3>
            <div className="form-row">
              <input placeholder="Nombre" value={editing.nombre||""} onChange={e=>setEditing({...editing, nombre:e.target.value})}/>
              <input placeholder="Documento" value={editing.documento||""} onChange={e=>setEditing({...editing, documento:e.target.value})}/>
            </div>
            <div className="form-row">
              <input placeholder="Correo electrónico" value={editing.email||""} onChange={e=>setEditing({...editing, email:e.target.value})}/>
              <input placeholder="Teléfono" value={editing.telefono||""} onChange={e=>setEditing({...editing, telefono:e.target.value})}/>
            </div>
            <div className="form-row">
              <select value={editing.tipo||"Natural"} onChange={e=>setEditing({...editing, tipo:e.target.value})}>
                <option>Natural</option><option>Jurídico</option>
              </select>
              <select value={editing.estado||"Activo"} onChange={e=>setEditing({...editing, estado:e.target.value})}>
                <option>Activo</option><option>Inactivo</option>
              </select>
            </div>

            <div className="form-actions">
              <button className="btn ghost" onClick={()=>setModalOpen(false)}>Cancelar</button>
              <button className="btn" onClick={()=>saveEdit(editing)}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
