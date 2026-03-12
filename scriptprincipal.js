import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


// =================== SUPABASE ===================
const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==== BLOQUEIO DE ZOOM ====


// ===================== FUNÇÃO PARA ESPERAR A SPLASH TERMINAR =====================
function esperarSplashTerminar() {
  return new Promise((resolve) => {
    const splash = document.getElementById("splashScreen");
    if (!splash) return resolve();

    const checkSplash = setInterval(() => {
      if (splash.style.display === "none" || splash.style.opacity === "0") {
        clearInterval(checkSplash);
        resolve();
      }
    }, 100);
  });
}

// ===================== FUNÇÕES AUXILIARES =====================
function formatarData(data) {
  const d = new Date(data + "T00:00:00");
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function formatarCNPJ(cnpj) {
  if (!cnpj) return "";
  cnpj = cnpj.replace(/\D/g,"");
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,"$1.$2.$3/$4-$5");
}

function formatarValor(valor) {
  if (!valor) return "";
  return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(valor);
}

// ===================== SCRIPT PRINCIPAL =====================
document.addEventListener("DOMContentLoaded", async () => {

  await esperarSplashTerminar();

  const toast = document.getElementById("modalPendenciasAtraso");
  const lista = document.getElementById("listaPendencias");
  const btnFecharToast = document.getElementById("fecharToast");
  const btnPagarMensalidade = document.querySelector(".btn-pagar-mensalidade");

  if (!toast || !lista || !btnFecharToast || !btnPagarMensalidade) return;

  const somToast = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1128-failure.mp3");
  somToast.volume = 0.6;
  somToast.preload = "auto";

  const hoje = new Date().toISOString().split("T")[0];

  // ===== BUSCAR PENDÊNCIAS EM ATRASO =====
  try {
    const { data: pendencias, error } = await supabase
      .from("pagamentos_mensalidade")
      .select("*")
      .lt("data_vencimento", hoje)
      .eq("status", "pendente")
      .order("data_vencimento", { ascending: true });

    if (error) throw error;

    if (!pendencias || pendencias.length === 0) {
      btnPagarMensalidade.style.display = "none";
      return;
    }

    // existe pelo menos uma pendência
    ultimaPendencia = pendencias[0]; // pegar a mais antiga
    btnPagarMensalidade.style.display = "inline-flex";

    lista.innerHTML = "";
    pendencias.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.empresa_id} está com pendência em atraso na data ${formatarData(p.data_vencimento)}. Evita o bloqueio do sistema.`;
      lista.appendChild(li);
    });

    toast.style.display = "block";
    somToast.play().catch(() => {});
    setTimeout(() => { toast.style.display = "none"; }, 15000);

  } catch (err) {
    console.error("Erro ao buscar pendências:", err);
  }

  // ===== FECHAR TOAST =====
  btnFecharToast.addEventListener("click", () => {
    toast.style.display = "none";
    if (ultimaPendencia) abrirModalPagamento(ultimaPendencia);
  });

  // ===== BOTÃO PAGAR MENSALIDADE =====
  btnPagarMensalidade.addEventListener("click", () => {
    if (ultimaPendencia) abrirModalPagamento(ultimaPendencia);
    else alert("Nenhuma pendência em atraso.");
  });

});

// ===================== ABRIR MODAL PAGAMENTO =====================
async function abrirModalPagamento(pendencia) {
  if (!pendencia) return;

  const modalPagamento = document.getElementById("modalPagamento");
  modalPagamento.style.display = "block";

  pendenciaAtualId = pendencia.id;

  document.getElementById("valorPagamento").value = formatarValor(pendencia.valor);
  document.getElementById("dataPagamento").valueAsDate = new Date();

  await carregarDadosEmpresa(pendencia.empresa_id);
}

// ===================== FECHAR MODAL =====================
const btnFecharPagamento = document.getElementById("fecharModalPagamento");
btnFecharPagamento.addEventListener("click", () => {
  document.getElementById("modalPagamento").style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalPagamento")) {
    document.getElementById("modalPagamento").style.display = "none";
  }
});

// ===================== SALVAR PAGAMENTO =====================
const formPagamento = document.getElementById("formPagamento");

formPagamento.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!pendenciaAtualId) { alert("Nenhuma pendência selecionada."); return; }

  let valor = document.getElementById("valorPagamento").value.replace(/[^\d,]/g,"").replace(",",".");
  valor = parseFloat(valor);
  const data_pagamento = document.getElementById("dataPagamento").value;
  const forma_pagamento = document.getElementById("formaPagamento").value;

  try {
    const { error } = await supabase
      .from("pagamentos_mensalidade")
      .update({
        data_pagamento: data_pagamento,
        forma_pagamento: forma_pagamento,
        status: "pago"
      })
      .eq("id", pendenciaAtualId);

    if (error) throw error;

    alert("Pagamento registrado com sucesso!");
    document.getElementById("modalPagamento").style.display = "none";
    location.reload();

  } catch (err) {
    console.error("Erro ao registrar pagamento:", err);
    alert("Erro ao registrar pagamento!");
  }

});

// ===================== BUSCAR DADOS DA EMPRESA =====================
async function carregarDadosEmpresa(empresaId) {
  try {
    const { data: empresa, error } = await supabase
      .from("empresa")
      .select("*")
      .eq("id", empresaId)
      .single();
    if (error) throw error;
    if (!empresa) return;

    document.getElementById("nomeEmpresaModal").textContent = empresa.nome;
    document.getElementById("cnpjEmpresaModal").textContent = formatarCNPJ(empresa.cnpj);
    document.getElementById("enderecoEmpresaModal").textContent = empresa.endereco;
    document.getElementById("statusEmpresaModal").textContent =
      empresa.bloqueado ? "Bloqueado" : "Ativo";
    document.getElementById("empresaPagamento").value = empresa.id;

  } catch (err) {
    console.error("Erro ao carregar empresa:", err);
  }
}

// ===================== MODAL PAGAMENTO =====================

// esperar a página carregar
document.addEventListener("DOMContentLoaded", function () {

  const modalPagamento = document.getElementById("modalPagamento");
  const btnPagar = document.querySelector(".btn-pagar-mensalidade");
  const btnFechar = document.getElementById("fecharModalPagamento");

  // abrir modal
  if (btnPagar) {
    btnPagar.addEventListener("click", function () {
      modalPagamento.style.display = "block";
    });
  }

  // fechar modal
  if (btnFechar) {
    btnFechar.addEventListener("click", function () {
      modalPagamento.style.display = "none";
    });
  }

});
window.addEventListener('wheel', function (e) {
  if (e.ctrlKey) e.preventDefault(); // impede zoom com Ctrl + scroll
}, { passive: false });

// ID da empresa monitorada
const empresaIdAtual = 1;

// Cria o som de alerta
const somErro = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1128-failure.mp3");
somErro.volume = 0.6; // volume ajustável de 0 a 1
somErro.preload = "auto";

// Bloquear sistema
function bloquearSistema() {
  const overlay = document.getElementById("bloqueioOverlay");
  if (!overlay) return;

  if (overlay.style.display !== "flex") { // só toca som se overlay não estiver visível
    somErro.play().catch(err => console.log("Erro ao tocar som:", err));
  }

  overlay.style.display = "flex"; // mostra overlay

  // Bloqueia todas as interações
  document.querySelectorAll("button, input, select, textarea, a").forEach(el => {
    el.disabled = true;
    el.style.pointerEvents = 'none';
  });
}

// Desbloquear sistema
function desbloquearSistema() {
  const overlay = document.getElementById("bloqueioOverlay");
  if (!overlay) return;
  overlay.style.display = "none"; // esconde overlay

  document.querySelectorAll("button, input, select, textarea, a").forEach(el => {
    el.disabled = false;
    el.style.pointerEvents = 'auto';
  });
}

// Função para verificar o status atual da empresa
async function verificarBloqueio() {
  try {
    // Busca nome e bloqueio da empresa
    const { data, error } = await supabase
      .from("empresa")
      .select("nome, bloqueado")
      .eq("id", empresaIdAtual)
      .single();

    if (error) throw error;

    // Atualiza o nome da empresa no overlay
    if (data?.nome) {
      const nomeElem = document.getElementById("nomeEmpresa");
      if (nomeElem) nomeElem.innerText = data.nome;
    }

    // Bloqueia ou desbloqueia
    if (data?.bloqueado) {
      bloquearSistema();
    } else {
      desbloquearSistema();
    }
  } catch (err) {
    console.error("Erro ao verificar bloqueio:", err.message);
  }
}

// Checagem em tempo real a cada 1 segundo
setInterval(verificarBloqueio, 1000);

// Inicialização
window.addEventListener("load", () => {
  verificarBloqueio(); // checa imediatamente ao entrar
});

// Bloquear zoom no celular (pinça)
window.addEventListener('touchstart', function (e) {
  if (e.touches.length > 1) {
    e.preventDefault(); // evita zoom por multi-touch
  }
}, { passive: false });

window.addEventListener('gesturestart', function (e) {
  e.preventDefault(); // iOS Safari
});


// Seleciona elementos
const formaPagamento = document.getElementById("formaPagamento"); // select de pagamento
const pixModal = document.getElementById("pixModal");
const closePix = document.querySelector(".closePix");
const copiarChavePix = document.getElementById("copiarChavePix");
const chavePixInput = document.getElementById("chavePix");

// Função para abrir o modal PIX
function abrirPixModal(qrCodeURL, chavePix) {
    pixModal.style.display = "block";
    document.getElementById("qrCodePix").src = qrCodeURL;
    chavePixInput.value = chavePix;
}

// Escuta quando o usuário muda a forma de pagamento
formaPagamento.addEventListener("change", (e) => {
    if (e.target.value === "pix") {
        // Substitua pelo seu QR code e chave real
        abrirPixModal("caminho/para/qrcode.png", "34998217498");
    }
});

// Fechar modal
closePix.onclick = () => pixModal.style.display = "none";

// Fechar ao clicar fora do modal
window.onclick = (event) => {
    if (event.target === pixModal) pixModal.style.display = "none";
}

// Copiar chave PIX
copiarChavePix.onclick = () => {
    chavePixInput.select();
    chavePixInput.setSelectionRange(0, 99999); // Para mobile
    document.execCommand("copy");
    alert("Chave PIX copiada!");
};
// Bloquear zoom no desktop (Ctrl + scroll ou Ctrl + +/-)
window.addEventListener('keydown', function (e) {
  // 17 = Ctrl, 187 = +, 189 = -, 61 = + (alguns navegadores), 173 = -
  if (e.ctrlKey && (
      e.key === '+' || 
      e.key === '-' || 
      e.key === '=' || 
      e.key === '_'
    )) {
    e.preventDefault();
  }
});

// Bloqueio total do botão voltar / swipe
(function() {
    function bloquearVoltar() {
        // Adiciona vários estados extras ao histórico
        history.pushState(null, null, location.href);
        history.pushState(null, null, location.href);
        history.pushState(null, null, location.href);
    }

    // Inicializa
    bloquearVoltar();

    // Captura tentativa de voltar
    window.addEventListener('popstate', function(event) {
        // Reinsere estados imediatamente
        bloquearVoltar();
        console.log("Voltar bloqueado!");
    });

    // Reforço contínuo caso algum estado escape
    setInterval(() => {
        bloquearVoltar();
    }, 1000);
})();

// ===================== SELEÇÃO DE ELEMENTOS =====================
const progressCircle = document.querySelector(".circle-progress");
const progressText = document.getElementById("progressText");
const splash = document.getElementById("splashScreen");
const splashMessage = document.querySelector(".splash-text");
const circumference = 283; // 2πr, r=45

let progress = 0;
let interval;
let carregando = true;
let travado = false;

// ===================== INICIALIZAÇÃO DO CÍRCULO =====================
progressCircle.style.strokeDasharray = circumference;
progressCircle.style.strokeDashoffset = circumference;
progressCircle.style.transition = "stroke-dashoffset 0.05s linear";

// ===================== CHECAGEM DE INTERNET =====================
function temInternet() {
    return navigator.onLine;
}

// ===================== ATUALIZAÇÃO DA BARRA =====================
function atualizarBarra() {
    // Sem internet: pausa
    if (!temInternet()) {
        carregando = false;
        splashMessage.textContent = "❌ Sem conexão com a internet!";
        progressCircle.style.stroke = "#ff0000";
        return;
    }

    // Internet voltou
    if (!carregando) {
        carregando = true;
        splashMessage.textContent = "Preparando tudo para você… ⏳";
        progressCircle.style.stroke = "#00aaff";
    }

    // Travamentos em pontos específicos
    const travamentos = [30, 55, 80];
    if (travamentos.includes(progress) && !travado) {
        travado = true;
        setTimeout(() => { travado = false; }, 800); // pausa 0.8s
        return;
    }

    // Incrementa progresso
    progress = Math.min(progress + 1, 100);
    progressText.textContent = progress + "%";

    // Atualiza círculo
    const offset = circumference - (circumference * progress / 100);
    progressCircle.style.strokeDashoffset = offset;

    // Efeito de cor
    if ([20, 45, 70].includes(progress)) {
        progressCircle.style.stroke = "#0004ff";
        setTimeout(() => (progressCircle.style.stroke = "#03305c"), 150);
    }

    // Concluído
    if (progress >= 100) {
        clearInterval(interval);
        splash.style.transition = "opacity 0.5s";
        splash.style.opacity = 0;
        setTimeout(() => (splash.style.display = "none"), 500);
    }
}

// ===================== INICIA CARREGAMENTO =====================
interval = setInterval(atualizarBarra, 50);

// ===================== EVENTOS ONLINE/OFFLINE =====================
window.addEventListener("online", () => {
    if (!carregando && progress < 100) {
        carregando = true;
        splashMessage.textContent = "Preparando tudo para você… ⏳";
        progressCircle.style.stroke = "#0011ff";
    }
});

window.addEventListener("offline", () => {
    carregando = false;
    splashMessage.textContent = "❌ Sem conexão com a internet!";
    progressCircle.style.stroke = "#ff0000";
});

// ===================== LOTTIE =====================
lottie.loadAnimation({
    container: document.getElementById('lottieSplash'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'https://assets6.lottiefiles.com/packages/lf20_usmfx6bp.json'
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
  item.addEventListener("click", (e) => fecharSidebarMobile(e));
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
function fecharSidebarMobile(e) {

  const id = e.target.id;

  // NÃO fechar se for o menu que abre o submenu
  if (id === "menuClientes") return;

  // Fechar apenas quando abrir páginas reais
  if (
    id === "menuCadastroClientes" ||
    id === "menuDashboard" ||
    id === "menuAdicionar"
  ) {
    sidebar.classList.remove("active");
  }
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
// =================== FUNÇÃO ABRIR MENUS ===================
// PEGAR MENUS
const menuDashboard = document.getElementById("menuDashboard");
const menuAdicionar = document.getElementById("menuAdicionar");
const menuCadastroClientes = document.getElementById("menuCadastroClientes");
const confBtn = document.getElementById("confBtn"); // MENU CONFIGURAÇÃO

// PEGAR SEÇÕES
const dashboard = document.getElementById("dashboard");
const cadastroProdutos = document.getElementById("cadastroProdutos");
const cadastroClientes = document.getElementById("cadastroClientes");
const configuracoes = document.getElementById("configuracoes"); // SEÇÃO CONFIGURAÇÃO

// TODAS AS SEÇÕES
const secoes = document.querySelectorAll(".secao");

// FUNÇÃO PARA ABRIR QUALQUER SEÇÃO
function abrirSecao(secaoAtiva) {

  // Esconder todas
  secoes.forEach(secao => {
    secao.style.display = "none";
  });

  // Mostrar a selecionada
  secaoAtiva.style.display = "block";
}

// CLICK NOS MENUS
menuDashboard?.addEventListener("click", () => abrirSecao(dashboard));
menuAdicionar?.addEventListener("click", () => abrirSecao(cadastroProdutos));
menuCadastroClientes?.addEventListener("click", () => abrirSecao(cadastroClientes));
confBtn?.addEventListener("click", () => abrirSecao(configuracoes)); // CLICK CONFIGURAÇÃO


// =================== MODAL LOGOUT ===================

const modalLogout = document.getElementById("modalLogout");
const logoutBtn = document.getElementById("logoutBtn");
const btnSimLogout = document.getElementById("btnSimLogout");
const btnNaoLogout = document.getElementById("btnNaoLogout");

logoutBtn?.addEventListener("click", () => {
  modalLogout.style.display = "flex";
});

btnSimLogout?.addEventListener("click", async () => {

  modalLogout.style.display = "none";

  try {

    // Pega o usuário logado do localStorage
    const usuarioNome = localStorage.getItem("usuarioNome");

    if (usuarioNome) {

      // Atualiza last_seen para null no Supabase
      const { error } = await supabase
        .from("usuarios")
        .update({ last_seen: null })
        .eq("username", usuarioNome);

      if (error) {
        console.error("Erro ao limpar last_seen:", error.message);
      }

      // Remove usuário do localStorage
      localStorage.removeItem("usuarioNome");
    }

    // Redireciona para login
    window.location.href = "./Sistema/Login.html";

  } catch (err) {

    console.error("Erro no logout:", err);

    // Redireciona mesmo se erro
    window.location.href = "./Sistema/Login.html";

  }

});

btnNaoLogout?.addEventListener("click", () => {
  modalLogout.style.display = "none";
});

// =================== VERIFICAR SE É ADMIN ===================

async function verificarAdmin() {

  try {

    const usuarioNome = localStorage.getItem("usuarioNome");

    if (!usuarioNome) return;

    const { data, error } = await supabase
      .from("usuarios")
      .select("username")
      .eq("username", usuarioNome)
      .single();

    if (error) {
      console.error("Erro ao verificar admin:", error);
      return;
    }

    // Se for admin mostra as configurações
    if (data.username === "admin") {

      const configContainer = document.getElementById("configContainer");

      if (configContainer) {
        configContainer.style.display = "block";
      }

    }

  } catch (err) {
    console.error("Erro:", err);
  }

}

document.addEventListener("DOMContentLoaded", async () => {
  verificarAdmin();
  await carregarValorMensalidade();
  carregarDiaVencimento();
});

// =================== CARREGAR VALOR DA MENSALIDADE ===================
// =====================
// CARREGAR VALOR DA MENSALIDADE
// =====================
// =====================
// CARREGAR VALOR DA MENSALIDADE
// =====================
async function carregarValorMensalidade() {

  try {

    const { data, error } = await supabase
      .from("configuracoes_sistema")
      .select("valor_num")
      .eq("chave", "valor_mensalidade")
      .single();

    if (error) {
      console.error("Erro ao buscar valor da mensalidade:", error);
      return;
    }

    const campoValor = document.getElementById("valorMensalidade");

    if (campoValor && data) {

      const valor = parseFloat(data.valor_num);

      campoValor.value = "R$ " + valor
        .toFixed(2)
        .replace(".", ",");

    }

  } catch (err) {
    console.error("Erro inesperado:", err);
  }

}


// =====================
// ATUALIZAR DIA DOS PAGAMENTOS PENDENTES
// =====================
async function atualizarDiaVencimento(diaNovo) {

  try {

    const { data, error } = await supabase
      .from("pagamentos_mensalidade")
      .select("id, data_vencimento")
      .eq("status", "pendente");

    if (error) {
      console.error("Erro ao buscar pagamentos:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.log("Nenhum pagamento pendente encontrado.");
      return;
    }

    for (const pagamento of data) {

      const dataOriginal = pagamento.data_vencimento;

      const partes = dataOriginal.split("-");

      const ano = partes[0];
      const mes = partes[1];

      const novoDia = String(diaNovo).padStart(2, "0");

      const novaData = `${ano}-${mes}-${novoDia}`;

      const { error: erroUpdate } = await supabase
        .from("pagamentos_mensalidade")
        .update({ data_vencimento: novaData })
        .eq("id", pagamento.id);

      if (erroUpdate) {
        console.error("Erro ao atualizar data:", erroUpdate);
      }

    }

    console.log("Datas de vencimento atualizadas!");

  } catch (err) {
    console.error("Erro inesperado:", err);
  }

}


// =====================
// SALVAR CONFIGURAÇÃO
// =====================
async function salvarConfiguracaoMensalidade() {

  try {

    const campoValor = document.getElementById("valorMensalidade");
    const campoDia = document.getElementById("diaVencimento");

    if (!campoValor) return;

    // remove formatação do valor
    let valor = campoValor.value
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(",", ".");

    valor = parseFloat(valor);

    if (isNaN(valor)) {
      alert("Valor inválido");
      return;
    }

    // ====================================
    // 1 ATUALIZA configuracoes_sistema
    // ====================================
    const { error: erroConfig } = await supabase
      .from("configuracoes_sistema")
      .update({ valor_num: valor })
      .eq("chave", "valor_mensalidade");

    if (erroConfig) {
      console.error("Erro ao atualizar configuracao:", erroConfig);
      return;
    }

    // ====================================
    // 2 ATUALIZA pagamentos pendentes (valor)
    // ====================================
    const { error: erroPagamentos } = await supabase
      .from("pagamentos_mensalidade")
      .update({ valor: valor })
      .eq("status", "pendente");

    if (erroPagamentos) {
      console.error("Erro ao atualizar pagamentos:", erroPagamentos);
      return;
    }

    // ====================================
    // 3 ATUALIZA DIA DE VENCIMENTO
    // ====================================
    if (campoDia && campoDia.value) {

      const diaNovo = parseInt(campoDia.value);

      await atualizarDiaVencimento(diaNovo);

    }

    console.log("Configuração atualizada com sucesso!");

    alert("Configuração salva com sucesso!");

  } catch (err) {
    console.error("Erro inesperado:", err);
  }

}


// =====================
// FORMATAÇÃO AO DIGITAR (MOEDA)
// =====================
function formatarCampoMoeda() {

  const campo = document.getElementById("valorMensalidade");

  if (!campo) return;

  campo.addEventListener("input", function () {

    let valor = this.value.replace(/\D/g, "");

    valor = (valor / 100).toFixed(2) + "";

    valor = valor.replace(".", ",");

    this.value = "R$ " + valor;

  });

}


// ===================
// CARREGAR DIA DE VENCIMENTO
// ===================
async function carregarDiaVencimento() {

  console.log("🔎 Buscando dia de vencimento...");

  try {

    const { data, error } = await supabase
      .from("pagamentos_mensalidade")
      .select("data_vencimento")
      .eq("empresa_id", 1)
      .limit(1);

    if (error) {
      console.error("Erro Supabase:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.warn("Nenhum registro encontrado.");
      return;
    }

    const dataVencimento = data[0].data_vencimento;

    const dia = dataVencimento.split("-")[2];

    const campoDia = document.getElementById("diaVencimento");

    if (campoDia) {
      campoDia.value = dia;
    }

  } catch (err) {
    console.error("Erro inesperado:", err);
  }

}


// =====================
// EVENTOS AO CARREGAR A PÁGINA
// =====================
document.addEventListener("DOMContentLoaded", () => {

  carregarValorMensalidade();

  carregarDiaVencimento();

  formatarCampoMoeda();

  const botaoSalvar = document.querySelector(".btn-salvar-config");

  if (botaoSalvar) {
    botaoSalvar.addEventListener("click", salvarConfiguracaoMensalidade);
  }

});
// Seleciona elementos do novo modal
const modalAlerta = document.getElementById('modalAlerta');
const modalTextoAlerta = document.getElementById('modalTextoAlerta');
const modalOkAlerta = document.getElementById('modalOkAlerta');
const modalCloseAlerta = document.getElementById('modalCloseAlerta');

// Função para mostrar o novo modal
function mostrarModalAlerta(msg) {
  modalTextoAlerta.textContent = msg;
  modalAlerta.style.display = 'flex';
}

// Fechar ao clicar no X ou OK
modalOkAlerta.addEventListener('click', () => { modalAlerta.style.display = 'none'; });
modalCloseAlerta.addEventListener('click', () => { modalAlerta.style.display = 'none'; });

// Fechar clicando fora da caixa
window.addEventListener('click', (e) => {
  if (e.target === modalAlerta) modalAlerta.style.display = 'none';
});

// ================= GERAR CÓDIGO AUTOMÁTICO =================

async function gerarCodigoCliente() {

  try {

    const { data, error } = await supabase
      .from("clientes")
      .select("codigo_cliente")
      .order("codigo_cliente", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar código:", error);
      return;
    }

    let novoCodigo = "0001";

    if (data && data.codigo_cliente) {

      const ultimoCodigo = parseInt(data.codigo_cliente, 10) || 0;

      const proximoCodigo = ultimoCodigo + 1;

      novoCodigo = String(proximoCodigo).padStart(4, "0");

    }

    const campoCodigo = document.getElementById("codigoCliente");

    if (campoCodigo) {
      campoCodigo.value = novoCodigo;
    }

  } catch (erro) {

    console.error("Erro ao gerar código:", erro);

  }

}

// executa quando carregar a página
document.addEventListener("DOMContentLoaded", () => {
  gerarCodigoCliente();
});

document.addEventListener("DOMContentLoaded", async () => {
  const userNameSpan = document.querySelector(".sidebar-footer .user-name");
  const userRoleSpan = document.querySelector(".sidebar-footer .user-role");

  const usuarioNome = localStorage.getItem("usuarioNome"); // pega o nome do usuário logado

  // ✅ Atualiza apenas o nome do usuário
  if(userNameSpan && usuarioNome){
    userNameSpan.textContent = usuarioNome;
  }

  // ✅ Mantém toda a função do cargo intacta
  if(userRoleSpan && usuarioNome){
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("cargo")
        .eq("username", usuarioNome)
        .single();

      if(error){
        console.error("Erro ao buscar cargo:", error);
        // Não sobrescreve se já tem algo no span
        if(!userRoleSpan.textContent) userRoleSpan.textContent = "Usuário"; 
      } else if(data && data.cargo){
        userRoleSpan.textContent = data.cargo; // atualiza o cargo no sidebar

        // 🔔 Notificação online só para admin
        if(data.cargo === "admin") {
          notificarUsuariosOnline();

          // 🔄 Escuta alterações em tempo real na coluna last_seen
          supabase
            .from("usuarios")
            .on("UPDATE", payload => {
              if(payload.new.last_seen !== payload.old.last_seen){
                notificarUsuariosOnline();
              }
            })
            .subscribe();
        }

      } else {
        // fallback caso cargo venha vazio
        if(!userRoleSpan.textContent) userRoleSpan.textContent = "Usuário"; 
      }

    } catch(err){
      console.error("Erro inesperado ao buscar cargo:", err);
      if(!userRoleSpan.textContent) userRoleSpan.textContent = "Usuário"; 
    }
  }
});

// som de notigicaçao de usuarios
const somNotificacao = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3");
somNotificacao.preload = "auto";
somNotificacao.volume = 0.6;
// =============================
// FUNÇÃO PARA NOTIFICAR USUÁRIOS ONLINE
// =============================

async function notificarUsuariosOnline() {

  // ⏳ espera a splash terminar
  const splash = document.getElementById("splashScreen");
  if (splash) {
    while (splash.style.display !== "none") {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  try {
    const { data: usuarios, error } = await supabase
      .from("usuarios")
      .select("username, last_seen")
      .neq("username", localStorage.getItem("usuarioNome"))
      .not("last_seen", "is", null);

    if (error) {
      console.error("Erro ao buscar usuários online:", error);
      return;
    }

    const lista = document.getElementById("listaUsuariosOnline");
    const modal = document.getElementById("modalUsuariosOnline");

    if (!lista || !modal) return;

    lista.innerHTML = "";

    if (usuarios && usuarios.length > 0) {

      usuarios.forEach(u => {
        const li = document.createElement("li");
        li.textContent = u.username;
        lista.appendChild(li);
      });

      // 🔔 abre o modal
      modal.style.display = "block";

      // 🔊 toca som SEMPRE que o modal abrir (cria um novo objeto Audio)
      try {
        const somNotificacaoAtual = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3");
        somNotificacaoAtual.preload = "auto";
        somNotificacaoAtual.volume = 0.6;
        await somNotificacaoAtual.play();
      } catch (e) {
        console.log("Som bloqueado pelo navegador:", e);
      }

      // ⏱ fecha após 10s
      setTimeout(() => {
        modal.style.display = "none";
      }, 10000);

    } else {
      console.log("Nenhum usuário online encontrado.");
    }

  } catch (err) {
    console.error("Erro inesperado na notificação de usuários online:", err);
  }
}
// -----------------------------
// Seletores do modal
// -----------------------------
const modalAlterarSenha = document.getElementById("modalAlterarSenha");
const closeModalAlterarSenha = modalAlterarSenha.querySelector(".close");
const formAlterarSenhaUnique = document.getElementById("formAlterarSenha_unique");
const mensagemSenhaUnique = document.getElementById("mensagemSenha_unique");
const senhaAtualInputUnique = document.getElementById("senhaAtual_unique");
const novaSenhaInput = document.getElementById("novaSenha_unique");
const confirmarSenhaInput = document.getElementById("confirmarSenha_unique");
const sidebarFooter = document.querySelector(".sidebar-footer");

// -----------------------------
// Função para alternar visibilidade da senha
// -----------------------------
function toggleSenha(input, icon) {
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// -----------------------------
// Adicionar ícones dentro do input (direita)
// -----------------------------
[novaSenhaInput, confirmarSenhaInput].forEach(input => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("input-eye-wrapper");
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const icon = document.createElement("i");
  icon.classList.add("fa", "fa-eye", "eye-icon"); // Font Awesome
  icon.style.position = "absolute";
  icon.style.right = "12px";
  icon.style.top = "50%";
  icon.style.transform = "translateY(-50%)";
  icon.style.cursor = "pointer";
  wrapper.style.position = "relative";
  wrapper.appendChild(icon);

  icon.addEventListener("click", () => toggleSenha(input, icon));
});

// -----------------------------
// Abrir modal (somente ao clicar no footer)
// -----------------------------
async function abrirModalAlterarSenha() {
  modalAlterarSenha.style.display = "flex"; // centralizado
  formAlterarSenhaUnique.reset();
  mensagemSenhaUnique.style.color = "red";
  mensagemSenhaUnique.textContent = "";

  const usuarioNome = localStorage.getItem("usuarioNome");
  if (!usuarioNome || !senhaAtualInputUnique) return;

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("password")
      .eq("username", usuarioNome)
      .single();

    senhaAtualInputUnique.value = (!error && data && data.password) ? data.password : "";
  } catch (err) {
    console.error("Erro ao buscar senha atual:", err);
    senhaAtualInputUnique.value = "";
  }
}

// -----------------------------
// Evento para abrir modal apenas ao clicar no sidebar-footer
// -----------------------------
if (sidebarFooter) {
  sidebarFooter.style.cursor = "pointer";
  sidebarFooter.addEventListener("click", abrirModalAlterarSenha);
}

// -----------------------------
// Fecha modal
// -----------------------------
closeModalAlterarSenha.addEventListener("click", () => {
  modalAlterarSenha.style.display = "none";
  formAlterarSenhaUnique.reset();
  mensagemSenhaUnique.textContent = "";
});

window.addEventListener("click", (e) => {
  if (e.target === modalAlterarSenha) {
    modalAlterarSenha.style.display = "none";
    formAlterarSenhaUnique.reset();
    mensagemSenhaUnique.textContent = "";
  }
});

// -----------------------------
// Enviar formulário para alterar senha
// -----------------------------
formAlterarSenhaUnique.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuarioNome = localStorage.getItem("usuarioNome");
  const novaSenha = novaSenhaInput.value.trim();
  const confirmarSenha = confirmarSenhaInput.value.trim();

  if (novaSenha !== confirmarSenha) {
    mensagemSenhaUnique.textContent = "A nova senha e a confirmação não coincidem!";
    return;
  }

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("password")
      .eq("username", usuarioNome)
      .single();

    if (error || !data || !data.password) {
      mensagemSenhaUnique.textContent = "Erro ao buscar dados do usuário!";
      return;
    }

    const senhaAtual = data.password;

    if (novaSenha === senhaAtual) {
      mensagemSenhaUnique.textContent = "Não é possível salvar a mesma senha atual!";
      return;
    }

    const { error: erroAtualizar } = await supabase
      .from("usuarios")
      .update({ password: novaSenha })
      .eq("username", usuarioNome);

    if (erroAtualizar) {
      mensagemSenhaUnique.textContent = "Erro ao atualizar a senha!";
      return;
    }

    mensagemSenhaUnique.style.color = "lightgreen";
    mensagemSenhaUnique.textContent = "Senha alterada com sucesso!";
    formAlterarSenhaUnique.reset();

    setTimeout(() => {
      modalAlterarSenha.style.display = "none";
      mensagemSenhaUnique.textContent = "";
      mensagemSenhaUnique.style.color = "red";
    }, 2000);

  } catch (err) {
    console.error("Erro inesperado:", err);
    mensagemSenhaUnique.textContent = "Ocorreu um erro inesperado!";
  }
});

// ================= CADASTRO DE CLIENTES =================
const form = document.getElementById("formCadastroCliente");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Iniciando cadastro...");

    try {
      const codigoCliente = document.getElementById("codigoCliente")?.value;
      const cpf = document.getElementById("cpfCliente")?.value.trim() || null;
      const nome = document.getElementById("nomeCliente")?.value?.trim();
      const telefone = document.getElementById("telefoneCliente")?.value || null;
      const email = document.getElementById("emailCliente")?.value || null;
      const dataNascimento = document.getElementById("dataNascimento")?.value || null;
      const limiteCredito = document.getElementById("limiteCredito")?.value;
      const fotoInput = document.getElementById("fotoCliente");
      const foto = fotoInput?.files?.[0];

      // ================= VALIDAÇÃO =================
      if (!codigoCliente) {
        mostrarModalAlerta("Código do cliente é obrigatório!");
        return;
      }

      if (!nome) {
        mostrarModalAlerta("Nome é obrigatório!");
        return;
      }

      // ================= VERIFICAR CPF =================
      if (cpf) {
        const { data: cpfExistente, error: cpfError } = await supabase
          .from("clientes")
          .select("id")
          .eq("cpf", cpf)
          .limit(1);

        if (cpfError) {
          console.error("Erro ao verificar CPF:", cpfError);
          return;
        }

        if (cpfExistente && cpfExistente.length > 0) {
          mostrarModalAlerta("Este CPF já está cadastrado!");
          return;
        }
      }

      // ================= UPLOAD FOTO =================
      let fotoUrl = null;
      if (foto) {
        const nomeArquivo = `${codigoCliente}_${Date.now()}_${foto.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("fotos-clientes")
          .upload(`fotos/${nomeArquivo}`, foto);

        if (uploadError) {
          console.error("Erro upload foto:", uploadError);
        } else {
          const { data: publicUrl } = supabase.storage
            .from("fotos-clientes")
            .getPublicUrl(uploadData.path);
          fotoUrl = publicUrl.publicUrl;
        }
      }

      // ================= INSERT =================
      const { data, error } = await supabase
        .from("clientes")
        .insert([
          {
            codigo_cliente: codigoCliente,
            cpf: cpf,
            nome: nome,
            telefone: telefone,
            email: email,
            data_nascimento: dataNascimento,
            limite_credito: limiteCredito ? Number(limiteCredito) : null,
            foto_url: fotoUrl || null
          }
        ]);

      if (error) {
        console.error("Erro detalhado:", error);
        mostrarModalAlerta("Erro ao cadastrar cliente.");
        return;
      }

      console.log("Cliente cadastrado:", data);
      alert("Cliente cadastrado com sucesso!");

      // limpa o formulário exceto o código
      form.reset();

      // gera próximo código automático
      await gerarCodigoCliente();

    } catch (erro) {
      console.error("Erro inesperado:", erro);
      mostrarModalAlerta("Erro inesperado no sistema.");
    }
  });
}

// ============ mostra o total de clientes =============
async function atualizarTotalClientes() {
  const { count, error } = await supabase
    .from('clientes')
    .select('*', { count: 'exact' })  // Faz a contagem exata
  if (error) {
    console.error('Erro ao buscar total de clientes:', error)
    return
  }

  const totalElement = document.getElementById('totalClientes')
  totalElement.textContent = count || 0
}

// Chama a função quando a página carregar
window.addEventListener('DOMContentLoaded', atualizarTotalClientes)

// =================== MODAL EMPRESA ===================
document.addEventListener("DOMContentLoaded", async () => {
  const modalEmpresaNovo = document.getElementById("modalEmpresaNovo");
  const btnFecharNovo = document.getElementById("fecharModalNovo");
  const btnSalvarNovo = document.getElementById("btnSalvarEmpresaNovo");
  const empresaNome = document.querySelector(".empresaNome");
  const inputLogo = document.getElementById("inputLogoNovo");
  const inputFundo = document.getElementById("inputFundoNovo");
  const inputDataPagamento = document.getElementById("inputDataPagamentoNovo");
  const inputCNPJ = document.getElementById("inputCNPJNovo");

  if (!modalEmpresaNovo || !empresaNome) return;

  let logoFile = null;
  let fundoFile = null;

  // =================== FUNÇÃO UPLOAD ===================
  async function uploadArquivo(file, pasta) {
    if (!file) return null;
    const fileExt = "jpeg";
    const fileName = `${Date.now()}.${fileExt}`;
    try {
      const { data, error } = await supabase.storage
        .from("empresa")
        .upload(`${pasta}/${fileName}`, file, { upsert: true });
      if (error) { console.error(error.message); return null; }
      const { publicUrl } = supabase.storage.from("empresa").getPublicUrl(`${pasta}/${fileName}`);
      return publicUrl;
    } catch (err) { console.error(err); return null; }
  }

  // =================== FUNÇÃO FORMATA CNPJ ===================
  function formatCNPJ(cnpj) {
    if (!cnpj) return "";
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }

  // =================== CARREGAR EMPRESA ===================
  async function carregarEmpresa() {
    const { data, error } = await supabase
      .from("empresa")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) { console.error(error.message); return; }

    if (data) {
      document.getElementById("inputNomeNovo").value = data.nome || "";
      document.getElementById("inputEnderecoNovo").value = data.endereco || "";
      document.getElementById("inputTelefoneNovo").value = data.telefone || "";
      document.getElementById("inputWhatsAppNovo").value = data.whatsapp || "";
      document.getElementById("inputCNPJNovo").value = formatCNPJ(data.cnpj || "");
      document.getElementById("inputCriadoEmNovo").value = data.criado_em
        ? new Date(data.criado_em).toLocaleDateString()
        : "";

      // =================== PEGAR PRIMEIRO VENCIMENTO ===================
      const { data: primeiraParcela, error: pagamentoError } = await supabase
        .from("pagamentos_mensalidade")
        .select("data_vencimento")
        .eq("empresa_id", 1)
        .order("data_vencimento", { ascending: true })
        .limit(1)
        .single();

      inputDataPagamento.value = primeiraParcela ? primeiraParcela.data_vencimento : "";

      // =================== LOGO ===================
      const previewLogo = document.getElementById("previewLogoNovo");
      const placeholderLogo = previewLogo.nextElementSibling;
      previewLogo.src = data.logo_url || "";
      placeholderLogo.style.display = data.logo_url ? "none" : "inline";

      // =================== FUNDO ===================
      const previewFundo = document.getElementById("previewFundoNovo");
      const placeholderFundo = previewFundo.nextElementSibling;
      previewFundo.src = data.fundo_url || "";
      placeholderFundo.style.display = data.fundo_url ? "none" : "inline";

      logoFile = null;
      fundoFile = null;
    }
  }

  async function atualizarNomeEmpresa() {
    const { data } = await supabase.from("empresa").select("nome").eq("id", 1).single();
    empresaNome.textContent = (data && data.nome) ? data.nome : "Empresa não cadastrada";
  }

  // =================== EVENTOS ===================
  empresaNome.addEventListener("click", async () => {
    modalEmpresaNovo.classList.add("show");
    await carregarEmpresa();
  });

  btnFecharNovo.addEventListener("click", () => modalEmpresaNovo.classList.remove("show"));
  window.addEventListener("click", (e) => { if (e.target === modalEmpresaNovo) modalEmpresaNovo.classList.remove("show"); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") modalEmpresaNovo.classList.remove("show"); });

  // =================== PREVIEW LOGO ===================
  const previewLogo = document.getElementById("previewLogoNovo");
  const placeholderLogo = previewLogo.nextElementSibling;
  inputLogo.addEventListener("change", () => {
    if(inputLogo.files && inputLogo.files[0]){
      logoFile = inputLogo.files[0];
      const reader = new FileReader();
      reader.onload = e => { previewLogo.src = e.target.result; placeholderLogo.style.display = "none"; };
      reader.readAsDataURL(logoFile);
    }
  });

  // =================== PREVIEW FUNDO ===================
  const previewFundo = document.getElementById("previewFundoNovo");
  const placeholderFundo = previewFundo.nextElementSibling;
  inputFundo.addEventListener("change", () => {
    if(inputFundo.files && inputFundo.files[0]){
      fundoFile = inputFundo.files[0];
      const reader = new FileReader();
      reader.onload = e => { previewFundo.src = e.target.result; placeholderFundo.style.display = "none"; };
      reader.readAsDataURL(fundoFile);
    }
  });

  // =================== BOTÃO SALVAR ===================
  btnSalvarNovo.addEventListener("click", async () => {
    const nome = document.getElementById("inputNomeNovo").value;
    const endereco = document.getElementById("inputEnderecoNovo").value;
    const telefone = document.getElementById("inputTelefoneNovo").value;
    const whatsapp = document.getElementById("inputWhatsAppNovo").value;
    const cnpj = document.getElementById("inputCNPJNovo").value.replace(/\D/g, ""); // salva sem máscara
    const dataPagamentoValor = inputDataPagamento.value;
    const criadoEm = new Date().toISOString();

    if (!nome || !endereco || !telefone || !whatsapp || !cnpj || !dataPagamentoValor) { 
      alert("Preencha todos os campos, incluindo a data de pagamento!"); 
      return; 
    }

    const logoBase64 = previewLogo.src.startsWith("data:image") ? previewLogo.src : null;
    const fundoBase64 = previewFundo.src.startsWith("data:image") ? previewFundo.src : null;

    try {
      const { data: empresaAtual, error: empresaError } = await supabase.from("empresa").select("dia_pagamento").eq("id", 1).single();
      if (empresaError) throw empresaError;

      let diaPagamentoParaSalvar = empresaAtual && empresaAtual.dia_pagamento ? empresaAtual.dia_pagamento : dataPagamentoValor;

      const { data, error } = await supabase.from("empresa").upsert([{
        id: 1,
        nome,
        endereco,
        telefone: telefone.replace(/\D/g,""),
        whatsapp: whatsapp.replace(/\D/g,""),
        cnpj: cnpj,
        criado_em: criadoEm,
        logo_url: logoBase64,
        fundo_url: fundoBase64,
        dia_pagamento: diaPagamentoParaSalvar
      }], { onConflict: ["id"] });

      if (error) throw error;

      const { data: configData, error: configError } = await supabase
        .from("configuracoes_sistema")
        .select("valor_num")
        .eq("chave", "valor_mensalidade")
        .single();
      if (configError) throw configError;
      const VALOR_FIXO_MENSALIDADE = parseFloat(configData.valor_num);

      const diaMes = parseInt(diaPagamentoParaSalvar.split("-")[2]);
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;
      const totalMeses = 12;

      let vencimentos = [];
      for (let i = 0; i < totalMeses; i++) {
        let mes = mesAtual + i;
        let ano = anoAtual;
        if (mes > 12) { mes -= 12; ano += 1; }
        let dia = Math.min(diaMes, new Date(ano, mes, 0).getDate());
        let dataVenc = new Date(ano, mes - 1, dia);

        vencimentos.push({ 
          empresa_id: 1,
          data_vencimento: dataVenc.toISOString().split("T")[0],
          valor: VALOR_FIXO_MENSALIDADE,
          status: "pendente",
          criado_em: criadoEm
        });
      }

      const { data: pagamentoData, error: pagamentoError } = await supabase
        .from("pagamentos_mensalidade")
        .upsert(vencimentos);
      if (pagamentoError) throw pagamentoError;

      alert("Empresa cadastrada e vencimentos criados com sucesso!");
      await carregarEmpresa();
      await atualizarNomeEmpresa();
      modalEmpresaNovo.classList.remove("show");

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar empresa: " + (err.message || err));
    }
  });

  await atualizarNomeEmpresa();
});

// ==================== Categorias ====================
const btnNovaCategoria = document.getElementById('novaCategoria');
const modalNovaCategoria = document.getElementById('modalNovaCategoria');
const btnFecharModalCat = modalNovaCategoria.querySelector('.btn-fechar-modal');
const btnCancelarModalCat = modalNovaCategoria.querySelector('.btn-cancelar');
const formNovaCategoria = modalNovaCategoria.querySelector('#formNovaCategoria');
const inputTitulo = modalNovaCategoria.querySelector('#inputTituloCategoria');
const inputDescricao = modalNovaCategoria.querySelector('#inputDescricaoCategoria');
let iconeSelecionado = null;
const categoriaProduto = document.getElementById('categoriaProduto');

// Inicializa modal escondido
modalNovaCategoria.style.display = 'none';

// Abrir/Fechar modal
btnNovaCategoria.addEventListener('click', () => modalNovaCategoria.style.display = 'flex');
btnFecharModalCat.addEventListener('click', () => fecharModalCategoria());
btnCancelarModalCat?.addEventListener('click', () => fecharModalCategoria());
window.addEventListener('click', e => { if(e.target === modalNovaCategoria) fecharModalCategoria(); });

function fecharModalCategoria() {
  modalNovaCategoria.style.display = 'none';
  formNovaCategoria.reset();
  iconeSelecionado = null;
  document.querySelectorAll('.icone-selecionavel').forEach(i => i.classList.remove('selecionado'));
}

// Seleção de ícone
document.querySelectorAll('.icone-selecionavel').forEach(icon => {
  icon.addEventListener('click', () => {
    document.querySelectorAll('.icone-selecionavel').forEach(i => i.classList.remove('selecionado'));
    icon.classList.add('selecionado');
    iconeSelecionado = icon.dataset.icone;
  });
});

// Carregar categorias
async function carregarCategorias() {
  categoriaProduto.innerHTML = '<option value="">Carregando...</option>';
  const { data, error } = await supabase.from('categorias').select('id,titulo').order('titulo',{ascending:true});
  if(error){ console.error(error); categoriaProduto.innerHTML='<option value="">Erro ao carregar</option>'; return; }
  categoriaProduto.innerHTML = '<option value="">Selecione a categoria</option>';
  data.forEach(cat=>{
    const opt = document.createElement('option');
    opt.value = cat.id; opt.textContent = cat.titulo;
    categoriaProduto.appendChild(opt);
  });
}
carregarCategorias();

// Enviar nova categoria
formNovaCategoria.addEventListener('submit', async e=>{
  e.preventDefault();
  if(!inputTitulo.value.trim() || !iconeSelecionado){ alert("Título e Ícone obrigatórios!"); return; }
  const { error } = await supabase.from('categorias').insert([{titulo:inputTitulo.value.trim(), descricao:inputDescricao.value.trim(), icone:iconeSelecionado}]);
  if(error){ console.error(error); alert("Erro ao salvar categoria."); }
  else{ alert("Categoria salva!"); fecharModalCategoria(); carregarCategorias(); }
});

// ==================== Produto ====================
const formProduto = document.getElementById('formProduto');
const nomeProduto = document.getElementById('nomeProduto');
const precoProduto = document.getElementById('precoProduto');
const promocaoProduto = document.getElementById('promocao');
const custoProduto = document.getElementById('custo');
const estoqueProduto = document.getElementById('estoqueProduto');
const descricaoProduto = document.getElementById('descricaoProduto');
const fotoProduto = document.getElementById('fotoProduto');
const previewProduto = document.getElementById('previewProduto');
const btnSalvarProduto = formProduto.querySelector('button[type="submit"]');

// ==================== Modal Tamanhos ====================
const btnAbrirModalTamanhos = document.getElementById('btnAbrirModalTamanhos');
const modalTamanhos = document.getElementById('modalTamanhos');
const btnFecharModalTamanhos = modalTamanhos.querySelector('.btn-fechar-modal');
const btnAdicionarTamanho = document.getElementById('btnAdicionarTamanho');
const tabelaTamanhosBody = modalTamanhos.querySelector('tbody');
let listaTamanhos = [];

// Abrir/Fechar modal tamanhos
btnAbrirModalTamanhos.addEventListener('click', ()=> modalTamanhos.style.display='flex');
btnFecharModalTamanhos.addEventListener('click', ()=> modalTamanhos.style.display='none');
window.addEventListener('click', e=>{if(e.target===modalTamanhos) modalTamanhos.style.display='none';});

// Adicionar tamanho
btnAdicionarTamanho.addEventListener('click', ()=>{
  const tamanho = document.getElementById('tamanho').value.trim();
  const preco = parseFloat(document.getElementById('precoTamanho').value);
  if(!tamanho||isNaN(preco)){ alert("Tamanho e preço obrigatórios"); return; }
  listaTamanhos.push({tamanho, preco});
  atualizarTabelaTamanhos();
  document.getElementById('tamanho').value=''; document.getElementById('precoTamanho').value='';
});

function atualizarTabelaTamanhos(){
  tabelaTamanhosBody.innerHTML='';
  listaTamanhos.forEach((t,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML=`<td>${t.tamanho}</td><td>${t.preco.toFixed(2)}</td><td><button type="button" onclick="removerTamanho(${i})">Remover</button></td>`;
    tabelaTamanhosBody.appendChild(tr);
  });
}
function removerTamanho(i){ listaTamanhos.splice(i,1); atualizarTabelaTamanhos(); }

// ==================== Base64 Reduzido ====================
async function getBase64Reduzido(file,maxWidth=800,maxHeight=800){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload=event=>{
      const img=new Image();
      img.src=event.target.result;
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        let w=img.width; let h=img.height;
        if(w>maxWidth){ h=h*(maxWidth/w); w=maxWidth; }
        if(h>maxHeight){ w=w*(maxHeight/h); h=maxHeight; }
        canvas.width=w; canvas.height=h;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg',0.8));
      };
      img.onerror=err=>reject(err);
    };
    reader.onerror=err=>reject(err);
  });
}

// Atualizar preview
fotoProduto.addEventListener('change', async e=>{
  const file=e.target.files[0];
  if(file){ try{ previewProduto.src=await getBase64Reduzido(file); }catch(err){console.error(err);} }
  else{ previewProduto.src="./Imagem/inventory.jpg"; }
});

// ==================== Enviar produto ====================
formProduto.addEventListener('submit', async e=>{
  e.preventDefault();
  btnSalvarProduto.disabled=true;
  btnSalvarProduto.textContent="Salvando...";

  const nome = nomeProduto.value.trim();
  const categoria_id = categoriaProduto.value;
  const preco = parseFloat(precoProduto.value);
  const promocao = parseFloat(promocaoProduto.value)||0;
  const custo = parseFloat(custoProduto.value)||0;
  const estoque = parseInt(estoqueProduto.value)||0;
  const descricao = descricaoProduto.value.trim();

  if(!nome||!categoria_id||isNaN(preco)||preco<=0){
    alert("Nome, Categoria e Preço obrigatórios e válidos");
    btnSalvarProduto.disabled=false; btnSalvarProduto.textContent="Salvar Produto"; return;
  }

  try{
    let foto_base64=null;
    const file=fotoProduto.files[0];
    if(file) foto_base64=await getBase64Reduzido(file);

    // Inserir produto
    const { data: produtoData, error: produtoError } = await supabase.from('produtos')
      .insert([{nome,categoria_id,preco,promocao,custo,estoque,descricao,foto_url:foto_base64}])
      .select();

    if(produtoError){ console.error(produtoError); alert("Erro ao salvar produto"); btnSalvarProduto.disabled=false; btnSalvarProduto.textContent="Salvar Produto"; return; }

    const produto_id = produtoData[0].id;

    // Inserir variações
    if(listaTamanhos.length>0){
      const variacoes = listaTamanhos.map(t=>({produto_id,tamanho:t.tamanho,preco:t.preco}));
      const { error: varError } = await supabase.from('produto_variacoes').insert(variacoes);
      if(varError){ console.error(varError); alert("Produto salvo, mas erro ao salvar variações"); }
    }

    alert("Produto e variações cadastrados com sucesso!");
    formProduto.reset();
    previewProduto.src="./Imagem/inventory.jpg";
    listaTamanhos=[];
    atualizarTabelaTamanhos();

  }catch(err){ console.error(err); alert("Erro ao cadastrar produto"); }

  btnSalvarProduto.disabled=false;
  btnSalvarProduto.textContent="Salvar Produto";
});