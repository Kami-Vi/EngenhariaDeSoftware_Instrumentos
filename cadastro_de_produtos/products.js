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
                    <button onclick="visualizarProduto('${produto.id}')">Visualizar</button>
                    <button
                        class="btn-editar"
                        onclick="editarProduto('${produto.id}')">
                        Editar
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="excluirProduto('${produto.id}')">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });
}

// ==========================
// VISUALIZAR PRODUTO
// ==========================
function visualizarProduto(id) {
    const produto = produtos.find(p => String(p.id) === String(id));
    if (!produto) return;

    const content = document.querySelector('#modalContent');
    content.innerHTML = `
        <p><strong>Nome:</strong> ${produto.nome || ''}</p>
        <p><strong>Marca:</strong> ${produto.marca || ''}</p>
        <p><strong>Quantidade:</strong> ${produto.quantidade || '0'}</p>
        <p><strong>Categoria:</strong> ${produto.categoria || ''}</p>
        <p><strong>Preço:</strong> R$ ${produto.preco || 0}</p>
        <p><strong>Fornecedor:</strong> ${produto.fornecedor || ''}</p>
        <p><strong>Garantia:</strong> ${produto.garantia || ''}</p>
        <p><strong>Contato:</strong> ${produto.contato || ''}</p>
        <p><strong>Especificações:</strong><br>${produto.especificacoes || ''}</p>
    `;

    const modal = document.getElementById('modal-visualizar');
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-visible');
}

// fechar modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-visualizar');
    const close = document.getElementById('modalClose');
    const overlay = document.getElementById('modalOverlay');

    function hide() {
        modal.classList.remove('modal-visible');
        modal.classList.add('modal-hidden');
    }

    close?.addEventListener('click', hide);
    overlay?.addEventListener('click', hide);
});

// ==========================
// SALVAR PRODUTO
// ==========================
async function salvarProduto() {

    // capturar elementos
    const nomeEl = document.querySelector("#nome");
    const marcaEl = document.querySelector("#marca");
    const quantidadeEl = document.querySelector("#quantidade");
    const categoriaEl = document.querySelector("#categoria");
    const precoEl = document.querySelector("#preco");
    const especificacoesEl = document.querySelector("#especificacoes");
    const fornecedorEl = document.querySelector("#fornecedor");
    const garantiaEl = document.querySelector("#garantia");
    const contatoEl = document.querySelector("#contato");

    // remover marcação anterior
    [nomeEl, categoriaEl, quantidadeEl, precoEl].forEach(el => el?.classList.remove('invalid'));

    // validar campos
    const errors = [];
    const nome = nomeEl.value.trim();
    const categoria = categoriaEl.value;
    const quantidadeRaw = quantidadeEl.value;
    const precoRaw = precoEl.value;
    const garantiaRaw = garantiaEl.value.trim();
    const contatoRaw = contatoEl.value.trim();

    if (!nome) {
        errors.push('Nome');
        nomeEl.classList.add('invalid');
    }

    if (!categoria) {
        errors.push('Categoria');
        categoriaEl.classList.add('invalid');
    }

    if (quantidadeRaw === '' || isNaN(Number(quantidadeRaw)) || Number(quantidadeRaw) < 0) {
        errors.push('Quantidade (número >= 0)');
        quantidadeEl.classList.add('invalid');
    }

    if (precoRaw === '' || isNaN(Number(precoRaw)) || Number(precoRaw) < 0) {
        errors.push('Preço (número >= 0)');
        precoEl.classList.add('invalid');
    }

    // validar garantia (inteiro >= 0) e contato (mínimo de dígitos)
    if (garantiaRaw !== '' && (!/^[0-9]+$/.test(garantiaRaw) || Number(garantiaRaw) < 0)) {
        errors.push('Garantia (número inteiro >= 0)');
        garantiaEl.classList.add('invalid');
    }

    const contatoDigits = contatoRaw.replace(/\D/g, '');
    if (contatoRaw === '' || contatoDigits.length < 6 || !/^[0-9+()\-\s]+$/.test(contatoRaw)) {
        errors.push('Contato (número válido com ao menos 6 dígitos)');
        contatoEl.classList.add('invalid');
    }

    if (errors.length) {
        alert('Corrija os campos: ' + errors.join(', '));
        const firstInvalid = document.querySelector('.invalid');
        firstInvalid?.focus();
        return;
    }

    const produto = {
        nome,
        marca: marcaEl.value.trim(),
        quantidade: String(Number(quantidadeRaw)),
        categoria,
        preco: String(Number(precoRaw)),
        especificacoes: especificacoesEl.value.trim(),
        fornecedor: fornecedorEl.value,
        garantia: garantiaEl.value.trim(),
        contato: contatoEl.value.trim()
    };

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
window.visualizarProduto = visualizarProduto;