using CPT.Core;
using UnityEngine;

namespace CPT.Sim
{
    public enum WeatherType { Soleil, Nuageux, Pluie, Neige, Brouillard, Tempete }

    /// <summary>
    /// Météo dynamique saisonnière (climat belge : la pluie n'est jamais loin).
    /// Influence la fréquentation, les risques d'incident, les VFX et l'éclairage.
    /// </summary>
    public class WeatherSystem
    {
        public WeatherType Current { get; private set; } = WeatherType.Nuageux;
        public float VisitorMultiplier { get; private set; } = 1f;
        public float IncidentRiskMultiplier { get; private set; } = 1f;

        readonly GameState _s;
        public WeatherSystem(GameState s) { _s = s; }

        // Poids par saison : soleil, nuageux, pluie, neige, brouillard, tempête
        static readonly float[][] SeasonWeights =
        {
            new[] { 0.10f, 0.30f, 0.25f, 0.20f, 0.10f, 0.05f }, // hiver
            new[] { 0.30f, 0.30f, 0.25f, 0.00f, 0.10f, 0.05f }, // printemps
            new[] { 0.50f, 0.25f, 0.15f, 0.00f, 0.02f, 0.08f }, // été
            new[] { 0.15f, 0.30f, 0.30f, 0.02f, 0.18f, 0.05f }, // automne
        };

        public void OnNewDay(GameClock clock)
        {
            var w = SeasonWeights[clock.Season];
            float r = Random.value, acc = 0f;
            int chosen = 1;
            for (int i = 0; i < w.Length; i++) { acc += w[i]; if (r <= acc) { chosen = i; break; } }
            SetWeather((WeatherType)chosen);
        }

        void SetWeather(WeatherType t)
        {
            Current = t;
            switch (t)
            {
                case WeatherType.Soleil: VisitorMultiplier = 1.25f; IncidentRiskMultiplier = 1f; break;
                case WeatherType.Nuageux: VisitorMultiplier = 1f; IncidentRiskMultiplier = 1f; break;
                case WeatherType.Pluie: VisitorMultiplier = 0.7f; IncidentRiskMultiplier = 1.1f; break;
                case WeatherType.Neige: VisitorMultiplier = 0.5f; IncidentRiskMultiplier = 1.3f; break;
                case WeatherType.Brouillard: VisitorMultiplier = 0.8f; IncidentRiskMultiplier = 1.2f; break;
                case WeatherType.Tempete: VisitorMultiplier = 0.3f; IncidentRiskMultiplier = 1.8f; break;
            }
            World.VFXFactory.SetWeather(t);
        }

        public string Label() => Loc.T("weather." + Current.ToString().ToLowerInvariant());
    }
}
