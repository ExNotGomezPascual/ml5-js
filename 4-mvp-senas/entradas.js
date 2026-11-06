// ==========================================================
// Convierte lo que ve handPose en una lista de números:
// la ENTRADA de la red neuronal.
// La usan las dos páginas (entrenar y escribir), así la red
// recibe siempre los números en el mismo orden.
// ==========================================================

const ANCHO = 640;
const ALTO = 480;

// Puntos de referencia de la mano (handPose los numera de 0 a 20)
const MUNECA = 0;
const BASE_DEDO_MEDIO = 9;

// Total de números que recibe la red: 21 puntos × 2 (x, y)
const TOTAL_ENTRADAS = 21 * 2;

// Recibe UNA mano y devuelve la lista de 42 números
function calcularEntradas(mano) {
  const puntos = mano.keypoints;

  // Punto de referencia: la muñeca. Escala: muñeca → base del dedo medio.
  //   Restar la muñeca = la posición de la mano en pantalla no importa.
  //   Dividir por la escala = la distancia a la cámara no importa.
  // Así la red solo ve la FORMA de la mano, que es lo que define la letra.
  const origen = puntos[MUNECA];
  const escala = dist(origen.x, origen.y, puntos[BASE_DEDO_MEDIO].x, puntos[BASE_DEDO_MEDIO].y) || 1;

  const entradas = [];
  for (const p of puntos) {
    entradas.push((p.x - origen.x) / escala);
    entradas.push((p.y - origen.y) / escala);
  }
  return entradas;
}

// Dibuja los huesos y puntos de la mano (para mostrar en la exposición)
function dibujarMano(mano, conexiones) {
  const puntos = mano.keypoints;
  stroke(255, 194, 75, 200);
  strokeWeight(3);
  for (const [a, b] of conexiones) {
    line(puntos[a].x, puntos[a].y, puntos[b].x, puntos[b].y);
  }
  noStroke();
  fill(255, 194, 75);
  for (const p of puntos) {
    circle(p.x, p.y, 9);
  }
  // La muñeca, que es el punto de referencia, en otro color
  fill(255, 122, 138);
  circle(puntos[MUNECA].x, puntos[MUNECA].y, 14);
}

// Mensajes encima de la cámara (cargando, errores)
function mostrarEstado(texto) {
  const caja = document.getElementById("estado");
  caja.textContent = texto;
  caja.hidden = false;
}

function ocultarEstado() {
  document.getElementById("estado").hidden = true;
}
