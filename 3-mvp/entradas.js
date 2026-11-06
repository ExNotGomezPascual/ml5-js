// ==========================================================
// Convierte lo que ven faceMesh y handPose en una lista de
// números: la ENTRADA de la red neuronal.
// La usan las dos páginas (entrenar y filtro), así la red
// recibe siempre los números en el mismo orden.
// ==========================================================

const ANCHO = 640;
const ALTO = 480;

// De los 468 puntos de la cara usamos solo 42: los que cambian
// con la expresión (boca, ojos, cejas) y el contorno de la cara.
// Menos números = la red aprende con menos ejemplos.
const PUNTOS_BOCA = [61, 291, 0, 17, 13, 14, 78, 308, 81, 311, 178, 402];
const PUNTOS_OJOS = [33, 133, 159, 145, 160, 144, 362, 263, 386, 374, 385, 380];
const PUNTOS_CEJAS = [70, 63, 105, 66, 107, 300, 293, 334, 296, 336];
const PUNTOS_CONTORNO = [1, 4, 10, 152, 234, 454, 172, 397];
const PUNTOS_CARA = [...PUNTOS_BOCA, ...PUNTOS_OJOS, ...PUNTOS_CEJAS, ...PUNTOS_CONTORNO];

const NARIZ = 1;
const MEJILLA_IZQ = 234;
const MEJILLA_DER = 454;

// Total de números que recibe la red:
// cara: 1 (¿hay cara?) + 42 puntos × 2
// manos: 2 manos × (1 (¿hay mano?) + 21 puntos × 2)
const TOTAL_ENTRADAS = 1 + PUNTOS_CARA.length * 2 + 2 * (1 + 21 * 2);

// Recibe los resultados de los modelos y devuelve la lista de números
function calcularEntradas(caras, manos) {
  const entradas = [];

  // 1. Punto de referencia: la nariz, y la escala: el ancho de la cara.
  //    Restar la nariz = la posición en pantalla no importa.
  //    Dividir por el ancho = la distancia a la cámara no importa.
  //    Si no hay cara, usamos el centro de la pantalla.
  let centroX = ANCHO / 2;
  let centroY = ALTO / 2;
  let escala = ANCHO / 4;

  if (caras.length > 0) {
    const puntos = caras[0].keypoints;
    centroX = puntos[NARIZ].x;
    centroY = puntos[NARIZ].y;
    escala = dist(puntos[MEJILLA_IZQ].x, puntos[MEJILLA_IZQ].y, puntos[MEJILLA_DER].x, puntos[MEJILLA_DER].y);

    entradas.push(1); // sí hay cara
    for (const i of PUNTOS_CARA) {
      entradas.push((puntos[i].x - centroX) / escala);
      entradas.push((puntos[i].y - centroY) / escala);
    }
  } else {
    entradas.push(0); // no hay cara: llenamos con ceros
    for (let i = 0; i < PUNTOS_CARA.length; i++) {
      entradas.push(0, 0);
    }
  }

  // 2. Manos: también relativas a la nariz, para que la red sepa
  //    DÓNDE está la mano respecto a la cara (ej. mano en la mejilla).
  //    Ordenamos las manos de izquierda a derecha para que siempre
  //    lleguen en el mismo orden.
  const ordenadas = [...manos].sort((a, b) => a.keypoints[0].x - b.keypoints[0].x);

  for (let m = 0; m < 2; m++) {
    const mano = ordenadas[m];
    if (mano) {
      entradas.push(1); // sí hay mano
      for (const p of mano.keypoints) {
        entradas.push((p.x - centroX) / escala);
        entradas.push((p.y - centroY) / escala);
      }
    } else {
      entradas.push(0); // no hay mano
      for (let i = 0; i < 21; i++) {
        entradas.push(0, 0);
      }
    }
  }

  return entradas;
}

// Dibuja los puntos que usa la red (para mostrar en la exposición)
function dibujarPuntos(caras, manos) {
  noStroke();
  if (caras.length > 0) {
    fill(255, 194, 75);
    for (const i of PUNTOS_CARA) {
      const p = caras[0].keypoints[i];
      circle(p.x, p.y, 5);
    }
  }
  fill(255, 122, 138);
  for (const mano of manos) {
    for (const p of mano.keypoints) {
      circle(p.x, p.y, 7);
    }
  }
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
