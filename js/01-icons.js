function Icon({ paths, size = 16, style, className }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style,
      className
    },
    paths
  );
}
function Bell(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" }), /* @__PURE__ */ React.createElement("path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" })) });
}
function Plus(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M12 5v14" }), /* @__PURE__ */ React.createElement("path", { d: "M5 12h14" })) });
}
function X(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M18 6 6 18" }), /* @__PURE__ */ React.createElement("path", { d: "M6 6l12 12" })) });
}
function Trash2(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M3 6h18" }), /* @__PURE__ */ React.createElement("path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }), /* @__PURE__ */ React.createElement("path", { d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" }), /* @__PURE__ */ React.createElement("path", { d: "M10 11v6" }), /* @__PURE__ */ React.createElement("path", { d: "M14 11v6" })) });
}
function AlertTriangle(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" }), /* @__PURE__ */ React.createElement("path", { d: "M12 9v4" }), /* @__PURE__ */ React.createElement("path", { d: "M12 17h.01" })) });
}
function Search(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "11", cy: "11", r: "7" }), /* @__PURE__ */ React.createElement("path", { d: "m21 21-4.3-4.3" })) });
}
function ChevronLeft(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement("path", { d: "M15 18l-6-6 6-6" }) });
}
function ChevronRight(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement("path", { d: "M9 18l6-6-6-6" }) });
}
function MapPin(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "10", r: "3" })) });
}
function ArrowDownRight(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M7 7l10 10" }), /* @__PURE__ */ React.createElement("path", { d: "M17 7v10H7" })) });
}
function ArrowUpRight(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M7 17 17 7" }), /* @__PURE__ */ React.createElement("path", { d: "M7 7h10v10" })) });
}
function ArrowUp(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M12 19V5" }), /* @__PURE__ */ React.createElement("path", { d: "M5 12l7-7 7 7" })) });
}
function ArrowDown(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M12 5v14" }), /* @__PURE__ */ React.createElement("path", { d: "M19 12l-7 7-7-7" })) });
}
function CalendarDays(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M16 2v4" }), /* @__PURE__ */ React.createElement("path", { d: "M8 2v4" }), /* @__PURE__ */ React.createElement("path", { d: "M3 10h18" }), /* @__PURE__ */ React.createElement("path", { d: "M8 14h.01" }), /* @__PURE__ */ React.createElement("path", { d: "M12 14h.01" }), /* @__PURE__ */ React.createElement("path", { d: "M16 14h.01" })) });
}
function Users(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "7", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }), /* @__PURE__ */ React.createElement("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })) });
}
function LayoutGrid(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" })) });
}
function CheckCircle2(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("path", { d: "m9 12 2 2 4-4" })) });
}
function Circle(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }) });
}
function Moon(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement("path", { d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" }) });
}
function Sun(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M12 2v2" }), /* @__PURE__ */ React.createElement("path", { d: "M12 20v2" }), /* @__PURE__ */ React.createElement("path", { d: "m4.9 4.9 1.4 1.4" }), /* @__PURE__ */ React.createElement("path", { d: "m17.7 17.7 1.4 1.4" }), /* @__PURE__ */ React.createElement("path", { d: "M2 12h2" }), /* @__PURE__ */ React.createElement("path", { d: "M20 12h2" }), /* @__PURE__ */ React.createElement("path", { d: "m6.3 17.7-1.4 1.4" }), /* @__PURE__ */ React.createElement("path", { d: "m19.1 4.9-1.4 1.4" })) });
}
function Hash(props) {
  return /* @__PURE__ */ React.createElement(Icon, { ...props, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M4 9h16" }), /* @__PURE__ */ React.createElement("path", { d: "M4 15h16" }), /* @__PURE__ */ React.createElement("path", { d: "M10 3 8 21" }), /* @__PURE__ */ React.createElement("path", { d: "M16 3l-2 18" })) });
}
