<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT id, nome FROM exames ORDER BY nome");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nome = $data['nome'];

    $stmt = $pdo->prepare("INSERT INTO exames (nome) VALUES (?)");
    try {
        $stmt->execute([$nome]);
        echo json_encode(['message' => 'Exame cadastrado com sucesso']);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['erro' => 'Erro ao cadastrar exame: ' . $e->getMessage()]);
    }
}
?>