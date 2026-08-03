function computeWarnings(form, events, speakers, excludeId, unavailableBosquejos) {
  const warnings = [];
  if (form.date && !isWeekend(form.date)) {
    warnings.push({ key: "weekend", text: "Esa fecha no cae en s\xE1bado ni domingo. Aqu\xED solo se programan discursos de fin de semana." });
  }
  if (form.type === "visita" && form.speechNumber && form.date) {
    const dup = events.find(
      (ev) => ev.id !== excludeId && ev.type === "visita" && String(ev.speechNumber).trim() === String(form.speechNumber).trim() && Math.abs(new Date(ev.date) - new Date(form.date)) / 864e5 < 365
    );
    if (dup) {
      warnings.push({ key: "duplicate", text: `El discurso n\xBA ${form.speechNumber} ya se dio aqu\xED el ${formatDate(dup.date)}, con ${dup.speakerName}. Han pasado menos de 12 meses.` });
    }
  }
  if (form.speechNumber && unavailableBosquejos && unavailableBosquejos.includes(String(form.speechNumber).trim())) {
    warnings.push({ key: "unavailableBosquejo", text: `El bosquejo n\xBA ${form.speechNumber} est\xE1 marcado como no disponible.` });
  }
  if (form.type === "salida" && form.speakerName && form.date) {
    const period = ym(form.date);
    const count = events.filter(
      (ev) => ev.id !== excludeId && ev.type === "salida" && ev.speakerName?.trim().toLowerCase() === form.speakerName.trim().toLowerCase() && ym(ev.date) === period
    ).length;
    if (count >= 1) {
      warnings.push({ key: "frequency", text: `${form.speakerName} ya tiene ${count} salida(s) programada(s) ese mismo mes. Se recomienda no pasar de una salida mensual.` });
    }
    const speaker = speakers.find((s) => s.name.trim().toLowerCase() === form.speakerName.trim().toLowerCase());
    if (speaker?.blockedMonths?.includes(period)) {
      const original = events.find((ev) => ev.id === excludeId);
      const selfCausedBlock = original && original.type === "salida" && original.speakerName?.trim().toLowerCase() === form.speakerName.trim().toLowerCase() && ym(original.date) === period;
      if (!selfCausedBlock) {
        warnings.push({ key: "blocked", text: `${form.speakerName} pidi\xF3 no ser invitado durante ${MONTHS[Number(period.slice(5, 7)) - 1]} de ${period.slice(0, 4)}.` });
      }
    }
  }
  return warnings;
}
