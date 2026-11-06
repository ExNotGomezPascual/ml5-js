// ==========================================================
// Navegación de la presentación. No tiene nada de IA.
// - Resalta en el índice la sección que se está viendo.
// - Botones y teclas ← → para ir a la sección anterior/siguiente.
// - En móvil, el índice se abre con un botón.
// ==========================================================

const secciones = [...document.querySelectorAll(".seccion")];
const enlaces = [...document.querySelectorAll(".indice a[href^='#']")];
const indice = document.getElementById("indice");
const botonIndice = document.getElementById("abrir-indice");

let actual = 0; // posición de la sección que se está viendo

// 1. Saber qué sección está en pantalla
const observador = new IntersectionObserver(
  (entradas) => {
    for (const entrada of entradas) {
      if (entrada.isIntersecting) {
        actual = secciones.indexOf(entrada.target);
        marcarEnlace(entrada.target.id);
      }
    }
  },
  { rootMargin: "-40% 0px -55% 0px" } // la sección que cruza el centro de la pantalla
);
secciones.forEach((s) => observador.observe(s));

function marcarEnlace(id) {
  for (const enlace of enlaces) {
    if (enlace.getAttribute("href") === "#" + id) {
      enlace.setAttribute("aria-current", "true");
    } else {
      enlace.removeAttribute("aria-current");
    }
  }
}

// 2. Ir a otra sección
function irA(posicion) {
  const destino = secciones[Math.max(0, Math.min(secciones.length - 1, posicion))];
  destino.scrollIntoView();
  // Movemos el foco al título, así el lector de pantalla también avanza
  const titulo = destino.querySelector("h1, h2");
  if (titulo) titulo.focus({ preventScroll: true });
  history.replaceState(null, "", "#" + destino.id);
}

document.getElementById("anterior").onclick = () => irA(actual - 1);
document.getElementById("siguiente").onclick = () => irA(actual + 1);

document.addEventListener("keydown", (evento) => {
  if (evento.altKey || evento.ctrlKey || evento.metaKey) return;
  if (evento.key === "ArrowRight") irA(actual + 1);
  if (evento.key === "ArrowLeft") irA(actual - 1);
  if (evento.key === "Escape") cerrarIndice();
});

// 3. Índice en móvil
botonIndice.onclick = () => {
  const abierto = indice.classList.toggle("abierto");
  botonIndice.setAttribute("aria-expanded", abierto);
};
function cerrarIndice() {
  indice.classList.remove("abierto");
  botonIndice.setAttribute("aria-expanded", "false");
}
enlaces.forEach((enlace) => enlace.addEventListener("click", cerrarIndice));
