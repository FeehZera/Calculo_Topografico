function atualizarRotuloPontos() {
    const labels = document.querySelectorAll("#input-table tbody .ponto-label");
    labels.forEach((label, i) => {
        label.textContent = `P${i + 1}`;
    });
}

function adicionarLinha() {
    const tbody = document.querySelector("#input-table tbody");
    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `
    <td class="ponto-label"></td>
    <td><input type="number" value="0"></td>
    <td><input type="number" value="0"></td>
    <td><input type="number" value="100"></td>
    <td><button onclick="removerLinha(this)" id="excluirln">Excluir</button></td>
  `;
    tbody.appendChild(novaLinha);
    atualizarRotuloPontos();
}

function removerLinha(botao) {
    const linha = botao.closest("tr");
    linha.remove();
    atualizarRotuloPontos();
    gerarGrafico();  // Atualiza o gráfico e a tabela
}

function gerarGrafico() {
    const x = [], y = [], z = [], resultados = [];
    const linhas = document.querySelectorAll("#input-table tbody tr");
    const cotaProjeto = 100;

    linhas.forEach((linha, i) => {
        const entradas = linha.querySelectorAll("input");
        const valorX = parseFloat(entradas[0].value);
        const valorY = parseFloat(entradas[1].value);
        const valorZ = parseFloat(entradas[2].value);
        x.push(valorX);
        y.push(valorY);
        z.push(valorZ);
        resultados.push({
            ponto: `P${i + 1}`,
            x: valorX,
            y: valorY,
            cotaMedida: valorZ,
            cotaProjeto: cotaProjeto,
            diferenca: valorZ - cotaProjeto,
            corte: Math.max(0, cotaProjeto - valorZ),
            aterro: Math.max(0, valorZ - cotaProjeto)
        });
    });

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

    const tipoGrafico = document.getElementById('graficoTipo').value;

    let data = [];
    if (tipoGrafico === 'mesh3d') {
        data = [{
            x: x,
            y: y,
            z: z,
            type: 'mesh3d',
            intensity: z,
            colorscale: 'Viridis',
            showscale: false
        }, plano];
    } else if (tipoGrafico === 'scatter3d') {
        data = [{
            x: x,
            y: y,
            z: z,
            type: 'scatter3d',
            mode: 'markers',
            marker: { size: 5, color: z, colorscale: 'Viridis' },
            showscale: false
        }, plano];
    } else if (tipoGrafico === 'heatmap') {
        data = [{
            x: x,
            y: y,
            z: z,
            type: 'heatmap',
            colorscale: 'Viridis',
            intensity: z,
            colorbar: { title: 'Cota (m)' },
            showscale: false
        }];
    }

    Plotly.newPlot('plot', data, {
        title: 'Mapa Topográfico',
        scene: {
            xaxis: { title: 'X (m)' },
            yaxis: { title: 'Y (m)' },
            zaxis: { title: 'Cota (m)' }
        }
    });

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
        const tipoClasse = r.diferenca < 0 ? 'linha-corte' :
            r.diferenca > 0 ? 'linha-aterro' : '';
        tabela += `<tr class="${tipoClasse}">
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

    const totalCorte = resultados.reduce((acc, cur) => acc + cur.corte, 0).toFixed(2);
    const totalAterro = resultados.reduce((acc, cur) => acc + cur.aterro, 0).toFixed(2);
    tabela += `<tr style="font-weight:bold;">
    <td colspan="6">Totais</td>
    <td>${totalCorte} m³</td>
    <td>${totalAterro} m³</td>
  </tr>`;
    tabela += `</table>`;

    document.getElementById('result-table').innerHTML = tabela;
}
