using System.IO;
using CPT.Meta;
using UnityEngine;

namespace CPT.Core
{
    /// <summary>
    /// Sauvegarde locale (3 profils) + synchronisation cloud (Steam Cloud en production,
    /// répertoire local en développement). Autosauvegarde quotidienne en jeu.
    /// </summary>
    public static class SaveSystem
    {
        public const int SlotCount = 3;

        static string Dir => Path.Combine(Application.persistentDataPath, "saves");
        static string PathFor(int slot) => Path.Combine(Dir, "profil" + slot + ".json");

        public static bool Exists(int slot) => File.Exists(PathFor(slot));

        public static string SlotLabel(int slot)
        {
            if (!Exists(slot)) return Loc.T("save.empty_slot");
            var s = Load(slot);
            return s == null ? Loc.T("save.corrupt") :
                s.profile + " — " + Loc.T("mode." + s.mode) + ", " + Loc.T("save.day", s.day);
        }

        public static void Save(GameState state, int slot, bool cloud = true)
        {
            try
            {
                Directory.CreateDirectory(Dir);
                string json = JsonUtility.ToJson(state);
                File.WriteAllText(PathFor(slot), json);
                if (cloud)
                    OnlineServices.Cloud.Upload("profil" + slot, json, ok =>
                    {
                        if (!ok) Debug.LogWarning("[Save] Synchronisation cloud échouée (sauvegarde locale OK).");
                    });
            }
            catch (System.Exception e)
            {
                Debug.LogError("[Save] " + e.Message);
                EventBus.Notify(Loc.T("save.failed"), e.Message, 2);
            }
        }

        public static GameState Load(int slot)
        {
            try
            {
                if (!Exists(slot)) return null;
                return JsonUtility.FromJson<GameState>(File.ReadAllText(PathFor(slot)));
            }
            catch (System.Exception e)
            {
                Debug.LogError("[Save] Lecture impossible : " + e.Message);
                return null;
            }
        }

        public static void Delete(int slot)
        {
            if (Exists(slot)) File.Delete(PathFor(slot));
        }
    }
}
