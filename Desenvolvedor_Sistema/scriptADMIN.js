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
      <td class="empresaNome" style="cursor:pointer;color:#0d6efd;">
        ${emp.nome}
      </td>
      <td>${formatCNPJ(emp.cnpj)}</td>
      <td>${emp.bloqueado ? 'Bloqueado' : 'Liberado'}</td>
      <td>
        <button
          class="${emp.bloqueado ? 'liberado' : 'bloqueado'} toggle"
          data-id="${emp.id}"
          data-bloqueado="${emp.bloqueado}">
          ${emp.bloqueado ? 'Liberar' : 'Bloquear'}
        </button>
      </td>
    `;

    tr.querySelector('.empresaNome').addEventListener('click', () => {
      abrirModalEmpresa({
        id: emp.id,
        nome: emp.nome,
        cnpj: emp.cnpj,
        status: emp.bloqueado ? "Bloqueado" : "Liberado",
        endereco: emp.endereco || "Não informado"
      });
    });

    tbody.appendChild(tr);
  });

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

async function abrirModalEmpresa(dadosEmpresa) {
  document.getElementById('modalNomeEmpresa').textContent = dadosEmpresa.nome;
  document.getElementById('modalCNPJ').textContent = formatCNPJ(dadosEmpresa.cnpj);
  document.getElementById('modalStatus').textContent = dadosEmpresa.status;
  document.getElementById('modalEndereco').textContent = dadosEmpresa.endereco;

  const tbodyPag = document.querySelector('#tabelaPagamentos tbody');
  tbodyPag.innerHTML = '';

  // =============================
  // BUSCAR PAGAMENTOS
  // =============================
  const { data: pagamentos, error } = await supabase
    .from('pagamentos_mensalidade')
    .select('*')
    .eq('empresa_id', dadosEmpresa.id);

  if (error) {
    console.error(error);
    return;
  }

  if (!pagamentos || pagamentos.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.style.textAlign = 'center';
    td.style.fontWeight = 'bold';
    td.style.color = '#555';
    td.textContent = 'Nenhum registro encontrado';
    tr.appendChild(td);
    tbodyPag.appendChild(tr);
    modal.style.display = 'flex';
    return;
  }

  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];

  const hoje = new Date();

  // 🔥 pega o ano baseado nos dados
  const anoAtual = pagamentos.length > 0
    ? new Date(pagamentos[0].data_vencimento).getFullYear()
    : hoje.getFullYear();

  for (let i = 0; i < 12; i++) {
    const mesNumero = i + 1;

    const pagamentoMes = pagamentos.find(p => {
      const data = new Date(p.data_vencimento);
      return data.getMonth() + 1 === mesNumero;
    });

    const tr = document.createElement('tr');
    let dataVencimento;
    let corStatus = "";

    // MÊS
    const tdMes = document.createElement('td');
    tdMes.textContent = meses[i];
    tr.appendChild(tdMes);

    // DATA
    const tdData = document.createElement('td');

    if (pagamentoMes) {
      dataVencimento = pagamentoMes.data_vencimento;
    } else {
      dataVencimento = `${anoAtual}-${String(mesNumero).padStart(2,'0')}-10`;
    }

    tdData.textContent = dataVencimento;
    tr.appendChild(tdData);

    // STATUS
    const tdStatus = document.createElement('td');
    const icone = document.createElement('i');
    let textoStatus = "";

    if (pagamentoMes) {
      const vencimento = new Date(pagamentoMes.data_vencimento);

      if (pagamentoMes.status.toLowerCase() === "pendente") {

        if (hoje > vencimento) {
          icone.className = "fa-solid fa-triangle-exclamation";
          icone.style.color = "orange";
          textoStatus = " Atrasado";
          corStatus = "status-atrasado";
        } else if (
          hoje.getDate() === vencimento.getDate() &&
          hoje.getMonth() === vencimento.getMonth()
        ) {
          icone.className = "fa-solid fa-hourglass-half";
          icone.style.color = "blue";
          textoStatus = " Vence hoje";
          corStatus = "status-hoje";
        } else {
          icone.className = "fa-solid fa-circle-xmark";
          icone.style.color = "red";
          textoStatus = " Não pago";
          corStatus = "status-pendente";
        }

      } else {
        icone.className = "fa-solid fa-circle-check";
        icone.style.color = "green";
        textoStatus = " Pago";
        corStatus = "status-pago";
      }

    } else {
      const vencimento = new Date(dataVencimento);

      if (hoje > vencimento) {
        icone.className = "fa-solid fa-triangle-exclamation";
        icone.style.color = "orange";
        textoStatus = " Atrasado";
        corStatus = "status-atrasado";
      } else if (
        hoje.getDate() === vencimento.getDate() &&
        hoje.getMonth() === vencimento.getMonth()
      ) {
        icone.className = "fa-solid fa-hourglass-half";
        icone.style.color = "blue";
        textoStatus = " Vence hoje";
        corStatus = "status-hoje";
      } else {
        icone.className = "fa-solid fa-circle-xmark";
        icone.style.color = "red";
        textoStatus = " Não pago";
        corStatus = "status-pendente";
      }
    }

    tdStatus.appendChild(icone);
    tdStatus.appendChild(document.createTextNode(textoStatus));
    tr.classList.add(corStatus);
    tr.appendChild(tdStatus);

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
// TEMA CLARO / ESCURO
// =============================
const botaoTema = document.getElementById("toggleTema");

if(localStorage.getItem("tema") === "dark"){
  document.body.classList.add("dark");
}

botaoTema.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if(document.body.classList.contains("dark")){
    localStorage.setItem("tema","dark");
  } else {
    localStorage.setItem("tema","light");
  }
});


async function verificarBloqueiosAutomaticos() {
  const hoje = new Date();

  // 🔍 Buscar pagamentos pendentes
  const { data: pagamentos, error } = await supabase
    .from('pagamentos_mensalidade')
    .select('*')
    .eq('status', 'pendente');

  if (error) {
    console.error("Erro ao buscar pagamentos:", error);
    return;
  }

  for (const p of pagamentos) {
    const vencimento = new Date(p.data_vencimento);

    // adiciona 10 dias
    vencimento.setDate(vencimento.getDate() + 8);

    if (hoje > vencimento) {
      console.log("Empresa atrasada:", p.empresa_id);

      // 🔒 BLOQUEAR EMPRESA
      const { error: erroUpdate } = await supabase
        .from('empresa')
        .update({ bloqueado: true })
        .eq('id', p.empresa_id);

      if (erroUpdate) {
        console.error("Erro ao bloquear:", erroUpdate);
      }
    }
  }
}
// =============================
// FILTRAR EMPRESAS
// =============================
function filtrarEmpresas() {
  const input = document.getElementById("buscarEmpresa").value.toLowerCase();
  const linhas = document.querySelectorAll("#listaEmpresas tr");

  linhas.forEach(linha => {
    const texto = linha.innerText.toLowerCase();
    linha.style.display = texto.includes(input) ? "" : "none";
  });
}

// =============================
// INICIAR SISTEMA
// =============================
window.addEventListener("load", async () => {
  await verificarBloqueiosAutomaticos(); // 🔥 NOVO
  await carregarEmpresas();
});