// ==========================================================
// Funciones de apoyo que usan las tres demos.
// No tienen nada de IA: solo actualizan textos y barras.
// ==========================================================

// Muestra un mensaje encima de la cámara (cargando, error, etc.)
function mostrarEstado(texto) {
  const caja = document.getElementById("estado");
  caja.textContent = texto;
  caja.hidden = false;
}

function ocultarEstado() {
  document.getElementById("estado").hidden = true;
}

// Escribe un número con 3 decimales, o una raya si no hay dato
function escribirValor(id, valor) {
  const texto = valor === null ? "—" : valor.toFixed(3);
  document.getElementById(id).textContent = texto;
}

// Llena una barra según el valor, entre un mínimo y un máximo
function actualizarMedidor(idBarra, valor, minimo, maximo) {
  let porcentaje = 0;
  if (valor !== null) {
    porcentaje = ((valor - minimo) / (maximo - minimo)) * 100;
    porcentaje = Math.max(0, Math.min(100, porcentaje));
  }
  document.getElementById(idBarra).style.width = porcentaje + "%";
}

// Coloca la línea blanca del umbral dentro de la barra
function ubicarUmbral(idUmbral, umbral, minimo, maximo) {
  const porcentaje = ((umbral - minimo) / (maximo - minimo)) * 100;
  document.getElementById(idUmbral).style.left = porcentaje + "%";
}

// Enciende o apaga la "luz" de una regla
function marcarRegla(idRegla, seCumple) {
  document.getElementById(idRegla).classList.toggle("cumple", seCumple);
}

// Comprueba si el navegador nos deja usar la cámara.
// Si el permiso fue negado, mostramos cómo arreglarlo.
function revisarCamara() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    mostrarEstado("Este navegador no permite usar la cámara aquí. Abran la página con Live Server (http://127.0.0.1…), no haciendo doble clic en el archivo.");
    return;
  }
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => stream.getTracks().forEach((pista) => pista.stop()))
    .catch(() => {
      mostrarEstado("No hay acceso a la cámara. Hagan clic en el candado de la barra de dirección, permitan la cámara y recarguen la página.");
    });
}

// Distancia entre dos puntos {x, y}
function distancia(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
