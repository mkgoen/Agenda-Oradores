/* ---------------------------------------------------------------
   Componente principal de la aplicación
   -----------------------------------------------------------------
   Reúne todo: cabecera, pestañas de navegación, las distintas vistas
   (calendarios, oradores, bosquejos) y los modales (nuevo evento,
   recordatorios). Es el único sitio donde vive el estado "de verdad";
   todos los demás componentes reciben los datos y las funciones para
   modificarlos como props.
----------------------------------------------------------------*/

function App() {
  const [loaded, setLoaded] = useState(false);
  const [speakers, setSpeakers] = useState([]);
  const [events, setEvents] = useState([]);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);
  const [reminders, setReminders] = useState([]);
  const [view, setView] = useState("conjunta");
  const [year, setYear] = useState(new Date().getFullYear());
  const [weekendFilter, setWeekendFilter] = useState("both");
  const [modal, setModal] = useState(null);
  const [showBell, setShowBell] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saved | error
  const [saveError, setSaveError] = useState("");
  const [theme, setTheme] = useState("light");
  const [fileMessage, setFileMessage] = useState(""); // aviso tras Abrir/Guardar

  // Estado de la pestaña Oradores, elevado aquí para que se conserve
  // (búsqueda, orden, orador seleccionado) al ir y volver de otras pestañas.
  const [speakerSearch, setSpeakerSearch] = useState("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState(null);
  const [speakerBlockYear, setSpeakerBlockYear] = useState(new Date().getFullYear());
  const [speakerSortMode, setSpeakerSortMode] = useState("alpha");
  const [speakerSortDir, setSpeakerSortDir] = useState("asc");

  // Estado de la pestaña Agendar bosquejos, elevado igual que el de Oradores.
  const [bosquejosRaw, setBosquejosRaw] = useState("");
  const [unavailableBosquejos, setUnavailableBosquejos] = useState([]);

  /* --- Carga inicial: localStorage si ya existe, si no, los datos
     importados del Excel (para que la app no arranque vacía) --------- */
  useEffect(() => {
    const d = loadFromLocalStorage();
    if (d) {
      setSpeakers(d.speakers || []);
      setEvents(d.events || []);
      setStatuses(d.statuses && d.statuses.length ? normalizeStatusColors(d.statuses) : DEFAULT_STATUSES);
      setReminders(d.reminders || []);
      setTheme(d.theme === "dark" ? "dark" : "light");
      setWeekendFilter(d.weekendFilter === "sat" || d.weekendFilter === "sun" ? d.weekendFilter : "both");
      setUnavailableBosquejos(d.unavailableBosquejos || []);
    } else {
      // Primera vez en este navegador: se parte de los datos importados
      // del Excel (visitas + roster local), fusionados con los de 2023-2024.
      const merged = mergeExtraImport(EXCEL_IMPORT_DATA.speakers, EXCEL_IMPORT_DATA.events, EXTRA_IMPORT_2023_2024);
      setSpeakers(merged.speakers);
      setEvents(merged.events);
      setStatuses(EXCEL_IMPORT_DATA.statuses);
      setReminders(EXCEL_IMPORT_DATA.reminders);
      setUnavailableBosquejos(EXCEL_IMPORT_DATA.unavailableBosquejos || []);
      setTheme(EXCEL_IMPORT_DATA.theme === "dark" ? "dark" : "light");
      setWeekendFilter(EXCEL_IMPORT_DATA.weekendFilter === "sat" || EXCEL_IMPORT_DATA.weekendFilter === "sun" ? EXCEL_IMPORT_DATA.weekendFilter : "both");
    }
    setLoaded(true);
  }, []);

  /* --- Autoguardado silencioso en localStorage cada vez que algo cambia --- */
  useEffect(() => {
    if (!loaded) return;
    const ok = saveToLocalStorage({ speakers, events, statuses, reminders, theme, unavailableBosquejos, weekendFilter });
    setSaveStatus(ok ? "saved" : "error");
    if (!ok) setSaveError("No se pudo guardar en este navegador.");
  }, [speakers, events, statuses, reminders, theme, unavailableBosquejos, weekendFilter, loaded]);

  /* --- Abrir: reemplaza todo con un archivo elegido por el usuario --- */
  const handleOpenFile = () => {
    openAgendaFile()
      .then(d => {
        setSpeakers(d.speakers || []);
        setEvents(d.events || []);
        setStatuses(d.statuses && d.statuses.length ? normalizeStatusColors(d.statuses) : DEFAULT_STATUSES);
        setReminders(d.reminders || []);
        setTheme(d.theme === "dark" ? "dark" : "light");
        setWeekendFilter(d.weekendFilter === "sat" || d.weekendFilter === "sun" ? d.weekendFilter : "both");
        setUnavailableBosquejos(d.unavailableBosquejos || []);
        setFileMessage("Archivo cargado ✓");
        setTimeout(() => setFileMessage(""), 2500);
      })
      .catch(e => {
        setFileMessage("Error al abrir: " + e.message);
        setTimeout(() => setFileMessage(""), 4000);
      });
  };

  /* --- Guardar: descarga el estado actual como archivo .json --- */
  const handleSaveFile = () => {
    const today = new Date();
    const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    saveAgendaFile(
      { speakers, events, statuses, reminders, theme, unavailableBosquejos, weekendFilter },
      `agenda-oradores-${stamp}.json`
    );
    setFileMessage("Archivo guardado ✓");
    setTimeout(() => setFileMessage(""), 2500);
  };

  const statusColor = (name) => (statuses.find(s => s.name === name) || {}).color || COLORS.inkSoft;

  const addStatus = (name) => {
    if (statuses.some(s => s.name.toLowerCase() === name.toLowerCase())) return;
    setStatuses(s => [...s, { name, color: STATUS_PALETTE[s.length % STATUS_PALETTE.length] }]);
  };

  const deleteStatus = (name) => setStatuses(s => s.length > 1 ? s.filter(x => x.name !== name) : s);

  const openNew = (prefillDate, defaultType) => setModal({ initial: null, prefillDate, defaultType: defaultType || (view === "salidas" ? "salida" : "visita") });
  const openEdit = (ev) => setModal({ initial: ev });

  const saveEvent = (form) => {
    let speaker = speakers.find(s => s.name.trim().toLowerCase() === form.speakerName.trim().toLowerCase());
    let nextSpeakers = speakers;
    if (!speaker && form.speakerName.trim()) {
      speaker = { id: uid(), name: form.speakerName.trim(), phone: form.phone, origin: form.type === "visita" ? form.place : "Local", isLocal: form.type === "salida", blockedMonths: [] };
      nextSpeakers = [...speakers, speaker];
    }
    if (speaker && form.type === "salida" && form.date) {
      const period = ym(form.date);
      if (!speaker.blockedMonths.includes(period)) {
        const updatedSpeaker = { ...speaker, blockedMonths: [...speaker.blockedMonths, period] };
        speaker = updatedSpeaker;
        nextSpeakers = nextSpeakers.map(s => s.id === updatedSpeaker.id ? updatedSpeaker : s);
      }
    }
    const eventObj = { ...form, id: modal.initial ? modal.initial.id : uid(), speakerId: speaker ? speaker.id : null };
    setSpeakers(nextSpeakers);
    setEvents(evs => modal.initial ? evs.map(e => e.id === eventObj.id ? eventObj : e) : [...evs, eventObj]);
    setModal(null);
  };

  const deleteEvent = (id) => { setEvents(evs => evs.filter(e => e.id !== id)); setModal(null); };

  const pendingReminders = reminders.filter(r => !r.done).length;

  const navItems = [
    { key: "conjunta", label: "Vista conjunta", icon: LayoutGrid },
    { key: "visitas", label: "Visitantes", icon: ArrowDownRight },
    { key: "salidas", label: "Salidas", icon: ArrowUpRight },
    { key: "oradores", label: "Oradores", icon: Users },
    { key: "bosquejos", label: "Agendar bosquejos", icon: Hash },
  ];

  // Se reasigna el binding mutable COLORS según el tema elegido, antes de renderizar.
  COLORS = theme === "dark" ? DARK_COLORS : LIGHT_COLORS;

  return (
    <div className="h-screen flex flex-col" style={{ background: COLORS.bg, fontFamily: "Inter, sans-serif", color: COLORS.ink }}>
      <style>{`
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
      `}</style>

      <header className="px-6 pt-6 pb-3 flex items-center justify-between relative flex-shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <CalendarDays size={22} style={{ color: COLORS.teal }} />
          <h1 className="text-xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>Agenda de Oradores</h1>
          {saveStatus === "saved" && <span className="text-[11px]" style={{ color: "#2F8F4E" }}>Guardado ✓</span>}
          {saveStatus === "error" && (
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#B0453B22", color: "#B0453B" }}>
              Error al guardar
            </span>
          )}
          {fileMessage && <span className="text-[11px]" style={{ color: COLORS.teal }}>{fileMessage}</span>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
            className="p-2 rounded-full hover:bg-black/5" title={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}>
            {theme === "light" ? <Moon size={18} style={{ color: COLORS.ink }} /> : <Sun size={18} style={{ color: COLORS.ink }} />}
          </button>
          <button onClick={handleOpenFile} className="text-xs px-2.5 py-1.5 rounded-lg border" style={{ borderColor: COLORS.line, color: COLORS.inkSoft }}>
            Abrir
          </button>
          <button onClick={handleSaveFile} className="text-xs px-2.5 py-1.5 rounded-lg border" style={{ borderColor: COLORS.line, color: COLORS.inkSoft }}>
            Guardar
          </button>
          <div className="relative">
            <button onClick={() => setShowBell(b => !b)} className="relative p-2 rounded-full hover:bg-black/5">
              <Bell size={19} style={{ color: COLORS.ink }} />
              {pendingReminders > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[9px] w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: "#B0453B" }}>
                  {pendingReminders}
                </span>
              )}
            </button>
            {showBell && <ReminderPanel reminders={reminders} setReminders={setReminders} onClose={() => setShowBell(false)} />}
          </div>
          <button onClick={() => openNew(null, null)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white" style={{ background: COLORS.teal }}>
            <Plus size={15} /> Nuevo evento
          </button>
        </div>
      </header>

      <nav className="nav-scroll px-6 flex items-center gap-1 border-b flex-shrink-0" style={{ borderColor: COLORS.line }}>
        {navItems.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setView(key)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition flex-shrink-0 whitespace-nowrap"
            style={{ borderColor: view === key ? COLORS.teal : "transparent", color: view === key ? COLORS.teal : COLORS.inkSoft }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </nav>

      <main className="px-6 py-5 flex-1 overflow-y-auto min-h-0">
        {!loaded ? (
          <div className="text-sm py-10 text-center" style={{ color: COLORS.inkSoft }}>Cargando agenda…</div>
        ) : view === "oradores" ? (
          <SpeakersView
            speakers={speakers} setSpeakers={setSpeakers} events={events} statusColor={statusColor} onEventClick={openEdit}
            search={speakerSearch} setSearch={setSpeakerSearch}
            selectedId={selectedSpeakerId} setSelectedId={setSelectedSpeakerId}
            blockYear={speakerBlockYear} setBlockYear={setSpeakerBlockYear}
            sortMode={speakerSortMode} setSortMode={setSpeakerSortMode}
            sortDir={speakerSortDir} setSortDir={setSpeakerSortDir}
          />
        ) : view === "bosquejos" ? (
          <BosquejosView events={events} raw={bosquejosRaw} setRaw={setBosquejosRaw} unavailable={unavailableBosquejos} setUnavailable={setUnavailableBosquejos} />
        ) : (
          <YearView
            year={year} setYear={setYear}
            type={view === "conjunta" ? "all" : view === "visitas" ? "visita" : "salida"}
            events={events} statusColor={statusColor}
            onDayAdd={(iso) => openNew(iso, view === "salidas" ? "salida" : "visita")}
            onEventClick={openEdit}
            weekendFilter={weekendFilter} setWeekendFilter={setWeekendFilter}
            unavailableBosquejos={unavailableBosquejos}
          />
        )}
      </main>

      {modal && (
        <EventModal
          initial={modal.initial} prefillDate={modal.prefillDate} defaultType={modal.defaultType}
          speakers={speakers} events={events} statuses={statuses} unavailableBosquejos={unavailableBosquejos}
          onClose={() => setModal(null)} onSave={saveEvent} onDelete={deleteEvent} onAddStatus={addStatus} onDeleteStatus={deleteStatus}
        />
      )}
    </div>
  );
}
