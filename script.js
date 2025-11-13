/* script.js
   Responsável por:
   - carregar e parsear `dados.csv` (fetch + parseCSV)
   - construir a tabela de dados e o seletor de séries
   - inicializar o gráfico usando Chart.js
   - gerenciar controles de UI: menu hambúrguer, botão voltar ao topo e tema
   Estrutura geral:
   1) Parse CSV -> populate chartData
   2) createTable() e createSeriesSelector()
   3) initChart() (Chart.js)
   4) Interações: toggleSeries, updateChart, handlers de scroll e tema
*/
// Dados do gráfico armazenados em memória
let chartData = [];
// Referência ao objeto Chart.js criado em initChart()
let mainChart;
// Séries que iniciam visíveis no gráfico (podem ser alternadas pelo usuário)
let selectedSeries = [
  "Consultas Especializadas",
  "Exames de PSA",
  "Biópsias de Próstata",
];

// Paleta de cores usada no gráfico (mapeamento por nome da série)
const colors = {
  "Consultas Especializadas": "#007bff",
  "Exames de PSA": "#17a2b8",
  "Biópsias de Próstata": "#28a745",
};

// Converte o CSV (dados.csv) em um array de objetos suitable para usar no gráfico e tabela
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines
    .shift()
    .split(";")
    .map((h) => h.trim().replace(/"/g, ""));

  const months = headers.slice(1);
  const monthlyData = months.map((month) => ({ Mês: month }));

  const procedureMap = {
    "0201010410 BIOPSIA DE PROSTATA": "Biópsias de Próstata",
    "0202030105 DOSAGEM DE ANTIGENO PROSTATICO ESPECIFICO (PSA)":
      "Exames de PSA",
    "0301010072 CONSULTA MEDICA EM ATENCAO ESPECIALIZADA":
      "Consultas Especializadas",
  };

  lines.forEach((line) => {
    const values = line.split(";");
    const procedureNameRaw = values.shift().trim().replace(/"/g, "");
    const cleanProcedureName = procedureMap[procedureNameRaw];

    if (cleanProcedureName) {
      values.forEach((value, index) => {
        const count = parseInt(value.trim().replace(/"/g, "") || "0");
        monthlyData[index][cleanProcedureName] = count;
      });
    }
  });

  chartData = monthlyData;
  createTable();
  createSeriesSelector();
}

// Faz o fetch do arquivo CSV e chama parseCSV; retorna true/false indicando sucesso
async function loadData() {
  try {
    const response = await fetch("dados.csv");
    const csvText = await response.text();
    parseCSV(csvText);
    return true;
  } catch (error) {
    console.error("Erro ao carregar ou processar dados.csv:", error);
    return false;
  }
}

// Gera a configuração compatível com Chart.js (datasets, labels, e opções)
function getChartConfig() {
  const labels = chartData.map((item) => item.Mês);
  const datasets = selectedSeries.map((series) => {
    const data = chartData.map((item) => item[series]);
    const isLine = series === "Biópsias de Próstata";
    return {
      label: series,
      data: data,
      backgroundColor: isLine ? colors[series] + "40" : colors[series],
      borderColor: colors[series],
      type: isLine ? "line" : "bar",
      yAxisID: isLine ? "y1" : "y",
      tension: 0.4,
      borderWidth: isLine ? 3 : 1,
      pointRadius: isLine ? 5 : 0,
    };
  });

  return {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
        },
        title: {
          display: true,
          text: "Volume Mensal de Procedimentos em Juiz de Fora (Simulado)",
        },
      },
      scales: {
        x: {
          stacked: false,
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Volume (Consultas e PSA)",
          },
          min: 0,
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "Volume (Biópsias)",
          },
          grid: {
            drawOnChartArea: false, // Só desenha a grade da primeira escala Y
          },
          min: 0,
        },
      },
    },
  };
}

// Inicializa o gráfico Chart.js usando o canvas #mainChart
function initChart() {
  const ctx = document.getElementById("mainChart").getContext("2d");
  mainChart = new Chart(ctx, getChartConfig());
}

// Renderiza caixas de seleção para habilitar/desabilitar séries do gráfico
function createSeriesSelector() {
  const selector = document.getElementById("seriesSelector");
  const allSeries = Object.keys(colors);

  selector.innerHTML = allSeries
    .map((series) => {
      const isChecked = selectedSeries.includes(series) ? "checked" : "";
      return `
            <div class="series-checkbox" role="checkbox" aria-checked="${selectedSeries.includes(
              series
            )}">
                <input 
                    type="checkbox" 
                    id="${series.replace(/\s/g, "")}" 
                    value="${series}" 
                    ${isChecked}
                    onclick="toggleSeries('${series}')"
                >
                <label for="${series.replace(/\s/g, "")}">${series}</label>
            </div>
        `;
    })
    .join("");
}

// Alterna a visibilidade de uma série no gráfico e atualiza o gráfico
function toggleSeries(series) {
  const index = selectedSeries.indexOf(series);
  if (index > -1) selectedSeries.splice(index, 1);
  else selectedSeries.push(series);
  updateChart();
}

// Recria os datasets (com base nas séries selecionadas) e redesenha o gráfico
function updateChart() {
  mainChart.data.datasets = getChartConfig().data.datasets;
  mainChart.update();
}

// Cria a tabela HTML `#dataTable` com os dados processados e adiciona linha de Totais
function createTable() {
  const table = document.getElementById("dataTable");
  const allColumns = Object.keys(chartData[0]);
  const dataColumns = allColumns.slice(1);

  let headerHTML = `<tr>${allColumns
    .map((c) => `<th>${c}</th>`)
    .join("")}</tr>`;

  let bodyHTML = chartData
    .map(
      (item) =>
        `<tr>${allColumns
          .map(
            (c) =>
              `<td data-label="${c}">${
                item[c] === undefined ? 0 : item[c]
              }</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  const totals = {};
  dataColumns.forEach((col) => {
    totals[col] = chartData.reduce((sum, item) => sum + (item[col] || 0), 0);
  });

  bodyHTML += `<tr class="total-row"><td>Total</td>${dataColumns
    .map((c) => `<td>${totals[c]}</td>`)
    .join("")}</tr>`;

  table.innerHTML = `<thead>${headerHTML}</thead><tbody>${bodyHTML}</tbody>`;
}

// =======================================
// FUNÇÕES DE BOTÃO VOLTAR AO TOPO
// =======================================

// Mostra/oculta o botão "Voltar ao Topo" baseado na posição de rolagem
function scrollFunction() {
  const mybutton = document.getElementById("backToTopBtn");
  // Só mostra o botão se a rolagem for maior que 300px
  if (
    document.body.scrollTop > 300 ||
    document.documentElement.scrollTop > 300
  ) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// Rola suavemente a página até o topo (usado pelo botão backToTop)
function topFunction() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// =======================================
// LÓGICA PRINCIPAL (Tema + Load + Eventos)
// Este bloco configura: carregamento dos dados, inicialização do gráfico,
// interações do menu hambúrguer, botão "voltar ao topo" e alternância de tema.
// =======================================

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Carregar Dados e Iniciar Gráfico
  const dataLoaded = await loadData();
  if (dataLoaded) {
    initChart();
  }

  // 2. Lógica do Menu Hambúrguer
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  // Clique e teclado (Enter / Space) para acessibilidade
  function toggleNav() {
    const expanded = hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
    // Atualiza aria-expanded para leitores de tela
    hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    // Ajusta foco apropriado quando menu abre
    if (expanded) navLinks.querySelector('a')?.focus();
    else hamburger.focus();
  }

  hamburger.addEventListener("click", toggleNav);
  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleNav();
    }
  });

  // 3. Configuração do botão Voltar ao Topo
  const backToTopBtn = document.getElementById("backToTopBtn");
  backToTopBtn.addEventListener("click", topFunction);

  // Adiciona o listener de rolagem à janela
  window.addEventListener("scroll", scrollFunction);

  // 4. LÓGICA DE TEMA ESCURO/CLARO
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const htmlElement = document.documentElement;
  const localStorageThemeKey = "theme";

  // Função para aplicar o tema e atualizar o ícone do botão
  function applyTheme(theme) {
    if (theme === "dark") {
      htmlElement.setAttribute("data-theme", "dark");
      themeToggleBtn.innerHTML = "☀️"; // Ícone para tema CLARO
      themeToggleBtn.setAttribute("aria-label", "Alternar para tema claro");
    } else {
      htmlElement.removeAttribute("data-theme"); // Remove o atributo para tema CLARO
      themeToggleBtn.innerHTML = "🌙"; // Ícone para tema ESCURO
      themeToggleBtn.setAttribute("aria-label", "Alternar para tema escuro");
    }
  }

  // A. Verificar a preferência inicial
  let savedTheme = localStorage.getItem(localStorageThemeKey);

  if (!savedTheme) {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    savedTheme = prefersDark ? "dark" : "light";
  }

  // B. Aplica o tema inicial
  applyTheme(savedTheme);

  // C. Adicionar listener para alternar o tema no clique
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme =
      htmlElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";

    applyTheme(newTheme);
    localStorage.setItem(localStorageThemeKey, newTheme);
  });
});
const slides = document.querySelectorAll(".carousel-slide");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");
const dotsContainer = document.querySelector(".carousel-dots");
let current = 0;

// Criar bolinhas de navegação
slides.forEach((_, i) => {
  const dot = document.createElement("span");
  dot.classList.add("carousel-dot");
  if (i === 0) dot.classList.add("active");
  dot.addEventListener("click", () => showSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll(".carousel-dot");

function showSlide(index) {
  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  current = index;
}

prevBtn.addEventListener("click", () => {
  current = (current - 1 + slides.length) % slides.length;
  showSlide(current);
});

nextBtn.addEventListener("click", () => {
  current = (current + 1) % slides.length;
  showSlide(current);
});

// Avanço automático
setInterval(() => {
  current = (current + 1) % slides.length;
  showSlide(current);
}, 8000);
