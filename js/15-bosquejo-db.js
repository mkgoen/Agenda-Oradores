function BosquejoDatabaseModal({ bosquejoTitles, setBosquejoTitles, onClose }) {
  const [search, setSearch] = useState("");
  const nums = useMemo(() => Array.from({ length: 194 }, (_, i) => String(i + 1)), []);
  const filtered = search.trim() ? nums.filter((n) => n === search.trim() || (bosquejoTitles[n] || "").toLowerCase().includes(search.trim().toLowerCase())) : nums;
  const setTitle = (n, value) => setBosquejoTitles((prev) => ({ ...prev, [n]: value }));
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: { background: "rgba(20,20,15,0.45)" } }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-lg rounded-2xl shadow-xl flex flex-col", style: { background: COLORS.surface, maxHeight: "min(90vh, 720px)" } }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b flex-shrink-0", style: { borderColor: COLORS.line } }, /* @__PURE__ */ React.createElement("span", { className: "text-base font-semibold", style: { fontFamily: "Fraunces, serif" } }, "Base de datos de bosquejos"), /* @__PURE__ */ React.createElement("button", { onClick: onClose }, /* @__PURE__ */ React.createElement(X, { size: 18, style: { color: COLORS.inkSoft } }))), /* @__PURE__ */ React.createElement("div", { className: "px-5 pt-3 flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 px-2 py-1.5 rounded-lg", style: { background: COLORS.bg, border: `1px solid ${COLORS.line}` } }, /* @__PURE__ */ React.createElement(Search, { size: 14, style: { color: COLORS.inkSoft } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      value: search,
      onChange: (e) => setSearch(e.target.value),
      placeholder: "Buscar por n\xFAmero o t\xEDtulo\u2026",
      className: "bg-transparent text-sm outline-none flex-1"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "p-5 overflow-y-auto flex-1 min-h-0 space-y-1.5" }, filtered.map((n) => /* @__PURE__ */ React.createElement("div", { key: n, className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono flex-shrink-0", style: { width: 34, color: COLORS.teal, fontWeight: 600 } }, n), /* @__PURE__ */ React.createElement(
    "input",
    {
      value: bosquejoTitles[n] || "",
      onChange: (e) => setTitle(n, e.target.value),
      placeholder: "T\xEDtulo del bosquejo\u2026",
      className: "ipt text-xs"
    }
  ))), filtered.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "text-xs text-center py-6", style: { color: COLORS.inkSoft } }, "Sin coincidencias."))));
}
