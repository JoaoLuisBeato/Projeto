# Configurações de Email
# Substitua os valores abaixo pelas suas credenciais reais

EMAIL_CONFIG = {
    # Para Gmail
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    
    # SUAS CREDENCIAIS - SUBSTITUA AQUi
    'sender_email': 'dsmtablets2@gmail.com ',  # Seu email Gmail
    'sender_password': 'dsm-firmenich2025',  # Senha de app do Gmail (não sua senha normal)
    'sender_name': 'Sistema de Laboratório'
}

# INSTRUÇÕES PARA CONFIGURAR O GMAIL:
# 1. Ative a verificação em duas etapas na sua conta Google
# 2. Gere uma "Senha de app" específica para este sistema:
#    - Vá em: Conta Google > Segurança > Senhas de app
#    - Selecione "Outro (nome personalizado)" e digite "Sistema Laboratório"
#    - Copie a senha gerada e cole em 'sender_password' acima
# 3. Substitua 'seu_email@gmail.com' pelo seu email real

# ALTERNATIVAS PARA OUTROS PROVEDORES:
# Outlook/Hotmail:
# 'smtp_server': 'smtp-mail.outlook.com'
# 'smtp_port': 587

# Yahoo:
# 'smtp_server': 'smtp.mail.yahoo.com'
# 'smtp_port': 587

# Empresarial (exemplo):
# 'smtp_server': 'smtp.empresa.com.br'
# 'smtp_port': 587
