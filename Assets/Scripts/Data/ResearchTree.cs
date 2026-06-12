using System.Collections.Generic;

namespace CPT.Data
{
    /// <summary>
    /// Nœud de l'arbre technologique. Les effets sont des multiplicateurs
    /// agrégés par ResearchManager.GetMult(clé).
    /// Clés d'effet : value, capacity, throughput, breakdown, energy, security,
    /// productivity, visitors, research_speed, pollution.
    /// </summary>
    public class ResearchDef
    {
        public string id;
        public string branch;       // automatisation, ia, robotique, energie, logistique, securite, productivite
        public long cost;
        public int days;
        public string requires = "";
        public string effectKey;
        public float effectValue;   // ex. +0.10 = +10 %

        public ResearchDef(string id, string branch, long cost, int days, string effectKey, float effectValue, string requires = "")
        { this.id = id; this.branch = branch; this.cost = cost; this.days = days; this.effectKey = effectKey; this.effectValue = effectValue; this.requires = requires; }
    }

    public static class ResearchTree
    {
        public static readonly List<ResearchDef> All = new List<ResearchDef>
        {
            // Automatisation
            new ResearchDef("convoyeurs",        "automatisation",  20000,  6, "throughput",    0.10f),
            new ResearchDef("pesage_auto",       "automatisation",  35000,  8, "productivity",  0.10f, "convoyeurs"),
            new ResearchDef("barrieres_auto",    "automatisation",  28000,  6, "visitors",      0.15f, "convoyeurs"),
            new ResearchDef("tri_optique",       "automatisation",  90000, 15, "value",         0.10f, "pesage_auto"),

            // Intelligence artificielle
            new ResearchDef("ia_flux",           "ia",              60000, 12, "visitors",      0.10f),
            new ResearchDef("ia_maintenance",    "ia",              75000, 14, "breakdown",    -0.25f, "ia_flux"),
            new ResearchDef("ia_tarification",   "ia",              85000, 14, "value",         0.08f, "ia_flux"),

            // Robotique
            new ResearchDef("exosquelettes",     "robotique",       70000, 12, "productivity",  0.15f),
            new ResearchDef("robotique",         "robotique",      150000, 20, "throughput",    0.20f, "exosquelettes"),
            new ResearchDef("drones_inventaire", "robotique",       95000, 15, "capacity",      0.10f, "exosquelettes"),

            // Énergie verte
            new ResearchDef("panneaux_solaires", "energie",         40000,  8, "energy",       -0.20f),
            new ResearchDef("eolienne",          "energie",         90000, 14, "energy",       -0.30f, "panneaux_solaires"),
            new ResearchDef("biomethanisation",  "energie",        120000, 18, "value",         0.10f, "eolienne"),
            new ResearchDef("recup_eau",         "energie",         25000,  6, "pollution",    -0.15f),

            // Logistique
            new ResearchDef("optim_tournees",    "logistique",      30000,  7, "throughput",    0.12f),
            new ResearchDef("stock_intelligent", "logistique",      55000, 10, "capacity",      0.20f, "optim_tournees"),
            new ResearchDef("hub_regional",      "logistique",     140000, 20, "value",         0.12f, "stock_intelligent"),

            // Sécurité
            new ResearchDef("videosurveillance", "securite",        22000,  5, "security",      0.20f),
            new ResearchDef("detection_incendie","securite",        45000,  9, "security",      0.30f, "videosurveillance"),
            new ResearchDef("normes_iso",        "securite",        80000, 14, "security",      0.25f, "detection_incendie"),

            // Productivité
            new ResearchDef("formation_continue","productivite",    18000,  5, "productivity",  0.08f),
            new ResearchDef("ergonomie",         "productivite",    35000,  8, "productivity",  0.10f, "formation_continue"),
            new ResearchDef("labo_recherche",    "productivite",    65000, 12, "research_speed",0.25f, "ergonomie"),
        };

        static Dictionary<string, ResearchDef> _byId;
        public static ResearchDef Get(string id)
        {
            if (_byId == null) { _byId = new Dictionary<string, ResearchDef>(); foreach (var r in All) _byId[r.id] = r; }
            return _byId.TryGetValue(id, out var d) ? d : null;
        }
    }
}
