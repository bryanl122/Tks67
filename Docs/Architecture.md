# Architecture logicielle

## Principes
- **Code-first** : aucun asset binaire ; scène vide + `Bootstrap`
  (`RuntimeInitializeOnLoadMethod`) qui assemble le jeu. Versionnage Git trivial,
  pas de conflits de scènes, reproductibilité totale.
- **Simulation découplée du moteur** : les managers (`CPT.Sim`, `CPT.Meta`) sont des
  classes C# pures construites autour d'un `GameState` sérialisable (JsonUtility).
  Seuls la présentation (UI, monde 3D, agents visiteurs) et l'orchestrateur sont des
  `MonoBehaviour`.
- **Bus d'événements** (`EventBus`) : NewDay/NewMonth, notifications, canal statistique
  générique (`Stat`) consommé par succès, missions et classements.

## Couches
```
CPT.Core   GameState (état sérialisable) · GameManager (orchestrateur, cycle de vie)
           GameClock · EventBus · SaveSystem · Loc (i18n) · Bootstrap · CameraController
CPT.Data   Catalogues immuables : WasteCatalog, BuildingCatalog, MachineCatalog,
           ResearchTree, MissionDatabase, AchievementDatabase, StoryDatabase, NameDatabase
CPT.Sim    Managers de simulation (un par domaine), tickés par GameManager :
           tick temps réel (visiteurs), cycle quotidien, cycle mensuel
CPT.Meta   Monétisation et services : ShopManager, BattlePass, VIPManager, DailyRewards,
           SeasonalEvents, IPaymentProvider (Mock/Steam), OnlineServices (cloud,
           classements, coop) — interfaces stables, implémentations locales
CPT.World  Présentation : MeshFactory (assets procéduraux + LOD + collisions),
           MaterialFactory (variantes usure/pluie), VFXFactory, ProceduralAudio,
           AudioManager, LightingController
CPT.UI     UITheme/UIBuilder (uGUI par code), UIManager (HUD), GamePanels, ShopUI,
           MainMenuUI, PlacementController
```

## Flux d'une session
```
Bootstrap → MainMenuUI → GameManager.StartNewGame/LoadGame
  → GameModes.CreateNewGame / SaveSystem.Load
  → BeginSession : instanciation des managers, RebuildSite, EventBus.GameLoaded
  → UIManager.BuildHUD
Update : GameClock.Tick → heures → NewDay → cascade des OnNewDay des managers
         VisitorManager.Tick (spawn temps réel) · AchievementManager.Poll (1 Hz)
NewMonth → EconomyManager.OnNewMonth (salaires, taxes, emprunts, subventions)
```

## Persistance
- 3 profils JSON dans `persistentDataPath/saves/` + miroir cloud (`ICloudSaveService`,
  implémentation locale ; Steam Cloud en production).
- Autosauvegarde à chaque nouveau jour de jeu, sauvegarde manuelle, suppression de profil.
- Compteurs de succès : dictionnaire aplati dans `StatsData.counterKeys/Values`
  (convention : clé `*_set` = pic conservé, sinon cumul).

## Extension prévue
- **Steam** : `SteamPaymentProvider` (ISteamMicroTxn), Steam Cloud, Leaderboards,
  Networking Sockets pour la coop — points d'accroche déjà isolés derrière interfaces.
- **URP** : `MaterialFactory` détecte le shader (`Standard` → `URP/Lit`).
- **Nouvelles langues** : ajouter `Resources/Localization/<code>.txt` + entrée dans `Loc`.
