function AddSpeakerModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [origin, setOrigin] = useState("");
  const [isLocal, setIsLocal] = useState(false);
  const [bosquejos, setBosquejos] = useState([]);
  const [newBosquejo, setNewBosquejo] = useState("");
  const addBosquejo = () => {
    const n = newBosquejo.trim();
    if (!n || bosquejos.includes(n)) {
      setNewBosquejo("");
      return;
    }
    setBosquejos((b) => [...b, n]);
    setNewBosquejo("");
  };
  const removeBosquejo = (n) => setBosquejos((b) => b.filter((x) => x !== n));
  const handleSave = () => {
    onSave({
      id: uid(),
      name: name.trim() || "Nuevo orador",
      phone: phone.trim(),
      origin: origin.trim(),
      isLocal,
      blockedMonths: [],
      bosquejos
    });
    onClose();
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: { background: "rgba(20,20,15,0.45)" } }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-md rounded-2xl shadow-xl flex flex-col", style: { background: COLORS.surface, maxHeight: "min(90vh, 640px)" } }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b flex-shrink-0", style: { borderColor: COLORS.line } }, /* @__PURE__ */ React.createElement("span", { className: "text-base font-semibold", style: { fontFamily: "Fraunces, serif" } }, "A\xF1adir orador"), /* @__PURE__ */ React.createElement("button", { onClick: onClose }, /* @__PURE__ */ React.createElement(X, { size: 18, style: { color: COLORS.inkSoft } }))), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-3 overflow-y-auto flex-1 min-h-0" }, /* @__PURE__ */ React.createElement(Field, { label: "Nombre" }, /* @__PURE__ */ React.createElement("input", { value: name, onChange: (e) => setName(e.target.value), className: "ipt", autoFocus: true })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement(Field, { label: "Tel\xE9fono" }, /* @__PURE__ */ React.createElement("input", { value: phone, onChange: (e) => setPhone(e.target.value), className: "ipt" })), /* @__PURE__ */ React.createElement(Field, { label: "Lugar de origen" }, /* @__PURE__ */ React.createElement("input", { value: origin, onChange: (e) => setOrigin(e.target.value), className: "ipt" }))), /* @__PURE__ */ React.createElement(Field, { label: "Tipo" }, /* @__PURE__ */ React.createElement("select", { value: isLocal ? "local" : "externo", onChange: (e) => setIsLocal(e.target.value === "local"), className: "ipt" }, /* @__PURE__ */ React.createElement("option", { value: "local" }, "Orador local"), /* @__PURE__ */ React.createElement("option", { value: "externo" }, "Orador externo"))), /* @__PURE__ */ React.createElement(Field, { label: "Bosquejos que dispone" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 mb-2" }, bosquejos.map((n) => /* @__PURE__ */ React.createElement("span", { key: n, className: "flex items-center gap-1 text-[11px] font-mono pl-2.5 pr-1 py-1 rounded-full", style: { background: COLORS.tealSoft, color: COLORS.teal } }, n, /* @__PURE__ */ React.createElement("button", { onClick: () => removeBosquejo(n), className: "rounded-full p-0.5 hover:bg-black/10" }, /* @__PURE__ */ React.createElement(X, { size: 10 })))), bosquejos.length === 0 && /* @__PURE__ */ React.createElement("span", { className: "text-xs", style: { color: COLORS.inkSoft } }, "Ninguno todav\xEDa.")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: newBosquejo,
      onChange: (e) => setNewBosquejo(e.target.value.replace(/[^0-9]/g, "")),
      onKeyDown: (e) => {
        if (e.key === "Enter") addBosquejo();
      },
      inputMode: "numeric",
      placeholder: "N\xBA de bosquejo",
      className: "ipt text-xs",
      style: { maxWidth: 140 }
    }
  ), /* @__PURE__ */ React.createElement("button", { onClick: addBosquejo, className: "px-3 rounded-md text-xs font-medium", style: { background: COLORS.tealSoft, color: COLORS.teal } }, "A\xF1adir")))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end px-5 py-4 border-t flex-shrink-0", style: { borderColor: COLORS.line } }, /* @__PURE__ */ React.createElement("button", { onClick: handleSave, className: "px-4 py-2 rounded-lg text-sm font-medium text-white", style: { background: COLORS.teal } }, "Guardar"))));
}
