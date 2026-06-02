const API_URL = "http://localhost:3000/fornecedores";

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

    const res = await fetch(API_URL);
    fornecedores = await res.json();

    renderTabela(fornecedores);
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
                    <button onclick="editarFornecedor('${fornecedor.id}')">
                        Editar
                    </button>

                    <button onclick="excluirFornecedor('${fornecedor.id}')">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });
}

// ==========================
// SALVAR
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

    // EDITAR
    if (fornecedorEditandoId) {

        await fetch(`${API_URL}/${fornecedorEditandoId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fornecedor)
        });

        fornecedorEditandoId = null;
    }

    // CRIAR
    else {

        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fornecedor)
        });
    }

    limparFormulario();
    carregarFornecedores();
}

// ==========================
// EDITAR
// ==========================
function editarFornecedor(id) {

    const fornecedor = fornecedores.find(
        f => String(f.id) === String(id)
    );

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

    if (!confirm("Deseja excluir este fornecedor?")) {
        return;
    }

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    carregarFornecedores();
}

// ==========================
// LIMPAR FORM
// ==========================
function limparFormulario() {

    document.querySelector("#empresa").value = "";
    document.querySelector("#cnpj").value = "";
    document.querySelector("#cep").value = "";
    document.querySelector("#complemento").value = "";
}

// ==========================
// BUSCAR
// ==========================
function filtrar() {

    const texto = document
        .querySelector("#busca")
        .value
        .toLowerCase();

    const filtrados = fornecedores.filter(f =>

        f.empresa?.toLowerCase().includes(texto) ||
        f.cnpj?.toLowerCase().includes(texto) ||
        f.cep?.toLowerCase().includes(texto) ||
        f.complemento?.toLowerCase().includes(texto)
    );

    renderTabela(filtrados);
}

// ==========================
// FUNÇÕES GLOBAIS
// ==========================
window.salvarFornecedor = salvarFornecedor;
window.editarFornecedor = editarFornecedor;
window.excluirFornecedor = excluirFornecedor;
window.filtrar = filtrar;