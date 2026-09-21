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
  old: "Hace más de 2 años",
  mid: "Entre 1 y 2 años",
  recent: "Menos de 1 año o futuro",
  unavailable: "Bosquejo no disponible"
};

function analyzeBosquejo(num, events, unavailableSet) {
  // Normalizar número a string sin espacios ni ceros a la izquierda innecesarios
  const cleanNum = String(num).trim();

  // Buscar eventos que hayan usado este bosquejo
  const matches = events.filter((ev) => 
    ev.speechNumber && String(ev.speechNumber).trim() === cleanNum
  );

  const t = todayMidnight();
  const todayIso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;

  let base;
  if (matches.length === 0) {
    base = { 
      num: cleanNum, 
      status: "never", 
      date: null, 
      speaker: null, 
      place: null, 
      sortKey: "0000-00-00" 
    };
  } else {
    // Clasificar entre eventos pasados y futuros/programados
    const past = matches.filter((e) => e.date && e.date <= todayIso).sort((a, b) => b.date.localeCompare(a.date));
    const future = matches.filter((e) => e.date && e.date > todayIso).sort((a, b) => a.date.localeCompare(b.date));

    // Si hay un evento futuro, prima sobre el historial pasado para marcarlo como reciéntemente agendado
    const ref = future[0] || past[0];
    let status;

    if (future.length > 0) {
      status = "recent";
    } else if (past[0]) {
      const diffDays = Math.round((t - new Date(ref.date + "T00:00:00")) / 864e5);
      status = diffDays >= 730 ? "old" : diffDays >= 365 ? "mid" : "recent";
    } else {
      status = "never";
    }

    base = { 
      num: cleanNum, 
      status, 
      date: ref ? ref.date : null, 
      speaker: ref ? (ref.speakerName || ref.title) : null, 
      place: ref ? ref.place : null, 
      sortKey: ref ? ref.date : "0000-00-00" 
    };
  }

  // Comprobar si está marcado manualmente como no disponible
  if (unavailableSet && (unavailableSet.has(cleanNum) || unavailableSet.has(Number(cleanNum)))) {
    base = { ...base, status: "unavailable" };
  }

  return base;
}

function relativeAge(dateStr) {
  if (!dateStr) return "";
  const t = todayMidnight();
  const d = new Date(dateStr + "T00:00:00");
  const diffDays = Math.round((t - d) / 864e5);
  const future = diffDays < 0;
  const abs = Math.abs(diffDays);
  const years = Math.floor(abs / 365);
  const months = Math.floor((abs % 365) / 30);
  let text;
  if (years > 0) text = `${years} año${years > 1 ? "s" : ""}${months > 0 ? ` y ${months} mes${months > 1 ? "es" : ""}` : ""}`;
  else if (months > 0) text = `${months} mes${months > 1 ? "es" : ""}`;
  else text = `${abs} día${abs !== 1 ? "s" : ""}`;
  return future ? `dentro de ${text}` : `hace ${text}`;
}

function BosquejosView({ events, raw, setRaw, unavailable, setUnavailable, bosquejoTitles, setBosquejoTitles, dbExpanded, setDbExpanded }) {
  const [newUnavailable, setNewUnavailable] = useState("");
  const [dbSearch, setDbSearch] = useState("");
  const dbNums = useMemo(() => Array.from({ length: 194 }, (_, i) => String(i + 1)), []);
  const dbFiltered = dbSearch.trim() ? dbNums.filter((n) => n === dbSearch.trim() || (bosquejoTitles[n] || "").toLowerCase().includes(dbSearch.trim().toLowerCase())) : dbNums;
  const unavailableSet = useMemo(() => new Set(unavailable.map(String)), [unavailable]);

  const addUnavailable = () => {
    const n = newUnavailable.trim();
    if (!n) return;
    if (!unavailable.includes(n)) setUnavailable([...unavailable, n]);
    setNewUnavailable("");
  };

  const removeUnavailable = (n) => setUnavailable(unavailable.filter((x) => String(x) !== String(n)));

  const results = useMemo(() => {
    const rawMatches = raw.match(/\d+/g) || [];
    const uniqueNums = [...new Set(rawMatches.map(n => String(Number(n))))];

    return uniqueNums
      .map((n) => analyzeBosquejo(n, events, unavailableSet))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [raw, events, unavailableSet]);

  return React.createElement("div", null, 
    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-[minmax(0,33%)_320px] gap-3 mb-4" }, 
      React.createElement("div", { className: "rounded-xl border p-4", style: { borderColor: COLORS.line, background: COLORS.surface } }, 
        React.createElement(Field, { label: "Números de discurso (separados por espacios o comas)" }, 
          React.createElement("textarea", {
            value: raw,
            onChange: (e) => setRaw(e.target.value),
            rows: 2,
            className: "ipt",
            placeholder: "Ej: 12, 45 67 103, 88"
          })
        ), 
        React.createElement("div", { className: "flex flex-wrap gap-3 mt-3 text-[11px]" }, 
          ["never", "old", "mid", "recent", "unavailable"].map((k) => 
            React.createElement("span", { key: k, className: "flex items-center gap-1.5" }, 
              React.createElement("span", { className: "w-2.5 h-2.5 rounded-full flex-shrink-0", style: { background: BOSQUEJO_COLORS[k] } }), 
              React.createElement("span", { style: { color: COLORS.inkSoft } }, BOSQUEJO_LABELS[k])
            )
          )
        )
      ), 
      React.createElement("div", { className: "rounded-xl border p-4", style: { borderColor: COLORS.line, background: COLORS.surface } }, 
        React.createElement("span", { className: "text-[11px] font-medium block mb-2", style: { color: COLORS.inkSoft } }, "Bosquejos no disponibles"), 
        React.createElement("div", { className: "flex flex-wrap gap-1.5 mb-2" }, 
          unavailable.map((n) => 
            React.createElement("span", { key: n, className: "flex items-center gap-1 text-[11px] font-mono pl-2.5 pr-1 py-1 rounded-full", style: { background: BOSQUEJO_COLORS.unavailable + "22", color: BOSQUEJO_COLORS.unavailable } }, 
              n, 
              React.createElement("button", { onClick: () => removeUnavailable(n), className: "rounded-full p-0.5 hover:bg-black/10", title: "Eliminar" }, 
                React.createElement(X, { size: 10 })
              )
            )
          ), 
          unavailable.length === 0 && React.createElement("span", { className: "text-xs", style: { color: COLORS.inkSoft } }, "Ninguno marcado.")
        ), 
        React.createElement("div", { className: "flex gap-2" }, 
          React.createElement("input", {
            value: newUnavailable,
            onChange: (e) => setNewUnavailable(e.target.value.replace(/[^0-9]/g, "")),
            onKeyDown: (e) => { if (e.key === "Enter") addUnavailable(); },
            inputMode: "numeric",
            placeholder: "Nº de bosquejo",
            className: "ipt text-xs"
          }), 
          React.createElement("button", { onClick: addUnavailable, className: "px-3 rounded-md text-xs font-medium flex-shrink-0", style: { background: BOSQUEJO_COLORS.unavailable + "22", color: BOSQUEJO_COLORS.unavailable } }, "Añadir")
        )
      )
    ), 
    results.length === 0 ? React.createElement("div", { className: "rounded-xl border p-8 text-center text-sm", style: { borderColor: COLORS.line, color: COLORS.inkSoft } }, "Escribe uno o varios números de discurso para consultar cuándo se dieron por última vez.") : React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5" }, 
      results.map((r) => 
        React.createElement("div", { key: r.num, className: "rounded-xl border p-3.5", style: { borderColor: COLORS.line, background: COLORS.surface, borderLeft: `4px solid ${BOSQUEJO_COLORS[r.status]}` } }, 
          React.createElement("div", { className: "flex items-center justify-between mb-1" }, 
            React.createElement("span", { className: "text-lg font-semibold", style: { fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink } }, "nº ", r.num), 
            React.createElement("span", { className: "text-[10px] px-2 py-0.5 rounded-full font-medium", style: { background: BOSQUEJO_COLORS[r.status] + "22", color: BOSQUEJO_COLORS[r.status] } }, BOSQUEJO_LABELS[r.status])
          ), 
          bosquejoTitles?.[r.num] && React.createElement("div", { className: "text-[11px] italic mb-1", style: { color: COLORS.inkSoft } }, bosquejoTitles[r.num]), 
          r.status === "unavailable" ? React.createElement("div", { className: "text-xs", style: { color: COLORS.inkSoft } }, "Marcado manualmente como no disponible.") : r.date ? React.createElement(React.Fragment, null, 
            React.createElement("div", { className: "text-xs", style: { color: COLORS.ink } }, r.speaker), 
            React.createElement("div", { className: "text-[11px]", style: { color: COLORS.inkSoft } }, formatDate(r.date), " · ", relativeAge(r.date)), 
            React.createElement("div", { className: "text-[11px] flex items-center gap-1 mt-0.5", style: { color: COLORS.inkSoft } }, 
              React.createElement(MapPin, { size: 10 }), " ", r.place
            )
          ) : React.createElement("div", { className: "text-xs", style: { color: COLORS.inkSoft } }, "Ningún visitante lo ha dado todavía.")
        )
      )
    ), 
    React.createElement("div", {
      className: "rounded-xl border cursor-pointer mt-6",
      onClick: () => setDbExpanded((e) => !e),
      style: { borderColor: COLORS.line, background: COLORS.surface }
    }, 
      React.createElement("div", { className: "p-4 flex items-center justify-between flex-wrap gap-3" }, 
        React.createElement("div", null, 
          React.createElement("div", { className: "text-sm font-medium", style: { color: COLORS.ink } }, "Base de datos de bosquejos"), 
          React.createElement("div", { className: "text-xs", style: { color: COLORS.inkSoft } }, "Asocia un título a cada número (1-194) para que se autocomplete en eventos e invitaciones.")
        ), 
        React.createElement(ChevronRight, { size: 18, style: { color: COLORS.inkSoft, flexShrink: 0, transform: dbExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s ease" } })
      )
    ), 
    React.createElement("div", { className: "expand-wrap " + (dbExpanded ? "sd-expanded" : "sd-collapsed") }, 
      React.createElement("div", { className: "rounded-xl border p-4 mt-2.5", style: { borderColor: COLORS.line, background: COLORS.surface }, onClick: (e) => e.stopPropagation() }, 
        React.createElement("div", { className: "flex items-center gap-2 px-2 py-1.5 rounded-lg mb-3", style: { background: COLORS.bg, border: `1px solid ${COLORS.line}` } }, 
          React.createElement(Search, { size: 14, style: { color: COLORS.inkSoft } }), 
          React.createElement("input", {
            value: dbSearch,
            onChange: (e) => setDbSearch(e.target.value),
            placeholder: "Buscar por número o título…",
            className: "bg-transparent text-sm outline-none flex-1"
          })
        ), 
        React.createElement("div", { className: "space-y-1.5 overflow-y-auto", style: { maxHeight: 900 } }, 
          dbFiltered.map((n) => 
            React.createElement("div", { key: n, className: "flex items-center gap-2" }, 
              React.createElement("span", { className: "text-xs font-mono flex-shrink-0", style: { width: 34, color: COLORS.teal, fontWeight: 600 } }, n), 
              React.createElement("input", {
                value: bosquejoTitles[n] || "",
                onChange: (e) => setBosquejoTitles((prev) => ({ ...prev, [n]: e.target.value })),
                placeholder: "Título del bosquejo…",
                className: "ipt text-xs"
              })
            )
          ), 
          dbFiltered.length === 0 && React.createElement("div", { className: "text-xs text-center py-6", style: { color: COLORS.inkSoft } }, "Sin coincidencias.")
        )
      )
    )
  );
}