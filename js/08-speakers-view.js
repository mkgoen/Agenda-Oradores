function SpeakersView({
  speakers,
  setSpeakers,
  events,
  statusColor,
  onEventClick,
  search,
  setSearch,
  selectedId,
  setSelectedId,
  blockYear,
  setBlockYear,
  deleteSpeaker,
  bosquejoTitles
}) {
  const search_ = search.toLowerCase();
  const matches = (s) => s.name.toLowerCase().includes(search_) || (s.origin || "").toLowerCase().includes(search_);
  const localList = useMemo(
    () => speakers.filter((s) => s.isLocal && matches(s)).sort((a, b) => a.name.localeCompare(b.name, "es")),
    [speakers, search]
  );
  const externList = useMemo(() => speakers.filter((s) => !s.isLocal && matches(s)), [speakers, search]);
  const originGroups = useMemo(() => {
    const map = {};
    externList.forEach((s) => {
      const key = (s.origin || "").trim() || "Sin lugar de origen";
      (map[key] = map[key] || []).push(s);
    });
    return Object.keys(map).sort((a, b) => a.localeCompare(b, "es")).map((origin) => ({
      origin,
      list: map[origin].sort((a, b) => a.name.localeCompare(b.name, "es"))
    }));
  }, [externList]);
  const [panelId, setPanelId] = useState(selectedId);
  const [panelExpanded, setPanelExpanded] = useState(!!selectedId);
  const [inviteFor, setInviteFor] = useState(null);
  useEffect(() => {
    if (selectedId === panelId) return;
    if (selectedId === null) {
      setPanelExpanded(false);
      const t = setTimeout(() => setPanelId(null), 320);
      return () => clearTimeout(t);
    }
    if (panelId === null) {
      setPanelId(selectedId);
      requestAnimationFrame(() => requestAnimationFrame(() => setPanelExpanded(true)));
    } else {
      setPanelExpanded(false);
      const t = setTimeout(() => {
        setPanelId(selectedId);
        requestAnimationFrame(() => requestAnimationFrame(() => setPanelExpanded(true)));
      }, 320);
      return () => clearTimeout(t);
    }
  }, [selectedId]);
  const panelSpeaker = speakers.find((s) => s.id === panelId);
  const history = panelSpeaker ? events.filter((ev) => ev.speakerId === panelSpeaker.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const updateSelected = (patch) => setSpeakers((ss) => ss.map((s) => s.id === panelId ? { ...s, ...patch } : s));
  const [newBosquejo, setNewBosquejo] = useState("");
  const addBosquejoNum = () => {
    const n = newBosquejo.trim();
    if (!n) return;
    const current = panelSpeaker.bosquejos || [];
    if (!current.includes(n)) updateSelected({ bosquejos: [...current, n] });
    setNewBosquejo("");
  };
  const removeBosquejoNum = (n) => updateSelected({ bosquejos: (panelSpeaker.bosquejos || []).filter((x) => x !== n) });
  const toggleMonth = (m) => {
    const key = `${blockYear}-${String(m + 1).padStart(2, "0")}`;
    const has = panelSpeaker.blockedMonths.includes(key);
    updateSelected({ blockedMonths: has ? panelSpeaker.blockedMonths.filter((x) => x !== key) : [...panelSpeaker.blockedMonths, key] });
  };
  const cardClick = (id) => setSelectedId((prev) => prev === id ? null : id);
  const [showAddModal, setShowAddModal] = useState(false);
  const addNewSpeaker = (speaker) => setSpeakers((s) => [...s, speaker]);
  const handleDelete = () => {
    if (!panelSpeaker) return;
    if (!window.confirm(`\xBFEliminar a ${panelSpeaker.name}? Esta acci\xF3n no se puede deshacer.`)) return;
    deleteSpeaker(panelSpeaker.id);
    setSelectedId(null);
  };
  const handleInvite = () => {
    if (!panelSpeaker) return;
    setInviteFor(panelSpeaker);
    setSelectedId(null);
  };
  const speakerCard = (s) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: s.id,
      onClick: () => cardClick(s.id),
      className: "hg-hover text-left px-3 py-2.5 rounded-xl border flex items-center justify-between transition",
      style: {
        borderColor: s.id === selectedId ? COLORS.teal : COLORS.line,
        background: s.id === selectedId ? COLORS.tealSoft : COLORS.surface
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm font-medium truncate" }, s.name), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] truncate", style: { color: COLORS.inkSoft } }, s.origin || "\u2014")),
    s.isLocal && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ml-2", style: { background: COLORS.teal, color: "white" } }, "Local")
  );
  const speakerDetail = () => /* @__PURE__ */ React.createElement("div", { className: "expand-wrap " + (panelExpanded ? "sd-expanded" : "sd-collapsed"), style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border p-5 space-y-4 mt-2.5", style: { borderColor: COLORS.teal, background: COLORS.surface } }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between flex-wrap gap-y-2 gap-x-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold pt-1", style: { fontFamily: "Fraunces, serif" } }, panelSpeaker.name), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 flex-shrink-0" }, /* @__PURE__ */ React.createElement("button", { onClick: handleInvite, className: "px-2.5 py-1 rounded-md text-xs font-medium text-white", style: { background: COLORS.teal } }, "Invitar"), /* @__PURE__ */ React.createElement("button", { onClick: handleDelete, className: "px-2.5 py-1 rounded-md text-xs font-medium border", style: { borderColor: "#B0453B", color: "#B0453B" } }, "Eliminar"), /* @__PURE__ */ React.createElement("button", { onClick: () => setSelectedId(null), className: "p-1 rounded-full hover:bg-black/5" }, /* @__PURE__ */ React.createElement(X, { size: 16, style: { color: COLORS.inkSoft } })))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement(Field, { label: "Nombre" }, /* @__PURE__ */ React.createElement("input", { value: panelSpeaker.name, onChange: (e) => updateSelected({ name: e.target.value }), className: "ipt" })), /* @__PURE__ */ React.createElement(Field, { label: "Tel\xE9fono" }, /* @__PURE__ */ React.createElement("input", { value: panelSpeaker.phone, onChange: (e) => updateSelected({ phone: e.target.value }), className: "ipt" })), /* @__PURE__ */ React.createElement(Field, { label: "Lugar de origen" }, /* @__PURE__ */ React.createElement("input", { value: panelSpeaker.origin, onChange: (e) => updateSelected({ origin: e.target.value }), className: "ipt" })), /* @__PURE__ */ React.createElement(Field, { label: "Tipo" }, /* @__PURE__ */ React.createElement("select", { value: panelSpeaker.isLocal ? "local" : "externo", onChange: (e) => updateSelected({ isLocal: e.target.value === "local" }), className: "ipt" }, /* @__PURE__ */ React.createElement("option", { value: "local" }, "Orador local"), /* @__PURE__ */ React.createElement("option", { value: "externo" }, "Orador externo")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium block mb-2", style: { color: COLORS.inkSoft } }, "Bosquejos que dispone"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 mb-2" }, (panelSpeaker.bosquejos || []).map((n) => /* @__PURE__ */ React.createElement("span", { key: n, className: "flex items-center gap-1 text-[11px] font-mono pl-2.5 pr-1 py-1 rounded-full", style: { background: COLORS.tealSoft, color: COLORS.teal } }, n, bosquejoTitles?.[n] ? ` - ${bosquejoTitles[n]}` : "", /* @__PURE__ */ React.createElement("button", { onClick: () => removeBosquejoNum(n), className: "rounded-full p-0.5 hover:bg-black/10", title: "Eliminar" }, /* @__PURE__ */ React.createElement(X, { size: 10 })))), (panelSpeaker.bosquejos || []).length === 0 && /* @__PURE__ */ React.createElement("span", { className: "text-xs", style: { color: COLORS.inkSoft } }, "Sin bosquejos a\xF1adidos todav\xEDa.")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: newBosquejo,
      onChange: (e) => setNewBosquejo(e.target.value.replace(/[^0-9]/g, "")),
      onKeyDown: (e) => {
        if (e.key === "Enter") addBosquejoNum();
      },
      inputMode: "numeric",
      placeholder: "N\xBA de bosquejo",
      className: "ipt text-xs",
      style: { maxWidth: 140 }
    }
  ), /* @__PURE__ */ React.createElement("button", { onClick: addBosquejoNum, className: "px-3 rounded-md text-xs font-medium", style: { background: COLORS.tealSoft, color: COLORS.teal } }, "A\xF1adir"))), panelSpeaker.isLocal && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium", style: { color: COLORS.inkSoft } }, "Meses libres (no invitar)"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setBlockYear((y) => y - 1), className: "p-1 rounded-md hover:bg-black/5" }, /* @__PURE__ */ React.createElement(ChevronLeft, { size: 18 })), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-semibold tabular-nums", style: { fontFamily: "Fraunces, serif", color: COLORS.teal, minWidth: 64, textAlign: "center" } }, blockYear), /* @__PURE__ */ React.createElement("button", { onClick: () => setBlockYear((y) => y + 1), className: "p-1 rounded-md hover:bg-black/5" }, /* @__PURE__ */ React.createElement(ChevronRight, { size: 18 })))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5" }, MONTHS.map((m, mi) => {
    const key = `${blockYear}-${String(mi + 1).padStart(2, "0")}`;
    const active = panelSpeaker.blockedMonths.includes(key);
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: mi,
        onClick: () => toggleMonth(mi),
        className: "text-[11px] py-1.5 rounded-md border",
        style: {
          borderColor: active ? "#B0453B" : COLORS.line,
          background: active ? "#B0453B1A" : "transparent",
          color: active ? "#B0453B" : COLORS.inkSoft
        }
      },
      m.slice(0, 3)
    );
  }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium block mb-2", style: { color: COLORS.inkSoft } }, "Historial de discursos"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-64 overflow-y-auto" }, history.map((ev) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: ev.id,
      onClick: () => onEventClick(ev),
      className: "text-left px-3 py-2 rounded-lg flex items-center justify-between border",
      style: { borderColor: COLORS.line }
    },
    /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-medium truncate" }, ev.title, " ", /* @__PURE__ */ React.createElement("span", { className: "opacity-50" }, "n\xBA", ev.speechNumber)), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] flex items-center gap-1", style: { color: COLORS.inkSoft } }, /* @__PURE__ */ React.createElement(MapPin, { size: 10 }), " ", ev.place, " \xB7 ", formatDate(ev.date))),
    /* @__PURE__ */ React.createElement("span", { className: "text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ml-2", style: { background: statusColor(ev.status) + "22", color: statusColor(ev.status) } }, ev.status)
  )), history.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "text-xs", style: { color: COLORS.inkSoft } }, "Sin discursos registrados todav\xEDa.")))));
  const renderCardsWithDetail = (list) => list.map((s) => /* @__PURE__ */ React.createElement(React.Fragment, { key: s.id }, speakerCard(s), s.id === panelId && speakerDetail()));
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-4 flex-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 px-2 py-1.5 rounded-lg flex-1 min-w-[180px]", style: { background: COLORS.surface, border: `1px solid ${COLORS.line}` } }, /* @__PURE__ */ React.createElement(Search, { size: 14, style: { color: COLORS.inkSoft } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      value: search,
      onChange: (e) => setSearch(e.target.value),
      placeholder: "Buscar por nombre o lugar\u2026",
      className: "bg-transparent text-sm outline-none flex-1"
    }
  )), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowAddModal(true), className: "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white flex-shrink-0", style: { background: COLORS.teal } }, /* @__PURE__ */ React.createElement(Plus, { size: 15 }), " A\xF1adir orador")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-semibold uppercase tracking-wide", style: { color: COLORS.inkSoft } }, "Locales (", localList.length, ")"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => exportLocalsPdf(speakers.filter((s) => s.isLocal)),
      className: "text-xs px-3 py-1.5 rounded-lg border flex-shrink-0",
      style: { borderColor: COLORS.line, color: COLORS.inkSoft }
    },
    "Generar PDF"
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 items-start mb-6" }, renderCardsWithDetail(localList), localList.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "text-xs px-1", style: { color: COLORS.inkSoft, gridColumn: "1 / -1" } }, "Sin resultados")), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-semibold uppercase tracking-wide block mb-2", style: { color: COLORS.inkSoft } }, "Externos (", externList.length, ")"), originGroups.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "text-xs px-1 mb-4", style: { color: COLORS.inkSoft } }, "Sin resultados"), originGroups.map(({ origin, list }) => /* @__PURE__ */ React.createElement("div", { key: origin, className: "mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium mb-1.5", style: { color: COLORS.teal } }, origin, " (", list.length, ")"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 items-start" }, renderCardsWithDetail(list)))), showAddModal && /* @__PURE__ */ React.createElement(AddSpeakerModal, { onClose: () => setShowAddModal(false), onSave: addNewSpeaker }), inviteFor && /* @__PURE__ */ React.createElement(InviteModal, { speaker: inviteFor, bosquejoTitles, onClose: () => setInviteFor(null) }));
}
