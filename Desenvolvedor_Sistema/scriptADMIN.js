import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// =============================
// CARREGAR EMPRESAS
// =============================
async function carregarEmpresas() {

  const { data, error } = await supabase
    .from('empresa')
    .select('id, nome, cnpj, endereco, bloqueado')
    .order('nome', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const tbody = document.getElementById("listaEmpresas");
  tbody.innerHTML = "";

  data.forEach(emp => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="empresaNome" style="cursor:pointer; color:#0d6efd;">
        ${emp.nome}
      </td>

      <td>${formatCNPJ(emp.cnpj)}</td>

      <td>
        ${emp.bloqueado ? 'Bloqueado' : 'Liberado'}
      </td>

      <td>
        <button 
        class="${emp.bloqueado ? 'liberado' : 'bloqueado'} toggle"
        data-id="${emp.id}"
        data-bloqueado="${emp.bloqueado}">
        ${emp.bloqueado ? 'Liberar' : 'Bloquear'}
        </button>
      </td>
    `;

    // =============================
    // ABRIR MODAL AO CLICAR NO NOME
    // =============================
    tr.querySelector('.empresaNome').addEventListener('click', () => {

      abrirModalEmpresa({
        nome: emp.nome,
        cnpj: emp.cnpj,
        status: emp.bloqueado ? "Bloqueado" : "Liberado",
        endereco: emp.endereco || "Não informado",
        pagamentos: []
      });

    });

    tbody.appendChild(tr);

  });

  // =============================
  // BOTÃO BLOQUEAR / LIBERAR
  // =============================
  document.querySelectorAll('.toggle').forEach(btn => {

    btn.addEventListener('click', async () => {

      const id = btn.getAttribute('data-id');
      const bloqueadoAtual = btn.getAttribute('data-bloqueado') === 'true';
      const bloquear = !bloqueadoAtual;

      if (bloquear) {

        const confirmar = confirm("Deseja realmente bloquear a empresa?");
        if (!confirmar) return;

      }

      await atualizarBloqueio(id, bloquear);
      await carregarEmpresas();

    });

  });

}

// =============================
// ATUALIZAR BLOQUEIO
// =============================
async function atualizarBloqueio(id, bloquear) {

  const { error } = await supabase
    .from('empresa')
    .update({ bloqueado: bloquear })
    .eq('id', id);

  if (error) {
    alert("Erro ao atualizar: " + error.message);
    return;
  }

  alert(`Sistema da empresa ${bloquear ? "bloqueado" : "liberado"} com sucesso!`);

}

// =============================
// FORMATAR CNPJ
// =============================
function formatCNPJ(cnpj) {

  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );

}

// =============================
// MODAL
// =============================

const modal = document.getElementById('modalEmpresa');
const spanClose = document.querySelector('.modal .close');

function abrirModalEmpresa(dadosEmpresa) {

  document.getElementById('modalNomeEmpresa').textContent = dadosEmpresa.nome;

  document.getElementById('modalCNPJ').textContent =
    formatCNPJ(dadosEmpresa.cnpj);

  document.getElementById('modalStatus').textContent =
    dadosEmpresa.status;

  document.getElementById('modalEndereco').textContent =
    dadosEmpresa.endereco;

  const tbodyPag = document.querySelector('#tabelaPagamentos tbody');
  tbodyPag.innerHTML = '';

  if (dadosEmpresa.pagamentos && dadosEmpresa.pagamentos.length > 0) {

    dadosEmpresa.pagamentos.forEach(p => {

      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${p.mes}</td>
        <td>${p.vencimento}</td>
        <td>${p.pago ? '✔️ Pago' : '❌ Não pago'}</td>
      `;

      tbodyPag.appendChild(tr);

    });

  } else {

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td colspan="3">Nenhum pagamento registrado</td>
    `;

    tbodyPag.appendChild(tr);

  }

  modal.style.display = 'flex';

}

// =============================
// FECHAR MODAL
// =============================

spanClose.onclick = function () {
  modal.style.display = 'none';
}

window.onclick = function (event) {

  if (event.target === modal) {
    modal.style.display = 'none';
  }

}

// =============================
// FILTRAR EMPRESAS
// =============================

function filtrarEmpresas() {

  const input = document
    .getElementById("buscarEmpresa")
    .value
    .toLowerCase();

  const linhas = document
    .querySelectorAll("#listaEmpresas tr");

  linhas.forEach(linha => {

    const texto = linha.innerText.toLowerCase();

    linha.style.display =
      texto.includes(input) ? "" : "none";

  });

}

// =============================
// INICIAR SISTEMA
// =============================
window.addEventListener("load", carregarEmpresas);