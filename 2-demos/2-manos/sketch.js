// ==========================================================
// DEMO 2 · handPose
// El modelo encuentra la mano y devuelve 21 puntos (x, y).
// Los mostramos como una lista de 42 números: así los verá la red.
// ==========================================================

const ANCHO = 640;
const ALTO = 480;

let video;
let handPose;
let manos = [];
let conexiones; // pares de puntos que forman los "huesos" de la mano

function preload() {
  handPose = ml5.handPose({ maxHands: 1, flipped: true });
}

function setup() {
  const lienzo = createCanvas(ANCHO, ALTO);
  lienzo.parent("camara");

  mostrarEstado("Esperando la cámara…");
  revisarCamara();

  video = createCapture(VIDEO, { flipped: true }, ocultarEstado);
  video.size(ANCHO, ALTO);
  video.hide();

  conexiones = handPose.getConnections();
  handPose.detectStart(video, recibirManos);
}

function recibirManos(resultados) {
  manos = resultados;
}

function draw() {
  image(video, 0, 0, width, height);

  if (manos.length === 0) {
    actualizarPanel(null);
    return;
  }

  const mano = manos[0];
  const puntos = mano.keypoints;

  // Dibujamos los huesos (líneas entre puntos)
  stroke(255, 194, 75, 200);
  strokeWeight(3);
  for (const [a, b] of conexiones) {
    line(puntos[a].x, puntos[a].y, puntos[b].x, puntos[b].y);
  }

  // Dibujamos cada punto con su número
  for (let i = 0; i < puntos.length; i++) {
    noStroke();
    fill(i === 0 ? color(255, 122, 138) : color(255, 194, 75));
    circle(puntos[i].x, puntos[i].y, i === 0 ? 14 : 10);
    fill(255);
    textSize(12);
    text(i, puntos[i].x + 8, puntos[i].y - 6);
  }

  actualizarPanel(mano);
}

// Convertimos los 21 puntos en una lista plana: [x0, y0, x1, y1, ...]
function aplanar(puntos) {
  const lista = [];
  for (const p of puntos) {
    lista.push(p.x, p.y);
  }
  return lista;
}

function actualizarPanel(mano) {
  // Actualizamos la lista cada 6 cuadros para que se pueda leer
  if (frameCount % 6 !== 0) return;

  if (mano === null) {
    document.getElementById("total").textContent = "0";
    escribirValor("confianza", null);
    document.getElementById("numeros").textContent = "Muestren una mano a la cámara.";
    return;
  }

  const lista = aplanar(mano.keypoints);
  document.getElementById("total").textContent = `${mano.keypoints.length} → ${lista.length} números`;
  escribirValor("confianza", mano.confidence ?? mano.score ?? 0);
  document.getElementById("numeros").textContent =
    "[" + lista.map((n) => Math.round(n)).join(", ") + "]";
}
