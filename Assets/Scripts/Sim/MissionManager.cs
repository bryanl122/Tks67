using System.Collections.Generic;
using CPT.Core;
using CPT.Data;

namespace CPT.Sim
{
    /// <summary>
    /// Missions de carrière, tutoriel, défis chronométrés et courriels narratifs.
    /// </summary>
    public class MissionManager
    {
        public const int TutorialSteps = 8;

        readonly GameState _s;
        readonly List<string> _sentMails = new List<string>();
        public readonly List<StoryMail> Inbox = new List<StoryMail>();

        public MissionManager(GameState s) { _s = s; }

        public MissionDef CurrentMission()
        {
            if (_s.mode != 0) return null;
            foreach (var m in MissionDatabase.Career)
                if (!_s.missionsDone.Contains(m.id)) return m;
            return null;
        }

        public double Progress(MissionDef m, GameManager gm) => Evaluate(m.condType, gm);

        double Evaluate(string condType, GameManager gm)
        {
            switch (condType)
            {
                case "money": return _s.money;
                case "tons": return _s.stats.tonsRecycled;
                case "visitors": return _s.stats.visitorsTotal;
                case "buildings": return _s.stats.buildingsBuilt;
                case "employees": return _s.employees.Count;
                case "research": return _s.researchDone.Count;
                case "reputation": return _s.rep.Global;
                case "contracts": return _s.stats.contractsSigned;
                case "sites": return _s.sites.Count;
                case "machines": return _s.sites[_s.activeSite].machines.Count;
                case "containers": return gm.Construction.CountContainers();
                case "satisfaction": return _s.stats.satisfactionAvg;
                default: return 0;
            }
        }

        public void OnNewDay(GameManager gm)
        {
            // Courriels narratifs déclenchés par jour
            foreach (var mail in StoryDatabase.Mails)
                if (mail.triggerDay > 0 && _s.day >= mail.triggerDay) Deliver(mail);

            // Mission de carrière
            var m = CurrentMission();
            if (m != null && Evaluate(m.condType, gm) >= m.target)
                Complete(m, gm);

            // Défi chronométré
            if (_s.mode == 2) CheckChallenge(gm);
        }

        void Complete(MissionDef m, GameManager gm)
        {
            _s.missionsDone.Add(m.id);
            gm.Economy.Earn(m.rewardMoney, Loc.T("mission.reward"));
            _s.gems += m.rewardGems;
            gm.BattlePass.AddXp(m.bpXp);
            EventBus.Notify("✓ " + Loc.T("mission." + m.id), Loc.T("mission.completed_body", Loc.Money(m.rewardMoney), m.rewardGems), 0);
            World.AudioManager.PlaySfx("mission");

            foreach (var mail in StoryDatabase.Mails)
                if (mail.triggerMission == m.id) Deliver(mail);

            if (m.id == "m24_empire_national")
            {
                EventBus.RaiseStat("career_done", 1);
                EventBus.Notify(Loc.T("mission.career_complete"), Loc.T("mission.career_complete_body"), 0);
            }
        }

        void Deliver(StoryMail mail)
        {
            if (_sentMails.Contains(mail.id)) return;
            _sentMails.Add(mail.id);
            Inbox.Insert(0, mail);
            EventBus.Notify("✉ " + Loc.T("mail." + mail.id + ".subject"), mail.senderFr, 0);
        }

        void CheckChallenge(GameManager gm)
        {
            var c = MissionDatabase.Challenges.Find(x => x.id == "defi_" + _s.challengeId) ??
                    (_s.challengeId < MissionDatabase.Challenges.Count ? MissionDatabase.Challenges[_s.challengeId] : null);
            if (c == null) return;
            if (Evaluate(c.condType, gm) >= c.target)
            {
                if (!_s.missionsDone.Contains(c.id))
                {
                    _s.missionsDone.Add(c.id);
                    EventBus.RaiseStat("challenges_done", 1);
                    EventBus.Notify(Loc.T("challenge.won"), Loc.T("challenge." + c.id), 0);
                }
            }
            else if (_s.day > c.dayLimit)
            {
                EventBus.Notify(Loc.T("challenge.lost"), Loc.T("challenge." + c.id), 2);
            }
        }

        // --- Tutoriel (mode Carrière, 8 étapes guidées) ---
        public string TutorialTextKey() => "tuto.step" + (_s.tutorialStep + 1);

        public void AdvanceTutorial()
        {
            if (_s.tutorialDone) return;
            _s.tutorialStep++;
            if (_s.tutorialStep >= TutorialSteps)
            {
                _s.tutorialDone = true;
                _s.gems += 20;
                EventBus.Notify(Loc.T("tuto.done"), Loc.T("tuto.done_body"), 0);
            }
        }
    }
}
