const API_URL = "http://localhost:3000/fornecedores";

let fornecedores = [];
let fornecedorEditandoId = null;

// ==========================
// INICIAR
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    carregarFornecedores();
});


async function carregarFornecedores() {

    const res = await fetch(API_URL);
    fornecedores = await res.json();

    renderTabela(fornecedores);
}


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

    if (fornecedorEditandoId) {

        await fetch(`${API_URL}/${fornecedorEditandoId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fornecedor)
        });

        fornecedorEditandoId = null;

    } else {

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


async function excluirFornecedor(id) {

    if (!confirm("Deseja excluir este fornecedor?")) {
        return;
    }

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    carregarFornecedores();
}


function limparFormulario() {

    document.querySelector("#empresa").value = "";
    document.querySelector("#cnpj").value = "";
    document.querySelector("#cep").value = "";
    document.querySelector("#complemento").value = "";
}


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


window.salvarFornecedor = salvarFornecedor;
window.editarFornecedor = editarFornecedor;
window.excluirFornecedor = excluirFornecedor;
window.filtrar = filtrar;