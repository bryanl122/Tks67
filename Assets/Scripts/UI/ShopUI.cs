using CPT.Core;
using CPT.Meta;
using UnityEngine;
using UnityEngine.UI;

namespace CPT.UI
{
    /// <summary>
    /// Boutique premium : EcoGems, offre du jour personnalisée, articles,
    /// accélérateurs, Battle Pass, abonnement VIP et calendrier de connexion.
    /// </summary>
    public static class ShopUI
    {
        static GameManager GM => GameManager.I;

        public static void Fill(RectTransform c)
        {
            float discount = SeasonalEvents.CurrentDiscount();
            var seasonal = SeasonalEvents.Current();
            if (seasonal != null)
                Banner(c, "🎉 " + Loc.T("event." + seasonal.id) + " — -" + Mathf.RoundToInt(discount * 100) + " % !", UITheme.Premium);

            Header(c, "◆ " + Loc.T("shop.gems_title", GM.S.gems));
            foreach (var pack in MonetizationCatalog.GemPacks)
            {
                string bonus = pack.bonusGems > 0 ? " <color=#f5b733>+" + pack.bonusGems + " " + Loc.T("shop.bonus") + "</color>" : "";
                Row(c, pack.Total + " " + MonetizationCatalog.CurrencyName + bonus,
                    pack.priceEur.ToString("0.00") + " €",
                    () => GM.Shop.BuyGems(pack, ok => UIManager.I.RefreshPanel("shop")), UITheme.Premium);
            }

            // Offre du jour (boutique dynamique)
            var highlight = GM.Shop.DailyHighlight();
            if (highlight != null)
            {
                Header(c, "⭐ " + Loc.T("shop.daily_offer"));
                ItemRow(c, highlight, discount + 0.15f);
            }

            // Articles par catégorie
            string[] cats = { "vehicule", "decoration", "skin", "ressources", "demarrage", "extension", "accelerateur" };
            foreach (var cat in cats)
            {
                bool any = false;
                foreach (var item in GM.Shop.OfferedItems())
                {
                    if (item.category != cat) continue;
                    if (!any) { Header(c, Loc.T("shopcat." + cat)); any = true; }
                    ItemRow(c, item, discount);
                }
            }

            // --- Battle Pass ---
            var bp = GM.BattlePass;
            Header(c, Loc.T("bp.title", bp.Season) + " — " + Loc.T("bp.days_left", bp.DaysLeft));
            Line(c, Loc.T("bp.tier", bp.Tier, MonetizationCatalog.BpTierCount),
                bp.XpInTier + "/" + MonetizationCatalog.BpXpPerTier + " XP");
            if (!bp.IsPremium)
                Row(c, Loc.T("bp.premium_offer"), MonetizationCatalog.BpPremiumPriceEur.ToString("0.00") + " €",
                    () => { bp.BuyPremium(GM.Shop); UIManager.I.RefreshPanel("shop"); }, UITheme.Premium);

            for (int tier = 1; tier <= Mathf.Min(bp.Tier + 3, MonetizationCatalog.BpTierCount); tier++)
            {
                int t = tier;
                var free = Meta.BattlePass.RewardAt(tier, false);
                var prem = Meta.BattlePass.RewardAt(tier, true);
                string freeTxt = RewardLabel(free) + (bp.IsClaimed(tier, false) ? " ✓" : "");
                string premTxt = "★ " + RewardLabel(prem) + (bp.IsClaimed(tier, true) ? " ✓" : "");
                bool freeClaimable = tier <= bp.Tier && !bp.IsClaimed(tier, false);
                bool premClaimable = tier <= bp.Tier && bp.IsPremium && !bp.IsClaimed(tier, true);

                Row(c, Loc.T("bp.tier_label", tier) + " — " + freeTxt + "  |  " + premTxt,
                    freeClaimable || premClaimable ? Loc.T("bp.claim") : "…",
                    () =>
                    {
                        bp.Claim(t, false, GM);
                        bp.Claim(t, true, GM);
                        UIManager.I.RefreshPanel("shop");
                    }, freeClaimable || premClaimable ? UITheme.Accent : new Color(0.3f, 0.3f, 0.3f));
            }

            // --- VIP ---
            Header(c, "👑 " + Loc.T("vip.title"));
            if (GM.Vip.IsActive) Line(c, Loc.T("vip.active", GM.Vip.DaysLeft), "✓");
            UIBuilder.Label(c, Loc.T("vip.perks", MonetizationCatalog.VipDailyGems,
                    Mathf.RoundToInt(MonetizationCatalog.VipShopDiscount * 100),
                    Mathf.RoundToInt(MonetizationCatalog.VipProgressBonus * 100)),
                UITheme.FontSizeSmall, UITheme.TextDim).gameObject.AddComponent<LayoutElement>().minHeight = 64;
            Row(c, Loc.T(GM.Vip.IsActive ? "vip.extend" : "vip.subscribe"),
                MonetizationCatalog.VipPriceEur.ToString("0.00") + " € / " + Loc.T("vip.month"),
                () => { GM.Vip.Subscribe(GM.Shop); UIManager.I.RefreshPanel("shop"); }, UITheme.Premium);

            // --- Calendrier de connexion ---
            Header(c, "📅 " + Loc.T("daily.calendar", GM.Daily.Streak));
            int calendarDay = (GM.Daily.Streak - 1) % 28 + 1;
            for (int d = Mathf.Max(1, calendarDay - 1); d <= Mathf.Min(28, calendarDay + 3); d++)
            {
                var r = DailyRewards.RewardForDay(d);
                Line(c, Loc.T("daily.day", d) + (d == calendarDay ? "  ←" : ""),
                    Loc.Money(r.money) + (r.gems > 0 ? " + " + r.gems + " ◆" : "") + (r.isMonthly ? " 🎁" : ""),
                    d == calendarDay ? UITheme.Accent : UITheme.TextDim);
            }
        }

        static string RewardLabel(Meta.BattlePass.Reward r)
        {
            if (!string.IsNullOrEmpty(r.itemId)) return Loc.T("shopitem." + r.itemId);
            if (r.gems > 0) return r.gems + " ◆";
            return Loc.Money(r.money);
        }

        static void ItemRow(RectTransform c, ShopItem item, float discount)
        {
            int price = Mathf.CeilToInt(item.gemPrice * (1f - Mathf.Clamp01(discount)));
            string priceTxt = discount > 0f
                ? "<color=#888><s>" + item.gemPrice + "</s></color> " + price + " ◆"
                : price + " ◆";
            Row(c, Loc.T("shopitem." + item.id) + "\n<color=#aaa>" + Loc.T("shopitem." + item.id + ".desc") + "</color>",
                priceTxt, () =>
                {
                    if (!GM.Shop.BuyItem(item, GM))
                        EventBus.Notify(Loc.T("shop.not_enough_gems"), "", 1);
                    UIManager.I.RefreshPanel("shop");
                }, GM.S.gems >= price ? UITheme.Primary : new Color(0.3f, 0.3f, 0.3f), 54);
        }

        // --- Aides locales ---
        static void Header(RectTransform c, string text)
        {
            var t = UIBuilder.Label(c, text, UITheme.FontSizeTitle - 4, UITheme.Premium);
            t.gameObject.AddComponent<LayoutElement>().minHeight = 36;
        }

        static void Banner(RectTransform c, string text, Color color)
        {
            var row = UIBuilder.Row(c, 44);
            row.GetComponent<Image>().color = new Color(color.r, color.g, color.b, 0.25f);
            var l = UIBuilder.Label(row, text, UITheme.FontSizeNormal, color, TextAnchor.MiddleCenter);
            UIBuilder.Stretch(l.rectTransform, 6);
        }

        static void Line(RectTransform c, string left, string right, Color? color = null)
        {
            var row = UIBuilder.Row(c, 30);
            var l = UIBuilder.Label(row, left, UITheme.FontSizeSmall, color ?? UITheme.TextMain);
            UIBuilder.SetRect(l, Vector2.zero, new Vector2(0.65f, 1), new Vector2(8, 0), Vector2.zero);
            var r = UIBuilder.Label(row, right, UITheme.FontSizeSmall, UITheme.TextDim, TextAnchor.MiddleRight);
            UIBuilder.SetRect(r, new Vector2(0.65f, 0), Vector2.one, Vector2.zero, new Vector2(-8, 0));
        }

        static void Row(RectTransform c, string text, string buttonLabel, System.Action onClick, Color btnColor, float height = 44)
        {
            var row = UIBuilder.Row(c, height);
            var l = UIBuilder.Label(row, text, UITheme.FontSizeSmall, UITheme.TextMain);
            l.supportRichText = true;
            UIBuilder.SetRect(l, Vector2.zero, new Vector2(0.68f, 1), new Vector2(8, 0), Vector2.zero);
            var b = UIBuilder.TextButton(row, buttonLabel, btnColor, onClick, UITheme.FontSizeSmall);
            UIBuilder.SetRect(b, new Vector2(0.70f, 0.12f), new Vector2(0.99f, 0.88f), Vector2.zero, Vector2.zero);
        }
    }
}
