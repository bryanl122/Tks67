using System.Collections.Generic;

namespace CPT.Data
{
    public enum BuildingCategory { Conteneur, Infrastructure, Batiment, Securite, Decoration }

    /// <summary>Définition d'un élément constructible. Dimensions en cellules de 2 m.</summary>
    public class BuildingDef
    {
        public string id;
        public BuildingCategory category;
        public int sizeX = 2, sizeZ = 2;
        public long cost;
        public int buildDays;
        public long upkeepMonthly;
        public float capacityKg;        // conteneurs uniquement
        public string defaultStream;    // conteneurs uniquement
        public int maxLevel = 3;
        public string requiresResearch = "";
        public bool premiumOnly;        // réservé boutique EcoGems
        public int unlockReputation;    // réputation globale minimale

        public BuildingDef(string id, BuildingCategory cat, int sx, int sz, long cost, int days, long upkeep)
        { this.id = id; category = cat; sizeX = sx; sizeZ = sz; this.cost = cost; buildDays = days; upkeepMonthly = upkeep; }
    }

    public static class BuildingCatalog
    {
        public static readonly List<BuildingDef> All = new List<BuildingDef>
        {
            // --- Conteneurs (un par flux, capacité de base 8 t, niveau ↑ = +50 %/niveau) ---
            Cont("cont_carton",        "carton",         8000, 1200, 1),
            Cont("cont_papier",        "papier",         8000, 1200, 1),
            Cont("cont_pmc",           "pmc",            8000, 1400, 1),
            Cont("cont_plastiques",    "plastiques",     8000, 1500, 1),
            Cont("cont_verre",        "verre",         10000, 1600, 1),
            Cont("cont_bois",          "bois",          10000, 1500, 1),
            Cont("cont_metaux",        "metaux",        12000, 1800, 1),
            Cont("cont_verts",         "verts",          9000, 1300, 1),
            Cont("cont_gravats",       "gravats",       14000, 2000, 2),
            Cont("cont_electromenager","electromenager",13000, 2200, 2),
            Cont("cont_batteries",     "batteries",     16000, 2800, 2),
            Cont("cont_pneus",         "pneus",         11000, 1700, 1),
            Cont("cont_textiles",      "textiles",       9000, 1300, 1),
            Cont("cont_dangereux",     "dangereux",     22000, 3500, 3),
            Cont("cont_deee",          "deee",          18000, 2600, 2),
            Cont("cont_encombrants",   "encombrants",   12000, 1800, 2),

            // --- Infrastructure ---
            new BuildingDef("route",        BuildingCategory.Infrastructure, 1, 1,    400, 0,    5),
            new BuildingDef("parking",      BuildingCategory.Infrastructure, 2, 2,   2500, 1,   30),
            new BuildingDef("cloture",      BuildingCategory.Infrastructure, 1, 1,    250, 0,    2),
            new BuildingDef("lampadaire",   BuildingCategory.Infrastructure, 1, 1,    900, 0,   15),
            new BuildingDef("aire_chargement", BuildingCategory.Infrastructure, 3, 3, 18000, 4, 250),
            new BuildingDef("zone_stockage",BuildingCategory.Infrastructure, 3, 3,  12000, 3,  150),

            // --- Bâtiments ---
            new BuildingDef("bureau",       BuildingCategory.Batiment, 3, 3,  35000, 6,  600),
            new BuildingDef("entrepot",     BuildingCategory.Batiment, 4, 4,  55000, 8,  900),
            new BuildingDef("hangar",       BuildingCategory.Batiment, 4, 3,  42000, 7,  700),
            new BuildingDef("atelier",      BuildingCategory.Batiment, 3, 3,  30000, 5,  500),
            new BuildingDef("salle_repos",  BuildingCategory.Batiment, 2, 2,  15000, 3,  250),

            // --- Sécurité ---
            new BuildingDef("poste_securite", BuildingCategory.Securite, 2, 2, 20000, 4, 400),
            new BuildingDef("camera",         BuildingCategory.Securite, 1, 1,  3500, 1,  60),
            new BuildingDef("borne_incendie", BuildingCategory.Securite, 1, 1,  4500, 1,  40),

            // --- Décorations (réputation ↑) ---
            new BuildingDef("arbre",        BuildingCategory.Decoration, 1, 1,    300, 0,    5),
            new BuildingDef("haie",         BuildingCategory.Decoration, 1, 1,    150, 0,    3),
            new BuildingDef("parterre",     BuildingCategory.Decoration, 1, 1,    200, 0,    8),
            new BuildingDef("fontaine_eco", BuildingCategory.Decoration, 2, 2,      0, 1,   50) { premiumOnly = true },
            new BuildingDef("statue_recyclage", BuildingCategory.Decoration, 2, 2,  0, 1,   30) { premiumOnly = true },
        };

        static BuildingDef Cont(string id, string stream, long cost, long upkeep, int days)
        {
            return new BuildingDef(id, BuildingCategory.Conteneur, 3, 2, cost, days, upkeep)
            { capacityKg = 8000f, defaultStream = stream };
        }

        static Dictionary<string, BuildingDef> _byId;
        public static BuildingDef Get(string id)
        {
            if (_byId == null) { _byId = new Dictionary<string, BuildingDef>(); foreach (var b in All) _byId[b.id] = b; }
            return _byId.TryGetValue(id, out var d) ? d : null;
        }
    }
}
