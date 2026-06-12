using System.Collections.Generic;
using UnityEngine;

namespace CPT.World
{
    /// <summary>
    /// Matériaux procéduraux mis en cache. Compatible pipeline intégré (Standard)
    /// avec repli URP/Lit si le projet est migré vers URP.
    /// Variantes : usure (assombrissement) et pluie (lissage spéculaire).
    /// </summary>
    public static class MaterialFactory
    {
        static readonly Dictionary<Color, Material> _cache = new Dictionary<Color, Material>();
        static Shader _shader;
        static bool _wet;

        static Shader BaseShader
        {
            get
            {
                if (_shader == null)
                {
                    _shader = Shader.Find("Standard");
                    if (_shader == null) _shader = Shader.Find("Universal Render Pipeline/Lit");
                    if (_shader == null) _shader = Shader.Find("Diffuse");
                }
                return _shader;
            }
        }

        public static Material Get(Color c)
        {
            if (_cache.TryGetValue(c, out var m)) return m;
            m = new Material(BaseShader) { color = c };
            if (m.HasProperty("_Glossiness")) m.SetFloat("_Glossiness", _wet ? 0.7f : 0.25f);
            _cache[c] = m;
            return m;
        }

        /// <summary>Variante usée : la même teinte, assombrie et salie.</summary>
        public static Material GetWorn(Color c) => Get(Color.Lerp(c, new Color(0.25f, 0.23f, 0.2f), 0.45f));

        /// <summary>Variante météo : surfaces brillantes sous la pluie.</summary>
        public static void SetWetWeather(bool wet)
        {
            _wet = wet;
            foreach (var m in _cache.Values)
                if (m.HasProperty("_Glossiness")) m.SetFloat("_Glossiness", wet ? 0.7f : 0.25f);
        }

        // Teinte temporaire (chantiers) via MaterialPropertyBlock, sans dupliquer les matériaux.
        public static void Tint(GameObject go, Color c)
        {
            var block = new MaterialPropertyBlock();
            block.SetColor("_Color", c);
            foreach (var r in go.GetComponentsInChildren<Renderer>()) r.SetPropertyBlock(block);
        }

        public static void Untint(GameObject go)
        {
            foreach (var r in go.GetComponentsInChildren<Renderer>()) r.SetPropertyBlock(null);
        }
    }
}
