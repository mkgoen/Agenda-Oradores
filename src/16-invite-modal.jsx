/* ---------------------------------------------------------------
   Modal de invitación
   -----------------------------------------------------------------
   Se abre al pulsar "Invitar" en la ficha de un orador. De momento
   "Generar invitación" no hace nada más que cerrar esta ventana; en
   el futuro generará el PDF formal de la invitación.
----------------------------------------------------------------*/

function InviteModal({ speaker, bosquejoTitles, onClose }) {
  const options = speaker.bosquejos || [];
  const [speechNumber, setSpeechNumber] = useState(options[0] || "");
  const [date, setDate] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,20,15,0.45)" }}>
      <div className="w-full max-w-sm rounded-2xl shadow-xl flex flex-col" style={{ background: COLORS.surface }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: COLORS.line }}>
          <div>
            <div className="text-base font-semibold" style={{ fontFamily: "Fraunces, serif" }}>Invitar a {speaker.name}</div>
            <div className="text-[11px]" style={{ color: COLORS.inkSoft }}>{speaker.origin || "—"}</div>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: COLORS.inkSoft }} /></button>
        </div>

        <div className="p-5 space-y-3">
          <Field label="Nº de bosquejo disponible">
            {options.length === 0 ? (
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "#FBF0E4", color: "#8A5A1E" }}>
                Este orador no tiene bosquejos registrados todavía.
              </div>
            ) : (
              <select value={speechNumber} onChange={e => setSpeechNumber(e.target.value)} className="ipt">
                {options.map(n => (
                  <option key={n} value={n}>{n} - {bosquejoTitles?.[n] || "(sin título)"}</option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Fecha">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="ipt" />
          </Field>
        </div>

        <div className="px-5 py-4 border-t" style={{ borderColor: COLORS.line }}>
          <button onClick={onClose} className="w-full py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: COLORS.teal }}>
            Generar invitación
          </button>
          <p className="text-[10px] text-center mt-2" style={{ color: COLORS.inkSoft }}>
            Por ahora solo cierra esta ventana. Próximamente generará un PDF con la invitación formal.
          </p>
        </div>
      </div>
    </div>
  );
}
