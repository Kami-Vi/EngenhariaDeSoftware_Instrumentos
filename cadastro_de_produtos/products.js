const API_URL = "http://localhost:3000/produtos";

let produtos = [];
let produtoEditandoId = null;

// ==========================
// INICIAR
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
});

// ==========================
// CARREGAR
// ==========================
async function carregarProdutos() {
    const res = await fetch(API_URL);
    produtos = await res.json();

    renderTabela(produtos);
    atualizarStats();
}

// ==========================
// RENDER TABELA
// ==========================
function renderTabela(lista) {
    const tabela = document.querySelector("#tabela");

    tabela.innerHTML = "";

    lista.forEach(produto => {

        tabela.innerHTML += `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.marca}</td>
                <td>${produto.categoria}</td>
                <td>${produto.tipo}</td>
                <td>${produto.fornecedor}</td>
                <td>${produto.garantia}</td>

                <td>
                    <button onclick="editarProduto('${produto.id}')">Editar</button>
                    <button onclick="excluirProduto('${produto.id}')">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// ==========================
// SALVAR (CRIAR / EDITAR)
// ==========================
async function salvarProduto() {

    const produto = {
        nome: document.querySelector("#nome").value,
        marca: document.querySelector("#marca").value,
        quantidade: document.querySelector("#quantidade").value,
        categoria: document.querySelector("#categoria").value,
        tipo: document.querySelector("#tipo").value,
        especificacoes: document.querySelector("#especificacoes").value,
        fornecedor: document.querySelector("#fornecedor").value,
        garantia: document.querySelector("#garantia").value,
        contato: document.querySelector("#contato").value
    };

    if (!produto.nome || !produto.categoria) {
        alert("Preencha nome e categoria!");
        return;
    }

    // EDITAR
    if (produtoEditandoId) {

        await fetch(`${API_URL}/${produtoEditandoId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(produto)
        });

        produtoEditandoId = null;

    } 
    // CRIAR
    else {

        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(produto)
        });
    }

    limparFormulario();
    carregarProdutos();
}

// ==========================
// EDITAR
// ==========================
function editarProduto(id) {

    const produto = produtos.find(p => String(p.id) === String(id));

    if (!produto) return;

    document.querySelector("#nome").value = produto.nome;
    document.querySelector("#marca").value = produto.marca;
    document.querySelector("#quantidade").value = produto.quantidade;
    document.querySelector("#categoria").value = produto.categoria;
    document.querySelector("#tipo").value = produto.tipo;
    document.querySelector("#especificacoes").value = produto.especificacoes;
    document.querySelector("#fornecedor").value = produto.fornecedor;
    document.querySelector("#garantia").value = produto.garantia;
    document.querySelector("#contato").value = produto.contato;

    produtoEditandoId = id;
}

// ==========================
// EXCLUIR
// ==========================
async function excluirProduto(id) {

    if (!confirm("Deseja excluir?")) return;

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    carregarProdutos();
}

// ==========================
// STATS
// ==========================
function atualizarStats() {

    document.querySelector("#total").innerText = produtos.length;

    document.querySelector("#instrumentos").innerText =
        produtos.filter(p => p.categoria === "Instrumento").length;

    document.querySelector("#acessorios").innerText =
        produtos.filter(p => p.categoria === "Acessório").length;
}

// ==========================
// LIMPAR FORM
// ==========================
function limparFormulario() {

    document.querySelector("#nome").value = "";
    document.querySelector("#marca").value = "";
    document.querySelector("#quantidade").value = "";
    document.querySelector("#categoria").value = "";
    document.querySelector("#tipo").value = "";
    document.querySelector("#especificacoes").value = "";
    document.querySelector("#fornecedor").value = "";
    document.querySelector("#garantia").value = "";
    document.querySelector("#contato").value = "";
}

// ==========================
// FUNÇÕES GLOBAIS (IMPORTANTE)
// ==========================
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.salvarProduto = salvarProduto;