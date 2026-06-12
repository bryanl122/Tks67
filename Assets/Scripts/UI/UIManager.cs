using CPT.Core;
using UnityEngine;
using UnityEngine.UI;

namespace CPT.UI
{
    /// <summary>
    /// HUD en jeu : barre supérieure (trésorerie, EcoGems, date, météo, vitesse,
    /// réputation), barre d'outils inférieure, fenêtre de panneau, fil de
    /// notifications et superposition tutoriel.
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        public static UIManager I { get; private set; }

        Canvas _canvas;
        Text _moneyText, _gemsText, _dateText, _weatherText, _repText, _siteText;
        RectTransform _panelWindow;
        Text _panelTitle;
        RectTransform _panelContent;
        RectTransform _notifFeed;
        RectTransform _tutorialBox;
        Text _tutorialText;
        float _refreshTimer;

        public static UIManager Create()
        {
            var go = new GameObject("UIManager");
            var ui = go.AddComponent<UIManager>();
            go.AddComponent<PlacementController>();
            return ui;
        }

        void Awake()
        {
            I = this;
            EventBus.LanguageChanged += RebuildAll;
        }

        void Start()
        {
            EventBus.GameLoaded += BuildHUD;
            EventBus.Notification += OnNotification;
        }

        void RebuildAll()
        {
            if (GameManager.I != null && GameManager.I.Running) BuildHUD();
        }

        // --- Construction du HUD ---
        public void BuildHUD()
        {
            if (_canvas != null) Destroy(_canvas.gameObject);
            _canvas = UIBuilder.CreateCanvas("HUD", 10);
            var root = _canvas.transform;

            // Barre supérieure
            var top = UIBuilder.Panel(root, "topbar", UITheme.PanelBg, new Vector2(0, 1), Vector2.one,
                new Vector2(0, -42), Vector2.zero);
            var h = top.gameObject.AddComponent<HorizontalLayoutGroup>();
            h.padding = new RectOffset(12, 12, 4, 4);
            h.spacing = 18;
            h.childForceExpandWidth = false;
            h.childForceExpandHeight = true;
            h.childControlWidth = true;
            h.childControlHeight = true;

            _moneyText = TopLabel(top, "", UITheme.Accent, 170);
            _gemsText = TopLabel(top, "", UITheme.Premium, 130);
            _siteText = TopLabel(top, "", UITheme.TextMain, 220);
            _dateText = TopLabel(top, "", UITheme.TextMain, 230);
            _weatherText = TopLabel(top, "", UITheme.TextDim, 130);
            _repText = TopLabel(top, "", UITheme.TextDim, 170);

            // Vitesses
            SpeedButton(top, "⏸", 0); SpeedButton(top, "1×", 1); SpeedButton(top, "2×", 2); SpeedButton(top, "4×", 4);

            // Barre inférieure
            var bottom = UIBuilder.Panel(root, "toolbar", UITheme.PanelBg, Vector2.zero, new Vector2(1, 0),
                Vector2.zero, new Vector2(0, 48));
            var hb = bottom.gameObject.AddComponent<HorizontalLayoutGroup>();
            hb.padding = new RectOffset(10, 10, 5, 5);
            hb.spacing = 8;
            hb.childForceExpandWidth = true;
            hb.childForceExpandHeight = true;

            ToolButton(bottom, Loc.T("ui.dashboard"), () => OpenPanel("dashboard"));
            ToolButton(bottom, Loc.T("ui.build"), () => OpenPanel("build"));
            ToolButton(bottom, Loc.T("ui.staff"), () => OpenPanel("staff"));
            ToolButton(bottom, Loc.T("ui.equipment"), () => OpenPanel("equipment"));
            ToolButton(bottom, Loc.T("ui.research"), () => OpenPanel("research"));
            ToolButton(bottom, Loc.T("ui.economy"), () => OpenPanel("economy"));
            ToolButton(bottom, Loc.T("ui.missions"), () => OpenPanel("missions"));
            ToolButton(bottom, Loc.T("ui.stats"), () => OpenPanel("stats"));
            ToolButton(bottom, Loc.T("ui.sites"), () => OpenPanel("sites"));
            ToolButton(bottom, "★ " + Loc.T("ui.shop"), () => OpenPanel("shop"));
            ToolButton(bottom, Loc.T("ui.settings"), () => OpenPanel("settings"));

            // Fenêtre de panneau (cachée par défaut)
            _panelWindow = UIBuilder.Panel(root, "panel", UITheme.PanelBg,
                new Vector2(0.22f, 0.10f), new Vector2(0.78f, 0.92f));
            _panelTitle = UIBuilder.Label(_panelWindow, "", UITheme.FontSizeTitle, UITheme.Accent, TextAnchor.MiddleCenter);
            UIBuilder.SetRect(_panelTitle, new Vector2(0, 1), Vector2.one, new Vector2(10, -46), new Vector2(-10, -6));
            var close = UIBuilder.TextButton(_panelWindow, "✕", UITheme.Danger, ClosePanel);
            UIBuilder.SetRect(close, Vector2.one, Vector2.one, new Vector2(-42, -42), new Vector2(-6, -6));
            _panelContent = UIBuilder.ScrollList(_panelWindow, Vector2.zero, Vector2.one,
                new Vector2(8, 8), new Vector2(-8, -50));
            _panelWindow.gameObject.SetActive(false);

            // Fil de notifications
            _notifFeed = UIBuilder.Panel(root, "notifications", Color.clear,
                new Vector2(0.74f, 0.45f), new Vector2(0.995f, 0.94f));
            var v = _notifFeed.gameObject.AddComponent<VerticalLayoutGroup>();
            v.childAlignment = TextAnchor.UpperRight;
            v.spacing = 6;
            v.childForceExpandHeight = false;
            v.childForceExpandWidth = true;
            v.childControlHeight = true;
            v.childControlWidth = true;

            BuildTutorialBox(root);
        }

        Text TopLabel(Transform parent, string text, Color c, float width)
        {
            var t = UIBuilder.Label(parent, text, UITheme.FontSizeNormal, c);
            var le = t.gameObject.AddComponent<LayoutElement>();
            le.preferredWidth = width; le.minWidth = 60;
            return t;
        }

        void SpeedButton(Transform parent, string label, int speed)
        {
            var b = UIBuilder.TextButton(parent, label, UITheme.PanelBgLight, () => GameManager.I.SetSpeed(speed));
            var le = b.gameObject.AddComponent<LayoutElement>();
            le.preferredWidth = 42; le.minWidth = 36;
        }

        void ToolButton(Transform parent, string label, System.Action onClick)
        {
            UIBuilder.TextButton(parent, label, UITheme.Primary, onClick, UITheme.FontSizeSmall);
        }

        // --- Panneaux ---
        public void OpenPanel(string id)
        {
            PlacementController.I.CancelPlacement();
            _panelWindow.gameObject.SetActive(true);
            _panelTitle.text = Loc.T("ui." + (id == "build" ? "build" : id));
            foreach (Transform child in _panelContent) Destroy(child.gameObject);
            if (id == "shop") ShopUI.Fill(_panelContent);
            else GamePanels.Fill(id, _panelContent);
            if (GameManager.I.S.mode == 0 && !GameManager.I.S.tutorialDone)
                TutorialReact(id);
        }

        public void ClosePanel() => _panelWindow.gameObject.SetActive(false);

        public void RefreshPanel(string id) { if (_panelWindow.gameObject.activeSelf) OpenPanel(id); }

        // --- Notifications ---
        void OnNotification(string title, string body, int severity)
        {
            if (_notifFeed == null) return;
            Color bg = severity == 2 ? UITheme.Danger : severity == 1 ? UITheme.Warning : UITheme.PanelBgLight;
            var row = new GameObject("notif");
            row.transform.SetParent(_notifFeed, false);
            var img = row.AddComponent<Image>();
            img.color = new Color(bg.r, bg.g, bg.b, 0.92f);
            var le = row.AddComponent<LayoutElement>();
            le.minHeight = 40;

            string txt = "<b>" + title + "</b>" + (string.IsNullOrEmpty(body) ? "" : "\n" + body);
            var label = UIBuilder.Label(row.transform, txt, UITheme.FontSizeSmall, UITheme.TextMain);
            label.supportRichText = true;
            UIBuilder.Stretch(label.rectTransform, 6);

            if (severity == 0) World.AudioManager.PlaySfx("notification");
            Destroy(row, severity == 2 ? 12f : 7f);
            // Limite du fil
            if (_notifFeed.childCount > 6) Destroy(_notifFeed.GetChild(0).gameObject);
        }

        // --- Tutoriel ---
        void BuildTutorialBox(Transform root)
        {
            var gm = GameManager.I;
            bool show = gm != null && gm.S.mode == 0 && !gm.S.tutorialDone;
            _tutorialBox = UIBuilder.Panel(root, "tutoriel", new Color(0.08f, 0.2f, 0.1f, 0.95f),
                new Vector2(0.25f, 0), new Vector2(0.75f, 0), new Vector2(0, 56), new Vector2(0, 150));
            _tutorialText = UIBuilder.Label(_tutorialBox, "", UITheme.FontSizeNormal, UITheme.TextMain);
            UIBuilder.SetRect(_tutorialText, Vector2.zero, Vector2.one, new Vector2(12, 8), new Vector2(-130, -8));
            var next = UIBuilder.TextButton(_tutorialBox, Loc.T("tuto.next"), UITheme.Accent, () =>
            {
                GameManager.I.Missions.AdvanceTutorial();
                UpdateTutorial();
            });
            ((Text)next.GetComponentInChildren<Text>()).color = Color.black;
            UIBuilder.SetRect(next, new Vector2(1, 0.5f), new Vector2(1, 0.5f), new Vector2(-120, -18), new Vector2(-10, 18));
            _tutorialBox.gameObject.SetActive(show);
            UpdateTutorial();
        }

        void UpdateTutorial()
        {
            var gm = GameManager.I;
            if (gm == null || _tutorialBox == null) return;
            bool show = gm.S.mode == 0 && !gm.S.tutorialDone;
            _tutorialBox.gameObject.SetActive(show);
            if (show)
                _tutorialText.text = Loc.T("tuto.title", gm.S.tutorialStep + 1, Sim.MissionManager.TutorialSteps)
                    + "\n" + Loc.T(gm.Missions.TutorialTextKey());
        }

        void TutorialReact(string panelId)
        {
            var gm = GameManager.I;
            // Le tutoriel avance quand le joueur ouvre le panneau demandé
            int step = gm.S.tutorialStep;
            if ((step == 1 && panelId == "build") || (step == 3 && panelId == "staff")
                || (step == 4 && panelId == "research") || (step == 5 && panelId == "economy")
                || (step == 6 && panelId == "missions"))
            {
                gm.Missions.AdvanceTutorial();
            }
            UpdateTutorial();
        }

        // --- Rafraîchissement périodique de la barre supérieure ---
        void Update()
        {
            var gm = GameManager.I;
            if (gm == null || !gm.Running || _moneyText == null) return;
            _refreshTimer += Time.deltaTime;
            if (_refreshTimer < 0.25f) return;
            _refreshTimer = 0f;

            _moneyText.text = "💰 " + Loc.Money((double)gm.S.money);
            _gemsText.text = "◆ " + gm.S.gems + " " + Meta.MonetizationCatalog.CurrencyName;
            _siteText.text = gm.S.sites[gm.S.activeSite].name;
            _dateText.text = gm.Clock.DateLabel() + "  " + gm.Clock.TimeLabel()
                + (gm.Clock.IsOpen ? "  · " + Loc.T("ui.open") : "  · " + Loc.T("ui.closed"));
            _weatherText.text = gm.Weather.Label();
            _repText.text = Loc.T("ui.reputation") + " " + Mathf.RoundToInt(gm.S.rep.Global) + "/100";
        }

        void OnDestroy()
        {
            EventBus.LanguageChanged -= RebuildAll;
            EventBus.GameLoaded -= BuildHUD;
            EventBus.Notification -= OnNotification;
        }
    }
}
