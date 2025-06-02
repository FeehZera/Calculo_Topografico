// main.js - Apenas lógica de navegação de abas e barra indicadora

let abaAtual = 1; // Padrão: começar na aba "Seu Terreno"

const tabTerreno = document.getElementById('Terreno');
const tabGrafico = document.getElementById('Grafico');
const tabResultados = document.getElementById('Resultados');

const btnSeuTerreno = document.getElementById('btnSeuTerreno');
const btnGrafico = document.getElementById('btnGrafico');
const btnResultados = document.getElementById('btnResultados');

const allNavButtons = document.querySelectorAll('.nav-button');
const allTabContents = document.querySelectorAll('.tab-content');
const navIndicatorBar = document.querySelector('.main-nav .nav-indicator-bar');

// Função para atualizar a posição e largura da barra indicadora da aba ativa
function atualizarBarraIndicadora(activeButton) {
  if (activeButton && navIndicatorBar) {
    const offsetLeftRelativeToNav = activeButton.offsetLeft;
    navIndicatorBar.style.width = `${activeButton.offsetWidth}px`;
    navIndicatorBar.style.left = `${offsetLeftRelativeToNav}px`;
    navIndicatorBar.style.display = 'block'; // Garante que a barra esteja visível
  } else if (navIndicatorBar) {
    navIndicatorBar.style.display = 'none'; // Esconde a barra se não houver botão ativo
  }
}

// Função para atualizar a visibilidade das abas e o estado dos botões de navegação
function atualizarVisibilidadeAbas() {
  // Remove a classe 'active' de todas as abas e botões
  allTabContents.forEach(content => content.classList.remove('active'));
  allNavButtons.forEach(btn => btn.classList.remove('active'));

  let botaoAtivo = null; // Para rastrear qual botão está ativo e atualizar a barra indicadora

  // Adiciona a classe 'active' à aba e botão corretos com base em 'abaAtual'
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

  // Atualiza a barra indicadora com base no botão ativo
  atualizarBarraIndicadora(botaoAtivo);
}

// Evento DOMContentLoaded garante que o DOM esteja completamente carregado
document.addEventListener('DOMContentLoaded', () => {
  // Define a aba inicial e atualiza a visibilidade
  const initialActiveButton = document.querySelector('.nav-button.active');
  if (initialActiveButton) {
    // Se já houver um botão ativo no HTML, usa ele para definir a aba inicial
    if (initialActiveButton.id === 'btnSeuTerreno') abaAtual = 1;
    else if (initialActiveButton.id === 'btnGrafico') abaAtual = 2;
    else if (initialActiveButton.id === 'btnResultados') abaAtual = 3;
    atualizarVisibilidadeAbas();
    // Pequeno atraso para garantir que a barra indicadora posicione corretamente após a renderização inicial
    setTimeout(() => atualizarBarraIndicadora(initialActiveButton), 50);
  } else {
    // Se não houver botão ativo no HTML, define a aba inicial para 1 (Terreno)
    abaAtual = 1;
    atualizarVisibilidadeAbas();
  }

  // Adiciona event listeners para os botões de navegação
  if (btnSeuTerreno) {
    btnSeuTerreno.addEventListener('click', () => {
      abaAtual = 1;
      atualizarVisibilidadeAbas();
    });
  }
  if (btnGrafico) {
    btnGrafico.addEventListener('click', () => {
      abaAtual = 2;
      // Nota: a função gerarGrafico() é chamada via onclick no HTML do botão PLAN IT!
      // ou quando a cota ou tipo de gráfico muda. Não precisa ser chamada aqui.
      atualizarVisibilidadeAbas();
    });
  }
  if (btnResultados) {
    btnResultados.addEventListener('click', () => {
      abaAtual = 3;
      atualizarVisibilidadeAbas();
    });
  }

  // Adiciona listener para o botão "PLAN IT!" para mudar para a aba de Gráfico
  // A lógica de gerar o gráfico é chamada pelo onclick no HTML deste botão.
  const btnPlanIt = document.querySelector('#Terreno .btn-planit');
  if (btnPlanIt) {
    btnPlanIt.addEventListener('click', () => {
      // Apenas muda a aba, a função gerarGrafico() é chamada via onclick no HTML
      abaAtual = 2;
      atualizarVisibilidadeAbas();
    });
  }


  // Atualiza a barra indicadora quando a janela é redimensionada
  window.addEventListener('resize', () => {
    const currentActiveButton = document.querySelector('.nav-button.active');
    if (currentActiveButton) {
      atualizarBarraIndicadora(currentActiveButton);
    }
  });
});