import { createClient } from "https://esm.sh/@supabase/supabase-js@2";



window.addEventListener('wheel', function (e) {
  if (e.ctrlKey) e.preventDefault(); // impede zoom com Ctrl + scroll
}, { passive: false });
// =================== SUPABASE ===================
const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

btnSimLogout?.addEventListener("click", () => {
  modalLogout.style.display = "none";
  window.location.href = "./Sistema/Login.html";
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

  if(userNameSpan && usuarioNome){
    userNameSpan.textContent = usuarioNome; // atualiza o span com o usuário logado
  }

  if(userRoleSpan && usuarioNome){
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("cargo")
        .eq("username", usuarioNome)
        .single();

      if(error){
        console.error("Erro ao buscar cargo:", error);
        userRoleSpan.textContent = "Usuário"; // fallback
      } else if(data && data.cargo){
        userRoleSpan.textContent = data.cargo; // atualiza o cargo no sidebar
      } else {
        userRoleSpan.textContent = "Usuário"; // fallback
      }

    } catch(err){
      console.error("Erro inesperado ao buscar cargo:", err);
      userRoleSpan.textContent = "Usuário"; // fallback
    }
  }
});

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