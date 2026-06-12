using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>
    /// Recherche & développement. Une recherche à la fois ; la vitesse est
    /// influencée par l'effet « research_speed » et les techniciens employés.
    /// </summary>
    public class ResearchManager
    {
        readonly GameState _s;
        public ResearchManager(GameState s) { _s = s; }

        public bool IsDone(string id) => _s.researchDone.Contains(id);
        public string Current => _s.researchCurrent;
        public float DaysLeft => _s.researchDaysLeft;

        public bool CanStart(ResearchDef def, long money)
        {
            if (def == null || IsDone(def.id) || !string.IsNullOrEmpty(_s.researchCurrent)) return false;
            if (!string.IsNullOrEmpty(def.requires) && !IsDone(def.requires)) return false;
            return money >= def.cost;
        }

        public bool Start(ResearchDef def, EconomyManager eco)
        {
            if (!CanStart(def, eco.Money)) return false;
            if (!eco.Spend(def.cost, Loc.T("research.cost_label"))) return false;
            _s.researchCurrent = def.id;
            _s.researchDaysLeft = def.days;
            EventBus.Notify(Loc.T("research.started"), Loc.T("research." + def.id), 0);
            return true;
        }

        /// <summary>Termine instantanément la recherche en cours (accélérateur premium).</summary>
        public void FinishInstantly()
        {
            if (string.IsNullOrEmpty(_s.researchCurrent)) return;
            _s.researchDaysLeft = 0f;
            OnNewDay(0);
        }

        public void OnNewDay(int technicians)
        {
            if (string.IsNullOrEmpty(_s.researchCurrent)) return;
            float speed = GetMult("research_speed") * (1f + 0.05f * technicians);
            _s.researchDaysLeft -= 1f * speed;
            if (_s.researchDaysLeft <= 0f)
            {
                string id = _s.researchCurrent;
                _s.researchDone.Add(id);
                _s.researchCurrent = "";
                _s.researchDaysLeft = 0f;
                _s.stats.researchCompleted++;
                EventBus.RaiseStat("research_done", 1);
                CheckBranchCompletion();
                EventBus.Notify(Loc.T("research.completed"), Loc.T("research." + id), 0);
            }
        }

        void CheckBranchCompletion()
        {
            var branches = new System.Collections.Generic.HashSet<string>();
            foreach (var r in ResearchTree.All) branches.Add(r.branch);
            foreach (var b in branches)
            {
                bool all = true;
                foreach (var r in ResearchTree.All)
                    if (r.branch == b && !IsDone(r.id)) { all = false; break; }
                if (all) EventBus.RaiseStat("branch_completed_set", CountCompletedBranches());
            }
        }

        int CountCompletedBranches()
        {
            var done = new System.Collections.Generic.Dictionary<string, bool>();
            foreach (var r in ResearchTree.All)
            {
                if (!done.ContainsKey(r.branch)) done[r.branch] = true;
                if (!IsDone(r.id)) done[r.branch] = false;
            }
            int n = 0;
            foreach (var kv in done) if (kv.Value) n++;
            return n;
        }

        /// <summary>
        /// Multiplicateur agrégé pour une clé d'effet.
        /// 1.0 = neutre ; « breakdown » et « energy » descendent sous 1.0.
        /// </summary>
        public float GetMult(string key)
        {
            float m = 1f;
            foreach (var id in _s.researchDone)
            {
                var def = ResearchTree.Get(id);
                if (def != null && def.effectKey == key) m += def.effectValue;
            }
            return Mathf.Max(0.1f, m);
        }
    }
}
