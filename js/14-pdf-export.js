const PDF_BRAND = [20, 82, 76];
const PDF_INK = [34, 38, 31];
const PDF_INK_SOFT = [107, 110, 99];
const PDF_LINE = [226, 223, 211];
function exportLocalsPdf(localSpeakers) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("No se pudo cargar la librer\xEDa de PDF. Comprueba tu conexi\xF3n a internet e int\xE9ntalo de nuevo.");
    return;
  }
  if (!localSpeakers || localSpeakers.length === 0) {
    alert('No hay oradores locales marcados como "Orador aprobado". M\xE1rcalos en su ficha para incluirlos en el PDF.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 44;
  const contentWidth = pageWidth - marginX * 2;
  let y = 0;
  const today = /* @__PURE__ */ new Date();
  const next12 = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    next12.push({ label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` });
  }
  const drawHeader = () => {
    doc.setFillColor(...PDF_BRAND);
    doc.rect(0, 0, pageWidth, 74, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("Oradores locales aprobados", marginX, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`Disponibilidad y bosquejos \xB7 Generado el ${today.toLocaleDateString("es-ES")}`, marginX, 53);
    y = 96;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_INK_SOFT);
    doc.text("Solo se muestran los meses DISPONIBLES (no ocupados) de los pr\xF3ximos 12 meses.", marginX, y);
    y += 22;
  };
  drawHeader();
  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - 44) {
      doc.addPage();
      y = 44;
    }
  };
  const sorted = [...localSpeakers].sort((a, b) => a.name.localeCompare(b.name, "es"));
  sorted.forEach((sp, idx) => {
    ensureSpace(56);
    doc.setFillColor(...PDF_BRAND);
    doc.rect(marginX, y - 11, 3, 15, "F");
    doc.setTextColor(...PDF_BRAND);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(sp.name, marginX + 11, y);
    y += 17;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_INK_SOFT);
    doc.text("MESES DISPONIBLES", marginX + 11, y);
    y += 13;
    const blocked = new Set(sp.blockedMonths || []);
    const available = next12.filter((m) => !blocked.has(m.key));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    if (available.length === 0) {
      ensureSpace(13);
      doc.setTextColor(...PDF_INK_SOFT);
      doc.text("\u2014 Sin meses disponibles en el pr\xF3ximo a\xF1o \u2014", marginX + 16, y);
      y += 13;
    } else {
      available.forEach((m) => {
        ensureSpace(13);
        doc.setTextColor(...PDF_BRAND);
        doc.text("\u2022", marginX + 16, y);
        doc.setTextColor(...PDF_INK);
        doc.text(m.label, marginX + 26, y);
        y += 13;
      });
    }
    y += 6;
    ensureSpace(24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_INK_SOFT);
    doc.text("BOSQUEJOS QUE DISPONE", marginX + 11, y);
    y += 13;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...PDF_INK);
    const bosqLine = sp.bosquejos && sp.bosquejos.length ? sp.bosquejos.join(", ") : "\u2014 ninguno registrado \u2014";
    const wrapped = doc.splitTextToSize(bosqLine, contentWidth - 16);
    wrapped.forEach((l) => {
      ensureSpace(12);
      doc.text(l, marginX + 16, y);
      y += 12;
    });
    y += 16;
    if (idx < sorted.length - 1) {
      ensureSpace(4);
      doc.setDrawColor(...PDF_LINE);
      doc.setLineWidth(0.75);
      doc.line(marginX, y - 8, pageWidth - marginX, y - 8);
    }
  });
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_INK_SOFT);
    doc.text(`P\xE1gina ${p} de ${pageCount}`, pageWidth - marginX, pageHeight - 20, { align: "right" });
  }
  doc.save(`oradores-locales-${today.toISOString().slice(0, 10)}.pdf`);
}
