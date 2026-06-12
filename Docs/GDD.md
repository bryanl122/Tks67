# Game Design Document — Container Park Tycoon

## Vision
Simulation de gestion accessible mais profonde, au ton chaleureux et belge.
Fantasme du joueur : transformer un petit recypark de province en empire national du
recyclage, en restant du « bon côté » face à la multinationale TriTop.
Sessions de 20–60 minutes, rétention long terme par missions, succès, Battle Pass,
défis et expansion multi-sites.

## Boucle de jeu
1. **Minute** : les visiteurs arrivent (voiture, remorque, utilitaire, camion), déposent
   leurs déchets dans les conteneurs du bon flux, paient les tarifs des flux payants.
2. **Jour** : les camions vident les conteneurs → vente des matériaux (contrat ou prix spot)
   − coûts de traitement ; météo tirée ; incidents possibles ; missions vérifiées ; autosave.
3. **Mois** : salaires, entretien, assurance, emprunts, taxes sur le bénéfice, subventions.
4. **Long terme** : recherche, machines, agrandissement, nouveaux parcs (11 provinces),
   réputation à trois axes, fin de carrière (8 parcs).

## Systèmes (implémentation : `Assets/Scripts/Sim`)
- **Déchets** : 61 catégories réparties en 16 flux de conteneurs ; chaque catégorie a
  valeur €/t, coût de traitement, risque environnemental, taux de recyclage, densité,
  tarif visiteur et CO₂ évité (`WasteCatalog`).
- **Visiteurs (IA)** : profils persistants (nom belge, âge, type particulier/indépendant/
  entreprise, historique de visites), chargements multi-flux, files d'attente, satisfaction
  influencée par attente, conteneurs pleins, personnel et décorations.
- **Économie** : trésorerie, journal comptable, 4 paliers d'emprunt (taux croissants),
  3 niveaux d'assurance, TVA/taxes 21 %, subventions liées à la réputation administrative,
  contrats de rachat à prix garanti (2 mois) générés selon la réputation entreprises.
- **Construction** : grille de 2 m, 35 constructibles en 5 catégories, chantiers à durée
  réelle, démolition, extension de terrain (premium).
- **Personnel** : 6 métiers, compétence/moral/fatigue/XP/salaire, week-ends de repos,
  salle de repos, grèves sous 15 de moral, augmentations, licenciements avec indemnité.
- **Équipements** : 13 machines, pannes probabilistes (état, niveau, météo, IA maintenance),
  réparation (mécaniciens) ou instantanée (premium), amélioration ×3 niveaux.
- **Recherche** : 23 nœuds en 7 branches, effets en multiplicateurs agrégés ;
  techniciens et laboratoire accélèrent.
- **Environnement** : cycle jour/nuit complet (soleil, ambiance, lampadaires), météo
  saisonnière belge (6 états), saisons calées sur le calendrier de jeu (360 j/an).
- **Incidents** : incendies (flux dangereux), pannes électriques, contrôles de
  l'inspecteur Mertens, grèves, pollutions accidentelles, accidents de travail, tempêtes.
- **Réputation** : citoyens / entreprises / administrations, dérive quotidienne vers des
  cibles calculées ; pilote fréquentation, contrats et subventions.
- **Multi-sites** : prix croissant (×1,9), 11 provinces, bonus de réseau +2 %/site,
  bascule de site avec reconstruction du monde.

## Modes
- **Carrière** : tutoriel 8 étapes, 24 missions, 10 courriels narratifs, fin scénarisée.
- **Sandbox** : 10 M€, toutes recherches débloquées.
- **Défi** : 5 scénarios chronométrés (`MissionDatabase.Challenges`).
- **Coopératif** : architecture hôte-invités (`ICoopSession`), session locale fonctionnelle,
  transport Steam prévu en production.

## Progression & rétention
116 succès à paliers + 19 titres ; statistiques détaillées ; classements (tonnes, bénéfices,
satisfaction) ; Battle Pass 60 j / 50 paliers ; calendrier de connexion 28 j ; VIP mensuel ;
événements commerciaux calendaires. Voir `Docs/Monetisation.md`.

## Équilibrage (valeurs clés)
- Jour de jeu : 6 min réelles (vitesse ×1) ; parc ouvert 8 h–18 h.
- Capacité conteneur : 8 t (+50 %/niveau) ; vidange de base : 3 t/jour/site.
- Départ carrière : 25 000 €, 3 conteneurs, 50 EcoGems.
- Faillite signalée sous −50 000 €.
