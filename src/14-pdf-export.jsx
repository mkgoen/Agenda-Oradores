/* ---------------------------------------------------------------
   Exportar PDF de oradores locales
   -----------------------------------------------------------------
   Usa jsPDF (cargado por CDN en index.html como window.jspdf.jsPDF)
   para generar un documento sencillo: por cada orador local, su
   nombre, los 12 meses siguientes marcados como libres u ocupados,
   y la lista de bosquejos que dispone.
----------------------------------------------------------------*/

function exportLocalsPdf(localSpeakers) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("No se pudo cargar la librería de PDF. Comprueba tu conexión a internet e inténtalo de nuevo.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  let y = 50;

  const today = new Date();
  const next12 = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    next12.push({ label: `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`, key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` });
  }

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - 40) { doc.addPage(); y = 50; }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Oradores locales — disponibilidad y bosquejos", marginX, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generado el ${today.toLocaleDateString("es-ES")} · próximos 12 meses`, marginX, y);
  y += 24;

  const sorted = [...localSpeakers].sort((a, b) => a.name.localeCompare(b.name, "es"));

  sorted.forEach(sp => {
    ensureSpace(90);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(sp.name, marginX, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Meses disponibles (próximo año):", marginX, y);
    y += 13;

    const blocked = new Set(sp.blockedMonths || []);
    const line = next12.map(m => `${m.label}${blocked.has(m.key) ? " (ocupado)" : ""}`).join("   ·   ");
    const wrapped = doc.splitTextToSize(line, pageWidth - marginX * 2);
    wrapped.forEach(l => { ensureSpace(12); doc.text(l, marginX, y); y += 12; });

    y += 4;
    doc.text("Bosquejos que dispone: " + ((sp.bosquejos && sp.bosquejos.length) ? sp.bosquejos.join(", ") : "— ninguno registrado —"), marginX, y);
    y += 22;
  });

  doc.save(`oradores-locales-${today.toISOString().slice(0, 10)}.pdf`);
}
