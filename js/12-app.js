function reconcileBlockedMonths(speakers, events) {
  return speakers.map((sp) => {
    if (!sp.isLocal) return sp;
    const months = new Set(sp.blockedMonths || []);
    const before = months.size;
    events.forEach((ev) => {
      if (ev.speakerId === sp.id && ev.date) months.add(ym(ev.date));
    });
    if (months.size === before) return sp;
    return { ...sp, blockedMonths: Array.from(months).sort() };
  });
}
function App() {
  const [loaded, setLoaded] = useState(false);
  const [speakers, setSpeakers] = useState([]);
  const [events, setEvents] = useState([]);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);
  const [reminders, setReminders] = useState([]);
  const [view, setView] = useState("conjunta");
  const [year, setYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
  const [weekendFilter, setWeekendFilter] = useState("both");
  const [modal, setModal] = useState(null);
  const [showBell, setShowBell] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [theme, setTheme] = useState("light");
  const [fileMessage, setFileMessage] = useState("");
  const [speakerSearch, setSpeakerSearch] = useState("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState(null);
  const [speakerBlockYear, setSpeakerBlockYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
  const [speakerSortMode, setSpeakerSortMode] = useState("alpha");
  const [speakerSortDir, setSpeakerSortDir] = useState("asc");
  const [bosquejosRaw, setBosquejosRaw] = useState("");
  const [unavailableBosquejos, setUnavailableBosquejos] = useState([]);
  const [bosquejoDbExpanded, setBosquejoDbExpanded] = useState(false);
  const [bosquejoTitles, setBosquejoTitles] = useState({});
  useEffect(() => {
    const d = loadFromLocalStorage();
    if (d) {
      const spk = d.speakers || [];
      const evs = d.events || [];
      setSpeakers(reconcileBlockedMonths(spk, evs));
      setEvents(evs);
      setStatuses(d.statuses && d.statuses.length ? normalizeStatusColors(d.statuses) : DEFAULT_STATUSES);
      setReminders(d.reminders || []);
      setTheme(d.theme === "dark" ? "dark" : "light");
      setWeekendFilter(d.weekendFilter === "sat" || d.weekendFilter === "sun" ? d.weekendFilter : "both");
      setUnavailableBosquejos(d.unavailableBosquejos || []);
      setBosquejoTitles(d.bosquejoTitles || {});
    } else {
      const merged = mergeExtraImport(EXCEL_IMPORT_DATA.speakers, EXCEL_IMPORT_DATA.events, EXTRA_IMPORT_2023_2024);
      setSpeakers(reconcileBlockedMonths(merged.speakers, merged.events));
      setEvents(merged.events);
      setStatuses(EXCEL_IMPORT_DATA.statuses);
      setReminders(EXCEL_IMPORT_DATA.reminders);
      setUnavailableBosquejos(EXCEL_IMPORT_DATA.unavailableBosquejos || []);
      setBosquejoTitles(EXCEL_IMPORT_DATA.bosquejoTitles || {});
      setTheme(EXCEL_IMPORT_DATA.theme === "dark" ? "dark" : "light");
      setWeekendFilter(EXCEL_IMPORT_DATA.weekendFilter === "sat" || EXCEL_IMPORT_DATA.weekendFilter === "sun" ? EXCEL_IMPORT_DATA.weekendFilter : "both");
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const ok = saveToLocalStorage({ speakers, events, statuses, reminders, theme, unavailableBosquejos, weekendFilter, bosquejoTitles });
    setSaveStatus(ok ? "saved" : "error");
    if (!ok) setSaveError("No se pudo guardar en este navegador.");
  }, [speakers, events, statuses, reminders, theme, unavailableBosquejos, weekendFilter, bosquejoTitles, loaded]);
  const handleOpenFile = () => {
    openAgendaFile().then((d) => {
      const spk = d.speakers || [];
      const evs = d.events || [];
      const reconciled = reconcileBlockedMonths(spk, evs);
      const fixedCount = reconciled.filter((s, i) => s !== spk[i]).length;
      setSpeakers(reconciled);
      setEvents(evs);
      setStatuses(d.statuses && d.statuses.length ? normalizeStatusColors(d.statuses) : DEFAULT_STATUSES);
      setReminders(d.reminders || []);
      setTheme(d.theme === "dark" ? "dark" : "light");
      setWeekendFilter(d.weekendFilter === "sat" || d.weekendFilter === "sun" ? d.weekendFilter : "both");
      setUnavailableBosquejos(d.unavailableBosquejos || []);
      setBosquejoTitles(d.bosquejoTitles || {});
      setFileMessage(fixedCount > 0 ? `Archivo cargado \u2713 (meses libres corregidos en ${fixedCount} orador${fixedCount > 1 ? "es" : ""})` : "Archivo cargado \u2713");
      setTimeout(() => setFileMessage(""), fixedCount > 0 ? 5e3 : 2500);
    }).catch((e) => {
      setFileMessage("Error al abrir: " + e.message);
      setTimeout(() => setFileMessage(""), 4e3);
    });
  };
  const handleSaveFile = () => {
    const today = /* @__PURE__ */ new Date();
    const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    saveAgendaFile(
      { speakers, events, statuses, reminders, theme, unavailableBosquejos, weekendFilter, bosquejoTitles },
      `agenda-oradores-${stamp}.json`
    );
    setFileMessage("Archivo guardado \u2713");
    setTimeout(() => setFileMessage(""), 2500);
  };
  const statusColor = (name) => (statuses.find((s) => s.name === name) || {}).color || COLORS.inkSoft;
  const addStatus = (name) => {
    if (statuses.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setStatuses((s) => [...s, { name, color: STATUS_PALETTE[s.length % STATUS_PALETTE.length] }]);
  };
  const deleteStatus = (name) => setStatuses((s) => s.length > 1 ? s.filter((x) => x.name !== name) : s);
  const openNew = (prefillDate, defaultType) => setModal({ initial: null, prefillDate, defaultType: defaultType || (view === "salidas" ? "salida" : "visita") });
  const openEdit = (ev) => setModal({ initial: ev });
  const saveEvent = (form) => {
    let speaker = speakers.find((s) => s.name.trim().toLowerCase() === form.speakerName.trim().toLowerCase());
    let nextSpeakers = speakers;
    if (!speaker && form.speakerName.trim()) {
      speaker = { id: uid(), name: form.speakerName.trim(), phone: form.phone, origin: form.type === "visita" ? form.place : "Local", isLocal: form.type === "salida", blockedMonths: [] };
      nextSpeakers = [...speakers, speaker];
    }
    if (speaker && speaker.isLocal && form.date) {
      const period = ym(form.date);
      if (!speaker.blockedMonths.includes(period)) {
        const updatedSpeaker = { ...speaker, blockedMonths: [...speaker.blockedMonths, period] };
        speaker = updatedSpeaker;
        nextSpeakers = nextSpeakers.map((s) => s.id === updatedSpeaker.id ? updatedSpeaker : s);
      }
    }
    const eventObj = { ...form, id: modal.initial ? modal.initial.id : uid(), speakerId: speaker ? speaker.id : null };
    if (modal.initial) {
      const oldSpeakerId = modal.initial.speakerId;
      const oldMonth = modal.initial.date ? ym(modal.initial.date) : null;
      const changed = oldSpeakerId !== eventObj.speakerId || oldMonth !== ym(eventObj.date);
      if (changed && oldSpeakerId && oldMonth) {
        const oldSpeaker = nextSpeakers.find((s) => s.id === oldSpeakerId);
        if (oldSpeaker && oldSpeaker.isLocal && oldSpeaker.blockedMonths.includes(oldMonth)) {
          const stillHasEvent = events.some((ev) => ev.id !== eventObj.id && ev.speakerId === oldSpeakerId && ym(ev.date) === oldMonth);
          if (!stillHasEvent) {
            nextSpeakers = nextSpeakers.map((s) => s.id === oldSpeakerId ? { ...s, blockedMonths: s.blockedMonths.filter((m) => m !== oldMonth) } : s);
          }
        }
      }
    }
    setSpeakers(nextSpeakers);
    setEvents((evs) => modal.initial ? evs.map((e) => e.id === eventObj.id ? eventObj : e) : [...evs, eventObj]);
    setModal(null);
  };
  const deleteEvent = (id) => {
    const ev = events.find((e) => e.id === id);
    setEvents((evs) => evs.filter((e) => e.id !== id));
    if (ev && ev.speakerId && ev.date) {
      const month = ym(ev.date);
      const speaker = speakers.find((s) => s.id === ev.speakerId);
      if (speaker && speaker.isLocal && speaker.blockedMonths.includes(month)) {
        const stillHasEvent = events.some((e) => e.id !== id && e.speakerId === ev.speakerId && ym(e.date) === month);
        if (!stillHasEvent) {
          setSpeakers((ss) => ss.map((s) => s.id === speaker.id ? { ...s, blockedMonths: s.blockedMonths.filter((m) => m !== month) } : s));
        }
      }
    }
    setModal(null);
  };
  const deleteSpeaker = (id) => setSpeakers((ss) => ss.filter((s) => s.id !== id));
  const pendingReminders = reminders.filter((r) => !r.done).length;
  const navItems = [
    { key: "conjunta", label: "Vista conjunta", icon: LayoutGrid },
    { key: "visitas", label: "Visitantes", icon: ArrowDownRight },
    { key: "salidas", label: "Salidas", icon: ArrowUpRight },
    { key: "oradores", label: "Oradores", icon: Users },
    { key: "bosquejos", label: "Agendar bosquejos", icon: Hash }
  ];
  COLORS = theme === "dark" ? DARK_COLORS : LIGHT_COLORS;
  return /* @__PURE__ */ React.createElement("div", { className: "h-screen flex flex-col", style: { background: COLORS.bg, fontFamily: "Inter, sans-serif", color: COLORS.ink } }, /* @__PURE__ */ React.createElement("style", null, `
        .ipt { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid ${COLORS.line}; background: ${COLORS.bg}; font-size: 13px; outline: none; }
        .ipt:focus { border-color: ${COLORS.teal}; }
        .evt-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: ${TOOLTIP_BG};
        }
        .nav-scroll { overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; scrollbar-width: none; touch-action: pan-x; overscroll-behavior-y: none; }
        .nav-scroll::-webkit-scrollbar { display: none; }

        /* Zoom ligero + resplandor inferior al pasar el rat\xF3n, reutilizado
           en pesta\xF1as, celdas del calendario, tarjetas de orador y el
           navegador de a\xF1os. */
        .hg-hover { position: relative; transition: transform 0.25s ease; }
        .hg-hover::after {
          content: "";
          position: absolute;
          left: 10%;
          right: 10%;
          bottom: 0;
          height: 55%;
          background: radial-gradient(ellipse at bottom, ${COLORS.teal}55 0%, transparent 75%);
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
          border-radius: inherit;
          z-index: -1;
        }
        .hg-hover:hover { transform: scale(1.035); }
        .hg-hover:hover::after { opacity: 1; }

        /* Igual que hg-hover pero sin el resplandor inferior, solo el zoom. */
        .hg-zoom { transition: transform 0.25s ease; }
        .hg-zoom:hover { transform: scale(1.035); }

        /* Expandir/replegar suave, reutilizado por el detalle de orador
           y la base de datos de bosquejos. */
        .expand-wrap { overflow: hidden; transition: max-height 0.32s ease, opacity 0.28s ease, transform 0.32s ease; }
        .expand-wrap.sd-collapsed { max-height: 0; opacity: 0; transform: translateY(-6px); }
        .expand-wrap.sd-expanded { max-height: 2400px; opacity: 1; transform: translateY(0); }
      `), /* @__PURE__ */ React.createElement("header", { className: "px-6 pt-6 pb-3 flex items-center justify-between relative flex-shrink-0 flex-wrap gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(CalendarDays, { size: 22, style: { color: COLORS.teal } }), /* @__PURE__ */ React.createElement("h1", { className: "text-xl font-semibold", style: { fontFamily: "Fraunces, serif" } }, "Agenda de Oradores"), saveStatus === "saved" && /* @__PURE__ */ React.createElement("span", { className: "text-[11px]", style: { color: "#2F8F4E" } }, "Guardado \u2713"), saveStatus === "error" && /* @__PURE__ */ React.createElement("span", { className: "text-[11px] px-2 py-0.5 rounded-full", style: { background: "#B0453B22", color: "#B0453B" } }, "Error al guardar"), fileMessage && /* @__PURE__ */ React.createElement("span", { className: "text-[11px]", style: { color: COLORS.teal } }, fileMessage)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setTheme((t) => t === "light" ? "dark" : "light"),
      className: "p-2 rounded-full hover:bg-black/5",
      title: theme === "light" ? "Activar modo oscuro" : "Activar modo claro"
    },
    theme === "light" ? /* @__PURE__ */ React.createElement(Moon, { size: 18, style: { color: COLORS.ink } }) : /* @__PURE__ */ React.createElement(Sun, { size: 18, style: { color: COLORS.ink } })
  ), /* @__PURE__ */ React.createElement("button", { onClick: handleOpenFile, className: "text-xs px-2.5 py-1.5 rounded-lg border", style: { borderColor: COLORS.line, color: COLORS.inkSoft } }, "Abrir"), /* @__PURE__ */ React.createElement("button", { onClick: handleSaveFile, className: "text-xs px-2.5 py-1.5 rounded-lg border", style: { borderColor: COLORS.line, color: COLORS.inkSoft } }, "Guardar"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowBell((b) => !b), className: "relative p-2 rounded-full hover:bg-black/5" }, /* @__PURE__ */ React.createElement(Bell, { size: 19, style: { color: COLORS.ink } }), pendingReminders > 0 && /* @__PURE__ */ React.createElement("span", { className: "absolute -top-0.5 -right-0.5 text-[9px] w-4 h-4 rounded-full flex items-center justify-center text-white", style: { background: "#B0453B" } }, pendingReminders)), showBell && /* @__PURE__ */ React.createElement(ReminderPanel, { reminders, setReminders, onClose: () => setShowBell(false) })), /* @__PURE__ */ React.createElement("button", { onClick: () => openNew(null, null), className: "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white", style: { background: COLORS.teal } }, /* @__PURE__ */ React.createElement(Plus, { size: 15 }), " Nuevo evento"))), /* @__PURE__ */ React.createElement("nav", { className: "nav-scroll px-6 flex items-center gap-1 border-b flex-shrink-0", style: { borderColor: COLORS.line } }, navItems.map(({ key, label, icon: Icon }) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key,
      onClick: () => setView(key),
      className: "hg-hover flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition flex-shrink-0 whitespace-nowrap",
      style: { borderColor: view === key ? COLORS.teal : "transparent", color: view === key ? COLORS.teal : COLORS.inkSoft }
    },
    /* @__PURE__ */ React.createElement(Icon, { size: 14 }),
    " ",
    label
  ))), /* @__PURE__ */ React.createElement("main", { className: "px-6 py-5 flex-1 overflow-y-auto min-h-0" }, !loaded ? /* @__PURE__ */ React.createElement("div", { className: "text-sm py-10 text-center", style: { color: COLORS.inkSoft } }, "Cargando agenda\u2026") : view === "oradores" ? /* @__PURE__ */ React.createElement(
    SpeakersView,
    {
      speakers,
      setSpeakers,
      events,
      statusColor,
      onEventClick: openEdit,
      search: speakerSearch,
      setSearch: setSpeakerSearch,
      selectedId: selectedSpeakerId,
      setSelectedId: setSelectedSpeakerId,
      blockYear: speakerBlockYear,
      setBlockYear: setSpeakerBlockYear,
      sortMode: speakerSortMode,
      setSortMode: setSpeakerSortMode,
      sortDir: speakerSortDir,
      setSortDir: setSpeakerSortDir,
      deleteSpeaker,
      bosquejoTitles
    }
  ) : view === "bosquejos" ? /* @__PURE__ */ React.createElement(
    BosquejosView,
    {
      events,
      raw: bosquejosRaw,
      setRaw: setBosquejosRaw,
      unavailable: unavailableBosquejos,
      setUnavailable: setUnavailableBosquejos,
      bosquejoTitles,
      setBosquejoTitles,
      dbExpanded: bosquejoDbExpanded,
      setDbExpanded: setBosquejoDbExpanded
    }
  ) : /* @__PURE__ */ React.createElement(
    YearView,
    {
      year,
      setYear,
      type: view === "conjunta" ? "all" : view === "visitas" ? "visita" : "salida",
      events,
      statusColor,
      onDayAdd: (iso) => openNew(iso, view === "salidas" ? "salida" : "visita"),
      onEventClick: openEdit,
      weekendFilter,
      setWeekendFilter,
      unavailableBosquejos
    }
  )), modal && /* @__PURE__ */ React.createElement(
    EventModal,
    {
      initial: modal.initial,
      prefillDate: modal.prefillDate,
      defaultType: modal.defaultType,
      speakers,
      events,
      statuses,
      unavailableBosquejos,
      bosquejoTitles,
      onClose: () => setModal(null),
      onSave: saveEvent,
      onDelete: deleteEvent,
      onAddStatus: addStatus,
      onDeleteStatus: deleteStatus
    }
  ));
}
