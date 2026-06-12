using System.Collections.Generic;
using CPT.Core;

namespace CPT.Sim
{
    /// <summary>
    /// Compteurs cumulés persistants alimentés par EventBus.Stat.
    /// Convention : une clé se terminant par « _set » remplace la valeur
    /// (pics/instantanés), sinon la valeur est additionnée.
    /// </summary>
    public class StatsTracker
    {
        readonly GameState _s;
        readonly Dictionary<string, double> _counters = new Dictionary<string, double>();

        public StatsTracker(GameState s)
        {
            _s = s;
            for (int i = 0; i < s.stats.counterKeys.Count && i < s.stats.counterValues.Count; i++)
                _counters[s.stats.counterKeys[i]] = s.stats.counterValues[i];
            EventBus.Stat += OnStat;
        }

        void OnStat(string key, double value)
        {
            if (key.EndsWith("_set"))
            {
                string k = key.Substring(0, key.Length - 4);
                double old = Get(k);
                _counters[k] = value > old ? value : old;   // conserve le pic
            }
            else
            {
                _counters[key] = Get(key) + value;
            }
        }

        public double Get(string key) => _counters.TryGetValue(key, out var v) ? v : 0;

        /// <summary>Recopie les compteurs dans l'état sérialisable (avant sauvegarde).</summary>
        public void FlushToState()
        {
            _s.stats.counterKeys.Clear();
            _s.stats.counterValues.Clear();
            foreach (var kv in _counters)
            {
                _s.stats.counterKeys.Add(kv.Key);
                _s.stats.counterValues.Add(kv.Value);
            }
        }

        public void OnNewDay(GameManager gm)
        {
            OnStat("days_played", 1);
            OnStat("playtime_hours_set", _s.meta.playtimeHours);
            OnStat("money_balance_set", _s.money);

            // Journée parfaite : satisfaction > 85 et aucun incident aujourd'hui
            if (_s.stats.satisfactionAvg > 85f && _s.stats.visitorsToday == 0)
            { /* évaluée avant remise à zéro par VisitorManager.OnNewDay */ }

            // Flux distincts couverts (succès « collectionneur »)
            OnStat("streams_collected_set", gm.Construction.CountContainers() >= 16 ? 16 : CountStreams(gm));
        }

        int CountStreams(GameManager gm)
        {
            var streams = new HashSet<string>();
            foreach (var b in _s.sites[_s.activeSite].buildings)
                if (!string.IsNullOrEmpty(b.streamId) && b.buildDaysLeft <= 0) streams.Add(b.streamId);
            return streams.Count;
        }

        public void EvaluatePerfectDay()
        {
            var site = _s.sites[_s.activeSite];
            if (_s.stats.satisfactionAvg > 85f && site.groundPollution < 5f && _s.stats.visitorsToday > 5)
                OnStat("perfect_days", 1);
        }

        public void Dispose() { EventBus.Stat -= OnStat; }
    }
}
