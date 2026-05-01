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
// CARRINHO GLOBAL
// =============================
let carrinho = [];


// =============================
// MOSTRAR MENSAGEM (COM CALLBACK)
// =============================
function mostrarMensagem(texto, callback) {
  const modal = document.getElementById("modalMensagem");
  const textoEl = document.getElementById("textoMensagem");

  textoEl.innerText = texto;
  modal.style.display = "flex";

  setTimeout(() => {
    modal.style.display = "none";

    if (callback) callback();

  }, 2000);
}


// =============================
// ADICIONAR AO CARRINHO
// =============================
function adicionarCarrinho() {

  const nomeProduto = document.getElementById("nomePizza").innerText;
  const linhas = document.querySelectorAll(".linha-tamanho");

  let itensAdicionados = [];

  linhas.forEach(linha => {

    const input = linha.querySelector("input");

    if (input.checked) {

      const tamanho = linha.querySelector(".nome-tamanho").innerText;
      const precoTexto = linha.querySelector(".preco-tamanho").innerText;
      const qtd = parseInt(linha.querySelector(".qtd").innerText);

      const preco = parseFloat(
        precoTexto.replace("R$", "").replace(",", ".").trim()
      );

      itensAdicionados.push({
        nome: nomeProduto,
        tamanho,
        preco,
        quantidade: qtd
      });

    }

  });

  if (itensAdicionados.length === 0) {
    mostrarMensagem("Selecione pelo menos um item.");
    return;
  }

  carrinho.push(...itensAdicionados);

  atualizarCarrinho();

  mostrarMensagem("Enviado para o carrinho 🛒", () => {
    fecharModal();
  });

}


// =============================
// ATUALIZAR CARRINHO
// =============================
function atualizarCarrinho() {

  const lista = document.getElementById("listaCarrinho");
  const subtotalEl = document.getElementById("subtotalCarrinho");
  const totalEl = document.getElementById("totalCarrinho");

  lista.innerHTML = "";

  let subtotal = 0;

  carrinho.forEach((item) => {

    const totalItem = item.preco * item.quantidade;
    subtotal += totalItem;

    const div = document.createElement("div");
    div.classList.add("item-carrinho");

    div.innerHTML = `
      <div class="item-linha">

        <div class="info-item">
          <strong>${item.nome}</strong>
          <span>${item.tamanho}</span>
          <span>Qtd: ${item.quantidade}</span>
        </div>

        <div class="preco-item">
          R$ ${totalItem.toFixed(2).replace(".", ",")}
        </div>

      </div>
    `;

    lista.appendChild(div);

  });

  // 🔥 Atualiza valores
  subtotalEl.innerText = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
  totalEl.innerText = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
}


// 🔥 CORREÇÃO FINAL (ESSENCIAL)
window.adicionarCarrinho = adicionarCarrinho;



// ===============================
// ABRIR / FECHAR MODAL
// ===============================

window.abrirMontePizza = async function () {
  const modal = document.getElementById("modalMontePizza");
  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  // 🔒 desativa bordas no início
  document.querySelectorAll('input[name="borda"]').forEach(b => {
    b.disabled = true;
    b.checked = false;
  });

  await carregarSabores();
};

window.fecharMontePizza = function () {
  document.getElementById("modalMontePizza").style.display = "none";
  document.body.style.overflow = "auto";
};

// ===============================
// CARREGAR SABORES DO BANCO
// ===============================

window.trocarTamanho = function () {
  console.log("trocou tamanho");

  document.querySelectorAll('.lista-sabores input').forEach(input => {
    input.checked = false;
  });

  carregarSabores();
  atualizarResumo();
};

async function carregarSabores() {
  const container = document.querySelector(".lista-sabores");
  container.innerHTML = "<p>Carregando sabores...</p>";

  // 🔥 pegar tamanho selecionado
  const tamanhoSelecionado = document.querySelector('input[name="tamanho"]:checked')?.value;

  console.log("Tamanho selecionado:", tamanhoSelecionado);

  if (!tamanhoSelecionado) {
    container.innerHTML = `
  <p class="alerta-tamanho">
    ⚠️ Escolha o tamanho primeiro 👆
  </p>
`;
    return;
  }

  // 🔥 buscar categoria pizza
  const { data: categorias } = await supabase
    .from("categorias")
    .select("id")
    .ilike("titulo", "%pizza%")
    .limit(1);

  if (!categorias || categorias.length === 0) {
    container.innerHTML = "<p>Categoria de pizza não encontrada</p>";
    return;
  }

  const categoriaPizzaId = categorias[0].id;

  // 🔥 buscar produtos (AGORA COM PREÇO)
  const { data: produtos, error } = await supabase
    .from("produtos")
    .select("id, nome, preco")
    .eq("categoria_id", categoriaPizzaId);

  if (error) {
    container.innerHTML = "<p>Erro ao carregar produtos</p>";
    console.error(error);
    return;
  }

  // 🔥 buscar variações (preços por tamanho)
  const { data: variacoes, error: errorVar } = await supabase
    .from("produto_variacoes")
    .select("*")
    .ilike("tamanho", tamanhoSelecionado); // 🔥 mais seguro que .eq

  console.log("Variações do banco:", variacoes);

  if (errorVar) {
    container.innerHTML = "<p>Erro ao carregar preços</p>";
    console.error(errorVar);
    return;
  }

  container.innerHTML = "";

  produtos.forEach((produto) => {

    let preco = 0;

    if (tamanhoSelecionado.toLowerCase() === "pequena") {

      // 🔥 preço vem da tabela produto_variacoes
      const variacao = variacoes.find(v => 
        String(v.produto_id) === String(produto.id)
      );

      if (!variacao) return;

      preco = parseFloat(variacao.preco);

    } else {

      // 🔥 preço vem direto da tabela produtos (GRANDE)
      preco = parseFloat(produto.preco);

      if (!preco) return;
    }

    const precoMetade = preco / 2;

    const item = document.createElement("label");

    item.innerHTML = `
      <input 
        type="checkbox" 
        value="${produto.nome}" 
        data-preco="${preco}" 
        onchange="atualizarResumo()"
      >
      ${produto.nome} - <span class="preco">R$ ${precoMetade.toFixed(2)}</span>
    `;

    container.appendChild(item);
  });
}
// ===============================
// FECHAR AO CLICAR FORA
// ===============================

window.addEventListener("click", function (event) {
  const modal = document.getElementById("modalMontePizza");
  if (event.target === modal) fecharMontePizza();
});

function mostrarAlerta(msg) {
  const modal = document.getElementById("modalAlerta");
  const texto = document.getElementById("mensagemAlerta");

  texto.textContent = msg; // 🔥 atualiza o texto
  modal.style.display = "flex"; // abre modal corretamente
}

window.fecharAlerta = function () {
  const modal = document.getElementById("modalAlerta");
  modal.style.display = "none";
};
// ===============================
// ATUALIZAR RESUMO (MEIO A MEIO)
// ===============================

window.atualizarResumo = function () {
  const tamanho = document.querySelector('input[name="tamanho"]:checked');
  const borda = document.querySelector('input[name="borda"]:checked');
  const saboresSelecionados = document.querySelectorAll('.lista-sabores input:checked');

  let listaSabores = [];
  let precos = [];

  saboresSelecionados.forEach((s) => {
    listaSabores.push(s.value);
    precos.push(parseFloat(s.dataset.preco));
  });

  // ===============================
  // 🔒 CONTROLE + ANIMAÇÃO DA BORDA
  // ===============================
  const inputsBorda = document.querySelectorAll('input[name="borda"]');
  const bordaContainer = document.querySelector('.borda-container');

  if (listaSabores.length === 0) {
    // 🔒 BLOQUEIA
    inputsBorda.forEach(b => {
      b.disabled = true;
      b.checked = false;
    });

    if (bordaContainer) {
      bordaContainer.classList.add("borda-desativada");
    }

  } else {
    // 🔓 LIBERA
    const estavaDesativado = inputsBorda[0].disabled;

    inputsBorda.forEach(b => {
      b.disabled = false;
    });

    if (bordaContainer) {
      bordaContainer.classList.remove("borda-desativada");

      // 🔥 animação só quando muda de bloqueado → liberado
      if (estavaDesativado) {
        bordaContainer.classList.add("borda-ativa");

        setTimeout(() => {
          bordaContainer.classList.remove("borda-ativa");
        }, 600);
      }
    }
  }

  // ===============================
  // 🔥 limitar 2 sabores
  // ===============================
  if (listaSabores.length > 2) {
    mostrarAlerta("Seleção limitada a até 2 sabores para a opção meio a meio.");
    saboresSelecionados[saboresSelecionados.length - 1].checked = false;
    return atualizarResumo();
  }

  // 🔥 Atualizar tamanho
  document.getElementById("resumoTamanho").textContent =
    tamanho ? tamanho.value : "-";

  // 🔥 Atualizar borda
  document.getElementById("resumoBorda").textContent =
    borda ? borda.value : "-";

  // 🔥 Atualizar sabores
  let texto = "-";

  if (listaSabores.length === 1) {
    texto = listaSabores[0];
  } else if (listaSabores.length === 2) {
    texto = `Meio a meio: ${listaSabores[0]} + ${listaSabores[1]}`;
  }

  document.getElementById("resumoSabores").textContent = texto;

  // ===============================
  // 🔥 PREÇO BASE (SABORES)
  // ===============================
  let precoPreview = 0;

  if (precos.length === 1) {
    precoPreview = precos[0] / 2;
  } else if (precos.length === 2) {
    precoPreview = (precos[0] / 2) + (precos[1] / 2);
  }

  // ===============================
  // 🔥 PREÇO DA BORDA
  // ===============================
  let precoBorda = 0;

  if (borda) {
    precoBorda = parseFloat(borda.dataset.preco) || 0;
  }

  precoPreview += precoBorda;

  const valorFormatado = "R$ " + precoPreview.toFixed(2);

  document.getElementById("previewPreco").textContent = valorFormatado;

  const elResumo = document.getElementById("resumoPreco");
  if (elResumo) {
    elResumo.textContent = valorFormatado;
  }
};

// ===============================
// FINALIZAR PIZZA
// ===============================

window.finalizarPizza = function () {
  const tamanho = document.querySelector('input[name="tamanho"]:checked');
  const borda = document.querySelector('input[name="borda"]:checked');
  const sabores = document.querySelectorAll('.lista-sabores input:checked');

  if (!tamanho || sabores.length === 0) {
    alert("Selecione tamanho e sabor!");
    return;
  }

  let listaSabores = [];
  let precos = [];

  sabores.forEach((s) => {
    listaSabores.push(s.value);
    precos.push(parseFloat(s.dataset.preco)); // preço cheio
  });

  // ===============================
  // 🔥 REGRA (SOMA DAS METADES)
  // ===============================
  let precoFinal = 0;

  if (precos.length === 1) {
    precoFinal = precos[0]; // pizza inteira
  } else if (precos.length === 2) {
    precoFinal = (precos[0] / 2) + (precos[1] / 2); // soma das metades
  }

  // 🔥 descrição
  let descricao =
    listaSabores.length === 2
      ? `Meio a meio: ${listaSabores[0]} + ${listaSabores[1]}`
      : listaSabores[0];

  const pizza = {
    nome: "Pizza Personalizada",
    tamanho: tamanho.value,
    borda: borda ? borda.value : "Sem borda",
    sabores: listaSabores,
    preco: precoFinal,
    descricao: descricao
  };

  console.log("Pizza:", pizza);

  alert(`Pizza adicionada 🍕\nTotal: R$ ${precoFinal.toFixed(2)}`);

  fecharMontePizza();
};
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

// 🔥 ABRIR MODAL AO CLICAR NO CARD
card.addEventListener("click", () => {
  abrirModalProduto(produto.id);
});

async function abrirModalProduto(produtoId) {

  const { data, error } = await supabase
    .from('produtos')
    .select(`
      id,
      nome,
      descricao,
      foto_url,
      preco,
      tamanho,
      produto_variacoes (
        id,
        tamanho,
        preco
      )
    `)
    .eq('id', produtoId)
    .single();

  if (error) {
    console.error("Erro:", error);
    return;
  }

  // 🔥 Nome do produto
  document.getElementById("nomePizza").innerText = data.nome;

  const container = document.getElementById("containerTamanhos");
  container.innerHTML = "";

  // 🔥 Função para criar cada linha (SEM onclick nos botões)
  function criarOpcao(id, nome, preco, checked = false) {
  return `
    <div class="linha-tamanho ${checked ? 'selecionado' : ''}">
      
      <input type="checkbox" value="${id}" ${checked ? "checked" : ""}>

      <span class="nome-tamanho">${nome}</span>

      <span class="preco-tamanho">
        R$ ${Number(preco || 0).toFixed(2).replace(".", ",")}
      </span>

      <div class="controle-qtd">
        <button type="button" class="btn-menos">−</button>
        <span class="qtd">1</span>
        <button type="button" class="btn-mais">+</button>
      </div>

    </div>
  `;
}

 // 🔥 Produto principal (AGORA DESMARCADO)
container.innerHTML += criarOpcao(
  "principal",
  data.tamanho || "Grande",
  data.preco,
  false
);

  // 🔥 Variações
  if (data.produto_variacoes && data.produto_variacoes.length > 0) {
    data.produto_variacoes.forEach(v => {
      container.innerHTML += criarOpcao(
        v.id,
        v.tamanho,
        v.preco
      );
    });
  }

  // 🔥 ATIVAR EVENTOS (ESSENCIAL)
  ativarEventosModal();

  abrirModal();
}

function ativarEventosModal() {

  // ✅ CONTROLE DE SELEÇÃO
  document.querySelectorAll(".linha-tamanho").forEach(linha => {

    const input = linha.querySelector("input");

    // 🔹 Clique na linha (exceto botão/checkbox)
    linha.addEventListener("click", function (e) {

      if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;

      input.checked = !input.checked;
      atualizarVisual(linha, input);
    });

    // 🔹 Clique direto no checkbox
    input.addEventListener("change", function () {
      atualizarVisual(linha, input);
    });

  });

  // 🔹 Atualiza visual
  function atualizarVisual(linha, input) {
    if (input.checked) {
      linha.classList.add("selecionado");
    } else {
      linha.classList.remove("selecionado");
    }
  }

  // 🔥 BOTÃO +
  document.querySelectorAll(".btn-mais").forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();

      const linha = this.closest(".linha-tamanho");
      const input = linha.querySelector("input");
      const qtdEl = linha.querySelector(".qtd");

      // 🚫 BLOQUEIA SE NÃO ESTIVER SELECIONADO
      if (!input.checked) {
        mostrarMensagem("Selecione o item antes de alterar a quantidade.");
        return;
      }

      // 🔥 SOMA TOTAL DE TODOS OS ITENS SELECIONADOS
      let total = 0;

      document.querySelectorAll(".linha-tamanho").forEach(l => {
        const inp = l.querySelector("input");
        const qtdLinha = parseInt(l.querySelector(".qtd").innerText);

        if (inp.checked) {
          total += qtdLinha;
        }
      });

      // 🚫 LIMITE GLOBAL (10 NO TOTAL)
      if (total >= 10) {
        mostrarMensagem("Você atingiu o limite máximo de 10 unidades para este item.");
        return;
      }

      // ✅ AUMENTA NORMAL
      let qtd = parseInt(qtdEl.innerText);
      qtdEl.innerText = qtd + 1;
    });
  });

  // 🔥 BOTÃO -
  document.querySelectorAll(".btn-menos").forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();

      const linha = this.closest(".linha-tamanho");
      const input = linha.querySelector("input");
      const qtdEl = linha.querySelector(".qtd");

      // 🚫 BLOQUEIA SE NÃO ESTIVER SELECIONADO
      if (!input.checked) {
        mostrarMensagem("Selecione o item antes de alterar a quantidade.");
        return;
      }

      let qtd = parseInt(qtdEl.innerText);

      if (qtd > 1) {
        qtdEl.innerText = qtd - 1;
      }
    });
  });

}

function mostrarMensagem(texto) {
  const modal = document.getElementById("modalMensagem");
  const textoEl = document.getElementById("textoMensagem");

  textoEl.innerText = texto;
  modal.style.display = "flex";

  // fecha automático depois de 2 segundos
  setTimeout(() => {
    modal.style.display = "none";
  }, 2000);
}

// =========================
// SELECIONAR TAMANHO
// =========================
function selecionarLinha(el) {
  document.querySelectorAll(".linha-tamanho").forEach(l => {
    l.classList.remove("selecionado");
    l.querySelector("input").checked = false;
  });

  el.classList.add("selecionado");
  el.querySelector("input").checked = true;
}

// =========================
// AUMENTAR QUANTIDADE
// =========================
function aumentarQtd(btn) {
  const linha = btn.closest(".linha-tamanho");
  const qtdEl = linha.querySelector(".qtd");

  let qtd = parseInt(qtdEl.innerText);
  qtdEl.innerText = qtd + 1;
}

// =========================
// DIMINUIR QUANTIDADE
// =========================
function diminuirQtd(btn) {
  const linha = btn.closest(".linha-tamanho");
  const qtdEl = linha.querySelector(".qtd");

  let qtd = parseInt(qtdEl.innerText);

  if (qtd > 1) {
    qtdEl.innerText = qtd - 1;
  }
}

function aumentarQtd(btn) {
  // pega o elemento da quantidade da mesma linha
  const qtdEl = btn.parentElement.querySelector(".qtd");

  let qtd = parseInt(qtdEl.innerText);
  qtd++;

  qtdEl.innerText = qtd;
}

function diminuirQtd(btn) {
  const qtdEl = btn.parentElement.querySelector(".qtd");

  let qtd = parseInt(qtdEl.innerText);

  if (qtd > 1) {
    qtd--;
    qtdEl.innerText = qtd;
  }
}



// ❌ EVITA QUE O BOTÃO ATIVE O MODAL
card.querySelector(".btn-adicionar").addEventListener("click", (e) => {
  e.stopPropagation();
});


categoriaDiv.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro geral:", erro);
  } finally {
    if (loading) loading.style.display = "none";
  }
}

// ABRIR MODAL
function abrirModal() {
  const modal = document.getElementById("modalPizza");
  modal.style.display = "block";

  // 🔒 trava scroll do fundo
  document.body.style.overflow = "hidden";
}

// FECHAR MODAL
function fecharModal() {
  const modal = document.getElementById("modalPizza");
  modal.style.display = "none";

  // 🔓 libera scroll
  document.body.style.overflow = "auto";
}

// FECHAR CLICANDO FORA
window.addEventListener("click", function (event) {
  const modal = document.getElementById("modalPizza");

  if (event.target === modal) {
    fecharModal();
  }
});

// FECHAR COM ESC
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    fecharModal();
  }
});

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
// =========================
// ELEMENTOS
// =========================
const botaoPesquisa = document.querySelector(".btn-pesquisa");
const campoPesquisa = document.getElementById("campoPesquisa");
const listaSugestoes = document.getElementById("listaSugestoes");

// =========================
// ABRIR CAMPO
// =========================
function abrirPesquisa(){
  campoPesquisa.style.width = "200px";
  campoPesquisa.style.opacity = "1";
  campoPesquisa.focus();
}

botaoPesquisa.addEventListener("mouseenter", abrirPesquisa);
botaoPesquisa.addEventListener("click", abrirPesquisa);

// =========================
// BUSCA EM TEMPO REAL
// =========================
campoPesquisa.addEventListener("input", async () => {
  const termo = campoPesquisa.value.trim();

  if (termo === "") {
    listaSugestoes.innerHTML = "";
    listaSugestoes.style.display = "none";
    return;
  }

  const { data, error } = await supabase
    .from("produtos")
    .select("nome, foto_url")
    .ilike("nome", `%${termo}%`)
    .limit(10);

  if (error) {
    console.error("Erro ao buscar:", error);
    return;
  }

  listaSugestoes.innerHTML = "";

  if (!data || data.length === 0) {
    listaSugestoes.style.display = "none";
    return;
  }

  listaSugestoes.style.display = "block";

  data.forEach(produto => {
    const li = document.createElement("li");
    li.classList.add("card-sugestao");

    li.innerHTML = `
      <div class="card-conteudo">
        
        <img 
          src="${produto.foto_url || 'https://via.placeholder.com/60'}" 
          class="card-img"
        >

        <div class="card-info">
          <span class="card-nome">${produto.nome}</span>
        </div>

        <div class="card-arrow">➜</div>

      </div>
    `;

    li.addEventListener("click", () => {
      campoPesquisa.value = produto.nome;
      listaSugestoes.innerHTML = "";
      listaSugestoes.style.display = "none";
    });

    listaSugestoes.appendChild(li);
  });
});

// =========================
// FECHAR AO CLICAR FORA
// =========================
document.addEventListener("click", (e) => {
  if (!document.querySelector(".container-pesquisa").contains(e.target)) {
    listaSugestoes.style.display = "none";
  }
});

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

// ===============================
// MODAL BOAS-VINDAS (CORRIGIDO)
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("modalBoasVindas");
  const btnFechar = document.getElementById("btnFecharModal");
  const checkbox = document.getElementById("naoMostrar");

  // 🔹 Verifica se usuário marcou "não mostrar novamente"
  const naoMostrar = localStorage.getItem("naoMostrarModal");

  if (naoMostrar === "true") {
    modal.style.display = "none";
    return; // não executa mais nada
  }

  // 🔹 Garante que o modal fique aberto
  modal.style.display = "flex";

  // 🔹 Travar scroll enquanto modal estiver aberto
  document.body.style.overflow = "hidden";

  // 🔹 Fechar SOMENTE ao clicar no botão
  btnFechar.addEventListener("click", () => {

    // Se marcou checkbox, salva no localStorage
    if (checkbox.checked) {
      localStorage.setItem("naoMostrarModal", "true");
    }

    // Fecha modal
    modal.style.display = "none";

    // Libera scroll
    document.body.style.overflow = "auto";
  });

});

// ===============================
// 🔥 CONFIGURAÇÃO DE VERSÃO
// ===============================
const VERSAO_ATUAL = "1.0.0";

// ===============================
// 🔥 ABRIR MODAL
// ===============================
window.abrirModalAtualizacoes = function () {
  const modal = document.getElementById("modalAtualizacoes");
  const barra = document.querySelector(".barra-atualizacoes");

  if (!modal) return;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // 🔥 MARCA COMO VISTO
  localStorage.setItem("versaoAtualizacoes", VERSAO_ATUAL);

  // 🔥 ESCONDE A BARRA
  if (barra) {
    barra.style.display = "none";
  }
};

// ===============================
// 🔥 FECHAR MODAL
// ===============================
window.fecharModalAtualizacoes = function () {
  const modal = document.getElementById("modalAtualizacoes");

  if (!modal) return;

  modal.style.display = "none";
  document.body.style.overflow = "auto";
};

// ===============================
// 🔥 INICIALIZAÇÃO
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const barra = document.querySelector(".barra-atualizacoes");
  const versaoSalva = localStorage.getItem("versaoAtualizacoes");

  // 🔥 SE FOR NOVA ATUALIZAÇÃO
  if (versaoSalva !== VERSAO_ATUAL) {

    // 👉 MOSTRA A BARRA
    if (barra) {
      barra.style.display = "block";
    }

  } else {

    // 👉 ESCONDE
    if (barra) {
      barra.style.display = "none";
    }
  }
});