using CPT.Sim;
using UnityEngine;

namespace CPT.World
{
    /// <summary>
    /// Effets visuels procéduraux : pluie, neige, brouillard, feu, fumée,
    /// étincelles et poussière. Tous construits par code (ParticleSystem).
    /// </summary>
    public static class VFXFactory
    {
        static ParticleSystem _rain, _snow;
        static Transform _weatherRoot;

        public static void EnsureWeatherRig(Transform followCamera)
        {
            if (_weatherRoot != null) return;
            _weatherRoot = new GameObject("VFX_Meteo").transform;
            _weatherRoot.SetParent(followCamera, false);
            _weatherRoot.localPosition = new Vector3(0, 25f, 20f);

            _rain = MakeSystem(_weatherRoot, "pluie", new Color(0.6f, 0.7f, 0.9f, 0.5f),
                size: 0.06f, speed: 22f, rate: 900f, box: new Vector3(60f, 1f, 60f), stretch: true);
            _snow = MakeSystem(_weatherRoot, "neige", new Color(1f, 1f, 1f, 0.9f),
                size: 0.12f, speed: 2.5f, rate: 350f, box: new Vector3(60f, 1f, 60f), stretch: false);
            _rain.Stop(); _snow.Stop();
        }

        public static void SetWeather(WeatherType t)
        {
            if (_rain == null) return;
            bool rain = t == WeatherType.Pluie || t == WeatherType.Tempete;
            bool snow = t == WeatherType.Neige;
            if (rain) _rain.Play(); else _rain.Stop();
            if (snow) _snow.Play(); else _snow.Stop();
            MaterialFactory.SetWetWeather(rain);

            bool fog = t == WeatherType.Brouillard;
            RenderSettings.fog = fog || t == WeatherType.Tempete;
            RenderSettings.fogMode = FogMode.Exponential;
            RenderSettings.fogDensity = fog ? 0.035f : 0.012f;
            RenderSettings.fogColor = fog ? new Color(0.75f, 0.77f, 0.8f) : new Color(0.55f, 0.6f, 0.68f);
        }

        /// <summary>Feu + fumée + étincelles sur un bâtiment en flammes.</summary>
        public static void AttachFire(Transform target)
        {
            if (target.Find("VFX_Feu") != null) return;
            var root = new GameObject("VFX_Feu").transform;
            root.SetParent(target, false);
            root.localPosition = new Vector3(0, 1.5f, 0);

            MakeSystem(root, "flammes", new Color(1f, 0.45f, 0.1f, 0.9f),
                size: 0.8f, speed: 3f, rate: 60f, box: new Vector3(3f, 0.5f, 2f), stretch: false, up: true);
            MakeSystem(root, "fumee", new Color(0.2f, 0.2f, 0.2f, 0.5f),
                size: 1.6f, speed: 1.8f, rate: 25f, box: new Vector3(2f, 0.5f, 1.5f), stretch: false, up: true);
            MakeSystem(root, "etincelles", new Color(1f, 0.8f, 0.3f, 1f),
                size: 0.1f, speed: 6f, rate: 30f, box: new Vector3(2f, 0.5f, 1.5f), stretch: false, up: true);

            var light = root.gameObject.AddComponent<Light>();
            light.type = LightType.Point;
            light.color = new Color(1f, 0.55f, 0.2f);
            light.range = 12f; light.intensity = 2.5f;
            AudioManager.PlaySfx("alarm");
        }

        public static void DetachFire(Transform target)
        {
            var fx = target.Find("VFX_Feu");
            if (fx != null) Object.Destroy(fx.gameObject);
        }

        /// <summary>Nuage de poussière ponctuel (déchargement, démolition).</summary>
        public static void DustPuff(Vector3 position)
        {
            var go = new GameObject("VFX_Poussiere");
            go.transform.position = position;
            var ps = MakeSystem(go.transform, "poussiere", new Color(0.7f, 0.65f, 0.55f, 0.5f),
                size: 0.7f, speed: 1.5f, rate: 0f, box: new Vector3(1.5f, 0.3f, 1.5f), stretch: false, up: true);
            ps.Emit(18);
            Object.Destroy(go, 3f);
        }

        static ParticleSystem MakeSystem(Transform parent, string name, Color color, float size,
            float speed, float rate, Vector3 box, bool stretch, bool up = false)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            var ps = go.AddComponent<ParticleSystem>();

            var main = ps.main;
            main.startColor = color;
            main.startSize = size;
            main.startSpeed = up ? speed : -speed;
            main.startLifetime = up ? 2.2f : 3f;
            main.maxParticles = 2000;
            main.simulationSpace = ParticleSystemSimulationSpace.World;

            var emission = ps.emission;
            emission.rateOverTime = rate;

            var shape = ps.shape;
            shape.shapeType = ParticleSystemShapeType.Box;
            shape.scale = box;
            if (!up) go.transform.localRotation = Quaternion.Euler(90, 0, 0); // chute verticale

            var renderer = ps.GetComponent<ParticleSystemRenderer>();
            renderer.renderMode = stretch ? ParticleSystemRenderMode.Stretch : ParticleSystemRenderMode.Billboard;
            if (stretch) { renderer.lengthScale = 6f; }
            var shader = Shader.Find("Particles/Standard Unlit") ?? Shader.Find("Sprites/Default");
            if (shader != null) renderer.sharedMaterial = new Material(shader) { color = color };
            return ps;
        }
    }
}
