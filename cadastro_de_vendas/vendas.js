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
let vendaEditandoId = null;
const LOW_STOCK_THRESHOLD = 5; // alerta quando quantidade ficar igual ou abaixo deste valor

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

    // checar estoque disponível
    const produtoObj = produtos.find(p => String(p.id) === String(produto.id));
    const estoqueAtual = Number(produtoObj?.quantidade) || 0;

    if (estoqueAtual <= 0) {
        alert(`Produto sem estoque (disponível: ${estoqueAtual}). Não é possível adicionar.`);
        return;
    }

    if (quantidade > estoqueAtual) {
        alert(`Quantidade solicitada maior que o estoque disponível (${estoqueAtual}).`);
        return;
    }

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

    // validações de estoque antes de salvar
    const insuficientes = [];
    const lowAfter = [];

    for (const item of carrinho) {
        const prod = produtos.find(p => String(p.id) === String(item.produtoId));
        const atual = Number(prod?.quantidade) || 0;
        const vendido = Number(item.quantidade) || 0;

        if (vendido > atual) {
            insuficientes.push(`${prod ? prod.nome : item.produto} (disponível: ${atual})`);
        }

        const novo = atual - vendido;
        if (novo < 2) {
            lowAfter.push(`${prod ? prod.nome : item.produto} (disponível: ${atual} → restarão ${novo})`);
        }
    }

    if (insuficientes.length) {
        alert('Não é possível concluir a venda. Estoque insuficiente para: \n' + insuficientes.join('\n'));
        return;
    }

    if (lowAfter.length) {
        const ok = confirm('Atenção — os seguintes produtos ficarão com estoque baixo (<=1) após a venda:\n' + lowAfter.join('\n') + '\n\nDeseja continuar?');
        if (!ok) return;
    }

    try {
        if (vendaEditandoId) {
            // atualizar venda existente
            await fetch(`${API_VENDAS}/${vendaEditandoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(venda)
            });
            vendaEditandoId = null;
        } else {
            await fetch(API_VENDAS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(venda)
            });
        }

        alert("Venda salva!");
        // atualizar estoque dos produtos vendidos
        await atualizarEstoque(venda.itens);

        carrinho = [];
        renderCarrinho();
        await carregarVendas();
        document.querySelector("form").reset();
    } catch (error) {
        console.error("Erro ao salvar venda:", error);
    }
});

// ==========================
// ATUALIZAR ESTOQUE
// ==========================
async function atualizarEstoque(itens) {
    if (!Array.isArray(itens)) return;

    const lowStock = [];

    for (const item of itens) {
        try {
            const produto = produtos.find(p => String(p.id) === String(item.produtoId));
            if (!produto) continue;

            const atual = Number(produto.quantidade) || 0;
            const vendido = Number(item.quantidade) || 0;
            let novo = atual - vendido;
            if (novo < 0) novo = 0;

            // enviar PATCH para atualizar quantidade
            await fetch(`${API_PRODUTOS}/${produto.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantidade: String(novo) })
            });

            // atualizar localmente para evitar leituras antigas
            produto.quantidade = String(novo);

            if (novo <= LOW_STOCK_THRESHOLD) {
                lowStock.push(`${produto.nome} (restam ${novo})`);
            }

        } catch (err) {
            console.error('Erro ao atualizar estoque do produto', item.produtoId, err);
        }
    }

    // recarregar produtos para refletir mudanças na UI
    await carregarProdutos();

    if (lowStock.length) {
        alert('Atenção - estoque baixo para: \n' + lowStock.join('\n'));
    }
}

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
        const itens = Array.isArray(venda.itens) && venda.itens.length ? venda.itens : [{ produto: '', quantidade: 0 }];
        const rowspan = itens.length;

        itens.forEach((item, index) => {
            tbody.innerHTML += `
                <tr>
                    ${index === 0 ? `<td rowspan="${rowspan}">${venda.id || ''}</td>` : ''}
                    ${index === 0 ? `<td rowspan="${rowspan}">${venda.cliente || ''}</td>` : ''}
                    <td>${item.produto || ''}</td>
                    <td>${item.quantidade || 0}</td>
                    ${index === 0 ? `<td rowspan="${rowspan}">${venda.data || ''}</td>` : ''}
                    ${index === 0 ? `<td rowspan="${rowspan}">${venda.pagamento || ''}</td>` : ''}
                    ${index === 0 ? `<td rowspan="${rowspan}">
                            <button onclick="editarVenda('${venda.id}')">Editar</button>
                            <button onclick="excluirVenda('${venda.id}')">Excluir</button>
                        </td>` : ''}
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
    // marca que estamos editando esta venda (não excluir imediatamente)
    vendaEditandoId = id;
}
window.editarVenda = editarVenda;

// ==========================
// BOTÕES GLOBAIS
// ==========================
window.adicionarItem = adicionarItem;