<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['host']) || empty($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Host, usuário e senha são obrigatórios']);
    exit;
}

try {
    // Conectar sem especificar um banco para listar todos
    $pdo = new PDO("mysql:host={$data['host']}", $data['username'], $data['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Listar bancos de dados
    $stmt = $pdo->query('SHOW DATABASES');
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Filtrar bancos padrão do MySQL (opcional)
    $exclude = ['information_schema', 'mysql', 'performance_schema', 'sys'];
    $databases = array_diff($databases, $exclude);
    
    echo json_encode(['databases' => array_values($databases)]);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(['erro' => 'Falha na conexão: ' . $e->getMessage()]);
}
?>