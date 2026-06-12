# Plan de test QA

## Matrice de configurations
PC moyen (GTX 1060/Ryzen 5, 1080p) · portable (iGPU, 768p) · Steam Deck (800p, manette) —
cible 60 i/s, mémoire < 1,5 Go (assets procéduraux : empreinte minimale).

## Parcours critiques (à exécuter à chaque build)
1. **Premier lancement** : scène vide → menu en < 5 s ; langue système ignorée, FR par défaut.
2. **Nouvelle carrière** : tutoriel 8 étapes complet ; mission 1 validée en posant 3 conteneurs.
3. **Boucle économique** : J1→J35 à vitesse ×4 — salaires/taxes/entretien débités au
   changement de mois, vente de matériaux créditée chaque jour, journal cohérent.
4. **Sauvegarde** : autosave quotidien ; quitter au menu → continuer → état identique
   (argent, bâtiments, employés, compteurs de succès) ; 3 profils indépendants ;
   suppression ; fichier corrompu → « sauvegarde illisible » sans crash.
5. **Localisation** : bascule des 6 langues à chaud depuis Paramètres ET le menu ;
   aucune clé brute affichée (vérifier les 11 panneaux + boutique + tutoriel).
6. **Monétisation (mock)** : achat de chaque pack de gemmes, chaque article (uniques non
   ré-achetables), BP premium, VIP (gemmes quotidiennes, −10 %, +15 % XP), calendrier 28 j
   (série brisée après un jour manqué), remises saisonnières aux dates clés.
7. **Incidents** : forcer un incendie (remplir le flux dangereux) → VFX feu, extinction,
   perte de contenu ; tempête → dégâts couverts à 80 % avec assurance complète ;
   moral 0 → grève → augmentation → reprise.
8. **Multi-sites** : achat du 2e parc, bascule, indépendance des constructions,
   retour au 1er parc intact.
9. **Modes** : sandbox (recherches débloquées), les 5 défis (victoire et échec au délai),
   coop locale (héberger → notification, pas de crash).

## Cas limites
- Trésorerie négative prolongée (alerte faillite, pas de blocage).
- 14 visiteurs simultanés + vitesse ×4 + tempête (charge max).
- Aucun conteneur (taux de spawn nul, pas de division par zéro).
- Conteneur plein → satisfaction et pollution de débordement.
- Recherche en cours + boost recherche → achèvement immédiat, effets actifs.
- Changement de langue pendant un panneau ouvert (reconstruction propre).

## Automatisation (backlog)
EditMode : WasteCatalog (61 entrées, flux valides), RewardAt/RewardForDay (déterminisme),
GameClock (saisons, mois), SeasonalEvents (fenêtres). PlayMode : smoke test Bootstrap →
nouvelle partie → 3 jours simulés sans exception.
