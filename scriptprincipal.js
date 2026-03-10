import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


// =================== SUPABASE ===================
const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
    const { data, error } = await supabase
      .from("empresa")
      .select("bloqueado")
      .eq("id", empresaIdAtual)
      .single();

    if (error) throw error;

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
const menuCadastroClientes = document.getElementById("menuCadastroClientes"); // NOVO MENU

// PEGAR SEÇÕES
const dashboard = document.getElementById("dashboard");
const cadastroProdutos = document.getElementById("cadastroProdutos");
const cadastroClientes = document.getElementById("cadastroClientes"); // NOVA SEÇÃO

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
menuDashboard.addEventListener("click", () => abrirSecao(dashboard));
menuAdicionar.addEventListener("click", () => abrirSecao(cadastroProdutos));
menuCadastroClientes.addEventListener("click", () => abrirSecao(cadastroClientes)); // NOVO CLICK
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

      // Remove o usuário do localStorage
      localStorage.removeItem("usuarioNome");
    }

    // Redireciona para a tela de login
    window.location.href = "./Sistema/Login.html";

  } catch (err) {
    console.error("Erro no logout:", err);
    // Redireciona mesmo se ocorrer erro
    window.location.href = "./Sistema/Login.html";
  }
});

btnNaoLogout?.addEventListener("click", () => {
  modalLogout.style.display = "none";
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

  if (!modalEmpresaNovo || !empresaNome) return;

  let logoFile = null;
  let fundoFile = null;

  // =================== FUNÇÃO DE UPLOAD ===================
  async function uploadArquivo(file, pasta) {
    if (!file) return null;
    console.log(`[UPLOAD] Iniciando upload para pasta: ${pasta}`);
    const fileExt = "jpeg"; // forçar jpeg
    const fileName = `${Date.now()}.${fileExt}`;
    try {
      const { data, error } = await supabase.storage
        .from("empresa")
        .upload(`${pasta}/${fileName}`, file, { upsert: true });
      if (error) {
        if (error.message.includes("Bucket not found")) {
          console.error("[UPLOAD] Bucket 'empresa' não encontrado. Crie no Supabase Storage!");
        } else {
          console.error("[UPLOAD] Erro no upload:", error.message);
        }
        return null;
      }
      const { publicUrl } = supabase.storage.from("empresa").getPublicUrl(`${pasta}/${fileName}`);
      console.log("[UPLOAD] Upload concluído. URL pública:", publicUrl);
      return publicUrl;
    } catch (err) {
      console.error("[UPLOAD] Exceção:", err);
      return null;
    }
  }

  // =================== BASE64 PARA FILE ===================
  function base64ToFile(base64, filename) {
    const [header, data] = base64.split(",");
    const byteString = atob(data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new File([ab], filename, { type: "image/jpeg" });
  }

  // =================== CARREGAR EMPRESA ===================
  async function carregarEmpresa() {
    const { data, error } = await supabase
      .from("empresa")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) { console.error("[CARREGAR] Erro ao carregar empresa:", error.message); return; }

    if (data) {
      console.log("[CARREGAR] Empresa carregada:", data);
      document.getElementById("inputNomeNovo").value = data.nome || "";
      document.getElementById("inputEnderecoNovo").value = data.endereco || "";
      document.getElementById("inputTelefoneNovo").value = data.telefone || "";
      document.getElementById("inputWhatsAppNovo").value = data.whatsapp || "";
      document.getElementById("inputCNPJNovo").value = data.cnpj || "";
      document.getElementById("inputCriadoEmNovo").value = data.criado_em
        ? new Date(data.criado_em).toLocaleDateString()
        : "";

      // Preview Logo
      const previewLogo = document.getElementById("previewLogoNovo");
      const placeholderLogo = previewLogo.nextElementSibling;
      previewLogo.src = data.logo_url || "";
      placeholderLogo.style.display = data.logo_url ? "none" : "inline";

      // Preview Fundo
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
    console.log("[MODAL] Abrindo modal empresa");
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
      if(inputLogo.files[0].type !== "image/jpeg"){
        alert("Apenas JPEG permitido para logo!");
        inputLogo.value = "";
        return;
      }
      logoFile = inputLogo.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        previewLogo.src = e.target.result;
        placeholderLogo.style.display = "none";
        console.log("[PREVIEW] Logo atualizado no preview");
      };
      reader.readAsDataURL(logoFile);
    }
  });

  // =================== PREVIEW FUNDO ===================
  const previewFundo = document.getElementById("previewFundoNovo");
  const placeholderFundo = previewFundo.nextElementSibling;
  const uploadBoxFundo = previewFundo.parentElement;
  uploadBoxFundo.addEventListener("click", () => { inputFundo.value=""; inputFundo.click(); });

  inputFundo.addEventListener("change", () => {
    if(inputFundo.files && inputFundo.files[0]){
      if(inputFundo.files[0].type !== "image/jpeg"){
        alert("Apenas JPEG permitido para fundo!");
        inputFundo.value = "";
        return;
      }
      fundoFile = inputFundo.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        previewFundo.src = e.target.result;
        placeholderFundo.style.display = "none";
        console.log("[PREVIEW] Fundo atualizado no preview");
      };
      reader.readAsDataURL(fundoFile);
    }
  });

  // =================== BOTÃO SALVAR ===================
  btnSalvarNovo.addEventListener("click", async () => {
  console.log("[SALVAR] Iniciando salvamento da empresa");

  const nome = document.getElementById("inputNomeNovo").value;
  const endereco = document.getElementById("inputEnderecoNovo").value;
  const telefone = document.getElementById("inputTelefoneNovo").value;
  const whatsapp = document.getElementById("inputWhatsAppNovo").value;
  const cnpj = document.getElementById("inputCNPJNovo").value;
  const criadoEm = new Date().toISOString();

  if (!nome || !endereco || !telefone || !whatsapp || !cnpj) { 
    alert("Preencha todos os campos!"); 
    return; 
  }

  // Pega Base64 do preview
  const logoBase64 = previewLogo.src.startsWith("data:image") ? previewLogo.src : null;
  const fundoBase64 = previewFundo.src.startsWith("data:image") ? previewFundo.src : null;

  console.log("[SALVAR] Logo Base64:", logoBase64 ? "Existe" : "Não existe");
  console.log("[SALVAR] Fundo Base64:", fundoBase64 ? "Existe" : "Não existe");

  try {
    const { data, error } = await supabase
      .from("empresa")
      .upsert([{
        id: 1,
        nome,
        endereco,
        telefone: telefone.replace(/\D/g,""),
        whatsapp: whatsapp.replace(/\D/g,""),
        cnpj: cnpj.replace(/\D/g,""),
        criado_em: criadoEm,
        logo_url: logoBase64,
        fundo_url: fundoBase64
      }], { onConflict: ["id"] });

    if (error) {
      console.error("[SALVAR] Erro ao salvar:", error.message);
      alert("Erro ao salvar: " + error.message);
      return;
    }

    console.log("[SALVAR] Empresa cadastrada com sucesso!", data);
    alert("Empresa cadastrada com sucesso!");
    
    // Não apagamos o preview
    await carregarEmpresa();
    await atualizarNomeEmpresa();

  } catch (err) {
    console.error("[SALVAR] Exceção:", err);
    alert("Erro inesperado ao salvar empresa");
  }
});

  await atualizarNomeEmpresa();
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