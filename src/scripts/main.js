let abaAtual = 1;
const tabTerreno = document.getElementById('Terreno');
const tabGrafico = document.getElementById('Grafico');
const tabResultados = document.getElementById('Resultados');
const btnSeuTerreno = document.getElementById('btnSeuTerreno');
const btnGrafico = document.getElementById('btnGrafico');
const btnResultados = document.getElementById('btnResultados');
const allNavButtons = document.querySelectorAll('.nav-button');
const allTabContents = document.querySelectorAll('.tab-content');
const navIndicatorBar = document.querySelector('.main-nav .nav-indicator-bar');

function atualizarBarraIndicadora(activeButton) {
  if (activeButton && navIndicatorBar) {
    const offsetLeftRelativeToNav = activeButton.offsetLeft;
    navIndicatorBar.style.width = `${activeButton.offsetWidth}px`;
    navIndicatorBar.style.left = `${offsetLeftRelativeToNav}px`;
    navIndicatorBar.style.display = 'block';
  } else if (navIndicatorBar) {
    navIndicatorBar.style.display = 'none';
  }
}

function atualizarVisibilidadeAbas() {
  allTabContents.forEach(content => content.classList.remove('active'));
  allNavButtons.forEach(btn => btn.classList.remove('active'));
  let botaoAtivo = null;
  if (abaAtual === 1) {
    if (tabTerreno) tabTerreno.classList.add('active');
    if (btnSeuTerreno) {
      btnSeuTerreno.classList.add('active');
      botaoAtivo = btnSeuTerreno;
    }
  } else if (abaAtual === 2) {
    if (tabGrafico) tabGrafico.classList.add('active');
    if (btnGrafico) {
      btnGrafico.classList.add('active');
      botaoAtivo = btnGrafico;
    }
  } else if (abaAtual === 3) {
    if (tabResultados) tabResultados.classList.add('active');
    if (btnResultados) {
      btnResultados.classList.add('active');
      botaoAtivo = btnResultados;
    }
  }
  atualizarBarraIndicadora(botaoAtivo);
}
document.addEventListener('DOMContentLoaded', () => {
  const initialActiveButton = document.querySelector('.nav-button.active');
  if (initialActiveButton) {
    if (initialActiveButton.id === 'btnSeuTerreno') abaAtual = 1;
    else if (initialActiveButton.id === 'btnGrafico') abaAtual = 2;
    else if (initialActiveButton.id === 'btnResultados') abaAtual = 3;
    atualizarVisibilidadeAbas();
    setTimeout(() => atualizarBarraIndicadora(initialActiveButton), 50);
  } else {
    abaAtual = 1;
    atualizarVisibilidadeAbas();
  }
  if (btnSeuTerreno) {
    btnSeuTerreno.addEventListener('click', () => {
      abaAtual = 1;
      atualizarVisibilidadeAbas();
    });
  }
  if (btnGrafico) {
    btnGrafico.addEventListener('click', () => {
      abaAtual = 2;
      atualizarVisibilidadeAbas();
    });
  }
  if (btnResultados) {
    btnResultados.addEventListener('click', () => {
      abaAtual = 3;
      atualizarVisibilidadeAbas();
    });
  }
  window.addEventListener('resize', () => {
    const currentActiveButton = document.querySelector('.nav-button.active');
    if (currentActiveButton) {
      atualizarBarraIndicadora(currentActiveButton);
    }
  });
  const btnPlus = document.querySelector('#Terreno .btn-plus');
  const tabelaPontosBody = document.querySelector('#Terreno .scrollable-table table tbody');
  const btnAdicionarComInput = document.querySelector('.terreno-lateral-esq .btn-adicionar');
  const inputQuantosPontos = document.getElementById('quantos-pontos');
  const btnPlanIt = document.querySelector('#Terreno .btn-planit');

  function criarLinhaPontoHTML(numeroPonto) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
            <td class="ponto-label-cell">
                <div class="ponto-marker">
                    <h1>P${numeroPonto}</h1>
                </div>
            </td>
            <td><span class="input-label teko-eixo">X</span><input type="number" step="0.01" name="ponto_x_${numeroPonto}" class="input-coordenada"></td>
            <td><span class="input-label teko-eixo">Y</span><input type="number" step="0.01" name="ponto_y_${numeroPonto}" class="input-coordenada"></td>
            <td><span class="input-label teko-eixo">Z</span><input type="number" step="0.01" name="ponto_z_${numeroPonto}" class="input-coordenada"></td>
            <td class="lixeira-cell"><button class="btn-lixeira"><img src="../img/Lixo.svg" alt="Remover"></button></td>
        `;
    const lixeiraButton = newRow.querySelector('.btn-lixeira');
    if (lixeiraButton) {
      lixeiraButton.addEventListener('click', function() {
        this.closest('tr').remove();
        reindexarPontos();
      });
    }
    return newRow;
  }

  function reindexarPontos() {
    if (!tabelaPontosBody) return;
    const rows = tabelaPontosBody.querySelectorAll('tr');
    const totalRows = rows.length;
    rows.forEach((row, index) => {
      const pontoNum = totalRows - index;
      const pontoH1 = row.querySelector('.ponto-label-cell .ponto-marker h1');
      if (pontoH1) {
        pontoH1.textContent = `P${pontoNum}`;
      }
      row.querySelectorAll('input.input-coordenada').forEach(input => {
        const oldName = input.name;
        if (oldName) {
          const nameParts = oldName.split('_');
          if (nameParts.length === 3) {
            input.name = `${nameParts[0]}_${nameParts[1]}_${pontoNum}`;
          }
        }
      });
    });
  }

  function adicionarPontosViaInput() {
    if (!inputQuantosPontos || !tabelaPontosBody) return;
    const numPontosParaAdicionar = parseInt(inputQuantosPontos.value, 10);
    if (isNaN(numPontosParaAdicionar) || numPontosParaAdicionar < 1) {
      alert("Por favor, insira um número válido de pontos.");
      return;
    }
    for (let i = 0; i < numPontosParaAdicionar; i++) {
      const novoNumeroPonto = tabelaPontosBody.querySelectorAll('tr').length + 1;
      const newRow = criarLinhaPontoHTML(novoNumeroPonto);
      tabelaPontosBody.insertBefore(newRow, tabelaPontosBody.firstChild);
    }
    reindexarPontos();
    inputQuantosPontos.value = '';
  }

  function adicionarListenersLixeiraIniciais() {
    if (!tabelaPontosBody) return;
    const lixeiraButtons = tabelaPontosBody.querySelectorAll('.btn-lixeira');
    lixeiraButtons.forEach(button => {
      if (button.dataset.listenerAttached) return;
      button.addEventListener('click', function() {
        this.closest('tr').remove();
        reindexarPontos();
      });
      button.dataset.listenerAttached = 'true';
    });
  }
  if (btnPlus && tabelaPontosBody) {
    btnPlus.addEventListener('click', () => {
      const novoNumeroPonto = tabelaPontosBody.querySelectorAll('tr').length + 1;
      const newRow = criarLinhaPontoHTML(novoNumeroPonto);
      tabelaPontosBody.insertBefore(newRow, tabelaPontosBody.firstChild);
      reindexarPontos();
    });
  }
  if (btnAdicionarComInput) {
    btnAdicionarComInput.addEventListener('click', adicionarPontosViaInput);
  }
  if (btnPlanIt) {
    btnPlanIt.addEventListener('click', () => {
      console.log("Botão PLAN IT! clicado. Lógica de coleta de dados e geração de gráfico a ser implementada.");
      abaAtual = 2;
      atualizarVisibilidadeAbas();
    });
  }
  adicionarListenersLixeiraIniciais();
  if (tabelaPontosBody && tabelaPontosBody.querySelectorAll('tr').length > 0) {
    reindexarPontos();
  }
});