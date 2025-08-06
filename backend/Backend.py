from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)
CORS(app)

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
    data = request.json

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        INSERT INTO materiais (nome, tipo, fabricante, quantidade, unidade, validade, preco, estoque_atual, estoque_minimo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)

        """
        values = (
            data["nome"],
            data["tipo"], 
            data["fabricante"],
            data["quantidade"], 
            data["unidade"], 
            data["validade"], 
            data["preco"],
            data["estoque_atual"], 
            data["estoque_minimo"]
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

        cursor.execute("SELECT * FROM materiais ORDER BY nome ASC")
        materiais = cursor.fetchall()

        return jsonify(materiais), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/materiais/codigo/<codigo>", methods=["GET"])
def buscar_material_por_codigo(codigo):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Busca por código ou nome (para flexibilidade)
        cursor.execute("""
            SELECT * FROM materiais 
            WHERE id = %s OR nome LIKE %s OR fabricante LIKE %s
            ORDER BY nome ASC
        """, (codigo, f"%{codigo}%", f"%{codigo}%"))
        
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




if __name__ == "__main__":
    app.run(debug=True)
