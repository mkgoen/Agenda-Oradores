const INVITATION_BLUE = [52, 120, 182]; // #3478b6
const INVITATION_BLUE_HEX = "#3478b6";
const INVITATION_INK = [35, 35, 35];
const INVITATION_INK_SOFT = [107, 110, 99];
const INVITATION_LINE = [185, 195, 205];

function drawCanvasRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function getInvitationIconDataUrl(type, size = 96) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.strokeStyle = INVITATION_BLUE_HEX;
    ctx.fillStyle = INVITATION_BLUE_HEX;
    ctx.lineWidth = 1.75;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Mapear el espacio de diseño 24x24 al tamaño del canvas
    ctx.scale(size / 24, size / 24);

    if (type === "badge") {
      // Tarjeta de contacto / identificación
      drawCanvasRoundRect(ctx, 2.5, 4, 19, 16, 2.5);
      ctx.stroke();

      // Cabeza
      ctx.beginPath();
      ctx.arc(8, 10, 2.3, 0, Math.PI * 2);
      ctx.stroke();

      // Hombros / torso
      ctx.beginPath();
      ctx.arc(8, 17.5, 3.8, Math.PI * 1.15, Math.PI * 1.85, false);
      ctx.stroke();

      // Líneas
      ctx.beginPath();
      ctx.moveTo(13.5, 9); ctx.lineTo(18.5, 9);
      ctx.moveTo(13.5, 12.5); ctx.lineTo(18.5, 12.5);
      ctx.moveTo(13.5, 16); ctx.lineTo(17, 16);
      ctx.stroke();
    } else if (type === "speech") {
      // Hoja de discurso con orador
      ctx.beginPath();
      ctx.moveTo(6, 2.5);
      ctx.lineTo(13.5, 2.5);
      ctx.lineTo(18.5, 7.5);
      ctx.lineTo(18.5, 21.5);
      ctx.lineTo(6, 21.5);
      ctx.closePath();
      ctx.stroke();

      // Pliegue de la hoja
      ctx.beginPath();
      ctx.moveTo(13.5, 2.5);
      ctx.lineTo(13.5, 7.5);
      ctx.lineTo(18.5, 7.5);
      ctx.stroke();

      // Silueta orador
      ctx.beginPath();
      ctx.arc(10, 12, 1.8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(10, 18, 3.2, Math.PI * 1.15, Math.PI * 1.85, false);
      ctx.stroke();

      // Líneas de texto
      ctx.beginPath();
      ctx.moveTo(14.5, 12); ctx.lineTo(16.5, 12);
      ctx.moveTo(14.5, 15); ctx.lineTo(16.5, 15);
      ctx.stroke();
    } else if (type === "clock") {
      // Cronómetro / reloj
      ctx.beginPath();
      ctx.moveTo(10.5, 2); ctx.lineTo(13.5, 2);
      ctx.moveTo(12, 2); ctx.lineTo(12, 4.5);
      ctx.moveTo(17.5, 6); ctx.lineTo(19, 4.5);
      ctx.stroke();

      // Esfera
      ctx.beginPath();
      ctx.arc(12, 13.5, 7.5, 0, Math.PI * 2);
      ctx.stroke();

      // Agujas apuntando a las 12:15
      ctx.beginPath();
      ctx.moveTo(12, 9);
      ctx.lineTo(12, 13.5);
      ctx.lineTo(15.5, 13.5);
      ctx.stroke();
    } else if (type === "map") {
      // Mapa desplegado
      ctx.beginPath();
      ctx.moveTo(3.5, 6);
      ctx.lineTo(9, 3.5);
      ctx.lineTo(15, 6);
      ctx.lineTo(20.5, 3.5);
      ctx.lineTo(20.5, 18);
      ctx.lineTo(15, 20.5);
      ctx.lineTo(9, 18);
      ctx.lineTo(3.5, 20.5);
      ctx.closePath();
      ctx.stroke();

      // Pliegues
      ctx.beginPath();
      ctx.moveTo(9, 3.5); ctx.lineTo(9, 18);
      ctx.moveTo(15, 6); ctx.lineTo(15, 20.5);
      ctx.stroke();

      // Marcador en mapa
      ctx.beginPath();
      ctx.arc(15, 11, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "pin") {
      // Marcador de ubicación
      ctx.beginPath();
      ctx.moveTo(12, 21.5);
      ctx.bezierCurveTo(7.5, 16.5, 5.5, 13.5, 5.5, 10);
      ctx.arc(12, 10, 6.5, Math.PI, 0, false);
      ctx.bezierCurveTo(18.5, 13.5, 16.5, 16.5, 12, 21.5);
      ctx.closePath();
      ctx.stroke();

      // Círculo central
      ctx.beginPath();
      ctx.arc(12, 10, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("No se pudo generar icono en canvas:", e);
    return null;
  }
}

function exportInvitationPdf(eventData, bosquejoTitles) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("No se pudo cargar la librería de PDF. Comprueba tu conexión a internet e inténtalo de nuevo.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt

  // Extracción de datos del orador
  const speakerName = (eventData?.speakerName || "").trim();
  const speechNum = eventData?.speechNumber ? String(eventData.speechNumber).trim() : "";
  const speechTitle = (eventData?.title || (bosquejoTitles && speechNum ? bosquejoTitles[speechNum] : "") || "").trim();

  let speechRowText = "";
  if (speechNum && speechTitle) {
    speechRowText = `${speechNum}. ${speechTitle}`;
  } else if (speechNum) {
    speechRowText = `${speechNum}.`;
  } else if (speechTitle) {
    speechRowText = speechTitle;
  }

  // Formato de fecha
  let dateRowText = "Domingo, 12:15";
  if (eventData?.date) {
    const parts = eventData.date.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0])) {
      const [y, m, d] = parts;
      const dt = new Date(y, m - 1, d);
      const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const dayName = !isNaN(dt.getDay()) ? dayNames[dt.getDay()] : "Domingo";
      const dStr = String(d).padStart(2, "0");
      const mStr = String(m).padStart(2, "0");
      dateRowText = `${dayName} ${dStr}/${mStr}/${y}, 12:15`;
    }
  }

  const addressRowText = "C/ Joven Pura 22, Torrevieja";
  const mapsUrlText = "https://goo.gl/maps/U7nXnpwakMLM2uCBA";

  // 1. Líneas horizontales decorativas (arriba y abajo del encabezado en azul temático)
  doc.setDrawColor(...INVITATION_BLUE);
  doc.setLineWidth(0.85);
  doc.line(76, 74, pageWidth - 76, 74);

  // 2. Encabezado de la congregación
  doc.setFont("helvetica", "oblique");
  doc.setFontSize(17);
  doc.setTextColor(...INVITATION_BLUE);
  doc.text("Congregación Torrevieja – Puerto", pageWidth / 2, 96, { align: "center" });

  doc.setDrawColor(...INVITATION_BLUE);
  doc.setLineWidth(0.85);
  doc.line(76, 114, pageWidth - 76, 114);

  // 3. Cuadro "INVITACIÓN PARA:"
  const headerBoxWidth = 220;
  const headerBoxHeight = 25;
  const headerBoxX = (pageWidth - headerBoxWidth) / 2;
  const headerBoxY = 154;

  doc.setDrawColor(...INVITATION_BLUE);
  doc.setLineWidth(1.2);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(headerBoxX, headerBoxY, headerBoxWidth, headerBoxHeight, 3.5, 3.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INVITATION_BLUE);
  doc.text("INVITACIÓN PARA:", pageWidth / 2, headerBoxY + 17, { align: "center" });

  // 4. Filas de la tabla (5 filas)
  const tableMarginX = 76;
  const tableWidth = pageWidth - tableMarginX * 2; // ~443 pt
  const iconBoxWidth = 28;
  const textBoxX = tableMarginX + iconBoxWidth + 6;
  const textBoxWidth = tableWidth - iconBoxWidth - 6;
  const rowHeight = 24;
  const rowSpacing = 6;
  const tableStartY = 186;

  const rowsData = [
    { type: "badge", text: speakerName },
    { type: "speech", text: speechRowText },
    { type: "clock", text: dateRowText },
    { type: "map", text: addressRowText },
    { type: "pin", text: mapsUrlText, url: mapsUrlText }
  ];

  rowsData.forEach((row, i) => {
    const rowY = tableStartY + i * (rowHeight + rowSpacing);

    // Caja del icono
    doc.setDrawColor(...INVITATION_BLUE);
    doc.setLineWidth(1.2);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(tableMarginX, rowY, iconBoxWidth, rowHeight, 3.5, 3.5, "FD");

    // Dibujar icono
    const iconDataUrl = getInvitationIconDataUrl(row.type);
    if (iconDataUrl) {
      const iconSize = 16.5;
      const iconX = tableMarginX + (iconBoxWidth - iconSize) / 2;
      const iconY = rowY + (rowHeight - iconSize) / 2;
      doc.addImage(iconDataUrl, "PNG", iconX, iconY, iconSize, iconSize);
    }

    // Caja de texto
    doc.setDrawColor(...INVITATION_BLUE);
    doc.setLineWidth(1.2);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(textBoxX, rowY, textBoxWidth, rowHeight, 3.5, 3.5, "FD");

    // Texto dentro de la caja
    doc.setFont("helvetica", "normal");
    let fontSize = 11;
    doc.setFontSize(fontSize);
    doc.setTextColor(...INVITATION_INK);

    // Ajustar tamaño si el texto del título es muy largo
    if (row.text && doc.getTextWidth(row.text) > textBoxWidth - 20) {
      fontSize = 9.5;
      doc.setFontSize(fontSize);
      if (doc.getTextWidth(row.text) > textBoxWidth - 20) {
        fontSize = 8.5;
        doc.setFontSize(fontSize);
      }
    }

    const textY = rowY + 16;
    doc.text(row.text || "", textBoxX + textBoxWidth / 2, textY, { align: "center" });

    // Si es enlace (Google Maps), añadir link interactivo al PDF
    if (row.url) {
      doc.link(textBoxX, rowY, textBoxWidth, rowHeight, { url: row.url });
    }
  });

  // 5. Saludo
  let curY = 370;
  doc.setFont("helvetica", "oblique");
  doc.setFontSize(11.5);
  doc.setTextColor(...INVITATION_BLUE);
  doc.text("Querido hermano:", tableMarginX, curY);

  // 6. Párrafos del cuerpo
  curY += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...INVITATION_INK);

  const p1 = "Para nosotros es un placer invitarte a discursar en nuestra congregación, y por supuesto, apreciamos el esfuerzo y la buena disposición que implica (Filemón 21). Si hubiera algún inconveniente para aceptar esta invitación, por favor, coméntalo con tu coordinador, para tratar de encontrar alguna otra fecha conveniente.";
  const p1Lines = doc.splitTextToSize(p1, tableWidth);
  doc.text(p1Lines, tableMarginX, curY);
  curY += p1Lines.length * 15.5 + 12;

  const p2 = "Todos los datos necesarios están en la tabla. No obstante, ante cualquier duda, nuestro auxiliar del coordinador de discursos te atenderá con mucho gusto. Su contacto está al final de esta hoja.";
  const p2Lines = doc.splitTextToSize(p2, tableWidth);
  doc.text(p2Lines, tableMarginX, curY);
  curY += p2Lines.length * 15.5 + 12;

  const p3 = "Gracias de antemano. Esperamos tu confirmación y pronto disfrutar del intercambio de estímulo.\nMientras tanto, recibe nuestros saludos y amor cristiano.";
  const p3Lines = doc.splitTextToSize(p3, tableWidth);
  doc.text(p3Lines, tableMarginX, curY);
  curY += p3Lines.length * 15.5 + 32;

  // 7. Pie / Datos de contacto
  const drawContactLine = (label, value, isLink, linkUrl) => {
    doc.setFont("helvetica", "oblique");
    doc.setFontSize(10.5);
    doc.setTextColor(...INVITATION_BLUE);
    doc.text(label, tableMarginX, curY);

    const labelWidth = doc.getTextWidth(label);
    const valueX = tableMarginX + labelWidth + 4;

    doc.setFont("helvetica", "normal");
    if (isLink) {
      doc.setTextColor(...INVITATION_BLUE);
      doc.text(value, valueX, curY);
      // Subrayado del enlace
      const valWidth = doc.getTextWidth(value);
      doc.setDrawColor(...INVITATION_BLUE);
      doc.setLineWidth(0.65);
      doc.line(valueX, curY + 1.5, valueX + valWidth, curY + 1.5);
      doc.link(valueX, curY - 9, valWidth, 12, { url: linkUrl || `mailto:${value}` });
    } else {
      doc.setTextColor(...INVITATION_INK);
      doc.text(value, valueX, curY);
    }
    curY += 16;
  };

  drawContactLine("Auxiliar:", "Abrahán Alarcón Galindo");
  drawContactLine("E-mail:", "abrahanalarcon88@gmail.com", true);
  drawContactLine("Telf.:", "606895199");

  curY += 12;
  drawContactLine("Coord. de Discursos:", "-");
  drawContactLine("Móvil:", "-");

  // Guardar archivo con formato: "número del mes del discurso" "Nombre orador" "Lugar de origen del orador" "dia.mes".pdf
  // Ejemplo: 1 Edgar Mateos Elche norte 17.1.pdf
  let monthNum = "";
  let dayMonth = "";
  if (eventData?.date) {
    const parts = eventData.date.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[1]) && !isNaN(parts[2])) {
      monthNum = String(parts[1]);
      dayMonth = `${parts[2]}.${parts[1]}`;
    }
  }

  const cleanSpeakerName = (eventData?.speakerName || "").trim().replace(/[\\/:*?"<>|]/g, "");
  const cleanOrigin = (eventData?.place || eventData?.origin || "").trim().replace(/[\\/:*?"<>|]/g, "");

  const filenameParts = [];
  if (monthNum) filenameParts.push(monthNum);
  if (cleanSpeakerName) filenameParts.push(cleanSpeakerName);
  if (cleanOrigin) filenameParts.push(cleanOrigin);
  if (dayMonth) filenameParts.push(dayMonth);

  const finalFilename = (filenameParts.length > 0 ? filenameParts.join(" ") : "invitacion") + ".pdf";
  doc.save(finalFilename);
}
