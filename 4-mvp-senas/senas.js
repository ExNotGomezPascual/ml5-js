// ==========================================================
// Lista de señas. Cada seña es una CLASE para la red neuronal.
// - clase: nombre que aprende la red
// - texto: lo que se escribe al reconocerla
// - pista: qué hacer frente a la cámara al entrenar
//
// Solo letras ESTÁTICAS del alfabeto de la Lengua de Señas
// Colombiana (LSC). Según la imagen de referencia
// (Abecedario-Lengua-De-Senas.webp), G, H, J, Ñ, S y Z llevan
// movimiento: no se pueden reconocer con una sola "foto" de la mano.
//
// Si agregan o quitan una clase, hay que volver a entrenar.
// ==========================================================

const LETRAS = [
  "A", "B", "C", "D", "E", "F", "I", "K", "L", "M", "N",
  "O", "P", "Q", "R", "T", "U", "V", "W", "X", "Y",
];

const SENAS = [
  // Una clase por letra
  ...LETRAS.map((letra) => ({
    clase: letra,
    texto: letra,
    pista: `Seña de la letra ${letra} como en la foto`,
  })),

  // Dos gestos extra para controlar el texto
  { clase: "espacio", texto: "␣", pista: "Gesto que ustedes elijan para ESPACIO (distinto a todas las letras)" },
  { clase: "borrar",  texto: "⌫", pista: "Gesto que ustedes elijan para BORRAR (distinto a todas las letras)" },
];

// Busca una seña por el nombre de su clase
function buscarSena(clase) {
  return SENAS.find((sena) => sena.clase === clase);
}

// ---------- Foto de referencia de cada letra ----------
// La imagen tiene las letras en una cuadrícula de 7 columnas.
// Calculamos qué recorte mostrar con background-position (CSS).
const IMAGEN_REFERENCIA = "Abecedario-Lengua-De-Senas.webp";
const ORDEN_EN_IMAGEN = ["A", "B", "C", "D", "E", "F", "G",
                         "H", "I", "J", "K", "L", "M", "N",
                         "Ñ", "O", "P", "Q", "R", "S", "T",
                         "U", "V", "W", "X", "Y", "Z"];

// Medidas de la imagen original (en píxeles)
const IMG_ANCHO = 1000;
const IMG_ALTO = 700;
const CUADRO = 118;                       // tamaño de cada foto
const PRIMERA_X = 52, PRIMERA_Y = 138;    // esquina de la letra A
const PASO_X = 129.3, PASO_Y = 129.5;     // distancia entre fotos

// Devuelve el estilo CSS para mostrar solo la foto de una letra
// (o null si la letra no está en la imagen, ej. "espacio")
function estiloFoto(clase) {
  const i = ORDEN_EN_IMAGEN.indexOf(clase);
  if (i === -1) return null;
  const x = PRIMERA_X + (i % 7) * PASO_X;
  const y = PRIMERA_Y + Math.floor(i / 7) * PASO_Y;
  return `background-image: url("${IMAGEN_REFERENCIA}");` +
    `background-size: ${(IMG_ANCHO / CUADRO) * 100}% ${(IMG_ALTO / CUADRO) * 100}%;` +
    `background-position: ${(x / (IMG_ANCHO - CUADRO)) * 100}% ${(y / (IMG_ALTO - CUADRO)) * 100}%;`;
}
