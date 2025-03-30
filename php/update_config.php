<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['host']) || empty($data['dbname']) || !isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Todos os campos são obrigatórios']);
    exit;
}

// Testar a conexão antes de salvar
try {
    $pdo = new PDO(
        "mysql:host={$data['host']};dbname={$data['dbname']}",
        $data['username'],
        $data['password']
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(['erro' => 'Falha na conexão: ' . $e->getMessage()]);
    exit;
}

// Gerar o novo conteúdo do config.php
$configContent = "<?php\n";
$configContent .= "\$host = '{$data['host']}';\n";
$configContent .= "\$dbname = '{$data['dbname']}';\n";
$configContent .= "\$username = '{$data['username']}';\n";
$configContent .= "\$password = '{$data['password']}';\n";
$configContent .= "try {\n";
$configContent .= "    \$pdo = new PDO(\"mysql:host=\$host;dbname=\$dbname\", \$username, \$password);\n";
$configContent .= "    \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);\n";
$configContent .= "} catch (PDOException \$e) {\n";
$configContent .= "    die(\"Erro de conexão: \" . \$e->getMessage());\n";
$configContent .= "}\n";
$configContent .= "?>";

// Salvar no arquivo
if (file_put_contents('config.php', $configContent) === false) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao salvar o arquivo de configuração']);
    exit;
}

echo json_encode(['mensagem' => 'Configurações salvas com sucesso']);
?>