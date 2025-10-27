from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from db import get_connection
import csv
import io
from datetime import datetime
import os
import mysql.connector
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email_config import EMAIL_CONFIG

app = Flask(__name__)
CORS(app)

# Configuração para upload de arquivos
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def enviar_email(destinatario, assunto, corpo):
    """
    Função para enviar email usando SMTP
    """
    try:
        # Criar mensagem
        msg = MIMEMultipart()
        msg['From'] = f"{EMAIL_CONFIG['sender_name']} <{EMAIL_CONFIG['sender_email']}>"
        msg['To'] = destinatario
        msg['Subject'] = assunto
        
        # Adicionar corpo do email
        msg.attach(MIMEText(corpo, 'html', 'utf-8'))
        
        # Conectar ao servidor SMTP
        server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
        server.starttls()  # Habilitar criptografia TLS
        server.login(EMAIL_CONFIG['sender_email'], EMAIL_CONFIG['sender_password'])
        
        # Enviar email
        text = msg.as_string()
        server.sendmail(EMAIL_CONFIG['sender_email'], destinatario, text)
        server.quit()
        
        return True, "Email enviado com sucesso!"
        
    except Exception as e:
        return False, f"Erro ao enviar email: {str(e)}"


@app.route("/enviar-solicitacao", methods=["POST"])
def enviar_solicitacao():
    """
    Endpoint para enviar solicitação por email
    """
    try:
        data = request.json
        email_destino = data.get("emailFornecedor")
        mensagem = data.get("mensagem")
        
        if not email_destino or not mensagem:
            return jsonify({"error": "Email destino e mensagem são obrigatórios"}), 400
        
        # Criar assunto e corpo do email
        assunto = "Solicitação de Material/Equipamento - Sistema de Laboratório"
        
        corpo_html = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4ca1af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
                .message {{ background-color: white; padding: 15px; border-left: 4px solid #4ca1af; margin: 15px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Sistema de Laboratório</h2>
                    <p>Solicitação de Material/Equipamento</p>
                </div>
                <div class="content">
                    <p>Prezado(a) Fornecedor,</p>
                    <p>Recebemos uma solicitação através do nosso sistema de gestão de laboratório:</p>
                    
                    <div class="message">
                        <strong>Mensagem:</strong><br>
                        {mensagem.replace('\n', '<br>')}
                    </div>
                    
                    <p>Por favor, entre em contato conosco para mais detalhes sobre esta solicitação.</p>
                    
                    <p>Atenciosamente,<br>
                    <strong>Sistema de Laboratório</strong></p>
                </div>
                <div class="footer">
                    <p>Este é um email automático do sistema. Por favor, não responda diretamente a este email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Enviar email
        sucesso, resultado = enviar_email(email_destino, assunto, corpo_html)
        
        if sucesso:
            return jsonify({"message": resultado}), 200
        else:
            return jsonify({"error": resultado}), 500
            
    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    senha = data.get("senha")

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM usuarios WHERE email = %s AND senha = %s"
        cursor.execute(query, (email, senha))
        user = cursor.fetchone()

        if user:
            return jsonify({
                "id": user["id"],
                "nome": user["nome"],
                "email": user["email"]
            }), 200
        else:
            return jsonify({"error": "Credenciais inválidas"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiais", methods=["POST"])
def adicionar_material():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Verificar se é um formulário multipart (com arquivo)
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Obter dados do formulário
            codigo_material = request.form.get("codigo_material", "")
            nome = request.form.get("nome")
            tipo = request.form.get("tipo")
            fabricante = request.form.get("fabricante")
            quantidade = request.form.get("quantidade")
            unidade = request.form.get("unidade")
            validade = request.form.get("validade")
            preco = request.form.get("preco")
            estoque_atual = request.form.get("estoque_atual")
            estoque_minimo = request.form.get("estoque_minimo")
            
            # Obter arquivo PDF se existir
            arquivo_pdf = None
            if 'arquivo_pdf' in request.files:
                file = request.files['arquivo_pdf']
                if file and file.filename != '':
                    # Validar se é realmente um PDF
                    if file.content_type != 'application/pdf':
                        return jsonify({"error": "Apenas arquivos PDF são permitidos"}), 400
                    
                    # Validar tamanho do arquivo (máximo 16MB)
                    file.seek(0, 2)  # Ir para o final do arquivo
                    file_size = file.tell()
                    file.seek(0)  # Voltar para o início
                    
                    if file_size > 16 * 1024 * 1024:  # 16MB
                        return jsonify({"error": "Arquivo muito grande. Tamanho máximo: 16MB"}), 400
                    
                    try:
                        # Ler o arquivo como bytes
                        arquivo_pdf = file.read()
                        
                        # Validar se o arquivo não está vazio
                        if len(arquivo_pdf) == 0:
                            return jsonify({"error": "Arquivo PDF está vazio"}), 400
                            
                    except Exception as e:
                        return jsonify({"error": f"Erro ao ler arquivo PDF: {str(e)}"}), 400
        else:
            # Dados JSON (sem arquivo)
            data = request.json
            codigo_material = data.get("codigo_material", "")
            nome = data.get("nome")
            tipo = data.get("tipo")
            fabricante = data.get("fabricante")
            quantidade = data.get("quantidade")
            unidade = data.get("unidade")
            validade = data.get("validade")
            preco = data.get("preco")
            estoque_atual = data.get("estoque_atual")
            estoque_minimo = data.get("estoque_minimo")
            arquivo_pdf = None

        query = """
        INSERT INTO materiais (codigo_material, nome, tipo, fabricante, quantidade, unidade, validade, preco, estoque_atual, estoque_minimo, arquivo_pdf)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            codigo_material,
            nome,
            tipo, 
            fabricante,
            quantidade, 
            unidade, 
            validade, 
            preco,
            estoque_atual, 
            estoque_minimo,
            arquivo_pdf
        )

        cursor.execute(query, values)
        conn.commit()

        return jsonify({"message": "Material inserido com sucesso!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiaisList", methods=["GET"])
def listar_materiais():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)  # retorna dados em formato de dicionário

        # Consulta mais específica para evitar problemas com campos nulos
        query = """
            SELECT 
                id, 
                codigo_material, 
                nome, 
                tipo, 
                fabricante, 
                quantidade, 
                unidade, 
                validade, 
                preco, 
                estoque_atual, 
                estoque_minimo,
                CASE 
                    WHEN arquivo_pdf IS NOT NULL THEN 1 
                    ELSE 0 
                END as tem_pdf
            FROM materiais 
            ORDER BY nome ASC
        """
        cursor.execute(query)
        materiais = cursor.fetchall()

        # Converter os dados para garantir compatibilidade
        materiais_processados = []
        for material in materiais:
            try:
                material_processado = {
                    'id': material['id'],
                    'codigo_material': material['codigo_material'] if material['codigo_material'] else '',
                    'nome': material['nome'] if material['nome'] else '',
                    'tipo': material['tipo'] if material['tipo'] else '',
                    'fabricante': material['fabricante'] if material['fabricante'] else '',
                    'quantidade': float(material['quantidade']) if material['quantidade'] else 0,
                    'unidade': material['unidade'] if material['unidade'] else '',
                    'validade': material['validade'].isoformat() if material['validade'] else None,
                    'preco': float(material['preco']) if material['preco'] else 0,
                    'estoque_atual': float(material['estoque_atual']) if material['estoque_atual'] else 0,
                    'estoque_minimo': float(material['estoque_minimo']) if material['estoque_minimo'] else 0,
                    'tem_pdf': bool(material['tem_pdf'])
                }
                materiais_processados.append(material_processado)
            except Exception as e:
                # Continuar processando outros materiais
                continue

        return jsonify(materiais_processados), 200

    except mysql.connector.Error as e:
        return jsonify({"error": f"Erro de conexão com banco de dados: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


@app.route("/materiais/codigo/<codigo>", methods=["GET"])
def buscar_material_por_codigo(codigo):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Primeiro, tenta buscar por código exato
        cursor.execute("""
            SELECT id, codigo_material, nome, tipo, fabricante, quantidade, unidade, 
                   validade, preco, estoque_atual, estoque_minimo,
                   CASE WHEN arquivo_pdf IS NOT NULL THEN 1 ELSE 0 END as tem_pdf
            FROM materiais 
            WHERE codigo_material = %s
        """, (codigo,))
        
        material = cursor.fetchone()

        # Se não encontrou por código exato, busca por nome (case insensitive)
        if not material:
            cursor.execute("""
                SELECT id, codigo_material, nome, tipo, fabricante, quantidade, unidade, 
                       validade, preco, estoque_atual, estoque_minimo,
                       CASE WHEN arquivo_pdf IS NOT NULL THEN 1 ELSE 0 END as tem_pdf
                FROM materiais 
                WHERE LOWER(nome) LIKE LOWER(%s)
                ORDER BY nome ASC
                LIMIT 1
            """, (f"%{codigo}%",))
            material = cursor.fetchone()

        # Se ainda não encontrou, busca por fabricante
        if not material:
            cursor.execute("""
                SELECT id, codigo_material, nome, tipo, fabricante, quantidade, unidade, 
                       validade, preco, estoque_atual, estoque_minimo,
                       CASE WHEN arquivo_pdf IS NOT NULL THEN 1 ELSE 0 END as tem_pdf
                FROM materiais 
                WHERE LOWER(fabricante) LIKE LOWER(%s)
                ORDER BY nome ASC
                LIMIT 1
            """, (f"%{codigo}%",))
            material = cursor.fetchone()

        if material:
            # Converter tipos de dados para garantir serialização JSON
            if material['validade']:
                material['validade'] = material['validade'].isoformat()
            if material['preco'] is not None:
                material['preco'] = float(material['preco'])
            if material['quantidade'] is not None:
                material['quantidade'] = float(material['quantidade'])
            if material['estoque_atual'] is not None:
                material['estoque_atual'] = float(material['estoque_atual'])
            if material['estoque_minimo'] is not None:
                material['estoque_minimo'] = float(material['estoque_minimo'])
            
            return jsonify(material), 200
        else:
            return jsonify({"error": "Material não encontrado"}), 404

    except mysql.connector.Error as e:
        return jsonify({"error": f"Erro de conexão com banco de dados: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


@app.route("/materiais/<int:id>", methods=["GET"])
def buscar_material_por_id(id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Query modificada para não retornar o arquivo_pdf diretamente
        query = """
        SELECT id, codigo_material, nome, tipo, fabricante, quantidade, unidade, 
               validade, preco, estoque_atual, estoque_minimo,
               CASE WHEN arquivo_pdf IS NOT NULL THEN 1 ELSE 0 END as tem_pdf
        FROM materiais WHERE id = %s
        """
        cursor.execute(query, (id,))
        material = cursor.fetchone()

        if material:
            # Converter tipos de dados para garantir serialização JSON
            if material['validade']:
                material['validade'] = material['validade'].isoformat()
            if material['preco'] is not None:
                material['preco'] = float(material['preco'])
            if material['quantidade'] is not None:
                material['quantidade'] = float(material['quantidade'])
            if material['estoque_atual'] is not None:
                material['estoque_atual'] = float(material['estoque_atual'])
            if material['estoque_minimo'] is not None:
                material['estoque_minimo'] = float(material['estoque_minimo'])
            
            return jsonify(material), 200
        else:
            return jsonify({"error": "Material não encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiais/<int:id>", methods=["PUT"])
def atualizar_material(id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Verificar se é um formulário multipart (com arquivo)
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Obter dados do formulário
            codigo_material = request.form.get("codigo_material", "")
            nome = request.form.get("nome")
            tipo = request.form.get("tipo")
            fabricante = request.form.get("fabricante")
            quantidade = request.form.get("quantidade")
            unidade = request.form.get("unidade")
            validade = request.form.get("validade")
            preco = request.form.get("preco")
            estoque_atual = request.form.get("estoque_atual")
            estoque_minimo = request.form.get("estoque_minimo")
            
            # Obter arquivo PDF se existir
            arquivo_pdf = None
            if 'arquivo_pdf' in request.files:
                file = request.files['arquivo_pdf']
                if file and file.filename != '' and file.content_type == 'application/pdf':
                    try:
                        # Ler o arquivo como bytes
                        arquivo_pdf = file.read()
                    except Exception as e:
                        return jsonify({"error": f"Erro ao ler arquivo PDF: {str(e)}"}), 400
        else:
            # Dados JSON (sem arquivo)
            data = request.json
            codigo_material = data.get("codigo_material", "")
            nome = data.get("nome")
            tipo = data.get("tipo")
            fabricante = data.get("fabricante")
            quantidade = data.get("quantidade")
            unidade = data.get("unidade")
            validade = data.get("validade")
            preco = data.get("preco")
            estoque_atual = data.get("estoque_atual")
            estoque_minimo = data.get("estoque_minimo")
            arquivo_pdf = None

        # Se há arquivo PDF, atualizar incluindo o arquivo
        if arquivo_pdf is not None:
            query = """
            UPDATE materiais 
            SET codigo_material = %s, nome = %s, tipo = %s, fabricante = %s, quantidade = %s, unidade = %s, 
                validade = %s, preco = %s, estoque_atual = %s, estoque_minimo = %s, arquivo_pdf = %s
            WHERE id = %s
            """
            values = (
                codigo_material,
                nome,
                tipo, 
                fabricante,
                quantidade, 
                unidade, 
                validade, 
                preco,
                estoque_atual, 
                estoque_minimo,
                arquivo_pdf,
                id
            )
        else:
            # Atualizar sem modificar o arquivo PDF
            query = """
            UPDATE materiais 
            SET codigo_material = %s, nome = %s, tipo = %s, fabricante = %s, quantidade = %s, unidade = %s, 
                validade = %s, preco = %s, estoque_atual = %s, estoque_minimo = %s
            WHERE id = %s
            """
            values = (
                codigo_material,
                nome,
                tipo, 
                fabricante,
                quantidade, 
                unidade, 
                validade, 
                preco,
                estoque_atual, 
                estoque_minimo,
                id
            )

        cursor.execute(query, values)
        conn.commit()

        if cursor.rowcount > 0:
            return jsonify({"message": "Material atualizado com sucesso!"}), 200
        else:
            return jsonify({"error": "Material não encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiais/<int:id>/pdf", methods=["GET"])
def download_pdf(id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT arquivo_pdf FROM materiais WHERE id = %s", (id,))
        result = cursor.fetchone()

        if result and result['arquivo_pdf']:
            # Criar um buffer de memória com o arquivo PDF
            pdf_buffer = io.BytesIO(result['arquivo_pdf'])
            pdf_buffer.seek(0)
            
            return send_file(
                pdf_buffer,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f'fispq_material_{id}.pdf'
            )
        else:
            return jsonify({"error": "Arquivo PDF não encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiais/<int:id>", methods=["DELETE"])
def excluir_material(id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Verifica se o material existe
        cursor.execute("SELECT id FROM materiais WHERE id = %s", (id,))
        if not cursor.fetchone():
            return jsonify({"error": "Material não encontrado"}), 404

        # Exclui o material
        cursor.execute("DELETE FROM materiais WHERE id = %s", (id,))
        conn.commit()

        return jsonify({"message": "Material excluído com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiais/<int:id>/baixa", methods=["PATCH"])
def dar_baixa(id):
    data = request.json
    quantidade_baixa = float(data.get("quantidade"))

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Verifica estoque atual
        cursor.execute("SELECT estoque_atual FROM materiais WHERE id = %s", (id,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Material não encontrado"}), 404

        estoque_atual = float(result[0])
        if quantidade_baixa > estoque_atual:
            return jsonify({"error": "Quantidade insuficiente no estoque"}), 400

        novo_estoque = estoque_atual - quantidade_baixa

        # Atualiza estoque
        cursor.execute("UPDATE materiais SET estoque_atual = %s WHERE id = %s", (novo_estoque, id))
        conn.commit()

        return jsonify({"message": "Baixa realizada com sucesso", "estoque_atual": novo_estoque}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiais/vencidos", methods=["GET"])
def listar_materiais_vencidos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                id,
                nome,
                tipo,
                quantidade,
                unidade,
                validade,
                estoque_atual,
                estoque_minimo,
                preco,
                fabricante
            FROM materiais
            WHERE validade < CURDATE()
            ORDER BY nome ASC
        """)
        vencidos = cursor.fetchall()

        # Converter tipos de dados para garantir serialização JSON
        materiais_serializados = []
        for material in vencidos:
            material_serializado = {}
            for key, value in material.items():
                if isinstance(value, (int, float, str, bool)) or value is None:
                    material_serializado[key] = value
                else:
                    material_serializado[key] = str(value)
            materiais_serializados.append(material_serializado)

        return jsonify(materiais_serializados), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiais/valor-estoque", methods=["GET"])
def calcular_valor_estoque():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                SUM(estoque_atual * preco) as valor_total,
                COUNT(*) as total_materiais,
                AVG(preco) as preco_medio
            FROM materiais
            WHERE estoque_atual > 0
        """)
        
        resultado = cursor.fetchone()
        
        if resultado:
            valor_total = float(resultado['valor_total']) if resultado['valor_total'] else 0
            total_materiais = int(resultado['total_materiais']) if resultado['total_materiais'] else 0
            preco_medio = float(resultado['preco_medio']) if resultado['preco_medio'] else 0
            
            return jsonify({
                "valor_total": valor_total,
                "total_materiais": total_materiais,
                "preco_medio": preco_medio
            }), 200
        else:
            return jsonify({
                "valor_total": 0,
                "total_materiais": 0,
                "preco_medio": 0
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiais/stats", methods=["GET"])
def obter_estatisticas():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) AS total FROM materiais")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS vencidos FROM materiais WHERE validade < CURDATE()")
        vencidos = cursor.fetchone()["vencidos"]

        cursor.execute("""
            SELECT COUNT(*) AS proximos_vencimento FROM materiais 
            WHERE validade >= CURDATE() AND validade <= CURDATE() + INTERVAL 30 DAY
        """)
        proximos_vencimento = cursor.fetchone()["proximos_vencimento"]

        cursor.execute("""
            SELECT COUNT(*) AS estoque_baixo FROM materiais 
            WHERE estoque_atual <= estoque_minimo
        """)
        estoque_baixo = cursor.fetchone()["estoque_baixo"]

        return jsonify({
            "total": total,
            "vencidos": vencidos,
            "proximosVencimento": proximos_vencimento,
            "estoqueBaixo": estoque_baixo
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiais/exportar-csv", methods=["GET"])
def exportar_materiais_csv():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM materiais ORDER BY nome ASC")
        materiais = cursor.fetchall()

        # Criar um buffer de memória para o CSV
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_ALL)

        # Cabeçalho do CSV
        writer.writerow([
            'ID', 'Código do Material', 'Nome', 'Tipo', 'Fabricante', 'Quantidade', 'Unidade', 
            'Validade', 'Preço (R$)', 'Estoque Atual', 'Estoque Mínimo'
        ])

        # Dados dos materiais
        for material in materiais:
            # Formatar data
            data_formatada = material['validade'].strftime('%d/%m/%Y') if material['validade'] else ''
            
            # Formatar preço
            preco_formatado = f"R$ {material['preco']:.2f}".replace('.', ',') if material['preco'] else ''
            
            writer.writerow([
                material['id'],
                material.get('codigo_material', ''),
                material['nome'],
                material['tipo'],
                material['fabricante'],
                material['quantidade'],
                material['unidade'],
                data_formatada,
                preco_formatado,
                material['estoque_atual'],
                material['estoque_minimo']
            ])

        # Configurar o buffer para leitura
        output.seek(0)
        
        # Nome do arquivo com timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'materiais_laboratorio_{timestamp}.csv'

        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8-sig')),  # UTF-8 com BOM para Excel
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# ==================== ROTAS DE EQUIPAMENTOS ====================

@app.route("/equipamentos", methods=["POST"])
def adicionar_equipamento():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        data = request.json
        codigo = data.get("codigo")
        nome = data.get("nome")
        modelo = data.get("modelo")
        fabricante = data.get("fabricante")
        numero_serie = data.get("numero_serie")
        categoria = data.get("categoria")
        localizacao = data.get("localizacao")
        status = data.get("status", "ativo")
        data_aquisicao = data.get("data_aquisicao")
        valor_aquisicao = data.get("valor_aquisicao")
        garantia_ate = data.get("garantia_ate")
        especificacoes_tecnicas = data.get("especificacoes_tecnicas")
        observacoes = data.get("observacoes")

        query = """
        INSERT INTO equipamentos (codigo, nome, modelo, fabricante, numero_serie, categoria, 
                                 localizacao, status, data_aquisicao, valor_aquisicao, 
                                 garantia_ate, especificacoes_tecnicas, observacoes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            codigo, nome, modelo, fabricante, numero_serie, categoria, localizacao, status,
            data_aquisicao, valor_aquisicao, garantia_ate, especificacoes_tecnicas, observacoes
        )

        cursor.execute(query, values)
        conn.commit()

        return jsonify({"message": "Equipamento adicionado com sucesso!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/equipamentos", methods=["GET"])
def listar_equipamentos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT e.*, 
               COUNT(m.id) as total_manutencoes,
               COUNT(CASE WHEN m.status = 'agendada' THEN 1 END) as manutencoes_pendentes
        FROM equipamentos e
        LEFT JOIN manutencoes m ON e.id = m.equipamento_id
        GROUP BY e.id
        ORDER BY e.nome ASC
        """
        cursor.execute(query)
        equipamentos = cursor.fetchall()

        # Converter tipos de dados
        for equipamento in equipamentos:
            if equipamento['data_aquisicao']:
                equipamento['data_aquisicao'] = equipamento['data_aquisicao'].isoformat()
            if equipamento['garantia_ate']:
                equipamento['garantia_ate'] = equipamento['garantia_ate'].isoformat()
            if equipamento['valor_aquisicao']:
                equipamento['valor_aquisicao'] = float(equipamento['valor_aquisicao'])

        return jsonify(equipamentos), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/equipamentos/<int:id>", methods=["GET"])
def buscar_equipamento_por_id(id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM equipamentos WHERE id = %s", (id,))
        equipamento = cursor.fetchone()

        if equipamento:
            # Converter tipos de dados
            if equipamento['data_aquisicao']:
                equipamento['data_aquisicao'] = equipamento['data_aquisicao'].isoformat()
            if equipamento['garantia_ate']:
                equipamento['garantia_ate'] = equipamento['garantia_ate'].isoformat()
            if equipamento['valor_aquisicao']:
                equipamento['valor_aquisicao'] = float(equipamento['valor_aquisicao'])
            
            return jsonify(equipamento), 200
        else:
            return jsonify({"error": "Equipamento não encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/equipamentos/<int:id>", methods=["PUT"])
def atualizar_equipamento(id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        data = request.json
        codigo = data.get("codigo")
        nome = data.get("nome")
        modelo = data.get("modelo")
        fabricante = data.get("fabricante")
        numero_serie = data.get("numero_serie")
        categoria = data.get("categoria")
        localizacao = data.get("localizacao")
        status = data.get("status")
        data_aquisicao = data.get("data_aquisicao")
        valor_aquisicao = data.get("valor_aquisicao")
        garantia_ate = data.get("garantia_ate")
        especificacoes_tecnicas = data.get("especificacoes_tecnicas")
        observacoes = data.get("observacoes")

        query = """
        UPDATE equipamentos 
        SET codigo = %s, nome = %s, modelo = %s, fabricante = %s, numero_serie = %s, 
            categoria = %s, localizacao = %s, status = %s, data_aquisicao = %s, 
            valor_aquisicao = %s, garantia_ate = %s, especificacoes_tecnicas = %s, observacoes = %s
        WHERE id = %s
        """
        values = (
            codigo, nome, modelo, fabricante, numero_serie, categoria, localizacao, status,
            data_aquisicao, valor_aquisicao, garantia_ate, especificacoes_tecnicas, observacoes, id
        )

        cursor.execute(query, values)
        conn.commit()

        if cursor.rowcount > 0:
            return jsonify({"message": "Equipamento atualizado com sucesso!"}), 200
        else:
            return jsonify({"error": "Equipamento não encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/equipamentos/<int:id>", methods=["DELETE"])
def excluir_equipamento(id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Verifica se o equipamento existe
        cursor.execute("SELECT id FROM equipamentos WHERE id = %s", (id,))
        if not cursor.fetchone():
            return jsonify({"error": "Equipamento não encontrado"}), 404

        # Exclui o equipamento
        cursor.execute("DELETE FROM equipamentos WHERE id = %s", (id,))
        conn.commit()

        return jsonify({"message": "Equipamento excluído com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# ==================== ROTAS DE MANUTENÇÕES ====================

@app.route("/manutencoes", methods=["POST"])
def adicionar_manutencao():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        data = request.json
        equipamento_id = data.get("equipamento_id")
        tipo = data.get("tipo")
        descricao = data.get("descricao")
        data_agendada = data.get("data_agendada")
        status = data.get("status", "agendada")
        prioridade = data.get("prioridade", "media")
        responsavel = data.get("responsavel")
        fornecedor = data.get("fornecedor")
        custo = data.get("custo")
        observacoes = data.get("observacoes")

        query = """
        INSERT INTO manutencoes (equipamento_id, tipo, descricao, data_agendada, status, 
                                prioridade, responsavel, fornecedor, custo, observacoes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            equipamento_id, tipo, descricao, data_agendada, status, prioridade,
            responsavel, fornecedor, custo, observacoes
        )

        cursor.execute(query, values)
        manutencao_id = cursor.lastrowid

        # Registrar no histórico
        cursor.execute("""
        INSERT INTO historico_manutencoes (equipamento_id, manutencao_id, tipo_acao, descricao, usuario)
        VALUES (%s, %s, 'criacao', 'Manutenção criada', 'Sistema')
        """, (equipamento_id, manutencao_id))

        conn.commit()

        return jsonify({"message": "Manutenção agendada com sucesso!", "id": manutencao_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/manutencoes", methods=["GET"])
def listar_manutencoes():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT m.*, e.nome as nome_equipamento, e.codigo as codigo_equipamento
        FROM manutencoes m
        JOIN equipamentos e ON m.equipamento_id = e.id
        ORDER BY m.data_agendada ASC
        """
        cursor.execute(query)
        manutencoes = cursor.fetchall()

        # Converter tipos de dados
        for manutencao in manutencoes:
            if manutencao['data_agendada']:
                manutencao['data_agendada'] = manutencao['data_agendada'].isoformat()
            if manutencao['data_realizada']:
                manutencao['data_realizada'] = manutencao['data_realizada'].isoformat()
            if manutencao['custo']:
                manutencao['custo'] = float(manutencao['custo'])

        return jsonify(manutencoes), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/manutencoes/<int:id>", methods=["GET"])
def buscar_manutencao(id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT m.*, e.nome as nome_equipamento, e.codigo as codigo_equipamento
        FROM manutencoes m
        JOIN equipamentos e ON m.equipamento_id = e.id
        WHERE m.id = %s
        """
        cursor.execute(query, (id,))
        manutencao = cursor.fetchone()

        if manutencao:
            # Converter tipos de dados
            if manutencao['data_agendada']:
                manutencao['data_agendada'] = manutencao['data_agendada'].isoformat()
            if manutencao['data_realizada']:
                manutencao['data_realizada'] = manutencao['data_realizada'].isoformat()
            if manutencao['custo']:
                manutencao['custo'] = float(manutencao['custo'])
            
            return jsonify(manutencao), 200
        else:
            return jsonify({"error": "Manutenção não encontrada"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/manutencoes/<int:id>", methods=["PUT"])
def atualizar_manutencao(id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        data = request.json
        tipo = data.get("tipo")
        descricao = data.get("descricao")
        data_agendada = data.get("data_agendada")
        data_realizada = data.get("data_realizada")
        status = data.get("status")
        prioridade = data.get("prioridade")
        responsavel = data.get("responsavel")
        fornecedor = data.get("fornecedor")
        custo = data.get("custo")
        observacoes = data.get("observacoes")

        query = """
        UPDATE manutencoes 
        SET tipo = %s, descricao = %s, data_agendada = %s, data_realizada = %s, status = %s,
            prioridade = %s, responsavel = %s, fornecedor = %s, custo = %s, observacoes = %s
        WHERE id = %s
        """
        values = (
            tipo, descricao, data_agendada, data_realizada, status, prioridade,
            responsavel, fornecedor, custo, observacoes, id
        )

        cursor.execute(query, values)
        conn.commit()

        if cursor.rowcount > 0:
            return jsonify({"message": "Manutenção atualizada com sucesso!"}), 200
        else:
            return jsonify({"error": "Manutenção não encontrada"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/manutencoes/<int:id>/concluir", methods=["PATCH"])
def concluir_manutencao(id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        data = request.json
        data_realizada = data.get("data_realizada", datetime.now().date().isoformat())
        custo = data.get("custo")
        observacoes = data.get("observacoes")

        # Atualizar manutenção
        query = """
        UPDATE manutencoes 
        SET status = 'concluida', data_realizada = %s, custo = %s, observacoes = %s
        WHERE id = %s
        """
        cursor.execute(query, (data_realizada, custo, observacoes, id))

        # Obter equipamento_id para atualizar status
        cursor.execute("SELECT equipamento_id FROM manutencoes WHERE id = %s", (id,))
        result = cursor.fetchone()
        if result:
            equipamento_id = result[0]
            
            # Atualizar status do equipamento para ativo
            cursor.execute("UPDATE equipamentos SET status = 'ativo' WHERE id = %s", (equipamento_id,))

        conn.commit()

        return jsonify({"message": "Manutenção concluída com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/equipamentos/stats", methods=["GET"])
def obter_estatisticas_equipamentos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Total de equipamentos
        cursor.execute("SELECT COUNT(*) AS total FROM equipamentos")
        total = cursor.fetchone()["total"]

        # Equipamentos por status
        cursor.execute("""
            SELECT status, COUNT(*) as quantidade 
            FROM equipamentos 
            GROUP BY status
        """)
        status_stats = cursor.fetchall()

        # Manutenções pendentes
        cursor.execute("""
            SELECT COUNT(*) AS pendentes 
            FROM manutencoes 
            WHERE status IN ('agendada', 'em_andamento')
        """)
        manutencoes_pendentes = cursor.fetchone()["pendentes"]

        # Valor total dos equipamentos
        cursor.execute("""
            SELECT SUM(valor_aquisicao) as valor_total 
            FROM equipamentos 
            WHERE status = 'ativo'
        """)
        valor_total = cursor.fetchone()["valor_total"] or 0

        return jsonify({
            "total": total,
            "status_stats": status_stats,
            "manutencoes_pendentes": manutencoes_pendentes,
            "valor_total": float(valor_total)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()




if __name__ == "__main__":
    app.run(debug=True)
