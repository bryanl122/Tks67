using System;

namespace CPT.Meta
{
    /// <summary>
    /// Événements commerciaux calés sur le calendrier réel :
    /// Noël, Nouvel An, Black Friday, anniversaire du jeu.
    /// Appliquent une remise boutique et un habillage saisonnier.
    /// </summary>
    public static class SeasonalEvents
    {
        public class EventDef
        {
            public string id;
            public int startMonth, startDay, endMonth, endDay;
            public float shopDiscount;
            public EventDef(string id, int sm, int sd, int em, int ed, float discount)
            { this.id = id; startMonth = sm; startDay = sd; endMonth = em; endDay = ed; shopDiscount = discount; }
        }

        public static readonly EventDef[] All =
        {
            new EventDef("noel",         12, 15, 12, 26, 0.25f),
            new EventDef("nouvel_an",    12, 27,  1,  5, 0.20f),
            new EventDef("black_friday", 11, 24, 11, 30, 0.35f),
            new EventDef("anniversaire",  6,  1,  6,  8, 0.30f),   // sortie du jeu : 1er juin
        };

        public static EventDef Current()
        {
            var now = DateTime.UtcNow;
            foreach (var e in All)
            {
                var start = new DateTime(now.Year, e.startMonth, e.startDay);
                var end = new DateTime(e.endMonth < e.startMonth ? now.Year + 1 : now.Year, e.endMonth, e.endDay, 23, 59, 59);
                if (now >= start && now <= end) return e;
                // fenêtre à cheval sur l'année (Nouvel An, vue depuis janvier)
                if (e.endMonth < e.startMonth)
                {
                    var start2 = new DateTime(now.Year - 1, e.startMonth, e.startDay);
                    var end2 = new DateTime(now.Year, e.endMonth, e.endDay, 23, 59, 59);
                    if (now >= start2 && now <= end2) return e;
                }
            }
            return null;
        }

        public static float CurrentDiscount()
        {
            var e = Current();
            return e?.shopDiscount ?? 0f;
        }
    }
}
