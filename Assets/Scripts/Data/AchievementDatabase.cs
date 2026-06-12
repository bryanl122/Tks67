using System.Collections.Generic;

namespace CPT.Data
{
    /// <summary>
    /// Succès. Chaque succès suit une statistique cumulée (canal EventBus.Stat)
    /// et accorde un titre + une récompense en EcoGems.
    /// La base est générée par paliers : 14 familles × 6-10 paliers + succès uniques = 116 succès.
    /// </summary>
    public class AchievementDef
    {
        public string id;
        public string statKey;     // canal suivi : tons, visitors, money_earned, ...
        public double threshold;
        public int tier;           // 1..n dans sa famille
        public string family;
        public int rewardGems;
        public string titleReward; // titre de profil débloqué (clé loc), vide sinon

        public AchievementDef(string family, int tier, string statKey, double threshold, int gems, string title = "")
        {
            this.family = family; this.tier = tier; this.statKey = statKey;
            this.threshold = threshold; rewardGems = gems; titleReward = title;
            id = family + "_" + tier;
        }
    }

    public static class AchievementDatabase
    {
        static List<AchievementDef> _all;

        public static List<AchievementDef> All
        {
            get { if (_all == null) Build(); return _all; }
        }

        static void Build()
        {
            _all = new List<AchievementDef>();

            // Famille, canal stat, paliers, gemmes de base.
            AddTiers("recycleur",    "tons",            new double[] { 1, 10, 50, 200, 1000, 5000, 20000, 100000 }, 5, "title.maitre_recycleur");
            AddTiers("accueil",      "visitors",        new double[] { 10, 100, 500, 2000, 10000, 50000, 200000 }, 5, "title.ami_des_citoyens");
            AddTiers("fortune",      "money_earned",    new double[] { 10000, 50000, 250000, 1000000, 5000000, 25000000 }, 8, "title.magnat");
            AddTiers("batisseur",    "buildings_built", new double[] { 1, 5, 15, 40, 100, 250 }, 5, "title.architecte");
            AddTiers("employeur",    "employees_hired", new double[] { 1, 5, 15, 40, 100 }, 5, "title.grand_patron");
            AddTiers("savant",       "research_done",   new double[] { 1, 3, 8, 15, 23 }, 8, "title.visionnaire");
            AddTiers("negociateur",  "contracts_signed",new double[] { 1, 5, 20, 50, 150 }, 5, "title.negociateur_or");
            AddTiers("ecolo",        "co2_saved",       new double[] { 1000, 10000, 100000, 1000000, 10000000 }, 8, "title.gardien_planete");
            AddTiers("logisticien",  "containers_emptied", new double[] { 1, 25, 100, 500, 2000, 10000 }, 5, "title.roi_logistique");
            AddTiers("expansion",    "sites_owned",     new double[] { 1, 2, 3, 5, 8, 11 }, 10, "title.empereur_national");
            AddTiers("mecano",       "machines_bought", new double[] { 1, 3, 8, 15, 30 }, 5, "title.chef_atelier");
            AddTiers("survivant",    "incidents_survived", new double[] { 1, 5, 15, 40, 100 }, 5, "title.imperturbable");
            AddTiers("populaire",    "reputation_peak", new double[] { 60, 70, 80, 90, 95, 99 }, 8, "title.star_locale");
            AddTiers("assidu",       "days_played",     new double[] { 7, 30, 90, 180, 360, 720 }, 5, "title.veteran");

            // Succès uniques (16).
            Unique("premier_jour",      "days_played",       1,  5);
            Unique("premiere_vente",    "money_earned",      1,  5);
            Unique("nuit_blanche",      "playtime_hours",    5,  5);
            Unique("collection_flux",   "streams_collected", 16, 20, "title.collectionneur");
            Unique("zero_dechet",       "perfect_days",      1, 10);
            Unique("semaine_parfaite",  "perfect_days",      7, 20);
            Unique("pompier",           "fires_extinguished",1, 10);
            Unique("inspecteur_content","inspections_passed",5, 15);
            Unique("greve_evitee",      "strikes_resolved",  3, 15);
            Unique("millionnaire",      "money_balance",1000000, 25, "title.millionnaire");
            Unique("decorateur",        "decorations_built",20, 10);
            Unique("technophile",       "branch_completed",  1, 15);
            Unique("omniscient",        "branch_completed",  7, 30, "title.omniscient");
            Unique("carriere_finie",    "career_done",       1, 50, "title.legende_recypark");
            Unique("defi_releve",       "challenges_done",   1, 15);
            Unique("maitre_defis",      "challenges_done",   5, 40, "title.maitre_defis");
        }

        static void AddTiers(string family, string stat, double[] thresholds, int baseGems, string finalTitle)
        {
            for (int i = 0; i < thresholds.Length; i++)
            {
                bool last = i == thresholds.Length - 1;
                _all.Add(new AchievementDef(family, i + 1, stat, thresholds[i],
                    baseGems * (i + 1), last ? finalTitle : ""));
            }
        }

        static void Unique(string id, string stat, double threshold, int gems, string title = "")
        {
            _all.Add(new AchievementDef(id, 0, stat, threshold, gems, title) { });
        }
    }
}
