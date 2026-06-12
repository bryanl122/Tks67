using System.Collections.Generic;
using UnityEngine;

namespace CPT.Data
{
    /// <summary>Flux de collecte : chaque conteneur du parc accepte un flux.</summary>
    public class StreamDef
    {
        public string id;
        public Color color;
        public StreamDef(string id, Color c) { this.id = id; color = c; }
    }

    /// <summary>
    /// Catégorie de déchet. Valeurs inspirées des filières réelles belges
    /// (Fost Plus, Recupel, Bebat). Prix en € / tonne (négatif = coût d'élimination).
    /// </summary>
    public class WasteDef
    {
        public string id;
        public string streamId;
        public float pricePerTon;       // valeur de revente
        public float processCostPerTon; // coût de traitement
        public float envRisk;           // risque environnemental 0..1
        public float recycleRate;       // taux de recyclage 0..1
        public float densityKgM3;       // pour volume/poids
        public float dropFeePerKg;      // tarif payé par le visiteur (0 = gratuit)
        public float co2SavedPerKg;     // pollution évitée

        public WasteDef(string id, string stream, float price, float cost, float risk,
                        float recycle, float density, float fee, float co2)
        {
            this.id = id; streamId = stream; pricePerTon = price; processCostPerTon = cost;
            envRisk = risk; recycleRate = recycle; densityKgM3 = density;
            dropFeePerKg = fee; co2SavedPerKg = co2;
        }
    }

    public static class WasteCatalog
    {
        public static readonly List<StreamDef> Streams = new List<StreamDef>
        {
            new StreamDef("carton",        new Color(0.72f, 0.52f, 0.30f)),
            new StreamDef("papier",        new Color(0.92f, 0.90f, 0.82f)),
            new StreamDef("pmc",           new Color(0.36f, 0.68f, 0.94f)),
            new StreamDef("plastiques",    new Color(0.95f, 0.60f, 0.20f)),
            new StreamDef("verre",         new Color(0.30f, 0.72f, 0.45f)),
            new StreamDef("bois",          new Color(0.55f, 0.38f, 0.20f)),
            new StreamDef("metaux",        new Color(0.62f, 0.65f, 0.70f)),
            new StreamDef("verts",         new Color(0.35f, 0.60f, 0.22f)),
            new StreamDef("gravats",       new Color(0.58f, 0.56f, 0.52f)),
            new StreamDef("electromenager",new Color(0.85f, 0.85f, 0.88f)),
            new StreamDef("batteries",     new Color(0.90f, 0.80f, 0.15f)),
            new StreamDef("pneus",         new Color(0.15f, 0.15f, 0.15f)),
            new StreamDef("textiles",      new Color(0.70f, 0.35f, 0.65f)),
            new StreamDef("dangereux",     new Color(0.85f, 0.20f, 0.18f)),
            new StreamDef("deee",          new Color(0.40f, 0.78f, 0.78f)),
            new StreamDef("encombrants",   new Color(0.45f, 0.42f, 0.50f)),
        };

        // 61 catégories — id, flux, prix €/t, coût €/t, risque, taux recy., densité kg/m³, tarif €/kg, CO2 kg/kg
        public static readonly List<WasteDef> All = new List<WasteDef>
        {
            new WasteDef("carton_ondule",      "carton",      95f,  20f, 0.05f, 0.92f,  80f, 0f,    0.9f),
            new WasteDef("carton_plat",        "carton",      80f,  20f, 0.05f, 0.90f, 120f, 0f,    0.9f),
            new WasteDef("briques_boisson",    "carton",      40f,  35f, 0.08f, 0.75f, 150f, 0f,    0.6f),
            new WasteDef("papier_journal",     "papier",     110f,  15f, 0.03f, 0.95f, 250f, 0f,    1.1f),
            new WasteDef("papier_bureau",      "papier",     140f,  15f, 0.03f, 0.95f, 300f, 0f,    1.2f),
            new WasteDef("magazines",          "papier",      90f,  18f, 0.03f, 0.90f, 350f, 0f,    1.0f),
            new WasteDef("livres",             "papier",      70f,  20f, 0.03f, 0.85f, 400f, 0f,    1.0f),
            new WasteDef("bouteilles_pet",     "pmc",        280f,  60f, 0.10f, 0.88f,  35f, 0f,    1.5f),
            new WasteDef("flacons_pehd",       "pmc",        240f,  65f, 0.10f, 0.85f,  45f, 0f,    1.4f),
            new WasteDef("canettes_alu",       "pmc",        900f,  50f, 0.08f, 0.95f,  60f, 0f,    8.0f),
            new WasteDef("boites_conserve",    "pmc",        180f,  45f, 0.08f, 0.92f,  90f, 0f,    1.8f),
            new WasteDef("films_plastique",    "plastiques",  60f,  80f, 0.15f, 0.55f,  25f, 0.05f, 0.8f),
            new WasteDef("plastiques_durs",    "plastiques",  90f,  70f, 0.15f, 0.65f, 120f, 0.05f, 1.0f),
            new WasteDef("polystyrene",        "plastiques",  30f,  90f, 0.18f, 0.45f,  15f, 0.08f, 0.7f),
            new WasteDef("pvc_construction",   "plastiques",  50f,  85f, 0.25f, 0.50f, 350f, 0.10f, 0.6f),
            new WasteDef("verre_blanc",        "verre",       45f,  12f, 0.05f, 0.98f, 450f, 0f,    0.3f),
            new WasteDef("verre_colore",       "verre",       30f,  12f, 0.05f, 0.98f, 450f, 0f,    0.3f),
            new WasteDef("verre_plat",         "verre",       25f,  20f, 0.08f, 0.90f, 500f, 0f,    0.3f),
            new WasteDef("bois_naturel",       "bois",        35f,  25f, 0.08f, 0.85f, 250f, 0f,    0.5f),
            new WasteDef("bois_traite",        "bois",        15f,  45f, 0.30f, 0.70f, 280f, 0.05f, 0.4f),
            new WasteDef("palettes",           "bois",        50f,  20f, 0.05f, 0.90f, 200f, 0f,    0.5f),
            new WasteDef("panneaux_agglomere", "bois",        10f,  50f, 0.20f, 0.60f, 350f, 0.05f, 0.3f),
            new WasteDef("ferraille",          "metaux",     220f,  30f, 0.10f, 0.97f, 800f, 0f,    1.7f),
            new WasteDef("cuivre",             "metaux",    5500f,  40f, 0.10f, 0.98f, 900f, 0f,    3.5f),
            new WasteDef("aluminium",          "metaux",    1300f,  35f, 0.08f, 0.96f, 600f, 0f,    8.0f),
            new WasteDef("inox",               "metaux",    1100f,  35f, 0.08f, 0.95f, 850f, 0f,    4.0f),
            new WasteDef("zinc_plomb",         "metaux",     800f,  60f, 0.35f, 0.90f, 950f, 0f,    2.0f),
            new WasteDef("tontes_pelouse",     "verts",       12f,  18f, 0.05f, 1.00f, 300f, 0f,    0.2f),
            new WasteDef("branchages",         "verts",       15f,  22f, 0.05f, 1.00f, 180f, 0f,    0.2f),
            new WasteDef("feuilles_mortes",    "verts",       10f,  15f, 0.03f, 1.00f, 150f, 0f,    0.2f),
            new WasteDef("souches",            "verts",        8f,  35f, 0.05f, 0.95f, 400f, 0.03f, 0.2f),
            new WasteDef("beton",              "gravats",      8f,  10f, 0.08f, 0.90f,1800f, 0.02f, 0.1f),
            new WasteDef("briques",            "gravats",      6f,  10f, 0.08f, 0.88f,1500f, 0.02f, 0.1f),
            new WasteDef("terre_cuite",        "gravats",      5f,  12f, 0.08f, 0.85f,1400f, 0.02f, 0.1f),
            new WasteDef("platre",             "gravats",      4f,  30f, 0.20f, 0.70f, 900f, 0.06f, 0.1f),
            new WasteDef("asphalte",           "gravats",     10f,  25f, 0.30f, 0.80f,1600f, 0.05f, 0.1f),
            new WasteDef("frigos",             "electromenager", 120f, 90f, 0.45f, 0.85f, 120f, 0f, 1.5f),
            new WasteDef("lave_linge",         "electromenager", 150f, 70f, 0.25f, 0.88f, 200f, 0f, 1.6f),
            new WasteDef("fours",              "electromenager", 130f, 60f, 0.20f, 0.85f, 180f, 0f, 1.4f),
            new WasteDef("petit_electro",      "electromenager", 200f, 80f, 0.30f, 0.80f, 150f, 0f, 1.8f),
            new WasteDef("batteries_voiture",  "batteries",  650f, 120f, 0.70f, 0.95f, 600f, 0f,    2.5f),
            new WasteDef("piles",              "batteries",  300f, 150f, 0.60f, 0.80f, 400f, 0f,    2.0f),
            new WasteDef("batteries_lithium",  "batteries",  450f, 200f, 0.85f, 0.70f, 350f, 0f,    3.0f),
            new WasteDef("pneus_voiture",      "pneus",       60f,  70f, 0.35f, 0.92f, 110f, 0.10f, 0.7f),
            new WasteDef("pneus_camion",       "pneus",       80f,  80f, 0.35f, 0.92f, 130f, 0.15f, 0.7f),
            new WasteDef("vetements",          "textiles",   350f,  60f, 0.05f, 0.75f,  80f, 0f,    3.0f),
            new WasteDef("chaussures",         "textiles",   200f,  70f, 0.08f, 0.60f, 120f, 0f,    2.0f),
            new WasteDef("linge_maison",       "textiles",   250f,  55f, 0.05f, 0.70f,  90f, 0f,    2.5f),
            new WasteDef("peintures_solvants", "dangereux", -150f, 350f, 0.90f, 0.40f, 950f, 0.25f, 0.5f),
            new WasteDef("huiles_moteur",      "dangereux",   80f, 250f, 0.85f, 0.75f, 880f, 0f,    1.2f),
            new WasteDef("produits_chimiques", "dangereux", -200f, 420f, 0.95f, 0.35f, 800f, 0.30f, 0.4f),
            new WasteDef("amiante",            "dangereux", -350f, 600f, 1.00f, 0.05f, 700f, 0.40f, 0.0f),
            new WasteDef("ecrans",             "deee",       180f, 110f, 0.50f, 0.82f, 250f, 0f,    2.2f),
            new WasteDef("ordinateurs",        "deee",       400f, 100f, 0.40f, 0.85f, 200f, 0f,    3.5f),
            new WasteDef("smartphones",        "deee",       900f, 120f, 0.45f, 0.80f, 300f, 0f,    5.0f),
            new WasteDef("cables",             "deee",       700f,  90f, 0.30f, 0.90f, 350f, 0f,    3.0f),
            new WasteDef("ampoules_neons",     "deee",        50f, 180f, 0.65f, 0.90f, 100f, 0f,    1.0f),
            new WasteDef("matelas",            "encombrants", 20f,  85f, 0.15f, 0.55f,  30f, 0.08f, 0.4f),
            new WasteDef("meubles",            "encombrants", 25f,  70f, 0.12f, 0.60f,  90f, 0.06f, 0.4f),
            new WasteDef("moquettes",          "encombrants", 10f,  90f, 0.20f, 0.40f,  60f, 0.08f, 0.3f),
            new WasteDef("dechets_melanges",   "encombrants",-50f, 130f, 0.40f, 0.30f, 150f, 0.12f, 0.1f),
        };

        static Dictionary<string, WasteDef> _byId;
        static Dictionary<string, StreamDef> _streamById;

        public static WasteDef Get(string id)
        {
            if (_byId == null) { _byId = new Dictionary<string, WasteDef>(); foreach (var w in All) _byId[w.id] = w; }
            return _byId.TryGetValue(id, out var d) ? d : null;
        }

        public static StreamDef GetStream(string id)
        {
            if (_streamById == null) { _streamById = new Dictionary<string, StreamDef>(); foreach (var s in Streams) _streamById[s.id] = s; }
            return _streamById.TryGetValue(id, out var d) ? d : null;
        }

        public static List<WasteDef> ByStream(string streamId)
        {
            var list = new List<WasteDef>();
            foreach (var w in All) if (w.streamId == streamId) list.Add(w);
            return list;
        }

        public static WasteDef Random()
        {
            return All[UnityEngine.Random.Range(0, All.Count)];
        }
    }
}
