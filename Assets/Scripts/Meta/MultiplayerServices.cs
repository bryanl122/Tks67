using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace CPT.Meta
{
    /// <summary>
    /// Architecture multijoueur et services en ligne.
    /// Interfaces stables + implémentations locales (fonctionnelles hors-ligne).
    /// En production : implémentations Steam (Steamworks Leaderboards, Steam Cloud,
    /// Steam Networking Sockets pour la session coopérative hôte-invités).
    /// </summary>
    public interface ICloudSaveService
    {
        void Upload(string profileId, string json, Action<bool> done);
        void Download(string profileId, Action<string> done);   // null si absent
    }

    public interface ILeaderboardService
    {
        void Submit(string board, string player, double score);
        List<KeyValuePair<string, double>> Top(string board, int count);
    }

    /// <summary>
    /// Session coopérative : l'hôte fait autorité sur la simulation, les invités
    /// envoient des commandes (construire, embaucher, signer) rejouées par l'hôte.
    /// L'implémentation locale simule une session solo « hébergée ».
    /// </summary>
    public interface ICoopSession
    {
        bool IsHost { get; }
        bool IsConnected { get; }
        void Host(string sessionName);
        void Join(string sessionCode);
        void SendCommand(string command, string payloadJson);
        void Leave();
    }

    // --- Implémentations locales ---

    public class LocalCloudSave : ICloudSaveService
    {
        static string Dir => Path.Combine(Application.persistentDataPath, "cloud");

        public void Upload(string profileId, string json, Action<bool> done)
        {
            try
            {
                Directory.CreateDirectory(Dir);
                File.WriteAllText(Path.Combine(Dir, profileId + ".json"), json);
                done?.Invoke(true);
            }
            catch (Exception e) { Debug.LogError("[Cloud] " + e.Message); done?.Invoke(false); }
        }

        public void Download(string profileId, Action<string> done)
        {
            string path = Path.Combine(Dir, profileId + ".json");
            done?.Invoke(File.Exists(path) ? File.ReadAllText(path) : null);
        }
    }

    public class LocalLeaderboard : ILeaderboardService
    {
        // Classements mondiaux : tonnes recyclées, bénéfices, satisfaction.
        public static readonly string[] Boards = { "tons", "profit", "satisfaction" };

        string PrefKey(string board) => "cpt_lb_" + board;

        public void Submit(string board, string player, double score)
        {
            var top = Top(board, 10);
            top.Add(new KeyValuePair<string, double>(player, score));
            top.Sort((a, b) => b.Value.CompareTo(a.Value));
            if (top.Count > 10) top.RemoveRange(10, top.Count - 10);
            var sb = new System.Text.StringBuilder();
            foreach (var kv in top) sb.Append(kv.Key).Append('|').Append(kv.Value).Append(';');
            PlayerPrefs.SetString(PrefKey(board), sb.ToString());
        }

        public List<KeyValuePair<string, double>> Top(string board, int count)
        {
            var list = new List<KeyValuePair<string, double>>();
            foreach (var entry in PlayerPrefs.GetString(PrefKey(board), "").Split(';'))
            {
                var parts = entry.Split('|');
                if (parts.Length == 2 && double.TryParse(parts[1], out var v))
                    list.Add(new KeyValuePair<string, double>(parts[0], v));
                if (list.Count >= count) break;
            }
            return list;
        }
    }

    public class LocalCoopSession : ICoopSession
    {
        public bool IsHost { get; private set; }
        public bool IsConnected { get; private set; }

        public void Host(string sessionName)
        {
            IsHost = true; IsConnected = true;
            Debug.Log("[Coop] Session hébergée : " + sessionName + " (mode local)");
        }

        public void Join(string sessionCode)
        {
            IsHost = false; IsConnected = true;
            Debug.Log("[Coop] Session rejointe : " + sessionCode + " (mode local)");
        }

        public void SendCommand(string command, string payloadJson)
        {
            // En réseau réel : sérialisation + envoi à l'hôte. En local : exécution directe.
            Debug.Log("[Coop] Commande : " + command);
        }

        public void Leave() { IsConnected = false; }
    }

    /// <summary>Point d'accès unique aux services en ligne.</summary>
    public static class OnlineServices
    {
        public static ICloudSaveService Cloud = new LocalCloudSave();
        public static ILeaderboardService Leaderboards = new LocalLeaderboard();
        public static ICoopSession Coop = new LocalCoopSession();
    }
}
