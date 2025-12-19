// src/services/materialsService.js
const STORAGE_KEY = "loomtrack_materials_v1";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("readAll materials", e);
    return [];
  }
}
function writeAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function nextId(list) {
  const max = list.reduce((m, it) => Math.max(m, it.id || 0), 0);
  return max + 1;
}

/**
 * listMaterials({ q, stock })
 * stock === "low" -> only low stock
 */
export async function listMaterials(params = {}) {
  const { q = "", stock } = params;
  const all = readAll();
  let items = all.filter(it => it.activo !== false);
  if (q) {
    const ql = q.toLowerCase();
    items = items.filter(it => (it.nombre || "").toLowerCase().includes(ql));
  }
  if (stock === "low") {
    items = items.filter(it => Number(it.stock_actual) <= Number(it.stock_minimo));
  }
  return items;
}

export async function getMaterial(id) {
  const all = readAll();
  return all.find(it => Number(it.id) === Number(id)) || null;
}

export async function createMaterial(payload) {
  const list = readAll();
  const id = nextId(list);
  const now = new Date().toISOString();
  const newItem = {
    id,
    nombre: payload.nombre || "",
    tipo: payload.tipo || "",
    unidad: payload.unidad || "unidad",
    stock_actual: Number(payload.stock_actual || 0),
    stock_minimo: Number(payload.stock_minimo || 0),
    peso: payload.peso == null ? null : Number(payload.peso),
    color: payload.color || "",
    precio_unitario: payload.precio_unitario == null ? null : Number(payload.precio_unitario),
    proveedor_id: payload.proveedor_id || null,
    fecha_ingreso: payload.fecha_ingreso || now,
    descripcion: payload.descripcion || "",
    activo: payload.activo == null ? true : !!payload.activo,
    movements: [
      {
        id: 1,
        tipo_mov: "creacion",
        cantidad: Number(payload.stock_actual || 0),
        usuario: payload.usuario || "system",
        fecha_mov: now,
        comentario: "Creación inicial"
      }
    ]
  };
  list.push(newItem);
  writeAll(list);
  return newItem;
}

export async function updateMaterial(id, payload) {
  const list = readAll();
  const idx = list.findIndex(it => Number(it.id) === Number(id));
  if (idx === -1) throw new Error("Material no encontrado");
  const cur = list[idx];
  const updated = { ...cur, ...payload, id: cur.id };
  list[idx] = updated;
  writeAll(list);
  return updated;
}

/**
 * adjustStock(id, { tipo_mov, cantidad, usuario, comentario })
 * tipo_mov: 'entrada'|'salida'|'ajuste'
 */
export async function adjustStock(id, { tipo_mov, cantidad, usuario = "system", comentario = "" }) {
  const list = readAll();
  const idx = list.findIndex(it => Number(it.id) === Number(id));
  if (idx === -1) throw new Error("Material no encontrado");
  const cur = list[idx];
  const qty = Number(cantidad || 0);
  let newStock = Number(cur.stock_actual || 0);
  if (tipo_mov === "entrada") newStock += qty;
  else if (tipo_mov === "salida") newStock -= qty;
  else if (tipo_mov === "ajuste") newStock = qty; // ajuste directo
  if (newStock < 0) throw new Error("Resultado de stock no puede ser negativo");

  const now = new Date().toISOString();
  const movId = (cur.movements || []).reduce((m, it) => Math.max(m, it.id || 0), 0) + 1;
  const mov = { id: movId, tipo_mov, cantidad: qty, usuario, fecha_mov: now, comentario };

  const updated = {
    ...cur,
    stock_actual: newStock,
    movements: [...(cur.movements || []), mov]
  };
  list[idx] = updated;
  writeAll(list);
  return updated;
}

export async function deleteMaterial(id) {
  // borrado lógico
  const list = readAll();
  const idx = list.findIndex(it => Number(it.id) === Number(id));
  if (idx === -1) throw new Error("Material no encontrado");
  list[idx].activo = false;
  writeAll(list);
  return list[idx];
}

/** Exporta CSV y devuelve Blob */
export async function exportMaterialsCsv(params = {}) {
  const items = await listMaterials(params);
  if (!items || items.length === 0) {
    const blobEmpty = new Blob(["No hay datos"], { type: "text/plain" });
    return blobEmpty;
  }
  // normalizar keys order
  const keys = ["id", "nombre", "tipo", "unidad", "stock_actual", "stock_minimo", "peso", "color", "precio_unitario", "proveedor_id", "fecha_ingreso", "descripcion"];
  const rows = items.map(it => keys.map(k => {
    const v = it[k] == null ? "" : String(it[k]).replace(/"/g, '""');
    return `"${v}"`;
  }).join(","));
  const csv = [keys.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  return blob;
}
