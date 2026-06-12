using System;
using System.Collections.Generic;

namespace CPT.Core
{
    /// <summary>
    /// État complet d'une partie, sérialisé en JSON (sauvegarde locale + cloud).
    /// Uniquement des types compatibles JsonUtility (pas de dictionnaires).
    /// </summary>
    [Serializable]
    public class GameState
    {
        public int saveVersion = 1;
        public string profile = "Joueur";
        public int mode;                 // 0 Carrière, 1 Sandbox, 2 Défi, 3 Coopératif
        public int challengeId;          // pour le mode Défi
        public long money = 25000;
        public int gems = 50;            // EcoGems (monnaie premium)

        // Temps
        public int day = 1;              // jour global (1 mois = 30 jours, 1 an = 360 jours)
        public float hour = 7f;
        public int speed = 1;            // 0 pause, 1, 2, 4

        // Sites (multi-parcs)
        public List<SiteData> sites = new List<SiteData>();
        public int activeSite;

        // Personnel (tous sites)
        public List<EmployeeData> employees = new List<EmployeeData>();

        // Recherche
        public List<string> researchDone = new List<string>();
        public string researchCurrent = "";
        public float researchDaysLeft;

        // Sous-systèmes
        public EconomyData eco = new EconomyData();
        public ReputationData rep = new ReputationData();
        public StatsData stats = new StatsData();
        public MetaData meta = new MetaData();

        // Progression
        public List<string> achievements = new List<string>();
        public List<string> missionsDone = new List<string>();
        public int tutorialStep;
        public bool tutorialDone;
    }

    [Serializable]
    public class SiteData
    {
        public string name = "Recypark Wavre";
        public string region = "Brabant wallon";
        public int sizeX = 48, sizeZ = 36;       // taille du terrain en cellules de 2 m
        public List<BuildingData> buildings = new List<BuildingData>();
        public List<MachineData> machines = new List<MachineData>();
        public float groundPollution;            // 0..100
    }

    [Serializable]
    public class BuildingData
    {
        public string typeId;        // référence BuildingCatalog
        public int x, z, rot;        // position grille + rotation (0..3)
        public float buildDaysLeft;  // > 0 : en construction
        public string streamId;      // pour les conteneurs : flux de déchets accepté
        public float fillKg;         // remplissage courant
        public float condition = 100f;
        public int level = 1;
        public bool onFire;
    }

    [Serializable]
    public class MachineData
    {
        public string typeId;        // référence MachineCatalog
        public int level = 1;
        public float condition = 100f;
        public bool broken;
        public float repairDaysLeft;
    }

    [Serializable]
    public class EmployeeData
    {
        public string firstName, lastName;
        public int age;
        public string role;          // référence StaffManager.Roles
        public float skill;          // 0..100
        public float morale = 70f;   // 0..100
        public float fatigue;        // 0..100
        public float xp;
        public int salaryMonthly;
        public int site;
        public bool onStrike;
    }

    [Serializable]
    public class EconomyData
    {
        public List<LoanData> loans = new List<LoanData>();
        public List<ContractData> contracts = new List<ContractData>();
        public long lifetimeIncome, lifetimeExpense;
        public int insuranceTier = 1;        // 0 aucune, 1 base, 2 complète
        public long lastMonthIncome, lastMonthExpense;
        public long monthIncome, monthExpense;
        public float taxRate = 0.21f;        // TVA/taxes belges simplifiées
        public long subsidiesReceived;
    }

    [Serializable]
    public class LoanData
    {
        public long principal;
        public float annualRate;
        public int monthsLeft;
        public long monthlyPayment;
    }

    [Serializable]
    public class ContractData
    {
        public string id;
        public string company;       // entreprise partenaire (lore belge)
        public string streamId;      // flux concerné
        public float pricePerTon;    // prix de rachat négocié
        public int daysLeft;
        public bool signed;
    }

    [Serializable]
    public class ReputationData
    {
        public float citizens = 50f;     // satisfaction citoyens
        public float companies = 50f;    // satisfaction entreprises
        public float government = 50f;   // satisfaction administrations
        public float Global => (citizens + companies + government) / 3f;
    }

    [Serializable]
    public class StatsData
    {
        public double tonsRecycled;
        public double co2SavedKg;        // pollution évitée
        public long visitorsTotal;
        public long visitorsToday;
        public float satisfactionAvg = 70f;
        public int incidentsTotal;
        public int finesPaid;
        public int containersEmptied;
        public int buildingsBuilt;
        public int researchCompleted;
        public int contractsSigned;
        public int employeesHired;
        public double bestDayIncome;

        // Compteurs génériques (succès / statistiques détaillées), listes parallèles pour JsonUtility.
        public List<string> counterKeys = new List<string>();
        public List<double> counterValues = new List<double>();
    }

    [Serializable]
    public class MetaData
    {
        // Battle Pass (saison de 60 jours)
        public int bpSeason = 1;
        public int bpXp;
        public bool bpPremium;
        public string bpStartIso = "";
        public List<int> bpClaimedFree = new List<int>();
        public List<int> bpClaimedPremium = new List<int>();

        // Abonnement VIP
        public string vipUntilIso = "";

        // Récompenses quotidiennes
        public int loginStreak;
        public string lastLoginIso = "";

        // Historique d'achats (boutique dynamique + restauration)
        public List<string> purchases = new List<string>();
        public float playtimeHours;
    }
}
