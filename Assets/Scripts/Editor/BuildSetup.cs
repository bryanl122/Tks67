using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace CPT.EditorTools
{
    /// <summary>
    /// Outils éditeur : création de la scène principale, configuration des
    /// réglages joueur et lancement d'un build Windows/Linux/Steam Deck.
    /// Menu « CPT » dans la barre Unity.
    /// </summary>
    public static class BuildSetup
    {
        const string ScenePath = "Assets/Scenes/Main.unity";

        [MenuItem("CPT/1. Créer la scène principale")]
        public static void CreateMainScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            // Le Bootstrap construit tout au lancement : la scène reste volontairement vide.
            System.IO.Directory.CreateDirectory("Assets/Scenes");
            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
            Debug.Log("[CPT] Scène principale créée et ajoutée aux Build Settings.");
        }

        [MenuItem("CPT/2. Configurer les réglages joueur")]
        public static void ConfigurePlayerSettings()
        {
            PlayerSettings.productName = "Container Park Tycoon";
            PlayerSettings.companyName = "Recypark Studios";
            PlayerSettings.bundleVersion = "1.0.0";
            PlayerSettings.defaultScreenWidth = 1600;
            PlayerSettings.defaultScreenHeight = 900;
            PlayerSettings.runInBackground = true;
            PlayerSettings.colorSpace = ColorSpace.Linear;
            Debug.Log("[CPT] Réglages joueur configurés.");
        }

        [MenuItem("CPT/3. Build Windows 64 bits")]
        public static void BuildWindows() => Build(BuildTarget.StandaloneWindows64, "Builds/Windows/ContainerParkTycoon.exe");

        [MenuItem("CPT/3. Build Linux - Steam Deck")]
        public static void BuildLinux() => Build(BuildTarget.StandaloneLinux64, "Builds/Linux/ContainerParkTycoon.x86_64");

        static void Build(BuildTarget target, string path)
        {
            if (!System.IO.File.Exists(ScenePath)) CreateMainScene();
            ConfigurePlayerSettings();
            var report = BuildPipeline.BuildPlayer(new[] { ScenePath }, path, target, BuildOptions.None);
            Debug.Log("[CPT] Build " + target + " : " + report.summary.result + " → " + path);
        }
    }
}
