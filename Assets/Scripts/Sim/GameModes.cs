using CPT.Core;
using CPT.Data;

namespace CPT.Sim
{
    /// <summary>
    /// Configuration des quatre modes : Carrière, Sandbox, Défi, Coopératif.
    /// </summary>
    public static class GameModes
    {
        public const int Career = 0, Sandbox = 1, Challenge = 2, Coop = 3;

        public static GameState CreateNewGame(int mode, string profile, int challengeId = 0)
        {
            var s = new GameState { mode = mode, profile = profile, challengeId = challengeId };

            switch (mode)
            {
                case Career:
                    s.money = 25000;
                    s.gems = 50;
                    break;

                case Sandbox:
                    // Bac à sable : trésorerie illimitée de fait, tout débloqué
                    s.money = 10000000;
                    s.gems = 500;
                    s.tutorialDone = true;
                    foreach (var r in ResearchTree.All) s.researchDone.Add(r.id);
                    break;

                case Challenge:
                    var c = MissionDatabase.Challenges[
                        UnityEngine.Mathf.Clamp(challengeId, 0, MissionDatabase.Challenges.Count - 1)];
                    s.money = c.startMoney;
                    s.gems = 25;
                    s.tutorialDone = true;
                    break;

                case Coop:
                    // Coopératif : mêmes règles que Carrière ; la session est partagée
                    // via MultiplayerServices (architecture hôte-invités, sauvegarde cloud).
                    s.money = 40000;
                    s.gems = 50;
                    s.tutorialDone = true;
                    break;
            }

            // Premier site : Recypark Wavre, avec l'essentiel pré-construit
            var site = new SiteData();
            s.sites.Add(site);
            site.buildings.Add(new BuildingData { typeId = "cont_carton", x = 8, z = 20, streamId = "carton" });
            site.buildings.Add(new BuildingData { typeId = "cont_pmc", x = 14, z = 20, streamId = "pmc" });
            site.buildings.Add(new BuildingData { typeId = "cont_verre", x = 20, z = 20, streamId = "verre" });
            site.buildings.Add(new BuildingData { typeId = "bureau", x = 36, z = 4 });
            site.buildings.Add(new BuildingData { typeId = "parking", x = 4, z = 4 });

            return s;
        }
    }
}
