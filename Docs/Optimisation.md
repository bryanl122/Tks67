# Optimisation — PC moyen, portable, Steam Deck

## Budgets
60 i/s à 1280×800 (Deck) et 1080p (PC moyen) ; < 1,5 Go RAM ; < 50 Mo sur disque
(tout est procédural) ; chargement < 5 s.

## Mesures en place
- **Assets** : primitives fusionnables, LODGroup sur conteneurs/bâtiments (détails coupés
  à 2 % d'écran), matériaux partagés en cache (`MaterialFactory`) → batching dynamique,
  teintes de chantier via MaterialPropertyBlock (zéro instanciation de matériau).
- **Simulation** : visiteurs plafonnés à 14 agents simultanés ; logique quotidienne
  groupée sur l'événement NewDay (pas de per-frame) ; succès vérifiés à 1 Hz avec drapeau
  « dirty » ; lampadaires re-scannés 2×/s seulement.
- **UI** : un seul canvas HUD, panneaux reconstruits à l'ouverture (pas de binding
  permanent), barre du haut rafraîchie à 4 Hz, fil de notifications plafonné à 6 entrées.
- **VFX** : pluie/neige attachées à la caméra (zone 60 m), particules < 2 000/système.
- **Audio** : clips générés une fois au démarrage puis réutilisés.
- **Cadre** : `targetFrameRate = 60`, vSync, FoV 50°, far plane 500 m, brouillard
  exponentiel (masque le clipping).

## Steam Deck
UI calibrée 1600×900 avec mise à l'échelle (lisible à 800 p, corps ≥ 13) ; contrôles
joués entièrement à la souris/pavé (modèle manette : pavé droit = souris, gâchettes =
clics, stick gauche = ZQSD) ; aucune dépendance Windows (build Linux x86_64 au menu CPT).

## Pistes si besoin (profiling)
StaticBatchingUtility sur le décor à la reconstruction du site ; pooling des véhicules ;
instancing GPU des conteneurs ; passage URP + SRP Batcher.
