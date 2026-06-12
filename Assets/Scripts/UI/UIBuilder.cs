using UnityEngine;
using UnityEngine.UI;

namespace CPT.UI
{
    /// <summary>Boîte à outils : construction d'interface uGUI entièrement par code.</summary>
    public static class UIBuilder
    {
        public static Canvas CreateCanvas(string name, int sortOrder = 0)
        {
            var go = new GameObject(name);
            var canvas = go.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = sortOrder;
            var scaler = go.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1600, 900);   // adapté Steam Deck (1280×800)
            scaler.matchWidthOrHeight = 0.5f;
            go.AddComponent<GraphicRaycaster>();

            if (Object.FindFirstObjectByType<UnityEngine.EventSystems.EventSystem>() == null)
            {
                var es = new GameObject("EventSystem");
                es.AddComponent<UnityEngine.EventSystems.EventSystem>();
                es.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
            }
            return canvas;
        }

        public static RectTransform Panel(Transform parent, string name, Color bg,
            Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin = default, Vector2 offsetMax = default)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            var img = go.AddComponent<Image>();
            img.color = bg;
            var rt = go.GetComponent<RectTransform>();
            rt.anchorMin = anchorMin; rt.anchorMax = anchorMax;
            rt.offsetMin = offsetMin; rt.offsetMax = offsetMax;
            return rt;
        }

        public static Text Label(Transform parent, string text, int size, Color color,
            TextAnchor align = TextAnchor.MiddleLeft)
        {
            var go = new GameObject("label");
            go.transform.SetParent(parent, false);
            var t = go.AddComponent<Text>();
            t.font = UITheme.Font;
            t.text = text;
            t.fontSize = size;
            t.color = color;
            t.alignment = align;
            t.horizontalOverflow = HorizontalWrapMode.Wrap;
            t.verticalOverflow = VerticalWrapMode.Overflow;
            return t;
        }

        public static Button TextButton(Transform parent, string label, Color bg, System.Action onClick, int fontSize = UITheme.FontSizeNormal)
        {
            var go = new GameObject("btn_" + label);
            go.transform.SetParent(parent, false);
            var img = go.AddComponent<Image>();
            img.color = bg;
            var btn = go.AddComponent<Button>();
            var colors = btn.colors;
            colors.highlightedColor = new Color(1.15f, 1.15f, 1.15f, 1f);
            colors.pressedColor = new Color(0.8f, 0.8f, 0.8f, 1f);
            btn.colors = colors;
            btn.onClick.AddListener(() => { World.AudioManager.PlaySfx("click"); onClick?.Invoke(); });

            var txt = Label(go.transform, label, fontSize, UITheme.TextMain, TextAnchor.MiddleCenter);
            Stretch(txt.rectTransform);
            return btn;
        }

        public static void Stretch(RectTransform rt, float pad = 0)
        {
            rt.anchorMin = Vector2.zero; rt.anchorMax = Vector2.one;
            rt.offsetMin = new Vector2(pad, pad); rt.offsetMax = new Vector2(-pad, -pad);
        }

        public static void SetRect(Component c, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax)
        {
            var rt = c.GetComponent<RectTransform>();
            rt.anchorMin = anchorMin; rt.anchorMax = anchorMax;
            rt.offsetMin = offsetMin; rt.offsetMax = offsetMax;
        }

        /// <summary>Liste défilante verticale ; retourne le conteneur où ajouter des lignes.</summary>
        public static RectTransform ScrollList(Transform parent, Vector2 anchorMin, Vector2 anchorMax,
            Vector2 offsetMin = default, Vector2 offsetMax = default)
        {
            var viewport = Panel(parent, "scroll", new Color(0, 0, 0, 0.25f), anchorMin, anchorMax, offsetMin, offsetMax);
            viewport.gameObject.AddComponent<RectMask2D>();
            var scroll = viewport.gameObject.AddComponent<ScrollRect>();

            var content = new GameObject("content");
            content.transform.SetParent(viewport, false);
            var crt = content.AddComponent<RectTransform>();
            crt.anchorMin = new Vector2(0, 1); crt.anchorMax = Vector2.one;
            crt.pivot = new Vector2(0.5f, 1);
            crt.offsetMin = Vector2.zero; crt.offsetMax = Vector2.zero;

            var layout = content.AddComponent<VerticalLayoutGroup>();
            layout.padding = new RectOffset(8, 8, 8, 8);
            layout.spacing = 6;
            layout.childForceExpandHeight = false;
            layout.childForceExpandWidth = true;
            layout.childControlHeight = true;
            layout.childControlWidth = true;
            var fitter = content.AddComponent<ContentSizeFitter>();
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            scroll.content = crt;
            scroll.horizontal = false;
            scroll.scrollSensitivity = 25f;
            return crt;
        }

        /// <summary>Ligne de liste : fond léger + hauteur fixe, retourne son transform.</summary>
        public static RectTransform Row(Transform listContent, float height = 44)
        {
            var go = new GameObject("row");
            go.transform.SetParent(listContent, false);
            var img = go.AddComponent<Image>();
            img.color = UITheme.PanelBgLight;
            var le = go.AddComponent<LayoutElement>();
            le.minHeight = height; le.preferredHeight = height;
            return go.GetComponent<RectTransform>();
        }

        public static Slider VolumeSlider(Transform parent, float value, System.Action<float> onChange)
        {
            var go = new GameObject("slider");
            go.transform.SetParent(parent, false);
            var bg = go.AddComponent<Image>();
            bg.color = new Color(0, 0, 0, 0.5f);
            var slider = go.AddComponent<Slider>();

            var fillArea = new GameObject("fill");
            fillArea.transform.SetParent(go.transform, false);
            var fillImg = fillArea.AddComponent<Image>();
            fillImg.color = UITheme.Accent;
            var frt = fillArea.GetComponent<RectTransform>();
            frt.anchorMin = Vector2.zero; frt.anchorMax = new Vector2(value, 1);
            frt.offsetMin = Vector2.zero; frt.offsetMax = Vector2.zero;

            slider.fillRect = frt;
            slider.value = value;
            slider.onValueChanged.AddListener(v =>
            {
                frt.anchorMax = new Vector2(v, 1);
                onChange?.Invoke(v);
            });
            return slider;
        }

        public static Image ProgressBar(Transform parent, float ratio, Color color)
        {
            var bgGo = new GameObject("bar_bg");
            bgGo.transform.SetParent(parent, false);
            bgGo.AddComponent<Image>().color = new Color(0, 0, 0, 0.5f);
            var fillGo = new GameObject("bar_fill");
            fillGo.transform.SetParent(bgGo.transform, false);
            var fill = fillGo.AddComponent<Image>();
            fill.color = color;
            var rt = fillGo.GetComponent<RectTransform>();
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = new Vector2(Mathf.Clamp01(ratio), 1);
            rt.offsetMin = Vector2.zero; rt.offsetMax = Vector2.zero;
            return fill;
        }
    }
}
