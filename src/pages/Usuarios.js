// src/pages/Usuarios.js
import React, { useState, useMemo } from "react";
import "./pages.css";
import { exportToCSV, printElement } from "../utils/export";

/*
 Usuarios:
 Campos: id, username, nombre_completo, email, role, estado, telefono, direccion, fecha_creacion, last_login, notas
*/

const MOCK = [
  {
    id: 1,
    username: "jhoseph",
    nombre_completo: "Jhoseph Pérez",
    email: "jhoseph@kalev.pe",
    role: "Admin",
    estado: "Activo",
    telefono: "999111222",
    direccion: "Av. Principal 123",
    fecha_creacion: "2025-03-01",
    last_login: "2025-10-05 09:30",
    notas: "Responsable del proyecto"
  },
  {
    id: 2,
    username: "secretaria1",
    nombre_completo: "María López",
    email: "maria@kalev.pe",
    role: "Secretaria",
    estado: "Activo",
    telefono: "987000111",
    direccion: "Calle Secundaria 45",
    fecha_creacion: "2025-02-15",
    last_login: "2025-10-04 08:10",
    notas: ""
  }
];

export default function Usuarios() {
  const [data, setData] = useState(MOCK);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // confirm modal state (to avoid window.confirm)
  const [confirmState, setConfirmState] = useState({ open:false, id:null, message:"", onConfirm:null });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(u =>
      (u.username || "").toLowerCase().includes(s) ||
      (u.nombre_completo || "").toLowerCase().includes(s) ||
      (u.email || "").toLowerCase().includes(s)
    );
  }, [q, data]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  function openNew(){
    setEditing({
      username: "",
      nombre_completo: "",
      email: "",
      role: "Secretaria",
      estado: "Activo",
      telefono: "",
      direccion: "",
      fecha_creacion: new Date().toISOString().slice(0,10),
      last_login: "",
      notas: ""
    });
    setModalOpen(true);
  }

  function openEdit(u){
    setEditing({...u});
    setModalOpen(true);
  }

  function save(obj){
    if(!obj.username || !obj.nombre_completo || !obj.email) return alert("Usuario, nombre y email son obligatorios.");
    if(obj.id){
      setData(d => d.map(x => x.id === obj.id ? {...obj} : x));
    } else {
      obj.id = Date.now();
      setData(d => [obj, ...d]);
    }
    setModalOpen(false);
  }

  function askDelete(id){
    setConfirmState({
      open: true,
      id,
      message: "¿Eliminar usuario? Esta acción no se puede deshacer.",
      onConfirm: () => {
        setData(d => d.filter(x => x.id !== id));
        setConfirmState({open:false, id:null, message:"", onConfirm:null});
      }
    });
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2 className="page-title">Usuarios</h2>
          <div className="small-muted">Gestiona cuentas y roles del sistema</div>
        </div>

        <div className="controls">
          <button className="btn" onClick={openNew}>Nuevo usuario</button>
          <button className="btn ghost" onClick={()=>exportToCSV("usuarios.csv", data)}>Exportar CSV</button>
          <button className="btn ghost" onClick={()=>printElement("usuarios-table")}>Imprimir</button>
          <div className="search"><input placeholder="Buscar usuario..." value={q} onChange={e=>{setQ(e.target.value); setPage(1);}}/></div>
        </div>
      </div>

      <div className="card" id="usuarios-table">
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Teléfono</th><th>Últ. login</th><th></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.nombre_completo}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.estado}</td>
                <td>{u.telefono}</td>
                <td>{u.last_login || <span className="small-muted">—</span>}</td>
                <td style={{textAlign:"right"}}>
                  <button className="btn ghost" onClick={()=>openEdit(u)}>Editar</button>
                  <button className="btn ghost" onClick={()=>askDelete(u.id)} style={{marginLeft:8}}>Eliminar</button>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && <tr><td colSpan={8} className="small-muted">No hay usuarios.</td></tr>}
          </tbody>
        </table>
        <div className="pager" style={{marginTop:12}}>
          {Array.from({length:pages}).map((_,i)=>(
            <div key={i} className={`page-num ${i+1===page?"active":""}`} onClick={()=>setPage(i+1)}>{i+1}</div>
          ))}
        </div>
      </div>

      {/* Modal nuevo/editar usuario */}
      {modalOpen && editing && (
        <div className="modal-backdrop">
          <div className="modal" style={{maxWidth:720}}>
            <h3>{editing.id ? "Editar usuario" : "Nuevo usuario"}</h3>
            <div className="form-row">
              <input placeholder="Usuario (username)" value={editing.username||""} onChange={e=>setEditing({...editing, username:e.target.value})} />
              <input placeholder="Nombre completo" value={editing.nombre_completo||""} onChange={e=>setEditing({...editing, nombre_completo:e.target.value})} />
            </div>
            <div className="form-row">
              <input placeholder="Email" value={editing.email||""} onChange={e=>setEditing({...editing, email:e.target.value})} />
              <select value={editing.role||"Secretaria"} onChange={e=>setEditing({...editing, role:e.target.value})}>
                <option>Admin</option><option>Secretaria</option><option>Encargado</option>
              </select>
            </div>
            <div className="form-row">
              <input placeholder="Teléfono" value={editing.telefono||""} onChange={e=>setEditing({...editing, telefono:e.target.value})} />
              <input placeholder="Dirección" value={editing.direccion||""} onChange={e=>setEditing({...editing, direccion:e.target.value})} />
            </div>
            <div style={{marginTop:8}}>
              <label className="small-muted">Estado</label>
              <select value={editing.estado||"Activo"} onChange={e=>setEditing({...editing, estado:e.target.value})}>
                <option>Activo</option><option>Inactivo</option>
              </select>
            </div>

            <div style={{display:"flex", justifyContent:"space-between", marginTop:12}}>
              <div className="small-muted">Fecha creación: {editing.fecha_creacion}</div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn ghost" onClick={()=>setModalOpen(false)}>Cancelar</button>
                <button className="btn" onClick={()=>save(editing)}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmState.open && (
        <div className="modal-backdrop">
          <div className="modal" style={{maxWidth:420}}>
            <h4>Confirmación</h4>
            <div className="small-muted" style={{marginBottom:12}}>{confirmState.message}</div>
            <div style={{display:"flex", justifyContent:"flex-end", gap:8}}>
              <button className="btn ghost" onClick={()=>setConfirmState({open:false, id:null, message:"", onConfirm:null})}>Cancelar</button>
              <button className="btn" onClick={()=>confirmState.onConfirm()}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
