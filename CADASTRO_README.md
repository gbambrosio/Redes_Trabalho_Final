# Sistema de Cadastro - Documentação de Uso

## ✓ Funcionalidade Implementada: Salvamento em CSV (sem banco de dados)

O sistema salva **todos os dados do cadastro diretamente em um arquivo CSV** (`Cadastros - Página1.csv`) **sem necessidade de banco de dados**.

### Como Funciona

1. **Usuário preenche o formulário** em `cadastro.html`
2. **JavaScript (`script_cadastro.js`)** intercepta o envio e valida os dados localmente
3. **Dados são enviados via AJAX** para `save_cadastro.php` (formato JSON)
4. **PHP valida, sanitiza e salva** em `Cadastros - Página1.csv`
5. **Resposta JSON** é exibida ao usuário (sucesso ou erro)
6. **Arquivo CSV** é atualizado automaticamente

### Como Rodar Localmente

#### Opção 1: Servidor PHP Embutido (Recomendado)
```bash
cd c:\Users\LabInfo\Desktop\Trabalho_Final-main
php -S localhost:8000
```

Depois abra no navegador:
```
http://localhost:8000/cadastro.html
```

#### Opção 2: XAMPP / Apache com PHP
- Coloque a pasta em `C:\xampp\htdocs\Trabalho_Final-main` (ou equivalente)
- Acesse `http://localhost/Trabalho_Final-main/cadastro.html`

### Testar o Cadastro

1. Abra `cadastro.html`
2. Preencha o formulário:
   - **Nome**: João Silva
   - **E-mail**: joao@example.com
   - **Idade**: 45
   - **CPF**: 12345678901
   - **Cartão SUS**: 123456789 (opcional)
   - **Histórico Familiar**: Sim / Não

3. Clique **"Enviar Inscrição"**
4. Você verá uma mensagem:
   - 🟢 **Verde** = Sucesso! Dados salvos em `Cadastros - Página1.csv`
   - 🔴 **Vermelha** = Erro (verifique as validações)

### Visualizar Dados Salvos

O arquivo `Cadastros - Página1.csv` será criado/atualizado no mesmo diretório que `save_cadastro.php`.

**Formato do CSV:**
```
Nome;E-mail;Idade;CPF;Cartão SUS;Histórico Familiar;Data Cadastro
João Silva;joao@example.com;45;12345678901;123456789;sim;2025-11-12 10:30:45
Maria Santos;maria@example.com;50;98765432109;;não;2025-11-12 11:15:30
```

### Validações Implementadas

#### Cliente (JavaScript)
- ✓ Campos obrigatórios (nome, email, CPF, idade)
- ✓ CPF: 11 dígitos numéricos
- ✓ Email: formato válido
- ✓ Idade: 0-150 anos

#### Servidor (PHP)
- ✓ Verificação de dados inválidos/JSON malformado
- ✓ Revalidação de todos os campos (segurança)
- ✓ Verificação de permissões de arquivo/diretório
- ✓ Tratamento de exceções

### Acessibilidade

- ✓ Mensagens de sucesso/erro com `aria-live` (leitores de tela)
- ✓ Campos com `autocomplete`, `inputmode`, `pattern`, `aria-describedby`
- ✓ Navegação por teclado (Tab, Enter, Space)
- ✓ Controles de acessibilidade (aumentar/diminuir fonte, daltonismo, dislexia)

### Troubleshooting

**Problema:** "Diretório não tem permissão de escrita"
- **Solução:** Certifique-se que a pasta tem permissões 755+ ou que você tem write-permission

**Problema:** Arquivo CSV não criado
- **Solução:** Verifique que `Cadastros - Página1.csv` existe ou que a pasta permite criar arquivos

**Problema:** AJAX retorna erro de CORS
- **Solução:** Rode um servidor local (PHP ou Node) — não abra HTML direto via `file://`

### Próximas Melhorias (Opcional)

- [ ] Integrar com banco de dados (MySQL, PostgreSQL)
- [ ] Painel de visualização/relatório dos cadastros
- [ ] Exportar dados em PDF/Excel
- [ ] Integração com email (enviar confirmação)
- [ ] Autenticação/LGPD (consentimento)

---

**Status:** ✓ Funcional - Salva dados em CSV sem banco de dados
