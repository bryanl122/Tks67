using System.Collections.Generic;
using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>Profil d'un visiteur (identité, historique, chargement).</summary>
    public class VisitorProfile
    {
        public string firstName, lastName;
        public int age;
        public int profileType;      // 0 particulier, 1 indépendant, 2 entreprise
        public int vehicleType;      // 0 voiture, 1 voiture+remorque, 2 utilitaire, 3 camion
        public List<KeyValuePair<string, float>> load = new List<KeyValuePair<string, float>>(); // wasteId → kg
        public float satisfaction = 70f;
        public int visitsCount = 1;
    }

    /// <summary>
    /// IA visiteurs : génération de profils, taux d'arrivée dynamique
    /// (réputation, météo, week-end, capacité du parc), gestion des agents 3D.
    /// </summary>
    public class VisitorManager
    {
        const int MaxConcurrent = 14;

        readonly GameState _s;
        readonly List<VisitorAgent> _agents = new List<VisitorAgent>();
        readonly Dictionary<string, int> _returningVisitors = new Dictionary<string, int>(); // historique
        public readonly List<VisitorProfile> RecentVisitors = new List<VisitorProfile>(32);
        float _spawnAccumulator;

        public VisitorManager(GameState s) { _s = s; }

        public int ActiveCount => _agents.Count;

        public void Tick(GameManager gm, float gameHours)
        {
            if (!gm.Clock.IsOpen || gameHours <= 0f) return;

            float perHour = SpawnRatePerHour(gm);
            _spawnAccumulator += perHour * gameHours;
            while (_spawnAccumulator >= 1f && _agents.Count < MaxConcurrent)
            {
                _spawnAccumulator -= 1f;
                Spawn(gm);
            }
        }

        public float SpawnRatePerHour(GameManager gm)
        {
            int containers = gm.Construction.CountContainers();
            if (containers == 0) return 0f;
            float rate = 1.5f + _s.rep.citizens / 18f + containers * 0.35f;
            if (gm.Clock.IsWeekend) rate *= 1.5f;
            rate *= gm.Weather.VisitorMultiplier;
            rate *= gm.Research.GetMult("visitors");
            return rate;
        }

        void Spawn(GameManager gm)
        {
            var p = new VisitorProfile();
            NameDatabase.RandomPersonName(out p.firstName, out p.lastName);
            p.age = Random.Range(18, 82);
            p.profileType = Random.value < 0.75f ? 0 : (Random.value < 0.7f ? 1 : 2);
            p.vehicleType = p.profileType == 2 ? 3 : Random.Range(0, p.profileType == 1 ? 3 : 2);

            string key = p.firstName + " " + p.lastName;
            if (_returningVisitors.TryGetValue(key, out int visits)) p.visitsCount = visits + 1;
            _returningVisitors[key] = p.visitsCount;

            // Chargement : 1 à 3 catégories, volume selon véhicule
            float capacityKg = p.vehicleType switch { 0 => 60f, 1 => 250f, 2 => 500f, _ => 2000f };
            int kinds = Random.Range(1, 4);
            for (int i = 0; i < kinds; i++)
            {
                var w = WasteCatalog.Random();
                p.load.Add(new KeyValuePair<string, float>(w.id, capacityKg / kinds * Random.Range(0.5f, 1f)));
            }

            var go = World.MeshFactory.CreateVehicle(p.vehicleType);
            var agent = go.AddComponent<VisitorAgent>();
            agent.Init(gm, this, p);
            _agents.Add(agent);
        }

        public void OnAgentDone(VisitorAgent agent, VisitorProfile p)
        {
            _agents.Remove(agent);
            _s.stats.visitorsTotal++;
            _s.stats.visitorsToday++;
            // Moyenne mobile de satisfaction
            _s.stats.satisfactionAvg = Mathf.Lerp(_s.stats.satisfactionAvg, p.satisfaction, 0.05f);
            RecentVisitors.Insert(0, p);
            if (RecentVisitors.Count > 30) RecentVisitors.RemoveAt(RecentVisitors.Count - 1);
            EventBus.RaiseStat("visitors", 1);
        }

        public int QueueLengthFor(Core.BuildingData container)
        {
            int n = 0;
            foreach (var a in _agents) if (a.TargetContainer == container) n++;
            return n;
        }

        public void OnNewDay() { _s.stats.visitorsToday = 0; }

        public void ClearAll()
        {
            foreach (var a in _agents) if (a != null) Object.Destroy(a.gameObject);
            _agents.Clear();
        }
    }
}
