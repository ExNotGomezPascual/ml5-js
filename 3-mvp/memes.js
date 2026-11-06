// ==========================================================
// Lista de memes. Cada meme es una CLASE para la red neuronal.
// - clase: nombre que aprende la red (sin espacios ni tildes)
// - archivo: imagen o video que se muestra
// - pista: qué expresión hacer frente a la cámara al entrenar
//
// Para cambiar una imagen: reemplacen el archivo en memes/
// con el mismo nombre. Si agregan o quitan una clase,
// hay que volver a entrenar.
// ==========================================================

const MEMES = [
  { clase: "joker",            archivo: "memes/joker.jpeg",            pista: "Sonrisa malvada con los ojos entrecerrados" },
  { clase: "gato-presumido",   archivo: "memes/gato-presumido.jpeg",   pista: "Ojos entrecerrados y sonrisa leve, presumido" },
  { clase: "perro-cejas",      archivo: "memes/perro-cejas.jpeg",      pista: "Cejas bien levantadas" },
  { clase: "chihuahua-patas",  archivo: "memes/chihuahua-patas.jpeg",  pista: "Las dos manos abiertas hacia la cámara" },
  { clase: "perro-saludo",     archivo: "memes/perro-saludo.jpeg",     pista: "Mano en la frente como saludo militar, boca apretada" },
  { clase: "gato-fumador",     archivo: "memes/gato-fumador.jpeg",     pista: "Ojos muy abiertos y dos dedos en los labios, como sosteniendo un cigarro" },
  { clase: "tiburon-sonrisa",  archivo: "memes/tiburon-sonrisa.jpeg",  pista: "Sonrisa enorme con los dientes apretados, boca cerrada" },
  { clase: "diablito-plan",    archivo: "memes/diablito-plan.webp",    pista: "Sonrisa malvada y las yemas de los dedos juntas frente al pecho, tramando un plan" },
  { clase: "dios-plan",        archivo: "memes/dios-plan.webp",        pista: "Manos juntas rezando frente a la boca, cara tranquila" },
  { clase: "gato-grito",       archivo: "memes/gato-grito.webp",       pista: "Boca muy abierta gritando y señalar a la cámara con el dedo" },
  { clase: "paloma",           archivo: "memes/paloma.webp",           pista: "Cabeza de perfil inclinada hacia abajo, como picoteando" },
  { clase: "video",            archivo: "memes/video.mp4",             pista: "El gesto que ustedes elijan", esVideo: true },
];

// Busca un meme por el nombre de su clase
function buscarMeme(clase) {
  return MEMES.find((meme) => meme.clase === clase);
}
