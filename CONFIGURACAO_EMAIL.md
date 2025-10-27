# Configuração de Email - Sistema de Laboratório

## Como configurar o envio de emails

### 1. Configurar credenciais no arquivo `backend/email_config.py`

Abra o arquivo `backend/email_config.py` e substitua as seguintes informações:

```python
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'sender_email': 'SEU_EMAIL@gmail.com',  # Substitua pelo seu email
    'sender_password': 'SUA_SENHA_DE_APP',  # Substitua pela senha de app
    'sender_name': 'Sistema de Laboratório'
}
```

### 2. Para Gmail (Recomendado)

#### Passo 1: Ativar verificação em duas etapas
1. Acesse sua conta Google
2. Vá em **Segurança** > **Verificação em duas etapas**
3. Ative a verificação em duas etapas se ainda não estiver ativa

#### Passo 2: Gerar senha de app
1. Ainda na seção **Segurança**, procure por **Senhas de app**
2. Clique em **Gerar senha de app**
3. Selecione **Outro (nome personalizado)** e digite "Sistema Laboratório"
4. Copie a senha gerada (16 caracteres)
5. Cole esta senha no campo `sender_password` do arquivo de configuração

#### Passo 3: Atualizar configurações
```python
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'sender_email': 'seuemail@gmail.com',  # Seu email Gmail
    'sender_password': 'abcd efgh ijkl mnop',  # Senha de app gerada
    'sender_name': 'Sistema de Laboratório'
}
```

### 3. Para outros provedores

#### Outlook/Hotmail
```python
EMAIL_CONFIG = {
    'smtp_server': 'smtp-mail.outlook.com',
    'smtp_port': 587,
    'sender_email': 'seuemail@outlook.com',
    'sender_password': 'suasenha',
    'sender_name': 'Sistema de Laboratório'
}
```

#### Yahoo
```python
EMAIL_CONFIG = {
    'smtp_server': 'smtp.mail.yahoo.com',
    'smtp_port': 587,
    'sender_email': 'seuemail@yahoo.com',
    'sender_password': 'suasenha',
    'sender_name': 'Sistema de Laboratório'
}
```

### 4. Testando a configuração

1. Inicie o backend: `python Backend.py`
2. Acesse a tela "Nova Solicitação" no frontend
3. Preencha o email do fornecedor e a mensagem
4. Clique em "Enviar Mensagem"
5. Verifique se o email foi enviado com sucesso

### 5. Solução de problemas

#### Erro: "Authentication failed"
- Verifique se a senha de app está correta
- Certifique-se de que a verificação em duas etapas está ativa
- Para Gmail, use senha de app, não sua senha normal

#### Erro: "Connection refused"
- Verifique se o servidor SMTP e porta estão corretos
- Verifique sua conexão com a internet
- Alguns provedores podem bloquear conexões SMTP

#### Erro: "SSL/TLS required"
- Certifique-se de que está usando a porta 587 (TLS)
- Para Gmail, não use a porta 465 (SSL)

### 6. Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite suas credenciais reais no Git
- Use senhas de app quando possível
- Mantenha suas credenciais seguras
- Considere usar variáveis de ambiente em produção

### 7. Exemplo de uso

Após configurar, o sistema enviará emails automaticamente quando você:
1. Preencher o formulário de "Nova Solicitação"
2. Inserir o email do fornecedor
3. Escrever a mensagem
4. Clicar em "Enviar Mensagem"

O email será enviado com:
- Assunto: "Solicitação de Material/Equipamento - Sistema de Laboratório"
- Formatação HTML profissional
- Sua mensagem personalizada
- Informações do sistema
