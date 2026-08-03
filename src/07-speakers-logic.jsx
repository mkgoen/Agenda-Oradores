/* ---------------------------------------------------------------
   Speakers view
----------------------------------------------------------------*/
/* ---------------------------------------------------------------
   Ordenación de oradores
----------------------------------------------------------------*/
function todayMidnight() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }

function speakerEvents(speaker, events) { return events.filter(e => e.speakerId === speaker.id); }

function nextUpcomingEvent(evs) {
  const t = todayMidnight();
  const upcoming = evs.filter(e => e.date && new Date(e.date + "T00:00:00") >= t).sort((a, b) => a.date.localeCompare(b.date));
  return upcoming[0] || null;
}
function lastPastEvent(evs) {
  const t = todayMidnight();
  const past = evs.filter(e => e.date && new Date(e.date + "T00:00:00") < t).sort((a, b) => b.date.localeCompare(a.date));
  return past[0] || null;
}
function earliestWithStatus(evs, status) {
  const matching = evs.filter(e => e.status === status).sort((a, b) => a.date.localeCompare(b.date));
  return matching[0] || null;
}

const SORT_OPTIONS = [
  { key: "alpha", label: "Alfabético" },
  { key: "place", label: "Lugar" },
  { key: "next", label: "Próximo evento" },
  { key: "invitados", label: "Invitados" },
  { key: "previstos", label: "Previstos" },
];

// Devuelve { primary, primaryLabel, secondary, secondaryLabel } ya ordenados según el modo.
function groupAndSortSpeakers(list, events, mode, dir) {
  const dirMul = dir === "asc" ? 1 : -1;

  if (mode === "alpha") {
    const sorted = [...list].sort((a, b) => dirMul * a.name.localeCompare(b.name, "es"));
    return { primary: sorted, primaryLabel: null, secondary: [], secondaryLabel: null };
  }
  if (mode === "place") {
    const sorted = [...list].sort((a, b) => dirMul * (a.origin || "").localeCompare(b.origin || "", "es"));
    return { primary: sorted, primaryLabel: null, secondary: [], secondaryLabel: null };
  }
  if (mode === "next") {
    const withNext = [], withoutNext = [];
    list.forEach(s => {
      const evs = speakerEvents(s, events);
      const nxt = nextUpcomingEvent(evs);
      if (nxt) withNext.push({ s, date: nxt.date });
      else withoutNext.push({ s, date: (lastPastEvent(evs) || {}).date || null });
    });
    withNext.sort((a, b) => dirMul * a.date.localeCompare(b.date));
    withoutNext.sort((a, b) => {
      if (a.date && b.date) return dirMul * a.date.localeCompare(b.date);
      if (a.date && !b.date) return -1;
      if (!a.date && b.date) return 1;
      return a.s.name.localeCompare(b.s.name, "es");
    });
    return {
      primary: withNext.map(x => x.s), primaryLabel: "Próximo evento",
      secondary: withoutNext.map(x => x.s), secondaryLabel: "Sin eventos próximos (pasados)",
    };
  }
  if (mode === "invitados" || mode === "previstos") {
    const status = mode === "invitados" ? "Invitado" : "Previsto";
    const withStatus = [], rest = [];
    list.forEach(s => {
      const evs = speakerEvents(s, events);
      const match = earliestWithStatus(evs, status);
      if (match) withStatus.push({ s, date: match.date });
      else rest.push(s);
    });
    withStatus.sort((a, b) => dirMul * a.date.localeCompare(b.date));
    rest.sort((a, b) => a.name.localeCompare(b.name, "es"));
    return {
      primary: withStatus.map(x => x.s), primaryLabel: status,
      secondary: rest, secondaryLabel: "Otros estados",
    };
  }
  return { primary: list, primaryLabel: null, secondary: [], secondaryLabel: null };
}

