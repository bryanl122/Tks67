using System.Collections.Generic;
using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>
    /// Personnel : recrutement, salaires, moral, fatigue, expérience, grèves.
    /// Rôles : agent_tri, chauffeur, mecanicien, securite, responsable, technicien.
    /// </summary>
    public class StaffManager
    {
        public static readonly string[] Roles = { "agent_tri", "chauffeur", "mecanicien", "securite", "responsable", "technicien" };
        public static readonly int[] BaseSalaries = { 2100, 2400, 2700, 2300, 3400, 3000 };

        readonly GameState _s;
        public readonly List<EmployeeData> Candidates = new List<EmployeeData>();

        public StaffManager(GameState s) { _s = s; RefreshCandidates(); }

        public int Count(string role, int site = -1)
        {
            int n = 0;
            foreach (var e in _s.employees)
                if (e.role == role && (site < 0 || e.site == site) && !e.onStrike) n++;
            return n;
        }

        public void RefreshCandidates()
        {
            Candidates.Clear();
            for (int i = 0; i < 6; i++)
            {
                string role = Roles[Random.Range(0, Roles.Length)];
                int ri = System.Array.IndexOf(Roles, role);
                float skill = Random.Range(20f, 95f);
                Candidates.Add(new EmployeeData
                {
                    firstName = NameDatabase.FirstNames[Random.Range(0, NameDatabase.FirstNames.Length)],
                    lastName = NameDatabase.LastNames[Random.Range(0, NameDatabase.LastNames.Length)],
                    age = Random.Range(19, 60),
                    role = role,
                    skill = skill,
                    salaryMonthly = Mathf.RoundToInt(BaseSalaries[ri] * (0.8f + skill / 200f))
                });
            }
        }

        public bool Hire(EmployeeData candidate, EconomyManager eco)
        {
            if (!Candidates.Contains(candidate)) return false;
            candidate.site = _s.activeSite;
            _s.employees.Add(candidate);
            Candidates.Remove(candidate);
            _s.stats.employeesHired++;
            EventBus.RaiseStat("employees_hired", 1);
            EventBus.Notify(Loc.T("staff.hired"), candidate.firstName + " " + candidate.lastName + " — " + Loc.T("role." + candidate.role), 0);
            return true;
        }

        public void Fire(EmployeeData e, EconomyManager eco)
        {
            // Indemnité de licenciement : un mois de salaire
            eco.Spend(e.salaryMonthly, Loc.T("staff.severance"), true);
            _s.employees.Remove(e);
            foreach (var other in _s.employees) other.morale = Mathf.Max(0, other.morale - 4f);
        }

        public void GiveRaise(EmployeeData e, float pct)
        {
            e.salaryMonthly = Mathf.RoundToInt(e.salaryMonthly * (1f + pct));
            e.morale = Mathf.Min(100, e.morale + 20f);
            if (e.onStrike) { e.onStrike = false; EventBus.RaiseStat("strikes_resolved", 1); }
        }

        /// <summary>Productivité agrégée d'un rôle sur un site (0 = aucun employé).</summary>
        public float Productivity(string role, int site, float researchMult)
        {
            float p = 0f;
            foreach (var e in _s.employees)
            {
                if (e.role != role || e.site != site || e.onStrike) continue;
                float moraleF = 0.5f + e.morale / 200f;          // 0.5 .. 1.0
                float fatigueF = 1f - e.fatigue / 250f;          // 1.0 .. 0.6
                float skillF = 0.5f + (e.skill + e.xp / 20f) / 130f;
                p += moraleF * fatigueF * Mathf.Min(1.4f, skillF);
            }
            return p * researchMult;
        }

        public void OnNewDay(GameManager gm)
        {
            bool weekend = gm.Clock.IsWeekend;
            bool hasRestRoom = SiteHasBuilding(gm, "salle_repos");
            foreach (var e in _s.employees)
            {
                if (weekend)
                {
                    e.fatigue = Mathf.Max(0, e.fatigue - 30f);
                }
                else
                {
                    e.fatigue = Mathf.Min(100, e.fatigue + (hasRestRoom ? 4f : 8f));
                    e.xp += e.skill / 50f;
                    // Le moral suit la fatigue, la réputation et la présence d'un responsable
                    float drift = -0.5f;
                    if (e.fatigue > 80f) drift -= 1.5f;
                    if (Count("responsable", e.site) > 0) drift += 1f;
                    if (_s.rep.citizens > 70f) drift += 0.5f;
                    if (hasRestRoom) drift += 0.5f;
                    e.morale = Mathf.Clamp(e.morale + drift, 0f, 100f);
                }

                // Risque de grève si moral effondré
                if (!e.onStrike && e.morale < 15f && Random.value < 0.10f)
                {
                    e.onStrike = true;
                    EventBus.Notify(Loc.T("staff.strike"), e.firstName + " " + e.lastName, 2);
                    EventBus.RaiseIncident("greve");
                }
            }

            // Renouvellement du vivier de candidats chaque lundi
            if (gm.Clock.DayOfWeek == 0) RefreshCandidates();
        }

        bool SiteHasBuilding(GameManager gm, string typeId)
        {
            var site = _s.sites[_s.activeSite];
            foreach (var b in site.buildings)
                if (b.typeId == typeId && b.buildDaysLeft <= 0) return true;
            return false;
        }
    }
}
