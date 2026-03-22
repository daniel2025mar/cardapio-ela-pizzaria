import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================
// SUPABASE CONFIG
// =============================
const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================
// ELEMENTOS
// =============================
const container = document.getElementById("cardapioContainer");
const loading = document.getElementById("loadingCardapio");
const imgFundoDiv = document.querySelector(".img-fundo");
const logoRestauranteImg = document.querySelector(".logo-restaurante img");

// =============================
// CACHE PARA EVITAR PISCAR
// =============================
let cacheCardapio = "";
let cacheFundo = "";
let cacheLogo = "";

// =============================
// FUNÇÃO SEPARADA: CARREGAR IMAGEM DE FUNDO
// =============================
async function carregarImagemFundo() {
  try {
    const { data: empresa, error } = await supabase
      .from("empresa")
      .select("fundo_url")
      .limit(1)
      .single();

    if (error) {
      console.error("Erro ao buscar fundo da empresa:", error);
      return;
    }

    if (empresa?.fundo_url && cacheFundo !== empresa.fundo_url) {
      cacheFundo = empresa.fundo_url;
      imgFundoDiv.innerHTML = `<img src="${empresa.fundo_url}" alt="Fundo do Topo">`;
    }
  } catch (erro) {
    console.error("Erro geral imagem de fundo:", erro);
  }
}

// =============================
// FUNÇÃO SEPARADA: CARREGAR LOGO
// =============================
async function carregarLogoRestaurante() {
  try {
    const { data: empresa, error } = await supabase
      .from("empresa")
      .select("logo_url")
      .limit(1)
      .single();

    if (error) {
      console.error("Erro ao buscar logo da empresa:", error);
      return;
    }

    if (empresa?.logo_url && cacheLogo !== empresa.logo_url) {
      cacheLogo = empresa.logo_url;
      if (logoRestauranteImg) {
        logoRestauranteImg.src = empresa.logo_url;
      }
    }
  } catch (erro) {
    console.error("Erro geral logo da empresa:", erro);
  }
}

// =============================
// FUNÇÃO CARREGAR CARDÁPIO
// =============================
async function carregarCardapio() {
  try {
    // BUSCAR CATEGORIAS
    const { data: categorias, error: erroCategorias } = await supabase
      .from("categorias")
      .select("id, titulo")
      .order("titulo");

    if (erroCategorias) {
      console.error("Erro categorias:", erroCategorias);
      return;
    }

    // BUSCAR PRODUTOS
    const { data: produtos, error: erroProdutos } = await supabase
      .from("produtos")
      .select("id, nome, descricao, preco, promocao, foto_url, categoria_id");

    if (erroProdutos) {
      console.error("Erro produtos:", erroProdutos);
      return;
    }

    // VERIFICAR SE MUDOU ALGUMA COISA
    const dadosAtuais = JSON.stringify({ categorias, produtos });
    if (dadosAtuais === cacheCardapio) return; // nada mudou
    cacheCardapio = dadosAtuais;

    // MOSTRAR LOADING APENAS NA PRIMEIRA VEZ
    if (container.innerHTML === "") {
      if (loading) loading.style.display = "block";
    }

    // LIMPAR CARDÁPIO
    container.innerHTML = "";

    // CRIAR CATEGORIAS
    categorias.forEach(categoria => {
      const section = document.createElement("section");
      section.className = "categoria";

      section.innerHTML = `
        <h2 class="titulo-categoria">${categoria.titulo}</h2>
        <div class="produtos-container" id="categoria-${categoria.id}"></div>
      `;
      container.appendChild(section);
    });

    // INSERIR PRODUTOS
    produtos.forEach(produto => {
      const categoriaDiv = document.getElementById(`categoria-${produto.categoria_id}`);
      if (!categoriaDiv) return;

      const preco = produto.promocao ? produto.promocao : produto.preco;

      const card = document.createElement("div");
      card.className = "card-produto";

      card.innerHTML = `
        <img src="${produto.foto_url || './Imagem/default.jpg'}" class="produto-img">
        <div class="produto-info">
          <h3 class="produto-nome">${produto.nome}</h3>
          <p class="produto-desc">${produto.descricao || ""}</p>
          <div class="produto-preco">R$ ${Number(preco).toFixed(2).replace(".", ",")}</div>
        </div>
        <button class="btn-adicionar">Adicionar</button>
      `;

      categoriaDiv.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro geral:", erro);
  } finally {
    if (loading) loading.style.display = "none";
  }
}


    // ✅ FUNÇÃO PARA CARREGAR NOME DA EMPRESA
    async function carregarNomeEmpresa() {

      const { data, error } = await supabase
        .from("empresa")
        .select("nome")
        .limit(1)
        .single();

      if (error) {
        console.error("Erro ao buscar empresa:", error);
        return;
      }

      const elementoNome = document.querySelector(".nome-restaurante");

      // 👉 Nome no topo
      if (elementoNome && data) {
        elementoNome.textContent = data.nome;
      }

      // 👉 Nome na aba do navegador
      if (data && data.nome) {
        document.title = data.nome + " - Cardápio";
      }
    }

const botaoPesquisa = document.querySelector(".btn-pesquisa");
const campoPesquisa = document.getElementById("campoPesquisa");

function abrirPesquisa(){
  campoPesquisa.style.width = "200px";
  campoPesquisa.style.opacity = "1";
  campoPesquisa.focus(); // coloca o cursor dentro
}

// abre ao passar o mouse
botaoPesquisa.addEventListener("mouseenter", abrirPesquisa);

// abre ao clicar
botaoPesquisa.addEventListener("click", abrirPesquisa);

document.addEventListener("DOMContentLoaded", function () {

  const btnCarrinho = document.querySelector(".btn-carrinho");
  const modalCarrinho = document.getElementById("modalCarrinho");
  const fecharCarrinho = document.getElementById("fecharCarrinho");

  if (btnCarrinho && modalCarrinho) {
    btnCarrinho.addEventListener("click", function () {
      modalCarrinho.style.display = "flex";
    });
  }

  if (fecharCarrinho) {
    fecharCarrinho.addEventListener("click", function () {
      modalCarrinho.style.display = "none";
    });
  }

  window.addEventListener("click", function (event) {
    if (event.target === modalCarrinho) {
      modalCarrinho.style.display = "none";
    }
  });

});

// ===============================
// Função para formatar CNPJ
// ===============================
function formatarCNPJ(cnpj) {

  if (!cnpj) return "";

  // remove tudo que não for número
  cnpj = cnpj.replace(/\D/g, "");

  // aplica máscara do CNPJ
  return cnpj
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}


// ===============================
// Buscar empresa no Supabase
// ===============================
async function carregarEmpresa() {

  try {

    const { data, error } = await supabase
      .from("empresa")
      .select("nome, cnpj")
      .limit(1)
      .single();

    if (error) {
      console.error("Erro ao buscar empresa:", error);
      return;
    }

    console.log("Empresa encontrada:", data);

    const empresaElement = document.getElementById("empresaCNPJ");

    if (!empresaElement) {
      console.warn("Elemento empresaCNPJ não encontrado no HTML");
      return;
    }

    const cnpjFormatado = formatarCNPJ(data.cnpj);

    empresaElement.textContent = `${data.nome} — CNPJ: ${cnpjFormatado}`;

  } catch (err) {

    console.error("Erro inesperado:", err);

  }
}

// ===============================
// CARREGAR CATEGORIAS COM PRODUTOS
// ===============================

async function carregarCategorias() {

  try {

    // busca categorias
    const { data: categorias, error: erroCategorias } = await supabase
      .from("categorias")
      .select("id, titulo, icone")
      .order("titulo");

    if (erroCategorias) {
      console.error("Erro ao buscar categorias:", erroCategorias);
      return;
    }

    const container = document.getElementById("categoriasContainer");

    if (!container) {
      console.error("categoriasContainer não encontrado");
      return;
    }

    container.innerHTML = "";

    // =========================
    // CARD PADRÃO "TODOS"
    // =========================

    const cardTodos = document.createElement("div");
    cardTodos.classList.add("categoria-card", "categoria-ativa");

    cardTodos.innerHTML = `
      <div class="categoria-icone">
        <i class="fa-solid fa-utensils"></i>
      </div>

      <div class="categoria-nome">
        Todos
      </div>
    `;

    container.appendChild(cardTodos);


    // =========================
    // CATEGORIAS DO BANCO
    // =========================

    for (const categoria of categorias) {

      // verifica se existe produto nessa categoria
      const { data: produtos, error: erroProdutos } = await supabase
        .from("produtos")
        .select("id")
        .eq("categoria_id", categoria.id)
        .limit(1);

      if (erroProdutos) {
        console.error("Erro ao verificar produtos:", erroProdutos);
        continue;
      }

      // se não tiver produto não cria card
      if (!produtos || produtos.length === 0) {
        continue;
      }

      const card = document.createElement("div");
      card.classList.add("categoria-card");

      card.innerHTML = `
        <div class="categoria-icone">
          <i class="fa-solid ${categoria.icone}"></i>
        </div>

        <div class="categoria-nome">
          ${categoria.titulo}
        </div>
      `;

      container.appendChild(card);

    }

  } catch (err) {

    console.error("Erro inesperado:", err);

  }

}

// Variáveis do carrossel moderno
const carouselSlidesFade = document.querySelectorAll('.area-carrossel .slide');
const carouselDotsFade = document.querySelectorAll('.area-carrossel .dot');
let carouselIndexFade = 0;

// Inicializa slides: só o primeiro visível
carouselSlidesFade.forEach((slide, i) => {
    slide.style.opacity = i === 0 ? '1' : '0';
    slide.style.transition = 'opacity 1s ease-in-out';
    slide.style.position = 'absolute';
    slide.style.top = '0';
    slide.style.left = '0';
    slide.style.width = '100%';
});

// Função para mostrar slide atual com fade
function showCarouselSlideFade(i) {
    carouselSlidesFade.forEach((slide, idx) => {
        slide.style.opacity = idx === i ? '1' : '0';
    });
    carouselDotsFade.forEach(dot => dot.classList.remove('active'));
    carouselDotsFade[i].classList.add('active');
}

// Clique nas dots para navegação manual
carouselDotsFade.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        carouselIndexFade = i;
        showCarouselSlideFade(carouselIndexFade);
    });
});

// Auto-slide a cada 5 segundos
setInterval(() => {
    carouselIndexFade = (carouselIndexFade + 1) % carouselSlidesFade.length;
    showCarouselSlideFade(carouselIndexFade);
}, 5000);

// =============================
// INICIAR
// =============================
document.addEventListener("DOMContentLoaded", () => {
  carregarImagemFundo();       // separada
  carregarLogoRestaurante();   // separada
  carregarCardapio();          // separada
  carregarNomeEmpresa();
  carregarCategorias();
  carregarEmpresa();

  // atualizar a cada 1 segundo
  setInterval(() => {
    carregarImagemFundo();
    carregarLogoRestaurante();
    carregarCardapio();
  }, 1000);
});


  const modal = document.getElementById("modalBoasVindas");
  const btnFechar = document.getElementById("btnFecharModal");
  const checkbox = document.getElementById("naoMostrar");

  // Verifica se já marcou para não mostrar
  window.onload = () => {
    const naoMostrar = localStorage.getItem("naoMostrarModal");

    if (naoMostrar === "true") {
      modal.style.display = "none";
    }
  };

  // Fechar modal
  btnFechar.addEventListener("click", () => {
    if (checkbox.checked) {
      localStorage.setItem("naoMostrarModal", "true");
    }

    modal.style.display = "none";
  });
