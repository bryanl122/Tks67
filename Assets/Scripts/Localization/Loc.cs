using System.Collections.Generic;
using UnityEngine;

namespace CPT.Core
{
    /// <summary>
    /// Système de localisation. Le français est la langue source officielle.
    /// Les tables sont des fichiers "clé=valeur" dans Resources/Localization/.
    /// Changement de langue à chaud : Loc.SetLanguage déclenche EventBus.LanguageChanged.
    /// </summary>
    public static class Loc
    {
        public static readonly string[] Languages = { "fr", "en", "nl", "de", "es", "it" };
        public static readonly string[] LanguageNames = { "Français", "English", "Nederlands", "Deutsch", "Español", "Italiano" };

        static Dictionary<string, string> _table = new Dictionary<string, string>();
        static Dictionary<string, string> _fallbackFr = new Dictionary<string, string>();
        public static string Current { get; private set; } = "fr";

        public static void Init()
        {
            _fallbackFr = LoadTable("fr");
            string saved = PlayerPrefs.GetString("cpt_lang", "fr");
            SetLanguage(saved, false);
        }

        public static void SetLanguage(string code, bool notify = true)
        {
            if (System.Array.IndexOf(Languages, code) < 0) code = "fr";
            Current = code;
            _table = code == "fr" ? _fallbackFr : LoadTable(code);
            PlayerPrefs.SetString("cpt_lang", code);
            if (notify) EventBus.RaiseLanguageChanged();
        }

        static Dictionary<string, string> LoadTable(string code)
        {
            var d = new Dictionary<string, string>();
            var asset = Resources.Load<TextAsset>("Localization/" + code);
            if (asset == null) { Debug.LogWarning("[Loc] Table absente: " + code); return d; }
            foreach (var raw in asset.text.Split('\n'))
            {
                var line = raw.Trim();
                if (line.Length == 0 || line.StartsWith("#")) continue;
                int eq = line.IndexOf('=');
                if (eq <= 0) continue;
                d[line.Substring(0, eq).Trim()] = line.Substring(eq + 1).Trim().Replace("\\n", "\n");
            }
            return d;
        }

        /// <summary>Traduit une clé. Repli : table française, puis la clé elle-même.</summary>
        public static string T(string key)
        {
            if (_table.TryGetValue(key, out var v)) return v;
            if (_fallbackFr.TryGetValue(key, out var f)) return f;
            return key;
        }

        public static string T(string key, params object[] args)
        {
            try { return string.Format(T(key), args); }
            catch { return T(key); }
        }

        /// <summary>Format monétaire européen.</summary>
        public static string Money(long cents) => Money((double)cents);
        public static string Money(double euros)
        {
            string s = euros.ToString("N0", System.Globalization.CultureInfo.GetCultureInfo("fr-BE"));
            return s + " €";
        }
    }
}
