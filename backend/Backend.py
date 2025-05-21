from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)
CORS(app)

@app.route("/materiais", methods=["POST"])
def adicionar_material():
    data = request.json

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        INSERT INTO materiais (nome, tipo, fabricante, quantidade, unidade, validade, preco)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data["nome"],
            data["tipo"],
            data["fabricante"],
            data["quantidade"],
            data["unidade"],
            data["validade"],
            data["preco"]
        )

        cursor.execute(query, values)
        conn.commit()

        return jsonify({"message": "Material inserido com sucesso!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)
