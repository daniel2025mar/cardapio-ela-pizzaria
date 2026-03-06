import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =================== FUNÇÃO PARA ATUALIZAR NOME DA EMPRESA ===================

async function atualizarNomeEmpresa() {
  const empresaNome = document.querySelector('.empresaNome');
  const rodapeEmpresa = document.querySelector('.rodape-empresa');

  const { data, error } = await supabase
    .from('empresa')
    .select('nome')
    .eq('id', 1)
    .single();

  let nomeExibir = "Sua Empresa"; // fallback padrão

  if (!error && data && data.nome) {
    nomeExibir = data.nome; // se existir registro, usa o nome da tabela
  }

  if (empresaNome) empresaNome.textContent = nomeExibir;
  if (rodapeEmpresa) rodapeEmpresa.textContent = `© 2026 ${nomeExibir}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  await atualizarNomeEmpresa(); // Atualiza nome da empresa no header e rodapé
});
// ================== MODAL DE ERRO ==================
const modalErro = document.getElementById("modalErro");
const mensagemErro = document.getElementById("mensagemErro");
const btnFecharErro = document.getElementById("btnFecharErro");

// Função para mostrar modal de erro
function mostrarModalErro(msg) {
  mensagemErro.textContent = msg;
  modalErro.style.display = "flex";
}

// Fecha o modal ao clicar no botão
btnFecharErro.addEventListener("click", () => {
  modalErro.style.display = "none";
  // Limpa os campos
  document.getElementById("nome").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("nome").focus();
});

// ================== LOGIN ==================
const btnEntrar = document.getElementById("btnEntrar");

btnEntrar.addEventListener("click", verificarLogin);

async function verificarLogin() {

  const usernameInputEl = document.getElementById("nome");
  const passwordInputEl = document.getElementById("senha");
  const mensagemBoasVindasEl = document.getElementById("mensagemBoasVindas");

  const usernameInput = usernameInputEl.value.trim();
  const passwordInput = passwordInputEl.value.trim();

  if (!usernameInput || !passwordInput) {
      mostrarModalErro("Preencha usuário e senha");
      return;
  }

  try {
      // Consulta no Supabase (case-insensitive)
      const { data, error } = await supabase
          .from("usuarios")
          .select("username, password, ativo, permissoes")
          .ilike("username", usernameInput);

      if (error) {
          mostrarModalErro("Erro ao consultar Banco");
          return;
      }

      if (!data || data.length === 0) {
          mostrarModalErro(`Usuário "${usernameInput}" não encontrado na base de dados.`);
          usernameInputEl.value = "";
          passwordInputEl.value = "";
          usernameInputEl.focus();
          return;
      }

      const usuario = data[0];

      if (!usuario.ativo) {
          mostrarModalErro(`O usuário "${usuario.username}" está desativado.`);
          usernameInputEl.value = "";
          passwordInputEl.value = "";
          usernameInputEl.focus();
          return;
      }

      if (usuario.password === passwordInput) {

          // Salva que o usuário está logado
          localStorage.setItem('usuarioLogado', 'true');
          localStorage.setItem('usuarioNome', usuario.username);

          // ================== LOGIN CORRETO ==================
          mensagemBoasVindasEl.textContent = `Bem-vindo, ${usuario.username}!`;
          mensagemBoasVindasEl.style.color = "#ffffff"; // azul
          passwordInputEl.value = ""; // limpa apenas senha
          btnEntrar.disabled = true; // desativa botão para evitar cliques múltiplos

          // Redireciona após 2 segundos
          setTimeout(() => {
              window.location.href = "../index.html";
          }, 2000);

      } else {
          mostrarModalErro(`Senha incorreta para o usuário "${usuario.username}".`);
          usernameInputEl.value = "";
          passwordInputEl.value = "";
          usernameInputEl.focus();
      }

  } catch (err) {
      console.error("Erro inesperado:", err);
      mostrarModalErro("Ocorreu um erro inesperado. Tente novamente.");
      usernameInputEl.value = "";
      passwordInputEl.value = "";
      usernameInputEl.focus();
  }
}
// fim