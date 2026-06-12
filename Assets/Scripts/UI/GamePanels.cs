using CPT.Core;
using CPT.Data;
using CPT.Sim;
using UnityEngine;
using UnityEngine.UI;

namespace CPT.UI
{
    /// <summary>Contenu des panneaux de gestion (tout sauf la boutique).</summary>
    public static class GamePanels
    {
        static GameManager GM => GameManager.I;

        public static void Fill(string id, RectTransform content)
        {
            switch (id)
            {
                case "dashboard": Dashboard(content); break;
                case "build": Build(content); break;
                case "staff": Staff(content); break;
                case "equipment": Equipment(content); break;
                case "research": Research(content); break;
                case "economy": Economy(content); break;
                case "missions": Missions(content); break;
                case "stats": Stats(content); break;
                case "sites": Sites(content); break;
                case "settings": Settings(content); break;
            }
        }

        // --- Aides de mise en page ---
        static void Header(RectTransform c, string text)
        {
            var t = UIBuilder.Label(c, text, UITheme.FontSizeTitle - 4, UITheme.Accent);
            t.gameObject.AddComponent<LayoutElement>().minHeight = 34;
        }

        static void Line(RectTransform c, string left, string right = "", Color? rightColor = null)
        {
            var row = UIBuilder.Row(c, 32);
            var l = UIBuilder.Label(row, left, UITheme.FontSizeNormal, UITheme.TextMain);
            UIBuilder.SetRect(l, Vector2.zero, new Vector2(0.62f, 1), new Vector2(8, 0), Vector2.zero);
            var r = UIBuilder.Label(row, right, UITheme.FontSizeNormal, rightColor ?? UITheme.TextDim, TextAnchor.MiddleRight);
            UIBuilder.SetRect(r, new Vector2(0.62f, 0), Vector2.one, Vector2.zero, new Vector2(-8, 0));
        }

        static void ActionRow(RectTransform c, string text, string buttonLabel, System.Action onClick,
            bool enabled = true, Color? btnColor = null, float height = 44)
        {
            var row = UIBuilder.Row(c, height);
            var l = UIBuilder.Label(row, text, UITheme.FontSizeSmall, UITheme.TextMain);
            UIBuilder.SetRect(l, Vector2.zero, new Vector2(0.72f, 1), new Vector2(8, 0), Vector2.zero);
            var b = UIBuilder.TextButton(row, buttonLabel, enabled ? (btnColor ?? UITheme.Primary) : new Color(0.3f, 0.3f, 0.3f),
                enabled ? onClick : null, UITheme.FontSizeSmall);
            UIBuilder.SetRect(b, new Vector2(0.74f, 0.12f), new Vector2(0.99f, 0.88f), Vector2.zero, Vector2.zero);
        }

        // --- Tableau de bord ---
        static void Dashboard(RectTransform c)
        {
            var s = GM.S;
            var site = s.sites[s.activeSite];
            Header(c, site.name + " — " + site.region);
            Line(c, Loc.T("ui.money"), Loc.Money((double)s.money), UITheme.Accent);
            Line(c, Loc.T("dash.visitors_today"), s.stats.visitorsToday.ToString());
            Line(c, Loc.T("dash.visitors_now"), GM.Visitors.ActiveCount.ToString());
            Line(c, Loc.T("dash.satisfaction"), Mathf.RoundToInt(s.stats.satisfactionAvg) + "/100",
                s.stats.satisfactionAvg > 70 ? UITheme.Ok : UITheme.Warning);
            Line(c, Loc.T("dash.pollution"), Mathf.RoundToInt(site.groundPollution) + "/100",
                site.groundPollution < 30 ? UITheme.Ok : UITheme.Danger);
            Line(c, Loc.T("dash.containers"), GM.Construction.CountContainers().ToString());
            Line(c, Loc.T("dash.staff"), s.employees.Count.ToString());

            Header(c, Loc.T("dash.reputation"));
            Line(c, Loc.T("rep.citizens"), Mathf.RoundToInt(s.rep.citizens) + "/100");
            Line(c, Loc.T("rep.companies"), Mathf.RoundToInt(s.rep.companies) + "/100");
            Line(c, Loc.T("rep.government"), Mathf.RoundToInt(s.rep.government) + "/100");

            Header(c, Loc.T("dash.containers_state"));
            foreach (var b in site.buildings)
            {
                var def = BuildingCatalog.Get(b.typeId);
                if (def == null || def.category != BuildingCategory.Conteneur) continue;
                float cap = GM.Construction.ContainerCapacity(b, GM);
                string status = b.onFire ? Loc.T("dash.on_fire")
                    : b.buildDaysLeft > 0 ? Loc.T("dash.under_construction")
                    : Mathf.RoundToInt(b.fillKg) + " / " + Mathf.RoundToInt(cap) + " kg";
                Line(c, Loc.T("stream." + b.streamId), status,
                    b.onFire ? UITheme.Danger : b.fillKg > cap * 0.85f ? UITheme.Warning : UITheme.TextDim);
            }

            Header(c, Loc.T("dash.recent_visitors"));
            int shown = 0;
            foreach (var v in GM.Visitors.RecentVisitors)
            {
                if (shown++ >= 6) break;
                Line(c, v.firstName + " " + v.lastName + " (" + v.age + ")",
                    Loc.T("visitor.type" + v.profileType) + " · " + Mathf.RoundToInt(v.satisfaction) + "/100");
            }
        }

        // --- Construction ---
        static void Build(RectTransform c)
        {
            UIBuilder.Label(c, Loc.T("build.hint"), UITheme.FontSizeSmall, UITheme.TextDim)
                .gameObject.AddComponent<LayoutElement>().minHeight = 30;

            foreach (BuildingCategory cat in System.Enum.GetValues(typeof(BuildingCategory)))
            {
                Header(c, Loc.T("buildcat." + cat.ToString().ToLowerInvariant()));
                foreach (var def in BuildingCatalog.All)
                {
                    if (def.category != cat) continue;
                    if (def.premiumOnly && !GM.S.meta.purchases.Contains(def.id)) continue;  // achetable en boutique
                    string label = Loc.T("bld." + def.id) + "\n<color=#aaa>" + Loc.Money((double)def.cost)
                        + " · " + Loc.T("build.days", def.buildDays) + "</color>";
                    ActionRow(c, label, Loc.T("build.place"), () =>
                    {
                        UIManager.I.ClosePanel();
                        PlacementController.I.BeginPlacement(def.id, def.premiumOnly);
                    }, GM.S.money >= def.cost || def.premiumOnly);
                }
            }

            Header(c, Loc.T("build.demolish_title"));
            var site = GM.S.sites[GM.S.activeSite];
            foreach (var b in new System.Collections.Generic.List<BuildingData>(site.buildings))
            {
                ActionRow(c, Loc.T("bld." + b.typeId), Loc.T("build.demolish"),
                    () => { GM.Construction.Demolish(b); UIManager.I.RefreshPanel("build"); },
                    true, UITheme.Danger, 36);
            }
        }

        // --- Personnel ---
        static void Staff(RectTransform c)
        {
            Header(c, Loc.T("staff.team", GM.S.employees.Count));
            foreach (var e in new System.Collections.Generic.List<EmployeeData>(GM.S.employees))
            {
                string txt = e.firstName + " " + e.lastName + " (" + e.age + ") — " + Loc.T("role." + e.role)
                    + (e.onStrike ? "  ⚠ " + Loc.T("staff.on_strike") : "")
                    + "\n<color=#aaa>" + Loc.T("staff.line", Mathf.RoundToInt(e.skill), Mathf.RoundToInt(e.morale),
                        Mathf.RoundToInt(e.fatigue), e.salaryMonthly) + "</color>";
                var row = UIBuilder.Row(c, 54);
                var l = UIBuilder.Label(row, txt, UITheme.FontSizeSmall, e.onStrike ? UITheme.Warning : UITheme.TextMain);
                l.supportRichText = true;
                UIBuilder.SetRect(l, Vector2.zero, new Vector2(0.6f, 1), new Vector2(8, 0), Vector2.zero);
                var raise = UIBuilder.TextButton(row, Loc.T("staff.raise"), UITheme.Primary,
                    () => { GM.Staff.GiveRaise(e, 0.08f); UIManager.I.RefreshPanel("staff"); }, UITheme.FontSizeSmall);
                UIBuilder.SetRect(raise, new Vector2(0.62f, 0.15f), new Vector2(0.79f, 0.85f), Vector2.zero, Vector2.zero);
                var fire = UIBuilder.TextButton(row, Loc.T("staff.fire"), UITheme.Danger,
                    () => { GM.Staff.Fire(e, GM.Economy); UIManager.I.RefreshPanel("staff"); }, UITheme.FontSizeSmall);
                UIBuilder.SetRect(fire, new Vector2(0.81f, 0.15f), new Vector2(0.98f, 0.85f), Vector2.zero, Vector2.zero);
            }

            Header(c, Loc.T("staff.candidates"));
            foreach (var cand in new System.Collections.Generic.List<EmployeeData>(GM.Staff.Candidates))
            {
                string txt = cand.firstName + " " + cand.lastName + " (" + cand.age + ") — " + Loc.T("role." + cand.role)
                    + "\n<color=#aaa>" + Loc.T("staff.candidate_line", Mathf.RoundToInt(cand.skill), cand.salaryMonthly) + "</color>";
                ActionRow(c, txt, Loc.T("staff.hire"), () =>
                {
                    GM.Staff.Hire(cand, GM.Economy);
                    if (GM.S.mode == 0 && !GM.S.tutorialDone && GM.S.tutorialStep == 3) GM.Missions.AdvanceTutorial();
                    UIManager.I.RefreshPanel("staff");
                }, height: 54);
            }
        }

        // --- Équipements ---
        static void Equipment(RectTransform c)
        {
            var site = GM.S.sites[GM.S.activeSite];
            Header(c, Loc.T("equip.owned"));
            foreach (var m in site.machines)
            {
                var def = MachineCatalog.Get(m.typeId);
                string status = m.broken ? Loc.T("equip.broken") : Loc.T("equip.condition", Mathf.RoundToInt(m.condition));
                string txt = Loc.T("mach." + m.typeId) + " · " + Loc.T("equip.level", m.level)
                    + "\n<color=#aaa>" + status + "</color>";
                if (m.broken)
                    ActionRow(c, txt, Loc.T("equip.repair"), () => { GM.Equipment.Repair(m, GM.Economy); UIManager.I.RefreshPanel("equipment"); },
                        true, UITheme.Warning, 50);
                else if (m.level < 3)
                    ActionRow(c, txt, Loc.T("equip.upgrade") + " (" + Loc.Money((double)(def.cost / 2 * m.level)) + ")",
                        () => { GM.Equipment.Upgrade(m, GM.Economy); UIManager.I.RefreshPanel("equipment"); }, true, null, 50);
                else
                    Line(c, txt, "★★★");
            }

            Header(c, Loc.T("equip.catalog"));
            foreach (var def in MachineCatalog.All)
            {
                if (def.premiumOnly) continue;
                bool locked = !string.IsNullOrEmpty(def.requiresResearch) && !GM.Research.IsDone(def.requiresResearch);
                string txt = Loc.T("mach." + def.id) + "\n<color=#aaa>" + Loc.Money((double)def.cost)
                    + (locked ? " · 🔒 " + Loc.T("research." + def.requiresResearch) : "") + "</color>";
                ActionRow(c, txt, Loc.T("equip.buy"),
                    () => { GM.Equipment.Buy(def.id, GM.Economy); UIManager.I.RefreshPanel("equipment"); },
                    !locked && GM.S.money >= def.cost, null, 50);
            }
        }

        // --- Recherche ---
        static void Research(RectTransform c)
        {
            if (!string.IsNullOrEmpty(GM.S.researchCurrent))
            {
                Header(c, Loc.T("research.in_progress"));
                Line(c, Loc.T("research." + GM.S.researchCurrent),
                    Loc.T("research.days_left", Mathf.CeilToInt(GM.S.researchDaysLeft)));
            }

            string currentBranch = "";
            foreach (var def in ResearchTree.All)
            {
                if (def.branch != currentBranch)
                {
                    currentBranch = def.branch;
                    Header(c, Loc.T("branch." + def.branch));
                }
                if (GM.Research.IsDone(def.id)) { Line(c, "✓ " + Loc.T("research." + def.id), "", UITheme.Ok); continue; }

                bool canStart = GM.Research.CanStart(def, GM.S.money);
                string req = !string.IsNullOrEmpty(def.requires) && !GM.Research.IsDone(def.requires)
                    ? " · 🔒 " + Loc.T("research." + def.requires) : "";
                string txt = Loc.T("research." + def.id)
                    + "\n<color=#aaa>" + Loc.Money((double)def.cost) + " · " + Loc.T("build.days", def.days) + req + "</color>";
                ActionRow(c, txt, Loc.T("research.start"),
                    () => { GM.Research.Start(def, GM.Economy); UIManager.I.RefreshPanel("research"); }, canStart, null, 50);
            }
        }

        // --- Économie ---
        static void Economy(RectTransform c)
        {
            var eco = GM.S.eco;
            Header(c, Loc.T("eco.overview"));
            Line(c, Loc.T("ui.money"), Loc.Money((double)GM.S.money), UITheme.Accent);
            Line(c, Loc.T("eco.month_income"), Loc.Money((double)eco.monthIncome), UITheme.Ok);
            Line(c, Loc.T("eco.month_expense"), Loc.Money((double)eco.monthExpense), UITheme.Danger);
            Line(c, Loc.T("eco.last_month"), Loc.Money((double)(eco.lastMonthIncome - eco.lastMonthExpense)));
            Line(c, Loc.T("eco.subsidies"), Loc.Money((double)eco.subsidiesReceived));

            Header(c, Loc.T("eco.loans"));
            foreach (var l in eco.loans)
                Line(c, Loc.Money((double)l.principal), Loc.T("eco.loan_line", l.monthsLeft, Loc.Money((double)l.monthlyPayment)));
            foreach (var offer in EconomyManager.LoanOffers)
                ActionRow(c, Loc.T("eco.loan_offer", Loc.Money((double)offer)), Loc.T("eco.borrow"),
                    () => { GM.Economy.TakeLoan(offer); UIManager.I.RefreshPanel("economy"); }, eco.loans.Count < 3, null, 38);

            Header(c, Loc.T("eco.insurance"));
            for (int tier = 0; tier <= 2; tier++)
            {
                int t = tier;
                ActionRow(c, Loc.T("eco.insurance_tier" + tier),
                    eco.insuranceTier == tier ? "✓" : Loc.T("eco.choose"),
                    () => { GM.S.eco.insuranceTier = t; UIManager.I.RefreshPanel("economy"); },
                    eco.insuranceTier != tier, null, 38);
            }

            Header(c, Loc.T("contract.active"));
            foreach (var k in eco.contracts)
                if (k.signed) Line(c, k.company + " — " + Loc.T("stream." + k.streamId),
                    k.pricePerTon + " €/t · " + Loc.T("contract.days_left", k.daysLeft));

            Header(c, Loc.T("contract.offers"));
            foreach (var offer in new System.Collections.Generic.List<ContractData>(GM.Contracts.Offers))
            {
                string txt = offer.company + " — " + Loc.T("stream." + offer.streamId)
                    + "\n<color=#aaa>" + offer.pricePerTon + " €/t (" + Loc.T("contract.spot",
                        Mathf.RoundToInt(ContractManager.SpotPrice(offer.streamId))) + ")</color>";
                ActionRow(c, txt, Loc.T("contract.sign"),
                    () => { GM.Contracts.Sign(offer); UIManager.I.RefreshPanel("economy"); }, true, null, 50);
            }

            Header(c, Loc.T("eco.ledger"));
            for (int i = GM.Economy.Ledger.Count - 1, shown = 0; i >= 0 && shown < 15; i--, shown++)
            {
                var entry = GM.Economy.Ledger[i];
                Line(c, Loc.T("save.day", entry.day) + " — " + entry.label,
                    (entry.amount >= 0 ? "+" : "") + Loc.Money((double)entry.amount),
                    entry.amount >= 0 ? UITheme.Ok : UITheme.Danger);
            }
        }

        // --- Missions / courriels ---
        static void Missions(RectTransform c)
        {
            var m = GM.Missions.CurrentMission();
            Header(c, Loc.T("mission.current"));
            if (m != null)
            {
                double prog = GM.Missions.Progress(m, GM);
                Line(c, Loc.T("mission." + m.id), System.Math.Round(prog, 1) + " / " + m.target);
                var barRow = UIBuilder.Row(c, 18);
                var bar = UIBuilder.ProgressBar(barRow, (float)(prog / m.target), UITheme.Accent);
                UIBuilder.Stretch(bar.transform.parent.GetComponent<RectTransform>(), 4);
                Line(c, Loc.T("mission.reward"), Loc.Money((double)m.rewardMoney) + " + " + m.rewardGems + " ◆");
            }
            else Line(c, Loc.T(GM.S.mode == 0 ? "mission.all_done" : "mission.none_mode"), "");

            Header(c, Loc.T("mail.inbox"));
            foreach (var mail in GM.Missions.Inbox)
            {
                var row = UIBuilder.Row(c, 80);
                var l = UIBuilder.Label(row,
                    "<b>" + Loc.T("mail." + mail.id + ".subject") + "</b> — " + mail.senderFr
                    + "\n<color=#bbb>" + Loc.T("mail." + mail.id + ".body") + "</color>",
                    UITheme.FontSizeSmall, UITheme.TextMain);
                l.supportRichText = true;
                UIBuilder.Stretch(l.rectTransform, 8);
            }
            if (GM.Missions.Inbox.Count == 0) Line(c, Loc.T("mail.empty"), "");
        }

        // --- Statistiques + succès + classements ---
        static void Stats(RectTransform c)
        {
            var st = GM.S.stats;
            Header(c, Loc.T("stats.title"));
            Line(c, Loc.T("stats.tons"), System.Math.Round(st.tonsRecycled, 1) + " t");
            Line(c, Loc.T("stats.co2"), System.Math.Round(st.co2SavedKg / 1000.0, 1) + " t CO₂");
            Line(c, Loc.T("stats.visitors"), st.visitorsTotal.ToString());
            Line(c, Loc.T("stats.income"), Loc.Money((double)GM.S.eco.lifetimeIncome));
            Line(c, Loc.T("stats.profit"), Loc.Money((double)(GM.S.eco.lifetimeIncome - GM.S.eco.lifetimeExpense)));
            Line(c, Loc.T("stats.satisfaction"), Mathf.RoundToInt(st.satisfactionAvg) + "/100");
            Line(c, Loc.T("stats.incidents"), st.incidentsTotal.ToString());
            Line(c, Loc.T("stats.best_day"), Loc.Money(st.bestDayIncome));

            Header(c, Loc.T("stats.leaderboards"));
            foreach (var board in Meta.LocalLeaderboard.Boards)
            {
                Line(c, Loc.T("lb." + board), "");
                int rank = 1;
                foreach (var kv in Meta.OnlineServices.Leaderboards.Top(board, 5))
                    Line(c, "  " + rank++ + ". " + kv.Key, System.Math.Round(kv.Value, 1).ToString());
            }

            Header(c, Loc.T("ach.title_panel", GM.Achievements.UnlockedCount, GM.Achievements.TotalCount));
            foreach (var a in AchievementDatabase.All)
            {
                bool got = GM.Achievements.IsUnlocked(a.id);
                if (!got && a.tier > 1 && !GM.Achievements.IsUnlocked(a.family + "_" + (a.tier - 1)))
                    continue;   // ne révèle que le prochain palier
                string name = Loc.T("ach." + a.family) + (a.tier > 0 ? " " + AchievementManager.ToRoman(a.tier) : "");
                Line(c, (got ? "🏆 " : "🔒 ") + name,
                    got ? "✓" : ((long)GM.Stats.Get(a.statKey)) + " / " + (long)a.threshold,
                    got ? UITheme.Ok : UITheme.TextDim);
            }
        }

        // --- Multi-sites ---
        static void Sites(RectTransform c)
        {
            Header(c, Loc.T("site.network", GM.Sites.Count));
            for (int i = 0; i < GM.S.sites.Count; i++)
            {
                int idx = i;
                var site = GM.S.sites[i];
                bool active = i == GM.S.activeSite;
                ActionRow(c, site.name + " — " + site.region
                    + (active ? "  ✓" : ""), active ? Loc.T("site.current") : Loc.T("site.manage"),
                    () => { GM.Sites.SwitchTo(idx, GM); UIManager.I.RefreshPanel("sites"); }, !active);
            }

            if (GM.Sites.CanExpand())
            {
                Header(c, Loc.T("site.expand"));
                long cost = GM.Sites.NextSiteCost();
                ActionRow(c, Loc.T("site.expand_body", Loc.Money((double)cost)), Loc.T("site.buy"),
                    () => { GM.Sites.BuyNewSite(GM); UIManager.I.RefreshPanel("sites"); },
                    GM.S.money >= cost, UITheme.Premium, 50);
            }
            Line(c, Loc.T("site.network_bonus"), "+" + Mathf.RoundToInt(GM.Sites.NetworkValueBonus() * 100) + " %");

            Header(c, Loc.T("coop.title"));
            UIBuilder.Label(c, Loc.T("coop.body"), UITheme.FontSizeSmall, UITheme.TextDim)
                .gameObject.AddComponent<LayoutElement>().minHeight = 56;
            ActionRow(c, Loc.T("coop.host_label"), Loc.T("coop.host"),
                () => Meta.OnlineServices.Coop.Host(GM.S.profile), !Meta.OnlineServices.Coop.IsConnected, null, 38);
        }

        // --- Paramètres ---
        static void Settings(RectTransform c)
        {
            Header(c, Loc.T("settings.language"));
            for (int i = 0; i < Loc.Languages.Length; i++)
            {
                int idx = i;
                ActionRow(c, Loc.LanguageNames[i], Loc.Current == Loc.Languages[i] ? "✓" : Loc.T("eco.choose"),
                    () => { Loc.SetLanguage(Loc.Languages[idx]); UIManager.I.OpenPanel("settings"); },
                    Loc.Current != Loc.Languages[i], null, 36);
            }

            Header(c, Loc.T("settings.audio"));
            Line(c, Loc.T("settings.music"), "");
            SliderRow(c, World.AudioManager.MusicVolume, v => World.AudioManager.MusicVolume = v);
            Line(c, Loc.T("settings.sfx"), "");
            SliderRow(c, World.AudioManager.SfxVolume, v => World.AudioManager.SfxVolume = v);

            Header(c, Loc.T("settings.game"));
            ActionRow(c, Loc.T("settings.save_now"), Loc.T("settings.save"),
                () => { GM.SaveNow(); EventBus.Notify(Loc.T("save.done"), "", 0); }, true, null, 38);
            ActionRow(c, Loc.T("settings.quit_menu"), Loc.T("settings.quit"),
                () =>
                {
                    GM.EndSession(save: true);
                    UIManager.I.ClosePanel();
                    MainMenuUI.I.Show();
                }, true, UITheme.Danger, 38);
        }

        static void SliderRow(RectTransform c, float value, System.Action<float> onChange)
        {
            var row = UIBuilder.Row(c, 28);
            var slider = UIBuilder.VolumeSlider(row, value, onChange);
            UIBuilder.Stretch(slider.GetComponent<RectTransform>(), 6);
        }
    }
}
