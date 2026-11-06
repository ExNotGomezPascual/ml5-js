// ==========================================================
// ESCRIBIR CON SEÑAS
// handPose convierte la mano en 42 números.
// Nuestra red (entrenada en entrenar.html) dice qué letra es.
// Para escribir una letra hay que SOSTENER la seña un momento.
// ==========================================================

const SEGUNDOS_SOSTENER = 1;   // tiempo que hay que sostener la seña
const CONFIANZA_MINIMA = 0.6;  // por debajo de esto no contamos la seña

let video;
let handPose;
let manos = [];
let conexiones;
let red;
let redLista = false;
let ocupada = false;      // true mientras la red está clasificando

let texto = "";           // lo que se lleva escrito
let candidato = null;     // seña que la red está viendo ahora
let inicioCandidato = 0;  // desde cuándo la ve (milisegundos)
let yaEscrita = false;    // para no repetir la letra mientras se sostiene
let verPuntos = true;

function preload() {
  handPose = ml5.handPose({ maxHands: 1, flipped: true });
}

function setup() {
  crearGaleria();

  const lienzo = createCanvas(ANCHO, ALTO);
  lienzo.parent("camara");

  mostrarEstado("Esperando la cámara…");
  video = createCapture(VIDEO, { flipped: true });
  video.size(ANCHO, ALTO);
  video.hide();

  conexiones = handPose.getConnections();
  handPose.detectStart(video, (resultados) => { manos = resultados; });

  // Cargamos el modelo que entrenamos antes (archivos en modelo/)
  mostrarEstado("Cargando nuestra red neuronal…");
  red = ml5.neuralNetwork({ task: "classification" });
  const rutas = {
    model: "modelo/model.json",
    metadata: "modelo/model_meta.json",
    weights: "modelo/model.weights.bin",
  };
  const carga = red.load(rutas, redCargada);
  if (carga && carga.catch) {
    carga.catch(() => {
      mostrarEstado("No se encontró el modelo. Entrenen en entrenar.html y copien los 3 archivos a 4-mvp-senas/modelo/.");
    });
  }

  mostrarTexto();
}

function redCargada() {
  ocultarEstado();
  redLista = true;
}

function draw() {
  image(video, 0, 0, width, height);

  const hayMano = manos.length > 0;
  if (hayMano && verPuntos) dibujarMano(manos[0], conexiones);

  // Clasificamos solo si hay mano y la red no está ocupada
  if (redLista && !ocupada) {
    if (hayMano) {
      ocupada = true;
      red.classify(calcularEntradas(manos[0]), recibirResultado);
    } else {
      sinMano();
    }
  }

  if (frameCount % 15 === 0) {
    document.getElementById("fps").textContent = Math.round(frameRate()) + " cuadros por segundo";
  }
}

function keyPressed() {
  if (key === "p" || key === "P") verPuntos = !verPuntos;
}

// Sin mano: reiniciamos. Bajar la mano sirve para repetir una letra (ej. "LL").
function sinMano() {
  candidato = null;
  yaEscrita = false;
  mostrarSenaActual(null, 0);
}

function recibirResultado(resultados, error) {
  ocupada = false;
  if (error) {
    console.error(error);
    return;
  }

  const mejor = resultados[0]; // vienen ordenados: el primero es el más probable

  if (mejor.confidence < CONFIANZA_MINIMA) {
    // La red no está segura: el tiempo vuelve a empezar.
    // No borramos el candidato, así una duda corta no repite la letra.
    inicioCandidato = millis();
  } else if (mejor.label !== candidato) {
    // Seña nueva: empezamos a contar el tiempo
    candidato = mejor.label;
    inicioCandidato = millis();
    yaEscrita = false;
  }

  // ¿Cuánto lleva sosteniendo la seña? (de 0 a 1)
  let avance = 0;
  if (candidato !== null) {
    avance = min(1, (millis() - inicioCandidato) / (SEGUNDOS_SOSTENER * 1000));
    if (avance >= 1 && !yaEscrita) {
      aplicarSena(candidato);
      yaEscrita = true;
    }
  }

  mostrarSenaActual(candidato, avance);
  if (frameCount % 6 === 0) mostrarRanking(resultados);
}

// Escribe la letra, o ejecuta espacio / borrar
function aplicarSena(clase) {
  if (clase === "espacio") {
    texto += " ";
  } else if (clase === "borrar") {
    texto = texto.slice(0, -1);
  } else {
    texto += clase;
  }
  mostrarTexto();
}

// ---------- Interfaz ----------

function mostrarTexto() {
  // Mostramos los espacios como "·" para que se vean
  document.getElementById("texto").textContent = texto.replaceAll(" ", "·");
}

function mostrarSenaActual(clase, avance) {
  const sena = clase ? buscarSena(clase) : null;
  document.getElementById("sena-actual").textContent = sena ? sena.texto : "—";
  document.getElementById("barra-sostener").style.width = avance * 100 + "%";
}

// Las 3 señas más probables, con una barra de confianza
function mostrarRanking(resultados) {
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";
  for (const r of resultados.slice(0, 3)) {
    const porcentaje = Math.round(r.confidence * 100);
    const item = document.createElement("li");
    item.innerHTML = `
      <span>${r.label}</span>
      <span class="barra"><span style="width: ${porcentaje}%"></span></span>
      <span class="num">${porcentaje}%</span>`;
    lista.appendChild(item);
  }
}

// ---------- Galería de señas (debajo de la cámara) ----------
// Muestra todas las señas que la red conoce, para que la gente
// sepa cuáles hay y cómo se hacen. Las letras usan el recorte de
// la imagen de referencia; espacio y borrar no están en ella, así
// que muestran su símbolo y una frase con el gesto.
function crearGaleria() {
  const lista = document.getElementById("galeria");
  for (const sena of SENAS) {
    const item = document.createElement("li");

    const estilo = estiloFoto(sena.clase);
    const imagen = estilo
      ? `<span class="letra foto" style='${estilo}' aria-hidden="true"></span>`
      : `<span class="letra" aria-hidden="true">${sena.texto}</span>`;

    // Solo los gestos sin foto llevan la explicación debajo
    const gesto = estilo ? "" : `<span class="gesto">${sena.gesto}</span>`;

    item.innerHTML = `${imagen}<span class="nombre">${sena.clase}</span>${gesto}`;
    lista.appendChild(item);
  }
}
