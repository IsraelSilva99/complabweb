<?php
session_start();
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $operador = $data['operador'];
    $senha = md5($data['senha']); // Usando MD5 para compatibilidade com o exemplo

    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE operador = ? AND senha = ?");
    $stmt->execute([$operador, $senha]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $_SESSION['user'] = $operador;
        echo json_encode(['token' => 'fake-jwt-token']); // Token simulado
    } else {
        http_response_code(401);
        echo json_encode(['erro' => 'Credenciais inválidas']);
    }
}
?>