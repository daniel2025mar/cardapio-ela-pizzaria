import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// Desktop: Ctrl + scroll ou Ctrl + +/- 
window.addEventListener('wheel', function(e) {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

window.addEventListener('keydown', function(e) {
  if (e.ctrlKey && ['+', '-', '=', '_'].includes(e.key)) {
    e.preventDefault();
  }
});

// Mobile: pinça (multitouch) e gesto no iOS
window.addEventListener('touchstart', function(e) {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

window.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});

// Evitar zoom via meta viewport (apenas reforço)
const meta = document.querySelector('meta[name=viewport]');
if (meta) {
  meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
} else {
  const m = document.createElement('meta');
  m.name = "viewport";
  m.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  document.head.appendChild(m);
}
// ===================== VARIÁVEL GLOBAL =====================
let pendenciaAtualId = null;
let ultimaPendencia = null;

async function carregarImagensEmpresa() {
  try {
    const { data: empresa, error } = await supabase
      .from("empresa")
      .select("logo_url, fundo_url")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("[IMAGENS EMPRESA] Erro ao carregar imagens:", error.message);
      return;
    }

    // Logo do sistema
    const logoSistema = document.getElementById("logoSistema");
    if (empresa.logo_url && logoSistema) {
      logoSistema.src = empresa.logo_url; // Base64 direto do banco
      console.log("[IMAGENS EMPRESA] Logo carregada do banco");
    }

    // Fundo do topo
    const fundoTopo = document.querySelector(".fundo-topo");
    if (empresa.fundo_url && fundoTopo) {
      fundoTopo.src = empresa.fundo_url; // Base64 direto do banco
      console.log("[IMAGENS EMPRESA] Fundo do topo carregado do banco");
    }

  } catch (err) {
    console.error("[IMAGENS EMPRESA] Exceção:", err);
  }
}

// Chamar a função após carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  carregarImagensEmpresa();
});
  async function carregarNomeEmpresa() {
    // Busca o primeiro registro da tabela 'empresa'
    const { data, error } = await supabase
      .from('empresa')
      .select('nome')
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar empresa:', error);
      return;
    }

    // Atualiza o <h1> com o nome do banco
    const h1 = document.querySelector('.nome-restaurante');
    if (h1 && data?.nome) {
      h1.textContent = data.nome;
    }
  }

  // Chama a função ao carregar a página
  window.addEventListener('DOMContentLoaded', carregarNomeEmpresa);

  
  async function carregarLocalizacao() {
    // Busca o primeiro registro da tabela 'empresa'
    const { data, error } = await supabase
      .from('empresa')
      .select('endereco')
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar endereço:', error);
      return;
    }

    if (data?.endereco) {
      // Pega apenas a parte após o último " - " do endereço
      const partes = data.endereco.split(" - ");
      // A última parte é o estado (UF), a penúltima é a cidade
      const cidadeUF = partes.slice(-2).join(" - ").trim();

      // Atualiza o span
      const span = document.querySelector('.localizacao');
      if (span) {
        span.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${cidadeUF}`;
      }
    }
  }

  window.addEventListener('DOMContentLoaded', carregarLocalizacao);

  
// Função para formatar CNPJ
function formatarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, ""); // remove qualquer não número
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

// Função para carregar empresa
async function carregarEmpresa() {
  try {
    const { data, error } = await supabase
      .from("empresa")
      .select("nome, cnpj")
      .limit(1)
      .single();

    if (error) {
      console.error("Erro ao buscar empresa:", error.message);
      return;
    }

    const pEmpresa = document.getElementById("empresaCNPJ");
    if (pEmpresa) {
      pEmpresa.textContent = `${data.nome} — CNPJ: ${formatarCNPJ(data.cnpj)}`;
    }

  } catch (err) {
    console.error("Erro inesperado:", err);
  }
}

// Executa quando a página carregar
window.addEventListener("DOMContentLoaded", carregarEmpresa);


async function montarCardsCategorias() {
  try {
    // Busca categorias no Supabase
    const { data: categorias, error } = await supabase
      .from("categorias")
      .select("id, titulo, icone") // só titulo e icone (classes FA)
      .order("titulo");

    if (error) {
      console.error("Erro ao buscar categorias:", error);
      return;
    }

    const container = document.getElementById("categoriasContainer");
    container.innerHTML = ""; // limpa antes de montar

    categorias.forEach(cat => {
      const card = document.createElement("div");
      card.className = "categoria-card";
      card.innerHTML = `
        <i class="${cat.icone || 'fas fa-question'}"></i>
        <h3>${cat.titulo}</h3>
      `;
      container.appendChild(card);
    });

    // ===================== FILTRO DE PESQUISA =====================
    const inputSearch = document.getElementById("searchCategoria");
    inputSearch.addEventListener("input", () => {
      const filtro = inputSearch.value.toLowerCase();
      const filtradas = categorias.filter(cat => cat.titulo.toLowerCase().includes(filtro));
      container.innerHTML = "";
      filtradas.forEach(cat => {
        const card = document.createElement("div");
        card.className = "categoria-card";
        card.innerHTML = `
          <i class="${cat.icone || 'fas fa-question'}"></i>
          <h3>${cat.titulo}</h3>
        `;
        container.appendChild(card);
      });
    });

  } catch (err) {
    console.error("Erro inesperado ao montar categorias:", err);
  }
}

// Chama ao carregar a página
document.addEventListener("DOMContentLoaded", montarCardsCategorias);
// ===================== Função para criar os cards =====================


async function montarCardsSupabase() {
  try {
    // Busca os produtos da tabela "produtos"
    const { data: produtos, error } = await supabase
      .from("produtos")
      .select("id, nome, descricao, preco, promocao, foto_url, categoria_id")
      .order("nome"); // opcional: ordena por nome

    if (error) {
      console.error("Erro ao buscar produtos:", error);
      return;
    }

    const container = document.getElementById('produtosContainerPizza');
    container.innerHTML = ""; // Limpa antes de montar

    produtos.forEach(produto => {
      const card = document.createElement('div');
      card.className = "cardapio-item";

      // Usando promocao caso exista
      const precoDisplay = produto.promocao ? produto.promocao.toFixed(2) : produto.preco.toFixed(2);

      card.innerHTML = `
        <img src="${produto.foto_url || './Imagem/default.jpg'}" alt="${produto.nome}" class="produto-img">
        <span class="codigo-produto">ID: ${produto.id.slice(0, 8)}</span>
        <h2>${produto.nome}</h2>
        <p>${produto.descricao || ''}</p>
        <div class="produto-footer">
          <span class="preco">R$ ${precoDisplay.replace('.', ',')}</span>
          <button class="btn-comprar">
            <i class="fas fa-shopping-cart"></i> Comprar
          </button>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Erro inesperado ao montar produtos:", err);
  }
}

// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", montarCardsSupabase);

// =====================
// MODAL INFORMAÇÕES DA EMPRESA
// =====================

// Seleciona elementos do modal
const btnMaisInfo = document.getElementById("maisInfo");
const modalEmpresa = document.getElementById("modalInfoEmpresa");
const fecharModalEmpresa = document.querySelector(".fechar-empresa-cardapio");

// Função para carregar informações da empresa do Supabase
async function carregarInfoEmpresa() {

  try {
    // Busca a primeira empresa cadastrada
    const { data, error } = await supabase
      .from("empresa")
      .select("nome, endereco, telefone")
      .limit(1)
      .single();

    if (error) {
      console.error("Erro ao buscar empresa:", error);
      return;
    }

    if (!data) {
      console.warn("Nenhum registro de empresa encontrado.");
      return;
    }

    // Atualiza o conteúdo do modal
    modalEmpresa.querySelector("p:nth-of-type(1)").innerHTML =
      `<strong>Nome:</strong> ${data.nome}`;

    modalEmpresa.querySelector("p:nth-of-type(2)").innerHTML =
      `<strong>Endereço:</strong> ${data.endereco}`;

    modalEmpresa.querySelector("p:nth-of-type(3)").innerHTML =
      `<strong>Telefone:</strong> ${data.telefone}`;

  } catch (err) {
    console.error("Erro inesperado ao carregar empresa:", err);
  }

}

// Abrir modal ao clicar em maisInfo
btnMaisInfo.addEventListener("click", async () => {
  await carregarInfoEmpresa(); // carrega info antes de abrir
  modalEmpresa.style.display = "block";
});

// Fechar ao clicar no X
fecharModalEmpresa.addEventListener("click", () => {
  modalEmpresa.style.display = "none";
});

// Fechar ao clicar fora do modal
window.addEventListener("click", (event) => {
  if (event.target === modalEmpresa) {
    modalEmpresa.style.display = "none";
  }
});

// ===================== Abrir e fechar modal do carrinho =====================
const btnCarrinho = document.getElementById("card-btn");
const modalCarrinho = document.getElementById("modalCarrinho");
const btnFecharModal = document.getElementById("fecharModalCarrinho");

// Abre o modal ao clicar no botão do carrinho
btnCarrinho.addEventListener("click", () => {
  modalCarrinho.style.display = "flex";
});

// Fecha o modal ao clicar no X
btnFecharModal.addEventListener("click", () => {
  modalCarrinho.style.display = "none";
});

// Fecha o modal ao clicar fora do conteúdo do carrinho
window.addEventListener("click", (event) => {
  if (event.target === modalCarrinho) {
    modalCarrinho.style.display = "none";
  }
});