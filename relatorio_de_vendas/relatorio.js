const API_VENDAS = "http://localhost:3000/vendas";

let vendas = [];

document.addEventListener("DOMContentLoaded", carregar);

async function carregar() {
  const res = await fetch(API_VENDAS);
  vendas = await res.json();

  kpis();
  tabela();
  graficos();
}

/* KPIs */
function kpis() {
  let total = 0;
  let itens = 0;
  let produtos = {};

  vendas.forEach(v => {
    total += v.total;

    v.itens.forEach(i => {
      itens += i.quantidade;
      produtos[i.produto] = (produtos[i.produto] || 0) + i.quantidade;
    });
  });

  document.querySelector("#totalVendido").innerText = `R$ ${total.toFixed(2)}`;
  document.querySelector("#totalItens").innerText = itens;
  document.querySelector("#totalVendas").innerText = vendas.length;

  const top = Object.entries(produtos).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-";
  document.querySelector("#topProduto").innerText = top;
}

/* TABELA */
function tabela() {
  const tbody = document.querySelector("#tabelaVendas");
  tbody.innerHTML = "";

  vendas.forEach(v => {
    v.itens.forEach((i, index) => {
      tbody.innerHTML += `
        <tr>
          <td>${index === 0 ? v.data : ""}</td>
          <td>${index === 0 ? v.cliente : ""}</td>
          <td>${i.produto}</td>
          <td>${i.quantidade}</td>
          <td>${index === 0 ? "R$ " + v.total : ""}</td>
          <td>${index === 0 ? v.pagamento : ""}</td>
        </tr>
      `;
    });
  });
}

/* GRÁFICOS */
function graficos() {

  const porData = {};
  const porProduto = {};
  const porPagamento = {};

  vendas.forEach(v => {

    porData[v.data] = (porData[v.data] || 0) + v.total;
    porPagamento[v.pagamento] = (porPagamento[v.pagamento] || 0) + 1;

    v.itens.forEach(i => {
      porProduto[i.produto] = (porProduto[i.produto] || 0) + i.quantidade;
    });

  });

  new Chart(document.getElementById("graficoVendas"), {
    type: "line",
    data: {
      labels: Object.keys(porData),
      datasets: [{
        label: "Vendas",
        data: Object.values(porData),
        borderColor: "#2563eb"
      }]
    }
  });

  new Chart(document.getElementById("graficoProdutos"), {
    type: "bar",
    data: {
      labels: Object.keys(porProduto),
      datasets: [{
        label: "Produtos",
        data: Object.values(porProduto),
        backgroundColor: " rgb(75,0,0)"
      }]
    }
  });

  new Chart(document.getElementById("graficoPagamento"), {
    type: "doughnut",
    data: {
      labels: Object.keys(porPagamento),
      datasets: [{
        data: Object.values(porPagamento),
        backgroundColor: ["#3b82f6","#f97316","#a855f7","#ef4444"]
      }]
    }
  });

}