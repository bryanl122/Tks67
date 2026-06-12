using System.Collections.Generic;

namespace CPT.Data
{
    /// <summary>
    /// Équipements industriels. Effets exprimés en multiplicateurs appliqués
    /// par EquipmentManager (valeur des matériaux, capacité, vitesse de vidange).
    /// </summary>
    public class MachineDef
    {
        public string id;
        public long cost;
        public long upkeepMonthly;
        public float valueBonus;        // + % valeur matériaux
        public float capacityBonus;     // + % capacité conteneurs
        public float throughputBonus;   // + % vitesse de vidange / traitement
        public float breakdownPerMonth; // probabilité de panne mensuelle de base
        public string requiresResearch = "";
        public bool premiumOnly;

        public MachineDef(string id, long cost, long upkeep, float val, float cap, float thr, float brk)
        { this.id = id; this.cost = cost; upkeepMonthly = upkeep; valueBonus = val; capacityBonus = cap; throughputBonus = thr; breakdownPerMonth = brk; }
    }

    public static class MachineCatalog
    {
        public static readonly List<MachineDef> All = new List<MachineDef>
        {
            new MachineDef("compacteur",       45000,  900, 0.05f, 0.40f, 0.10f, 0.10f),
            new MachineDef("broyeur_bois",     60000, 1200, 0.15f, 0.10f, 0.20f, 0.12f),
            new MachineDef("broyeur_verts",    38000,  800, 0.10f, 0.15f, 0.15f, 0.10f),
            new MachineDef("presse_balles",    70000, 1400, 0.20f, 0.20f, 0.10f, 0.12f),
            new MachineDef("chargeuse",        85000, 1600, 0.00f, 0.00f, 0.35f, 0.08f),
            new MachineDef("chariot_elevateur",32000,  700, 0.00f, 0.00f, 0.20f, 0.08f),
            new MachineDef("camion_benne",     95000, 2100, 0.00f, 0.00f, 0.45f, 0.10f),
            new MachineDef("camion_grue",     130000, 2600, 0.05f, 0.00f, 0.55f, 0.10f),
            new MachineDef("vehicule_entretien",28000, 600, 0.00f, 0.00f, 0.00f, 0.06f),
            new MachineDef("tri_optique",     220000, 3500, 0.35f, 0.00f, 0.25f, 0.15f) { requiresResearch = "tri_optique" },
            new MachineDef("bras_robotise",   350000, 4800, 0.45f, 0.00f, 0.40f, 0.15f) { requiresResearch = "robotique" },
            new MachineDef("chargeuse_or",         0, 1000, 0.10f, 0.00f, 0.50f, 0.04f) { premiumOnly = true },
            new MachineDef("camion_eco_premium",   0, 1500, 0.10f, 0.00f, 0.60f, 0.04f) { premiumOnly = true },
        };

        static Dictionary<string, MachineDef> _byId;
        public static MachineDef Get(string id)
        {
            if (_byId == null) { _byId = new Dictionary<string, MachineDef>(); foreach (var m in All) _byId[m.id] = m; }
            return _byId.TryGetValue(id, out var d) ? d : null;
        }
    }
}
