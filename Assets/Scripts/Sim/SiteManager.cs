using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>
    /// Multi-sites : achat de nouveaux parcs, changement de site actif,
    /// bonus de couverture régionale et nationale.
    /// </summary>
    public class SiteManager
    {
        readonly GameState _s;
        public SiteManager(GameState s) { _s = s; }

        public int Count => _s.sites.Count;

        /// <summary>Prix du prochain parc : croissance forte pour rythmer l'expansion.</summary>
        public long NextSiteCost() => (long)(120000 * Mathf.Pow(1.9f, _s.sites.Count - 1));

        public bool CanExpand() => _s.sites.Count < NameDatabase.Regions.Length;

        public bool BuyNewSite(GameManager gm)
        {
            if (!CanExpand()) return false;
            long cost = NextSiteCost();
            if (!gm.Economy.Spend(cost, Loc.T("site.purchase"))) return false;

            int idx = _s.sites.Count;
            var site = new SiteData
            {
                name = NameDatabase.SiteNames[Mathf.Min(idx, NameDatabase.SiteNames.Length - 1)],
                region = NameDatabase.Regions[Mathf.Min(idx, NameDatabase.Regions.Length - 1)],
                sizeX = 48 + idx * 4,
                sizeZ = 36 + idx * 2
            };
            _s.sites.Add(site);
            EventBus.RaiseStat("sites_owned_set", _s.sites.Count);
            EventBus.Notify(Loc.T("site.purchased"), site.name + " (" + site.region + ")", 0);
            return true;
        }

        public void SwitchTo(int index, GameManager gm)
        {
            if (index < 0 || index >= _s.sites.Count || index == _s.activeSite) return;
            _s.activeSite = index;
            gm.Construction.RebuildSite();
            gm.Visitors.ClearAll();
        }

        /// <summary>
        /// Bonus d'échelle : +2 % de valeur des matériaux par site supplémentaire
        /// (mutualisation logistique régionale puis nationale).
        /// </summary>
        public float NetworkValueBonus() => 0.02f * (_s.sites.Count - 1);
    }
}
