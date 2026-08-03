const BOSQUEJO_COLORS = {
  never: "#2E6FBA",
  // azul: nunca usado
  old: "#2F8F4E",
  // verde: más de 2 años
  mid: "#D4B106",
  // amarillo: entre 1 y 2 años
  recent: "#B0453B",
  // rojo: menos de 1 año (o ya programado a futuro)
  unavailable: "#5C3A21"
  // marrón oscuro: marcado manualmente como no disponible
};
const BOSQUEJO_LABELS = {
  never: "Nunca usado",
  old: "Hace m\xE1s de 2 a\xF1os",
  mid: "Entre 1 y 2 a\xF1os",
  recent: "Menos de 1 a\xF1o o futuro",
  unavailable: "Bosquejo no disponible"
};
function analyzeBosquejo(num, events, unavailableSet) {
  const matches = events.filter((ev) => ev.type === "visita" && String(ev.speechNumber || "").trim() === num);
  const t = todayMidnight();
  const todayIso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  let base;
  if (matches.length === 0) {
    base = { num, status: "never", date: null, speaker: null, place: null, sortKey: "0000-00-00" };
  } else {
    const past = matches.filter((e) => e.date && e.date <= todayIso).sort((a, b) => b.date.localeCompare(a.date));
    const future = matches.filter((e) => e.date && e.date > todayIso).sort((a, b) => a.date.localeCompare(b.date));
    const ref = past[0] || future[0];
    let status;
    if (past[0]) {
      const diffDays = Math.round((t - /* @__PURE__ */ new Date(ref.date + "T00:00:00")) / 864e5);
      status = diffDays >= 730 ? "old" : diffDays >= 365 ? "mid" : "recent";
    } else {
      status = "recent";
    }
    base = { num, status, date: ref.date, speaker: ref.speakerName, place: ref.place, sortKey: ref.date };
  }
  if (unavailableSet && unavailableSet.has(num)) {
    base = { ...base, status: "unavailable" };
  }
  return base;
}
function relativeAge(dateStr) {
  if (!dateStr) return "";
  const t = todayMidnight();
  const d = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
  const diffDays = Math.round((t - d) / 864e5);
  const future = diffDays < 0;
  const abs = Math.abs(diffDays);
  const years = Math.floor(abs / 365);
  const months = Math.floor(abs % 365 / 30);
  let text;
  if (years > 0) text = `${years} a\xF1o${years > 1 ? "s" : ""}${months > 0 ? ` y ${months} mes${months > 1 ? "es" : ""}` : ""}`;
  else if (months > 0) text = `${months} mes${months > 1 ? "es" : ""}`;
  else text = `${abs} d\xEDa${abs !== 1 ? "s" : ""}`;
  return future ? `dentro de ${text}` : `hace ${text}`;
}
function BosquejosView({ events, raw, setRaw, unavailable, setUnavailable }) {
  const [newUnavailable, setNewUnavailable] = useState("");
  const unavailableSet = useMemo(() => new Set(unavailable), [unavailable]);
  const addUnavailable = () => {
    const n = newUnavailable.trim();
    if (!n) return;
    if (!unavailable.includes(n)) setUnavailable([...unavailable, n]);
    setNewUnavailable("");
  };
  const removeUnavailable = (n) => setUnavailable(unavailable.filter((x) => x !== n));
  const results = useMemo(() => {
    const nums = raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean).map((s) => (s.match(/\d+/) || [s])[0]);
    const unique = [...new Set(nums)];
    return unique.map((n) => analyzeBosquejo(n, events, unavailableSet)).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [raw, events, unavailableSet]);
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border p-4", style: { borderColor: COLORS.line, background: COLORS.surface } }, /* @__PURE__ */ React.createElement(Field, { label: "N\xFAmeros de discurso (separados por espacios o comas)" }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: raw,
      onChange: (e) => setRaw(e.target.value),
      rows: 2,
      className: "ipt",
      placeholder: "Ej: 12, 45 67 103, 88"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-3 mt-3 text-[11px]" }, ["never", "old", "mid", "recent", "unavailable"].map((k) => /* @__PURE__ */ React.createElement("span", { key: k, className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "w-2.5 h-2.5 rounded-full flex-shrink-0", style: { background: BOSQUEJO_COLORS[k] } }), /* @__PURE__ */ React.createElement("span", { style: { color: COLORS.inkSoft } }, BOSQUEJO_LABELS[k]))))), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border p-4", style: { borderColor: COLORS.line, background: COLORS.surface } }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium block mb-2", style: { color: COLORS.inkSoft } }, "Bosquejos no disponibles"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 mb-2" }, unavailable.map((n) => /* @__PURE__ */ React.createElement("span", { key: n, className: "flex items-center gap-1 text-[11px] font-mono pl-2.5 pr-1 py-1 rounded-full", style: { background: BOSQUEJO_COLORS.unavailable + "22", color: BOSQUEJO_COLORS.unavailable } }, n, /* @__PURE__ */ React.createElement("button", { onClick: () => removeUnavailable(n), className: "rounded-full p-0.5 hover:bg-black/10", title: "Eliminar" }, /* @__PURE__ */ React.createElement(X, { size: 10 })))), unavailable.length === 0 && /* @__PURE__ */ React.createElement("span", { className: "text-xs", style: { color: COLORS.inkSoft } }, "Ninguno marcado.")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: newUnavailable,
      onChange: (e) => setNewUnavailable(e.target.value.replace(/[^0-9]/g, "")),
      onKeyDown: (e) => {
        if (e.key === "Enter") addUnavailable();
      },
      inputMode: "numeric",
      placeholder: "N\xBA de bosquejo",
      className: "ipt text-xs"
    }
  ), /* @__PURE__ */ React.createElement("button", { onClick: addUnavailable, className: "px-3 rounded-md text-xs font-medium flex-shrink-0", style: { background: BOSQUEJO_COLORS.unavailable + "22", color: BOSQUEJO_COLORS.unavailable } }, "A\xF1adir")))), results.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border p-8 text-center text-sm", style: { borderColor: COLORS.line, color: COLORS.inkSoft } }, "Escribe uno o varios n\xFAmeros de discurso para consultar cu\xE1ndo se dieron por \xFAltima vez.") : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5" }, results.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.num, className: "rounded-xl border p-3.5", style: { borderColor: COLORS.line, background: COLORS.surface, borderLeft: `4px solid ${BOSQUEJO_COLORS[r.status]}` } }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg font-semibold", style: { fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink } }, "n\xBA ", r.num), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] px-2 py-0.5 rounded-full font-medium", style: { background: BOSQUEJO_COLORS[r.status] + "22", color: BOSQUEJO_COLORS[r.status] } }, BOSQUEJO_LABELS[r.status])), r.status === "unavailable" ? /* @__PURE__ */ React.createElement("div", { className: "text-xs", style: { color: COLORS.inkSoft } }, "Marcado manualmente como no disponible.") : r.date ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "text-xs", style: { color: COLORS.ink } }, r.speaker), /* @__PURE__ */ React.createElement("div", { className: "text-[11px]", style: { color: COLORS.inkSoft } }, formatDate(r.date), " \xB7 ", relativeAge(r.date)), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] flex items-center gap-1 mt-0.5", style: { color: COLORS.inkSoft } }, /* @__PURE__ */ React.createElement(MapPin, { size: 10 }), " ", r.place)) : /* @__PURE__ */ React.createElement("div", { className: "text-xs", style: { color: COLORS.inkSoft } }, "Ning\xFAn visitante lo ha dado todav\xEDa.")))));
}
