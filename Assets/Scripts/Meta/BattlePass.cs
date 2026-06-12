using System;
using CPT.Core;
using UnityEngine;

namespace CPT.Meta
{
    /// <summary>
    /// Battle Pass saisonnier : 60 jours, 50 paliers, pistes gratuite et premium.
    /// L'XP provient des missions, des visiteurs servis et des tonnes recyclées.
    /// </summary>
    public class BattlePass
    {
        public struct Reward
        {
            public int tier;
            public bool premium;
            public long money;
            public int gems;
            public string itemId;   // article boutique offert (cosmétique/booster)
        }

        readonly GameState _s;

        public BattlePass(GameState s)
        {
            _s = s;
            if (string.IsNullOrEmpty(_s.meta.bpStartIso))
                _s.meta.bpStartIso = DateTime.UtcNow.ToString("o");
        }

        public int Tier => Mathf.Min(MonetizationCatalog.BpTierCount, _s.meta.bpXp / MonetizationCatalog.BpXpPerTier);
        public int XpInTier => _s.meta.bpXp % MonetizationCatalog.BpXpPerTier;
        public bool IsPremium => _s.meta.bpPremium;
        public int Season => _s.meta.bpSeason;

        public int DaysLeft
        {
            get
            {
                if (!DateTime.TryParse(_s.meta.bpStartIso, null, System.Globalization.DateTimeStyles.RoundtripKind, out var start))
                    return MonetizationCatalog.BpSeasonDays;
                int elapsed = (int)(DateTime.UtcNow - start).TotalDays;
                return Mathf.Max(0, MonetizationCatalog.BpSeasonDays - elapsed);
            }
        }

        public void AddXp(int xp)
        {
            float mult = GameManager.I != null && GameManager.I.Vip.IsActive
                ? 1f + MonetizationCatalog.VipProgressBonus : 1f;
            int before = Tier;
            _s.meta.bpXp += Mathf.RoundToInt(xp * mult);
            if (Tier > before)
            {
                EventBus.Notify(Loc.T("bp.tier_up", Tier), Loc.T("bp.claim_hint"), 0);
                World.AudioManager.PlaySfx("achievement");
            }
        }

        /// <summary>Récompense d'un palier (déterministe, équilibrée sur 50 paliers).</summary>
        public static Reward RewardAt(int tier, bool premium)
        {
            var r = new Reward { tier = tier, premium = premium };
            if (!premium)
            {
                if (tier % 10 == 0) r.gems = 30;
                else if (tier % 3 == 0) r.gems = 10;
                else r.money = 1500L * tier;
            }
            else
            {
                if (tier == 50) { r.gems = 200; r.itemId = "skin_conteneurs_chrome"; }
                else if (tier % 10 == 0) { r.gems = 60; r.itemId = "boost_recherche"; }
                else if (tier % 5 == 0) r.gems = 40;
                else r.money = 4000L * tier;
            }
            return r;
        }

        public bool IsClaimed(int tier, bool premium)
            => premium ? _s.meta.bpClaimedPremium.Contains(tier) : _s.meta.bpClaimedFree.Contains(tier);

        public bool Claim(int tier, bool premium, GameManager gm)
        {
            if (tier < 1 || tier > Tier || IsClaimed(tier, premium)) return false;
            if (premium && !_s.meta.bpPremium) return false;

            var r = RewardAt(tier, premium);
            if (r.money > 0) gm.Economy.Earn(r.money, Loc.T("bp.reward_label"));
            if (r.gems > 0) { _s.gems += r.gems; EventBus.RaiseMoneyChanged(); }
            if (!string.IsNullOrEmpty(r.itemId)) _s.meta.purchases.Add(r.itemId);

            (premium ? _s.meta.bpClaimedPremium : _s.meta.bpClaimedFree).Add(tier);
            return true;
        }

        public void BuyPremium(ShopManager shop)
        {
            if (_s.meta.bpPremium) return;
            shop.Payments.Purchase("bp_premium_s" + Season, MonetizationCatalog.BpPremiumPriceEur, ok =>
            {
                if (!ok) return;
                _s.meta.bpPremium = true;
                _s.meta.purchases.Add("bp_premium_s" + Season);
                EventBus.Notify(Loc.T("bp.premium_bought"), Loc.T("bp.premium_bought_body"), 0);
            });
        }

        /// <summary>Nouvelle saison : remise à zéro (appelé quand DaysLeft == 0).</summary>
        public void RolloverIfNeeded()
        {
            if (DaysLeft > 0) return;
            _s.meta.bpSeason++;
            _s.meta.bpXp = 0;
            _s.meta.bpPremium = false;
            _s.meta.bpStartIso = DateTime.UtcNow.ToString("o");
            _s.meta.bpClaimedFree.Clear();
            _s.meta.bpClaimedPremium.Clear();
            EventBus.Notify(Loc.T("bp.new_season", _s.meta.bpSeason), Loc.T("bp.new_season_body"), 0);
        }
    }
}
