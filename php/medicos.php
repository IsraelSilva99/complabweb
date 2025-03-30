<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT id, nome, crm, especialidade, telefone, email, data_cadastro, status FROM medicos ORDER BY nome");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nome = $data['nome'];
    $crm = $data['crm'];
    $especialidade = $data['especialidade'] ?? null;
    $telefone = $data['telefone'] ?? null;
    $email = $data['email'] ?? null;

    $stmt = $pdo->prepare("INSERT INTO medicos (nome, crm, especialidade, telefone, email) VALUES (?, ?, ?, ?, ?)");
    try {
        $stmt->execute([$nome, $crm, $especialidade, $telefone, $email]);
        echo json_encode(['message' => 'Médico cadastrado com sucesso']);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['erro' => 'Erro ao cadastrar médico: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'];
    $status = $data['status'];

    if (!in_array($status, ['Ativo', 'Inativo'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Status inválido']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE medicos SET status = ? WHERE id = ?");
    try {
        $stmt->execute([$status, $id]);
        echo json_encode(['message' => 'Status atualizado com sucesso']);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['erro' => 'Erro ao atualizar status: ' . $e->getMessage()]);
    }
}
?>