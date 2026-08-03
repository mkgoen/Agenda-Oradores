const EXCEL_IMPORT_DATA = {
  speakers: [],
  events: [],
  statuses: DEFAULT_STATUSES,
  reminders: [],
  unavailableBosquejos: [],
  theme: "light",
  weekendFilter: "both"
};
const EXTRA_IMPORT_2023_2024 = { events: [] };
function mergeExtraImport(currentSpeakers, currentEvents, importData) {
  let speakers = [...currentSpeakers];
  const events = [...currentEvents];
  const findByName = (name) => speakers.find((s) => s.name.trim().toLowerCase() === name.trim().toLowerCase());
  importData.events.forEach((ev) => {
    let sp = findByName(ev.speakerName);
    if (!sp) {
      sp = { id: uid(), name: ev.speakerName, phone: "", origin: ev.place || "Desconocido", isLocal: false, blockedMonths: [] };
      speakers.push(sp);
    }
    events.push({ ...ev, id: uid(), speakerId: sp.id });
  });
  return { speakers, events };
}
