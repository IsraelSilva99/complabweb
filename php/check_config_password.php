<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Senha é obrigatória']);
    exit;
}

$fixedPassword = 'admin123'; // Senha fixa (pode mudar aqui)

if ($data['password'] === $fixedPassword) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(401);
    echo json_encode(['erro' => 'Senha incorreta']);
}
?>