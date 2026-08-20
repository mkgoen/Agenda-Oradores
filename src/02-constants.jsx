/* ---------------------------------------------------------------
   Hooks de React
   -----------------------------------------------------------------
   Al no usar "import", se toman los hooks directamente del objeto
   global React (cargado desde el CDN en index.html). Como esto es
   el primer archivo que se ejecuta, el resto de archivos ya puede
   usar useState, useEffect, etc. sin declararlos de nuevo.
----------------------------------------------------------------*/
const { useState, useEffect, useMemo, useRef } = React;

/* ---------------------------------------------------------------
   Tokens
----------------------------------------------------------------*/
const LIGHT_COLORS = {
  bg: "#F5F3ED",
  surface: "#FFFFFF",
  ink: "#22261F",
  inkSoft: "#6B6E63",
  line: "#E2DFD3",
  teal: "#14524C",
  tealSoft: "#DCEAE6",
};

const DARK_COLORS = {
  bg: "#16180F",
  surface: "#20231B",
  ink: "#EDEAE0",
  inkSoft: "#9C9C8C",
  line: "#33362C",
  teal: "#6FC2B0",
  tealSoft: "#1D3B34",
};

// Color fijo del bocadillo de los eventos del calendario (siempre oscuro, sea cual sea el tema).
const TOOLTIP_BG = "#1F2320";

// Binding mutable: se reasigna en cada render de <App> según el tema elegido.
// Todos los demás componentes leen COLORS.xxx en tiempo de render, así que
// recogen el valor actualizado en cuanto App vuelve a renderizar.
let COLORS = LIGHT_COLORS;

const DEFAULT_STATUSES = [
  { name: "Creado", color: "#8B8378" },
  { name: "Invitado", color: "#6B5B95" },
  { name: "Esperando respuesta", color: "#B9822E" },
  { name: "Confirmado", color: "#2F8F4E" },
  { name: "Previsto", color: "#B4BA3B" },
  { name: "Cancelado", color: "#B0453B" },
];

// Normaliza colores heredados de sesiones anteriores: si "Invitado" o "Previsto"
// todavía tienen su color antiguo (sin personalizar), se actualizan a los nuevos.
function normalizeStatusColors(list) {
  return list.map(s => {
    if (s.name === "Invitado" && s.color === "#3B6FA0") return { ...s, color: "#6B5B95" };
    if (s.name === "Previsto" && s.color === "#6B5B95") return { ...s, color: "#B4BA3B" };
    return s;
  });
}

const STATUS_PALETTE = ["#2F8F4E", "#3B6FA0", "#B9822E", "#B0453B", "#6B5B95", "#8B8378", "#1F7A8C", "#A64B2A"];

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DOW_SHORT = { 6: "Sáb", 0: "Dom" };

const uid = () => Math.random().toString(36).slice(2, 10);

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function ym(dateStr) { return dateStr ? dateStr.slice(0, 7) : ""; }

// Corrige discrepancias entre los eventos reales y "Meses libres": para
// cada orador local, cualquier mes en el que tenga un evento asignado
// (visita, salida o evento) queda marcado como ocupado, sin tocar los
// meses bloqueados manualmente que no tengan evento asociado. Se aplica
// cada vez que se cargan datos (arranque, Abrir archivo), para arreglar
// discrepancias acumuladas de versiones anteriores.
function reconcileBlockedMonths(speakers, events) {
  return speakers.map(s => {
    if (!s.isLocal) return s;
    const monthsWithEvents = new Set();
    events.forEach(ev => {
      if (ev.speakerId === s.id && ev.date) monthsWithEvents.add(ym(ev.date));
    });
    if (monthsWithEvents.size === 0) return s;
    const merged = new Set(s.blockedMonths || []);
    let changed = false;
    monthsWithEvents.forEach(m => { if (!merged.has(m)) { merged.add(m); changed = true; } });
    if (!changed) return s;
    return { ...s, blockedMonths: Array.from(merged).sort() };
  });
}

function isWeekend(dateStr) {
  if (!dateStr) return true;
  const d = new Date(dateStr + "T00:00:00").getDay();
  return d === 0 || d === 6;
}

function daysInMonth(year, monthIndex) { return new Date(year, monthIndex + 1, 0).getDate(); }

function weekendsOfMonth(year, monthIndex) {
  const n = daysInMonth(year, monthIndex);
  const out = [];
  for (let day = 1; day <= n; day++) {
    const d = new Date(year, monthIndex, day);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) {
      const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      out.push({ iso, day, dow });
    }
  }
  return out;
}

// Fin de semana "actual": si hoy es sábado o domingo, ese mismo; si no, el próximo que llegue.
// Agrupa los fines de semana de un mes en filas {sat, sun}, dejando el hueco
// vacío cuando el sábado o el domingo de esa semana caen en el mes contiguo.
function buildWeekendRows(weekends) {
  const rows = [];
  let i = 0;
  while (i < weekends.length) {
    const cur = weekends[i];
    const next = weekends[i + 1];
    if (cur.dow === 6 && next && next.dow === 0 && next.day === cur.day + 1) {
      rows.push({ sat: cur, sun: next });
      i += 2;
    } else if (cur.dow === 6) {
      rows.push({ sat: cur, sun: null });
      i += 1;
    } else {
      rows.push({ sat: null, sun: cur });
      i += 1;
    }
  }
  return rows;
}

function getCurrentOrNextWeekend() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const dow = t.getDay();
  let sat = new Date(t);
  if (dow === 6) { /* ya es sábado */ }
  else if (dow === 0) { sat.setDate(t.getDate() - 1); }
  else { sat.setDate(t.getDate() + (6 - dow)); }
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { sat: toIso(sat), sun: toIso(sun) };
}
