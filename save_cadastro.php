<?php
/* save_cadastro.php
   Endpoint responsável por:
   - receber dados POST do formulário de cadastro (JSON)
   - validar e sanitizar dados
   - salvar em um arquivo CSV "cadastros - página1.csv"
   - retornar resposta JSON (sucesso ou erro)
   
   Segurança: valida tipos, trata erros de arquivo e não expõe caminhos internos.
*/

header('Content-Type: application/json; charset=utf-8');

// Apenas POST é aceito
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido. Use POST.']);
    exit;
}

// Lê o JSON enviado pelo cliente
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos ou JSON malformado.']);
    exit;
}

// Valida e extrai campos esperados
$nome = isset($data['nome']) ? trim($data['nome']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$idade = isset($data['idade']) ? intval($data['idade']) : '';
$cpf = isset($data['cpf']) ? trim($data['cpf']) : '';
$cartao_sus = isset($data['cartao_sus']) ? trim($data['cartao_sus']) : '';
$historico_familiar = isset($data['historico_familiar']) ? trim($data['historico_familiar']) : '';

// Valida campos obrigatórios
if (empty($nome) || empty($email) || empty($cpf)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nome, E-mail e CPF são obrigatórios.']);
    exit;
}

// Valida email básico
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'E-mail inválido.']);
    exit;
}

// Valida CPF (11 dígitos)
if (!preg_match('/^[0-9]{11}$/', $cpf)) {
    http_response_code(400);
    echo json_encode(['error' => 'CPF deve ter 11 dígitos.']);
    exit;
}

// Valida idade
if ($idade < 0 || $idade > 150) {
    http_response_code(400);
    echo json_encode(['error' => 'Idade deve estar entre 0 e 150.']);
    exit;
}

// Caminho do arquivo CSV (usar o nome exato do arquivo existente)
$csvFile = __DIR__ . '/Cadastros - Página1.csv';

// Verifica se o arquivo existe e tem permissão de escrita
if (file_exists($csvFile) && !is_writable($csvFile)) {
    http_response_code(500);
    echo json_encode(
        ['error' => 'Arquivo CSV não tem permissão de escrita. Verifique as permissões da pasta.']
    );
    exit;
}

// Verifica se o diretório é gravável
if (!is_writable(__DIR__)) {
    http_response_code(500);
    echo json_encode(
        ['error' => 'Diretório do projeto não tem permissão de escrita.']
    );
    exit;
}

// Verifica se o arquivo existe; se não, cria com cabeçalho
$fileExists = file_exists($csvFile);

try {
    // Abre o arquivo em modo "append" (adiciona ao final)
    $file = fopen($csvFile, 'a');
    
    if (!$file) {
        throw new Exception('Não foi possível abrir o arquivo CSV.');
    }
    
    // Se é a primeira escrita, adiciona cabeçalho
    if (!$fileExists || filesize($csvFile) == 0) {
        $header = ['Nome', 'E-mail', 'Idade', 'CPF', 'Cartão SUS', 'Histórico Familiar', 'Data Cadastro'];
        fputcsv($file, $header, ';');
    }
    
    // Prepara a linha de dados
    $row = [
        $nome,
        $email,
        $idade,
        $cpf,
        $cartao_sus,
        $historico_familiar,
        date('Y-m-d H:i:s') // data e hora do cadastro
    ];
    
    // Escreve a linha no CSV (separador: ponto-e-vírgula)
    if (!fputcsv($file, $row, ';')) {
        throw new Exception('Erro ao escrever dados no arquivo CSV.');
    }
    
    fclose($file);
    
    // Retorna sucesso
    http_response_code(200);
    echo json_encode(
        [
            'success' => true,
            'message' => 'Cadastro realizado com sucesso! Dados salvos em CSV.'
        ]
    );
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(
        ['error' => 'Erro ao salvar cadastro: ' . $e->getMessage()]
    );
}
?>
