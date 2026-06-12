using System;
using CPT.Core;

namespace CPT.Meta
{
    /// <summary>
    /// Abonnement VIP mensuel : gemmes quotidiennes, -10 % boutique,
    /// +15 % de progression Battle Pass, objets exclusifs.
    /// </summary>
    public class VIPManager
    {
        readonly GameState _s;
        public VIPManager(GameState s) { _s = s; }

        public bool IsActive
        {
            get
            {
                if (string.IsNullOrEmpty(_s.meta.vipUntilIso)) return false;
                return DateTime.TryParse(_s.meta.vipUntilIso, null,
                    System.Globalization.DateTimeStyles.RoundtripKind, out var until)
                    && DateTime.UtcNow < until;
            }
        }

        public int DaysLeft
        {
            get
            {
                if (!IsActive) return 0;
                DateTime.TryParse(_s.meta.vipUntilIso, null, System.Globalization.DateTimeStyles.RoundtripKind, out var until);
                return Math.Max(0, (int)(until - DateTime.UtcNow).TotalDays);
            }
        }

        public void Subscribe(ShopManager shop)
        {
            shop.Payments.Purchase("vip_month", MonetizationCatalog.VipPriceEur, ok =>
            {
                if (!ok) return;
                var from = IsActive && DateTime.TryParse(_s.meta.vipUntilIso, null,
                    System.Globalization.DateTimeStyles.RoundtripKind, out var until)
                    ? until : DateTime.UtcNow;
                _s.meta.vipUntilIso = from.AddDays(30).ToString("o");
                _s.meta.purchases.Add("vip_month");
                EventBus.Notify(Loc.T("vip.activated"), Loc.T("vip.activated_body"), 0);
            });
        }

        /// <summary>Gemmes quotidiennes VIP (créditées au premier lancement du jour réel).</summary>
        public void GrantDailyIfDue()
        {
            if (!IsActive) return;
            string today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            string key = "vip_daily_" + today;
            if (_s.meta.purchases.Contains(key)) return;
            _s.meta.purchases.Add(key);
            _s.gems += MonetizationCatalog.VipDailyGems;
            EventBus.Notify(Loc.T("vip.daily_gems", MonetizationCatalog.VipDailyGems), "", 0);
            EventBus.RaiseMoneyChanged();
        }
    }
}
