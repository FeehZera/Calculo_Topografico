//Variaveis globais
let x = [], y = [], z = [], cotaProjeto = 100;

//===============================================================================================
// Selecionando os novos IDs para dropzones e file inputs do HEADER
const dropzoneHeader = document.getElementById('dropzoneHeader');
const fileInputHeader = document.getElementById('fileInputHeader');

// Adiciona listeners para o dropzone do HEADER
if (dropzoneHeader && fileInputHeader) {
    dropzoneHeader.addEventListener('click', () => fileInputHeader.click());

    dropzoneHeader.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzoneHeader.classList.add('dragover');
    });

    dropzoneHeader.addEventListener('dragleave', () => {
        dropzoneHeader.classList.remove('dragover');
    });

    dropzoneHeader.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzoneHeader.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        processarArquivo(file);
    });

    fileInputHeader.addEventListener('change', () => {
        const file = fileInputHeader.files[0];
        processarArquivo(file);
    });
}


// Selecionando os novos IDs para o dropzone e file input da ASIDE
const dropzoneAside = document.getElementById('dropzoneAside');
const fileInputAside = document.getElementById('fileInputAside');

// Adiciona listeners para o dropzone da ASIDE
if (dropzoneAside && fileInputAside) {
    const btnUploadPlanilha = dropzoneAside.querySelector('.btn-upload-planilha');
    if (btnUploadPlanilha) {
        btnUploadPlanilha.addEventListener('click', () => fileInputAside.click());
    }

    fileInputAside.addEventListener('change', () => {
        const file = fileInputAside.files[0];
        processarArquivo(file);
    });

    dropzoneAside.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzoneAside.classList.add('dragover');
    });

    dropzoneAside.addEventListener('dragleave', () => {
        dropzoneAside.classList.remove('dragover');
    });

    dropzoneAside.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzoneAside.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        processarArquivo(file);
    });
}


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

        const novosX = [];
        const novosY = [];
        const novosZ = [];

        // Inicia do índice 1 para pular o cabeçalho se 'header: 1' já estiver sendo usado
        for (let i = 1; i < json.length; i++) {
            if (json[i].length < 4) {
                mostrarErro(`Erro: A linha ${i + 1} da planilha não tem dados suficientes para X, Y e Z.`);
                return;
            }
            const brutoX = json[i][1];
            const brutoY = json[i][2];
            const brutoZ = json[i][3];

            const valorX = parseFloat(brutoX);
            const valorY = parseFloat(brutoY);
            const valorZ = parseFloat(brutoZ);

            if (!isFinite(valorX) || !isFinite(valorY) || !isFinite(valorZ)) {
                mostrarErro(`Erro: todos os valores da linha ${i + 1} devem ser preenchidos com números válidos. Encontrado: X="${brutoX}", Y="${brutoY}", Z="${brutoZ}"`);
                return;
            }

            novosX.push(valorX);
            novosY.push(valorY);
            novosZ.push(valorZ);
        }

        const tbody = document.querySelector("#input-table tbody");
        if (tbody) {
            tbody.innerHTML = "";  // Limpa antes

            for (let i = 0; i < novosX.length; i++) {
                const novaLinha = document.createElement("tr");
                novaLinha.innerHTML = `
                    <td class="ponto-label-cell">
                        <div class="ponto-marker">
                            <h1>P?</h1>
                        </div>
                    </td>
                    <td><span class="input-label teko-eixo">X</span><input type="number" value="${novosX[i]}" step="0.01" name="ponto_x_${i + 1}" class="input-coordenada"></td>
                    <td><span class="input-label teko-eixo">Y</span><input type="number" value="${novosY[i]}" step="0.01" name="ponto_y_${i + 1}" class="input-coordenada"></td>
                    <td><span class="input-label teko-eixo">Z</span><input type="number" value="${novosZ[i]}" step="0.01" name="ponto_z_${i + 1}" class="input-coordenada"></td>
                    <td class="lixeira-cell"><button class="btn-lixeira"><img src="../img/Lixo.svg" alt="Remover"></button></td>
                `;
                tbody.appendChild(novaLinha);
                addLixeiraEventListener(novaLinha.querySelector('.btn-lixeira'));
            }
            atualizarRotuloPontos();
        } else {
            console.error("Elemento tbody da tabela de entrada não encontrado.");
        }
    };

    reader.readAsArrayBuffer(file);
}
//===============================================================================================

async function exportarXLSX() {
    const qtdInput = document.getElementById('quantos-pontos');
    let qtd = 0;
    if (qtdInput && qtdInput.value) {
        qtd = Number(qtdInput.value);
    } else {
        const linhasTabelaInput = document.querySelectorAll("#input-table tbody tr");
        qtd = linhasTabelaInput.length;
    }

    if (qtd === 0) {
        mostrarErro("Não há pontos na tabela de entrada para exportar. Insira a quantidade de pontos ou preencha a tabela.");
        return;
    }

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
//===============================================================================================

function adicionarCota(value) {
    cotaProjeto = Number(value);
    const linhasTabelaInput = document.querySelectorAll("#input-table tbody tr");
    if (linhasTabelaInput.length > 0) {
        gerarGrafico();
    } else {
        Plotly.newPlot('plot', [], {});
        const tbodyResultados = document.getElementById('resultados-tbody');
        if (tbodyResultados) tbodyResultados.innerHTML = '';
        const totalCorteDisplay = document.querySelector('.totais-valores div:nth-child(1) .valor-total');
        if (totalCorteDisplay) totalCorteDisplay.textContent = 'n';
        const totalAterroDisplay = document.querySelector('.totais-valores div:nth-child(2) .valor-total');
        if (totalAterroDisplay) totalAterroDisplay.textContent = 'n';
    }
}

//===============================================================================================
let tipoGrafico = 1;
function muda(tipo) {
    tipoGrafico = tipo;
    const linhasTabelaInput = document.querySelectorAll("#input-table tbody tr");
    if (linhasTabelaInput.length > 0) {
        gerarGrafico();
    } else {
        mostrarErro("Por favor, adicione e preencha os pontos na tabela 'Seu Terreno' antes de gerar o gráfico.");
        Plotly.newPlot('plot', [], {});
    }
}

function gerarGrafico() {
    x = [];
    y = [];
    z = [];
    let resultados = [];
    const linhasTabelaInput = document.querySelectorAll("#input-table tbody tr");

    if (linhasTabelaInput.length === 0) {
        mostrarErro("A tabela de entrada está vazia. Por favor, adicione pontos.");
        Plotly.newPlot('plot', [], {});
        const tbodyResultados = document.getElementById('resultados-tbody');
        if (tbodyResultados) tbodyResultados.innerHTML = '';
        const totalCorteDisplay = document.querySelector('.totais-valores div:nth-child(1) .valor-total');
        if (totalCorteDisplay) totalCorteDisplay.textContent = 'n';
        const totalAterroDisplay = document.querySelector('.totais-valores div:nth-child(2) .valor-total');
        if (totalAterroDisplay) totalAterroDisplay.textContent = 'n';
        return;
    }

    let hasError = false;

    linhasTabelaInput.forEach((linhaTr, i) => {
        const inputX = linhaTr.querySelector('input[name^="ponto_x_"]');
        const inputY = linhaTr.querySelector('input[name^="ponto_y_"]');
        const inputZ = linhaTr.querySelector('input[name^="ponto_z_"]');

        const valorX = parseFloat(inputX ? inputX.value : NaN);
        const valorY = parseFloat(inputY ? inputY.value : NaN);
        const valorZ = parseFloat(inputZ ? inputZ.value : NaN);

        if (isNaN(valorX) || isNaN(valorY) || isNaN(valorZ)) {
            mostrarErro(`Erro: todos os valores da linha ${i + 1} devem ser preenchidos corretamente.`);
            hasError = true;
            return;
        }

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
            profundidadeAterro: Math.max(0, cotaProjeto - valorZ),
            profundidadeCorte: Math.max(0, valorZ - cotaProjeto),
        });
    });

    if (hasError) {
        Plotly.newPlot('plot', [], {});
        const tbodyResultados = document.getElementById('resultados-tbody');
        if (tbodyResultados) tbodyResultados.innerHTML = '';
        const totalCorteDisplay = document.querySelector('.totais-valores div:nth-child(1) .valor-total');
        if (totalCorteDisplay) totalCorteDisplay.textContent = 'n';
        const totalAterroDisplay = document.querySelector('.totais-valores div:nth-child(2) .valor-total');
        if (totalAterroDisplay) totalAterroDisplay.textContent = 'n';
        return;
    }

    const minX_data = Math.min(...x);
    const maxX_data = Math.max(...x);
    const minY_data = Math.min(...y);
    const maxY_data = Math.max(...y);

    const plano = {
        type: 'mesh3d',
        x: [minX_data, maxX_data, maxX_data, minX_data],
        y: [minY_data, minY_data, maxY_data, maxY_data],
        z: [cotaProjeto, cotaProjeto, cotaProjeto, cotaProjeto],
        i: [0, 1, 2, 0],
        j: [1, 2, 3, 3],
        k: [2, 3, 0, 1],
        color: 'red',
        opacity: 0.5,
        name: 'Plano de Cota ' + cotaProjeto.toFixed(2) + 'm',
        showscale: false
    };

    if (tipoGrafico == 1) {
        gerarMesh3d(x, y, z, plano);
    } else if (tipoGrafico == 2) {
        density2d(x, y, z);
    } else if (tipoGrafico == 3) {
        gerarHeatmap(x, y, z);
    }

    const tbodyResultados = document.getElementById('resultados-tbody');
    if (!tbodyResultados) {
        console.error("Elemento 'resultados-tbody' não encontrado. Não foi possível atualizar a tabela de resultados.");
        return;
    }

    tbodyResultados.innerHTML = "";

    let resultadosHtml = '';

    resultados.forEach(r => {
        const tipoClasse = r.diferenca < 0 ? 'linha-corte' : r.diferenca > 0 ? 'linha-aterro' : '';

        resultadosHtml += `<tr class="${tipoClasse}">
      <td>${r.ponto}</td>
      <td>${r.x.toFixed(2)}</td>
      <td>${r.y.toFixed(2)}</td>
      <td>${r.cotaMedida.toFixed(2)}</td>
      <td>${r.cotaProjeto.toFixed(2)}</td>
      <td>${r.diferenca.toFixed(2)}</td>
      <td>${r.profundidadeCorte.toFixed(2)}</td>
      <td>${r.profundidadeAterro.toFixed(2)}</td>
    </tr>`;
    });

    // <<< AQUI VOCÊ MANIPULA O TAMANHO DA CÉLULA DA GRELHA >>>
    // O valor padrão na função calcularVolumesCorteAterro é 1.
    // Altere este valor para o que desejar para controlar a precisão do cálculo de volume.
    const tamanhoDaGrelhaParaCalculoDeVolume = 0.5; // Exemplo: 0.5 metro por 0.5 metro (maior precisão que 1)
    // Ou 1 para 1m x 1m (bom equilíbrio)
    // Ou 5 para 5m x 5m (menor precisão, mais rápido para grandes áreas)
    // =========================================================

    const { totalCorteVol, totalAterroVol } = calcularVolumesCorteAterro(x, y, z, cotaProjeto, tamanhoDaGrelhaParaCalculoDeVolume);

    resultadosHtml += `<tr style="font-weight:bold;">
    <td colspan="6">Totais</td>
    <td>${totalCorteVol.toFixed(2)} m³</td>
    <td>${totalAterroVol.toFixed(2)} m³</td>
  </tr>`;

    tbodyResultados.innerHTML = resultadosHtml;

    const totalCorteDisplay = document.querySelector('.totais-valores div:nth-child(1) .valor-total');
    const totalAterroDisplay = document.querySelector('.totais-valores div:nth-child(2) .valor-total');

    if (totalCorteDisplay) {
        totalCorteDisplay.textContent = `${totalCorteVol.toFixed(2)} m³`;
    }
    if (totalAterroDisplay) {
        totalAterroDisplay.textContent = `${totalAterroVol.toFixed(2)} m³`;
    }
}


//===============================================================================================gerarMesh3d
function gerarMesh3d(x, y, z, plano) {
    const data = [{
        x: x,
        y: y,
        z: z,
        type: 'mesh3d',
        intensity: z,
        colorscale: 'Earth',
        name: 'Terreno Original'
    }, plano];
    const layout = {
        title: 'Mapa Topográfico 3D',
        scene: {
            camera: {
                eye: { x: 1.25, y: 1.25, z: 1.25 },
                up: { x: 0, y: 0, z: 1 },
                center: { x: 0, y: 0, z: 0 }
            },
            aspectmode: 'data',
            xaxis: { title: 'X (m)' },
            yaxis: { title: 'Y (m)' },
            zaxis: { title: 'Cota (m)' },
        }
    };
    Plotly.newPlot('plot', data, layout);
}
//===============================================================================================gerarScatter3d
function density2d(dados_x_espacial, dados_y_espacial, dados_z_alturas) {
    let trace1 = {
        x: dados_x_espacial,
        y: dados_y_espacial,
        mode: 'markers',
        name: 'Pontos (X,Y Espacial)',
        marker: {
            color: 'rgba(255, 120, 120, 0.6)',
            size: 3,
        },
        type: 'scatter'
    };

    let trace2 = {
        x: dados_x_espacial,
        y: dados_y_espacial,
        name: 'Densidade Espacial (X,Y)',
        colorscale: 'Hot',
        reversescale: true,
        showscale: false,
        type: 'histogram2dcontour',
        contours: {
            coloring: 'heatmap'
        },
        xbins: { size: (Math.max(...dados_x_espacial) - Math.min(...dados_x_espacial)) / 20 || 1 },
        ybins: { size: (Math.max(...dados_y_espacial) - Math.min(...dados_y_espacial)) / 20 || 1 }
    };

    let trace3 = {
        x: dados_x_espacial,
        name: 'Distribuição X Espacial',
        marker: { color: 'rgb(102,0,0)' },
        yaxis: 'y2',
        type: 'histogram'
    };

    let trace4 = {
        y: dados_z_alturas,
        name: 'Distribuição de Alturas (Z)',
        marker: { color: 'rgb(102,0,0)' },
        xaxis: 'x2',
        type: 'histogram'
    };

    let data = [trace1, trace2, trace3, trace4];

    let layout = {
        title: 'Análise de Densidade Espacial e Distribuição de Alturas',
        showlegend: false,
        autosize: true,
        margin: { t: 60, l: 70, r: 70, b: 70 },
        hovermode: 'closest',
        bargap: 0,

        xaxis: {
            domain: [0, 0.80],
            showgrid: false,
            zeroline: false,
            title: 'Coordenada X Espacial (m)'
        },
        yaxis: {
            domain: [0, 0.80],
            showgrid: false,
            zeroline: false,
            title: 'Coordenada Y Espacial (m)',
            automargin: true

        },
        xaxis2: {
            domain: [0.82, 1,],
            showgrid: false,
            zeroline: false,
            title: 'Frequência',
            side: 'top',
            automargin: true
        },
        yaxis2: {
            domain: [0.82, 1],
            showgrid: false,
            zeroline: false,
            title: 'Frequência',
            side: 'right'
        }
    };

    Plotly.newPlot('plot', data, layout);

}
//===============================================================================================gerarHeatmap
function gerarHeatmap(x, y, z) {
    const gridSize = 50;
    const minX = Math.min(...x), maxX = Math.max(...x);
    const minY = Math.min(...y), maxY = Math.max(...y);
    const stepX = (maxX - minX) / gridSize;
    const stepY = (maxY - minY) / gridSize;

    const xi = Array.from({ length: gridSize + 1 }, (_, i) => minX + i * stepX);
    const yi = Array.from({ length: gridSize + 1 }, (_, i) => minY + i * stepY);

    const zi = yi.map(yVal => {
        return xi.map(xVal => {
            let somaPesos = 0;
            let somaZ = 0;
            if (x.length === 0) return NaN;

            for (let i = 0; i < x.length; i++) {
                const dx = x[i] - xVal;
                const dy = y[i] - yVal;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const peso = 1 / (dist + 0.0001);
                somaPesos += peso;
                somaZ += z[i] * peso;
            }
            return somaZ / somaPesos;
        });
    });

    const data = [{
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
                color: '#000000',
                family: 'Arial Black, sans-serif'
            }
        },
        line: {
            color: '#000000',
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

    const layout = {
        title: 'Mapa Topográfico (Contorno)',
        xaxis: { title: 'X (m)' },
        yaxis: { title: 'Y (m)' },
    };
    Plotly.newPlot('plot', data, layout);
}


//===============================================================================================
function exportTable() {
    gerarGrafico();
    console.log("Exportar tabela");

    const tabelaElement = document.getElementById('resultados-tabela-principal');
    if (!tabelaElement) {
        console.error("Tabela de resultados principal não encontrada. Não foi possível exportar.");
        return;
    }

    const workbook = XLSX.utils.table_to_book(tabelaElement, { sheet: "Resultados" });
    XLSX.writeFile(workbook, "tabela_corte_aterro.xlsx");
}


function mostrarErro(texto) {
    alert(texto);
}

function imprimirPDF() {
    gerarGrafico();
    window.print();
}

// ===============================================================================================
// FUNÇÕES PARA A TABELA DE ENTRADA (MOVIMENTAÇÃO DE LINHAS)
// ===============================================================================================

function atualizarRotuloPontos() {
    const pontoMarkers = document.querySelectorAll("#input-table .ponto-marker h1");
    // Inverter a ordem dos rótulos para que P1 fique na primeira linha (topo)
    const rows = document.querySelectorAll("#input-table tbody tr");
    rows.forEach((row, index) => {
        const marker = row.querySelector(".ponto-marker h1");
        if (marker) {
            marker.textContent = `P${index + 1}`; // Indexação de 1 a N
        }
        // Também é uma boa prática reindexar os atributos name dos inputs para corresponder ao Px
        row.querySelectorAll('input.input-coordenada').forEach(input => {
            const nameParts = input.name.split('_');
            if (nameParts.length >= 2) { // Garante que é um nome tipo ponto_x_N
                input.name = `${nameParts[0]}_${nameParts[1]}_${index + 1}`;
            }
        });
    });
}

// Função para adicionar uma nova linha à tabela de entrada
function adicionarLinha(quantidade = 1) { // Agora aceita um argumento para adicionar múltiplas linhas
    const tbody = document.querySelector("#input-table tbody");
    if (!tbody) {
        console.error("Tbody da tabela de entrada não encontrado.");
        return;
    }

    for (let i = 0; i < quantidade; i++) {
        const novaLinha = document.createElement("tr");
        novaLinha.innerHTML = `
            <td class="ponto-label-cell">
                <div class="ponto-marker">
                    <h1>P?</h1>
                </div>
            </td>
            <td><span class="input-label teko-eixo">X</span><input type="number" value="0" step="0.01" name="ponto_x_new" class="input-coordenada"></td>
            <td><span class="input-label teko-eixo">Y</span><input type="number" value="0" step="0.01" name="ponto_y_new" class="input-coordenada"></td>
            <td><span class="input-label teko-eixo">Z</span><input type="number" value="0" step="0.01" name="ponto_z_new" class="input-coordenada"></td>
            <td class="lixeira-cell"><button class="btn-lixeira"><img src="../img/Lixo.svg" alt="Remover"></button></td>
        `;
        // Adiciona a nova linha no final do tbody (para manter a ordem P1, P2... Pn)
        tbody.appendChild(novaLinha);
        addLixeiraEventListener(novaLinha.querySelector('.btn-lixeira'));
    }
    atualizarRotuloPontos(); // Reindexa após adicionar todas as linhas
}

// Função para remover uma linha da tabela de entrada
function removerLinha(buttonElement) {
    const row = buttonElement.closest('tr');
    if (row) {
        row.remove();
        atualizarRotuloPontos();
    }
}

// Função auxiliar para adicionar listener de clique aos botões de lixeira
function addLixeiraEventListener(button) {
    button.addEventListener('click', () => removerLinha(button));
}


document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os rótulos dos pontos existentes na tabela de entrada
    atualizarRotuloPontos();

    // Adiciona event listeners para os botões "Adicionar" e "Plus"
    const btnAdicionarInput = document.querySelector(".terreno-lateral-esq .btn-adicionar"); // Botão ao lado do input de quantidade
    const inputQuantosPontos = document.getElementById('quantos-pontos'); // Input de quantidade

    if (btnAdicionarInput && inputQuantosPontos) {
        btnAdicionarInput.addEventListener('click', () => {
            const numPontosParaAdicionar = parseInt(inputQuantosPontos.value, 10);
            if (isNaN(numPontosParaAdicionar) || numPontosParaAdicionar < 1) {
                mostrarErro("Por favor, insira um número válido de pontos (maior que zero).");
                return;
            }
            adicionarLinha(numPontosParaAdicionar); // Chama a função com a quantidade
            inputQuantosPontos.value = ''; // Limpa o input após adicionar
        });
    }

    const btnPlus = document.querySelector(".terreno-central .btn-plus"); // Botão "Plus" grande
    if (btnPlus) {
        btnPlus.addEventListener('click', () => {
            adicionarLinha(1); // Adiciona apenas uma linha
        });
    }

    // Adiciona event listeners para todos os botões de lixeira existentes inicialmente no DOM
    document.querySelectorAll("#input-table .btn-lixeira").forEach(button => {
        addLixeiraEventListener(button);
    });

    const cotaProjetoInput = document.getElementById('cota-projeto');
    if (cotaProjetoInput) {
        cotaProjeto = Number(cotaProjetoInput.value) || 100;
    }
});

// ===============================================================================================
// FUNÇÃO PARA CÁLCULO DE VOLUME DE CORTE E ATERRO EM M³
// ===============================================================================================

/**
 * Calcula o volume total de corte e aterro usando o Método da Grelha.
 * @param {Array<number>} x Coordenadas X dos pontos do terreno.
 * @param {Array<number>} y Coordenadas Y dos pontos do terreno.
 * @param {Array<number>} z Coordenadas Z (cotas) dos pontos do terreno.
 * @param {number} cotaProjeto A cota do plano de projeto.
 * @param {number} [gridCellSize=1] O tamanho da célula da grelha em metros (ex: 1m x 1m).
 * @returns {object} Um objeto com totalCorteVol (m³) e totalAterroVol (m³).
 */
function calcularVolumesCorteAterro(x, y, z, cotaProjeto, gridCellSize = 1) {
    if (x.length === 0 || y.length === 0 || z.length === 0) {
        return { totalCorteVol: 0, totalAterroVol: 0 };
    }

    const minX = Math.min(...x), maxX = Math.max(...x);
    const minY = Math.min(...y), maxY = Math.max(...y);

    const gridMinX = Math.floor(minX / gridCellSize) * gridCellSize;
    const gridMaxX = Math.ceil(maxX / gridCellSize) * gridCellSize;
    const gridMinY = Math.floor(minY / gridCellSize) * gridCellSize;
    const gridMaxY = Math.ceil(maxY / gridCellSize) * gridCellSize;

    let totalCorteVol = 0;
    let totalAterroVol = 0;

    for (let currentX = gridMinX; currentX < gridMaxX; currentX += gridCellSize) {
        for (let currentY = gridMinY; currentY < gridMaxY; currentY += gridCellSize) {

            const corners = [
                { cx: currentX, cy: currentY },
                { cx: currentX + gridCellSize, cy: currentY },
                { cx: currentX, cy: currentY + gridCellSize },
                { cx: currentX + gridCellSize, cy: currentY + gridCellSize }
            ];

            let sumZOriginalCorners = 0;
            let validCorners = 0;

            corners.forEach(corner => {
                let somaPesos = 0;
                let somaZ = 0;

                for (let i = 0; i < x.length; i++) {
                    const dx = x[i] - corner.cx;
                    const dy = y[i] - corner.cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const peso = 1 / (dist + 0.0001);
                    somaPesos += peso;
                    somaZ += z[i] * peso;
                }

                if (somaPesos > 0) {
                    sumZOriginalCorners += (somaZ / somaPesos);
                    validCorners++;
                }
            });

            if (validCorners > 0) {
                const avgZOriginal = sumZOriginalCorners / validCorners;
                const avgHeightDifference = avgZOriginal - cotaProjeto;

                const cellVolume = avgHeightDifference * (gridCellSize * gridCellSize);

                if (cellVolume > 0) {
                    totalCorteVol += cellVolume;
                } else {
                    totalAterroVol += Math.abs(cellVolume);
                }
            }
        }
    }

    return { totalCorteVol, totalAterroVol };
}