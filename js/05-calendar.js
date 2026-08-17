function Pill({ ev, statusColor, onClick, unavailableBosquejos }) {
  const color = statusColor(ev.status);
  const isSalida = ev.type === "salida";
  const isEvento = ev.type === "evento";
  const tooltipLabel = isSalida ? "Destino" : isEvento ? "Lugar" : "Origen";
  const t = todayMidnight();
  const todayIso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  const num = ev.speechNumber ? String(ev.speechNumber).trim() : "";
  const hasWarning = !!num && !!ev.date && ev.date >= todayIso && unavailableBosquejos && unavailableBosquejos.includes(num);
  const arrowBadge = /* @__PURE__ */ React.createElement("span", { className: "rounded-full flex items-center justify-center flex-shrink-0", style: { width: 14, height: 14, border: `1.5px solid ${color}` } }, /* @__PURE__ */ React.createElement(ArrowUpRight, { size: 9, style: { color } }));
  const leftCluster = /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 min-w-0" }, hasWarning && /* @__PURE__ */ React.createElement(AlertTriangle, { size: 12, style: { color: "#B9822E", flexShrink: 0 } }), !isSalida && (isEvento ? /* @__PURE__ */ React.createElement(Circle, { size: 9, style: { color, flexShrink: 0, fill: color } }) : /* @__PURE__ */ React.createElement(ArrowDownRight, { size: 12, style: { color, flexShrink: 0 } })), /* @__PURE__ */ React.createElement("span", { className: "text-[13px] truncate", style: { color: COLORS.ink } }, ev.speakerName || ev.title));
  return /* @__PURE__ */ React.createElement("div", { className: "relative group" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick,
      className: "w-full text-left px-2 py-1 rounded-md flex items-center hover:brightness-95 transition" + (isSalida ? " justify-between gap-1.5" : ""),
      style: {
        background: color + "1A",
        borderLeft: isSalida ? "none" : `3px solid ${color}`,
        borderRight: isSalida ? `3px solid ${color}` : "none"
      }
    },
    leftCluster,
    isSalida && arrowBadge
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "evt-tooltip hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none",
      style: { background: TOOLTIP_BG, color: "#fff", zIndex: 30 }
    },
    tooltipLabel,
    ": ",
    ev.place || "\u2014",
    " \xB7 n\xBA ",
    ev.speechNumber || "\u2014"
  ));
}
function MonthCard({ year, monthIndex, events, statusColor, onDayAdd, onEventClick, weekendFilter = "both", highlight, unavailableBosquejos }) {
  const allWeekends = weekendsOfMonth(year, monthIndex);
  const bothMode = weekendFilter === "both";
  const weekends = bothMode ? allWeekends : allWeekends.filter((w) => weekendFilter === "sat" ? w.dow === 6 : w.dow === 0);
  const rows = bothMode ? buildWeekendRows(weekends) : weekends.map((w) => weekendFilter === "sat" ? { sat: w, sun: null } : { sat: null, sun: w });
  const renderDayCell = (w) => {
    if (!w) return /* @__PURE__ */ React.createElement("div", null);
    const dayEvents = events.filter((ev) => ev.date === w.iso);
    const isCurrentWeekend = highlight && (w.iso === highlight.sat || w.iso === highlight.sun);
    return /* @__PURE__ */ React.createElement("div", { key: w.iso, className: "hg-zoom rounded-lg p-1.5", style: {
      background: isCurrentWeekend ? COLORS.tealSoft : COLORS.bg,
      outline: isCurrentWeekend ? `1.5px solid ${COLORS.teal}` : "none",
      outlineOffset: isCurrentWeekend ? "-1.5px" : "0",
      minHeight: 54
    } }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-[13px] font-medium flex items-center gap-1", style: { color: isCurrentWeekend ? COLORS.teal : COLORS.inkSoft, fontFamily: "IBM Plex Mono, monospace" } }, DOW_SHORT[w.dow], " ", w.day, isCurrentWeekend && /* @__PURE__ */ React.createElement("span", { className: "w-1.5 h-1.5 rounded-full flex-shrink-0", style: { background: COLORS.teal } })), /* @__PURE__ */ React.createElement("button", { onClick: () => onDayAdd(w.iso), className: "opacity-40 hover:opacity-100 transition" }, /* @__PURE__ */ React.createElement(Plus, { size: 12, style: { color: COLORS.teal } }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, dayEvents.map((ev) => /* @__PURE__ */ React.createElement(Pill, { key: ev.id, ev, statusColor, onClick: () => onEventClick(ev), unavailableBosquejos }))));
  };
  return /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border", style: { borderColor: COLORS.line, background: COLORS.surface } }, /* @__PURE__ */ React.createElement("div", { className: "px-3 py-2 border-b text-center", style: { borderColor: COLORS.line } }, /* @__PURE__ */ React.createElement("span", { className: "text-[15px] font-semibold tracking-wide", style: { fontFamily: "Fraunces, serif", color: COLORS.teal } }, MONTHS[monthIndex])), /* @__PURE__ */ React.createElement("div", { className: "p-2 space-y-1" }, rows.map((row, ri) => /* @__PURE__ */ React.createElement("div", { key: ri, className: bothMode ? "grid grid-cols-2 gap-1.5" : "grid grid-cols-1 gap-1.5" }, bothMode ? /* @__PURE__ */ React.createElement(React.Fragment, null, renderDayCell(row.sat), renderDayCell(row.sun)) : renderDayCell(row.sat || row.sun)))));
}
function useYearSwipe(setYear) {
  const startRef = useRef(null);
  const draggingRef = useRef(false);
  const onPointerDown = (e) => {
    const interactive = e.target.closest && e.target.closest('button, input, select, textarea, a, [contenteditable="true"]');
    if (interactive) {
      startRef.current = null;
      return;
    }
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
      setYear((y) => dx < 0 ? y + 1 : y - 1);
    }
    draggingRef.current = false;
  };
  return { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish, onPointerLeave: finish };
}
function YearView({ year, setYear, type, events, statusColor, onDayAdd, onEventClick, weekendFilter, setWeekendFilter, unavailableBosquejos }) {
  const filtered = useMemo(() => events.filter((ev) => {
    const matchesType = type === "all" ? true : type === "visita" ? ev.type === "visita" || ev.type === "evento" : ev.type === type;
    return matchesType && ev.date?.startsWith(String(year));
  }), [events, type, year]);
  const highlight = useMemo(() => getCurrentOrNextWeekend(), []);
  const swipeHandlers = useYearSwipe(setYear);
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
    const translateY = abs * 3;
    const translateX = offset * -1;
    return `translateY(${translateY}px) translateX(${translateX}px) scale(${isCurrent ? 1 : 1 - abs * 0.08})`;
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("style", null, `
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
      `), /* @__PURE__ */ React.createElement("div", { className: "year-wheel-outer py-2" }, /* @__PURE__ */ React.createElement("div", { key: year, className: "flex items-center justify-center gap-1 mb-5 " + (spinDir > 0 ? "year-slide-fwd" : "year-slide-back") }, [-2, -1, 0, 1, 2].map((offset) => {
    const y = year + offset;
    const isCurrent = offset === 0;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: y,
        onClick: () => setYear(y),
        className: "hg-hover rounded-xl transition font-semibold",
        style: {
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
          zIndex: isCurrent ? 2 : 1
        }
      },
      y
    );
  }))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end mb-4 flex-wrap gap-3" }, type === "visita" && setWeekendFilter && /* @__PURE__ */ React.createElement("div", { className: "flex rounded-full border p-0.5 text-[11px]", style: { borderColor: COLORS.line } }, [["both", "Ambos"], ["sat", "S\xE1bados"], ["sun", "Domingos"]].map(([val, label]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: val,
      onClick: () => setWeekendFilter(val),
      className: "px-2.5 py-1 rounded-full font-medium transition",
      style: { background: weekendFilter === val ? COLORS.teal : "transparent", color: weekendFilter === val ? "white" : COLORS.inkSoft }
    },
    label
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 text-[11px]", style: { color: COLORS.inkSoft } }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(ArrowDownRight, { size: 12 }), " Visita"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(ArrowUpRight, { size: 12 }), " Salida"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Circle, { size: 9, style: { fill: COLORS.inkSoft } }), " Evento"))), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3",
      style: { touchAction: "pan-y" },
      ...swipeHandlers
    },
    MONTHS.map((_, mi) => /* @__PURE__ */ React.createElement(
      MonthCard,
      {
        key: mi,
        year,
        monthIndex: mi,
        events: filtered,
        statusColor,
        onDayAdd,
        onEventClick,
        weekendFilter: type === "visita" ? weekendFilter : "both",
        highlight,
        unavailableBosquejos
      }
    ))
  ));
}
