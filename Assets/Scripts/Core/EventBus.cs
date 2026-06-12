using System;

namespace CPT.Core
{
    /// <summary>
    /// Bus d'événements global, découple la simulation, l'UI, les succès et les statistiques.
    /// </summary>
    public static class EventBus
    {
        public static event Action<int> NewDay;            // numéro du jour
        public static event Action<int> NewMonth;          // numéro du mois
        public static event Action LanguageChanged;
        public static event Action<string, string, int> Notification; // titre, corps, gravité (0 info, 1 alerte, 2 critique)
        public static event Action<string, double> Stat;   // canal statistique pour succès/missions ("tons", "visitors", ...)
        public static event Action MoneyChanged;
        public static event Action GameLoaded;
        public static event Action<string> IncidentStarted; // id incident

        public static void RaiseNewDay(int d) => NewDay?.Invoke(d);
        public static void RaiseNewMonth(int m) => NewMonth?.Invoke(m);
        public static void RaiseLanguageChanged() => LanguageChanged?.Invoke();
        public static void Notify(string title, string body, int severity = 0) => Notification?.Invoke(title, body, severity);
        public static void RaiseStat(string key, double value) => Stat?.Invoke(key, value);
        public static void RaiseMoneyChanged() => MoneyChanged?.Invoke();
        public static void RaiseGameLoaded() => GameLoaded?.Invoke();
        public static void RaiseIncident(string id) => IncidentStarted?.Invoke(id);

        /// <summary>
        /// Purge les abonnés liés à la simulation (changement de partie).
        /// Les canaux UI (Notification, GameLoaded, LanguageChanged) sont conservés :
        /// l'interface vit plus longtemps que les sessions de jeu.
        /// </summary>
        public static void Clear()
        {
            NewDay = null; NewMonth = null; Stat = null;
            MoneyChanged = null; IncidentStarted = null;
        }
    }
}
