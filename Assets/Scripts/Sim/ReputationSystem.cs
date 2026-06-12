using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>
    /// Réputation à trois axes : citoyens (satisfaction visiteurs, décorations),
    /// entreprises (contrats honorés, capacité), administrations (pollution, incidents, normes).
    /// Dérive quotidienne vers une cible calculée.
    /// </summary>
    public class ReputationSystem
    {
        readonly GameState _s;
        public ReputationSystem(GameState s) { _s = s; }

        public void OnNewDay(GameManager gm)
        {
            var site = _s.sites[_s.activeSite];

            // Cible citoyens : satisfaction moyenne + décorations + éclairage
            int decorations = 0, lamps = 0;
            foreach (var b in site.buildings)
            {
                var def = BuildingCatalog.Get(b.typeId);
                if (def == null || b.buildDaysLeft > 0) continue;
                if (def.category == BuildingCategory.Decoration) decorations++;
                if (b.typeId == "lampadaire") lamps++;
            }
            float citizensTarget = _s.stats.satisfactionAvg
                + Mathf.Min(10f, decorations * 0.8f)
                + Mathf.Min(5f, lamps * 0.5f)
                - site.groundPollution * 0.2f;

            // Cible entreprises : contrats actifs + flux couverts + machines
            int signedContracts = 0;
            foreach (var c in _s.eco.contracts) if (c.signed) signedContracts++;
            float companiesTarget = 40f
                + signedContracts * 6f
                + gm.Construction.CountContainers() * 1.5f
                + site.machines.Count * 2f;

            // Cible administrations : pollution faible, sécurité, peu d'incidents
            float security = gm.Staff.Count("securite", _s.activeSite) * 4f
                + gm.Research.GetMult("security") * 10f - 10f;
            float governmentTarget = 60f - site.groundPollution * 0.5f + security
                - Mathf.Min(20f, _s.stats.incidentsTotal * 0.2f);

            _s.rep.citizens = Drift(_s.rep.citizens, citizensTarget);
            _s.rep.companies = Drift(_s.rep.companies, companiesTarget);
            _s.rep.government = Drift(_s.rep.government, governmentTarget);

            EventBus.RaiseStat("reputation_peak_set", _s.rep.Global);
        }

        static float Drift(float current, float target)
            => Mathf.Clamp(Mathf.Lerp(current, Mathf.Clamp(target, 0f, 100f), 0.06f), 0f, 100f);

        public void Penalize(float citizens, float companies, float government)
        {
            _s.rep.citizens = Mathf.Max(0, _s.rep.citizens - citizens);
            _s.rep.companies = Mathf.Max(0, _s.rep.companies - companies);
            _s.rep.government = Mathf.Max(0, _s.rep.government - government);
        }
    }
}
