// src/pages/Pedidos.js
import React, { useState, useMemo } from "react";
import "./pages.css";
import { exportToCSV, printElement } from "../utils/export";

/*
  Pedidos mejorado: incluye líneas de artículos, total automático,
  campos de contacto, método de pago, tipo de comprobante y upload.
  Mock inicial en `MOCK`. Reemplazar con integración a backend cuando exista.
*/

const MOCK = [
  { id:1, cliente:"María López", telefono:"999111222", direccion:"Av. Siempre Viva 123",
    items:[ { id:111, producto:"Polo Algodón", cantidad:10, talla:"M", color:"Blanco", precio:8 } ],
    fecha:"2025-03-03", estado:"Pendiente", comprobante:"", metodoPago:"Transferencia", tipoComprobante:"Boleta", prioridad:"Normal", observaciones:"" },
  { id:2, cliente:"Textiles Aurora SAC", telefono:"987000111", direccion:"Parque 45",
    items:[ { id:222, producto:"Chompa Lana", cantidad:5, talla:"L", color:"Azul", precio:23 } ],
    fecha:"2025-03-04", estado:"Confirmado", comprobante:"file.pdf", metodoPago:"Transferencia", tipoComprobante:"Factura", prioridad:"Normal", observaciones:"Entrega urgente" },
];

function calcLineSubtotal(line) {
  const q = Number(line.cantidad) || 0;
  const p = Number(line.precio) || 0;
  return Math.round(q * p * 100) / 100;
}

function calcTotal(items=[]) {
  return items.reduce((s, it) => s + calcLineSubtotal(it), 0);
}

export default function Pedidos(){
  const [data,setData] = useState(MOCK);
  const [q,setQ] = useState("");
  const [page,setPage] = useState(1);
  const perPage = 6;

  const [modalOpen,setModalOpen] = useState(false);
  const [editing,setEditing] = useState(null); // objeto de pedido en edición

  const filtered = useMemo(()=> {
    const s = q.trim().toLowerCase();
    if(!s) return data;
    return data.filter(d => (d.cliente||"").toLowerCase().includes(s) || (d.items||[]).some(it => (it.producto||"").toLowerCase().includes(s)));
  }, [q,data]);

  const pages = Math.max(1, Math.ceil(filtered.length/perPage));
  const pageData = filtered.slice((page-1)*perPage, page*perPage);

  // abrir modal para nuevo pedido
  function openNew(){
    setEditing({
      cliente:"", telefono:"", direccion:"", fecha:new Date().toISOString().slice(0,10),
      items: [], estado:"Pendiente", comprobante:"", metodoPago:"Efectivo", tipoComprobante:"Boleta", prioridad:"Normal", observaciones:""
    });
    setModalOpen(true);
  }

  function openEdit(row){
    // clonar
    setEditing(JSON.parse(JSON.stringify(row)));
    setModalOpen(true);
  }

  function save(obj){
    // validaciones básicas
    if(!obj || !(obj.cliente || "").trim()){
      return alert("Ingrese el nombre del cliente.");
    }
    if(!obj.items || obj.items.length===0){
      return alert("Agregue al menos un artículo al pedido.");
    }
    // validar que exista cantidad > 0 y precios
    for(const it of obj.items){
      if(!(it.producto||"").trim()) return alert("Cada artículo necesita un nombre de producto.");
      if(!(Number(it.cantidad) > 0)) return alert("Cada artículo debe tener cantidad mayor a 0.");
      if(isNaN(Number(it.precio))) return alert("Ingrese precio unitario válido en cada artículo.");
    }

    // si es edición
    if(obj.id){
      setData(d=>d.map(x => x.id === obj.id ? {...obj} : x));
    } else {
      obj.id = Date.now();
      setData(d => [obj, ...d]);
    }
    setModalOpen(false);
  }

  function changeState(id, estado){
    setData(d => d.map(r => r.id === id ? {...r, estado} : r));
  }


  // Eliminar pedido
  function remove(id){
    if(!window.confirm("¿Eliminar pedido?")) return;
    setData(d => d.filter(x=>x.id!==id));
  }

  // funciones para manipular líneas dentro del modal editing
  function addLine(){
    const newLine = { id: Date.now() + Math.floor(Math.random()*999), producto:"", cantidad:1, talla:"", color:"", precio:0 };
    setEditing(e => ({ ...e, items: [...(e.items||[]), newLine] }) );
  }
  function updateLine(idx, field, value){
    setEditing(e => {
      const items = [...(e.items||[])];
      items[idx] = { ...items[idx], [field]: value };
      return { ...e, items };
    });
  }
  function removeLine(idx){
    setEditing(e => {
      const items = [...(e.items||[])];
      items.splice(idx,1);
      return { ...e, items };
    });
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2 className="page-title">Registro de Pedidos</h2>
          <div className="small-muted">Registra pedidos y adjunta comprobantes</div>
        </div>

        <div className="controls">
          <button className="btn" onClick={openNew}>Nuevo pedido</button>
          <button className="btn ghost" onClick={()=>exportToCSV("pedidos.csv", data)}>Exportar CSV</button>
          <button className="btn ghost" onClick={()=>printElement("pedidos-table")}>Imprimir</button>

          <div className="search"><input placeholder="Buscar pedido..." value={q} onChange={e=>{setQ(e.target.value); setPage(1);}}/></div>
        </div>
      </div>

      <div className="card" id="pedidos-table">
        <table className="table">
          <thead>
            <tr><th>Cliente</th><th>Items</th><th>Fecha</th><th>Estado</th><th>Comprobante</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {pageData.map(r => (
              <tr key={r.id}>
                <td>{r.cliente}<div className="small-muted" style={{fontSize:12}}>{r.telefono || ""} {r.direccion ? `· ${r.direccion}` : ""}</div></td>
                <td>{(r.items||[]).map(it => `${it.producto} x${it.cantidad}`).join(", ")}</td>
                <td>{r.fecha}</td>
                <td>
                  <select value={r.estado} onChange={e=>changeState(r.id, e.target.value)}>
                    <option>Pendiente</option><option>Confirmado</option><option>En proceso</option><option>Entregado</option><option>Cancelado</option>
                  </select>
                </td>
                <td>{r.comprobante ? <a href="#">{r.comprobante}</a> : <span className="small-muted">—</span>}</td>
                <td>${calcTotal(r.items || []).toFixed(2)}</td>
                <td style={{textAlign:"right"}}>
                  <button className="btn ghost" onClick={()=>openEdit(r)}>Editar</button>
                  <button className="btn ghost" onClick={()=>remove(r.id)} style={{marginLeft:6}}>Eliminar</button>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && <tr><td colSpan={7} className="small-muted">No hay pedidos.</td></tr>}
          </tbody>
        </table>

        <div className="pager" style={{marginTop:16}}>
          {Array.from({length:pages}).map((_,i)=>(
            <div key={i} className={`page-num ${i+1===page?"active":""}`} onClick={()=>setPage(i+1)}>{i+1}</div>
          ))}
        </div>
      </div>

      {/* Modal de creación / edición */}
      {modalOpen && editing && (
        <div className="modal-backdrop">
          <div className="modal" style={{maxWidth:900}}>
            <h3 style={{marginBottom:10}}>{editing.id ? "Editar pedido" : "Nuevo pedido"}</h3>

            {/* fila superior: cliente / telefono / fecha */}
            <div className="form-row" style={{marginBottom:8}}>
              <input placeholder="Cliente" value={editing.cliente||""} onChange={e=>setEditing({...editing, cliente:e.target.value})} />
              <input placeholder="Teléfono" value={editing.telefono||""} onChange={e=>setEditing({...editing, telefono:e.target.value})} />
              <input type="date" value={editing.fecha||""} onChange={e=>setEditing({...editing, fecha:e.target.value})} />
            </div>

            <div className="form-row" style={{marginBottom:8}}>
              <input placeholder="Dirección de entrega" value={editing.direccion||""} onChange={e=>setEditing({...editing, direccion:e.target.value})} />
              <select value={editing.prioridad||"Normal"} onChange={e=>setEditing({...editing, prioridad:e.target.value})}>
                <option>Normal</option><option>Urgente</option>
              </select>
              <select value={editing.metodoPago||"Efectivo"} onChange={e=>setEditing({...editing, metodoPago:e.target.value})}>
                <option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option>
              </select>
            </div>

            {/* líneas de artículos */}
            <div style={{marginTop:6, marginBottom:6}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
                <strong>Artículos</strong>
                <div>
                  <button className="btn ghost" onClick={addLine}>+ Agregar artículo</button>
                </div>
              </div>

              {(editing.items || []).length === 0 && <div className="small-muted">No hay artículos. Presiona "Agregar artículo".</div>}

              {(editing.items || []).map((it, idx) => (
                <div key={it.id} style={{display:"flex", gap:8, marginBottom:8, alignItems:"center"}}>
                  <input placeholder="Producto" value={it.producto||""} onChange={e=>updateLine(idx,"producto", e.target.value)} style={{flex:2}} />
                  <input type="number" min="1" placeholder="Cantidad" value={it.cantidad} onChange={e=>updateLine(idx,"cantidad", Number(e.target.value))} style={{width:100}} />
                  <input placeholder="Talla" value={it.talla||""} onChange={e=>updateLine(idx,"talla", e.target.value)} style={{width:90}} />
                  <input placeholder="Color" value={it.color||""} onChange={e=>updateLine(idx,"color", e.target.value)} style={{width:110}} />
                  <input type="number" min="0" placeholder="Precio" value={it.precio} onChange={e=>updateLine(idx,"precio", Number(e.target.value))} style={{width:110}} />
                  <div style={{width:90, textAlign:"right", fontWeight:700}}>S/ {calcLineSubtotal(it).toFixed(2)}</div>
                  <button className="btn ghost" onClick={()=>removeLine(idx)} style={{marginLeft:6}}>Eliminar</button>
                </div>
              ))}
            </div>

            {/* observaciones, comprobante, tipo comprobante */}
            <div className="form-row" style={{marginTop:6}}>
              <textarea placeholder="Observaciones / instrucciones" rows={3} value={editing.observaciones||""} onChange={e=>setEditing({...editing, observaciones:e.target.value})} />
              <div style={{minWidth:240, display:"flex", flexDirection:"column", gap:8}}>
                <div>
                  <label className="small-muted">Tipo de comprobante</label>
                  <select value={editing.tipoComprobante||"Boleta"} onChange={e=>setEditing({...editing, tipoComprobante:e.target.value})}>
                    <option>Boleta</option><option>Factura</option>
                  </select>
                </div>
                <div>
                  <label className="small-muted">Comprobante (subir)</label>
                  <input type="file" onChange={e => { const f = e.target.files?.[0]; if(f) setEditing({...editing, comprobante: f.name}); }} />
                  <div className="small-muted" style={{marginTop:6}}>{editing.comprobante ? `Archivo: ${editing.comprobante}` : "No hay archivo"}</div>
                </div>
              </div>
            </div>

            {/* Totales y acciones */}
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12}}>
              <div style={{fontSize:16}}>
                <div>Total artículos: {(editing.items||[]).length}</div>
                <div style={{fontWeight:700, marginTop:6}}>Total: S/ {calcTotal(editing.items||[]).toFixed(2)}</div>
              </div>

              <div style={{display:"flex", gap:8}}>
                <button className="btn ghost" onClick={()=>setModalOpen(false)}>Cancelar</button>
                <button className="btn" onClick={()=>save(editing)}>Guardar pedido</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
