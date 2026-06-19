# 🎨 Éditeur photo IA (local, accessible depuis le téléphone)

Un petit éditeur d'image par **instruction textuelle** : tu uploades une photo,
tu écris la modification voulue (« rends le ciel orange », « style aquarelle »,
« ajoute de la neige »…) et l'IA applique la transformation. Comme l'édition
d'image de Grok, mais qui tourne **en local sur ton ordinateur** ; tu y accèdes
depuis ton téléphone via le réseau Wi-Fi.

Le modèle utilisé est [InstructPix2Pix](https://huggingface.co/timbrooks/instruct-pix2pix),
exécuté via [diffusers](https://github.com/huggingface/diffusers).

## Installation

Il te faut **Python 3.10+**.

```bash
git clone <ce-dépôt>
cd Tks67

python -m venv .venv
source .venv/bin/activate        # Windows : .venv\Scripts\activate

pip install -r requirements.txt
```

> ⚠️ `torch` est volumineux. Pour une installation GPU (NVIDIA/CUDA), suis les
> instructions de https://pytorch.org/get-started/locally/ avant
> `pip install -r requirements.txt`.

## Lancement

```bash
python app.py
```

Ou via les lanceurs (safety checker désactivé) :

- **Windows** : double-clique sur `run.bat`
- **Linux / macOS** : `./run.sh` (au besoin `chmod +x run.sh` une fois)

La console affiche deux adresses, par exemple :

```
Sur ce PC   : http://127.0.0.1:5000
Sur ton tel : http://192.168.1.42:5000
```

- **Depuis le PC** : ouvre la première adresse.
- **Depuis le téléphone** : ouvre la seconde (téléphone et PC **sur le même Wi-Fi**).

Au tout premier lancement, le modèle (~2–3 Go) est téléchargé automatiquement.
C'est long une seule fois, ensuite il est mis en cache.

## Performances

- **GPU NVIDIA (CUDA)** : quelques secondes par image.
- **Mac (Apple Silicon / MPS)** : modéré.
- **CPU seul** : ça marche mais c'est lent (~1 min ou plus par image). Baisse le
  nombre d'étapes dans « Réglages avancés » pour accélérer.

## Réglages avancés (dans l'interface)

| Réglage          | Effet                                                        |
|------------------|--------------------------------------------------------------|
| Étapes           | Plus = meilleure qualité mais plus lent.                     |
| Force consigne   | Plus = la modification suit plus fort le texte.              |
| Fidélité image   | Plus = le résultat reste plus proche de la photo d'origine.  |
| Seed             | Fixe la graine aléatoire pour reproduire un résultat.        |

## Historique

Chaque modification réussie est enregistrée localement dans `history/` (image +
consigne). La galerie en bas de l'interface te laisse revoir, ré-télécharger ou
vider tes éditions passées. Les 100 dernières sont conservées. Rien n'est envoyé
en ligne ; le dossier `history/` est ignoré par git.

## Gratuit et illimité

L'IA tourne **sur ta machine** : aucun compte, aucun quota, aucun paiement,
aucune limite de nombre d'images. La seule contrainte est la vitesse de ton
matériel.

## Structure

```
app.py                 # serveur Flask + accès réseau local
editor.py              # moteur d'édition (chargement du modèle, traitement)
history.py             # stockage local des modifications
templates/index.html   # interface web mobile-friendly
run.sh / run.bat       # lanceurs (safety checker désactivé)
requirements.txt
```

## Safety checker (filtre NSFW)

Le filtre est **activé par défaut**. Il est connu pour ses faux positifs (il
peut renvoyer une image noire sur du contenu pourtant anodin). Pour le couper :

```bash
# Linux / macOS
DISABLE_SAFETY_CHECKER=1 python app.py

# Windows (PowerShell)
$env:DISABLE_SAFETY_CHECKER=1 ; python app.py
```

⚠️ Désactiver le filtre relève de ta responsabilité. Cet outil édite des photos
que **tu** fournis : ne l'utilise jamais pour produire du contenu intime non
consenti visant une personne réelle, ni aucun contenu impliquant des mineurs —
c'est illégal.

## Notes

- Le serveur écoute sur `0.0.0.0:5000` : il n'est accessible que sur ton réseau
  local, pas depuis Internet. Ne l'expose pas publiquement tel quel (pas
  d'authentification).
- Limite d'upload : 25 Mo, formats JPEG / PNG / WebP.
```
