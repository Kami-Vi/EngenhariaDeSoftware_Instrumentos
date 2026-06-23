#  Sistema Loja de Instrumentos — CRUD Escolar

> Aplicação web para gerenciamento de uma pequena loja de instrumentos: produtos, fornecedores, pessoas, vendas e mural de avisos. Projetado como material didático para prática de operações CRUD usando um back-end simulado.


##  Sobre o Projeto

O projeto oferece um painel simples onde é possível criar, listar, editar e excluir registros relacionados a uma loja de instrumentos musicais. Foi pensado como recurso pedagógico para disciplinas de desenvolvimento web e engenharia de software, mostrando conceitos de persistência (via `json-server`), validação no front-end e UX básica.

---

##  Tecnologias

- HTML5 / CSS3
- JavaScript (ES6)
- json-server (Node.js) — API REST mock usando `geral.json`

---

##  Funcionalidades (visão geral)

- Produtos: CRUD completo, visualização detalhada (modal), validações de formulário, badge de estoque baixo.
- Fornecedores: CRUD básico.
- Pessoas: cadastro de clientes e funcionários (filtragem por categoria).
- Vendas: carrinho, checagem de estoque, agrupamento de itens por venda na tabela, decremento de estoque automático e confirmação quando o estoque ficar baixo.
- Avisos: mural para publicar/editar/excluir mensagens.

---

##  Como executar (local)

### Pré-requisitos
- Node.js (recomendado v14+)

### 1. Clonar ou baixar o repositório
git clone [https://github.com/Kami-Vi/EngenhariaDeSoftware_Instrumentos.git]

### 2. Iniciar o servidor mock (json-server)

Abra um terminal na raiz do projeto e rode:

```bash
npx json-server --watch geral.json --port 3000
```

O `json-server` expõe rotas como `/produtos`, `/fornecedores`, `/pessoas`, `/vendas` e `/avisos` em `http://localhost:3000`.

### 3. Abrir o front-end

Abra as páginas HTML diretamente no navegador ou use Live Server do VS Code. Exemplos de páginas:

- `index.html` — mural de avisos
- `cadastro_de_produtos/cadastroDeProdutos.html` — CRUD de produtos
- `cadastro_de_vendas/cadastro_de_vendas.html` — cadastro de vendas

---

##  Testes rápidos recomendados

- Criar um produto e verificar inclusão no `geral.json` (via rota `/produtos`).
- Fazer uma venda com múltiplos itens e conferir:
  - itens agrupados na tabela de vendas,
  - decremento de `quantidade` dos produtos (ver `geral.json`),
  - alerta/confirm quando a venda deixa o estoque muito baixo.
- Tentar adicionar ao carrinho uma quantidade maior que o estoque — deve bloquear.
- Validar o formulário de produto: campos obrigatórios e validações de `quantidade`, `preço`, `garantia` e `contato`.

---

## 📝 Observações

- O arquivo `geral.json` funciona como banco de dados local para `json-server`.
- Valores numéricos são serializados como strings no JSON para compatibilidade com a base atual do projeto.
- Limites de alerta (estoque baixo, threshold) estão definidos em `cadastro_de_vendas/vendas.js` e podem ser ajustados.

---

## Estrutura resumida

- `geral.json` — mock DB
- `index.html`, `index.js` — mural de avisos
- `cadastro_de_produtos/` — `cadastroDeProdutos.html`, `products.js`
- `cadastro_de_vendas/` — `cadastro_de_vendas.html`, `vendas.js`
- `cadastro_de_fornecedores/`, `cadastro_de_pessoa/`, `relatorio_de_vendas/` — demais módulos

---

## Autoria
Desenvolvido como material de apoio pedagógico.

**Foram utilzadas as Inteligências Artificiais ChatGPT e Copilot.

Ano: 2026
