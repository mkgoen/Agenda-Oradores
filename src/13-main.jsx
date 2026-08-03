/* ---------------------------------------------------------------
   Punto de entrada
   -----------------------------------------------------------------
   Este es el último script que se ejecuta. Para entonces, todas las
   funciones y componentes de los demás archivos (cargados antes, en
   orden, desde index.html) ya existen en el ámbito global, así que
   aquí solo queda "montar" <App /> dentro del <div id="root">.
----------------------------------------------------------------*/
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
