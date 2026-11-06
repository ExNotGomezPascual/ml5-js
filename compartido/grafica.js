// ==========================================================
// Gráfica del error durante el entrenamiento.
// La usan los dos entrenadores (3-mvp y 4-mvp-senas) en lugar
// del visor de tfjs-vis (debug: true), que no se leía bien.
// Necesita en el HTML:
//   <figure class="grafica" id="grafica" hidden>
//     <svg id="grafica-svg" viewBox="0 0 320 160"></svg>
//   </figure>
// Los estilos están en 3-mvp/estilos-mvp.css
// ==========================================================

// errores: lista con el error de cada época ya terminada
// totalEpocas: cuántas épocas habrá en total (ancho del eje x)
function dibujarGrafica(errores, totalEpocas) {
  document.getElementById("grafica").hidden = false;
  const svg = document.getElementById("grafica-svg");

  // Zona de dibujo dentro del SVG (deja espacio para los números del eje)
  const izq = 36, der = 312, arriba = 10, abajo = 140;
  const maximo = Math.max(...errores);

  // Convierte (época, error) en coordenadas del SVG
  const xDe = (i) => izq + (i / Math.max(1, totalEpocas - 1)) * (der - izq);
  const yDe = (valor) => abajo - (valor / maximo) * (abajo - arriba);

  const puntos = errores.map((e, i) => `${xDe(i)},${yDe(e)}`).join(" ");
  const ultimo = errores[errores.length - 1];
  const ultimaX = xDe(errores.length - 1);

  // Zonas invisibles por época: al pasar el mouse muestran el valor
  let zonas = "";
  const anchoZona = (der - izq) / totalEpocas;
  errores.forEach((e, i) => {
    zonas += `<rect x="${xDe(i) - anchoZona / 2}" y="${arriba}" width="${anchoZona}" height="${abajo - arriba}" fill="transparent">
      <title>Época ${i + 1}: error ${e.toFixed(3)}</title></rect>`;
  });

  svg.innerHTML = `
    <line class="eje" x1="${izq}" y1="${abajo}" x2="${der}" y2="${abajo}"/>
    <line class="guia" x1="${izq}" y1="${arriba}" x2="${der}" y2="${arriba}"/>
    <text class="num" x="${izq - 6}" y="${arriba + 4}" text-anchor="end">${maximo.toFixed(2)}</text>
    <text class="num" x="${izq - 6}" y="${abajo + 4}" text-anchor="end">0</text>
    <text class="num" x="${izq}" y="${abajo + 16}">época 1</text>
    <text class="num" x="${der}" y="${abajo + 16}" text-anchor="end">${totalEpocas}</text>
    <polyline class="linea" points="${puntos}"/>
    <circle class="punto" cx="${ultimaX}" cy="${yDe(ultimo)}" r="4"/>
    <text class="valor" x="${Math.min(ultimaX, der - 40)}" y="${yDe(ultimo) - 10}">${ultimo.toFixed(3)}</text>
    ${zonas}`;
}
