from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from db import get_connection
import csv
import io
from datetime import datetime
import os
import mysql.connector

app = Flask(__name__)
CORS(app)

# Configuração para upload de arquivos
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

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

        cursor.execute("""
            SELECT * FROM materiais 
            WHERE codigo_material = %s OR id = %s OR nome LIKE %s OR fabricante LIKE %s
            ORDER BY nome ASC
        """, (codigo, codigo, f"%{codigo}%", f"%{codigo}%"))

        material = cursor.fetchone()

        if material:
            return jsonify(material), 200
        else:
            return jsonify({"error": "Material não encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
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
            SELECT * FROM materiais
            WHERE validade < CURDATE()
            ORDER BY nome ASC
        """)
        vencidos = cursor.fetchall()

        return jsonify(vencidos), 200

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




if __name__ == "__main__":
    app.run(debug=True)
