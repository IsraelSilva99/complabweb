<?php
session_start();
require 'config.php';

// Verificar autenticação
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autorizado']);
    exit;
}

// Função para buscar os exames associados a um atendimento
function getExamesByAtendimento($pdo, $atendimentoId) {
    $stmtExames = $pdo->prepare("
        SELECT e.nome 
        FROM exames e 
        JOIN atendimento_exames ae ON e.id = ae.exame_id 
        WHERE ae.atendimento_id = ?
    ");
    $stmtExames->execute([$atendimentoId]);
    $exames = $stmtExames->fetchAll(PDO::FETCH_COLUMN);
    return $exames ?: []; // Retorna um array vazio se não houver exames
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Cadastro de um novo atendimento
        $data = json_decode(file_get_contents('php://input'), true);

        // Validação dos dados
        if (empty($data['nome']) || empty($data['cpf'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome e CPF são obrigatórios']);
            exit;
        }

        // Gerar o numpac (exemplo: baseado na data atual + ID)
        $dataCadastro = date('dmy'); // Ex.: 250329 para 25/03/29
        $stmt = $pdo->prepare("SELECT MAX(id) as max_id FROM atendimentos");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $nextId = $result['max_id'] + 1;
        $numpac = $dataCadastro . sprintf("%04d", $nextId); // Ex.: 2503290001

        // Inserir o atendimento no banco de dados
        $stmt = $pdo->prepare("
            INSERT INTO atendimentos (
                numpac, convenio, rg, cpf, nome, data_nascimento, sexo, 
                acompanhante, cpf_acompanhante, data_cadastro, medico_id, 
                local_coleta, local_entrega, procedencia, nome_mae, telefone, 
                endereco, bairro, cidade
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $numpac,
            $data['convenio'],
            $data['rg'],
            $data['cpf'],
            $data['nome'],
            $data['dataNascimento'],
            $data['sexo'],
            $data['acompanhante'],
            $data['cpfAcompanhante'],
            $data['dataCadastro'],
            $data['medico'],
            $data['localColeta'],
            $data['localEntrega'],
            $data['procedencia'],
            $data['nomeMae'],
            $data['telefone'],
            $data['endereco'],
            $data['bairro'],
            $data['cidade']
        ]);

        // Obter o ID do atendimento recém-criado
        $atendimentoId = $pdo->lastInsertId();

        // Inserir os exames associados (se houver)
        if (!empty($data['exames'])) {
            $stmtExame = $pdo->prepare("INSERT INTO atendimento_exames (atendimento_id, exame_id) VALUES (?, ?)");
            foreach ($data['exames'] as $exameId) {
                if (!empty($exameId)) {
                    $stmtExame->execute([$atendimentoId, $exameId]);
                }
            }
        }

        // Retornar o número do paciente como um objeto JSON
        echo json_encode(['numpac' => $numpac]);
    } else {
        // Listagem ou detalhes de atendimentos (GET)
        if (isset($_GET['id'])) {
            // Buscar um atendimento específico (para o modal de detalhes)
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
                // Buscar os exames associados
                $atendimento['exames'] = getExamesByAtendimento($pdo, $id);
                echo json_encode($atendimento);
            } else {
                http_response_code(404);
                echo json_encode(['erro' => 'Atendimento não encontrado']);
            }
        } else {
            // Listar todos os atendimentos (para o dashboard)
            $stmt = $pdo->query("
                SELECT a.*, m.nome AS medico_nome, c.nome AS convenio_nome 
                FROM atendimentos a
                LEFT JOIN medicos m ON a.medico_id = m.id
                LEFT JOIN convenios c ON a.convenio = c.id
            ");
            $atendimentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Adicionar os exames a cada atendimento
            foreach ($atendimentos as &$atendimento) {
                $atendimento['exames'] = getExamesByAtendimento($pdo, $atendimento['id']);
            }
            unset($atendimento); // Limpar a referência

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