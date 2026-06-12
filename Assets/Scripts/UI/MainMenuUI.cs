using CPT.Core;
using UnityEngine;
using UnityEngine.UI;

namespace CPT.UI
{
    /// <summary>
    /// Menu principal : logo, profils de sauvegarde, choix du mode
    /// (Carrière, Sandbox, Défi, Coopératif), langue, crédits, quitter.
    /// </summary>
    public class MainMenuUI : MonoBehaviour
    {
        public static MainMenuUI I { get; private set; }

        Canvas _canvas;
        int _selectedSlot = 1;
        int _selectedChallenge;

        public static MainMenuUI Create()
        {
            var go = new GameObject("MainMenu");
            var menu = go.AddComponent<MainMenuUI>();
            return menu;
        }

        void Awake()
        {
            I = this;
            EventBus.LanguageChanged += Rebuild;
        }

        void Start() => Show();

        void Rebuild() { if (_canvas != null) Show(); }

        public void Show()
        {
            Hide();
            _canvas = UIBuilder.CreateCanvas("MenuCanvas", 20);
            var root = _canvas.transform;

            // Fond dégradé vert
            UIBuilder.Panel(root, "fond", new Color(0.05f, 0.12f, 0.08f), Vector2.zero, Vector2.one);
            UIBuilder.Panel(root, "bande", UITheme.Primary, new Vector2(0, 0.72f), new Vector2(1, 0.78f));

            // Logo / titre
            var title = UIBuilder.Label(root, "CONTAINER PARK TYCOON", UITheme.FontSizeHero, UITheme.Accent, TextAnchor.MiddleCenter);
            title.fontStyle = FontStyle.Bold;
            UIBuilder.SetRect(title, new Vector2(0, 0.8f), new Vector2(1, 0.95f), Vector2.zero, Vector2.zero);
            var subtitle = UIBuilder.Label(root, Loc.T("menu.tagline"), UITheme.FontSizeNormal, UITheme.TextDim, TextAnchor.MiddleCenter);
            UIBuilder.SetRect(subtitle, new Vector2(0, 0.74f), new Vector2(1, 0.8f), Vector2.zero, Vector2.zero);

            // Profils
            var slots = UIBuilder.Panel(root, "profils", UITheme.PanelBg, new Vector2(0.3f, 0.42f), new Vector2(0.7f, 0.7f));
            var v = slots.gameObject.AddComponent<VerticalLayoutGroup>();
            v.padding = new RectOffset(10, 10, 10, 10);
            v.spacing = 8;
            v.childForceExpandHeight = true;
            v.childForceExpandWidth = true;

            UIBuilder.Label(slots, Loc.T("menu.profiles"), UITheme.FontSizeNormal, UITheme.Accent, TextAnchor.MiddleCenter);
            for (int slot = 1; slot <= SaveSystem.SlotCount; slot++)
            {
                int s = slot;
                string label = Loc.T("menu.slot", slot) + " — " + SaveSystem.SlotLabel(slot)
                    + (slot == _selectedSlot ? "  ✓" : "");
                UIBuilder.TextButton(slots, label,
                    slot == _selectedSlot ? UITheme.Primary : UITheme.PanelBgLight,
                    () => { _selectedSlot = s; Show(); });
            }

            // Actions principales
            var actions = UIBuilder.Panel(root, "actions", Color.clear, new Vector2(0.3f, 0.12f), new Vector2(0.7f, 0.4f));
            var av = actions.gameObject.AddComponent<VerticalLayoutGroup>();
            av.spacing = 8;
            av.childForceExpandHeight = true;
            av.childForceExpandWidth = true;

            if (SaveSystem.Exists(_selectedSlot))
            {
                UIBuilder.TextButton(actions, "▶ " + Loc.T("menu.continue"), UITheme.Accent, () =>
                {
                    if (GameManager.I.LoadGame(_selectedSlot)) Hide();
                }).GetComponentInChildren<Text>().color = Color.black;
                UIBuilder.TextButton(actions, Loc.T("menu.delete_save"), UITheme.Danger, () =>
                {
                    SaveSystem.Delete(_selectedSlot); Show();
                });
            }

            UIBuilder.TextButton(actions, Loc.T("mode.0") + " — " + Loc.T("menu.career_desc"), UITheme.Primary,
                () => StartGame(Sim.GameModes.Career));
            UIBuilder.TextButton(actions, Loc.T("mode.1") + " — " + Loc.T("menu.sandbox_desc"), UITheme.Primary,
                () => StartGame(Sim.GameModes.Sandbox));
            UIBuilder.TextButton(actions, Loc.T("mode.2") + " — " + Loc.T("challenge.defi_" + ChallengeId()), UITheme.Primary,
                () => StartGame(Sim.GameModes.Challenge));
            UIBuilder.TextButton(actions, Loc.T("menu.next_challenge"), UITheme.PanelBgLight, () =>
            {
                _selectedChallenge = (_selectedChallenge + 1) % Data.MissionDatabase.Challenges.Count;
                Show();
            });
            UIBuilder.TextButton(actions, Loc.T("mode.3") + " — " + Loc.T("menu.coop_desc"), UITheme.Primary,
                () => { Meta.OnlineServices.Coop.Host("session"); StartGame(Sim.GameModes.Coop); });

            // Pied de page : langue + quitter
            var footer = UIBuilder.Panel(root, "footer", Color.clear, new Vector2(0, 0), new Vector2(1, 0.08f));
            var fh = footer.gameObject.AddComponent<HorizontalLayoutGroup>();
            fh.padding = new RectOffset(20, 20, 8, 8);
            fh.spacing = 10;
            fh.childForceExpandWidth = true;
            fh.childForceExpandHeight = true;

            UIBuilder.TextButton(footer, "🌍 " + Loc.LanguageNames[System.Array.IndexOf(Loc.Languages, Loc.Current)],
                UITheme.PanelBgLight, () =>
                {
                    int idx = (System.Array.IndexOf(Loc.Languages, Loc.Current) + 1) % Loc.Languages.Length;
                    Loc.SetLanguage(Loc.Languages[idx]);
                });
            UIBuilder.TextButton(footer, Loc.T("menu.credits"), UITheme.PanelBgLight,
                () => EventBus.Notify("Container Park Tycoon", Loc.T("menu.credits_body"), 0));
            UIBuilder.TextButton(footer, Loc.T("menu.quit"), UITheme.Danger, Application.Quit);

            World.AudioManager.PlayMusic("menu");
        }

        string ChallengeId()
        {
            var c = Data.MissionDatabase.Challenges[_selectedChallenge];
            return c.id.Substring("defi_".Length);
        }

        void StartGame(int mode)
        {
            string profile = "Joueur " + _selectedSlot;
            GameManager.I.StartNewGame(mode, profile, _selectedSlot, _selectedChallenge);
            Hide();
        }

        public void Hide()
        {
            if (_canvas != null) Destroy(_canvas.gameObject);
            _canvas = null;
        }

        void OnDestroy() => EventBus.LanguageChanged -= Rebuild;
    }
}
