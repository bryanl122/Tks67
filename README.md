# 🟢 Container Park Tycoon

**Jeu de gestion et de simulation 3D de parcs à conteneurs**, inspiré du fonctionnement réel
des centres de recyclage belges (recyparks). Du petit dépôt de Wavre à l'empire national du
recyclage. Développé d'origine en **français**, localisé en 6 langues.

Projet **Unity 6** (6000.0 LTS) — architecture *code-first* : la totalité du jeu (assets 3D,
interface, effets, audio, données) est générée par code. Le projet compile et se joue sans
aucun asset binaire.

---

## 🚀 Lancer le jeu

1. Ouvrir le dossier du dépôt avec **Unity Hub** (Unity 6000.0.x).
2. Ouvrir n'importe quelle scène (même la scène vide par défaut) et appuyer sur **Play**.
   Le `Bootstrap` construit automatiquement caméra, éclairage, audio, interface et menu.
3. Optionnel : menu **CPT → 1. Créer la scène principale** pour générer `Assets/Scenes/Main.unity`
   et l'inscrire aux Build Settings.

## 📦 Compiler une version distribuable

- **CPT → 2. Configurer les réglages joueur**
- **CPT → 3. Build Windows 64 bits** ou **Build Linux – Steam Deck**

## 🎮 Contrôles

| Action | Touches |
|---|---|
| Caméra | ZQSD / WASD / flèches, molette = zoom, clic milieu ou E = rotation |
| Pause / vitesses | Espace, 1, 2, 3 |
| Construire | Panneau Construction → choisir → cliquer le terrain (Maj = série, clic droit = annuler) |
| Profil visiteur | Clic sur un véhicule |

## 🗂 Structure du projet

```
Assets/
  Scripts/
    Core/   Bootstrap, GameManager, GameState, GameClock, EventBus, SaveSystem, CameraController
    Data/   Catalogues : 61 déchets/16 flux, bâtiments, machines, recherche, missions, 116 succès, histoire
    Sim/    Économie, contrats, construction, personnel, équipements, recherche, visiteurs (IA),
            météo, incidents, réputation, multi-sites, missions, statistiques, modes de jeu
    Meta/   Monétisation : boutique EcoGems, Battle Pass 60 j, VIP, récompenses quotidiennes,
            événements commerciaux, paiements (mock + Steam), services en ligne (cloud, classements, coop)
    World/  Assets 3D procéduraux (LOD + collisions), matériaux, VFX, audio synthétisé, jour/nuit
    UI/     Thème, HUD, panneaux de gestion, boutique, menu principal, placement
    Editor/ Outils de build (menu CPT)
  Resources/Localization/   fr (source officielle), en, nl, de, es, it
Docs/   GDD, architecture, direction artistique, audio, monétisation, scénario, Steam/marketing, QA, optimisation
```

## 📚 Documentation

Toute la documentation de production se trouve dans [`Docs/`](Docs/) :
[GDD](Docs/GDD.md) · [Architecture](Docs/Architecture.md) ·
[Direction artistique](Docs/DirectionArtistique.md) · [Audio](Docs/AudioDesign.md) ·
[Monétisation](Docs/Monetisation.md) · [Scénario & lore](Docs/Scenario.md) ·
[Steam & marketing](Docs/Steam_Marketing.md) · [Plan de test QA](Docs/QA_TestPlan.md) ·
[Optimisation](Docs/Optimisation.md)

## 🌍 Langues

Français (source) · English · Nederlands · Deutsch · Español · Italiano —
changement à chaud dans Paramètres → Langue.
