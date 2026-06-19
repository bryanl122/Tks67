"""
Historique des modifications.

Chaque édition réussie est sauvegardée sur disque (image résultat + métadonnées)
dans le dossier `history/`. L'interface peut ensuite lister et réafficher les
éditions précédentes.

Stockage volontairement simple : un fichier PNG par édition + un index JSON.
Tout est local, rien n'est envoyé ailleurs.
"""

from __future__ import annotations

import json
import os
import threading
import time
import uuid

HISTORY_DIR = os.path.join(os.path.dirname(__file__), "history")
INDEX_PATH = os.path.join(HISTORY_DIR, "index.json")
MAX_ENTRIES = 100  # au-delà, les plus anciennes sont supprimées

_lock = threading.Lock()


def _ensure_dir() -> None:
    os.makedirs(HISTORY_DIR, exist_ok=True)


def _read_index() -> list[dict]:
    if not os.path.exists(INDEX_PATH):
        return []
    try:
        with open(INDEX_PATH, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        return []


def _write_index(entries: list[dict]) -> None:
    tmp = INDEX_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(entries, fh, ensure_ascii=False, indent=2)
    os.replace(tmp, INDEX_PATH)


def add_entry(result_png: bytes, instruction: str, params: dict) -> dict:
    """Sauvegarde une édition et renvoie sa métadonnée."""
    with _lock:
        _ensure_dir()
        entry_id = uuid.uuid4().hex
        filename = f"{entry_id}.png"
        with open(os.path.join(HISTORY_DIR, filename), "wb") as fh:
            fh.write(result_png)

        entry = {
            "id": entry_id,
            "file": filename,
            "instruction": instruction,
            "params": params,
            "created_at": time.time(),
        }

        entries = _read_index()
        entries.insert(0, entry)  # plus récent en tête

        # Purge des anciennes au-delà de la limite.
        for old in entries[MAX_ENTRIES:]:
            try:
                os.remove(os.path.join(HISTORY_DIR, old["file"]))
            except OSError:
                pass
        entries = entries[:MAX_ENTRIES]

        _write_index(entries)
        return entry


def list_entries() -> list[dict]:
    with _lock:
        return _read_index()


def get_file_path(entry_id: str) -> str | None:
    """Renvoie le chemin du PNG d'une entrée, en validant l'id (anti-traversal)."""
    if not entry_id or not entry_id.isalnum():
        return None
    with _lock:
        for entry in _read_index():
            if entry["id"] == entry_id:
                path = os.path.join(HISTORY_DIR, entry["file"])
                return path if os.path.exists(path) else None
    return None


def clear() -> None:
    with _lock:
        entries = _read_index()
        for entry in entries:
            try:
                os.remove(os.path.join(HISTORY_DIR, entry["file"]))
            except OSError:
                pass
        _write_index([])
