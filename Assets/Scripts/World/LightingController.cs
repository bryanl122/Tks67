using CPT.Core;
using UnityEngine;

namespace CPT.World
{
    /// <summary>
    /// Cycle jour/nuit : soleil directionnel piloté par l'heure de jeu,
    /// couleurs d'ambiance, allumage des lampadaires la nuit.
    /// </summary>
    public class LightingController : MonoBehaviour
    {
        Light _sun;
        float _lampTimer;

        public static LightingController Create(Transform parent)
        {
            var go = new GameObject("LightingController");
            go.transform.SetParent(parent);
            return go.AddComponent<LightingController>();
        }

        void Awake()
        {
            var sunGo = new GameObject("Soleil");
            sunGo.transform.SetParent(transform);
            _sun = sunGo.AddComponent<Light>();
            _sun.type = LightType.Directional;
            _sun.shadows = LightShadows.Soft;
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
        }

        void Update()
        {
            var gm = GameManager.I;
            if (gm == null || !gm.Running) return;

            float hour = gm.S.hour;
            // Le soleil se lève à 6 h, culmine à 13 h, se couche à 20 h.
            float dayProgress = Mathf.InverseLerp(6f, 20f, hour);
            bool isDay = hour >= 6f && hour <= 20f;

            float elevation = isDay ? Mathf.Sin(dayProgress * Mathf.PI) * 60f : -20f;
            _sun.transform.rotation = Quaternion.Euler(elevation, dayProgress * 180f + 90f, 0);

            float intensity = isDay ? Mathf.Clamp01(Mathf.Sin(dayProgress * Mathf.PI)) : 0f;
            if (gm.Weather.Current == Sim.WeatherType.Nuageux) intensity *= 0.7f;
            if (gm.Weather.Current == Sim.WeatherType.Pluie || gm.Weather.Current == Sim.WeatherType.Brouillard) intensity *= 0.5f;
            if (gm.Weather.Current == Sim.WeatherType.Tempete) intensity *= 0.35f;
            _sun.intensity = Mathf.Lerp(0.05f, 1.1f, intensity);
            _sun.color = Color.Lerp(new Color(1f, 0.6f, 0.4f), Color.white, intensity); // aube/crépuscule orangés

            RenderSettings.ambientSkyColor = Color.Lerp(new Color(0.08f, 0.09f, 0.15f), new Color(0.6f, 0.68f, 0.8f), intensity);
            RenderSettings.ambientEquatorColor = Color.Lerp(new Color(0.05f, 0.05f, 0.1f), new Color(0.45f, 0.48f, 0.5f), intensity);
            RenderSettings.ambientGroundColor = Color.Lerp(new Color(0.03f, 0.03f, 0.05f), new Color(0.25f, 0.27f, 0.25f), intensity);

            // Lampadaires : vérification allégée (2 fois par seconde)
            _lampTimer += Time.deltaTime;
            if (_lampTimer > 0.5f)
            {
                _lampTimer = 0f;
                bool lampsOn = !isDay || intensity < 0.25f;
                foreach (var lamp in GameObject.FindObjectsByType<Light>(FindObjectsSortMode.None))
                    if (lamp.gameObject.name == "lampe_eclairage")
                        lamp.intensity = lampsOn ? 2.2f : 0f;
            }
        }
    }
}
