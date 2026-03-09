import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://vixurbnyhalixuwyytjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHVyYm55aGFsaXh1d3l5dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc0ODksImV4cCI6MjA4ODI5MzQ4OX0._0kx5t0Yi6uAge5K9BFCh9PHs66YrW3sTY80yncTLeM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Carregar todas as empresas
async function carregarEmpresas() {
  const { data, error } = await supabase
    .from('empresa')
    .select('id, nome, cnpj, bloqueado')
    .order('nome', { ascending: true });

  if (error) return console.error(error);

  const tbody = document.getElementById("listaEmpresas");
  tbody.innerHTML = "";

  data.forEach(emp => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${emp.nome}</td>
      <td>${formatCNPJ(emp.cnpj)}</td>
      <td>${emp.bloqueado ? 'Bloqueado' : 'Liberado'}</td>
      <td>
        <button class="${emp.bloqueado ? 'liberado' : 'bloqueado'} toggle" data-id="${emp.id}" data-bloqueado="${emp.bloqueado}">
          ${emp.bloqueado ? 'Liberar' : 'Bloquear'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const bloqueadoAtual = btn.getAttribute('data-bloqueado') === 'true';
      const bloquear = !bloqueadoAtual; // Vai bloquear se estiver liberado

      // Se for bloquear, pedir confirmação
      if (bloquear) {
        const confirmar = confirm("Deseja realmente bloquear a empresa?");
        if (!confirmar) return; // cancelar se clicar "Cancelar"
      }

      await atualizarBloqueio(id, bloquear);
      await carregarEmpresas();
    });
  });
}

// Atualizar bloqueio no Supabase
async function atualizarBloqueio(id, bloquear) {
  const { data, error } = await supabase
    .from('empresa')
    .update({ bloqueado: bloquear })
    .eq('id', id);

  if (error) return alert("Erro ao atualizar: " + error.message);
  alert(`Sistema da empresa ${bloquear ? "bloqueado" : "liberado"} com sucesso!`);
}

// Formatar CNPJ
function formatCNPJ(cnpj) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

window.addEventListener("load", carregarEmpresas);