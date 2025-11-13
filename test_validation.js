/* Teste manual: simula o fluxo de cadastro em JavaScript puro
   Abra este arquivo em um editor e execute o código para testar a lógica de validação.
*/

// Dados de teste 1 (válido)
const testData1 = {
  nome: 'João Silva',
  email: 'joao@example.com',
  idade: '45',
  cpf: '12345678901',
  cartao_sus: '123456789',
  historico_familiar: 'sim'
};

// Dados de teste 2 (inválido - CPF)
const testData2 = {
  nome: 'Maria Santos',
  email: 'maria@example.com',
  idade: '50',
  cpf: '123', // ❌ Inválido
  cartao_sus: '',
  historico_familiar: 'não'
};

// Função de validação (mesma do script_cadastro.js)
function validateFormData(data) {
  const errors = [];

  // Valida campos obrigatórios
  if (!data.nome || !data.email || !data.cpf || !data.idade) {
    errors.push('Por favor, preencha todos os campos obrigatórios.');
  }

  // Valida CPF (11 dígitos)
  if (!/^[0-9]{11}$/.test(data.cpf)) {
    errors.push('CPF deve conter 11 dígitos.');
  }

  // Valida email básico
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('E-mail inválido.');
  }

  // Valida idade
  const idade = parseInt(data.idade);
  if (idade < 0 || idade > 150) {
    errors.push('Idade deve estar entre 0 e 150 anos.');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// Testes
console.log('=== TESTE DE VALIDAÇÃO DE CADASTRO ===\n');

console.log('📝 Teste 1 - Dados Válidos:');
const result1 = validateFormData(testData1);
console.log('Status:', result1.valid ? '✓ VÁLIDO' : '✗ INVÁLIDO');
if (result1.errors.length > 0) {
  console.log('Erros:', result1.errors);
}
console.log('');

console.log('📝 Teste 2 - Dados Inválidos (CPF errado):');
const result2 = validateFormData(testData2);
console.log('Status:', result2.valid ? '✓ VÁLIDO' : '✗ INVÁLIDO');
if (result2.errors.length > 0) {
  console.log('Erros:', result2.errors);
}
console.log('');

console.log('✓ Testes concluídos!');
