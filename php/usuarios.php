<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT id, operador FROM usuarios ORDER BY operador");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $operador = $data['operador'];
    $senha = md5($data['senha']); // MD5 para consistência com o login atual

    $stmt = $pdo->prepare("INSERT INTO usuarios (operador, senha) VALUES (?, ?)");
    try {
        $stmt->execute([$operador, $senha]);
        echo json_encode(['message' => 'Usuário cadastrado com sucesso']);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['erro' => 'Erro ao cadastrar usuário: ' . $e->getMessage()]);
    }
}
?>