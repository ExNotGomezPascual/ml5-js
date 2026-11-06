// ==========================================================
// DEMO 3 · bodyPose
// El modelo encuentra el cuerpo y devuelve 17 puntos.
// Cada punto trae su "confianza": qué tan seguro está el modelo.
// ==========================================================

const ANCHO = 640;
const ALTO = 480;

// Por debajo de esta confianza, ignoramos el punto
const CONFIANZA_MINIMA = 0.3;

// Nombres en español para mostrar en el panel
const NOMBRES = {
  nose: "Nariz",
  left_eye: "Ojo izquierdo",
  right_eye: "Ojo derecho",
  left_ear: "Oreja izquierda",
  right_ear: "Oreja derecha",
  left_shoulder: "Hombro izq.",
  right_shoulder: "Hombro der.",
  left_elbow: "Codo izq.",
  right_elbow: "Codo der.",
  left_wrist: "Muñeca izq.",
  right_wrist: "Muñeca der.",
  left_hip: "Cadera izq.",
  right_hip: "Cadera der.",
  left_knee: "Rodilla izq.",
  right_knee: "Rodilla der.",
  left_ankle: "Tobillo izq.",
  right_ankle: "Tobillo der.",
};

let video;
let bodyPose;
let poses = [];
let conexiones;

function preload() {
  bodyPose = ml5.bodyPose({ flipped: true });
}

function setup() {
  const lienzo = createCanvas(ANCHO, ALTO);
  lienzo.parent("camara");

  mostrarEstado("Esperando la cámara…");
  revisarCamara();

  video = createCapture(VIDEO, { flipped: true }, ocultarEstado);
  video.size(ANCHO, ALTO);
  video.hide();

  conexiones = bodyPose.getSkeleton();
  bodyPose.detectStart(video, recibirPoses);

  crearListaDePartes();
}

function recibirPoses(resultados) {
  poses = resultados;
}

function draw() {
  image(video, 0, 0, width, height);

  if (poses.length === 0) {
    actualizarPanel(null);
    return;
  }

  const puntos = poses[0].keypoints;

  // Huesos: solo si ambos extremos son confiables
  stroke(255, 194, 75, 200);
  strokeWeight(4);
  for (const [a, b] of conexiones) {
    if (puntos[a].confidence > CONFIANZA_MINIMA && puntos[b].confidence > CONFIANZA_MINIMA) {
      line(puntos[a].x, puntos[a].y, puntos[b].x, puntos[b].y);
    }
  }

  // Puntos: la transparencia depende de la confianza
  noStroke();
  for (const p of puntos) {
    fill(255, 194, 75, 40 + p.confidence * 215);
    circle(p.x, p.y, 14);
  }

  actualizarPanel(puntos);
}

// Las reglas del cuerpo: ¿la muñeca está más arriba que la nariz?
// Ojo: en la pantalla, "más arriba" significa una y MÁS PEQUEÑA.
function evaluarBrazos(puntos) {
  const buscar = (nombre) => puntos.find((p) => p.name === nombre);
  const nariz = buscar("nose");
  const munecaIzq = buscar("left_wrist");
  const munecaDer = buscar("right_wrist");

  const confiable = (p) => p.confidence > CONFIANZA_MINIMA;
  if (!confiable(nariz)) return { una: false, ambas: false };

  const izqArriba = confiable(munecaIzq) && munecaIzq.y < nariz.y;
  const derArriba = confiable(munecaDer) && munecaDer.y < nariz.y;

  return {
    ambas: izqArriba && derArriba,
    una: izqArriba !== derArriba, // exactamente una de las dos
  };
}

// ---------- Panel ----------

function crearListaDePartes() {
  const lista = document.getElementById("partes");
  for (const clave of Object.keys(NOMBRES)) {
    const fila = document.createElement("li");
    fila.innerHTML = `
      <span>${NOMBRES[clave]}</span>
      <span class="barra"><span id="barra-${clave}"></span></span>
      <span class="num" id="num-${clave}">—</span>`;
    lista.appendChild(fila);
  }
}

function actualizarPanel(puntos) {
  if (frameCount % 4 !== 0) return;

  if (puntos === null) {
    for (const clave of Object.keys(NOMBRES)) {
      document.getElementById(`barra-${clave}`).style.width = "0%";
      document.getElementById(`num-${clave}`).textContent = "—";
    }
    marcarRegla("regla-una", false);
    marcarRegla("regla-ambas", false);
    return;
  }

  for (const p of puntos) {
    document.getElementById(`barra-${p.name}`).style.width = p.confidence * 100 + "%";
    document.getElementById(`num-${p.name}`).textContent = p.confidence.toFixed(2);
  }

  const brazos = evaluarBrazos(puntos);
  marcarRegla("regla-una", brazos.una);
  marcarRegla("regla-ambas", brazos.ambas);
}
