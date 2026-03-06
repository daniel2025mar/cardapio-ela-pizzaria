


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