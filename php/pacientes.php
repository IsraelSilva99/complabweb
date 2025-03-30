<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : 'list';

    if ($action === 'list') {
        $stmt = $pdo->query("SELECT id, numpac, nome, cpf, data_nascimento FROM atendimentos ORDER BY nome");
        $pacientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($pacientes);
    } elseif ($action === 'details' && isset($_GET['id'])) {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("
            SELECT a.*, GROUP_CONCAT(e.nome SEPARATOR ', ') as exames
            FROM atendimentos a
            LEFT JOIN exames_atendimento ea ON a.id = ea.atendimento_id
            LEFT JOIN exames e ON ea.exame_id = e.id
            WHERE a.id = ?
            GROUP BY a.id
        ");
        $stmt->execute([$id]);
        $paciente = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($paciente ?: ['erro' => 'Paciente não encontrado']);
    }
}
?>