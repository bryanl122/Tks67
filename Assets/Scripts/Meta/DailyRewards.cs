using System;
using CPT.Core;

namespace CPT.Meta
{
    /// <summary>
    /// Calendrier de connexion : récompenses progressives sur 28 jours,
    /// série remise à zéro après un jour manqué, gros bonus mensuel au jour 28.
    /// </summary>
    public class DailyRewards
    {
        readonly GameState _s;
        public DailyRewards(GameState s) { _s = s; }

        public int Streak => _s.meta.loginStreak;

        public bool ClaimAvailable
        {
            get
            {
                string today = DateTime.UtcNow.ToString("yyyy-MM-dd");
                return _s.meta.lastLoginIso != today;
            }
        }

        public struct DayReward { public long money; public int gems; public bool isMonthly; }

        public static DayReward RewardForDay(int day) // day = 1..28
        {
            var r = new DayReward();
            if (day >= 28) { r.gems = 150; r.money = 50000; r.isMonthly = true; }
            else if (day % 7 == 0) { r.gems = 40; r.money = 8000; }
            else if (day % 3 == 0) { r.gems = 10; r.money = 2000 * day; }
            else r.money = 1000 + 500L * day;
            return r;
        }

        /// <summary>Appelé au lancement d'une session de jeu.</summary>
        public void ClaimToday(GameManager gm)
        {
            if (!ClaimAvailable) return;

            string today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            string yesterday = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd");
            _s.meta.loginStreak = _s.meta.lastLoginIso == yesterday ? _s.meta.loginStreak + 1 : 1;
            _s.meta.lastLoginIso = today;

            int calendarDay = (_s.meta.loginStreak - 1) % 28 + 1;
            var r = RewardForDay(calendarDay);
            if (r.money > 0) gm.Economy.Earn(r.money, Loc.T("daily.reward_label"));
            if (r.gems > 0) { _s.gems += r.gems; EventBus.RaiseMoneyChanged(); }

            string body = Loc.T("daily.body", calendarDay, Loc.Money(r.money), r.gems);
            if (r.isMonthly) body += "\n" + Loc.T("daily.monthly_bonus");
            EventBus.Notify(Loc.T("daily.title", _s.meta.loginStreak), body, 0);
            World.AudioManager.PlaySfx("cash");
        }
    }
}
