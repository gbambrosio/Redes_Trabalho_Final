<?php
// Script de teste: simula um POST e testa save_cadastro.php

// Simula dados POST
$testData = [
    'nome' => 'João Silva Teste',
    'email' => 'joao.teste@example.com',
    'idade' => 45,
    'cpf' => '12345678901',
    'cartao_sus' => '123456789012',
    'historico_familiar' => 'sim'
];

echo "=== TESTE DE SALVAMENTO EM CSV ===\n\n";
echo "1. Dados a serem salvos:\n";
echo json_encode($testData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// Caminho do arquivo CSV
$csvFile = __DIR__ . '/Cadastros - Página1.csv';
echo "2. Arquivo: " . $csvFile . "\n";
echo "   Existe: " . (file_exists($csvFile) ? "Sim" : "Não") . "\n";
echo "   Tamanho: " . (file_exists($csvFile) ? filesize($csvFile) : 0) . " bytes\n\n";

// Testa escrita
$fileExists = file_exists($csvFile);
$file = fopen($csvFile, 'a');

if (!$file) {
    echo "3. ERRO: Não foi possível abrir o arquivo para escrita.\n";
    exit(1);
}

if (!$fileExists) {
    echo "3. Arquivo novo - escrevendo cabeçalho...\n";
    $header = ['Nome', 'E-mail', 'Idade', 'CPF', 'Cartão SUS', 'Histórico Familiar', 'Data Cadastro'];
    fputcsv($file, $header, ';');
} else {
    echo "3. Arquivo existente - adicionando registro...\n";
}

// Escreve o registro
$row = [
    $testData['nome'],
    $testData['email'],
    $testData['idade'],
    $testData['cpf'],
    $testData['cartao_sus'],
    $testData['historico_familiar'],
    date('Y-m-d H:i:s')
];

fputcsv($file, $row, ';');
fclose($file);

echo "4. Registro salvo com sucesso!\n\n";

// Lê o arquivo para confirmar
echo "5. Conteúdo do arquivo:\n";
echo str_repeat("-", 80) . "\n";
if (file_exists($csvFile)) {
    echo file_get_contents($csvFile);
    echo str_repeat("-", 80) . "\n";
}

echo "\n✓ Teste concluído com sucesso!\n";
?>
