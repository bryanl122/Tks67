using CPT.Meta;
using CPT.Sim;
using CPT.World;
using UnityEngine;

namespace CPT.Core
{
    /// <summary>
    /// Chef d'orchestre : possède l'état de jeu et tous les managers,
    /// fait avancer la simulation et relaie les cycles quotidiens/mensuels.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager I { get; private set; }

        public GameState S { get; private set; }
        public bool Running { get; private set; }
        public int CurrentSlot { get; private set; } = 1;

        public GameClock Clock { get; private set; }
        public EconomyManager Economy { get; private set; }
        public ContractManager Contracts { get; private set; }
        public ConstructionManager Construction { get; private set; }
        public StaffManager Staff { get; private set; }
        public EquipmentManager Equipment { get; private set; }
        public ResearchManager Research { get; private set; }
        public VisitorManager Visitors { get; private set; }
        public WeatherSystem Weather { get; private set; }
        public IncidentSystem Incidents { get; private set; }
        public ReputationSystem Reputation { get; private set; }
        public SiteManager Sites { get; private set; }
        public MissionManager Missions { get; private set; }
        public StatsTracker Stats { get; private set; }
        public AchievementManager Achievements { get; private set; }
        public ShopManager Shop { get; private set; }
        public BattlePass BattlePass { get; private set; }
        public VIPManager Vip { get; private set; }
        public DailyRewards Daily { get; private set; }

        float _achievementPollTimer;
        float _autosaveDay = -1;
        float _bpVisitorXpAccum;

        void Awake() { I = this; }

        // --- Démarrage / chargement de partie ---
        public void StartNewGame(int mode, string profile, int slot, int challengeId = 0)
        {
            BeginSession(GameModes.CreateNewGame(mode, profile, challengeId), slot);
        }

        public bool LoadGame(int slot)
        {
            var state = SaveSystem.Load(slot);
            if (state == null) return false;
            BeginSession(state, slot);
            return true;
        }

        void BeginSession(GameState state, int slot)
        {
            EventBus.Clear();
            S = state;
            CurrentSlot = slot;

            Clock = new GameClock(S);
            Economy = new EconomyManager(S);
            Contracts = new ContractManager(S);
            Construction = new ConstructionManager(S);
            Staff = new StaffManager(S);
            Equipment = new EquipmentManager(S);
            Research = new ResearchManager(S);
            Visitors = new VisitorManager(S);
            Weather = new WeatherSystem(S);
            Incidents = new IncidentSystem(S);
            Reputation = new ReputationSystem(S);
            Sites = new SiteManager(S);
            Missions = new MissionManager(S);
            Stats = new StatsTracker(S);
            Achievements = new AchievementManager(S, Stats);
            Shop = new ShopManager(S);
            BattlePass = new BattlePass(S);
            Vip = new VIPManager(S);
            Daily = new DailyRewards(S);

            EventBus.NewDay += OnNewDay;
            EventBus.NewMonth += OnNewMonth;

            Construction.RebuildSite();
            VFXFactory.EnsureWeatherRig(CameraController.Cam.transform);
            Weather.OnNewDay(Clock);

            Running = true;
            AudioManager.PlayMusic(Clock.Season == 0 ? "winter" : "game");
            AudioManager.StartAmbience();

            // Méta : connexion quotidienne, VIP, saison de Battle Pass
            Daily.ClaimToday(this);
            Vip.GrantDailyIfDue();
            BattlePass.RolloverIfNeeded();

            EventBus.RaiseGameLoaded();
        }

        public void EndSession(bool save = true)
        {
            if (save && S != null) SaveNow();
            Running = false;
            Visitors?.ClearAll();
            Stats?.Dispose();
            EventBus.NewDay -= OnNewDay;
            EventBus.NewMonth -= OnNewMonth;
            AudioManager.StopAmbience();
            AudioManager.PlayMusic("menu");
        }

        public void SaveNow()
        {
            Stats.FlushToState();
            SaveSystem.Save(S, CurrentSlot);
        }

        // --- Boucle principale ---
        void Update()
        {
            if (!Running) return;

            float gameHours = Clock.Tick(Time.deltaTime);
            S.meta.playtimeHours += Time.deltaTime / 3600f;

            Visitors.Tick(this, gameHours);

            // XP Battle Pass au fil du jeu (visiteurs servis → ~1 XP chacun, via stat quotidienne)
            _achievementPollTimer += Time.deltaTime;
            if (_achievementPollTimer >= 1f)
            {
                _achievementPollTimer = 0f;
                Achievements.Poll();
            }

            // Raccourcis vitesse
            if (Input.GetKeyDown(KeyCode.Space)) SetSpeed(S.speed == 0 ? 1 : 0);
            if (Input.GetKeyDown(KeyCode.Alpha1)) SetSpeed(1);
            if (Input.GetKeyDown(KeyCode.Alpha2)) SetSpeed(2);
            if (Input.GetKeyDown(KeyCode.Alpha3)) SetSpeed(4);
        }

        public void SetSpeed(int speed) { S.speed = Mathf.Clamp(speed, 0, 4); }

        void OnNewDay(int day)
        {
            // Battle Pass : XP des visiteurs de la veille + tonnage
            BattlePass.AddXp(Mathf.Min(50, (int)S.stats.visitorsToday));
            Stats.EvaluatePerfectDay();

            Weather.OnNewDay(Clock);
            Staff.OnNewDay(this);
            Equipment.OnNewDay(this);
            Construction.OnNewDay(this);
            Contracts.OnNewDay();
            Research.OnNewDay(Staff.Count("technicien", S.activeSite));
            Incidents.OnNewDay(this);
            Reputation.OnNewDay(this);
            Missions.OnNewDay(this);
            Stats.OnNewDay(this);
            Visitors.OnNewDay();
            BattlePass.RolloverIfNeeded();

            // Musique saisonnière
            AudioManager.PlayMusic(Clock.Season == 0 ? "winter" : "game");

            // Classements mondiaux (locaux hors-ligne, Steam en production)
            OnlineServices.Leaderboards.Submit("tons", S.profile, S.stats.tonsRecycled);
            OnlineServices.Leaderboards.Submit("profit", S.profile, S.eco.lifetimeIncome - S.eco.lifetimeExpense);
            OnlineServices.Leaderboards.Submit("satisfaction", S.profile, S.stats.satisfactionAvg);

            // Autosauvegarde quotidienne
            if (_autosaveDay != day) { _autosaveDay = day; SaveNow(); }
        }

        void OnNewMonth(int month)
        {
            Economy.OnNewMonth(this);
        }
    }
}
