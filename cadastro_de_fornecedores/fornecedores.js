const API_BASE = "http://localhost:3000";
const API_FORNECEDORES = `${API_BASE}/fornecedores`;

let fornecedores = [];
let fornecedorEditandoId = null;

// ==========================
// INICIAR
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    carregarFornecedores();
});

// ==========================
// CARREGAR
// ==========================
async function carregarFornecedores() {

    try {
        const res = await fetch(API_FORNECEDORES);
        fornecedores = await res.json();

        renderTabela(fornecedores);
    } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
    }
}

// ==========================
// RENDER TABELA
// ==========================
function renderTabela(lista) {

    const tabela = document.querySelector("#tabela");
    tabela.innerHTML = "";

    lista.forEach(fornecedor => {

        tabela.innerHTML += `
            <tr>
                <td>${fornecedor.empresa}</td>
                <td>${fornecedor.cnpj}</td>
                <td>${fornecedor.cep}</td>
                <td>${fornecedor.complemento}</td>

                <td>
                    <button onclick="editarFornecedor('${fornecedor.id}')">Editar</button>
                    <button onclick="excluirFornecedor('${fornecedor.id}')">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// ==========================
// SALVAR (CRIAR / EDITAR)
// ==========================
async function salvarFornecedor() {

    const fornecedor = {
        empresa: document.querySelector("#empresa").value,
        cnpj: document.querySelector("#cnpj").value,
        cep: document.querySelector("#cep").value,
        complemento: document.querySelector("#complemento").value
    };

    if (!fornecedor.empresa || !fornecedor.cnpj) {
        alert("Preencha Empresa e CNPJ!");
        return;
    }

    const cnpjLimpo = fornecedor.cnpj.replace(/\D/g, "");

    if (cnpjLimpo.length !== 14) {
        alert("O CNPJ deve conter 14 números!");
        return;
    }

    try {

        if (fornecedorEditandoId) {

            await fetch(`${API_FORNECEDORES}/${fornecedorEditandoId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fornecedor)
            });

            fornecedorEditandoId = null;

        } else {

            await fetch(API_FORNECEDORES, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fornecedor)
            });
        }

        limparFormulario();
        carregarFornecedores();

    } catch (error) {
        console.error("Erro ao salvar fornecedor:", error);
    }
}

// ==========================
// EDITAR
// ==========================
function editarFornecedor(id) {

    const fornecedor = fornecedores.find(f => String(f.id) === String(id));
    if (!fornecedor) return;

    document.querySelector("#empresa").value = fornecedor.empresa;
    document.querySelector("#cnpj").value = fornecedor.cnpj;
    document.querySelector("#cep").value = fornecedor.cep;
    document.querySelector("#complemento").value = fornecedor.complemento;

    fornecedorEditandoId = id;
}

// ==========================
// EXCLUIR
// ==========================
async function excluirFornecedor(id) {

    if (!confirm("Deseja excluir este fornecedor?")) return;

    try {
        await fetch(`${API_FORNECEDORES}/${id}`, {
            method: "DELETE"
        });

        carregarFornecedores();

    } catch (error) {
        console.error("Erro ao excluir fornecedor:", error);
    }
}

// ==========================
// LIMPAR
// ==========================
function limparFormulario() {

    document.querySelector("#empresa").value = "";
    document.querySelector("#cnpj").value = "";
    document.querySelector("#cep").value = "";
    document.querySelector("#complemento").value = "";

    fornecedorEditandoId = null;
}

// ==========================
// FILTRO
// ==========================
function filtrar() {

    const texto = document.querySelector("#busca").value.toLowerCase();

    const filtrados = fornecedores.filter(f =>
        f.empresa?.toLowerCase().includes(texto) ||
        f.cnpj?.toLowerCase().includes(texto) ||
        f.cep?.toLowerCase().includes(texto) ||
        f.complemento?.toLowerCase().includes(texto)
    );

    renderTabela(filtrados);
}

// ==========================
// GLOBAIS
// ==========================
window.salvarFornecedor = salvarFornecedor;
window.editarFornecedor = editarFornecedor;
window.excluirFornecedor = excluirFornecedor;
window.filtrar = filtrar;