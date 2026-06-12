using UnityEngine;

namespace CPT.Core
{
    /// <summary>
    /// Horloge de simulation : heures, jours, mois, saisons.
    /// Un jour de jeu dure 6 minutes réelles à vitesse 1.
    /// Le parc est ouvert de 8 h à 18 h (les visiteurs n'arrivent que dans ce créneau).
    /// </summary>
    public class GameClock
    {
        public const float RealSecondsPerDay = 360f;
        public const int DaysPerMonth = 30;
        public const int MonthsPerYear = 12;

        readonly GameState _s;
        public GameClock(GameState s) { _s = s; }

        public int Day => _s.day;
        public float Hour => _s.hour;
        public int Month => ((_s.day - 1) / DaysPerMonth) % MonthsPerYear + 1;     // 1..12
        public int Year => (_s.day - 1) / (DaysPerMonth * MonthsPerYear) + 1;
        public int DayOfMonth => (_s.day - 1) % DaysPerMonth + 1;
        public int DayOfWeek => (_s.day - 1) % 7;                                  // 0 = lundi
        public bool IsWeekend => DayOfWeek >= 5;
        public bool IsOpen => _s.hour >= 8f && _s.hour < 18f && _s.speed > 0;

        /// <summary>0 hiver, 1 printemps, 2 été, 3 automne (calé sur le mois).</summary>
        public int Season
        {
            get
            {
                int m = Month;
                if (m == 12 || m <= 2) return 0;
                if (m <= 5) return 1;
                if (m <= 8) return 2;
                return 3;
            }
        }

        /// <summary>Avance le temps. Retourne le nombre d'heures de jeu écoulées ce tick.</summary>
        public float Tick(float realDt)
        {
            if (_s.speed <= 0) return 0f;
            float gameHours = realDt * _s.speed * 24f / RealSecondsPerDay;
            _s.hour += gameHours;
            while (_s.hour >= 24f)
            {
                _s.hour -= 24f;
                _s.day++;
                EventBus.RaiseNewDay(_s.day);
                if ((_s.day - 1) % DaysPerMonth == 0)
                    EventBus.RaiseNewMonth(Month);
            }
            return gameHours;
        }

        public string DateLabel()
        {
            return Loc.T("ui.date_fmt", DayOfMonth, Loc.T("month." + Month), Year);
        }

        public string TimeLabel()
        {
            int h = Mathf.FloorToInt(_s.hour);
            int m = Mathf.FloorToInt((_s.hour - h) * 60f);
            return h.ToString("00") + ":" + m.ToString("00");
        }
    }
}
