const API_BASE = "http://localhost:3000";

const API_PRODUTOS = `${API_BASE}/produtos`;
const API_FORNECEDORES = `${API_BASE}/fornecedores`;

let fornecedores = [];
let produtos = [];
let produtoEditandoId = null;

// ==========================
// INICIAR
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
    await carregarFornecedoresSelect();
    await carregarProdutos();
});

// ==========================
// CARREGAR PRODUTOS
// ==========================
async function carregarProdutos() {
    try {
        const res = await fetch(API_PRODUTOS);
        produtos = await res.json();

        renderTabela(produtos);
        atualizarStats();
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}
function filtrar() {

    const texto = document.querySelector("#busca").value.toLowerCase();

    if (!texto) {
        renderTabela(produtos);
        return;
    }

    const filtrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(texto) ||
        p.marca.toLowerCase().includes(texto) ||
        p.categoria.toLowerCase().includes(texto)
    );

    renderTabela(filtrados);
}
// ==========================
// FORNECEDORES SELECT
// ==========================
async function carregarFornecedoresSelect() {
    try {
        const res = await fetch(API_FORNECEDORES);
        fornecedores = await res.json();

        const select = document.querySelector("#fornecedor");
        select.innerHTML = '<option value="">Selecione o fornecedor</option>';

        fornecedores.forEach(f => {
            const option = document.createElement("option");
            option.value = f.id;
            option.textContent = f.empresa || f.nome || "Fornecedor";
            select.appendChild(option);
        });

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

    lista.forEach(produto => {

        const fornecedorNome =
            fornecedores.find(f => String(f.id) === String(produto.fornecedor))
                ?.empresa ||
            fornecedores.find(f => String(f.id) === String(produto.fornecedor))
                ?.nome ||
            "";

        const quantidadeNum = Number(produto.quantidade) || 0;
        const low = quantidadeNum <= 5; // threshold visual (consistente com vendas.js LOW_STOCK_THRESHOLD)

        tabela.innerHTML += `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.marca}</td>
                <td>
                    ${quantidadeNum}
                    ${low ? `<span class="badge low">Estoque baixo</span>` : ''}
                </td>
                <td>${produto.categoria}</td>
                <td>R$ ${produto.preco || 0}</td>
                <td>${fornecedorNome}</td>
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
// SALVAR PRODUTO
// ==========================
async function salvarProduto() {

    const produto = {
        nome: document.querySelector("#nome").value,
        marca: document.querySelector("#marca").value,
        quantidade: document.querySelector("#quantidade").value,
        categoria: document.querySelector("#categoria").value,
        preco: document.querySelector("#preco").value,
        especificacoes: document.querySelector("#especificacoes").value,
        fornecedor: document.querySelector("#fornecedor").value,
        garantia: document.querySelector("#garantia").value,
        contato: document.querySelector("#contato").value
    };

    if (!produto.nome || !produto.categoria) {
        alert("Preencha nome e categoria!");
        return;
    }

    try {

        if (produtoEditandoId) {

            await fetch(`${API_PRODUTOS}/${produtoEditandoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(produto)
            });

            produtoEditandoId = null;

        } else {

            await fetch(API_PRODUTOS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(produto)
            });
        }

        limparFormulario();
        carregarProdutos();

    } catch (error) {
        console.error("Erro ao salvar produto:", error);
    }
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
    document.querySelector("#preco").value = produto.preco;
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

    try {

        await fetch(`${API_PRODUTOS}/${id}`, {
            method: "DELETE"
        });

        carregarProdutos();

    } catch (error) {
        console.error("Erro ao excluir produto:", error);
    }
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
    document.querySelector("#preco").value = "";
    document.querySelector("#especificacoes").value = "";
    document.querySelector("#fornecedor").value = "";
    document.querySelector("#garantia").value = "";
    document.querySelector("#contato").value = "";
}

// ==========================
// GLOBAIS
// ==========================
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.salvarProduto = salvarProduto;