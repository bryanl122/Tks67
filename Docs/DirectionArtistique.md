# Direction artistique

## Style graphique : « éco-industriel chaleureux »
Low-poly stylisé, volumes francs, palette saturée mais naturelle. Le parc doit donner
envie d'ordre : chaque flux a SA couleur, lisible de loin — le tri devient un plaisir visuel.

## Palette
| Usage | Couleur | Hex |
|---|---|---|
| Primaire (marque, boutons) | Vert profond | `#1C5E21` |
| Accent (CTA, jauges) | Lime | `#9ED93D` |
| Premium (EcoGems, VIP, BP) | Ambre | `#F2B833` |
| Panneaux UI | Ardoise translucide | `#1A1F24 @ 94 %` |
| Danger / alerte | Rouge brique / orange | `#D9402F` / `#EBA62E` |

Couleurs des 16 flux : définies dans `WasteCatalog.Streams` (carton brun, PMC bleu,
verre vert bouteille, dangereux rouge, DEEE turquoise…) — réutilisées à l'identique sur
les conteneurs 3D, les jauges et les listes UI : un seul langage couleur partout.

## Typographie
LegacyRuntime (système) en 4 corps (13/15/22/40), gras réservé aux titres et montants.
Choisie pour la lisibilité sur Steam Deck (800 p) ; remplaçable par « Inter » via TMP
sans toucher au code (`UITheme.Font`).

## Logo & identité
Wordmark « CONTAINER PARK TYCOON » lime sur bande vert profond (rendu par le menu
principal), pictogramme : trois flèches de recyclage formant un conteneur vu de face
(décliné en statue premium in-game). Ton éditorial : belge, direct, une pointe d'humour
(« Bon tri ! »).

## Assets 3D (procéduraux — `MeshFactory`)
- **Conteneurs** : benne ouverte 5,6 × 3,6 m, paroi basse côté dépose, contenu visible
  qui monte avec le remplissage (`ContainerFillView`).
- **Véhicules** : 4 silhouettes (voiture, voiture+remorque, utilitaire, camion),
  6 teintes carrosserie, roues animées.
- **Bâtiments** : murs + toit + porte ; bureaux clairs, entrepôts hauts.
- **Décor** : arbres boule, haies, parterres, lampadaires fonctionnels (lumière la nuit),
  fontaine et statue premium.
- **Personnages** : silhouette gilet fluo + casque (`CreateWorker`).
- Tous : colliders inclus, LODGroup (détails coupés à distance), matériaux mutualisés
  en cache (`MaterialFactory`) avec variantes usure et pluie (brillance).

## Écrans
- **Menu** : fond vert nuit, bande primaire, gros wordmark, 3 profils, 4 modes.
- **HUD** : barre haute (finances, date, météo, vitesse, réputation), barre basse
  (11 outils), fenêtre centrale unique à liste défilante, fil de notifications à droite,
  bandeau tutoriel en bas.
- **Boutique** : codes ambre, bannières d'événements saisonniers, offre du jour.
