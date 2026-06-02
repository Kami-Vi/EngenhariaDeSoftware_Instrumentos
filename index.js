const API_URL = "http://localhost:3000/avisos";
const API_USUARIOS = "http://localhost:3000/usuarios";


let avisos = [];
let usuarios = [];
let avisoEditandoId = null;

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    carregarAvisos();
    carregarUsuarios();
});

// CARREGAR USUÁRIOS
async function carregarUsuarios() {

    const res = await fetch(API_USUARIOS);
    usuarios = await res.json();

    const select = document.querySelector("#autorAviso");

    select.innerHTML = `<option value="">Selecione o funcionário</option>`;

    usuarios.forEach(u => {
        select.innerHTML += `
            <option value="${u.id}">
                ${u.nome}
            </option>
        `;
    });
}

// CARREGAR AVISOS
async function carregarAvisos() {

    const res = await fetch(API_URL);
    avisos = await res.json();

    renderAvisos();
}

// RENDER
function renderAvisos() {

    const lista = document.querySelector("#listaAvisos");

    lista.innerHTML = "";

    avisos.forEach(aviso => {

        const autor = usuarios.find(
            u => String(u.id) === String(aviso.autor)
        )?.nome || "Desconhecido";

        lista.innerHTML += `
            <div class="aviso">

                <span class="data">${aviso.data}</span>

                <h3>${aviso.titulo}</h3>

                <p>${aviso.mensagem}</p>

                <small><strong>Autor:</strong> ${autor}</small>

                <div style="margin-top:10px">

                    <button onclick="editarAviso('${aviso.id}')">Editar</button>
                    <button onclick="excluirAviso('${aviso.id}')">Excluir</button>

                </div>

            </div>
        `;
    });
}

// SALVAR
async function salvarAviso() {

    const aviso = {
        titulo: document.querySelector("#tituloAviso").value,
        mensagem: document.querySelector("#mensagemAviso").value,
        autor: document.querySelector("#autorAviso").value,
        data: new Date().toLocaleDateString("pt-BR")
    };

    if (!aviso.titulo || !aviso.mensagem || !aviso.autor) {
        alert("Preencha todos os campos!");
        return;
    }

    if (avisoEditandoId) {

        await fetch(`${API_URL}/${avisoEditandoId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(aviso)
        });

        avisoEditandoId = null;

    } else {

        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(aviso)
        });
    }

    limparFormulario();
    carregarAvisos();
}

// EDITAR
function editarAviso(id) {

    const aviso = avisos.find(a => String(a.id) === String(id));

    document.querySelector("#tituloAviso").value = aviso.titulo;
    document.querySelector("#mensagemAviso").value = aviso.mensagem;
    document.querySelector("#autorAviso").value = aviso.autor;

    avisoEditandoId = id;
}

// EXCLUIR
async function excluirAviso(id) {

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    carregarAvisos();
}

// LIMPAR
function limparFormulario() {

    document.querySelector("#tituloAviso").value = "";
    document.querySelector("#mensagemAviso").value = "";
    document.querySelector("#autorAviso").value = "";
}

// GLOBAL
window.salvarAviso = salvarAviso;
window.editarAviso = editarAviso;
window.excluirAviso = excluirAviso;