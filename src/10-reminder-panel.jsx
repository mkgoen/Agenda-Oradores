/* ---------------------------------------------------------------
   Reminders panel
----------------------------------------------------------------*/
function ReminderPanel({ reminders, setReminders, onClose }) {
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const sorted = [...reminders].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

  const add = () => {
    if (!text.trim()) return;
    setReminders(r => [...r, { id: uid(), text: text.trim(), date: date || null, done: false }]);
    setText(""); setDate("");
  };
  const toggle = (id) => setReminders(r => r.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const remove = (id) => setReminders(r => r.filter(x => x.id !== id));

  return (
    <div className="absolute right-0 top-12 w-80 rounded-xl shadow-xl border z-40" style={{ background: COLORS.surface, borderColor: COLORS.line }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: COLORS.line }}>
        <span className="text-sm font-semibold">Recordatorios</span>
        <button onClick={onClose}><X size={16} style={{ color: COLORS.inkSoft }} /></button>
      </div>
      <div className="max-h-72 overflow-y-auto p-2 space-y-1">
        {sorted.map(r => (
          <div key={r.id} className="flex items-start gap-2 px-2 py-2 rounded-lg" style={{ background: COLORS.bg }}>
            <button onClick={() => toggle(r.id)} className="mt-0.5">
              {r.done ? <CheckCircle2 size={16} style={{ color: COLORS.teal }} /> : <Circle size={16} style={{ color: COLORS.inkSoft }} />}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-xs ${r.done ? "line-through opacity-50" : ""}`}>{r.text}</div>
              {r.date && <div className="text-[10px]" style={{ color: COLORS.inkSoft }}>{formatDate(r.date)}</div>}
            </div>
            <button onClick={() => remove(r.id)}><Trash2 size={13} style={{ color: COLORS.inkSoft }} /></button>
          </div>
        ))}
        {sorted.length === 0 && <div className="text-xs text-center py-4" style={{ color: COLORS.inkSoft }}>Sin recordatorios.</div>}
      </div>
      <div className="p-3 border-t space-y-2" style={{ borderColor: COLORS.line }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Nueva anotación…" className="ipt text-xs" />
        <div className="flex gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="ipt text-xs flex-1" />
          <button onClick={add} className="px-3 rounded-md text-xs font-medium text-white" style={{ background: COLORS.teal }}>Añadir</button>
        </div>
      </div>
    </div>
  );
}
