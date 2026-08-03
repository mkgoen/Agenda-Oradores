const LOCAL_STORAGE_KEY = "agenda-oradores-local-v1";
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
function openAgendaFile() {
  return new Promise((resolve, reject) => {
    const input = getOpenFileInput();
    input.value = "";
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) {
        reject(new Error("No se seleccion\xF3 ning\xFAn archivo."));
        return;
      }
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
  setTimeout(() => URL.revokeObjectURL(url), 2e3);
}
