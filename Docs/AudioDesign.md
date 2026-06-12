# Design sonore et musique

Tout l'audio est **synthétisé par code** (`ProceduralAudio`, 44,1 kHz) : zéro fichier
binaire, poids nul, variations infinies possibles. `AudioManager` gère trois canaux
(musique, effets, ambiance) avec volumes persistés.

## Effets
| Son | Synthèse | Usage |
|---|---|---|
| click | sinus 1,4 kHz, enveloppe 60 ms | toute l'UI |
| cash | arpège 1318→1760 Hz | ventes, achats, récompenses |
| notification | double note 880/1108 Hz | notifications neutres |
| alarm | sinus modulé 700–950 Hz | incendies, incidents critiques |
| achievement | arpège majeur C5-E5-G5-C6 | succès, paliers BP |
| mission | duo 659/988 Hz | missions accomplies |
| machine | bourdon 85 Hz + harmonique + souffle | machines actives |
| truck | moteur 60 Hz modulé 3 Hz | véhicules |
| ambience | bruit filtré + respiration lente | fond de parc (boucle) |

## Musique générative
Boucles de nappes + basse + arpège doux sur progressions d'accords, par contexte :
- **menu** : C–G–Am–F (accueillant)
- **gestion** : Am–F–C–G (concentration)
- **événement** : mineur tendu (Am–A♭m…) — incidents majeurs
- **saisonnier hiver** : D–Am–Bm–G, joué automatiquement en hiver

Mixage : musique 0,6 / effets 0,8 / ambiance 0,4 par défaut. Production future : les
clips générés peuvent être remplacés un à un par des enregistrements sans changer l'API
(`AudioManager.PlaySfx/PlayMusic`).
