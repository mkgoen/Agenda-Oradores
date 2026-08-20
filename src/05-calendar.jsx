/* ---------------------------------------------------------------
   Small building blocks
----------------------------------------------------------------*/
function Pill({ ev, statusColor, onClick, unavailableBosquejos }) {
  const color = statusColor(ev.status);
  const isSalida = ev.type === "salida";
  const isEvento = ev.type === "evento";
  const tooltipLabel = isSalida ? "Destino" : isEvento ? "Lugar" : "Origen";
  const t = todayMidnight();
  const todayIso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  const num = ev.speechNumber ? String(ev.speechNumber).trim() : "";
  const hasWarning = !!num && !!ev.date && ev.date >= todayIso && unavailableBosquejos && unavailableBosquejos.includes(num);

  const arrowBadge = (
    <span className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 14, height: 14, border: `1.5px solid ${color}` }}>
      <ArrowUpRight size={9} style={{ color }} />
    </span>
  );

  const leftCluster = (
    <span className="flex items-center gap-1.5 min-w-0">
      {hasWarning && <AlertTriangle size={12} style={{ color: "#B9822E", flexShrink: 0 }} />}
      {!isSalida && (isEvento ? <Circle size={9} style={{ color, flexShrink: 0, fill: color }} /> : <ArrowDownRight size={12} style={{ color, flexShrink: 0 }} />)}
      <span className="text-[13px] truncate" style={{ color: COLORS.ink }}>{ev.speakerName || ev.title}</span>
    </span>
  );

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={"w-full text-left px-2 py-1 rounded-md flex items-center hover:brightness-95 transition" + (isSalida ? " justify-between gap-1.5" : "")}
        style={{
          background: color + "1A",
          borderLeft: isSalida ? "none" : `3px solid ${color}`,
          borderRight: isSalida ? `3px solid ${color}` : "none",
        }}
      >
        {leftCluster}
        {isSalida && arrowBadge}
      </button>
      <div
        className="evt-tooltip hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none"
        style={{ background: TOOLTIP_BG, color: "#fff", zIndex: 30 }}
      >
        {tooltipLabel}: {ev.place || "—"} · nº {ev.speechNumber || "—"}
      </div>
    </div>
  );
}

function MonthCard({ year, monthIndex, events, statusColor, onDayAdd, onEventClick, weekendFilter = "both", highlight, unavailableBosquejos }) {
  const allWeekends = weekendsOfMonth(year, monthIndex);
  const bothMode = weekendFilter === "both";
  const weekends = bothMode ? allWeekends : allWeekends.filter(w => weekendFilter === "sat" ? w.dow === 6 : w.dow === 0);
  const rows = bothMode ? buildWeekendRows(weekends) : weekends.map(w => weekendFilter === "sat" ? { sat: w, sun: null } : { sat: null, sun: w });

  const renderDayCell = (w) => {
    if (!w) return <div />;
    const dayEvents = events.filter(ev => ev.date === w.iso);
    const isCurrentWeekend = highlight && (w.iso === highlight.sat || w.iso === highlight.sun);
    return (
      <div key={w.iso} className="hg-zoom rounded-lg p-1.5" style={{
        background: isCurrentWeekend ? COLORS.tealSoft : COLORS.bg,
        outline: isCurrentWeekend ? `1.5px solid ${COLORS.teal}` : "none",
        outlineOffset: isCurrentWeekend ? "-1.5px" : "0",
        minHeight: 54,
      }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-medium flex items-center gap-1" style={{ color: isCurrentWeekend ? COLORS.teal : COLORS.inkSoft, fontFamily: "IBM Plex Mono, monospace" }}>
            {DOW_SHORT[w.dow]} {w.day}
            {isCurrentWeekend && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: COLORS.teal }} />}
          </span>
          <button onClick={() => onDayAdd(w.iso)} className="opacity-40 hover:opacity-100 transition">
            <Plus size={12} style={{ color: COLORS.teal }} />
          </button>
        </div>
        <div className="space-y-1">
          {dayEvents.map(ev => (
            <Pill key={ev.id} ev={ev} statusColor={statusColor} onClick={() => onEventClick(ev)} unavailableBosquejos={unavailableBosquejos} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border" style={{ borderColor: COLORS.line, background: COLORS.surface }}>
      <div className="px-3 py-2 border-b text-center" style={{ borderColor: COLORS.line }}>
        <span className="text-[15px] font-semibold tracking-wide" style={{ fontFamily: "Fraunces, serif", color: COLORS.teal }}>
          {MONTHS[monthIndex]}
        </span>
      </div>
      <div className="p-2 space-y-1">
        {rows.map((row, ri) => (
          <div key={ri} className={bothMode ? "grid grid-cols-2 gap-1.5" : "grid grid-cols-1 gap-1.5"}>
            {bothMode ? (
              <>
                {renderDayCell(row.sat)}
                {renderDayCell(row.sun)}
              </>
            ) : (
              renderDayCell(row.sat || row.sun)
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Detecta un gesto horizontal (dedo o ratón) sobre una zona sin elementos
// interactivos y cambia de año. Pointer Events unifica táctil/ratón/lápiz,
// por eso basta una sola implementación para ambos casos.
function useYearSwipe(setYear) {
  const startRef = useRef(null);
  const draggingRef = useRef(false);

  const onPointerDown = (e) => {
    const interactive = e.target.closest && e.target.closest('button, input, select, textarea, a, [contenteditable="true"]');
    if (interactive) { startRef.current = null; return; }
    startRef.current = { x: e.clientX, y: e.clientY };
    draggingRef.current = false;
  };
  const onPointerMove = (e) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) draggingRef.current = true;
  };
  const finish = (e) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    startRef.current = null;
    if (draggingRef.current && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setYear(y => (dx < 0 ? y + 1 : y - 1));
    }
    draggingRef.current = false;
  };
  return { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish, onPointerLeave: finish };
}

function YearView({ year, setYear, type, events, statusColor, onDayAdd, onEventClick, weekendFilter, setWeekendFilter, unavailableBosquejos }) {
  const filtered = useMemo(() => events.filter(ev => {
    const matchesType = type === "all" ? true : type === "visita" ? (ev.type === "visita" || ev.type === "evento") : ev.type === type;
    return matchesType && ev.date?.startsWith(String(year));
  }), [events, type, year]);

  const highlight = useMemo(() => getCurrentOrNextWeekend(), []);
  const swipeHandlers = useYearSwipe(setYear);

  // Efecto "rueda deslizante": al cambiar de año toda la fila se desliza
  // lateralmente como una rueda vista de frente (eje de giro horizontal),
  // y cada número mantiene una ligera curvatura 3D permanente (los
  // extremos quedan más pequeños y "hacia atrás").
  const prevYearRef = useRef(year);
  const [spinDir, setSpinDir] = useState(1);
  useEffect(() => {
    if (year !== prevYearRef.current) {
      setSpinDir(year > prevYearRef.current ? 1 : -1);
      prevYearRef.current = year;
    }
  }, [year]);

  const wheelTransform = (offset, isCurrent) => {
    const abs = Math.abs(offset);
    const translateY = abs * 3; // los extremos caen un poco, dando sensación de curvatura
    const translateX = offset * -1;
    return `translateY(${translateY}px) translateX(${translateX}px) scale(${isCurrent ? 1 : 1 - abs * 0.08})`;
  };

  return (
    <div>
      <style>{`
        @keyframes yearSlideFwd {
          0% { transform: translateX(70px); opacity: 0.35; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes yearSlideBack {
          0% { transform: translateX(-70px); opacity: 0.35; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .year-wheel-outer { overflow: hidden; }
        .year-slide-fwd { animation: yearSlideFwd 0.85s cubic-bezier(0.22, 1, 0.36, 1); }
        .year-slide-back { animation: yearSlideBack 0.85s cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
      {/* Navegador de años: rueda deslizante */}
      <div className="year-wheel-outer py-2">
        <div key={year} className={"flex items-center justify-center gap-1 mb-5 " + (spinDir > 0 ? "year-slide-fwd" : "year-slide-back")}>
          {[-2, -1, 0, 1, 2].map(offset => {
            const y = year + offset;
            const isCurrent = offset === 0;
            return (
              <button key={y} onClick={() => setYear(y)}
                className="hg-hover rounded-xl transition font-semibold"
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: isCurrent ? 26 : 15,
                  padding: isCurrent ? "6px 18px" : "4px 10px",
                  color: isCurrent ? COLORS.teal : COLORS.inkSoft,
                  background: isCurrent ? COLORS.tealSoft : "transparent",
                  border: isCurrent ? `2px solid ${COLORS.teal}` : "2px solid transparent",
                  opacity: Math.abs(offset) === 2 ? 0.45 : 1,
                  transform: wheelTransform(offset, isCurrent),
                  transition: "transform 0.3s ease",
                  position: "relative",
                  zIndex: isCurrent ? 2 : 1,
                }}>
                {y}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-end mb-4 flex-wrap gap-3">
          {type === "visita" && setWeekendFilter && (
            <div className="flex rounded-full border p-0.5 text-[11px]" style={{ borderColor: COLORS.line }}>
              {[["both", "Ambos"], ["sat", "Sábados"], ["sun", "Domingos"]].map(([val, label]) => (
                <button key={val} onClick={() => setWeekendFilter(val)}
                  className="px-2.5 py-1 rounded-full font-medium transition"
                  style={{ background: weekendFilter === val ? COLORS.teal : "transparent", color: weekendFilter === val ? "white" : COLORS.inkSoft }}>
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 text-[11px]" style={{ color: COLORS.inkSoft }}>
            <span className="flex items-center gap-1"><ArrowDownRight size={12} /> Visita</span>
            <span className="flex items-center gap-1"><ArrowUpRight size={12} /> Salida</span>
            <span className="flex items-center gap-1"><Circle size={9} style={{ fill: COLORS.inkSoft }} /> Evento</span>
          </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        style={{ touchAction: "pan-y" }}
        {...swipeHandlers}
      >
        {MONTHS.map((_, mi) => (
          <MonthCard key={mi} year={year} monthIndex={mi} events={filtered} statusColor={statusColor}
            onDayAdd={onDayAdd} onEventClick={onEventClick}
            weekendFilter={type === "visita" ? weekendFilter : "both"} highlight={highlight} unavailableBosquejos={unavailableBosquejos} />
        ))}
      </div>
    </div>
  );
}

