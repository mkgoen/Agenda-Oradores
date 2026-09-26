/* ---------------------------------------------------------------
   Exportar PDF de oradores locales
   -----------------------------------------------------------------
   Usa jsPDF (cargado por CDN en index.html como window.jspdf.jsPDF)
   para generar un documento con estética profesional (banda de color
   de marca, tipografía jerarquizada): por cada orador local marcado
   como "Orador aprobado", su nombre, sus meses DISPONIBLES (no
   ocupados) de los próximos 12 meses en columna, y sus bosquejos
   (también en columna, con el título junto al número). Los bosquejos
   marcados como "no disponibles" se omiten del PDF.
----------------------------------------------------------------*/

// Paleta de marca en RGB, coherente con los teales usados en la app.
const PDF_BRAND = [20, 82, 76];       // #14524C
const PDF_INK = [34, 38, 31];         // #22261F
const PDF_INK_SOFT = [107, 110, 99];  // #6B6E63
const PDF_LINE = [226, 223, 211];     // #E2DFD3

function exportLocalsPdf(localSpeakers, bosquejoTitles, unavailableBosquejos) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("No se pudo cargar la librería de PDF. Comprueba tu conexión a internet e inténtalo de nuevo.");
    return;
  }
  if (!localSpeakers || localSpeakers.length === 0) {
    alert('No hay oradores locales marcados como "Orador aprobado". Márcalos en su ficha para incluirlos en el PDF.');
    return;
  }

  const unavailableSet = new Set(unavailableBosquejos || []);
  const titles = bosquejoTitles || {};

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 44;
  const contentWidth = pageWidth - marginX * 2;
  let y = 0;

  const today = new Date();
  const next12 = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    next12.push({ label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` });
  }

  // --- Cabecera con banda de color de marca ---
  const drawHeader = () => {
    doc.setFillColor(...PDF_BRAND);
    doc.rect(0, 0, pageWidth, 74, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("Oradores locales aprobados", marginX, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`Disponibilidad y bosquejos · Generado el ${today.toLocaleDateString("es-ES")}`, marginX, 53);
    y = 96;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_INK_SOFT);
    doc.text("Solo se muestran los meses DISPONIBLES (no ocupados) de los próximos 12 meses.", marginX, y);
    y += 22;
  };
  drawHeader();

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - 44) {
      doc.addPage();
      y = 44;
    }
  };

  // Dibuja una lista en columna con viñetas de color de marca. "items" es
  // un array de strings ya formateados (permite reutilizar para meses y
  // para bosquejos con el mismo aspecto visual).
  const drawBulletColumn = (items, emptyText) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    if (items.length === 0) {
      ensureSpace(13);
      doc.setTextColor(...PDF_INK_SOFT);
      doc.text(emptyText, marginX + 16, y);
      y += 13;
      return;
    }
    items.forEach(item => {
      const wrapped = doc.splitTextToSize(item, contentWidth - 30);
      wrapped.forEach((line, li) => {
        ensureSpace(13);
        if (li === 0) {
          doc.setTextColor(...PDF_BRAND);
          doc.text("•", marginX + 16, y);
        }
        doc.setTextColor(...PDF_INK);
        doc.text(line, marginX + 26, y);
        y += 13;
      });
    });
  };

  const sorted = [...localSpeakers].sort((a, b) => a.name.localeCompare(b.name, "es"));

  sorted.forEach((sp, idx) => {
    ensureSpace(56);

    // Franja de acento junto al nombre + nombre en color de marca
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
    const available = next12.filter(m => !blocked.has(m.key));
    drawBulletColumn(available.map(m => m.label), "— Sin meses disponibles en el próximo año —");

    y += 10;
    ensureSpace(24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_INK_SOFT);
    doc.text("BOSQUEJOS QUE DISPONE", marginX + 11, y);
    y += 13;

    // Se omiten los bosquejos marcados como "no disponibles".
    const bosquejosList = (sp.bosquejos || []).filter(n => !unavailableSet.has(n));
    drawBulletColumn(
      bosquejosList.map(n => titles[n] ? `${n} - ${titles[n]}` : `${n}`),
      "— ninguno registrado —"
    );

    // Espacio generoso antes de la línea separadora, y de la línea al
    // siguiente orador, para que no toque ningún texto.
    y += 14;
    if (idx < sorted.length - 1) {
      ensureSpace(26);
      doc.setDrawColor(...PDF_LINE);
      doc.setLineWidth(0.75);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 24;
    }
  });

  // Pie de página con numeración
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_INK_SOFT);
    doc.text(`Página ${p} de ${pageCount}`, pageWidth - marginX, pageHeight - 20, { align: "right" });
  }

  doc.save(`oradores-locales-${today.toISOString().slice(0, 10)}.pdf`);
}
