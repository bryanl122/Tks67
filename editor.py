"""
Moteur d'édition d'image par instruction textuelle.

Utilise le modèle InstructPix2Pix (timbrooks/instruct-pix2pix) via la
bibliothèque diffusers : on lui donne une image + une consigne en langage
naturel ("rends le ciel orange", "ajoute des lunettes", ...) et il renvoie
l'image modifiée.

Le moteur est chargé paresseusement (au premier appel) pour ne pas ralentir
le démarrage du serveur. Sur GPU CUDA c'est rapide ; sur CPU ça marche mais
c'est lent (compter ~1 min par image).
"""

from __future__ import annotations

import os
import threading
from io import BytesIO

from PIL import Image, ImageOps

MODEL_ID = "timbrooks/instruct-pix2pix"

# Filtre NSFW intégré au modèle. Activé par défaut.
# Mets DISABLE_SAFETY_CHECKER=1 dans l'environnement pour le couper (utile
# face aux faux positifs qui renvoient une image noire sur du contenu anodin).
# Tu restes responsable de l'usage : pas de contenu non consenti sur des
# personnes réelles, jamais de contenu impliquant des mineurs.
DISABLE_SAFETY_CHECKER = os.getenv("DISABLE_SAFETY_CHECKER", "0").lower() in (
    "1",
    "true",
    "yes",
    "on",
)

# Au-delà de cette dimension on redimensionne avant traitement : les modèles
# de diffusion travaillent mieux (et plus vite) sur des images raisonnables.
MAX_SIDE = 768

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
    """Charge le pipeline une seule fois, de façon thread-safe."""
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

        load_kwargs = {"torch_dtype": dtype}
        if DISABLE_SAFETY_CHECKER:
            # On désactive le filtre NSFW et le requires_safety_checker pour
            # éviter l'avertissement répété de diffusers.
            load_kwargs["safety_checker"] = None
            load_kwargs["requires_safety_checker"] = False
            print("[editor] Safety checker DÉSACTIVÉ (DISABLE_SAFETY_CHECKER=1)")

        pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(
            MODEL_ID,
            **load_kwargs,
        )
        pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(
            pipe.scheduler.config
        )
        pipe = pipe.to(_device)
        if _device == "cuda":
            pipe.enable_attention_slicing()

        _pipe = pipe
        return _pipe


def _prepare_image(raw: bytes) -> Image.Image:
    """Ouvre les octets reçus, corrige l'orientation EXIF et redimensionne."""
    img = Image.open(BytesIO(raw))
    img = ImageOps.exif_transpose(img)  # respecte l'orientation des photos
    img = img.convert("RGB")

    w, h = img.size
    longest = max(w, h)
    if longest > MAX_SIDE:
        scale = MAX_SIDE / longest
        img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    # InstructPix2Pix aime les dimensions multiples de 8.
    w, h = img.size
    img = img.resize(((w // 8) * 8, (h // 8) * 8), Image.LANCZOS)
    return img


def edit_image(
    raw_bytes: bytes,
    instruction: str,
    *,
    steps: int = 20,
    image_guidance: float = 1.5,
    text_guidance: float = 7.5,
    seed: int | None = None,
) -> bytes:
    """
    Applique `instruction` à l'image fournie et renvoie le PNG résultat (bytes).

    - steps           : nombre d'étapes de débruitage (qualité vs vitesse).
    - image_guidance  : fidélité à l'image d'origine (plus haut = plus proche).
    - text_guidance   : force de la consigne textuelle (plus haut = plus fort).
    - seed            : graine aléatoire pour des résultats reproductibles.
    """
    if not instruction or not instruction.strip():
        raise ValueError("La consigne de modification est vide.")

    import torch

    pipe = _load_pipeline()
    image = _prepare_image(raw_bytes)

    generator = None
    if seed is not None:
        generator = torch.Generator(device=_device).manual_seed(int(seed))

    result = pipe(
        instruction.strip(),
        image=image,
        num_inference_steps=int(steps),
        image_guidance_scale=float(image_guidance),
        guidance_scale=float(text_guidance),
        generator=generator,
    ).images[0]

    out = BytesIO()
    result.save(out, format="PNG")
    return out.getvalue()
