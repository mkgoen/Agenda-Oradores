function SpeakersView({
  speakers, setSpeakers, events, statusColor, onEventClick,
  search, setSearch, selectedId, setSelectedId, blockYear, setBlockYear, sortMode, setSortMode, sortDir, setSortDir,
}) {
  const search_ = search.toLowerCase();
  const matches = (s) => s.name.toLowerCase().includes(search_) || s.origin.toLowerCase().includes(search_);
  const visitorList = speakers.filter(s => !s.isLocal && matches(s));
  const localList = speakers.filter(s => s.isLocal && matches(s));
  const visitorGroups = groupAndSortSpeakers(visitorList, events, sortMode, sortDir);
  const localGroups = groupAndSortSpeakers(localList, events, sortMode, sortDir);
  const selected = speakers.find(s => s.id === selectedId);
  const history = selected ? events.filter(ev => ev.speakerId === selected.id).sort((a, b) => b.date.localeCompare(a.date)) : [];

  const updateSelected = (patch) => setSpeakers(ss => ss.map(s => s.id === selectedId ? { ...s, ...patch } : s));

  const [newBosquejo, setNewBosquejo] = useState("");
  const addBosquejoNum = () => {
    const n = newBosquejo.trim();
    if (!n) return;
    const current = selected.bosquejos || [];
    if (!current.includes(n)) updateSelected({ bosquejos: [...current, n] });
    setNewBosquejo("");
  };
  const removeBosquejoNum = (n) => updateSelected({ bosquejos: (selected.bosquejos || []).filter(x => x !== n) });

  const toggleMonth = (m) => {
    const key = `${blockYear}-${String(m + 1).padStart(2, "0")}`;
    const has = selected.blockedMonths.includes(key);
    updateSelected({ blockedMonths: has ? selected.blockedMonths.filter(x => x !== key) : [...selected.blockedMonths, key] });
  };

  const cardClick = (id) => setSelectedId(prev => prev === id ? null : id);

  const speakerCard = (s) => (
    <button key={s.id} onClick={() => cardClick(s.id)}
      className="text-left px-3 py-2.5 rounded-xl border flex items-center justify-between transition"
      style={{
        borderColor: s.id === selectedId ? COLORS.teal : COLORS.line,
        background: s.id === selectedId ? COLORS.tealSoft : COLORS.surface,
      }}>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{s.name}</div>
        <div className="text-[11px] truncate" style={{ color: COLORS.inkSoft }}>{s.origin}</div>
      </div>
      {s.isLocal && <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ml-2" style={{ background: COLORS.teal, color: "white" }}>Local</span>}
    </button>
  );

  const speakerDetail = () => (
    <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: COLORS.teal, background: COLORS.surface, gridColumn: "1 / -1" }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ fontFamily: "Fraunces, serif" }}>{selected.name}</span>
        <button onClick={() => setSelectedId(null)} className="p-1 rounded-full hover:bg-black/5">
          <X size={16} style={{ color: COLORS.inkSoft }} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nombre">
          <input value={selected.name} onChange={e => updateSelected({ name: e.target.value })} className="ipt" />
        </Field>
        <Field label="Teléfono">
          <input value={selected.phone} onChange={e => updateSelected({ phone: e.target.value })} className="ipt" />
        </Field>
        <Field label="Lugar de origen">
          <input value={selected.origin} onChange={e => updateSelected({ origin: e.target.value })} className="ipt" disabled={selected.isLocal} />
        </Field>
        <Field label="Tipo">
          <select value={selected.isLocal ? "local" : "visitante"} onChange={e => updateSelected({ isLocal: e.target.value === "local" })} className="ipt">
            <option value="local">Orador local</option>
            <option value="visitante">Orador visitante</option>
          </select>
        </Field>
      </div>

      {selected.isLocal && (
        <div>
          <span className="text-[11px] font-medium block mb-2" style={{ color: COLORS.inkSoft }}>Bosquejos que dispone</span>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(selected.bosquejos || []).map(n => (
              <span key={n} className="flex items-center gap-1 text-[11px] font-mono pl-2.5 pr-1 py-1 rounded-full" style={{ background: COLORS.tealSoft, color: COLORS.teal }}>
                {n}
                <button onClick={() => removeBosquejoNum(n)} className="rounded-full p-0.5 hover:bg-black/10" title="Eliminar">
                  <X size={10} />
                </button>
              </span>
            ))}
            {(selected.bosquejos || []).length === 0 && (
              <span className="text-xs" style={{ color: COLORS.inkSoft }}>Sin bosquejos añadidos todavía.</span>
            )}
          </div>
          <div className="flex gap-2">
            <input value={newBosquejo} onChange={e => setNewBosquejo(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={e => { if (e.key === "Enter") addBosquejoNum(); }}
              inputMode="numeric" placeholder="Nº de bosquejo" className="ipt text-xs" style={{ maxWidth: 140 }} />
            <button onClick={addBosquejoNum} className="px-3 rounded-md text-xs font-medium" style={{ background: COLORS.tealSoft, color: COLORS.teal }}>
              Añadir
            </button>
          </div>
        </div>
      )}

      {selected.isLocal && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium" style={{ color: COLORS.inkSoft }}>Meses libres (no invitar)</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setBlockYear(y => y - 1)} className="p-1 rounded-md hover:bg-black/5"><ChevronLeft size={18} /></button>
              <span className="text-xl font-semibold tabular-nums" style={{ fontFamily: "Fraunces, serif", color: COLORS.teal, minWidth: 64, textAlign: "center" }}>{blockYear}</span>
              <button onClick={() => setBlockYear(y => y + 1)} className="p-1 rounded-md hover:bg-black/5"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {MONTHS.map((m, mi) => {
              const key = `${blockYear}-${String(mi + 1).padStart(2, "0")}`;
              const active = selected.blockedMonths.includes(key);
              return (
                <button key={mi} onClick={() => toggleMonth(mi)}
                  className="text-[11px] py-1.5 rounded-md border"
                  style={{
                    borderColor: active ? "#B0453B" : COLORS.line,
                    background: active ? "#B0453B1A" : "transparent",
                    color: active ? "#B0453B" : COLORS.inkSoft,
                  }}>
                  {m.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <span className="text-[11px] font-medium block mb-2" style={{ color: COLORS.inkSoft }}>Historial de discursos</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-64 overflow-y-auto">
          {history.map(ev => (
            <button key={ev.id} onClick={() => onEventClick(ev)}
              className="text-left px-3 py-2 rounded-lg flex items-center justify-between border"
              style={{ borderColor: COLORS.line }}>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{ev.title} <span className="opacity-50">nº{ev.speechNumber}</span></div>
                <div className="text-[11px] flex items-center gap-1" style={{ color: COLORS.inkSoft }}>
                  <MapPin size={10} /> {ev.place} · {formatDate(ev.date)}
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ml-2" style={{ background: statusColor(ev.status) + "22", color: statusColor(ev.status) }}>
                {ev.status}
              </span>
            </button>
          ))}
          {history.length === 0 && <div className="text-xs" style={{ color: COLORS.inkSoft }}>Sin discursos registrados todavía.</div>}
        </div>
      </div>
    </div>
  );

  // Construye la cuadrícula intercalando: tarjeta de cada orador y, justo
  // después de la que esté seleccionada, el panel de detalle a ancho completo.
  const renderCards = (list) => list.map(s => (
    <React.Fragment key={s.id}>
      {speakerCard(s)}
      {s.id === selectedId && speakerDetail()}
    </React.Fragment>
  ));

  const renderSection = (groups, sectionLabel) => (
    <>
      <div className="text-[10px] font-semibold uppercase tracking-wide px-1" style={{ color: COLORS.inkSoft, gridColumn: "1 / -1" }}>
        {sectionLabel} ({groups.primary.length + groups.secondary.length})
      </div>
      {groups.primaryLabel && groups.primary.length > 0 && (
        <div className="text-[10px] font-medium px-1" style={{ color: COLORS.teal, gridColumn: "1 / -1" }}>{groups.primaryLabel}</div>
      )}
      {renderCards(groups.primary)}
      {groups.primary.length === 0 && groups.secondary.length === 0 && (
        <div className="text-xs px-1" style={{ color: COLORS.inkSoft, gridColumn: "1 / -1" }}>Sin resultados</div>
      )}
      {groups.secondaryLabel && groups.secondary.length > 0 && (
        <div className="text-[10px] font-medium px-1" style={{ color: COLORS.inkSoft, gridColumn: "1 / -1" }}>{groups.secondaryLabel}</div>
      )}
      {renderCards(groups.secondary)}
    </>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg flex-1 min-w-[180px]" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
          <Search size={14} style={{ color: COLORS.inkSoft }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o lugar…"
            className="bg-transparent text-sm outline-none flex-1" />
        </div>
        <select value={sortMode} onChange={e => setSortMode(e.target.value)} className="ipt text-xs w-auto">
          {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
        <button onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
          className="p-2 rounded-lg border flex-shrink-0" style={{ borderColor: COLORS.line }} title={sortDir === "asc" ? "Ascendente" : "Descendente"}>
          {sortDir === "asc" ? <ArrowUp size={13} style={{ color: COLORS.teal }} /> : <ArrowDown size={13} style={{ color: COLORS.teal }} />}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 items-start">
        {renderSection(localGroups, "Locales")}
        {renderSection(visitorGroups, "Visitantes")}
      </div>
    </div>
  );
}

