function EventModal({ initial, prefillDate, defaultType, speakers, events, statuses, unavailableBosquejos, bosquejoTitles, onClose, onSave, onDelete, onAddStatus, onDeleteStatus }) {
  const [form, setForm] = useState(() => initial ? { ...initial } : {
    date: prefillDate || "",
    place: "",
    title: "",
    speechNumber: "",
    phone: "",
    coordinator: "",
    type: defaultType || "visita",
    speakerName: "",
    status: statuses[0].name,
    notes: ""
  });
  const [newStatus, setNewStatus] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [speakerDropdownOpen, setSpeakerDropdownOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const warnings = useMemo(() => computeWarnings(form, events, speakers, initial?.id, unavailableBosquejos), [form, events, speakers, initial, unavailableBosquejos]);
  const matchingSpeakers = speakers.filter((s) => s.name.toLowerCase().includes((form.speakerName || "").toLowerCase()) && form.speakerName);
  const suggestions = matchingSpeakers.slice(0, 8);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    const n = String(form.speechNumber || "").trim();
    if (n && bosquejoTitles && bosquejoTitles[n] && !form.title) {
      set("title", bosquejoTitles[n]);
    }
  }, [form.speechNumber]);
  const handleDeleteStatus = (name) => {
    if (statuses.length <= 1) return;
    onDeleteStatus(name);
    if (form.status === name) {
      const remaining = statuses.filter((s) => s.name !== name);
      if (remaining[0]) set("status", remaining[0].name);
    }
  };
  const handleSaveClick = () => {
    if (warnings.length > 0) {
      setConfirmOpen(true);
      return;
    }
    onSave(form);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: { background: "rgba(20,20,15,0.45)" } }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-lg rounded-2xl shadow-xl flex flex-col relative", style: { background: COLORS.surface, maxHeight: "min(90vh, 720px)" } }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b flex-shrink-0", style: { borderColor: COLORS.line } }, /* @__PURE__ */ React.createElement("span", { className: "text-base font-semibold", style: { fontFamily: "Fraunces, serif" } }, initial ? "Editar evento" : "Nuevo evento"), /* @__PURE__ */ React.createElement("button", { onClick: onClose }, /* @__PURE__ */ React.createElement(X, { size: 18, style: { color: COLORS.inkSoft } }))), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-3 overflow-y-auto flex-1 min-h-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, ["visita", "salida", "evento"].map((t) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: t,
      onClick: () => set("type", t),
      className: "flex-1 py-2 rounded-lg text-xs font-medium border transition",
      style: {
        borderColor: form.type === t ? COLORS.teal : COLORS.line,
        background: form.type === t ? COLORS.tealSoft : "transparent",
        color: form.type === t ? COLORS.teal : COLORS.inkSoft
      }
    },
    t === "visita" ? "Visita" : t === "salida" ? "Salida" : "Evento"
  ))), /* @__PURE__ */ React.createElement(Field, { label: "Fecha" }, /* @__PURE__ */ React.createElement("input", { type: "date", value: form.date, onChange: (e) => set("date", e.target.value), className: "ipt" })), form.type === "evento" ? /* @__PURE__ */ React.createElement(Field, { label: "Nombre" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: form.speakerName,
      onChange: (e) => {
        set("speakerName", e.target.value);
        setSpeakerDropdownOpen(true);
        setHighlightIndex(-1);
      },
      onFocus: () => {
        if (suggestions.length > 0) setSpeakerDropdownOpen(true);
      },
      onBlur: () => setTimeout(() => setSpeakerDropdownOpen(false), 120),
      onKeyDown: (e) => {
        if (!speakerDropdownOpen && (e.key === "ArrowDown" || e.key === "ArrowUp") && suggestions.length > 0) {
          e.preventDefault();
          setSpeakerDropdownOpen(true);
          setHighlightIndex(0);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
          if (speakerDropdownOpen && highlightIndex >= 0 && suggestions[highlightIndex]) {
            e.preventDefault();
            set("speakerName", suggestions[highlightIndex].name);
            setSpeakerDropdownOpen(false);
            setHighlightIndex(-1);
          }
        } else if (e.key === "Escape") {
          setSpeakerDropdownOpen(false);
        }
      },
      className: "ipt",
      placeholder: "Nombre",
      autoComplete: "off"
    }
  ), speakerDropdownOpen && suggestions.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "absolute left-0 right-0 mt-1 rounded-lg border shadow-lg overflow-hidden z-20", style: { borderColor: COLORS.line, background: COLORS.surface } }, suggestions.map((s, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: s.id,
      type: "button",
      onMouseDown: (e) => e.preventDefault(),
      onClick: () => {
        set("speakerName", s.name);
        setSpeakerDropdownOpen(false);
        setHighlightIndex(-1);
      },
      className: "w-full text-left px-3 py-1.5 text-xs",
      style: { background: i === highlightIndex ? COLORS.tealSoft : "transparent", color: COLORS.ink }
    },
    s.name,
    " ",
    /* @__PURE__ */ React.createElement("span", { style: { color: COLORS.inkSoft } }, "\xB7 ", s.origin)
  ))))) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement(Field, { label: "Orador" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: form.speakerName,
      onChange: (e) => {
        set("speakerName", e.target.value);
        setSpeakerDropdownOpen(true);
        setHighlightIndex(-1);
      },
      onFocus: () => {
        if (suggestions.length > 0) setSpeakerDropdownOpen(true);
      },
      onBlur: () => setTimeout(() => setSpeakerDropdownOpen(false), 120),
      onKeyDown: (e) => {
        if (!speakerDropdownOpen && (e.key === "ArrowDown" || e.key === "ArrowUp") && suggestions.length > 0) {
          e.preventDefault();
          setSpeakerDropdownOpen(true);
          setHighlightIndex(0);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
          if (speakerDropdownOpen && highlightIndex >= 0 && suggestions[highlightIndex]) {
            e.preventDefault();
            set("speakerName", suggestions[highlightIndex].name);
            setSpeakerDropdownOpen(false);
            setHighlightIndex(-1);
          }
        } else if (e.key === "Escape") {
          setSpeakerDropdownOpen(false);
        }
      },
      className: "ipt",
      placeholder: "Nombre del orador",
      autoComplete: "off"
    }
  ), speakerDropdownOpen && suggestions.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "absolute left-0 right-0 mt-1 rounded-lg border shadow-lg overflow-hidden z-20", style: { borderColor: COLORS.line, background: COLORS.surface } }, suggestions.map((s, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: s.id,
      type: "button",
      onMouseDown: (e) => e.preventDefault(),
      onClick: () => {
        set("speakerName", s.name);
        setSpeakerDropdownOpen(false);
        setHighlightIndex(-1);
      },
      className: "w-full text-left px-3 py-1.5 text-xs",
      style: { background: i === highlightIndex ? COLORS.tealSoft : "transparent", color: COLORS.ink }
    },
    s.name,
    " ",
    /* @__PURE__ */ React.createElement("span", { style: { color: COLORS.inkSoft } }, "\xB7 ", s.origin)
  ))))), /* @__PURE__ */ React.createElement(Field, { label: form.type === "visita" ? "Lugar de origen del orador" : "Lugar de destino" }, /* @__PURE__ */ React.createElement("input", { value: form.place, onChange: (e) => set("place", e.target.value), className: "ipt", placeholder: "Congregaci\xF3n / sal\xF3n" }))), /* @__PURE__ */ React.createElement(Field, { label: "T\xEDtulo del discurso" }, /* @__PURE__ */ React.createElement("input", { value: form.title, onChange: (e) => set("title", e.target.value), className: "ipt" })), form.type !== "evento" && /* @__PURE__ */ React.createElement(Field, { label: "N\xBA de discurso" }, /* @__PURE__ */ React.createElement("input", { value: form.speechNumber, onChange: (e) => set("speechNumber", e.target.value), className: "ipt" })), form.type !== "evento" && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement(Field, { label: "Tel\xE9fono" }, /* @__PURE__ */ React.createElement("input", { value: form.phone, onChange: (e) => set("phone", e.target.value), className: "ipt" })), /* @__PURE__ */ React.createElement(Field, { label: "Coordinador" }, /* @__PURE__ */ React.createElement("input", { value: form.coordinator, onChange: (e) => set("coordinator", e.target.value), className: "ipt", placeholder: "Solo si aplica" }))), /* @__PURE__ */ React.createElement(Field, { label: "Estado" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 flex-wrap" }, /* @__PURE__ */ React.createElement("select", { value: form.status, onChange: (e) => set("status", e.target.value), className: "ipt flex-1" }, statuses.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.name, value: s.name }, s.name)))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 mt-2" }, statuses.map((s) => /* @__PURE__ */ React.createElement("span", { key: s.name, className: "flex items-center gap-1 text-[10px] pl-2 pr-1 py-1 rounded-full", style: { background: s.color + "1F", color: s.color } }, s.name, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleDeleteStatus(s.name),
      disabled: statuses.length <= 1,
      className: "rounded-full p-0.5 hover:bg-black/10 disabled:opacity-30",
      title: "Eliminar estado"
    },
    /* @__PURE__ */ React.createElement(X, { size: 9 })
  )))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 mt-1.5" }, /* @__PURE__ */ React.createElement("input", { value: newStatus, onChange: (e) => setNewStatus(e.target.value), placeholder: "A\xF1adir nuevo estado\u2026", className: "ipt text-xs" }), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (newStatus.trim()) {
          onAddStatus(newStatus.trim());
          set("status", newStatus.trim());
          setNewStatus("");
        }
      },
      className: "px-3 rounded-md text-xs font-medium",
      style: { background: COLORS.tealSoft, color: COLORS.teal }
    },
    "A\xF1adir"
  ))), /* @__PURE__ */ React.createElement(Field, { label: "Notas" }, /* @__PURE__ */ React.createElement("textarea", { value: form.notes, onChange: (e) => set("notes", e.target.value), className: "ipt", rows: 2 })), warnings.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, warnings.map((w) => /* @__PURE__ */ React.createElement("div", { key: w.key, className: "flex items-start gap-2 text-xs px-3 py-2 rounded-lg", style: { background: "#FBF0E4", color: "#8A5A1E" } }, /* @__PURE__ */ React.createElement(AlertTriangle, { size: 14, className: "mt-0.5 flex-shrink-0" }), /* @__PURE__ */ React.createElement("span", null, w.text))))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-t flex-shrink-0", style: { borderColor: COLORS.line } }, initial ? /* @__PURE__ */ React.createElement("button", { onClick: () => onDelete(initial.id), className: "flex items-center gap-1.5 text-sm", style: { color: "#B0453B" } }, /* @__PURE__ */ React.createElement(Trash2, { size: 15 }), " Eliminar") : /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("button", { onClick: handleSaveClick, className: "px-4 py-2 rounded-lg text-sm font-medium text-white", style: { background: COLORS.teal } }, "Guardar")), confirmOpen && /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 z-10 flex items-center justify-center p-5 rounded-2xl", style: { background: "rgba(20,20,15,0.55)" } }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-sm rounded-xl shadow-xl p-4", style: { background: COLORS.surface } }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React.createElement(AlertTriangle, { size: 18, style: { color: "#B9822E" } }), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold" }, "Antes de guardar\u2026")), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5 mb-4 max-h-56 overflow-y-auto" }, warnings.map((w) => /* @__PURE__ */ React.createElement("div", { key: w.key, className: "text-xs px-3 py-2 rounded-lg", style: { background: "#FBF0E4", color: "#8A5A1E" } }, w.text))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setConfirmOpen(false), className: "flex-1 py-2 rounded-lg text-sm font-medium border", style: { borderColor: COLORS.line, color: COLORS.inkSoft } }, "Revisar"), /* @__PURE__ */ React.createElement("button", { onClick: () => onSave(form), className: "flex-1 py-2 rounded-lg text-sm font-medium text-white", style: { background: "#B9822E" } }, "Guardar de todas formas"))))));
}
function Field({ label, children }) {
  return /* @__PURE__ */ React.createElement("label", { className: "block" }, /* @__PURE__ */ React.createElement("span", { className: "block text-[11px] font-medium mb-1", style: { color: COLORS.inkSoft } }, label), children);
}
