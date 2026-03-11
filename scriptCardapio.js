import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


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
// ===================== Lista de produtos exemplo =====================
const produtos = [
  {
    codigo: "001",
    nome: "Pizza Margherita",
    descricao: "Deliciosa pizza com molho de tomate, mussarela e manjericão fresco.",
    preco: "39,90",
    foto: "./Imagem/pizza-margherita.jpg"
  },
  {
    codigo: "002",
    nome: "Hambúrguer Gourmet",
    descricao: "Carne premium, queijo cheddar, alface, tomate e maionese artesanal.",
    preco: "24,90",
    foto: "./Imagem/hamburguer.jpg"
  },
  {
    codigo: "003",
    nome: "Suco Natural",
    descricao: "Suco de laranja fresco, 100% natural, sem adição de açúcar.",
    preco: "8,90",
    foto: "./Imagem/suco.jpg"
  },
  {
    codigo: "004",
    nome: "Pizza Calabresa",
    descricao: "Pizza com calabresa, cebola e queijo mussarela.",
    preco: "42,90",
    foto: "./Imagem/pizza-calabresa.jpg"
  },
  {
    codigo: "005",
    nome: "Batata Frita",
    descricao: "Porção crocante com molho especial.",
    preco: "18,90",
    foto: "./Imagem/batata.jpg"
  },
  {
    codigo: "006",
    nome: "Refrigerante Lata",
    descricao: "Bebida gelada 350ml.",
    preco: "6,90",
    foto: "./Imagem/refrigerante.jpg"
  }
];

// ===================== Função para criar os cards =====================
function montarCards() {
  const container = document.getElementById('produtosContainerPizza');
  container.innerHTML = ""; // Limpa antes de montar

  produtos.forEach(produto => {
    const card = document.createElement('div');
    card.className = "cardapio-item";

    card.innerHTML = `
      <img src="${produto.foto}" alt="${produto.nome}" class="produto-img">
      <span class="codigo-produto">Cód: ${produto.codigo}</span>
      <h2>${produto.nome}</h2>
      <p>${produto.descricao}</p>
      <div class="produto-footer">
        <span class="preco">R$ ${produto.preco}</span>
        <button class="btn-comprar">
          <i class="fas fa-shopping-cart"></i> Comprar
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ===================== Chamar a função =====================
montarCards();

// Seleciona elementos
const btnMaisInfo = document.getElementById("maisInfo");
const modalEmpresa = document.getElementById("modalInfoEmpresa");
const fecharModalEmpresa = document.querySelector(".fechar-empresa-cardapio");

// Abrir modal ao clicar em maisInfo
btnMaisInfo.addEventListener("click", () => {
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