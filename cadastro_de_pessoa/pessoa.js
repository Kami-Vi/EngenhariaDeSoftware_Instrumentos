const API_BASE = "http://localhost:3000";
const API_PESSOAS = `${API_BASE}/pessoas`;

let pessoas = [];
let pessoaEditandoId = null;

// ==========================
// INICIAR
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    carregarPessoas();

    document
        .querySelector("#formCadastro")
        .addEventListener("submit", salvarPessoa);

    document
        .querySelector("#buscaNome")
        .addEventListener("keyup", filtrar);

    document
        .querySelector("#buscaCpf")
        .addEventListener("keyup", filtrar);
});

// ==========================
// CARREGAR PESSOAS
// ==========================
async function carregarPessoas() {
    try {
        const res = await fetch(API_PESSOAS);
        pessoas = await res.json();

        renderTabela(pessoas);
    } catch (error) {
        console.error("Erro ao carregar pessoas:", error);
    }
}

// ==========================
// RENDER TABELA
// ==========================
function renderTabela(lista) {

    const tabela = document.querySelector("#tabela");
    tabela.innerHTML = "";

    lista.forEach(pessoa => {

        tabela.innerHTML += `
            <tr>
                <td>${pessoa.nome}</td>
                <td>${pessoa.email}</td>
                <td>${pessoa.cpf}</td>
                <td>${pessoa.telefone}</td>
                <td>${pessoa.categoria}</td>

                <td>
                    <button class="btn-edit" onclick="editarPessoa('${pessoa.id}')">
                        Editar
                    </button>

                    <button class="btn-delete" onclick="excluirPessoa('${pessoa.id}')">
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
async function salvarPessoa(e) {

    e.preventDefault();

    const pessoa = {
        nome: document.querySelector("#nome").value,
        email: document.querySelector("#email").value,
        cpf: document.querySelector("#cpf").value,
        telefone: document.querySelector("#telefone").value,
        categoria: document.querySelector("#categoria").value
    };

    if (!pessoa.nome || !pessoa.email || !pessoa.cpf || !pessoa.telefone || !pessoa.categoria) {
        alert("Preencha todos os campos!");
        return;
    }

    try {

        if (pessoaEditandoId) {

            await fetch(`${API_PESSOAS}/${pessoaEditandoId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pessoa)
            });

            pessoaEditandoId = null;

        } else {

            await fetch(API_PESSOAS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pessoa)
            });
        }

        limparFormulario();
        carregarPessoas();

    } catch (error) {
        console.error("Erro ao salvar pessoa:", error);
    }
}

// ==========================
// EDITAR
// ==========================
function editarPessoa(id) {

    const pessoa = pessoas.find(p => String(p.id) === String(id));
    if (!pessoa) return;

    document.querySelector("#nome").value = pessoa.nome;
    document.querySelector("#email").value = pessoa.email;
    document.querySelector("#cpf").value = pessoa.cpf;
    document.querySelector("#telefone").value = pessoa.telefone;
    document.querySelector("#categoria").value = pessoa.categoria;

    pessoaEditandoId = id;
}

// ==========================
// EXCLUIR
// ==========================
async function excluirPessoa(id) {

    if (!confirm("Deseja excluir este cadastro?")) return;

    try {

        await fetch(`${API_PESSOAS}/${id}`, {
            method: "DELETE"
        });

        carregarPessoas();

    } catch (error) {
        console.error("Erro ao excluir pessoa:", error);
    }
}

// ==========================
// LIMPAR FORM
// ==========================
function limparFormulario() {

    document.querySelector("#nome").value = "";
    document.querySelector("#email").value = "";
    document.querySelector("#cpf").value = "";
    document.querySelector("#telefone").value = "";
    document.querySelector("#categoria").value = "";

    pessoaEditandoId = null;
}

// ==========================
// FILTRO
// ==========================
function filtrar() {

    const nome = document.querySelector("#buscaNome").value.toLowerCase();
    const cpf = document.querySelector("#buscaCpf").value.toLowerCase();

    const filtrados = pessoas.filter(pessoa => {

        const nomeOk = pessoa.nome.toLowerCase().includes(nome);
        const cpfOk = pessoa.cpf.toLowerCase().includes(cpf);

        return nomeOk && cpfOk;
    });

    renderTabela(filtrados);
}

// ==========================
// GLOBAIS
// ==========================
window.editarPessoa = editarPessoa;
window.excluirPessoa = excluirPessoa;