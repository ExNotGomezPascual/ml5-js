// ==========================================================
// PÁGINA DE ENTRENAMIENTO (señas)
// 1. Capturamos ejemplos: (42 números de la mano) + (letra)
// 2. Entrenamos la red neuronal con esos ejemplos
// 3. Guardamos el modelo para usarlo en index.html
// Esto se hace ANTES de la exposición.
// ==========================================================

const SEGUNDOS_ESPERA = 3;    // tiempo para poner la seña
const SEGUNDOS_CAPTURA = 3;   // tiempo capturando ejemplos
const EPOCAS = 60;            // vueltas que da la red sobre los ejemplos

let video;
let handPose;
let manos = [];
let conexiones;
let red;

// Todos los ejemplos capturados: [{ entradas: [...], clase: "A" }, ...]
let ejemplos = [];

// Captura en curso: qué seña y cuándo empezó (null = ninguna)
let captura = null;

let entrenada = false;
let probando = false;

function preload() {
  handPose = ml5.handPose({ maxHands: 1, flipped: true });
}

function setup() {
  const lienzo = createCanvas(ANCHO, ALTO);
  lienzo.parent("camara");

  mostrarEstado("Esperando la cámara…");
  video = createCapture(VIDEO, { flipped: true }, ocultarEstado);
  video.size(ANCHO, ALTO);
  video.hide();

  conexiones = handPose.getConnections();
  handPose.detectStart(video, (resultados) => { manos = resultados; });

  // Sin debug: en vez del visor de tfjs-vis dibujamos nuestra propia
  // gráfica del error en el panel (../compartido/grafica.js)
  red = ml5.neuralNetwork({ task: "classification" });

  crearTarjetas();
  document.getElementById("btn-entrenar").onclick = entrenar;
  document.getElementById("btn-guardar-modelo").onclick = () => red.save();
  document.getElementById("btn-guardar-ejemplos").onclick = () => saveJSON(ejemplos, "ejemplos.json");
  document.getElementById("btn-cargar-ejemplos").onclick = cargarEjemplos;
}

function draw() {
  image(video, 0, 0, width, height);
  if (manos.length > 0) dibujarMano(manos[0], conexiones);

  if (captura !== null) {
    avanzarCaptura();
  }

  if (frameCount % 15 === 0) {
    document.getElementById("fps").textContent = Math.round(frameRate()) + " cuadros por segundo";
  }
}

// ---------- Captura de ejemplos ----------

function empezarCaptura(clase) {
  if (captura !== null || entrenada) return;
  captura = { clase: clase, inicio: millis() };
  document.querySelector(`[data-clase="${clase}"]`).classList.add("capturando");
}

function avanzarCaptura() {
  const segundos = (millis() - captura.inicio) / 1000;

  // Fase 1: cuenta regresiva para poner la seña
  if (segundos < SEGUNDOS_ESPERA) {
    textoGrande(Math.ceil(SEGUNDOS_ESPERA - segundos));
    return;
  }

  // Fase 2: capturamos un ejemplo cada 2 cuadros, solo si se ve la mano
  if (segundos < SEGUNDOS_ESPERA + SEGUNDOS_CAPTURA) {
    textoGrande(manos.length > 0 ? "● capturando" : "¿y la mano?");
    if (frameCount % 2 === 0 && manos.length > 0) {
      ejemplos.push({ entradas: calcularEntradas(manos[0]), clase: captura.clase });
      actualizarCuentas();
    }
    return;
  }

  // Fin de la captura
  document.querySelector(`[data-clase="${captura.clase}"]`).classList.remove("capturando");
  captura = null;
}

function textoGrande(texto) {
  fill(255);
  stroke(0);
  strokeWeight(6);
  textAlign(CENTER, CENTER);
  textSize(64);
  text(texto, width / 2, 60);
}

// ---------- Entrenamiento ----------

function entrenar() {
  const clases = new Set(ejemplos.map((e) => e.clase));
  if (clases.size < 2) {
    escribirMensaje("Necesitan ejemplos de al menos 2 señas para entrenar.");
    return;
  }

  // Le pasamos los ejemplos a la red
  for (const ejemplo of ejemplos) {
    red.addData(ejemplo.entradas, [ejemplo.clase]);
  }

  // Normalizar: deja todos los números en la misma escala (0 a 1)
  red.normalizeData();

  document.getElementById("btn-entrenar").disabled = true;
  document.getElementById("btn-cargar-ejemplos").disabled = true;
  entrenada = true; // ya no se puede capturar más
  escribirMensaje("Entrenando…");

  red.train({ epochs: EPOCAS }, mientrasEntrena, terminoEntrenamiento);
}

// Error de cada época, para la gráfica
let errores = [];

function mientrasEntrena(epoca, registro) {
  escribirMensaje(`Entrenando… época ${epoca + 1} de ${EPOCAS} · error ${registro.loss.toFixed(3)}`);
  errores.push(registro.loss);
  dibujarGrafica(errores, EPOCAS);
}

function terminoEntrenamiento() {
  escribirMensaje("¡Listo! Prueben las señas y miren la prueba en vivo. Si funciona bien, guarden el modelo. Para reentrenar, recarguen la página.");
  document.getElementById("btn-guardar-modelo").disabled = false;
  probando = true;
  probar();
}

// Prueba en vivo: clasificamos sin parar y mostramos el resultado
function probar() {
  if (manos.length === 0) {
    document.getElementById("prueba").textContent = "sin mano";
    setTimeout(probar, 100);
    return;
  }
  red.classify(calcularEntradas(manos[0]), (resultados, error) => {
    if (error) {
      console.error(error);
      return;
    }
    const mejor = resultados[0];
    document.getElementById("prueba").textContent =
      `${mejor.label} ${Math.round(mejor.confidence * 100)}%`;
    if (probando) probar();
  });
}

// ---------- Guardar y cargar ejemplos ----------

function cargarEjemplos() {
  fetch("datos/ejemplos.json")
    .then((respuesta) => respuesta.json())
    .then((datos) => {
      ejemplos = ejemplos.concat(datos);
      actualizarCuentas();
      escribirMensaje(`Se cargaron ${datos.length} ejemplos de datos/ejemplos.json.`);
    })
    .catch(() => {
      escribirMensaje("No se encontró datos/ejemplos.json. Primero guarden ejemplos y copien el archivo a 4-mvp-senas/datos/.");
    });
}

// ---------- Interfaz ----------

function crearTarjetas() {
  const lista = document.getElementById("tarjetas");
  for (const sena of SENAS) {
    const item = document.createElement("li");
    item.className = "tarjeta";
    item.dataset.clase = sena.clase;

    // Si la letra está en la imagen de referencia, mostramos su foto
    const estilo = estiloFoto(sena.clase);
    const guia = estilo
      ? `<span class="letra foto" style='${estilo}' aria-hidden="true"></span>`
      : `<span class="letra" aria-hidden="true">${sena.texto}</span>`;

    item.innerHTML = `
      <button type="button">
        ${guia}
        <span class="texto">
          <span class="clase">${sena.clase}</span>
          <span class="pista">${sena.pista}</span>
          <span class="cuenta" id="cuenta-${sena.clase}">0 ejemplos</span>
        </span>
      </button>`;
    item.querySelector("button").onclick = () => empezarCaptura(sena.clase);
    lista.appendChild(item);
  }
}

function actualizarCuentas() {
  document.getElementById("total").textContent = ejemplos.length;
  for (const sena of SENAS) {
    const cuantos = ejemplos.filter((e) => e.clase === sena.clase).length;
    document.getElementById("cuenta-" + sena.clase).textContent = cuantos + " ejemplos";
  }
}

function escribirMensaje(texto) {
  document.getElementById("mensaje").textContent = texto;
}
