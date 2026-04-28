<?php
header("Content-Type: application/json");
include "db.php";

$method = $_SERVER['REQUEST_METHOD'];

// ===== LISTAR =====
if ($method == "GET") {

    $sql = "SELECT p.idProdutos,
                   t.Marca,
                   t.Categoria,
                   t.Tipo,
                   t.Especificacoes,
                   f.NomeEmpresa,
                   p.Garantia
            FROM Produtos p
            JOIN TipoProduto t ON p.TipoProduto_idTipoProduto = t.idTipoProduto
            JOIN Fornecedor f ON p.Fornecedor_idFornecedor = f.idFornecedor";

    $res = $conn->query($sql);

    $dados = [];
    while ($row = $res->fetch_assoc()) {
        $dados[] = $row;
    }

    echo json_encode($dados);
}

// ===== INSERIR =====
if ($method == "POST") {

    $data = json_decode(file_get_contents("php://input"), true);

    // 1. Criar TipoProduto
    $stmt = $conn->prepare("INSERT INTO TipoProduto (Marca, Categoria, Tipo, Especificacoes)
                            VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss",
        $data['marca'],
        $data['categoria'],
        $data['tipo'],
        $data['especificacoes']
    );
    $stmt->execute();
    $idTipo = $conn->insert_id;

    // 2. Criar Fornecedor
    $stmt = $conn->prepare("INSERT INTO Fornecedor (NomeEmpresa)
                            VALUES (?)");
    $stmt->bind_param("s", $data['fornecedor']);
    $stmt->execute();
    $idFornecedor = $conn->insert_id;

    // 3. Criar Produto
    $stmt = $conn->prepare("INSERT INTO Produtos
        (Fornecedor_idFornecedor, TipoProduto_idTipoProduto, Garantia)
        VALUES (?, ?, ?)");

    $stmt->bind_param("iis",
        $idFornecedor,
        $idTipo,
        $data['garantia']
    );

    echo json_encode(["sucesso" => $stmt->execute()]);
}

// ===== DELETAR =====
if ($method == "DELETE") {

    $id = $_GET['id'];

    $stmt = $conn->prepare("DELETE FROM Produtos WHERE idProdutos=?");
    $stmt->bind_param("i", $id);

    echo json_encode(["sucesso" => $stmt->execute()]);
}
?>