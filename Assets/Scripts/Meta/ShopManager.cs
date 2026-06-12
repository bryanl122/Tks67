using System.Collections.Generic;
using CPT.Core;
using UnityEngine;

namespace CPT.Meta
{
    /// <summary>
    /// Boutique premium : achat d'EcoGems (argent réel), articles, accélérateurs,
    /// et boutique dynamique (offres personnalisées selon progression et temps de jeu).
    /// </summary>
    public class ShopManager
    {
        readonly GameState _s;
        public IPaymentProvider Payments = new MockPaymentProvider();

        public ShopManager(GameState s) { _s = s; }

        public int Gems => _s.gems;

        // --- Achat de monnaie premium ---
        public void BuyGems(GemPack pack, System.Action<bool> done = null)
        {
            Payments.Purchase(pack.id, pack.priceEur, ok =>
            {
                if (ok)
                {
                    _s.gems += pack.Total;
                    _s.meta.purchases.Add(pack.id);
                    EventBus.Notify(Loc.T("shop.gems_received", pack.Total), MonetizationCatalog.CurrencyName, 0);
                    World.AudioManager.PlaySfx("cash");
                    EventBus.RaiseMoneyChanged();
                }
                done?.Invoke(ok);
            });
        }

        public bool SpendGems(int amount, string label)
        {
            float discount = GameManager.I.Vip.IsActive ? MonetizationCatalog.VipShopDiscount : 0f;
            int final = Mathf.CeilToInt(amount * (1f - discount));
            if (_s.gems < final) return false;
            _s.gems -= final;
            EventBus.RaiseMoneyChanged();
            return true;
        }

        // --- Achat d'articles ---
        public bool BuyItem(ShopItem item, GameManager gm)
        {
            if (item == null || !IsOffered(item)) return false;
            bool unique = item.category == "demarrage" || item.category == "skin" || item.category == "extension";
            if (unique && _s.meta.purchases.Contains(item.id)) return false;
            if (!SpendGems(item.gemPrice, item.id)) return false;

            _s.meta.purchases.Add(item.id);
            if (item.moneyGranted > 0) gm.Economy.Earn(item.moneyGranted, Loc.T("shop.pack_label"));
            if (!string.IsNullOrEmpty(item.grantsMachine)) gm.Equipment.Buy(item.grantsMachine, gm.Economy, premium: true);
            if (item.id == "ext_terrain")
            {
                var site = _s.sites[_s.activeSite];
                site.sizeX += 8; site.sizeZ += 4;
                gm.Construction.RebuildSite();
            }
            ApplyBooster(item.id, gm);
            EventBus.Notify(Loc.T("shop.purchased"), Loc.T("shopitem." + item.id), 0);
            World.AudioManager.PlaySfx("cash");
            return true;
        }

        void ApplyBooster(string id, GameManager gm)
        {
            switch (id)
            {
                case "boost_construction":
                    foreach (var b in _s.sites[_s.activeSite].buildings) b.buildDaysLeft = 0;
                    gm.Construction.RebuildSite();
                    break;
                case "boost_reparation":
                    foreach (var m in _s.sites[_s.activeSite].machines)
                        if (m.broken) { m.broken = false; m.condition = 100f; }
                    break;
                case "boost_recherche":
                    gm.Research.FinishInstantly();
                    break;
                case "boost_formation":
                    foreach (var e in _s.employees) { e.skill = Mathf.Min(100, e.skill + 10); e.xp += 50; }
                    break;
            }
        }

        // --- Boutique dynamique : offres personnalisées ---
        public int PlayerLevel => _s.missionsDone.Count;

        public bool IsOffered(ShopItem item)
        {
            if (PlayerLevel < item.minLevel) return false;
            bool unique = item.category == "demarrage" || item.category == "skin" || item.category == "extension";
            if (unique && _s.meta.purchases.Contains(item.id)) return false;
            return true;
        }

        /// <summary>
        /// Offre du jour personnalisée : ressources si trésorerie basse,
        /// accélérateur si recherche en cours, sinon mise en avant cosmétique.
        /// Remise saisonnière appliquée le cas échéant.
        /// </summary>
        public ShopItem DailyHighlight()
        {
            ShopItem pick;
            if (_s.money < 5000) pick = MonetizationCatalog.Get("pack_argent_s");
            else if (!string.IsNullOrEmpty(_s.researchCurrent)) pick = MonetizationCatalog.Get("boost_recherche");
            else if (_s.meta.playtimeHours > 10 && IsOffered(MonetizationCatalog.Get("ext_terrain"))) pick = MonetizationCatalog.Get("ext_terrain");
            else pick = MonetizationCatalog.Get("fontaine_eco");
            return pick != null && IsOffered(pick) ? pick : null;
        }

        public float SeasonalDiscount() => SeasonalEvents.CurrentDiscount();

        public List<ShopItem> OfferedItems()
        {
            var list = new List<ShopItem>();
            foreach (var i in MonetizationCatalog.Items)
                if (IsOffered(i)) list.Add(i);
            return list;
        }
    }
}
