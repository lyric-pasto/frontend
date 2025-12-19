// src/pages/Movimientos.js
import React, { useState, useMemo } from "react";
import "./pages.css";
import { exportToCSV, printElement } from "../utils/export";

/*
 Movimientos de inventario:
 Campos: id, tipo (Entrada/Salida), referencia (pedido o compra), entidad (proveedor/cliente), material_id, producto_id,
 cantidad, unidad, fecha, usuario (username), motivo, notas
*/

const MOCK = [
  { id: 1, tipo: "Entrada", referencia: "Compra #1001", entidad: "Fabrics S.A.", material: "Tela Algodón 1m", producto: "", cantidad: 50, unidad: "metros", fecha:"2025-03-01", usuario:"jhoseph", motivo:"Reposición", notas:"Llegada lote A" },
  { id: 2, tipo: "Salida", referencia: "Pedido #2002", entidad: "Cliente: Aurora", material: "Tela Algodón 1m", producto: "Polo Algodón", cantidad: 20, unidad: "metros", fecha:"2025-03-02", usuario:"secretaria1", motivo:"Producción", notas:"Para 20 polos" }
];

export default function Movimientos(){
  const [data, setData] = useState(MOCK);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmState, setConfirmState] = useState({open:false, id:null, message:"", onConfirm:null});

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    if(!s) return data;
    return data.filter(m => (m.tipo||"").toLowerCase().includes(s) || (m.material||"").toLowerCase().includes(s) || (m.referencia||"").toLowerCase().includes(s));
  }, [q, data]);

  const pages = Math.max(1, Math.ceil(filtered.length/perPage));
  const pageData = filtered.slice((page-1)*perPage, page*perPage);

  function openNew(){
    setEditing({
      tipo:"Entrada",
      referencia:"",
      entidad:"",
      material:"",
      producto:"",
      cantidad:1,
      unidad:"unidad",
      fecha:new Date().toISOString().slice(0,10),
      usuario:"",
      motivo:"",
      notas:""
    });
    setModalOpen(true);
  }

  function openEdit(m){
    setEditing({...m});
    setModalOpen(true);
  }

  function save(obj){
    // validaciones
    if(!obj.tipo || !obj.material || !(Number(obj.cantidad) > 0)) return alert("Tipo, material y cantidad son obligatorios.");
    if(obj.id){
      setData(d => d.map(x => x.id === obj.id ? {...obj} : x));
    } else {
      obj.id = Date.now();
      setData(d => [obj, ...d]);
    }
    setModalOpen(false);
  }



  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2 className="page-title">Movimientos de Inventario</h2>
          <div className="small-muted">Registra entradas y salidas (producción, compras, ajustes)</div>
        </div>

        <div className="controls">
          <button className="btn" onClick={openNew}>Nuevo movimiento</button>
          <button className="btn ghost" onClick={()=>exportToCSV("movimientos.csv", data)}>Exportar CSV</button>
          <button className="btn ghost" onClick={()=>printElement("movimientos-table")}>Imprimir</button>
          <div className="search"><input placeholder="Buscar material, referencia..." value={q} onChange={e=>{setQ(e.target.value); setPage(1);}}/></div>
        </div>
      </div>

      <div className="card" id="movimientos-table">
        <table className="table">
          <thead>
            <tr>
              <th>Tipo</th><th>Material / Producto</th><th>Cantidad</th><th>Unidad</th><th>Referencia</th><th>Fecha</th><th>Usuario</th><th>Motivo</th><th></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(m => (
              <tr key={m.id}>
                <td>{m.tipo}</td>
                <td>{m.material}{m.producto ? ` · ${m.producto}` : ""}</td>
                <td>{m.cantidad}</td>
                <td>{m.unidad}</td>
                <td>{m.referencia || <span className="small-muted">—</span>}</td>
                <td>{m.fecha}</td>
                <td>{m.usuario}</td>
                <td>{m.motivo}</td>
                <td style={{textAlign:"right"}}>
                  <button className="btn ghost" onClick={()=>openEdit(m)}>Editar</button>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && <tr><td colSpan={9} className="small-muted">No hay movimientos.</td></tr>}
          </tbody>
        </table>

        <div className="pager" style={{marginTop:12}}>
          {Array.from({length:pages}).map((_,i)=>(
            <div key={i} className={`page-num ${i+1===page?"active":""}`} onClick={()=>setPage(i+1)}>{i+1}</div>
          ))}
        </div>
      </div>

      {/* Modal crear/editar movimiento */}
      {modalOpen && editing && (
        <div className="modal-backdrop">
          <div className="modal" style={{maxWidth:820}}>
            <h3>{editing.id ? "Editar movimiento" : "Nuevo movimiento"}</h3>

            <div className="form-row">
              <select value={editing.tipo||"Entrada"} onChange={e=>setEditing({...editing, tipo:e.target.value})}>
                <option>Entrada</option><option>Salida</option><option>Ajuste</option>
              </select>
              <input placeholder="Referencia (Pedido / Compra)" value={editing.referencia||""} onChange={e=>setEditing({...editing, referencia:e.target.value})} />
              <input placeholder="Entidad (proveedor/cliente)" value={editing.entidad||""} onChange={e=>setEditing({...editing, entidad:e.target.value})} />
            </div>

            <div className="form-row">
              <input placeholder="Material (nombre)" value={editing.material||""} onChange={e=>setEditing({...editing, material:e.target.value})} />
              <input placeholder="Producto (opcional)" value={editing.producto||""} onChange={e=>setEditing({...editing, producto:e.target.value})} />
              <input type="number" min="0" placeholder="Cantidad" value={editing.cantidad||0} onChange={e=>setEditing({...editing, cantidad:Number(e.target.value)})} />
              <input placeholder="Unidad (ej. metros, unidades)" value={editing.unidad||"unidad"} onChange={e=>setEditing({...editing, unidad:e.target.value})} />
            </div>

            <div className="form-row">
              <input type="date" value={editing.fecha||""} onChange={e=>setEditing({...editing, fecha:e.target.value})} />
              <input placeholder="Usuario (quien registra)" value={editing.usuario||""} onChange={e=>setEditing({...editing, usuario:e.target.value})} />
              <input placeholder="Motivo" value={editing.motivo||""} onChange={e=>setEditing({...editing, motivo:e.target.value})} />
            </div>

            <div style={{marginTop:8}}>
              <textarea placeholder="Notas adicionales" rows={3} value={editing.notas||""} onChange={e=>setEditing({...editing, notas:e.target.value})} />
            </div>

            <div style={{display:"flex", justifyContent:"space-between", marginTop:12}}>
              <div className="small-muted">Este registro sirve para auditar movimientos de stock.</div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn ghost" onClick={()=>setModalOpen(false)}>Cancelar</button>
                <button className="btn" onClick={()=>save(editing)}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm */}
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
