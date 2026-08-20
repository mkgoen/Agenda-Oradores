/* ---------------------------------------------------------------
   Reminders panel
----------------------------------------------------------------*/
/* ---------------------------------------------------------------
   Agendar bosquejos
----------------------------------------------------------------*/
const BOSQUEJO_COLORS = {
  never: "#2E6FBA",     // azul: nunca usado
  old: "#2F8F4E",        // verde: más de 2 años
  mid: "#D4B106",        // amarillo: entre 1 y 2 años
  recent: "#B0453B",     // rojo: menos de 1 año (o ya programado a futuro)
  unavailable: "#5C3A21", // marrón oscuro: marcado manualmente como no disponible
};
const BOSQUEJO_LABELS = {
  never: "Nunca usado", old: "Hace más de 2 años", mid: "Entre 1 y 2 años", recent: "Menos de 1 año o futuro",
  unavailable: "Bosquejo no disponible",
};

function analyzeBosquejo(num, events, unavailableSet) {
  const matches = events.filter(ev => ev.type === "visita" && String(ev.speechNumber || "").trim() === num);
  const t = todayMidnight();
  const todayIso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;

  let base;
  if (matches.length === 0) {
    base = { num, status: "never", date: null, speaker: null, place: null, sortKey: "0000-00-00" };
  } else {
    const past = matches.filter(e => e.date && e.date <= todayIso).sort((a, b) => b.date.localeCompare(a.date));
    const future = matches.filter(e => e.date && e.date > todayIso).sort((a, b) => a.date.localeCompare(b.date));
    const ref = past[0] || future[0];
    let status;
    if (past[0]) {
      const diffDays = Math.round((t - new Date(ref.date + "T00:00:00")) / 86400000);
      status = diffDays >= 730 ? "old" : diffDays >= 365 ? "mid" : "recent";
    } else {
      status = "recent"; // ya programado a futuro: evitar reutilizarlo
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
  const d = new Date(dateStr + "T00:00:00");
  const diffDays = Math.round((t - d) / 86400000);
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
  const dbFiltered = dbSearch.trim()
    ? dbNums.filter(n => n === dbSearch.trim() || (bosquejoTitles[n] || "").toLowerCase().includes(dbSearch.trim().toLowerCase()))
    : dbNums;
  const unavailableSet = useMemo(() => new Set(unavailable), [unavailable]);

  const addUnavailable = () => {
    const n = newUnavailable.trim();
    if (!n) return;
    if (!unavailable.includes(n)) setUnavailable([...unavailable, n]);
    setNewUnavailable("");
  };
  const removeUnavailable = (n) => setUnavailable(unavailable.filter(x => x !== n));

  const results = useMemo(() => {
    const nums = raw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
      .map(s => (s.match(/\d+/) || [s])[0]);
    const unique = [...new Set(nums)];
    return unique.map(n => analyzeBosquejo(n, events, unavailableSet)).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [raw, events, unavailableSet]);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 mb-4">
        <div className="rounded-xl border p-4" style={{ borderColor: COLORS.line, background: COLORS.surface }}>
          <Field label="Números de discurso (separados por espacios o comas)">
            <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={2} className="ipt"
              placeholder="Ej: 12, 45 67 103, 88" />
          </Field>
          <div className="flex flex-wrap gap-3 mt-3 text-[11px]">
            {["never", "old", "mid", "recent", "unavailable"].map(k => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: BOSQUEJO_COLORS[k] }} />
                <span style={{ color: COLORS.inkSoft }}>{BOSQUEJO_LABELS[k]}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: COLORS.line, background: COLORS.surface }}>
          <span className="text-[11px] font-medium block mb-2" style={{ color: COLORS.inkSoft }}>Bosquejos no disponibles</span>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {unavailable.map(n => (
              <span key={n} className="flex items-center gap-1 text-[11px] font-mono pl-2.5 pr-1 py-1 rounded-full" style={{ background: BOSQUEJO_COLORS.unavailable + "22", color: BOSQUEJO_COLORS.unavailable }}>
                {n}
                <button onClick={() => removeUnavailable(n)} className="rounded-full p-0.5 hover:bg-black/10" title="Eliminar">
                  <X size={10} />
                </button>
              </span>
            ))}
            {unavailable.length === 0 && <span className="text-xs" style={{ color: COLORS.inkSoft }}>Ninguno marcado.</span>}
          </div>
          <div className="flex gap-2">
            <input value={newUnavailable} onChange={e => setNewUnavailable(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={e => { if (e.key === "Enter") addUnavailable(); }}
              inputMode="numeric" placeholder="Nº de bosquejo" className="ipt text-xs" />
            <button onClick={addUnavailable} className="px-3 rounded-md text-xs font-medium flex-shrink-0" style={{ background: BOSQUEJO_COLORS.unavailable + "22", color: BOSQUEJO_COLORS.unavailable }}>
              Añadir
            </button>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm" style={{ borderColor: COLORS.line, color: COLORS.inkSoft }}>
          Escribe uno o varios números de discurso para consultar cuándo se dieron por última vez.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {results.map(r => (
            <div key={r.num} className="rounded-xl border p-3.5" style={{ borderColor: COLORS.line, background: COLORS.surface, borderLeft: `4px solid ${BOSQUEJO_COLORS[r.status]}` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-semibold" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>nº {r.num}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: BOSQUEJO_COLORS[r.status] + "22", color: BOSQUEJO_COLORS[r.status] }}>
                  {BOSQUEJO_LABELS[r.status]}
                </span>
              </div>
              {bosquejoTitles?.[r.num] && (
                <div className="text-[11px] italic mb-1" style={{ color: COLORS.inkSoft }}>{bosquejoTitles[r.num]}</div>
              )}
              {r.status === "unavailable" ? (
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>Marcado manualmente como no disponible.</div>
              ) : r.date ? (
                <>
                  <div className="text-xs" style={{ color: COLORS.ink }}>{r.speaker}</div>
                  <div className="text-[11px]" style={{ color: COLORS.inkSoft }}>{formatDate(r.date)} · {relativeAge(r.date)}</div>
                  <div className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: COLORS.inkSoft }}>
                    <MapPin size={10} /> {r.place}
                  </div>
                </>
              ) : (
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>Ningún visitante lo ha dado todavía.</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border cursor-pointer mt-6" onClick={() => setDbExpanded(e => !e)}
        style={{ borderColor: COLORS.line, background: COLORS.surface }}>
        <div className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-medium" style={{ color: COLORS.ink }}>Base de datos de bosquejos</div>
            <div className="text-xs" style={{ color: COLORS.inkSoft }}>
              Asocia un título a cada número (1-194) para que se autocomplete en eventos e invitaciones.
            </div>
          </div>
          <ChevronRight size={18} style={{ color: COLORS.inkSoft, flexShrink: 0, transform: dbExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }} />
        </div>
      </div>

      <div className={"expand-wrap " + (dbExpanded ? "sd-expanded" : "sd-collapsed")}>
        <div className="rounded-xl border p-4 mt-2.5" style={{ borderColor: COLORS.line, background: COLORS.surface }} onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-3" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
            <Search size={14} style={{ color: COLORS.inkSoft }} />
            <input value={dbSearch} onChange={e => setDbSearch(e.target.value)} placeholder="Buscar por número o título…"
              className="bg-transparent text-sm outline-none flex-1" />
          </div>
          <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 900 }}>
            {dbFiltered.map(n => (
              <div key={n} className="flex items-center gap-2">
                <span className="text-xs font-mono flex-shrink-0" style={{ width: 34, color: COLORS.teal, fontWeight: 600 }}>{n}</span>
                <input value={bosquejoTitles[n] || ""} onChange={e => setBosquejoTitles(prev => ({ ...prev, [n]: e.target.value }))}
                  placeholder="Título del bosquejo…" className="ipt text-xs" />
              </div>
            ))}
            {dbFiltered.length === 0 && (
              <div className="text-xs text-center py-6" style={{ color: COLORS.inkSoft }}>Sin coincidencias.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
