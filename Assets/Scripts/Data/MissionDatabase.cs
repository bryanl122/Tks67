using System.Collections.Generic;

namespace CPT.Data
{
    /// <summary>
    /// Missions du mode Carrière. Conditions évaluées par MissionManager
    /// sur l'état du jeu (type + valeur cible).
    /// Types : money, tons, visitors, buildings, employees, research, reputation,
    /// contracts, sites, machines, containers, satisfaction.
    /// </summary>
    public class MissionDef
    {
        public string id;
        public string condType;
        public double target;
        public long rewardMoney;
        public int rewardGems;
        public int bpXp;

        public MissionDef(string id, string condType, double target, long money, int gems, int xp)
        { this.id = id; this.condType = condType; this.target = target; rewardMoney = money; rewardGems = gems; bpXp = xp; }
    }

    public static class MissionDatabase
    {
        // Campagne « Du dépôt au sommet » — 24 missions progressives.
        public static readonly List<MissionDef> Career = new List<MissionDef>
        {
            new MissionDef("m01_premier_conteneur", "containers",      3,      2000,  5,  50),
            new MissionDef("m02_premiers_visiteurs","visitors",       25,      1500,  5,  50),
            new MissionDef("m03_embauche",          "employees",       2,      2500,  5,  60),
            new MissionDef("m04_premiere_tonne",    "tons",            5,      3000,  5,  60),
            new MissionDef("m05_six_flux",          "containers",      6,      5000, 10,  80),
            new MissionDef("m06_premier_contrat",   "contracts",       1,      4000, 10,  80),
            new MissionDef("m07_cent_visiteurs",    "visitors",      100,      5000, 10, 100),
            new MissionDef("m08_premiere_machine",  "machines",        1,      6000, 10, 100),
            new MissionDef("m09_recherche",         "research",        1,      6000, 10, 100),
            new MissionDef("m10_cinquante_tonnes",  "tons",           50,      8000, 15, 120),
            new MissionDef("m11_equipe",            "employees",       6,      8000, 15, 120),
            new MissionDef("m12_reputation_60",     "reputation",     60,     10000, 15, 140),
            new MissionDef("m13_dix_flux",          "containers",     10,     12000, 20, 140),
            new MissionDef("m14_tresorerie",        "money",      100000,     10000, 20, 160),
            new MissionDef("m15_cinq_recherches",   "research",        5,     12000, 20, 160),
            new MissionDef("m16_mille_visiteurs",   "visitors",     1000,     15000, 25, 180),
            new MissionDef("m17_satisfaction_80",   "satisfaction",   80,     15000, 25, 180),
            new MissionDef("m18_deux_cents_tonnes", "tons",          200,     20000, 30, 200),
            new MissionDef("m19_seize_flux",        "containers",     16,     25000, 30, 200),
            new MissionDef("m20_deuxieme_site",     "sites",           2,     40000, 50, 250),
            new MissionDef("m21_reputation_80",     "reputation",     80,     30000, 40, 250),
            new MissionDef("m22_mille_tonnes",      "tons",         1000,     50000, 60, 300),
            new MissionDef("m23_cinq_sites",        "sites",           5,    100000, 80, 400),
            new MissionDef("m24_empire_national",   "sites",           8,    250000,150, 500),
        };

        /// <summary>Défis du mode Défi : situation de départ corsée + objectif chronométré.</summary>
        public class ChallengeDef
        {
            public string id;
            public long startMoney;
            public string condType;
            public double target;
            public int dayLimit;
            public ChallengeDef(string id, long money, string cond, double target, int days)
            { this.id = id; startMoney = money; condType = cond; this.target = target; dayLimit = days; }
        }

        public static readonly List<ChallengeDef> Challenges = new List<ChallengeDef>
        {
            new ChallengeDef("defi_dettes",     5000,  "money",      50000, 90),
            new ChallengeDef("defi_express",   25000,  "tons",         100, 60),
            new ChallengeDef("defi_popularite",20000,  "reputation",    75, 120),
            new ChallengeDef("defi_canicule",  30000,  "visitors",     500, 90),
            new ChallengeDef("defi_national", 200000,  "sites",          4, 360),
        };
    }
}
