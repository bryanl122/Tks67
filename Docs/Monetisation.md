# Monétisation — modèle premium + revenus récurrents

Jeu **payant** (14,99 € visé) avec économie premium intégrée, **strictement
non pay-to-win en compétition** : les classements comparent des métriques de jeu, les
accélérateurs font gagner du temps, pas des capacités inaccessibles.

## Monnaie premium : EcoGems (◆)
Gagnables en jeu (succès, missions, BP, calendrier) ET achetables :

| Pack | Prix | Gemmes | Bonus |
|---|---|---|---|
| S | 4,99 € | 500 | — |
| M | 9,99 € | 1 100 | +100 |
| L | 19,99 € | 2 400 | +400 |
| XL | 49,99 € | 6 500 | +1 500 |
| XXL | 99,99 € | 14 000 | +4 000 |
| MAX | 199,99 € | 30 000 | +10 000 |

## Boutique (`MonetizationCatalog`)
- **Véhicules premium** : chargeuse dorée (800 ◆), camion éco premium (1 200 ◆).
- **Décorations premium** : fontaine (350 ◆), statue (500 ◆).
- **Skins** conteneurs : néon, bois, chrome (250–400 ◆, uniques).
- **Packs de ressources** : 10 k€/50 k€/100 k€ (100/450/800 ◆).
- **Packs de démarrage** (uniques) : démarrage 300 ◆, expansion 900 ◆.
- **Extensions** : terrain +8×4 cellules (600 ◆), pack de défis (400 ◆).
- **Accélérateurs** : construction (50 ◆), réparation (40 ◆), recherche (120 ◆),
  formation (60 ◆) — tous instantanés.

## Battle Pass (saisons de 60 jours, 50 paliers, 100 XP/palier)
- **Gratuit** : argent croissant, gemmes aux paliers 3/10/20/30/40/50.
- **Premium (9,99 €)** : récompenses doublées, boosters aux dizaines,
  skin chrome exclusif au palier 50.
- Sources d'XP : missions (50–500), visiteurs servis (≤50/jour).

## Abonnement VIP (7,99 €/mois, cumulable)
+15 ◆/jour réel · −10 % boutique · +15 % XP Battle Pass · objets exclusifs saisonniers.

## Récompenses quotidiennes
Calendrier 28 jours à progression (jalons aux jours 3/7/14/21, coffre mensuel au jour 28 :
150 ◆ + 50 k€), série brisée après un jour manqué.

## Boutique dynamique
`ShopManager.DailyHighlight()` personnalise l'offre du jour : pack d'argent si trésorerie
basse, accélérateur si recherche en cours, extension après 10 h de jeu, sinon cosmétique.
Articles gated par niveau de progression (`minLevel` = missions accomplies).

## Événements commerciaux (calendrier réel)
Noël −25 % (15–26/12) · Nouvel An −20 % (27/12–05/01) · Black Friday −35 % (24–30/11) ·
Anniversaire −30 % (01–08/06). Bannière + remises automatiques en boutique.

## Paiements
`IPaymentProvider` : `MockPaymentProvider` (développement, succès immédiat) et
`SteamPaymentProvider` (squelette ISteamMicroTxn ; à activer avec Steamworks.NET et
l'AppId avant publication). Historique d'achats persisté pour restauration.

## Conformité
Prix affichés TTC en € ; pas de loot boxes ; achats uniques non re-facturables ;
mention « achats intégrés » sur la page Steam ; le mode Sandbox offre l'expérience
complète sans dépense.
