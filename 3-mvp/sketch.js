// ==========================================================
// FILTRO: ¿Qué meme eres?
// faceMesh y handPose convierten la cámara en números.
// Nuestra red (entrenada en entrenar.html) dice qué meme es.
// ==========================================================

// Anti-parpadeo: la red debe repetir el mismo meme varias veces
// seguidas, con suficiente confianza, antes de cambiar la imagen.
const VECES_SEGUIDAS = 8;
const CONFIANZA_MINIMA = 0.6;

let video;
let faceMesh;
let handPose;
let caras = [];
let manos = [];
let red;

let candidato = null;   // meme que la red está diciendo ahora
let racha = 0;          // cuántas veces seguidas lo ha dicho
let memeActual = null;  // meme que se ve en pantalla
let verPuntos = true;

function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
  handPose = ml5.handPose({ maxHands: 2, flipped: true });
}

function setup() {
  crearGaleria();

  const lienzo = createCanvas(ANCHO, ALTO);
  lienzo.parent("camara");

  mostrarEstado("Esperando la cámara…");
  video = createCapture(VIDEO, { flipped: true });
  video.size(ANCHO, ALTO);
  video.hide();

  faceMesh.detectStart(video, (resultados) => { caras = resultados; });
  handPose.detectStart(video, (resultados) => { manos = resultados; });

  // Cargamos el modelo que entrenamos antes (archivos en mvp/modelo/)
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
      mostrarEstado("No se encontró el modelo. Entrenen en entrenar.html y copien los 3 archivos a mvp/modelo/.");
    });
  }
}

function redCargada() {
  ocultarEstado();
  clasificar();
}

function draw() {
  image(video, 0, 0, width, height);
  if (verPuntos) dibujarPuntos(caras, manos);

  if (frameCount % 15 === 0) {
    document.getElementById("fps").textContent = Math.round(frameRate()) + " cuadros por segundo";
  }
}

function keyPressed() {
  if (key === "p" || key === "P") verPuntos = !verPuntos;
}

// Le pedimos a la red que clasifique; al responder, volvemos a pedir
function clasificar() {
  red.classify(calcularEntradas(caras, manos), recibirResultado);
}

function recibirResultado(resultados, error) {
  if (error) {
    console.error(error);
    return;
  }

  const mejor = resultados[0]; // vienen ordenados: el primero es el más probable

  // Anti-parpadeo
  if (mejor.label === candidato && mejor.confidence >= CONFIANZA_MINIMA) {
    racha++;
  } else {
    candidato = mejor.label;
    racha = 1;
  }

  if (racha >= VECES_SEGUIDAS && candidato !== memeActual) {
    mostrarMeme(candidato);
  }

  if (frameCount % 6 === 0) mostrarRanking(resultados);

  clasificar();
}

function mostrarMeme(clase) {
  const meme = buscarMeme(clase);
  if (!meme) return;
  memeActual = clase;

  const imagen = document.getElementById("meme-imagen");
  const clip = document.getElementById("meme-video");

  if (meme.esVideo) {
    imagen.hidden = true;
    clip.hidden = false;
    clip.src = meme.archivo;
    clip.play();
  } else {
    clip.pause();
    clip.hidden = true;
    imagen.hidden = false;
    imagen.src = meme.archivo;
  }
  document.getElementById("meme-nombre").textContent = clase;
}

// Los 3 memes más probables, con una barra de confianza
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

// ---------- Galería de memes (debajo del filtro) ----------
// Muestra todos los memes que la red conoce, para que la gente
// sepa cuáles puede imitar. Solo imagen y nombre.
function crearGaleria() {
  const lista = document.getElementById("galeria");
  for (const meme of MEMES) {
    const item = document.createElement("li");

    // El meme "video" se muestra como video en bucle, sin sonido
    const imagen = meme.esVideo
      ? `<video src="${meme.archivo}" autoplay muted loop playsinline></video>`
      : `<img src="${meme.archivo}" alt="" loading="lazy">`;

    item.innerHTML = `${imagen}<span class="nombre">${meme.clase}</span>`;
    lista.appendChild(item);
  }
}
