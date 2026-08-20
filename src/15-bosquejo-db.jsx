/* ---------------------------------------------------------------
   Base de datos de bosquejos (número -> título)
   -----------------------------------------------------------------
   Lista numerada 1-194 donde se puede escribir el título de cada
   bosquejo. Se usa luego para autocompletar el título en eventos e
   invitaciones cuando se introduce el número correspondiente.
----------------------------------------------------------------*/

function BosquejoDatabaseModal({ bosquejoTitles, setBosquejoTitles, onClose }) {
  const [search, setSearch] = useState("");
  const nums = useMemo(() => Array.from({ length: 194 }, (_, i) => String(i + 1)), []);
  const filtered = search.trim()
    ? nums.filter(n => n === search.trim() || (bosquejoTitles[n] || "").toLowerCase().includes(search.trim().toLowerCase()))
    : nums;

  const setTitle = (n, value) => setBosquejoTitles(prev => ({ ...prev, [n]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,20,15,0.45)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-xl flex flex-col" style={{ background: COLORS.surface, maxHeight: "min(90vh, 720px)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: COLORS.line }}>
          <span className="text-base font-semibold" style={{ fontFamily: "Fraunces, serif" }}>Base de datos de bosquejos</span>
          <button onClick={onClose}><X size={18} style={{ color: COLORS.inkSoft }} /></button>
        </div>
        <div className="px-5 pt-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
            <Search size={14} style={{ color: COLORS.inkSoft }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por número o título…"
              className="bg-transparent text-sm outline-none flex-1" />
          </div>
        </div>
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-1.5">
          {filtered.map(n => (
            <div key={n} className="flex items-center gap-2">
              <span className="text-xs font-mono flex-shrink-0" style={{ width: 34, color: COLORS.teal, fontWeight: 600 }}>{n}</span>
              <input value={bosquejoTitles[n] || ""} onChange={e => setTitle(n, e.target.value)}
                placeholder="Título del bosquejo…" className="ipt text-xs" />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-xs text-center py-6" style={{ color: COLORS.inkSoft }}>Sin coincidencias.</div>
          )}
        </div>
      </div>
    </div>
  );
}
