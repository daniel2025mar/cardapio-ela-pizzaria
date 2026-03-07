import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =================== SUPABASE ===================
const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
/* ================= SPLASH SCREEN JS ================= */

const progressCircle = document.querySelector(".circle-progress");
const progressText = document.getElementById("progressText");
const splash = document.getElementById("splashScreen");
const splashMessage = document.querySelector(".splash-text");

let progress = 0;
const circumference = 283; // 2πr, r=45
let interval;
let carregando = true;
let internetTimeout;

// -----------------------------
// Função para checar internet real
// -----------------------------
async function checarInternet() {
  try {
    const response = await fetch("https://api.ipify.org?format=json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Sem internet real");
    return true;
  } catch {
    return false;
  }
}

// -----------------------------
// Atualiza a barra
// -----------------------------
async function atualizarBarra() {
  if (!carregando || progress >= 100) return;

  const conectado = await checarInternet();

  if (!conectado) {
    // Se sem internet, inicia timer de 2 segundos para mensagem
    if (!internetTimeout) {
      internetTimeout = setTimeout(() => {
        splashMessage.textContent = "Sem conexão com a internet. Verifique e tente novamente.";
        clearInterval(interval);
        carregando = false;
      }, 2000);
    }
    return; // não incrementa
  } else {
    // Se voltou a conexão, limpa timer
    if (internetTimeout) {
      clearTimeout(internetTimeout);
      internetTimeout = null;
      if (carregando && progress < 100) {
        splashMessage.textContent = "Aguarde, estamos carregando informações do banco de dados";
      }
    }
  }

  // Incrementa barra 1% a cada 50ms (~5s total)
  progress = Math.min(progress + 1, 100);
  progressText.textContent = progress + "%";

  const offset = circumference - (circumference * progress / 100);
  progressCircle.style.strokeDashoffset = offset;

  // Efeito leve de cor nos pontos de travamento
  if (progress === 20 || progress === 45 || progress === 70) {
    progressCircle.style.stroke = "#00aaff";
    setTimeout(() => (progressCircle.style.stroke = "#03305c"), 100);
  }

  // Finaliza splash
  if (progress >= 100) {
    clearInterval(interval);
    setTimeout(() => {
      splash.style.opacity = "0";
      splash.style.transition = "opacity 0.5s";
      setTimeout(() => (splash.style.display = "none"), 500);
    }, 500);
  }
}

// -----------------------------
// Inicia o carregamento
// -----------------------------
interval = setInterval(atualizarBarra, 50);

// -----------------------------
// Detecta mudança de conexão
// -----------------------------
window.addEventListener("online", () => {
  if (!carregando && progress < 100) {
    carregando = true;
    splashMessage.textContent = "Aguarde, estamos carregando informações do banco de dados";
    interval = setInterval(atualizarBarra, 50);
  }
});

window.addEventListener("offline", () => {
  if (!internetTimeout && progress < 100) {
    internetTimeout = setTimeout(() => {
      splashMessage.textContent = "Sem conexão com a internet. Verifique e tente novamente.";
      clearInterval(interval);
      carregando = false;
    }, 2000);
  }
});

const btnMenu = document.getElementById("btnMenu");
const sidebar = document.getElementById("sidebar");
const menuItens = document.querySelectorAll("#sidebar a"); // todos os links do menu

// Função para configurar sidebar de acordo com a largura da tela
function configurarSidebar() {
  if (window.innerWidth >= 768) {
    sidebar.classList.add("active");
    removerEventosMobile(); // remove eventos de clique fora/click menu
  } else {
    sidebar.classList.remove("active");
    adicionarEventosMobile(); // adiciona eventos para mobile
  }
}

// Abre/fecha sidebar ao clicar no botão
btnMenu.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Eventos para mobile
function adicionarEventosMobile() {
  // Fecha ao clicar fora do sidebar
  document.addEventListener("click", cliqueForaSidebar);

  // Fecha ao clicar em um item do menu
  menuItens.forEach(item => {
    item.addEventListener("click", fecharSidebarMobile);
  });
}

function removerEventosMobile() {
  document.removeEventListener("click", cliqueForaSidebar);
  menuItens.forEach(item => {
    item.removeEventListener("click", fecharSidebarMobile);
  });
}

// Fecha sidebar se clicar fora (apenas mobile)
function cliqueForaSidebar(e) {
  if (!sidebar.contains(e.target) && !btnMenu.contains(e.target)) {
    sidebar.classList.remove("active");
  }
}

// Fecha sidebar ao clicar em item do menu (apenas mobile)
function fecharSidebarMobile() {
  sidebar.classList.remove("active");
}

// Configura inicialmente
configurarSidebar();

// Atualiza ao redimensionar
window.addEventListener("resize", configurarSidebar);


const menuClientes = document.getElementById("menuClientes");
const itemMenuClientes = menuClientes.parentElement;


// Função para fechar todos os submenus
function fecharTodosSubmenus() {
  document.querySelectorAll(".menu-com-submenu").forEach(item => {
    item.classList.remove("ativo");
  });
}

// Clique no menu Clientes (abre/fecha submenu)
menuClientes.addEventListener("click", function(e) {
  e.preventDefault();

  // Fecha todos os outros submenus antes
  fecharTodosSubmenus();

  // Alterna o submenu de Clientes
  itemMenuClientes.classList.toggle("ativo");
});

// Seleciona todos os links “normais” do menu (não submenu)
const linksNormais = sidebar.querySelectorAll("li > a:not(.menu-com-submenu > a)");

linksNormais.forEach(link => {
  link.addEventListener("click", function() {
    fecharTodosSubmenus();
  });
});

// Fecha todos os submenus se clicar fora do sidebar
document.addEventListener("click", function(e) {
  if (!sidebar.contains(e.target)) {
    fecharTodosSubmenus();
  }
});
// =================== MODAL DESENVOLVEDOR ===================
const modalDesenvolvedor = document.getElementById("modalDesenvolvedor");
const closeBtn = modalDesenvolvedor?.querySelector(".close");
const imgDashboard = document.getElementById("imgDashboard");

if (imgDashboard) {
  imgDashboard.addEventListener("click", () => {
    modalDesenvolvedor.style.display = "flex";
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    modalDesenvolvedor.style.display = "none";
  });
}

window.addEventListener("click", (e) => {
  if (e.target === modalDesenvolvedor) modalDesenvolvedor.style.display = "none";
});

// =================== funçao abrir menus =====
// PEGAR MENUS
const menuDashboard = document.getElementById("menuDashboard");
const menuAdicionar = document.getElementById("menuAdicionar");

// PEGAR SEÇÕES
const dashboard = document.getElementById("dashboard");
const cadastroProdutos = document.getElementById("cadastroProdutos");

// TODAS AS SEÇÕES
const secoes = document.querySelectorAll(".secao");

function abrirSecao(secaoAtiva) {

  // esconder todas
  secoes.forEach(secao => {
    secao.style.display = "none";
  });

  // mostrar a selecionada
  secaoAtiva.style.display = "block";
}


// CLICK DASHBOARD
menuDashboard.addEventListener("click", () => {
  abrirSecao(dashboard);
});


// CLICK ADICIONAR PRODUTO
menuAdicionar.addEventListener("click", () => {
  abrirSecao(cadastroProdutos);
});
// =================== MODAL LOGOUT ===================
const modalLogout = document.getElementById("modalLogout");
const logoutBtn = document.getElementById("logoutBtn");
const btnSimLogout = document.getElementById("btnSimLogout");
const btnNaoLogout = document.getElementById("btnNaoLogout");

logoutBtn?.addEventListener("click", () => {
  modalLogout.style.display = "flex";
});

btnSimLogout?.addEventListener("click", () => {
  modalLogout.style.display = "none";
  window.location.href = "./Sistema/Login.html";
});

btnNaoLogout?.addEventListener("click", () => {
  modalLogout.style.display = "none";
});

// =================== MODAL EMPRESA ===================
document.addEventListener("DOMContentLoaded", async () => {
  const modalEmpresaNovo = document.getElementById("modalEmpresaNovo");
  const btnFecharNovo = document.getElementById("fecharModalNovo");
  const btnSalvarNovo = document.getElementById("btnSalvarEmpresaNovo");
  const empresaNome = document.querySelector(".empresaNome");
  const inputLogo = document.getElementById("inputLogoNovo");
  const inputFundo = document.getElementById("inputFundoNovo");

  if (!modalEmpresaNovo || !empresaNome) return;

  // =================== FUNÇÕES ===================

  async function carregarEmpresa() {
    const { data, error } = await supabase
      .from("empresa")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Erro ao carregar empresa:", error.message);
      return;
    }

    if (data) {
      document.getElementById("inputNomeNovo").value = data.nome || "";
      document.getElementById("inputEnderecoNovo").value = data.endereco || "";
      document.getElementById("inputTelefoneNovo").value = data.telefone || "";
      document.getElementById("inputWhatsAppNovo").value = data.whatsapp || "";
      document.getElementById("inputCNPJNovo").value = data.cnpj || "";
      document.getElementById("inputCriadoEmNovo").value = data.criado_em
        ? new Date(data.criado_em).toLocaleDateString()
        : "";

      if (data.logo_url) {
        document.getElementById("previewLogoNovo").src = data.logo_url;
        document.querySelector("#previewLogoNovo + .placeholder-text").style.display = "none";
      }

      if (data.fundo_url) {
        document.getElementById("previewFundoNovo").src = data.fundo_url;
        document.querySelector("#previewFundoNovo + .placeholder-text").style.display = "none";
      }
    }
  }

  async function atualizarNomeEmpresa() {
    const { data, error } = await supabase
      .from("empresa")
      .select("nome")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Erro ao carregar nome da empresa:", error.message);
      return;
    }

    if (data && data.nome) {
      empresaNome.textContent = data.nome;
    } else {
      empresaNome.textContent = "Empresa não cadastrada";
    }
  }

  async function uploadArquivo(file, pasta) {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("empresa")
      .upload(`${pasta}/${fileName}`, file, { upsert: true });
    if (error) return null;
    const { publicUrl } = supabase.storage.from("empresa").getPublicUrl(`${pasta}/${fileName}`);
    return publicUrl;
  }

  // =================== EVENTOS ===================

  // Abrir modal
  empresaNome.addEventListener("click", async () => {
    modalEmpresaNovo.classList.add("show");
    await carregarEmpresa();
  });

  // Fechar modal
  btnFecharNovo.addEventListener("click", () => {
    modalEmpresaNovo.classList.remove("show");
  });

  window.addEventListener("click", (e) => {
    if (e.target === modalEmpresaNovo) modalEmpresaNovo.classList.remove("show");
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modalEmpresaNovo.classList.remove("show");
  });

  const inputWhatsApp = document.getElementById("inputWhatsAppNovo");
  // =========== formataçao para tefefone ==========
  // TELEFONE FIXO
const inputTelefone = document.getElementById("inputTelefoneNovo");

inputTelefone.addEventListener("input", function () {

  let valor = this.value.replace(/\D/g, "");

  if (valor.length > 10) {
    valor = valor.slice(0, 10);
  }

  if (valor.length >= 10) {
    valor = valor.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } 
  else if (valor.length >= 6) {
    valor = valor.replace(/(\d{2})(\d{4})/, "($1) $2");
  } 
  else if (valor.length >= 3) {
    valor = valor.replace(/(\d{2})(\d+)/, "($1) $2");
  }

  this.value = valor;

});

  // =========== formataçao para cnpj + consulta ===
  const inputCNPJ = document.getElementById("inputCNPJNovo");

inputCNPJ.addEventListener("input", function () {

  let valor = this.value.replace(/\D/g, "");

  if (valor.length > 14) {
    valor = valor.slice(0, 14);
  }

  valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
  valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
  valor = valor.replace(/(\d{4})(\d)/, "$1-$2");

  this.value = valor;

});


  // ===========formataçao para whatsapp ===========
inputWhatsApp.addEventListener("input", function () {

  let valor = this.value.replace(/\D/g, "");

  if (valor.length > 11) {
    valor = valor.slice(0, 11);
  }

  if (valor.length >= 11) {
    valor = valor.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
  } 
  else if (valor.length >= 7) {
    valor = valor.replace(/(\d{2})(\d{1})(\d{4})/, "($1) $2 $3");
  } 
  else if (valor.length >= 3) {
    valor = valor.replace(/(\d{2})(\d+)/, "($1) $2");
  }

  this.value = valor;

});
  // Salvar/Atualizar empresa
  btnSalvarNovo.addEventListener("click", async () => {
  const nome = document.getElementById("inputNomeNovo").value;
  const endereco = document.getElementById("inputEnderecoNovo").value;
  const telefone = document.getElementById("inputTelefoneNovo").value;
  const whatsapp = document.getElementById("inputWhatsAppNovo").value;
  const cnpj = document.getElementById("inputCNPJNovo").value;
  const criadoEm = new Date().toISOString();

  const logoFile = inputLogo.files[0];
  const fundoFile = inputFundo.files[0];

  // ================= VALIDAÇÃO =================
  if (!nome || !endereco || !telefone || !whatsapp || !cnpj) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  // Validação de CNPJ
  function validarCNPJ(cnpjInput) {
    let c = cnpjInput.replace(/\D/g, "");
    if (c.length !== 14) return false;
    if (/^(\d)\1+$/.test(c)) return false;

    let tamanho = c.length - 2;
    let numeros = c.substring(0, tamanho);
    let digitos = c.substring(tamanho);

    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = c.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return resultado == digitos.charAt(1);
  }

  if (!validarCNPJ(cnpj)) {
    alert("CNPJ inválido!");
    return;
  }

  // ================= UPLOAD =================
  const logoUrl = await uploadArquivo(logoFile, "logo");
  const fundoUrl = await uploadArquivo(fundoFile, "fundo");

  // ================= SALVAR NO SUPABASE =================
  const { error } = await supabase
    .from("empresa")
    .upsert(
      [
        {
          id: 1,
          nome,
          endereco,
          telefone: telefone.replace(/\D/g, ""), // salva só números
          whatsapp: whatsapp.replace(/\D/g, ""), // salva só números
          cnpj: cnpj.replace(/\D/g, ""), // salva só números
          criado_em: criadoEm,
          logo_url: logoUrl,
          fundo_url: fundoUrl,
        },
      ],
      { onConflict: ["id"] }
    );

  if (error) {
    alert("Erro ao salvar a empresa: " + error.message);
  } else {
    alert("Empresa cadastrada com sucesso!");
    await carregarEmpresa();
    await atualizarNomeEmpresa(); // Atualiza nome no header
  }
});

  // =================== PREVIEW IMAGENS ===================
  inputLogo.addEventListener("change", () => {
    const file = inputLogo.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById("previewLogoNovo").src = e.target.result;
        document.querySelector("#previewLogoNovo + .placeholder-text").style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });

  inputFundo.addEventListener("change", () => {
    const file = inputFundo.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById("previewFundoNovo").src = e.target.result;
        document.querySelector("#previewFundoNovo + .placeholder-text").style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });

  // =================== INICIAL ===================
  await atualizarNomeEmpresa(); // atualiza o header ao iniciar
});

// ================= funçao do modal Categorias ========

// Seleciona elementos
const btnNovaCategoria = document.getElementById('novaCategoria'); // botão que abre modal
const modalNovaCategoria = document.getElementById('modalNovaCategoria');
const btnFecharModal = modalNovaCategoria.querySelector('.btn-fechar-modal');
const btnCancelarModal = modalNovaCategoria.querySelector('.btn-cancelar');

// Garante que modal comece escondido
modalNovaCategoria.style.display = 'none';

// Função para abrir modal
function abrirModal() {
  modalNovaCategoria.style.display = 'flex';
}

// Função para fechar modal
function fecharModal() {
  modalNovaCategoria.style.display = 'none';
}

// Abrir modal somente ao clicar no botão
btnNovaCategoria.addEventListener('click', abrirModal);

// Fechar modal ao clicar no X
btnFecharModal.addEventListener('click', fecharModal);

// Fechar modal ao clicar em Cancelar
btnCancelarModal.addEventListener('click', fecharModal);

// Fechar modal ao clicar fora da área do conteúdo
window.addEventListener('click', (e) => {
  if(e.target === modalNovaCategoria) {
    fecharModal();
  }
});