// src/utils/export.js
// Utilidades simples para exportar CSV y "imprimir" un contenedor

export function exportToCSV(filename = "export.csv", rows = []) {
  if (!rows || !rows.length) {
    alert("No hay datos para exportar.");
    return;
  }
  const keys = Object.keys(rows[0]);
  const csvLines = [];
  csvLines.push(keys.join(","));
  for (const r of rows) {
    const line = keys.map((k) => {
      const v = r[k] ?? "";
      // escapar comillas dobles
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(",");
    csvLines.push(line);
  }
  const csv = csvLines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printElement(id) {
  const el = document.getElementById(id);
  if (!el) {
    alert("Elemento no encontrado para imprimir.");
    return;
  }
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>Imprimir</title></head><body>${el.innerHTML}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}
