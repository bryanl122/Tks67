using UnityEngine;

namespace CPT.Core
{
    /// <summary>
    /// Point d'entrée unique : tout le jeu se construit par code au lancement,
    /// quelle que soit la scène ouverte (y compris une scène vide).
    /// Ordre : localisation → audio → caméra → éclairage → GameManager → UI → menu.
    /// </summary>
    public static class Bootstrap
    {
        static bool _initialized;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Init()
        {
            if (_initialized) return;
            _initialized = true;

            Application.targetFrameRate = 60;   // confort portable / Steam Deck
            QualitySettings.vSyncCount = 1;

            Loc.Init();

            var root = new GameObject("ContainerParkTycoon");
            Object.DontDestroyOnLoad(root);

            World.AudioManager.Create(root.transform);
            var cam = CameraController.Create();
            cam.transform.SetParent(root.transform);
            World.LightingController.Create(root.transform);

            root.AddComponent<GameManager>();
            UI.UIManager.Create().transform.SetParent(root.transform);
            UI.MainMenuUI.Create().transform.SetParent(root.transform);

            Debug.Log("[CPT] Container Park Tycoon initialisé — bon tri !");
        }
    }
}
