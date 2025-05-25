//Variaveis globais
let x = [], y = [], z = [], cotaProjeto = 100;


//===============================================================================================
function atualizarRotuloPontos() {
    const labels = document.querySelectorAll("#input-table tbody .ponto-label");
    labels.forEach((label, i) => {
        label.textContent = `P${i + 1}`;
    });
}
//===============================================================================================

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    processarArquivo(file);
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    processarArquivo(file);
});

//===============================================================================================
function processarArquivo(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        x.length = 0;
        y.length = 0;
        z.length = 0;

        const tbody = document.querySelector("#input-table tbody");
        tbody.innerHTML = "";  // ✅ Limpa a tabela antes de preencher

        for (let i = 1; i < json.length; i++) {  // Pula o cabeçalho
            const valorX = parseFloat(json[i][1]) || 0;
            const valorY = parseFloat(json[i][2]) || 0;
            const valorZ = parseFloat(json[i][3]) || 0;

            x.push(valorX);
            y.push(valorY);
            z.push(valorZ);

            // ✅ Cria linha na tabela HTML
            const novaLinha = document.createElement("tr");
            novaLinha.innerHTML = `
        <td class="ponto-label"></td>
        <td><input type="number" value="${valorX}"></td>
        <td><input type="number" value="${valorY}"></td>
        <td><input type="number" value="${valorZ}"></td>
        <td><button onclick="removerLinha(this)" id="excluirln">Excluir</button></td>
      `;
            tbody.appendChild(novaLinha);
        }

        atualizarRotuloPontos();  // ✅ Atualiza "P1", "P2", etc.
    };

    reader.readAsArrayBuffer(file);
}

//===============================================================================================

async function exportarXLSX() {
    const qtd = Number(document.getElementById('quantiPontos').value);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pontos');

    // Cabeçalho
    worksheet.addRow(['Ponto', 'Eixo X', 'Eixo Y', 'Eixo Z']);

    // Linhas de pontos
    for (let i = 1; i <= qtd; i++) {
        worksheet.addRow(['P' + i, '', '', '']);
    }

    // Centralizar tudo + cabeçalho em negrito
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            if (rowNumber === 1) {
                cell.font = { bold: true };
            }
            // (Opcional) bordas:
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    // Ajuste de largura automática
    worksheet.columns.forEach(column => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, cell => {
            const value = cell.value ? cell.value.toString() : "";
            if (value.length > maxLength) {
                maxLength = value.length;
            }
        });
        column.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tabela_de_pontos.xlsx";
    a.click();

    URL.revokeObjectURL(url);
}
//==============================================================================================
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
//===============================================================================================
function removerLinha(botao) {
    const linha = botao.closest("tr");
    linha.remove();
    atualizarRotuloPontos();
}
//===============================================================================================

function adicionarCota(value) {
    cotaProjeto = Number(value);
}
//===============================================================================================
function gerarGrafico() {
    let resultados = [];
    const linhas = document.querySelectorAll("#input-table tbody tr");

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
        opacity: 1,
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
            colorscale: 'Earth'
        }, plano];
    } else if (tipoGrafico === 'scatter3d') {
        data = [{
            x: x,
            y: y,
            z: z,
            type: 'scatter3d',
            mode: 'markers',
            marker: { size: 5, color: z, colorscale: 'Earth' }
        }, plano];
    } else if (tipoGrafico === 'heatmap') {
        const gridSize = 50;
        const minX = Math.min(...x), maxX = Math.max(...x);
        const minY = Math.min(...y), maxY = Math.max(...y);
        const stepX = (maxX - minX) / gridSize;
        const stepY = (maxY - minY) / gridSize;

        // Criação dos vetores de grade
        const xi = Array.from({ length: gridSize + 1 }, (_, i) => minX + i * stepX);
        const yi = Array.from({ length: gridSize + 1 }, (_, i) => minY + i * stepY);

        // Interpolação para gerar a grade zi
        const zi = yi.map(yVal => {
            return xi.map(xVal => {
                let somaPesos = 0;
                let somaZ = 0;
                for (let i = 0; i < x.length; i++) {
                    const dx = x[i] - xVal;
                    const dy = y[i] - yVal;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const peso = 1 / (dist + 0.0001); // peso baseado em distância
                    somaPesos += peso;
                    somaZ += z[i] * peso;
                }
                return somaZ / somaPesos;
            });
        });

        data = [{
            type: 'contour',
            x: xi,
            y: yi,
            z: zi,
            colorscale: 'Earth',
            contours: {
                coloring: 'heatmap',
                showlabels: true,
                labelfont: {
                    size: 12,
                    color: '#000000',  // ✅ preto puro nos números
                    family: 'Arial Black, sans-serif'
                }
            },
            line: {
                color: '#000000',  // ✅ preto puro nas linhas
                width: 2
            },
            colorbar: {
                title: 'Cota (m)',
                tickfont: {
                    color: '#000000'
                },
                titlefont: {
                    color: '#000000'
                }
            }
        }];
    }
    const layout = {
        title: 'Mapa Topográfico',
        scene: {
            aspectmode: 'manual',
            aspectratio: {
                x: 15, //largura
                y: 15, //profundidade
                z: 2, //altura
                pixelRatio: 5,
                xaxis: { title: 'X (m)' },
                yaxis: { title: 'Y (m)' },
                zaxis: { title: 'Cota (m)' },
            }
        }
    }
    //===================================================================
    Plotly.newPlot('plot', data, layout);
    //===================================================================
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
        const tipoClasse = r.diferenca < 0 ? 'linha-corte' : r.diferenca > 0 ? 'linha-aterro' : '';

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
//===============================================================================================
function exportTable() {
    gerarGrafico();
    console.log("Exportar tabela");

    // Seleciona a tabela pelo id
    const tabelaElement = document.getElementById('result-table').querySelector('table');

    // Converte a tabela para uma planilha
    const workbook = XLSX.utils.table_to_book(tabelaElement, { sheet: "Resultados" });

    // Gera o arquivo xlsx
    XLSX.writeFile(workbook, "tabela_corte_aterro.xlsx");
}