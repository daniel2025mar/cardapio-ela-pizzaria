import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =================== SUPABASE ===================
const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =================== SIDEBAR ===================
const btnMenu = document.getElementById("btnMenu");
const sidebar = document.getElementById("sidebar");

function configurarSidebar() {
  if (window.innerWidth >= 768) {
    sidebar.classList.add("active");
  } else {
    sidebar.classList.remove("active");
  }
}

configurarSidebar();
window.addEventListener("resize", configurarSidebar);
btnMenu.addEventListener("click", () => {
  sidebar.classList.toggle("active");
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
  window.location.href = "./sistema/login.html";
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

    const logoUrl = await uploadArquivo(logoFile, "logo");
    const fundoUrl = await uploadArquivo(fundoFile, "fundo");

    const { error } = await supabase
      .from("empresa")
      .upsert(
        [
          {
            id: 1,
            nome,
            endereco,
            telefone,
            whatsapp,
            cnpj,
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