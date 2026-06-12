using CPT.Core;
using CPT.Data;

namespace CPT.Sim
{
    /// <summary>
    /// Succès : vérifie les 116 définitions contre les compteurs cumulés,
    /// notifie, crédite les EcoGems et débloque les titres de profil.
    /// </summary>
    public class AchievementManager
    {
        readonly GameState _s;
        readonly StatsTracker _stats;

        public AchievementManager(GameState s, StatsTracker stats)
        {
            _s = s; _stats = stats;
            EventBus.Stat += (_, __) => _dirty = true;
        }

        bool _dirty = true;

        public bool IsUnlocked(string id) => _s.achievements.Contains(id);
        public int UnlockedCount => _s.achievements.Count;
        public int TotalCount => AchievementDatabase.All.Count;

        /// <summary>Appelé chaque seconde par GameManager (évite de vérifier à chaque événement).</summary>
        public void Poll()
        {
            if (!_dirty) return;
            _dirty = false;
            foreach (var a in AchievementDatabase.All)
            {
                if (IsUnlocked(a.id)) continue;
                if (_stats.Get(a.statKey) >= a.threshold)
                    Unlock(a);
            }
        }

        void Unlock(AchievementDef a)
        {
            _s.achievements.Add(a.id);
            _s.gems += a.rewardGems;
            string title = Loc.T("ach." + a.family) + (a.tier > 0 ? " " + ToRoman(a.tier) : "");
            string body = Loc.T("ach.unlocked_body", a.rewardGems);
            if (!string.IsNullOrEmpty(a.titleReward))
                body += "\n" + Loc.T("ach.title_unlocked", Loc.T(a.titleReward));
            EventBus.Notify("🏆 " + title, body, 0);
            World.AudioManager.PlaySfx("achievement");
        }

        public static string ToRoman(int n)
        {
            string[] r = { "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X" };
            return n >= 0 && n < r.Length ? r[n] : n.ToString();
        }
    }
}
