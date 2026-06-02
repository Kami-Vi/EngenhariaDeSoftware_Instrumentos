// ==========================
// BASE DAS APIs
// ==========================
const API_BASE = "http://localhost:3000";

const API_PRODUTOS = `${API_BASE}/produtos`;
const API_PESSOAS = `${API_BASE}/pessoas`;
const API_VENDAS = `${API_BASE}/vendas`;
const API_FORNECEDORES = `${API_BASE}/fornecedores`;

// ==========================
// VARIÁVEIS GLOBAIS
// ==========================
let vendas = [];
let clientes = [];
let produtos = [];
let carrinho = [];

// ==========================
// INICIALIZAÇÃO
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    carregarProdutos();
    carregarVendas();
});

// ==========================
// CARREGAR CLIENTES
// ==========================
async function carregarClientes() {
    try {
        const res = await fetch(API_PESSOAS);
        const pessoas = await res.json();
        clientes = pessoas.filter(p => p.categoria === "Cliente");

        const select = document.querySelector("#cliente");
        select.innerHTML = `<option value="">Selecione um cliente</option>`;
        clientes.forEach(cliente => {
            select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
        });
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
    }
}

// ==========================
// CARREGAR PRODUTOS
// ==========================
async function carregarProdutos() {
    try {
        const res = await fetch(API_PRODUTOS);
        produtos = await res.json();

        const select = document.querySelector("#produto");
        select.innerHTML = `<option value="">Selecione um produto</option>`;
        produtos.forEach(produto => {
            select.innerHTML += `<option value="${produto.id}" data-preco="${produto.preco}">${produto.nome}</option>`;
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

// ==========================
// ADICIONAR ITEM AO CARRINHO
// ==========================
function adicionarItem() {
    const produtoSelect = document.querySelector("#produto");
    const quantidade = Number(document.querySelector("#quantidade").value);

    if (!produtoSelect.value || quantidade <= 0) {
        alert("Selecione produto e quantidade!");
        return;
    }

    const option = produtoSelect.selectedOptions[0];
    const produto = {
        id: option.value,
        nome: option.textContent,
        preco: Number(option.dataset.preco)
    };

    const subtotal = produto.preco * quantidade;

    carrinho.push({
        produtoId: produto.id,
        produto: produto.nome,
        quantidade,
        subtotal
    });

    renderCarrinho();
}

// ==========================
// RENDERIZAR CARRINHO
// ==========================
function renderCarrinho() {
    const tabela = document.querySelector("#carrinho");
    tabela.innerHTML = `
        <tr>
            <th>Produto</th>
            <th>Qtd</th>
            <th>Total</th>
        </tr>
    `;

    let total = 0;
    carrinho.forEach(item => {
        total += item.subtotal;
        tabela.innerHTML += `
            <tr>
                <td>${item.produto}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${item.subtotal.toFixed(2)}</td>
            </tr>
        `;
    });

    document.querySelector("#total").innerText = `Total: R$ ${total.toFixed(2)}`;
}

// ==========================
// FINALIZAR VENDA
// ==========================
document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const clienteId = document.querySelector("#cliente").value;
    const pagamento = document.querySelector("#categoria").value;
    const data = document.querySelector("input[type='date']").value;

    if (!clienteId || carrinho.length === 0) {
        alert("Preencha os dados!");
        return;
    }

    const cliente = clientes.find(c => String(c.id) === clienteId);
    const total = carrinho.reduce((soma, item) => soma + item.subtotal, 0);

    const venda = {
        clienteId,
        cliente: cliente.nome,
        itens: carrinho,
        total,
        pagamento,
        data
    };

    try {
        await fetch(API_VENDAS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(venda)
        });

        alert("Venda salva!");
        carrinho = [];
        renderCarrinho();
        carregarVendas();
        document.querySelector("form").reset();
    } catch (error) {
        console.error("Erro ao salvar venda:", error);
    }
});

// ==========================
// CARREGAR VENDAS
// ==========================
async function carregarVendas() {
    try {
        const res = await fetch(API_VENDAS);
        vendas = await res.json();
        renderVendas();
    } catch (error) {
        console.error("Erro ao carregar vendas:", error);
    }
}

// ==========================
// RENDER VENDAS
// ==========================
function renderVendas(lista = vendas) {
    const tbody = document.querySelector("#tabela-vendas");
    tbody.innerHTML = "";

    lista.forEach(venda => {
        const itens = Array.isArray(venda.itens) ? venda.itens : [];
        itens.forEach((item, index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${index === 0 ? venda.id : ""}</td>
                    <td>${index === 0 ? (venda.cliente || "") : ""}</td>
                    <td>${item.produto || ""}</td>
                    <td>${item.quantidade || 0}</td>
                    <td>${index === 0 ? (venda.data || "") : ""}</td>
                    <td>${index === 0 ? (venda.pagamento || "") : ""}</td>
                    <td>
                        ${index === 0 ? `
                            <button onclick="editarVenda('${venda.id}')">Editar</button>
                            <button onclick="excluirVenda('${venda.id}')">Excluir</button>
                        ` : ""}
                    </td>
                </tr>
            `;
        });
    });
}

// ==========================
// FILTRAR VENDAS
// ==========================
function filtrarVendas() {
    const texto = document.querySelector("#buscarProduto").value.toLowerCase();
    const data = document.querySelector("#buscarData").value;

    const filtradas = vendas.filter(venda => {
        const dataOk = !data || venda.data === data;
        const itensOk = venda.itens.some(item => item.produto.toLowerCase().includes(texto));
        return dataOk && itensOk;
    });

    renderVendas(filtradas);
}
window.filtrarVendas = filtrarVendas;

// ==========================
// EXCLUIR VENDA
// ==========================
async function excluirVenda(id) {
    if (!confirm("Deseja excluir?")) return;
    try {
        await fetch(`${API_VENDAS}/${id}`, { method: "DELETE" });
        carregarVendas();
    } catch (error) {
        console.error("Erro ao excluir venda:", error);
    }
}
window.excluirVenda = excluirVenda;

// ==========================
// EDITAR VENDA
// ==========================
function editarVenda(id) {
    const venda = vendas.find(v => String(v.id) === String(id));
    if (!venda) return;

    // cliente
    const cliente = clientes.find(c => String(c.id) === String(venda.clienteId));
    document.querySelector("#cliente").value = cliente.id;

    // pagamento e data
    document.querySelector("#categoria").value = venda.pagamento;
    document.querySelector("input[type='date']").value = venda.data;

    // carrinho
    carrinho = venda.itens;
    renderCarrinho();

    // remove venda antiga
    excluirVenda(id);
}
window.editarVenda = editarVenda;

// ==========================
// BOTÕES GLOBAIS
// ==========================
window.adicionarItem = adicionarItem;