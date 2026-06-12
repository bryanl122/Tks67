using System.Collections.Generic;

namespace CPT.Meta
{
    /// <summary>Pack de monnaie premium (achat en argent réel via Steam).</summary>
    public class GemPack
    {
        public string id;
        public float priceEur;
        public int gems;
        public int bonusGems;
        public GemPack(string id, float price, int gems, int bonus) { this.id = id; priceEur = price; this.gems = gems; bonusGems = bonus; }
        public int Total => gems + bonusGems;
    }

    /// <summary>Article de la boutique premium (payé en EcoGems).</summary>
    public class ShopItem
    {
        public string id;
        public string category;     // vehicule, decoration, skin, ressources, demarrage, extension, accelerateur
        public int gemPrice;
        public long moneyGranted;   // packs de ressources
        public string grantsBuilding;
        public string grantsMachine;
        public int minLevel;        // boutique dynamique : niveau (nombre de missions) requis
        public ShopItem(string id, string cat, int price) { this.id = id; category = cat; gemPrice = price; }
    }

    public static class MonetizationCatalog
    {
        /// <summary>Nom officiel de la monnaie premium.</summary>
        public const string CurrencyName = "EcoGems";

        public static readonly List<GemPack> GemPacks = new List<GemPack>
        {
            new GemPack("gems_s",    4.99f,   500,    0),
            new GemPack("gems_m",    9.99f,  1100,  100),
            new GemPack("gems_l",   19.99f,  2400,  400),
            new GemPack("gems_xl",  49.99f,  6500, 1500),
            new GemPack("gems_xxl", 99.99f, 14000, 4000),
            new GemPack("gems_max",199.99f, 30000,10000),
        };

        public static readonly List<ShopItem> Items = new List<ShopItem>
        {
            // Véhicules premium
            new ShopItem("chargeuse_or",        "vehicule", 800) { grantsMachine = "chargeuse_or" },
            new ShopItem("camion_eco_premium",  "vehicule", 1200){ grantsMachine = "camion_eco_premium", minLevel = 5 },

            // Décorations premium
            new ShopItem("fontaine_eco",        "decoration", 350) { grantsBuilding = "fontaine_eco" },
            new ShopItem("statue_recyclage",    "decoration", 500) { grantsBuilding = "statue_recyclage", minLevel = 3 },

            // Skins premium (apparence des conteneurs)
            new ShopItem("skin_conteneurs_neon","skin", 250),
            new ShopItem("skin_conteneurs_bois","skin", 250),
            new ShopItem("skin_conteneurs_chrome","skin", 400) { minLevel = 8 },

            // Packs de ressources
            new ShopItem("pack_argent_s",  "ressources", 100) { moneyGranted = 10000 },
            new ShopItem("pack_argent_m",  "ressources", 450) { moneyGranted = 50000 },
            new ShopItem("pack_argent_l",  "ressources", 800) { moneyGranted = 100000 },

            // Packs de démarrage (offre unique)
            new ShopItem("pack_demarrage", "demarrage", 300) { moneyGranted = 20000, grantsMachine = "chariot_elevateur" },
            new ShopItem("pack_expansion", "demarrage", 900) { moneyGranted = 60000, minLevel = 10 },

            // Extensions de contenu
            new ShopItem("ext_terrain",    "extension", 600) { minLevel = 6 },   // +8 cellules de terrain
            new ShopItem("ext_defis",      "extension", 400) { minLevel = 4 },   // pack de défis bonus

            // Accélérateurs
            new ShopItem("boost_construction", "accelerateur",  50),
            new ShopItem("boost_reparation",   "accelerateur",  40),
            new ShopItem("boost_recherche",    "accelerateur", 120),
            new ShopItem("boost_formation",    "accelerateur",  60),
        };

        // --- Abonnement VIP ---
        public const float VipPriceEur = 7.99f;     // par mois
        public const int VipDailyGems = 15;
        public const float VipShopDiscount = 0.10f;
        public const float VipProgressBonus = 0.15f;

        // --- Battle Pass ---
        public const int BpSeasonDays = 60;
        public const int BpTierCount = 50;
        public const int BpXpPerTier = 100;
        public const float BpPremiumPriceEur = 9.99f;

        public static ShopItem Get(string id) => Items.Find(i => i.id == id);
    }
}
