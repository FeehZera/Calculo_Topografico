const x = [0, 10, 20, 30, 40, 0, 10, 20, 30, 40, 0, 10, 20, 30, 40, 0, 10, 20, 30, 40, 0, 10, 20, 30, 40, 0, 10, 20, 30, 40];
const y = [0, 0, 0, 0, 0, 10, 10, 10, 10, 10, 20, 20, 20, 20, 20, 30, 30, 30, 30, 30, 40, 40, 40, 40, 40, 50, 50, 50, 50, 50];
const z = [100, 102, 104, 101, 98, 99, 100, 103, 100, 96, 97, 99, 100, 101, 98, 96, 97, 98, 99, 97, 96, 97, 99, 100, 101, 96, 97, 99, 100, 101];

const cotaProjeto = 100;
const areaPorPonto = 100;

let resultados = [];

for (let i = 0; i < x.length; i++) {
  let diferenca = cotaProjeto - z[i];
  let corte = 0, aterro = 0, tipo = "";
  if (diferenca < 0) {
    corte = Math.abs(diferenca) * areaPorPonto;
    tipo = "corte";
  } else if (diferenca > 0) {
    aterro = diferenca * areaPorPonto;
    tipo = "aterro";
  } else {
    tipo = "ok";
  }
  resultados.push({
    ponto: i + 1,
    x: x[i],
    y: y[i],
    cotaMedida: z[i],
    cotaProjeto,
    diferenca,
    corte: corte.toFixed(2),
    aterro: aterro.toFixed(2),
    tipo
  });
}

// GERA TABELA HTML
let tabela = `<table>
  <tr>
    <th>Ponto</th>
    <th>X</th>
    <th>Y</th>
    <th>Cota Medida</th>
    <th>Cota Projeto</th>
    <th>Diferença</th>
    <th>Corte (m³)</th>
    <th>Aterro (m³)</th>
  </tr>`;
resultados.forEach(r => {
  tabela += `<tr class="${r.tipo}">
    <td>${r.ponto}</td>
    <td>${r.x}</td>
    <td>${r.y}</td>
    <td>${r.cotaMedida}</td>
    <td>${r.cotaProjeto}</td>
    <td>${r.diferenca.toFixed(2)}</td>
    <td>${r.corte}</td>
    <td>${r.aterro}</td>
  </tr>`;
});
const totalCorte = resultados.reduce((acc, cur) => acc + Number(cur.corte), 0).toFixed(2);
const totalAterro = resultados.reduce((acc, cur) => acc + Number(cur.aterro), 0).toFixed(2);
tabela += `<tr style="font-weight:bold;">
  <td colspan="6">Totais</td>
  <td>${totalCorte} m³</td>
  <td>${totalAterro} m³</td>
</tr>`;
tabela += `</table>`;
document.getElementById('result-table').innerHTML = tabela;

// PLOTLY
const scatter = {
  x: x,
  y: y,
  z: z,
  mode: 'markers',
  type: 'scatter3d',
  marker: {
    size: 6,
    color: resultados.map(r => r.tipo === "corte" ? 'red' : (r.tipo === "aterro" ? 'blue' : 'green')),
    opacity: 0.7,
    line: { width: 2, color: 'gray' }
  },
  name: 'Pontos (Corte/Aterro/OK)'
};

const mesh = {
  x: x,
  y: y,
  z: z,
  type: 'mesh3d',
  intensity: z,
  colorscale: 'Viridis',
  opacity: 1,
  colorbar: { title: 'Cota (m)' }
};

const plano = {
  type: 'mesh3d',
  x: [Math.min(...x), Math.max(...x), Math.max(...x), Math.min(...x)],
  y: [Math.min(...y), Math.min(...y), Math.max(...y), Math.max(...y)],
  z: [cotaProjeto, cotaProjeto, cotaProjeto, cotaProjeto],
  i: [0, 1, 2, 0],
  j: [1, 2, 3, 3],
  k: [2, 3, 0, 1],
  color: 'red',
  opacity: 0.3,
  name: 'Plano de Cota 100',
  showscale: false
};

// funcoes a serem chamadas
const data = [mesh, plano, scatter];

const layout = {
  title: 'Mapa 3D do Terreno com Corte/Aterro',
  scene: {
    xaxis: { title: 'X (m)' },
    yaxis: { title: 'Y (m)' },
    zaxis: { title: 'Cota (m)', range: [Math.min(...z, cotaProjeto) - 5, Math.max(...z, cotaProjeto) + 5] },
    aspectmode: 'data' // mantém proporção real entre os eixos
  },
  margin: { t: 50 }
};

Plotly.newPlot('plot', data, layout);
