/* ---------------------------------------------------------------
   Iconos
   -----------------------------------------------------------------
   La versión dentro de Claude usa la librería "lucide-react", pensada
   para proyectos con empaquetador (Vite/Webpack). Aquí, al no usar
   ninguno (justo para poder abrir el .html con doble clic), se
   sustituye por estos iconos propios: SVG sencillos con el mismo
   estilo (trazo, sin relleno) y la misma API (prop "size" y "style"),
   así que el resto del código no necesita cambiar ni una línea.
----------------------------------------------------------------*/

function Icon({ paths, size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      {paths}
    </svg>
  );
}

function Bell(props) {
  return <Icon {...props} paths={<>
    <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>} />;
}
function Plus(props) {
  return <Icon {...props} paths={<><path d="M12 5v14" /><path d="M5 12h14" /></>} />;
}
function X(props) {
  return <Icon {...props} paths={<><path d="M18 6 6 18" /><path d="M6 6l12 12" /></>} />;
}
function Trash2(props) {
  return <Icon {...props} paths={<>
    <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
  </>} />;
}
function AlertTriangle(props) {
  return <Icon {...props} paths={<>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </>} />;
}
function Search(props) {
  return <Icon {...props} paths={<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>} />;
}
function ChevronLeft(props) {
  return <Icon {...props} paths={<path d="M15 18l-6-6 6-6" />} />;
}
function ChevronRight(props) {
  return <Icon {...props} paths={<path d="M9 18l6-6-6-6" />} />;
}
function MapPin(props) {
  return <Icon {...props} paths={<>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </>} />;
}
function ArrowDownRight(props) {
  return <Icon {...props} paths={<><path d="M7 7l10 10" /><path d="M17 7v10H7" /></>} />;
}
function ArrowUpRight(props) {
  return <Icon {...props} paths={<><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>} />;
}
function ArrowUp(props) {
  return <Icon {...props} paths={<><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></>} />;
}
function ArrowDown(props) {
  return <Icon {...props} paths={<><path d="M12 5v14" /><path d="M19 12l-7 7-7-7" /></>} />;
}
function CalendarDays(props) {
  return <Icon {...props} paths={<>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
    <path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" />
  </>} />;
}
function Users(props) {
  return <Icon {...props} paths={<>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>} />;
}
function LayoutGrid(props) {
  return <Icon {...props} paths={<>
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
  </>} />;
}
function CheckCircle2(props) {
  return <Icon {...props} paths={<><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>} />;
}
function Circle(props) {
  return <Icon {...props} paths={<circle cx="12" cy="12" r="10" />} />;
}
function Moon(props) {
  return <Icon {...props} paths={<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />} />;
}
function Sun(props) {
  return <Icon {...props} paths={<>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.9 4.9 1.4 1.4" /><path d="m17.7 17.7 1.4 1.4" />
    <path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.3 17.7-1.4 1.4" /><path d="m19.1 4.9-1.4 1.4" />
  </>} />;
}
function Hash(props) {
  return <Icon {...props} paths={<>
    <path d="M4 9h16" /><path d="M4 15h16" /><path d="M10 3 8 21" /><path d="M16 3l-2 18" />
  </>} />;
}
