/* ---------------------------------------------------------------
   Modal "Añadir orador"
   -----------------------------------------------------------------
   Formulario con los campos predefinidos (nombre, teléfono, lugar de
   origen, tipo y bosquejos). Al pulsar "Guardar" se crea el orador
   y se cierra el formulario.
----------------------------------------------------------------*/

function AddSpeakerModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [origin, setOrigin] = useState("");
  const [isLocal, setIsLocal] = useState(false);
  const [bosquejos, setBosquejos] = useState([]);
  const [newBosquejo, setNewBosquejo] = useState("");

  const addBosquejo = () => {
    const n = newBosquejo.trim();
    if (!n || bosquejos.includes(n)) { setNewBosquejo(""); return; }
    setBosquejos(b => [...b, n]);
    setNewBosquejo("");
  };
  const removeBosquejo = (n) => setBosquejos(b => b.filter(x => x !== n));

  const handleSave = () => {
    onSave({
      id: uid(),
      name: name.trim() || "Nuevo orador",
      phone: phone.trim(),
      origin: origin.trim(),
      isLocal,
      blockedMonths: [],
      bosquejos,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,20,15,0.45)" }}>
      <div className="w-full max-w-md rounded-2xl shadow-xl flex flex-col" style={{ background: COLORS.surface, maxHeight: "min(90vh, 640px)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: COLORS.line }}>
          <span className="text-base font-semibold" style={{ fontFamily: "Fraunces, serif" }}>Añadir orador</span>
          <button onClick={onClose}><X size={18} style={{ color: COLORS.inkSoft }} /></button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto flex-1 min-h-0">
          <Field label="Nombre">
            <input value={name} onChange={e => setName(e.target.value)} className="ipt" autoFocus />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Teléfono">
              <input value={phone} onChange={e => setPhone(e.target.value)} className="ipt" />
            </Field>
            <Field label="Lugar de origen">
              <input value={origin} onChange={e => setOrigin(e.target.value)} className="ipt" />
            </Field>
          </div>
          <Field label="Tipo">
            <select value={isLocal ? "local" : "externo"} onChange={e => setIsLocal(e.target.value === "local")} className="ipt">
              <option value="local">Orador local</option>
              <option value="externo">Orador externo</option>
            </select>
          </Field>

          <Field label="Bosquejos que dispone">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {bosquejos.map(n => (
                <span key={n} className="flex items-center gap-1 text-[11px] font-mono pl-2.5 pr-1 py-1 rounded-full" style={{ background: COLORS.tealSoft, color: COLORS.teal }}>
                  {n}
                  <button onClick={() => removeBosquejo(n)} className="rounded-full p-0.5 hover:bg-black/10">
                    <X size={10} />
                  </button>
                </span>
              ))}
              {bosquejos.length === 0 && <span className="text-xs" style={{ color: COLORS.inkSoft }}>Ninguno todavía.</span>}
            </div>
            <div className="flex gap-2">
              <input value={newBosquejo} onChange={e => setNewBosquejo(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={e => { if (e.key === "Enter") addBosquejo(); }}
                inputMode="numeric" placeholder="Nº de bosquejo" className="ipt text-xs" style={{ maxWidth: 140 }} />
              <button onClick={addBosquejo} className="px-3 rounded-md text-xs font-medium" style={{ background: COLORS.tealSoft, color: COLORS.teal }}>
                Añadir
              </button>
            </div>
          </Field>
        </div>

        <div className="flex justify-end px-5 py-4 border-t flex-shrink-0" style={{ borderColor: COLORS.line }}>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: COLORS.teal }}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
