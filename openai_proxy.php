<?php
// openai_proxy.php
// Simples proxy em PHP para chamar a API OpenAI sem expor a chave no client-side.
// Configure sua chave de API como variável de ambiente OPENAI_API_KEY no servidor.

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido. Use POST.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Requisição inválida. Forneça um campo "message" em JSON.']);
    exit;
}

$userMessage = trim($input['message']);
if ($userMessage === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Mensagem vazia não permitida.']);
    exit;
}

$apiKey = getenv('OPENAI_API_KEY');
if (!$apiKey) {
    // Opcional: permitir que o desenvolvedor cole a chave diretamente (não recomendado em produção)
    // $apiKey = 'SUA_CHAVE_AQUI';
    http_response_code(500);
    echo json_encode(['error' => 'Chave da OpenAI não configurada. Defina a variável de ambiente OPENAI_API_KEY no servidor.']);
    exit;
}

$systemPrompt = "Você é um assistente útil e empático. Forneça respostas claras, concisas e baseadas em informações confiáveis sobre Novembro Azul: prevenção do câncer de próstata, exames (PSA, toque retal), sintomas, fatores de risco, orientações básicas e informações para incentivar consulta médica. Não dê diagnóstico médico definitivo — sempre recomende procurar um profissional de saúde.";

$payload = [
    'model' => 'gpt-3.5-turbo',
    'messages' => [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userMessage]
    ],
    'max_tokens' => 512,
    'temperature' => 0.3,
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$result = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === false) {
    $err = curl_error($ch);
    curl_close($ch);
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao conectar OpenAI: ' . $err]);
    exit;
}
curl_close($ch);

$decoded = json_decode($result, true);
if ($httpcode !== 200 || !isset($decoded['choices'][0]['message']['content'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Resposta inválida da OpenAI', 'raw' => $decoded]);
    exit;
}

$reply = trim($decoded['choices'][0]['message']['content']);
echo json_encode(['reply' => $reply]);
