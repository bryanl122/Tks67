"""
Serveur web d'édition photo par instruction textuelle.

Lance un petit site accessible depuis ton téléphone (sur le même réseau Wi-Fi) :
tu uploades une photo, tu écris la modification souhaitée, l'IA te la renvoie.

Lancement :
    python app.py

Puis depuis ton téléphone, ouvre  http://<IP-DE-TON-PC>:5000
(l'adresse exacte est affichée dans la console au démarrage).
"""

from __future__ import annotations

import socket
import traceback

from flask import Flask, jsonify, render_template, request, send_file
from io import BytesIO

import editor

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024  # 25 Mo max par upload

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/edit", methods=["POST"])
def edit():
    file = request.files.get("image")
    instruction = (request.form.get("instruction") or "").strip()

    if file is None or file.filename == "":
        return jsonify(error="Aucune image envoyée."), 400
    if file.mimetype not in ALLOWED_TYPES:
        return jsonify(error="Format non supporté (JPEG, PNG ou WebP)."), 400
    if not instruction:
        return jsonify(error="Écris la modification souhaitée."), 400

    # Paramètres optionnels (curseurs avancés côté interface).
    def _num(name, default, cast):
        try:
            return cast(request.form.get(name, default))
        except (TypeError, ValueError):
            return default

    steps = max(5, min(_num("steps", 20, int), 50))
    image_guidance = max(1.0, min(_num("image_guidance", 1.5, float), 2.5))
    text_guidance = max(1.0, min(_num("text_guidance", 7.5, float), 15.0))
    seed = request.form.get("seed")
    seed = int(seed) if (seed and seed.strip().lstrip("-").isdigit()) else None

    try:
        result = editor.edit_image(
            file.read(),
            instruction,
            steps=steps,
            image_guidance=image_guidance,
            text_guidance=text_guidance,
            seed=seed,
        )
    except ValueError as exc:
        return jsonify(error=str(exc)), 400
    except Exception:  # noqa: BLE001 - on renvoie une erreur lisible au client
        traceback.print_exc()
        return jsonify(error="Le traitement a échoué côté serveur."), 500

    return send_file(
        BytesIO(result),
        mimetype="image/png",
        as_attachment=False,
        download_name="edited.png",
    )


@app.route("/health")
def health():
    return jsonify(status="ok")


def _local_ip() -> str:
    """Devine l'IP locale du PC pour l'afficher au démarrage."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


if __name__ == "__main__":
    ip = _local_ip()
    print("\n" + "=" * 52)
    print("  Éditeur photo IA démarré")
    print(f"  Sur ce PC      : http://127.0.0.1:5000")
    print(f"  Sur ton tel    : http://{ip}:5000")
    print("  (téléphone et PC sur le même Wi-Fi)")
    print("=" * 52 + "\n")
    app.run(host="0.0.0.0", port=5000, debug=False)
