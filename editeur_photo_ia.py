"""
Éditeur photo IA — FICHIER UNIQUE AUTONOME.

Tout est ici : serveur web + interface (style Grok) + moteur d'édition par
instruction (InstructPix2Pix) + historique. Pose ce fichier où tu veux
(ex. C:\\Users\\bryan\\Desktop\\gm jeux) puis lance-le :

    pip install flask pillow torch diffusers transformers accelerate safetensors
    python editeur_photo_ia.py

Ouvre ensuite l'adresse affichée dans la console depuis ton téléphone
(téléphone et PC sur le même Wi-Fi).
"""

from __future__ import annotations

import base64
import json
import os
import socket
import threading
import time
import traceback
import uuid
from io import BytesIO

from flask import Flask, Response, jsonify, request, send_file
from PIL import Image, ImageOps

# ===================== Réglages =====================
MODEL_ID = "timbrooks/instruct-pix2pix"
MAX_SIDE = 768
PORT = 5000

# Filtre NSFW intégré au modèle. Mis à False ici (usage perso, local, mono-utilisateur).
# Tu restes responsable de l'usage : pas de contenu intime non consenti sur des
# personnes réelles, jamais de contenu impliquant des mineurs.
SAFETY_CHECKER = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HISTORY_DIR = os.path.join(BASE_DIR, "history")
INDEX_PATH = os.path.join(HISTORY_DIR, "index.json")
MAX_ENTRIES = 100

# ===================== Interface (HTML embarqué) =====================
_HTML_B64 = (
    "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImZyIj4KPGhlYWQ+CiAgPG1ldGEgY2hhcnNldD0iVVRGLTgiIC8+CiAgPG1ldGEg"
    "bmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLCBtYXhpbXVtLXNjYWxl"
    "PTEsIHZpZXdwb3J0LWZpdD1jb3ZlciIgLz4KICA8dGl0bGU+w4lkaXRldXIgcGhvdG8gSUE8L3RpdGxlPgogIDxzdHlsZT4KICAg"
    "IDpyb290IHsKICAgICAgLS1iZzogIzAwMDsgLS1wYW5lbDogIzEyMTIxMjsgLS1wYW5lbC0yOiAjMWMxYzFlOyAtLWJvcmRlcjog"
    "IzJhMmEyYzsKICAgICAgLS10ZXh0OiAjZmZmOyAtLW11dGVkOiAjOGU4ZTkzOyAtLWJsdWU6ICMyZjZiZmY7IC0tYmx1ZS0yOiAj"
    "NGY4NmZmOwogICAgfQogICAgKiB7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjog"
    "dHJhbnNwYXJlbnQ7IH0KICAgIGh0bWwsIGJvZHkgeyBoZWlnaHQ6IDEwMCU7IG1hcmdpbjogMDsgfQogICAgYm9keSB7CiAgICAg"
    "IGJhY2tncm91bmQ6IHZhcigtLWJnKTsgY29sb3I6IHZhcigtLXRleHQpOwogICAgICBmb250LWZhbWlseTogLWFwcGxlLXN5c3Rl"
    "bSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAiU2Vnb2UgVUkiLCBSb2JvdG8sIHNhbnMtc2VyaWY7CiAgICAgIGRpc3BsYXk6IGZsZXg7"
    "IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IG92ZXJmbG93OiBoaWRkZW47CiAgICB9CgogICAgLyogVG9wIGJhciAqLwogICAgLnRv"
    "cGJhciB7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjsg"
    "cGFkZGluZzogMTRweCAxNnB4IDEwcHg7IH0KICAgIC5pY29uLWJ0biB7CiAgICAgIHdpZHRoOiAzOHB4OyBoZWlnaHQ6IDM4cHg7"
    "IGJvcmRlci1yYWRpdXM6IDUwJTsgYmFja2dyb3VuZDogdmFyKC0tcGFuZWwtMik7CiAgICAgIGJvcmRlcjogbm9uZTsgY29sb3I6"
    "IHZhcigtLXRleHQpOyBmb250LXNpemU6IDE3cHg7CiAgICAgIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1"
    "c3RpZnktY29udGVudDogY2VudGVyOyBjdXJzb3I6IHBvaW50ZXI7CiAgICB9CiAgICAudG9nZ2xlIHsgZGlzcGxheTogZmxleDsg"
    "YmFja2dyb3VuZDogdmFyKC0tcGFuZWwtMik7IGJvcmRlci1yYWRpdXM6IDIycHg7IHBhZGRpbmc6IDRweDsgfQogICAgLnRvZ2ds"
    "ZSBzcGFuIHsgcGFkZGluZzogN3B4IDIwcHg7IGJvcmRlci1yYWRpdXM6IDE4cHg7IGZvbnQtc2l6ZTogMTVweDsgY29sb3I6IHZh"
    "cigtLW11dGVkKTsgY3Vyc29yOiBwb2ludGVyOyB9CiAgICAudG9nZ2xlIHNwYW4uYWN0aXZlIHsgYmFja2dyb3VuZDogIzNhM2Ez"
    "YzsgY29sb3I6IHZhcigtLXRleHQpOyB9CgogICAgLyogTWFpbiAqLwogICAgLm1haW4geyBmbGV4OiAxOyBwb3NpdGlvbjogcmVs"
    "YXRpdmU7IG92ZXJmbG93LXk6IGF1dG87IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVu"
    "dDogY2VudGVyOyBwYWRkaW5nOiAxNnB4OyB9CiAgICAubG9nbyB7IHdpZHRoOiA5MHB4OyBoZWlnaHQ6IDkwcHg7IG9wYWNpdHk6"
    "IC4xODsgfQogICAgLnN0YWdlIHsgd2lkdGg6IDEwMCU7IG1heC13aWR0aDogNTIwcHg7IGRpc3BsYXk6IG5vbmU7IH0KICAgIC5z"
    "dGFnZS5zaG93IHsgZGlzcGxheTogYmxvY2s7IH0KICAgIC5zdGFnZSBpbWcgeyB3aWR0aDogMTAwJTsgYm9yZGVyLXJhZGl1czog"
    "MTZweDsgZGlzcGxheTogYmxvY2s7IH0KICAgIC5zdGFnZSAuY2FwIHsgY29sb3I6IHZhcigtLW11dGVkKTsgZm9udC1zaXplOiAx"
    "M3B4OyBtYXJnaW46IDEwcHggMnB4OyB9CiAgICAuc3RhZ2UgYS5kbCB7IGRpc3BsYXk6IGlubGluZS1ibG9jazsgY29sb3I6IHZh"
    "cigtLWJsdWUtMik7IHRleHQtZGVjb3JhdGlvbjogbm9uZTsgZm9udC13ZWlnaHQ6IDYwMDsgZm9udC1zaXplOiAxNHB4OyB9CiAg"
    "ICAuc3Bpbm5lciB7IHdpZHRoOiAxOHB4OyBoZWlnaHQ6IDE4cHg7IGJvcmRlcjogMnB4IHNvbGlkICMzYTNhM2M7IGJvcmRlci10"
    "b3AtY29sb3I6IHZhcigtLWJsdWUtMik7CiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTsgYW5pbWF0aW9uOiBzcGluIC44cyBsaW5l"
    "YXIgaW5maW5pdGU7IGRpc3BsYXk6IGlubGluZS1ibG9jazsgdmVydGljYWwtYWxpZ246IC0zcHg7IG1hcmdpbi1yaWdodDogOHB4"
    "OyB9CiAgICBAa2V5ZnJhbWVzIHNwaW4geyB0byB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH0gfQoKICAgIC8qIERvY2sg"
    "Ki8KICAgIC5kb2NrIHsgcGFkZGluZzogOHB4IDEycHggY2FsYygxMnB4ICsgZW52KHNhZmUtYXJlYS1pbnNldC1ib3R0b20pKTsg"
    "fQogICAgLmFjdGlvbnMgeyBkaXNwbGF5OiBmbGV4OyBnYXA6IDEwcHg7IG1hcmdpbi1ib3R0b206IDEwcHg7IH0KICAgIC5waWxs"
    "IHsKICAgICAgZmxleDogMTsgYmFja2dyb3VuZDogdmFyKC0tcGFuZWwpOyBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXIp"
    "OyBjb2xvcjogdmFyKC0tdGV4dCk7CiAgICAgIGJvcmRlci1yYWRpdXM6IDE2cHg7IHBhZGRpbmc6IDEycHg7IGRpc3BsYXk6IGZs"
    "ZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBnYXA6IDhweDsKICAgICAgZm9udC1zaXpl"
    "OiAxNHB4OyBjdXJzb3I6IHBvaW50ZXI7CiAgICB9CiAgICAucGlsbC5hdHRhY2hlZCB7IGJvcmRlci1jb2xvcjogdmFyKC0tYmx1"
    "ZSk7IGNvbG9yOiB2YXIoLS1ibHVlLTIpOyB9CiAgICAuY29tcG9zZXIgeyBiYWNrZ3JvdW5kOiB2YXIoLS1wYW5lbCk7IGJvcmRl"
    "cjogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7IGJvcmRlci1yYWRpdXM6IDI0cHg7CiAgICAgIHBhZGRpbmc6IDZweCA2cHggNnB4"
    "IDE0cHg7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogOHB4OyB9CiAgICAuY29tcG9zZXIgLnBsdXMg"
    "eyB3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGJhY2tncm91bmQ6IHZhcigtLXBhbmVsLTIp"
    "OwogICAgICBib3JkZXI6IG5vbmU7IGNvbG9yOiB2YXIoLS10ZXh0KTsgZm9udC1zaXplOiAyMHB4OyBjdXJzb3I6IHBvaW50ZXI7"
    "IGZsZXg6IG5vbmU7IH0KICAgIC5jb21wb3NlciBpbnB1dFt0eXBlPXRleHRdIHsgZmxleDogMTsgYmFja2dyb3VuZDogdHJhbnNw"
    "YXJlbnQ7IGJvcmRlcjogbm9uZTsgb3V0bGluZTogbm9uZTsKICAgICAgY29sb3I6IHZhcigtLXRleHQpOyBmb250LXNpemU6IDE2"
    "cHg7IHBhZGRpbmc6IDZweCAwOyB9CiAgICAuY29tcG9zZXIgaW5wdXQ6OnBsYWNlaG9sZGVyIHsgY29sb3I6IHZhcigtLW11dGVk"
    "KTsgfQogICAgLnJhcGlkZSB7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNXB4OyBiYWNrZ3JvdW5k"
    "OiB2YXIoLS1wYW5lbC0yKTsgY29sb3I6IHZhcigtLW11dGVkKTsKICAgICAgYm9yZGVyLXJhZGl1czogMTZweDsgcGFkZGluZzog"
    "NnB4IDEwcHg7IGZvbnQtc2l6ZTogMTNweDsgZmxleDogbm9uZTsgfQogICAgLm1pYyB7IHdpZHRoOiAzNHB4OyBoZWlnaHQ6IDM0"
    "cHg7IGJvcmRlci1yYWRpdXM6IDUwJTsgYmFja2dyb3VuZDogdmFyKC0tcGFuZWwtMik7IGJvcmRlcjogbm9uZTsKICAgICAgY29s"
    "b3I6IHZhcigtLXRleHQpOyBmb250LXNpemU6IDE2cHg7IGZsZXg6IG5vbmU7IGN1cnNvcjogcG9pbnRlcjsgfQogICAgLnBhcmxl"
    "ciB7IGJhY2tncm91bmQ6ICNmZmY7IGNvbG9yOiAjMDAwOyBib3JkZXI6IG5vbmU7IGJvcmRlci1yYWRpdXM6IDIwcHg7IHBhZGRp"
    "bmc6IDlweCAxNnB4OwogICAgICBmb250LXNpemU6IDE0cHg7IGZvbnQtd2VpZ2h0OiA2MDA7IGZsZXg6IG5vbmU7IGN1cnNvcjog"
    "cG9pbnRlcjsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA2cHg7IH0KICAgIC5zZW5kIHsgd2lkdGg6"
    "IDM4cHg7IGhlaWdodDogMzhweDsgYm9yZGVyLXJhZGl1czogNTAlOyBmbGV4OiBub25lOyBiYWNrZ3JvdW5kOiAjM2EzYTNjOyBi"
    "b3JkZXI6IG5vbmU7CiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0KTsgZm9udC1zaXplOiAxOHB4OyBjdXJzb3I6IHBvaW50ZXI7IGRp"
    "c3BsYXk6IG5vbmU7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyB9CiAgICAuc2VuZC5yZWFk"
    "eSB7IGJhY2tncm91bmQ6IHZhcigtLWJsdWUpOyBkaXNwbGF5OiBmbGV4OyB9CiAgICAuY29tcG9zZXIuZWRpdGluZyAucmFwaWRl"
    "LCAuY29tcG9zZXIuZWRpdGluZyAubWljLCAuY29tcG9zZXIuZWRpdGluZyAucGFybGVyIHsgZGlzcGxheTogbm9uZTsgfQogICAg"
    "LmVyciB7IGNvbG9yOiAjZmY2YjZiOyBmb250LXNpemU6IDEzcHg7IHRleHQtYWxpZ246IGNlbnRlcjsgbWluLWhlaWdodDogMWVt"
    "OyBtYXJnaW4tdG9wOiA2cHg7IH0KICAgIGlucHV0W3R5cGU9ZmlsZV0geyBkaXNwbGF5OiBub25lOyB9CgogICAgLyogQXR0YWNo"
    "IG1lbnUgKi8KICAgIC5hdHRhY2gtbWVudSB7IHBvc2l0aW9uOiBmaXhlZDsgbGVmdDogMTJweDsgcmlnaHQ6IDEycHg7IGJvdHRv"
    "bTogY2FsYyg3OHB4ICsgZW52KHNhZmUtYXJlYS1pbnNldC1ib3R0b20pKTsKICAgICAgYmFja2dyb3VuZDogIzFlMWUxZWU2OyBi"
    "YWNrZHJvcC1maWx0ZXI6IGJsdXIoMThweCk7IC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiBibHVyKDE4cHgpOwogICAgICBib3Jk"
    "ZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXIpOyBib3JkZXItcmFkaXVzOiAyMnB4OyBwYWRkaW5nOiA2cHg7CiAgICAgIHRyYW5z"
    "Zm9ybTogdHJhbnNsYXRlWSgxMnB4KSBzY2FsZSguOTgpOyBvcGFjaXR5OiAwOyBwb2ludGVyLWV2ZW50czogbm9uZTsKICAgICAg"
    "dHJhbnNpdGlvbjogb3BhY2l0eSAuMThzLCB0cmFuc2Zvcm0gLjE4czsgdHJhbnNmb3JtLW9yaWdpbjogYm90dG9tIGxlZnQ7IHot"
    "aW5kZXg6IDEyOyBtYXgtd2lkdGg6IDQ2MHB4OyB9CiAgICAuYXR0YWNoLW1lbnUub3BlbiB7IG9wYWNpdHk6IDE7IHRyYW5zZm9y"
    "bTogdHJhbnNsYXRlWSgwKSBzY2FsZSgxKTsgcG9pbnRlci1ldmVudHM6IGF1dG87IH0KICAgIC5hbS1pdGVtIHsgZGlzcGxheTog"
    "ZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiAxOHB4OyBwYWRkaW5nOiAxNnB4IDE4cHg7IGZvbnQtc2l6ZTogMThweDsK"
    "ICAgICAgY29sb3I6IHZhcigtLXRleHQpOyBjdXJzb3I6IHBvaW50ZXI7IGJvcmRlci1yYWRpdXM6IDE2cHg7IH0KICAgIC5hbS1p"
    "dGVtOmFjdGl2ZSB7IGJhY2tncm91bmQ6ICNmZmZmZmYxNDsgfQogICAgLmFtLWl0ZW0gKyAuYW0taXRlbSB7IGJvcmRlci10b3A6"
    "IDFweCBzb2xpZCAjZmZmZmZmMTA7IH0KICAgIC5hbS1pdGVtIC5haSB7IHdpZHRoOiAyNnB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7"
    "IGZvbnQtc2l6ZTogMjBweDsgY29sb3I6ICNjN2M3Y2M7IH0KCiAgICAvKiBEcmF3ZXIgKi8KICAgIC5zY3JpbSB7IHBvc2l0aW9u"
    "OiBmaXhlZDsgaW5zZXQ6IDA7IGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsLjUpOyBvcGFjaXR5OiAwOyBwb2ludGVyLWV2ZW50czog"
    "bm9uZTsKICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAuMjVzOyB6LWluZGV4OiAxMDsgfQogICAgLnNjcmltLm9wZW4geyBvcGFj"
    "aXR5OiAxOyBwb2ludGVyLWV2ZW50czogYXV0bzsgfQogICAgLmRyYXdlciB7IHBvc2l0aW9uOiBmaXhlZDsgdG9wOiAwOyBsZWZ0"
    "OiAwOyBib3R0b206IDA7IHdpZHRoOiA4NCU7IG1heC13aWR0aDogMzYwcHg7IGJhY2tncm91bmQ6ICMwYTBhMGE7CiAgICAgIGJv"
    "cmRlci1yaWdodDogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTAwJSk7IHRyYW5zaXRp"
    "b246IHRyYW5zZm9ybSAuMjVzOyB6LWluZGV4OiAxMTsKICAgICAgZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVt"
    "bjsgcGFkZGluZzogMTZweCAxNHB4IGNhbGMoMTRweCArIGVudihzYWZlLWFyZWEtaW5zZXQtYm90dG9tKSk7IH0KICAgIC5kcmF3"
    "ZXIub3BlbiB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTsgfQogICAgLnByb2ZpbGUgeyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1p"
    "dGVtczogY2VudGVyOyBnYXA6IDEycHg7IG1hcmdpbjogOHB4IDRweCAxOHB4OyB9CiAgICAuYXZhdGFyIHsgd2lkdGg6IDQwcHg7"
    "IGhlaWdodDogNDBweDsgYm9yZGVyLXJhZGl1czogNTAlOyBiYWNrZ3JvdW5kOiB2YXIoLS1wYW5lbC0yKTsKICAgICAgZGlzcGxh"
    "eTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZvbnQtc2l6ZTogMThweDsgfQog"
    "ICAgLnByb2ZpbGUgYiB7IGZvbnQtc2l6ZTogMThweDsgZmxleDogMTsgfQogICAgLnByb21vIHsgYmFja2dyb3VuZDogbGluZWFy"
    "LWdyYWRpZW50KDEzNWRlZywgIzJmNmJmZiwgIzFiM2ZiMCk7IGJvcmRlci1yYWRpdXM6IDE4cHg7IHBhZGRpbmc6IDE0cHggMTZw"
    "eDsKICAgICAgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVu"
    "OyBtYXJnaW4tYm90dG9tOiAxOHB4OyB9CiAgICAucHJvbW8gLnQgYiB7IGZvbnQtc2l6ZTogMTdweDsgfQogICAgLnByb21vIC50"
    "IHNwYW4geyBkaXNwbGF5OiBibG9jazsgZm9udC1zaXplOiAxMnB4OyBjb2xvcjogI2Q3ZTBmZjsgfQogICAgLnByb21vIGJ1dHRv"
    "biB7IGJhY2tncm91bmQ6ICNmZmZmZmYyMjsgYm9yZGVyOiBub25lOyBjb2xvcjogI2ZmZjsgYm9yZGVyLXJhZGl1czogMThweDsg"
    "cGFkZGluZzogOXB4IDE0cHg7CiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7IGZvbnQtc2l6ZTogMTNweDsgY3Vyc29yOiBwb2ludGVy"
    "OyB9CiAgICAubWVudS1yb3cgeyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDE0cHg7IHBhZGRpbmc6"
    "IDEycHggNHB4OyBmb250LXNpemU6IDE3cHg7IGN1cnNvcjogcG9pbnRlcjsgfQogICAgLm1lbnUtcm93IC5taSB7IHdpZHRoOiAy"
    "NHB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7IGZvbnQtc2l6ZTogMThweDsgY29sb3I6ICNjN2M3Y2M7IH0KICAgIC5zZWN0aW9uLXRp"
    "dGxlIHsgY29sb3I6IHZhcigtLW11dGVkKTsgZm9udC1zaXplOiAxM3B4OyBtYXJnaW46IDE2cHggNHB4IDhweDsgfQogICAgLmhp"
    "c3QgeyBmbGV4OiAxOyBvdmVyZmxvdy15OiBhdXRvOyB9CiAgICAuaHJvdyB7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBj"
    "ZW50ZXI7IGdhcDogMTJweDsgcGFkZGluZzogMTBweCA0cHg7IGN1cnNvcjogcG9pbnRlcjsgYm9yZGVyLXJhZGl1czogMTBweDsg"
    "fQogICAgLmhyb3c6YWN0aXZlIHsgYmFja2dyb3VuZDogdmFyKC0tcGFuZWwpOyB9CiAgICAuaHJvdyBpbWcgeyB3aWR0aDogNDRw"
    "eDsgaGVpZ2h0OiA0NHB4OyBib3JkZXItcmFkaXVzOiA4cHg7IG9iamVjdC1maXQ6IGNvdmVyOyBmbGV4OiBub25lOyB9CiAgICAu"
    "aHJvdyBzcGFuIHsgZm9udC1zaXplOiAxNHB4OyBjb2xvcjogI2QwZDBkMjsgd2hpdGUtc3BhY2U6IG5vd3JhcDsgb3ZlcmZsb3c6"
    "IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7IH0KICAgIC5lbXB0eSB7IGNvbG9yOiB2YXIoLS1tdXRlZCk7IGZvbnQt"
    "c2l6ZTogMTRweDsgcGFkZGluZzogMTZweCA0cHg7IH0KICAgIC5kcmF3ZXItZm9vdCB7IGRpc3BsYXk6IGZsZXg7IGdhcDogMTBw"
    "eDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgcGFkZGluZy10b3A6IDEwcHg7IGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ib3Jk"
    "ZXIpOyB9CiAgICAuc2VhcmNoIHsgZmxleDogMTsgYmFja2dyb3VuZDogdmFyKC0tcGFuZWwtMik7IGJvcmRlcjogbm9uZTsgYm9y"
    "ZGVyLXJhZGl1czogMjBweDsgcGFkZGluZzogMTBweCAxNHB4OwogICAgICBjb2xvcjogdmFyKC0tdGV4dCk7IGZvbnQtc2l6ZTog"
    "MTVweDsgb3V0bGluZTogbm9uZTsgfQoKICAgIC8qIFRvYXN0ICovCiAgICAudG9hc3QgeyBwb3NpdGlvbjogZml4ZWQ7IGxlZnQ6"
    "IDUwJTsgYm90dG9tOiAxMjBweDsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpIHRyYW5zbGF0ZVkoMjBweCk7CiAgICAgIGJh"
    "Y2tncm91bmQ6ICMyYzJjMmU7IGNvbG9yOiAjZmZmOyBwYWRkaW5nOiAxMHB4IDE2cHg7IGJvcmRlci1yYWRpdXM6IDIwcHg7IGZv"
    "bnQtc2l6ZTogMTNweDsKICAgICAgb3BhY2l0eTogMDsgcG9pbnRlci1ldmVudHM6IG5vbmU7IHRyYW5zaXRpb246IG9wYWNpdHkg"
    "LjJzLCB0cmFuc2Zvcm0gLjJzOyB6LWluZGV4OiAyMDsgfQogICAgLnRvYXN0LnNob3cgeyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06"
    "IHRyYW5zbGF0ZVgoLTUwJSkgdHJhbnNsYXRlWSgwKTsgfQogIDwvc3R5bGU+CjwvaGVhZD4KPGJvZHk+CgogIDwhLS0gVG9wIGJh"
    "ciAtLT4KICA8ZGl2IGNsYXNzPSJ0b3BiYXIiPgogICAgPGJ1dHRvbiBjbGFzcz0iaWNvbi1idG4iIGlkPSJtZW51QnRuIiBhcmlh"
    "LWxhYmVsPSJtZW51Ij4mIzk3NzY7PC9idXR0b24+CiAgICA8ZGl2IGNsYXNzPSJ0b2dnbGUiPgogICAgICA8c3BhbiBjbGFzcz0i"
    "YWN0aXZlIiBkYXRhLXRhYj0iY2hhdCI+Q2hhdDwvc3Bhbj4KICAgICAgPHNwYW4gZGF0YS10YWI9ImltYWdpbmUiPkltYWdpbmU8"
    "L3NwYW4+CiAgICA8L2Rpdj4KICAgIDxidXR0b24gY2xhc3M9Imljb24tYnRuIiBpZD0ibmV3QnRuIiBhcmlhLWxhYmVsPSJub3V2"
    "ZWF1Ij4mIzk5OTg7PC9idXR0b24+CiAgPC9kaXY+CgogIDwhLS0gTWFpbiBzdGFnZSAtLT4KICA8ZGl2IGNsYXNzPSJtYWluIj4K"
    "ICAgIDxzdmcgaWQ9ImxvZ28iIGNsYXNzPSJsb2dvIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSI+CiAgICAgIDxw"
    "YXRoIGQ9Ik0yMCA4MCBMNjIgMjAgTTgwIDMwIEw0NSA3OCIgc3Ryb2tlPSIjODg4IiBzdHJva2Utd2lkdGg9IjciIHN0cm9rZS1s"
    "aW5lY2FwPSJyb3VuZCIvPgogICAgICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgc3Ryb2tlPSIjNDQ0IiBzdHJva2Ut"
    "d2lkdGg9IjMiLz4KICAgIDwvc3ZnPgogICAgPGRpdiBjbGFzcz0ic3RhZ2UiIGlkPSJzdGFnZSI+CiAgICAgIDxpbWcgaWQ9InN0"
    "YWdlSW1nIiBhbHQ9IiIgLz4KICAgICAgPGRpdiBjbGFzcz0iY2FwIiBpZD0ic3RhZ2VDYXAiPjwvZGl2PgogICAgPC9kaXY+CiAg"
    "PC9kaXY+CgogIDwhLS0gQm90dG9tIGRvY2sgLS0+CiAgPGRpdiBjbGFzcz0iZG9jayI+CiAgICA8ZGl2IGNsYXNzPSJhY3Rpb25z"
    "Ij4KICAgICAgPGRpdiBjbGFzcz0icGlsbCIgaWQ9InZpZGVvUGlsbCI+JiMxMjc5MDk7IENyw6llciBkZXMgdmlkw6lvczwvZGl2"
    "PgogICAgICA8ZGl2IGNsYXNzPSJwaWxsIiBpZD0iYXR0YWNoUGlsbCI+JiMxMjg0NDQ7IDxzcGFuIGlkPSJhdHRhY2hMYWJlbCI+"
    "TW9kaWZpZXIgdW5lIGltYWdlPC9zcGFuPjwvZGl2PgogICAgPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJjb21wb3NlciIgaWQ9ImNv"
    "bXBvc2VyIj4KICAgICAgPGJ1dHRvbiBjbGFzcz0icGx1cyIgaWQ9InBsdXNCdG4iIGFyaWEtbGFiZWw9ImFqb3V0ZXIiPis8L2J1"
    "dHRvbj4KICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJpbnN0cnVjdGlvbiIgcGxhY2Vob2xkZXI9IlBvc2V6IHVuZSBxdWVz"
    "dGlvbiIgYXV0b2NvbXBsZXRlPSJvZmYiIC8+CiAgICAgIDxzcGFuIGNsYXNzPSJyYXBpZGUiIGlkPSJyYXBpZGVDaGlwIj4mIzk4"
    "ODk7IFJhcGlkZTwvc3Bhbj4KICAgICAgPGJ1dHRvbiBjbGFzcz0ibWljIiBpZD0ibWljQnRuIiBhcmlhLWxhYmVsPSJtaWNybyI+"
    "JiMxMjc5MDg7PC9idXR0b24+CiAgICAgIDxidXR0b24gY2xhc3M9InBhcmxlciIgaWQ9InBhcmxlckJ0biI+JiMxMjgyNjY7IFBh"
    "cmxlcjwvYnV0dG9uPgogICAgICA8YnV0dG9uIGNsYXNzPSJzZW5kIiBpZD0ic2VuZEJ0biIgYXJpYS1sYWJlbD0iZW52b3llciI+"
    "JiM4NTkzOzwvYnV0dG9uPgogICAgPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJlcnIiIGlkPSJlcnIiPjwvZGl2PgogIDwvZGl2PgoK"
    "ICA8IS0tIEF0dGFjaG1lbnQgaW5wdXRzIC0tPgogIDxpbnB1dCB0eXBlPSJmaWxlIiBpZD0iZmlsZUNhbWVyYSIgYWNjZXB0PSJp"
    "bWFnZS8qIiBjYXB0dXJlPSJlbnZpcm9ubWVudCIgLz4KICA8aW5wdXQgdHlwZT0iZmlsZSIgaWQ9ImZpbGVHYWxsZXJ5IiBhY2Nl"
    "cHQ9ImltYWdlLyoiIC8+CiAgPGlucHV0IHR5cGU9ImZpbGUiIGlkPSJmaWxlRG9jIiBhY2NlcHQ9ImltYWdlL3BuZyxpbWFnZS9q"
    "cGVnLGltYWdlL3dlYnAiIC8+CgogIDwhLS0gQXR0YWNoIG1lbnUgLS0+CiAgPGRpdiBjbGFzcz0iYXR0YWNoLW1lbnUiIGlkPSJh"
    "dHRhY2hNZW51Ij4KICAgIDxkaXYgY2xhc3M9ImFtLWl0ZW0iIGRhdGEtdGFyZ2V0PSJmaWxlQ2FtZXJhIj48c3BhbiBjbGFzcz0i"
    "YWkiPiYjMTI4MjQ3Ozwvc3Bhbj4gUHJlbmRyZSB1bmUgcGhvdG88L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImFtLWl0ZW0iIGRhdGEt"
    "dGFyZ2V0PSJmaWxlR2FsbGVyeSI+PHNwYW4gY2xhc3M9ImFpIj4mIzEyODQ0NDs8L3NwYW4+IENob2lzaXIgdW5lIHBob3RvPC9k"
    "aXY+CiAgICA8ZGl2IGNsYXNzPSJhbS1pdGVtIiBkYXRhLXRhcmdldD0iZmlsZURvYyI+PHNwYW4gY2xhc3M9ImFpIj4mIzEyODQ2"
    "Mjs8L3NwYW4+IENob2lzaXIgdW4gZmljaGllcjwvZGl2PgogIDwvZGl2PgoKICA8IS0tIERyYXdlciAtLT4KICA8ZGl2IGNsYXNz"
    "PSJzY3JpbSIgaWQ9InNjcmltIj48L2Rpdj4KICA8YXNpZGUgY2xhc3M9ImRyYXdlciIgaWQ9ImRyYXdlciI+CiAgICA8ZGl2IGNs"
    "YXNzPSJwcm9maWxlIj4KICAgICAgPGRpdiBjbGFzcz0iYXZhdGFyIj4mIzEyODEwMDs8L2Rpdj4KICAgICAgPGI+QnJ5YW4gTGFt"
    "aTwvYj4KICAgICAgPGJ1dHRvbiBjbGFzcz0iaWNvbi1idG4iPiYjMTg3OzwvYnV0dG9uPgogICAgPC9kaXY+CiAgICA8ZGl2IGNs"
    "YXNzPSJwcm9tbyI+CiAgICAgIDxkaXYgY2xhc3M9InQiPjxiPjEwMCUgbG9jYWw8L2I+PHNwYW4+R3JhdHVpdCDCtyBpbGxpbWl0"
    "w6kgwrcgcHJpdsOpPC9zcGFuPjwvZGl2PgogICAgICA8YnV0dG9uPkFjdGlmPC9idXR0b24+CiAgICA8L2Rpdj4KICAgIDxkaXYg"
    "Y2xhc3M9Im1lbnUtcm93IiBkYXRhLXNvb24+PHNwYW4gY2xhc3M9Im1pIj4mIzkyMDE7PC9zcGFuPiBUw6JjaGVzPC9kaXY+CiAg"
    "ICA8ZGl2IGNsYXNzPSJtZW51LXJvdyIgZGF0YS1zb29uPjxzcGFuIGNsYXNzPSJtaSI+JiMxMjgxMDE7PC9zcGFuPiBDb21wYWdu"
    "b25zPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJzZWN0aW9uLXRpdGxlIj5Db252ZXJzYXRpb25zPC9kaXY+CiAgICA8ZGl2IGNsYXNz"
    "PSJoaXN0IiBpZD0iaGlzdCI+PGRpdiBjbGFzcz0iZW1wdHkiPkF1Y3VuZSBtb2RpZmljYXRpb24uPC9kaXY+PC9kaXY+CiAgICA8"
    "ZGl2IGNsYXNzPSJkcmF3ZXItZm9vdCI+CiAgICAgIDxpbnB1dCBjbGFzcz0ic2VhcmNoIiBpZD0ic2VhcmNoIiBwbGFjZWhvbGRl"
    "cj0iUmVjaGVyY2hlciIgLz4KICAgICAgPGJ1dHRvbiBjbGFzcz0iaWNvbi1idG4iIGlkPSJjbGVhckJ0biIgdGl0bGU9IlZpZGVy"
    "IGwnaGlzdG9yaXF1ZSI+JiMxMjg0NjU7PC9idXR0b24+CiAgICA8L2Rpdj4KICA8L2FzaWRlPgoKICA8ZGl2IGNsYXNzPSJ0b2Fz"
    "dCIgaWQ9InRvYXN0Ij48L2Rpdj4KCiAgPHNjcmlwdD4KICAgIGNvbnN0ICQgPSAoaWQpID0+IGRvY3VtZW50LmdldEVsZW1lbnRC"
    "eUlkKGlkKTsKICAgIGxldCBjdXJyZW50RmlsZSA9IG51bGw7CgogICAgY29uc3QgYXR0YWNoUGlsbCA9ICQoJ2F0dGFjaFBpbGwn"
    "KSwgYXR0YWNoTGFiZWwgPSAkKCdhdHRhY2hMYWJlbCcpOwogICAgY29uc3QgaW5zdHJ1Y3Rpb24gPSAkKCdpbnN0cnVjdGlvbicp"
    "LCBzZW5kQnRuID0gJCgnc2VuZEJ0bicpLCBjb21wb3NlciA9ICQoJ2NvbXBvc2VyJyk7CiAgICBjb25zdCBzdGFnZSA9ICQoJ3N0"
    "YWdlJyksIHN0YWdlSW1nID0gJCgnc3RhZ2VJbWcnKSwgc3RhZ2VDYXAgPSAkKCdzdGFnZUNhcCcpOwogICAgY29uc3QgbG9nbyA9"
    "ICQoJ2xvZ28nKSwgZXJyID0gJCgnZXJyJyk7CiAgICBjb25zdCBkcmF3ZXIgPSAkKCdkcmF3ZXInKSwgc2NyaW0gPSAkKCdzY3Jp"
    "bScpOwogICAgY29uc3QgYXR0YWNoTWVudSA9ICQoJ2F0dGFjaE1lbnUnKTsKICAgIGNvbnN0IGZpbGVJbnB1dHMgPSBbJ2ZpbGVD"
    "YW1lcmEnLCAnZmlsZUdhbGxlcnknLCAnZmlsZURvYyddLm1hcCgkKTsKCiAgICAvKiBUb2FzdCBmb3Igbm90LWF2YWlsYWJsZSBm"
    "ZWF0dXJlcyAqLwogICAgbGV0IHRvYXN0VDsKICAgIGZ1bmN0aW9uIHRvYXN0KG1zZykgewogICAgICBjb25zdCB0ID0gJCgndG9h"
    "c3QnKTsgdC50ZXh0Q29udGVudCA9IG1zZzsgdC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7CiAgICAgIGNsZWFyVGltZW91dCh0b2Fz"
    "dFQpOyB0b2FzdFQgPSBzZXRUaW1lb3V0KCgpID0+IHQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpLCAxODAwKTsKICAgIH0KCiAg"
    "ICAvKiBBdHRhY2ggbWVudSAqLwogICAgZnVuY3Rpb24gY2xvc2VNZW51KCkgeyBhdHRhY2hNZW51LmNsYXNzTGlzdC5yZW1vdmUo"
    "J29wZW4nKTsgfQogICAgZnVuY3Rpb24gdG9nZ2xlTWVudSgpIHsgYXR0YWNoTWVudS5jbGFzc0xpc3QudG9nZ2xlKCdvcGVuJyk7"
    "IH0KICAgIGF0dGFjaFBpbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVNZW51KTsKICAgICQoJ3BsdXNCdG4nKS5h"
    "ZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1lbnUpOwogICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2sn"
    "LCAoZSkgPT4gewogICAgICBpZiAoIWF0dGFjaE1lbnUuY2xhc3NMaXN0LmNvbnRhaW5zKCdvcGVuJykpIHJldHVybjsKICAgICAg"
    "aWYgKGF0dGFjaE1lbnUuY29udGFpbnMoZS50YXJnZXQpIHx8IGUudGFyZ2V0ID09PSAkKCdwbHVzQnRuJykgfHwgYXR0YWNoUGls"
    "bC5jb250YWlucyhlLnRhcmdldCkpIHJldHVybjsKICAgICAgY2xvc2VNZW51KCk7CiAgICB9KTsKICAgIGF0dGFjaE1lbnUucXVl"
    "cnlTZWxlY3RvckFsbCgnLmFtLWl0ZW0nKS5mb3JFYWNoKChpdGVtKSA9PiB7CiAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcign"
    "Y2xpY2snLCAoKSA9PiB7IGNsb3NlTWVudSgpOyAkKGl0ZW0uZGF0YXNldC50YXJnZXQpLmNsaWNrKCk7IH0pOwogICAgfSk7Cgog"
    "ICAgZnVuY3Rpb24gb25QaWNrZWQoZmlsZSkgewogICAgICBjdXJyZW50RmlsZSA9IGZpbGUgfHwgbnVsbDsKICAgICAgaWYgKCFj"
    "dXJyZW50RmlsZSkgcmV0dXJuOwogICAgICBhdHRhY2hQaWxsLmNsYXNzTGlzdC5hZGQoJ2F0dGFjaGVkJyk7CiAgICAgIGF0dGFj"
    "aExhYmVsLnRleHRDb250ZW50ID0gY3VycmVudEZpbGUubmFtZSB8fCAncGhvdG8nOwogICAgICBpbnN0cnVjdGlvbi5wbGFjZWhv"
    "bGRlciA9ICdEw6ljcmlzIGxhIG1vZGlmaWNhdGlvbuKApic7CiAgICAgIGxvZ28uc3R5bGUuZGlzcGxheSA9ICdub25lJzsgc3Rh"
    "Z2UuY2xhc3NMaXN0LmFkZCgnc2hvdycpOwogICAgICBzdGFnZUltZy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGN1cnJlbnRG"
    "aWxlKTsKICAgICAgc3RhZ2VDYXAudGV4dENvbnRlbnQgPSAnRMOpY3JpcyBsYSBtb2RpZmljYXRpb24gcHVpcyBlbnZvaWUuJzsK"
    "ICAgICAgcmVmcmVzaFNlbmQoKTsKICAgIH0KICAgIGZpbGVJbnB1dHMuZm9yRWFjaCgoaW5wKSA9PiBpbnAuYWRkRXZlbnRMaXN0"
    "ZW5lcignY2hhbmdlJywgKCkgPT4gb25QaWNrZWQoaW5wLmZpbGVzWzBdKSkpOwoKICAgIGZ1bmN0aW9uIHJlZnJlc2hTZW5kKCkg"
    "ewogICAgICBjb25zdCByZWFkeSA9ICEhY3VycmVudEZpbGUgJiYgaW5zdHJ1Y3Rpb24udmFsdWUudHJpbSgpLmxlbmd0aCA+IDA7"
    "CiAgICAgIHNlbmRCdG4uY2xhc3NMaXN0LnRvZ2dsZSgncmVhZHknLCByZWFkeSk7CiAgICAgIGNvbXBvc2VyLmNsYXNzTGlzdC50"
    "b2dnbGUoJ2VkaXRpbmcnLCAhIWN1cnJlbnRGaWxlKTsKICAgIH0KICAgIGluc3RydWN0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2lu"
    "cHV0JywgcmVmcmVzaFNlbmQpOwoKICAgIGFzeW5jIGZ1bmN0aW9uIHN1Ym1pdCgpIHsKICAgICAgZXJyLnRleHRDb250ZW50ID0g"
    "Jyc7CiAgICAgIGlmICghY3VycmVudEZpbGUpIHsgdG9hc3QoJ0Fqb3V0ZSBkXCdhYm9yZCB1bmUgaW1hZ2UgKCspJyk7IHJldHVy"
    "bjsgfQogICAgICBpZiAoIWluc3RydWN0aW9uLnZhbHVlLnRyaW0oKSkgeyBlcnIudGV4dENvbnRlbnQgPSAnw4ljcmlzIGxhIG1v"
    "ZGlmaWNhdGlvbi4nOyByZXR1cm47IH0KICAgICAgbG9nby5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyBzdGFnZS5jbGFzc0xpc3Qu"
    "YWRkKCdzaG93Jyk7CiAgICAgIHN0YWdlQ2FwLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz0ic3Bpbm5lciI+PC9zcGFuPlRyYWl0"
    "ZW1lbnQgZW4gY291cnPigKYnOwogICAgICBjb25zdCBkYXRhID0gbmV3IEZvcm1EYXRhKCk7CiAgICAgIGRhdGEuYXBwZW5kKCdp"
    "bWFnZScsIGN1cnJlbnRGaWxlKTsKICAgICAgZGF0YS5hcHBlbmQoJ2luc3RydWN0aW9uJywgaW5zdHJ1Y3Rpb24udmFsdWUudHJp"
    "bSgpKTsKICAgICAgdHJ5IHsKICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnL2VkaXQnLCB7IG1ldGhvZDogJ1BPU1Qn"
    "LCBib2R5OiBkYXRhIH0pOwogICAgICAgIGlmICghcmVzLm9rKSB7IGNvbnN0IGogPSBhd2FpdCByZXMuanNvbigpLmNhdGNoKCgp"
    "ID0+ICh7fSkpOyB0aHJvdyBuZXcgRXJyb3Ioai5lcnJvciB8fCAnRXJyZXVyIHNlcnZldXIuJyk7IH0KICAgICAgICBjb25zdCBi"
    "bG9iID0gYXdhaXQgcmVzLmJsb2IoKTsgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTsKICAgICAgICBzdGFn"
    "ZUltZy5zcmMgPSB1cmw7CiAgICAgICAgc3RhZ2VDYXAuaW5uZXJIVE1MID0gJzxhIGNsYXNzPSJkbCIgaHJlZj0iJyArIHVybCAr"
    "ICciIGRvd25sb2FkPSJlZGl0ZWQucG5nIj4mIzExMDE1OyBUw6lsw6ljaGFyZ2VyPC9hPic7CiAgICAgICAgbG9hZEhpc3Rvcnko"
    "KTsKICAgICAgfSBjYXRjaCAoZXgpIHsgc3RhZ2VDYXAudGV4dENvbnRlbnQgPSAnJzsgZXJyLnRleHRDb250ZW50ID0gZXgubWVz"
    "c2FnZTsgfQogICAgfQogICAgc2VuZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN1Ym1pdCk7CiAgICBpbnN0cnVjdGlv"
    "bi5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHsgaWYgKGUua2V5ID09PSAnRW50ZXInICYmIGN1cnJlbnRGaWxl"
    "KSBzdWJtaXQoKTsgfSk7CgogICAgLyogRGVjb3JhdGl2ZSAvIG5vdC1hdmFpbGFibGUtaW4tbG9jYWwgY29udHJvbHMgKi8KICAg"
    "ICQoJ3ZpZGVvUGlsbCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdG9hc3QoJ0Nyw6lhdGlvbiB2aWTDqW8gOiBp"
    "bmRpc3BvbmlibGUgZW4gbG9jYWwnKSk7CiAgICAkKCdtaWNCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRv"
    "YXN0KCdNb2RlIHZvY2FsIGluZGlzcG9uaWJsZSBlbiBsb2NhbCcpKTsKICAgICQoJ3BhcmxlckJ0bicpLmFkZEV2ZW50TGlzdGVu"
    "ZXIoJ2NsaWNrJywgKCkgPT4gdG9hc3QoJ01vZGUgdm9jYWwgaW5kaXNwb25pYmxlIGVuIGxvY2FsJykpOwogICAgJCgncmFwaWRl"
    "Q2hpcCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdG9hc3QoJ01vZGUgcmFwaWRlIGTDqWrDoCBhY3RpZicpKTsK"
    "ICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2dnbGUgc3BhbicpLmZvckVhY2goKHRhYikgPT4gdGFiLmFkZEV2ZW50"
    "TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gewogICAgICBpZiAodGFiLmRhdGFzZXQudGFiID09PSAnaW1hZ2luZScpIHsgdG9hc3Qo"
    "J8KrIEltYWdpbmUgwrsgKGfDqW7DqXJhdGlvbikgaW5kaXNwb25pYmxlIOKAlCDDqWRpdGlvbiBzZXVsZW1lbnQnKTsgcmV0dXJu"
    "OyB9CiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2dnbGUgc3BhbicpLmZvckVhY2goKHMpID0+IHMuY2xhc3NM"
    "aXN0LnJlbW92ZSgnYWN0aXZlJykpOwogICAgICB0YWIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7CiAgICB9KSk7CiAgICBkb2N1"
    "bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zb29uXScpLmZvckVhY2goKGVsKSA9PiBlbC5hZGRFdmVudExpc3RlbmVyKCdj"
    "bGljaycsICgpID0+IHRvYXN0KCdCaWVudMO0dCcpKSk7CgogICAgJCgnbmV3QnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2sn"
    "LCAoKSA9PiB7CiAgICAgIGN1cnJlbnRGaWxlID0gbnVsbDsgZmlsZUlucHV0cy5mb3JFYWNoKChpKSA9PiAoaS52YWx1ZSA9ICcn"
    "KSk7CiAgICAgIGF0dGFjaFBpbGwuY2xhc3NMaXN0LnJlbW92ZSgnYXR0YWNoZWQnKTsgYXR0YWNoTGFiZWwudGV4dENvbnRlbnQg"
    "PSAnTW9kaWZpZXIgdW5lIGltYWdlJzsKICAgICAgaW5zdHJ1Y3Rpb24udmFsdWUgPSAnJzsgaW5zdHJ1Y3Rpb24ucGxhY2Vob2xk"
    "ZXIgPSAnUG9zZXogdW5lIHF1ZXN0aW9uJzsKICAgICAgc3RhZ2UuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpOyBsb2dvLnN0eWxl"
    "LmRpc3BsYXkgPSAnJzsgZXJyLnRleHRDb250ZW50ID0gJyc7IHJlZnJlc2hTZW5kKCk7CiAgICB9KTsKCiAgICAvKiBEcmF3ZXIg"
    "Ki8KICAgIGZ1bmN0aW9uIHNldERyYXdlcihvcGVuKSB7IGRyYXdlci5jbGFzc0xpc3QudG9nZ2xlKCdvcGVuJywgb3Blbik7IHNj"
    "cmltLmNsYXNzTGlzdC50b2dnbGUoJ29wZW4nLCBvcGVuKTsgfQogICAgJCgnbWVudUJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2Ns"
    "aWNrJywgKCkgPT4geyBzZXREcmF3ZXIodHJ1ZSk7IGxvYWRIaXN0b3J5KCk7IH0pOwogICAgc2NyaW0uYWRkRXZlbnRMaXN0ZW5l"
    "cignY2xpY2snLCAoKSA9PiBzZXREcmF3ZXIoZmFsc2UpKTsKCiAgICBsZXQgYWxsRW50cmllcyA9IFtdOwogICAgZnVuY3Rpb24g"
    "cmVuZGVySGlzdG9yeShsaXN0KSB7CiAgICAgIGNvbnN0IGJveCA9ICQoJ2hpc3QnKTsgYm94LmlubmVySFRNTCA9ICcnOwogICAg"
    "ICBpZiAoIWxpc3QubGVuZ3RoKSB7IGJveC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz0iZW1wdHkiPkF1Y3VuZSBtb2RpZmljYXRp"
    "b24uPC9kaXY+JzsgcmV0dXJuOyB9CiAgICAgIGZvciAoY29uc3QgZSBvZiBsaXN0KSB7CiAgICAgICAgY29uc3Qgcm93ID0gZG9j"
    "dW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7IHJvdy5jbGFzc05hbWUgPSAnaHJvdyc7CiAgICAgICAgcm93LmlubmVySFRNTCA9"
    "ICc8aW1nIHNyYz0iL2hpc3RvcnkvJyArIGUuaWQgKyAnIiBsb2FkaW5nPSJsYXp5Ij48c3Bhbj48L3NwYW4+JzsKICAgICAgICBy"
    "b3cucXVlcnlTZWxlY3Rvcignc3BhbicpLnRleHRDb250ZW50ID0gZS5pbnN0cnVjdGlvbjsKICAgICAgICByb3cuYWRkRXZlbnRM"
    "aXN0ZW5lcignY2xpY2snLCAoKSA9PiB7CiAgICAgICAgICBsb2dvLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IHN0YWdlLmNsYXNz"
    "TGlzdC5hZGQoJ3Nob3cnKTsKICAgICAgICAgIHN0YWdlSW1nLnNyYyA9ICcvaGlzdG9yeS8nICsgZS5pZDsKICAgICAgICAgIHN0"
    "YWdlQ2FwLmlubmVySFRNTCA9ICc8YSBjbGFzcz0iZGwiIGhyZWY9Ii9oaXN0b3J5LycgKyBlLmlkICsgJyIgZG93bmxvYWQ9ImVk"
    "aXRlZC5wbmciPiYjMTEwMTU7IFTDqWzDqWNoYXJnZXI8L2E+JzsKICAgICAgICAgIHNldERyYXdlcihmYWxzZSk7CiAgICAgICAg"
    "fSk7CiAgICAgICAgYm94LmFwcGVuZENoaWxkKHJvdyk7CiAgICAgIH0KICAgIH0KICAgIGFzeW5jIGZ1bmN0aW9uIGxvYWRIaXN0"
    "b3J5KCkgewogICAgICB0cnkgeyBjb25zdCByID0gYXdhaXQgZmV0Y2goJy9oaXN0b3J5Jyk7IGFsbEVudHJpZXMgPSAoYXdhaXQg"
    "ci5qc29uKCkpLmVudHJpZXMgfHwgW107IHJlbmRlckhpc3RvcnkoYWxsRW50cmllcyk7IH0gY2F0Y2ggKF8pIHt9CiAgICB9CiAg"
    "ICAkKCdzZWFyY2gnKS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7CiAgICAgIGNvbnN0IHEgPSBlLnRhcmdldC52"
    "YWx1ZS50b0xvd2VyQ2FzZSgpOwogICAgICByZW5kZXJIaXN0b3J5KGFsbEVudHJpZXMuZmlsdGVyKCh4KSA9PiB4Lmluc3RydWN0"
    "aW9uLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocSkpKTsKICAgIH0pOwogICAgJCgnY2xlYXJCdG4nKS5hZGRFdmVudExpc3RlbmVy"
    "KCdjbGljaycsIGFzeW5jICgpID0+IHsKICAgICAgaWYgKCFjb25maXJtKCJWaWRlciB0b3V0IGwnaGlzdG9yaXF1ZSA/IikpIHJl"
    "dHVybjsKICAgICAgYXdhaXQgZmV0Y2goJy9oaXN0b3J5L2NsZWFyJywgeyBtZXRob2Q6ICdQT1NUJyB9KTsgbG9hZEhpc3Rvcnko"
    "KTsKICAgIH0pOwoKICAgIGxvYWRIaXN0b3J5KCk7CiAgPC9zY3JpcHQ+CjwvYm9keT4KPC9odG1sPgo="
)
HTML_PAGE = base64.b64decode("".join(_HTML_B64.split())).decode("utf-8")

# ===================== Moteur d'édition =====================
_pipe = None
_pipe_lock = threading.Lock()
_device = None


def _select_device() -> str:
    import torch
    if torch.cuda.is_available():
        return "cuda"
    if getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def _load_pipeline():
    global _pipe, _device
    if _pipe is not None:
        return _pipe
    with _pipe_lock:
        if _pipe is not None:
            return _pipe
        import torch
        from diffusers import (
            EulerAncestralDiscreteScheduler,
            StableDiffusionInstructPix2PixPipeline,
        )
        _device = _select_device()
        dtype = torch.float16 if _device == "cuda" else torch.float32
        kwargs = {"torch_dtype": dtype}
        if not SAFETY_CHECKER:
            kwargs["safety_checker"] = None
            kwargs["requires_safety_checker"] = False
            print("[editeur] Safety checker DÉSACTIVÉ")
        pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(MODEL_ID, **kwargs)
        pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
        pipe = pipe.to(_device)
        if _device == "cuda":
            pipe.enable_attention_slicing()
        _pipe = pipe
        return _pipe


def _prepare_image(raw: bytes) -> Image.Image:
    img = Image.open(BytesIO(raw))
    img = ImageOps.exif_transpose(img).convert("RGB")
    w, h = img.size
    longest = max(w, h)
    if longest > MAX_SIDE:
        s = MAX_SIDE / longest
        img = img.resize((round(w * s), round(h * s)), Image.LANCZOS)
    w, h = img.size
    return img.resize(((w // 8) * 8, (h // 8) * 8), Image.LANCZOS)


def edit_image(raw_bytes, instruction, steps=20, image_guidance=1.5, text_guidance=7.5, seed=None):
    if not instruction or not instruction.strip():
        raise ValueError("La consigne de modification est vide.")
    import torch
    pipe = _load_pipeline()
    image = _prepare_image(raw_bytes)
    generator = None
    if seed is not None:
        generator = torch.Generator(device=_device).manual_seed(int(seed))
    result = pipe(
        instruction.strip(), image=image, num_inference_steps=int(steps),
        image_guidance_scale=float(image_guidance), guidance_scale=float(text_guidance),
        generator=generator,
    ).images[0]
    out = BytesIO()
    result.save(out, format="PNG")
    return out.getvalue()

# ===================== Historique =====================
_hist_lock = threading.Lock()


def _read_index():
    if not os.path.exists(INDEX_PATH):
        return []
    try:
        with open(INDEX_PATH, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        return []


def _write_index(entries):
    os.makedirs(HISTORY_DIR, exist_ok=True)
    tmp = INDEX_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(entries, fh, ensure_ascii=False, indent=2)
    os.replace(tmp, INDEX_PATH)


def hist_add(result_png, instruction):
    with _hist_lock:
        os.makedirs(HISTORY_DIR, exist_ok=True)
        eid = uuid.uuid4().hex
        with open(os.path.join(HISTORY_DIR, eid + ".png"), "wb") as fh:
            fh.write(result_png)
        entries = _read_index()
        entries.insert(0, {"id": eid, "file": eid + ".png", "instruction": instruction, "created_at": time.time()})
        for old in entries[MAX_ENTRIES:]:
            try:
                os.remove(os.path.join(HISTORY_DIR, old["file"]))
            except OSError:
                pass
        entries = entries[:MAX_ENTRIES]
        _write_index(entries)


def hist_list():
    with _hist_lock:
        return _read_index()


def hist_path(eid):
    if not eid or not eid.isalnum():
        return None
    with _hist_lock:
        for e in _read_index():
            if e["id"] == eid:
                p = os.path.join(HISTORY_DIR, e["file"])
                return p if os.path.exists(p) else None
    return None


def hist_clear():
    with _hist_lock:
        for e in _read_index():
            try:
                os.remove(os.path.join(HISTORY_DIR, e["file"]))
            except OSError:
                pass
        _write_index([])

# ===================== Serveur =====================
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024
ALLOWED = {"image/jpeg", "image/png", "image/webp"}


@app.route("/")
def index():
    return Response(HTML_PAGE, mimetype="text/html")


@app.route("/edit", methods=["POST"])
def edit():
    file = request.files.get("image")
    instruction = (request.form.get("instruction") or "").strip()
    if file is None or file.filename == "":
        return jsonify(error="Aucune image envoyée."), 400
    if file.mimetype not in ALLOWED:
        return jsonify(error="Format non supporté (JPEG, PNG ou WebP)."), 400
    if not instruction:
        return jsonify(error="Écris la modification souhaitée."), 400
    try:
        result = edit_image(file.read(), instruction)
    except ValueError as exc:
        return jsonify(error=str(exc)), 400
    except Exception:
        traceback.print_exc()
        return jsonify(error="Le traitement a échoué côté serveur."), 500
    try:
        hist_add(result, instruction)
    except Exception:
        traceback.print_exc()
    return send_file(BytesIO(result), mimetype="image/png", as_attachment=False, download_name="edited.png")


@app.route("/history")
def history_list():
    return jsonify(entries=hist_list())


@app.route("/history/<entry_id>")
def history_image(entry_id):
    p = hist_path(entry_id)
    if p is None:
        return jsonify(error="Introuvable."), 404
    return send_file(p, mimetype="image/png")


@app.route("/history/clear", methods=["POST"])
def history_clear():
    hist_clear()
    return jsonify(status="ok")


def _local_ip():
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
    print(f"  Sur ce PC   : http://127.0.0.1:{PORT}")
    print(f"  Sur ton tel : http://{ip}:{PORT}")
    print("  (téléphone et PC sur le même Wi-Fi)")
    print("=" * 52 + "\n")
    app.run(host="0.0.0.0", port=PORT, debug=False)
