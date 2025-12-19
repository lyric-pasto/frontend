// src/utils/exportCsv.js
export function downloadCsvFromArray(rows, filename = "export.csv") {
  if (!rows || rows.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map(r =>
      keys
        .map(k => {
          const v = r[k] == null ? "" : String(r[k]).replace(/"/g, '""');
          return `"${v}"`;
        })
        .join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
