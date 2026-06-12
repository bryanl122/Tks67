using UnityEngine;

namespace CPT.UI
{
    /// <summary>
    /// Direction artistique de l'interface : « éco-industriel chaleureux ».
    /// Vert profond + lime énergique, panneaux ardoise translucides, accents ambre
    /// pour le premium. Typographie système lisible (LegacyRuntime) pour Steam Deck.
    /// </summary>
    public static class UITheme
    {
        public static readonly Color Primary = new Color(0.11f, 0.37f, 0.13f);        // vert profond
        public static readonly Color Accent = new Color(0.62f, 0.85f, 0.24f);         // lime
        public static readonly Color Premium = new Color(0.95f, 0.72f, 0.20f);        // ambre EcoGems
        public static readonly Color PanelBg = new Color(0.10f, 0.12f, 0.14f, 0.94f); // ardoise
        public static readonly Color PanelBgLight = new Color(0.16f, 0.19f, 0.22f, 0.95f);
        public static readonly Color TextMain = new Color(0.94f, 0.96f, 0.94f);
        public static readonly Color TextDim = new Color(0.65f, 0.70f, 0.68f);
        public static readonly Color Danger = new Color(0.85f, 0.25f, 0.20f);
        public static readonly Color Warning = new Color(0.92f, 0.65f, 0.18f);
        public static readonly Color Ok = new Color(0.35f, 0.75f, 0.35f);

        static Font _font;
        public static Font Font
        {
            get
            {
                if (_font == null)
                {
                    _font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
                    if (_font == null) _font = Font.CreateDynamicFontFromOSFont("Arial", 14);
                }
                return _font;
            }
        }

        public const int FontSizeSmall = 13;
        public const int FontSizeNormal = 15;
        public const int FontSizeTitle = 22;
        public const int FontSizeHero = 40;
    }
}
