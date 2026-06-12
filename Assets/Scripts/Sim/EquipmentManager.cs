using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>
    /// Équipements : achat, pannes, réparations, améliorations et bonus agrégés.
    /// </summary>
    public class EquipmentManager
    {
        readonly GameState _s;
        public EquipmentManager(GameState s) { _s = s; }

        SiteData Site => _s.sites[_s.activeSite];

        public bool Buy(string machineId, EconomyManager eco, bool premium = false)
        {
            var def = MachineCatalog.Get(machineId);
            if (def == null) return false;
            if (!premium && !eco.Spend(def.cost, Loc.T("mach." + machineId))) return false;
            Site.machines.Add(new MachineData { typeId = machineId });
            EventBus.RaiseStat("machines_bought", 1);
            EventBus.Notify(Loc.T("equip.bought"), Loc.T("mach." + machineId), 0);
            return true;
        }

        /// <summary>Améliore une machine : +20 % d'efficacité et -20 % de pannes par niveau (max 3).</summary>
        public bool Upgrade(MachineData m, EconomyManager eco)
        {
            var def = MachineCatalog.Get(m.typeId);
            if (def == null || m.level >= 3) return false;
            long cost = def.cost / 2 * m.level;
            if (!eco.Spend(cost, Loc.T("equip.upgrade"))) return false;
            m.level++;
            return true;
        }

        public bool Repair(MachineData m, EconomyManager eco, bool instant = false)
        {
            var def = MachineCatalog.Get(m.typeId);
            if (def == null || !m.broken) return false;
            long cost = def.cost / 10;
            if (!instant && !eco.Spend(cost, Loc.T("equip.repair"))) return false;
            if (instant) { m.broken = false; m.condition = 100f; m.repairDaysLeft = 0; }
            else m.repairDaysLeft = 2f;
            return true;
        }

        /// <summary>Bonus agrégé du site actif pour une clé : value / capacity / throughput.</summary>
        public float Bonus(string key, int siteIndex)
        {
            float total = 0f;
            foreach (var m in _s.sites[siteIndex].machines)
            {
                if (m.broken) continue;
                var def = MachineCatalog.Get(m.typeId);
                if (def == null) continue;
                float levelMult = 1f + 0.2f * (m.level - 1);
                float v = key == "value" ? def.valueBonus
                        : key == "capacity" ? def.capacityBonus
                        : key == "throughput" ? def.throughputBonus : 0f;
                total += v * levelMult;
            }
            return total;
        }

        public void OnNewDay(GameManager gm)
        {
            float mechanics = gm.Staff.Productivity("mecanicien", _s.activeSite, 1f);
            foreach (var site in _s.sites)
            {
                foreach (var m in site.machines)
                {
                    var def = MachineCatalog.Get(m.typeId);
                    if (def == null) continue;

                    if (m.broken)
                    {
                        // Les mécaniciens accélèrent la réparation
                        if (m.repairDaysLeft > 0)
                        {
                            m.repairDaysLeft -= 1f + mechanics * 0.5f;
                            if (m.repairDaysLeft <= 0) { m.broken = false; m.condition = 100f; }
                        }
                        continue;
                    }

                    // Usure quotidienne, ralentie par l'entretien préventif (mécaniciens)
                    m.condition = Mathf.Max(0, m.condition - Random.Range(0.3f, 1.2f) / (1f + mechanics * 0.3f));

                    // Panne : probabilité quotidienne dérivée du taux mensuel, réduite par IA maintenance + niveau
                    float dayChance = def.breakdownPerMonth / 30f
                        * gm.Research.GetMult("breakdown")
                        * (1f + (100f - m.condition) / 100f)
                        * (1f - 0.2f * (m.level - 1));
                    if (Random.value < dayChance)
                    {
                        m.broken = true;
                        m.repairDaysLeft = 0;
                        EventBus.Notify(Loc.T("equip.breakdown"), Loc.T("mach." + m.typeId), 1);
                        EventBus.RaiseIncident("panne_machine");
                    }
                }
            }
        }
    }
}
