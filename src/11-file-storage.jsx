/* ---------------------------------------------------------------
   Almacenamiento local
   -----------------------------------------------------------------
   Esta app usa DOS mecanismos de guardado complementarios:

   1) AUTOGUARDADO SILENCIOSO (localStorage del navegador): cada cambio
      se guarda solo, igual que ocurría dentro de Claude. Así, si
      cierras y vuelves a abrir el mismo archivo index.html en el
      mismo navegador, todo sigue ahí tal cual lo dejaste.

   2) ABRIR / GUARDAR (archivo real elegido por ti): para tener una
      copia tuya en la carpeta que quieras (por ejemplo, para llevarla
      a otro ordenador, o guardarla en OneDrive/Google Drive). Usa el
      selector de archivos clásico del navegador, que funciona igual
      de bien abriendo el .html con doble clic, sin necesidad de
      ningún servidor local ni de la API experimental "File System
      Access" (que exige un contexto seguro/HTTPS y no siempre
      funciona al abrir un archivo directamente con file://).
----------------------------------------------------------------*/

const LOCAL_STORAGE_KEY = "agenda-oradores-local-v1";

// --- 1) Autoguardado en localStorage ---------------------------------

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("No se pudo leer el almacenamiento local", e);
    return null;
  }
}

function saveToLocalStorage(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("No se pudo guardar en el almacenamiento local", e);
    return false;
  }
}

// --- 2) Abrir: seleccionar y leer un archivo elegido por el usuario ---

// input[type=file] oculto y reutilizable, creado una sola vez.
let _openFileInput = null;
function getOpenFileInput() {
  if (_openFileInput) return _openFileInput;
  _openFileInput = document.createElement("input");
  _openFileInput.type = "file";
  _openFileInput.accept = ".json,.txt,application/json,text/plain";
  _openFileInput.style.display = "none";
  document.body.appendChild(_openFileInput);
  return _openFileInput;
}

// Muestra el selector de archivos; devuelve una Promise con los datos
// ya parseados (o rechaza si el usuario cancela o el archivo no es válido).
function openAgendaFile() {
  return new Promise((resolve, reject) => {
    const input = getOpenFileInput();
    input.value = ""; // permite volver a elegir el mismo archivo si hace falta
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) { reject(new Error("No se seleccionó ningún archivo.")); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.speakers || !data.events) {
            reject(new Error("El archivo no tiene el formato esperado (faltan oradores o eventos)."));
            return;
          }
          resolve(data);
        } catch (err) {
          reject(new Error("No se pudo leer el archivo: " + err.message));
        }
      };
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
      reader.readAsText(file, "utf-8");
    };
    input.click();
  });
}

// --- 3) Guardar: descargar el estado actual como archivo .json --------

function saveAgendaFile(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "agenda-oradores.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Se libera la URL temporal un instante después para que la descarga
  // haya tenido tiempo de iniciarse.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
