using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>
    /// Événements dynamiques : incendies, pannes électriques, contrôles administratifs,
    /// pollutions accidentelles, accidents du travail, catastrophes naturelles.
    /// (Les grèves sont gérées par StaffManager, les pannes machines par EquipmentManager.)
    /// </summary>
    public class IncidentSystem
    {
        readonly GameState _s;
        public bool PowerOutage { get; private set; }
        int _outageDaysLeft;

        public IncidentSystem(GameState s) { _s = s; }

        public void OnNewDay(GameManager gm)
        {
            var site = _s.sites[_s.activeSite];
            float risk = gm.Weather.IncidentRiskMultiplier / Mathf.Max(0.5f, gm.Research.GetMult("security"));
            float securityStaff = gm.Staff.Productivity("securite", _s.activeSite, 1f);
            risk /= 1f + securityStaff * 0.3f;

            ResolveOngoing(gm, site);

            // --- Incendie : risque accru par les flux dangereux remplis ---
            float dangerFill = 0f;
            foreach (var b in site.buildings)
                if (b.streamId == "dangereux" || b.streamId == "batteries") dangerFill += b.fillKg;
            float fireChance = (0.004f + dangerFill / 2000000f) * risk;
            if (Random.value < fireChance) StartFire(gm, site);

            // --- Panne électrique générale ---
            if (!PowerOutage && Random.value < 0.005f * risk)
            {
                PowerOutage = true;
                _outageDaysLeft = Random.Range(1, 3);
                RegisterIncident(gm, "panne_electrique", 2);
                EventBus.Notify(Loc.T("incident.power_outage"), Loc.T("incident.power_outage_body"), 2);
            }

            // --- Contrôle administratif (inspecteur Mertens) ---
            if (Random.value < 0.015f)
            {
                if (site.groundPollution > 30f)
                {
                    long fine = (long)(2000 + site.groundPollution * 120);
                    gm.Economy.Spend(fine, Loc.T("incident.fine"), true);
                    _s.stats.finesPaid++;
                    gm.Reputation.Penalize(0, 0, 8f);
                    RegisterIncident(gm, "controle_rate", 2);
                    EventBus.Notify(Loc.T("incident.inspection_failed"), Loc.T("incident.inspection_failed_body", Loc.Money(fine)), 2);
                }
                else
                {
                    gm.Reputation.Penalize(-2f, 0, -5f); // bonus
                    EventBus.RaiseStat("inspections_passed", 1);
                    EventBus.Notify(Loc.T("incident.inspection_passed"), Loc.T("incident.inspection_passed_body"), 0);
                }
            }

            // --- Pollution accidentelle ---
            if (Random.value < 0.008f * risk)
            {
                site.groundPollution = Mathf.Min(100f, site.groundPollution + Random.Range(8f, 20f));
                RegisterIncident(gm, "pollution", 1);
                EventBus.Notify(Loc.T("incident.pollution"), Loc.T("incident.pollution_body"), 1);
            }

            // --- Accident du travail (fatigue élevée) ---
            foreach (var e in _s.employees)
            {
                if (e.fatigue > 85f && Random.value < 0.01f)
                {
                    long cost = _s.eco.insuranceTier >= 1 ? 1500 : 8000;
                    gm.Economy.Spend(cost, Loc.T("incident.accident"), true);
                    e.fatigue = 0; e.morale -= 10;
                    RegisterIncident(gm, "accident", 1);
                    EventBus.Notify(Loc.T("incident.accident"), e.firstName + " " + e.lastName, 1);
                    break;
                }
            }

            // --- Catastrophe naturelle (uniquement par tempête) ---
            if (gm.Weather.Current == WeatherType.Tempete && Random.value < 0.06f)
            {
                foreach (var b in site.buildings)
                {
                    if (b.buildDaysLeft > 0) continue;
                    if (Random.value < 0.15f) b.condition = Mathf.Max(10f, b.condition - Random.Range(20f, 50f));
                }
                long damage = Random.Range(3000, 12000);
                long covered = _s.eco.insuranceTier >= 2 ? damage * 8 / 10 : 0;
                gm.Economy.Spend(damage - covered, Loc.T("incident.storm_damage"), true);
                RegisterIncident(gm, "catastrophe", 2);
                EventBus.Notify(Loc.T("incident.storm"), Loc.T("incident.storm_body", Loc.Money(damage - covered)), 2);
            }
        }

        void StartFire(GameManager gm, SiteData site)
        {
            BuildingData target = null;
            foreach (var b in site.buildings)
                if (b.fillKg > 100f && !b.onFire) { target = b; break; }
            if (target == null) return;

            target.onFire = true;
            RegisterIncident(gm, "incendie", 2);
            EventBus.Notify(Loc.T("incident.fire"), Loc.T("incident.fire_body"), 2);
            var view = gm.Construction.ViewOf(target);
            if (view != null) World.VFXFactory.AttachFire(view.transform);
        }

        void ResolveOngoing(GameManager gm, SiteData site)
        {
            if (PowerOutage && --_outageDaysLeft <= 0)
            {
                PowerOutage = false;
                EventBus.Notify(Loc.T("incident.power_back"), "", 0);
            }

            foreach (var b in site.buildings)
            {
                if (!b.onFire) continue;
                bool hydrant = false;
                foreach (var o in site.buildings) if (o.typeId == "borne_incendie" && o.buildDaysLeft <= 0) hydrant = true;
                float extinguishChance = 0.5f + (hydrant ? 0.3f : 0f) + gm.Staff.Count("securite", _s.activeSite) * 0.1f;
                if (Random.value < extinguishChance)
                {
                    b.onFire = false;
                    b.fillKg *= 0.4f;                     // une partie du contenu est perdue
                    b.condition = Mathf.Max(20f, b.condition - 30f);
                    EventBus.RaiseStat("fires_extinguished", 1);
                    var view = gm.Construction.ViewOf(b);
                    if (view != null) World.VFXFactory.DetachFire(view.transform);
                    EventBus.Notify(Loc.T("incident.fire_out"), "", 0);
                }
                else
                {
                    site.groundPollution = Mathf.Min(100f, site.groundPollution + 5f);
                }
            }
        }

        void RegisterIncident(GameManager gm, string id, int severity)
        {
            _s.stats.incidentsTotal++;
            EventBus.RaiseStat("incidents_survived", 1);
            EventBus.RaiseIncident(id);
        }
    }
}
