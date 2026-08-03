/* ---------------------------------------------------------------
   Event modal
----------------------------------------------------------------*/
function EventModal({ initial, prefillDate, defaultType, speakers, events, statuses, unavailableBosquejos, onClose, onSave, onDelete, onAddStatus, onDeleteStatus }) {
  const [form, setForm] = useState(() => initial ? { ...initial } : {
    date: prefillDate || "", place: "", title: "", speechNumber: "", phone: "",
    coordinator: "", type: defaultType || "visita", speakerName: "", status: statuses[0].name, notes: "",
  });
  const [newStatus, setNewStatus] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [speakerDropdownOpen, setSpeakerDropdownOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const warnings = useMemo(() => computeWarnings(form, events, speakers, initial?.id, unavailableBosquejos), [form, events, speakers, initial, unavailableBosquejos]);
  const matchingSpeakers = speakers.filter(s => s.name.toLowerCase().includes((form.speakerName || "").toLowerCase()) && form.speakerName);
  const suggestions = matchingSpeakers.slice(0, 8);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDeleteStatus = (name) => {
    if (statuses.length <= 1) return;
    onDeleteStatus(name);
    if (form.status === name) {
      const remaining = statuses.filter(s => s.name !== name);
      if (remaining[0]) set("status", remaining[0].name);
    }
  };

  const handleSaveClick = () => {
    if (warnings.length > 0) { setConfirmOpen(true); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,20,15,0.45)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-xl flex flex-col relative" style={{ background: COLORS.surface, maxHeight: "min(90vh, 720px)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: COLORS.line }}>
          <span className="text-base font-semibold" style={{ fontFamily: "Fraunces, serif" }}>
            {initial ? "Editar evento" : "Nuevo evento"}
          </span>
          <button onClick={onClose}><X size={18} style={{ color: COLORS.inkSoft }} /></button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto flex-1 min-h-0">
          <div className="flex gap-2">
            {["visita", "salida"].map(t => (
              <button key={t} onClick={() => set("type", t)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition"
                style={{
                  borderColor: form.type === t ? COLORS.teal : COLORS.line,
                  background: form.type === t ? COLORS.tealSoft : "transparent",
                  color: form.type === t ? COLORS.teal : COLORS.inkSoft,
                }}>
                {t === "visita" ? "Visita (orador de otro lugar)" : "Salida (orador local)"}
              </button>
            ))}
          </div>

          <Field label="Fecha">
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="ipt" />
          </Field>

          <Field label={form.type === "visita" ? "Lugar de origen del orador" : "Lugar de destino"}>
            <input value={form.place} onChange={e => set("place", e.target.value)} className="ipt" placeholder="Congregación / salón" />
          </Field>

          <Field label="Orador">
            <div className="relative">
              <input
                value={form.speakerName}
                onChange={e => { set("speakerName", e.target.value); setSpeakerDropdownOpen(true); setHighlightIndex(-1); }}
                onFocus={() => { if (suggestions.length > 0) setSpeakerDropdownOpen(true); }}
                onBlur={() => setTimeout(() => setSpeakerDropdownOpen(false), 120)}
                onKeyDown={e => {
                  if (!speakerDropdownOpen && (e.key === "ArrowDown" || e.key === "ArrowUp") && suggestions.length > 0) {
                    e.preventDefault(); setSpeakerDropdownOpen(true); setHighlightIndex(0); return;
                  }
                  if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIndex(i => Math.min(i + 1, suggestions.length - 1)); }
                  else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIndex(i => Math.max(i - 1, 0)); }
                  else if (e.key === "Enter") {
                    if (speakerDropdownOpen && highlightIndex >= 0 && suggestions[highlightIndex]) {
                      e.preventDefault();
                      set("speakerName", suggestions[highlightIndex].name);
                      setSpeakerDropdownOpen(false); setHighlightIndex(-1);
                    }
                  } else if (e.key === "Escape") { setSpeakerDropdownOpen(false); }
                }}
                className="ipt" placeholder="Nombre del orador" autoComplete="off"
              />
              {speakerDropdownOpen && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 rounded-lg border shadow-lg overflow-hidden z-20" style={{ borderColor: COLORS.line, background: COLORS.surface }}>
                  {suggestions.map((s, i) => (
                    <button key={s.id} type="button"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => { set("speakerName", s.name); setSpeakerDropdownOpen(false); setHighlightIndex(-1); }}
                      className="w-full text-left px-3 py-1.5 text-xs"
                      style={{ background: i === highlightIndex ? COLORS.tealSoft : "transparent", color: COLORS.ink }}>
                      {s.name} <span style={{ color: COLORS.inkSoft }}>· {s.origin}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Título del discurso">
              <input value={form.title} onChange={e => set("title", e.target.value)} className="ipt" />
            </Field>
            <Field label="Nº de discurso">
              <input value={form.speechNumber} onChange={e => set("speechNumber", e.target.value)} className="ipt" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono">
              <input value={form.phone} onChange={e => set("phone", e.target.value)} className="ipt" />
            </Field>
            <Field label="Coordinador">
              <input value={form.coordinator} onChange={e => set("coordinator", e.target.value)} className="ipt" placeholder="Solo si aplica" />
            </Field>
          </div>

          <Field label="Estado">
            <div className="flex gap-2 flex-wrap">
              <select value={form.status} onChange={e => set("status", e.target.value)} className="ipt flex-1">
                {statuses.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {statuses.map(s => (
                <span key={s.name} className="flex items-center gap-1 text-[10px] pl-2 pr-1 py-1 rounded-full" style={{ background: s.color + "1F", color: s.color }}>
                  {s.name}
                  <button onClick={() => handleDeleteStatus(s.name)} disabled={statuses.length <= 1}
                    className="rounded-full p-0.5 hover:bg-black/10 disabled:opacity-30" title="Eliminar estado">
                    <X size={9} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-1.5">
              <input value={newStatus} onChange={e => setNewStatus(e.target.value)} placeholder="Añadir nuevo estado…" className="ipt text-xs" />
              <button onClick={() => { if (newStatus.trim()) { onAddStatus(newStatus.trim()); set("status", newStatus.trim()); setNewStatus(""); } }}
                className="px-3 rounded-md text-xs font-medium" style={{ background: COLORS.tealSoft, color: COLORS.teal }}>
                Añadir
              </button>
            </div>
          </Field>

          <Field label="Notas">
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} className="ipt" rows={2} />
          </Field>

          {warnings.length > 0 && (
            <div className="space-y-1.5">
              {warnings.map(w => (
                <div key={w.key} className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: "#FBF0E4", color: "#8A5A1E" }}>
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{w.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t flex-shrink-0" style={{ borderColor: COLORS.line }}>
          {initial
            ? <button onClick={() => onDelete(initial.id)} className="flex items-center gap-1.5 text-sm" style={{ color: "#B0453B" }}>
                <Trash2 size={15} /> Eliminar
              </button>
            : <span />}
          <button onClick={handleSaveClick} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: COLORS.teal }}>
            Guardar
          </button>
        </div>

        {confirmOpen && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-5 rounded-2xl" style={{ background: "rgba(20,20,15,0.55)" }}>
            <div className="w-full max-w-sm rounded-xl shadow-xl p-4" style={{ background: COLORS.surface }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} style={{ color: "#B9822E" }} />
                <span className="text-sm font-semibold">Antes de guardar…</span>
              </div>
              <div className="space-y-1.5 mb-4 max-h-56 overflow-y-auto">
                {warnings.map(w => (
                  <div key={w.key} className="text-xs px-3 py-2 rounded-lg" style={{ background: "#FBF0E4", color: "#8A5A1E" }}>
                    {w.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmOpen(false)} className="flex-1 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: COLORS.line, color: COLORS.inkSoft }}>
                  Revisar
                </button>
                <button onClick={() => onSave(form)} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "#B9822E" }}>
                  Guardar de todas formas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium mb-1" style={{ color: COLORS.inkSoft }}>{label}</span>
      {children}
    </label>
  );
}

