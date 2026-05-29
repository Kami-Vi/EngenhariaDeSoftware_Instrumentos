
const API_VENDAS = "http://localhost:3000/vendas";
const API_CLIENTES = "http://localhost:3000/clientes";
const API_PRODUTOS = "http://localhost:3000/produtos";

let vendas = [];
let clientes = [];
let produtos = [];

let carrinho = [];

// ==========================
// INICIAR
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

    const res = await fetch(API_CLIENTES);
    clientes = await res.json();

    const select = document.querySelector("#cliente");

    clientes.forEach(cliente => {

        select.innerHTML += `
            <option value="${cliente.id}">
                ${cliente.nome}
            </option>
        `;
    });
}

// ==========================
// CARREGAR PRODUTOS
// ==========================
async function carregarProdutos() {

    const res = await fetch(API_PRODUTOS);
    produtos = await res.json();

    const select = document.querySelector("#produto");

    produtos.forEach(produto => {

        select.innerHTML += `
            <option 
                value="${produto.id}"
                data-preco="${produto.preco}"
            >
                ${produto.nome}
            </option>
        `;
    });
}

// ==========================
// ADICIONAR ITEM
// ==========================
function adicionarItem() {

    const produtoSelect = document.querySelector("#produto");
    const quantidade = Number(document.querySelector("#quantidade").value);

    if (!produtoSelect.value || quantidade <= 0) {

        alert("Selecione produto e quantidade!");
        return;
    }

    const produtoId = produtoSelect.value;

    const produto = produtos.find(p => String(p.id) === produtoId);

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
// RENDER CARRINHO
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

    document.querySelector("#total").innerText =
        `Total: R$ ${total.toFixed(2)}`;
}

// ==========================
// FINALIZAR VENDA
// ==========================
document.querySelector("form")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const clienteId = document.querySelector("#cliente").value;
    const pagamento = document.querySelector("#categoria").value;
    const data = document.querySelector("input[type='date']").value;

    if (!clienteId || carrinho.length === 0) {

        alert("Preencha os dados!");
        return;
    }

    const cliente = clientes.find(c => String(c.id) === clienteId);

    const total = carrinho.reduce((soma, item) => {
        return soma + item.subtotal;
    }, 0);

    const venda = {

        clienteId,
        cliente: cliente.nome,
        itens: carrinho,
        total,
        pagamento,
        data
    };

    await fetch(API_VENDAS, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(venda)
    });

    alert("Venda salva!");

    carrinho = [];

    renderCarrinho();

    carregarVendas();

    document.querySelector("form").reset();

});

// ==========================
// CARREGAR VENDAS
// ==========================
async function carregarVendas() {

    const res = await fetch(API_VENDAS);

    vendas = await res.json();

    renderVendas();
}

// ==========================
// RENDER VENDAS
// ==========================

function renderVendas(lista = vendas) {

    const tbody = document.querySelector("#tabela-vendas");

    tbody.innerHTML = "";

    lista.forEach(venda => {

        venda.itens.forEach(item => {

            tbody.innerHTML += `
                <tr>

                    <td>${venda.id}</td>

                    <td>${venda.cliente}</td>

                    <td>${item.produto}</td>

                    <td>${item.quantidade}</td>

                    <td>${venda.data}</td>

                    <td>${venda.pagamento}</td>

                    <td>

                        <button onclick="editarVenda('${venda.id}')">
                            Editar
                        </button>

                        <button onclick="excluirVenda('${venda.id}')">
                            Excluir
                        </button>

                    </td>

                </tr>
            `;
        });
    });
}


function filtrarVendas() {

    const texto = document
        .querySelector("#buscarProduto")
        .value
        .toLowerCase();

    const data = document
        .querySelector("#buscarData")
        .value;

    const filtradas = vendas
        .map(venda => {

            // filtra itens dentro da venda
            const itensFiltrados = venda.itens.filter(item => {

                return item.produto
                    .toLowerCase()
                    .includes(texto);
            });

            // se não bate data, remove venda inteira
            const dataOk =
                data === "" || venda.data === data;

            if (!dataOk || itensFiltrados.length === 0) {
                return null;
            }

            return {
                ...venda,
                itens: itensFiltrados
            };
        })
        .filter(v => v !== null);

    renderVendas(filtradas);
}




window.filtrarVendas = filtrarVendas;


// ==========================
// EXCLUIR
// ==========================
async function excluirVenda(id) {

    if (!confirm("Deseja excluir?")) return;

    await fetch(`${API_VENDAS}/${id}`, {

        method: "DELETE"
    });

    carregarVendas();
}

function editarVenda(id) {

    const venda = vendas.find(v => String(v.id) === String(id));

    if (!venda) return;

    // cliente
    const cliente = clientes.find(c =>
        String(c.id) === String(venda.clienteId)
    );

    document.querySelector("#cliente").value = cliente.id;

    // pagamento
    document.querySelector("#categoria").value =
        venda.pagamento;

    // data
    document.querySelector("input[type='date']").value =
        venda.data;

    // carrinho
    carrinho = venda.itens;

    renderCarrinho();

    // remove venda antiga
    excluirVenda(id);
}

window.editarVenda = editarVenda;



window.excluirVenda = excluirVenda;
window.adicionarItem = adicionarItem;

