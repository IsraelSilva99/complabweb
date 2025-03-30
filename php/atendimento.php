<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user'])) {
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode(['erro' => 'Não autorizado']);
    exit;
}

header('Content-Type: application/json');

function getExamesByAtendimento($pdo, $atendimentoId) {
    $stmtExames = $pdo->prepare("
        SELECT e.nome 
        FROM exames e 
        JOIN atendimento_exames ae ON e.id = ae.exame_id 
        WHERE ae.atendimento_id = ?
    ");
    $stmtExames->execute([$atendimentoId]);
    return $stmtExames->fetchAll(PDO::FETCH_COLUMN) ?: [];
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['nome']) || empty($data['cpf'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome e CPF são obrigatórios']);
            exit;
        }
        $dataCadastro = date('dmy');
        $stmt = $pdo->prepare("SELECT MAX(id) as max_id FROM atendimentos");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $nextId = ($result['max_id'] ?? 0) + 1;
        $numpac = $dataCadastro . sprintf("%04d", $nextId);
        $stmt = $pdo->prepare("
            INSERT INTO atendimentos (
                numpac, convenio, rg, cpf, nome, data_nascimento, sexo, 
                acompanhante, cpf_acompanhante, data_cadastro, medico_id, 
                local_coleta, local_entrega, procedencia, nome_mae, telefone, 
                endereco, bairro, cidade
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $numpac, $data['convenio'], $data['rg'], $data['cpf'], $data['nome'],
            $data['dataNascimento'], $data['sexo'], $data['acompanhante'], $data['cpfAcompanhante'],
            $data['dataCadastro'], $data['medico'], $data['localColeta'], $data['localEntrega'],
            $data['procedencia'], $data['nomeMae'], $data['telefone'], $data['endereco'],
            $data['bairro'], $data['cidade']
        ]);
        $atendimentoId = $pdo->lastInsertId();
        if (!empty($data['exames'])) {
            $stmtExame = $pdo->prepare("INSERT INTO atendimento_exames (atendimento_id, exame_id) VALUES (?, ?)");
            foreach ($data['exames'] as $exameId) {
                if (!empty($exameId)) $stmtExame->execute([$atendimentoId, $exameId]);
            }
        }
        echo json_encode(['numpac' => $numpac]);
    } else {
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $pdo->prepare("
                SELECT a.*, m.nome AS medico_nome, c.nome AS convenio_nome 
                FROM atendimentos a
                LEFT JOIN medicos m ON a.medico_id = m.id
                LEFT JOIN convenios c ON a.convenio = c.id
                WHERE a.id = ?
            ");
            $stmt->execute([$id]);
            $atendimento = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($atendimento) {
                $atendimento['exames'] = getExamesByAtendimento($pdo, $id);
                echo json_encode($atendimento);
            } else {
                http_response_code(404);
                echo json_encode(['erro' => 'Atendimento não encontrado']);
            }
        } elseif (isset($_GET['rg']) || isset($_GET['cpf'])) {
            $param = isset($_GET['rg']) ? 'rg' : 'cpf';
            $value = $_GET[$param];
            $stmt = $pdo->prepare("
                SELECT * FROM atendimentos 
                WHERE $param = ? 
                ORDER BY data_cadastro DESC 
                LIMIT 1
            ");
            $stmt->execute([$value]);
            $atendimento = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($atendimento ?: []);
        } else {
            $query = "
                SELECT a.*, m.nome AS medico_nome, c.nome AS convenio_nome 
                FROM atendimentos a
                LEFT JOIN medicos m ON a.medico_id = m.id
                LEFT JOIN convenios c ON a.convenio = c.id
                WHERE 1=1
            ";
            $params = [];
            if (!empty($_GET['search'])) {
                $search = "%" . strtolower($_GET['search']) . "%"; // Converte o termo de busca para minúsculas
                $query .= " AND (LOWER(a.numpac) LIKE ? OR LOWER(a.nome) LIKE ? OR LOWER(a.cpf) LIKE ?)";
                $params[] = $search;
                $params[] = $search;
                $params[] = $search;
            }
            if (!empty($_GET['date_start'])) {
                $query .= " AND a.data_cadastro >= ?";
                $params[] = $_GET['date_start'];
            }
            if (!empty($_GET['date_end'])) {
                $query .= " AND a.data_cadastro <= ?";
                $params[] = $_GET['date_end'];
            }
            if (!empty($_GET['convenio'])) {
                $query .= " AND a.convenio = ?";
                $params[] = $_GET['convenio'];
            }
            $query .= " ORDER BY a.data_cadastro DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $atendimentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($atendimentos as &$atendimento) {
                $atendimento['exames'] = getExamesByAtendimento($pdo, $atendimento['id']);
            }
            unset($atendimento);
            echo json_encode($atendimentos);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao processar atendimentos: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro inesperado: ' . $e->getMessage()]);
}
?>