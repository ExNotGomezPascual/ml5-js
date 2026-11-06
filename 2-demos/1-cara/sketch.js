// ==========================================================
// DEMO 1 · faceMesh
// El modelo encuentra la cara y devuelve 468 puntos (x, y).
// Con esos puntos escribimos dos reglas: boca abierta y sonrisa.
// ==========================================================

const ANCHO = 640;
const ALTO = 480;

// Umbrales: ajústenlos mirando los números del panel en vivo
const UMBRAL_BOCA = 0.08;     // apertura mayor a esto = boca abierta
const UMBRAL_SONRISA = 0.45;  // ancho mayor a esto = sonrisa

// Rango que muestran las barras del panel
const RANGO_BOCA = [0, 0.25];
const RANGO_SONRISA = [0.3, 0.6];

// Números de los puntos que nos interesan (el modelo los numera de 0 a 467)
const LABIO_ARRIBA = 13;
const LABIO_ABAJO = 14;
const COMISURA_IZQ = 61;
const COMISURA_DER = 291;
const FRENTE = 10;
const MENTON = 152;
const MEJILLA_IZQ = 234;
const MEJILLA_DER = 454;

let video;
let faceMesh;
let caras = [];

// preload() corre antes que todo: aquí cargamos el modelo
function preload() {
  // flipped: true hace que los puntos coincidan con el video en modo espejo
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}

function setup() {
  const lienzo = createCanvas(ANCHO, ALTO);
  lienzo.parent("camara");

  mostrarEstado("Esperando la cámara…");
  revisarCamara();

  // Encendemos la cámara en modo espejo
  video = createCapture(VIDEO, { flipped: true }, ocultarEstado);
  video.size(ANCHO, ALTO);
  video.hide(); // ocultamos el <video> original: lo dibujamos nosotros

  // Le pedimos al modelo que analice cada fotograma sin parar
  faceMesh.detectStart(video, recibirCaras);

  ubicarUmbral("umbral-apertura", UMBRAL_BOCA, ...RANGO_BOCA);
  ubicarUmbral("umbral-sonrisa", UMBRAL_SONRISA, ...RANGO_SONRISA);
}

// El modelo llama a esta función cada vez que tiene resultados
function recibirCaras(resultados) {
  caras = resultados;
}

function draw() {
  image(video, 0, 0, width, height);

  if (caras.length === 0) {
    actualizarPanel(null);
    return;
  }

  const puntos = caras[0].keypoints;

  // 1. Dibujamos los 468 puntos
  noStroke();
  fill(255, 194, 75, 170);
  for (const p of puntos) {
    circle(p.x, p.y, 3);
  }

  // 2. Medimos el tamaño de la cara (para que la regla no dependa de la distancia)
  const altoCara = distancia(puntos[FRENTE], puntos[MENTON]);
  const anchoCara = distancia(puntos[MEJILLA_IZQ], puntos[MEJILLA_DER]);

  // 3. Medimos la boca y dividimos entre el tamaño de la cara
  const apertura = distancia(puntos[LABIO_ARRIBA], puntos[LABIO_ABAJO]) / altoCara;
  const sonrisa = distancia(puntos[COMISURA_IZQ], puntos[COMISURA_DER]) / anchoCara;

  // 4. Resaltamos los puntos que usa la regla
  stroke(255, 122, 138);
  strokeWeight(2);
  linea(puntos[LABIO_ARRIBA], puntos[LABIO_ABAJO]);
  linea(puntos[COMISURA_IZQ], puntos[COMISURA_DER]);
  noStroke();
  fill(255, 122, 138);
  for (const i of [LABIO_ARRIBA, LABIO_ABAJO, COMISURA_IZQ, COMISURA_DER]) {
    circle(puntos[i].x, puntos[i].y, 9);
  }

  actualizarPanel({ total: puntos.length, apertura, sonrisa });
}

function linea(a, b) {
  line(a.x, a.y, b.x, b.y);
}

function actualizarPanel(datos) {
  if (datos === null) {
    document.getElementById("total").textContent = "0";
    escribirValor("apertura", null);
    escribirValor("sonrisa", null);
    actualizarMedidor("barra-apertura", null, ...RANGO_BOCA);
    actualizarMedidor("barra-sonrisa", null, ...RANGO_SONRISA);
    marcarRegla("regla-boca", false);
    marcarRegla("regla-sonrisa", false);
    return;
  }

  document.getElementById("total").textContent = datos.total;
  escribirValor("apertura", datos.apertura);
  escribirValor("sonrisa", datos.sonrisa);
  actualizarMedidor("barra-apertura", datos.apertura, ...RANGO_BOCA);
  actualizarMedidor("barra-sonrisa", datos.sonrisa, ...RANGO_SONRISA);

  // Las reglas: comparamos con el umbral
  marcarRegla("regla-boca", datos.apertura > UMBRAL_BOCA);
  marcarRegla("regla-sonrisa", datos.sonrisa > UMBRAL_SONRISA);
}
