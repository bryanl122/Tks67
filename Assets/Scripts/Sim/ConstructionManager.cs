using System.Collections.Generic;
using CPT.Core;
using CPT.Data;
using CPT.World;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>
    /// Construction sur grille (cellules de 2 m), chantiers, visuels procéduraux,
    /// remplissage des conteneurs et chaîne de traitement quotidienne (vidange → vente).
    /// </summary>
    public class ConstructionManager
    {
        public const float Cell = 2f;

        readonly GameState _s;
        readonly Dictionary<BuildingData, GameObject> _views = new Dictionary<BuildingData, GameObject>();
        bool[,] _occupied;
        Transform _root;

        public ConstructionManager(GameState s) { _s = s; }

        SiteData Site => _s.sites[_s.activeSite];

        // --- Grille ---
        public Vector3 CellToWorld(int x, int z, BuildingDef def)
        {
            float wx = (x + def.sizeX * 0.5f - Site.sizeX * 0.5f) * Cell;
            float wz = (z + def.sizeZ * 0.5f - Site.sizeZ * 0.5f) * Cell;
            return new Vector3(wx, 0f, wz);
        }

        public bool CanPlace(BuildingDef def, int x, int z)
        {
            if (def == null || x < 0 || z < 0 || x + def.sizeX > Site.sizeX || z + def.sizeZ > Site.sizeZ) return false;
            for (int i = x; i < x + def.sizeX; i++)
                for (int j = z; j < z + def.sizeZ; j++)
                    if (_occupied[i, j]) return false;
            return true;
        }

        public bool Place(string typeId, int x, int z, EconomyManager eco, bool premiumPaid = false, bool instant = false)
        {
            var def = BuildingCatalog.Get(typeId);
            if (!CanPlace(def, x, z)) return false;
            if (!def.premiumOnly && !eco.Spend(def.cost, Loc.T("bld." + typeId))) return false;
            if (def.premiumOnly && !premiumPaid) return false;

            var data = new BuildingData
            {
                typeId = typeId,
                x = x, z = z,
                buildDaysLeft = instant ? 0 : def.buildDays,
                streamId = def.defaultStream
            };
            Site.buildings.Add(data);
            Occupy(def, x, z, true);
            SpawnView(data, def);
            _s.stats.buildingsBuilt++;
            EventBus.RaiseStat("buildings_built", 1);
            if (def.category == BuildingCategory.Decoration) EventBus.RaiseStat("decorations_built", 1);
            if (def.category == BuildingCategory.Conteneur) EventBus.RaiseStat("containers_set", CountContainers());
            return true;
        }

        public void Demolish(BuildingData data)
        {
            var def = BuildingCatalog.Get(data.typeId);
            Site.buildings.Remove(data);
            if (def != null) Occupy(def, data.x, data.z, false);
            if (_views.TryGetValue(data, out var go)) { Object.Destroy(go); _views.Remove(data); }
        }

        void Occupy(BuildingDef def, int x, int z, bool value)
        {
            for (int i = x; i < x + def.sizeX; i++)
                for (int j = z; j < z + def.sizeZ; j++)
                    _occupied[i, j] = value;
        }

        // --- Visuels ---
        public void RebuildSite()
        {
            if (_root != null) Object.Destroy(_root.gameObject);
            _views.Clear();
            _root = new GameObject("Site").transform;
            _occupied = new bool[Site.sizeX, Site.sizeZ];

            MeshFactory.CreateGround(Site, _root);
            foreach (var b in Site.buildings)
            {
                var def = BuildingCatalog.Get(b.typeId);
                if (def == null) continue;
                Occupy(def, b.x, b.z, true);
                SpawnView(b, def);
            }
        }

        void SpawnView(BuildingData data, BuildingDef def)
        {
            var go = MeshFactory.CreateBuilding(def, data);
            go.transform.SetParent(_root, false);
            go.transform.position = CellToWorld(data.x, data.z, def);
            go.transform.rotation = Quaternion.Euler(0, data.rot * 90f, 0);
            if (data.buildDaysLeft > 0)
            {
                go.transform.localScale = new Vector3(1f, 0.25f, 1f);
                MaterialFactory.Tint(go, new Color(0.7f, 0.7f, 0.6f));
            }
            _views[data] = go;
        }

        public GameObject ViewOf(BuildingData data) => _views.TryGetValue(data, out var go) ? go : null;

        // --- Conteneurs ---
        public int CountContainers()
        {
            int n = 0;
            foreach (var b in Site.buildings)
            {
                var def = BuildingCatalog.Get(b.typeId);
                if (def != null && def.category == BuildingCategory.Conteneur && b.buildDaysLeft <= 0) n++;
            }
            return n;
        }

        public float ContainerCapacity(BuildingData b, GameManager gm)
        {
            var def = BuildingCatalog.Get(b.typeId);
            if (def == null) return 0f;
            float levelMult = 1f + 0.5f * (b.level - 1);
            return def.capacityKg * levelMult
                * (1f + gm.Equipment.Bonus("capacity", _s.activeSite))
                * gm.Research.GetMult("capacity");
        }

        /// <summary>Conteneur opérationnel le moins rempli acceptant ce flux, ou null.</summary>
        public BuildingData FindContainer(string streamId)
        {
            BuildingData best = null;
            foreach (var b in Site.buildings)
            {
                var def = BuildingCatalog.Get(b.typeId);
                if (def == null || def.category != BuildingCategory.Conteneur) continue;
                if (b.streamId != streamId || b.buildDaysLeft > 0 || b.onFire) continue;
                if (best == null || b.fillKg < best.fillKg) best = b;
            }
            return best;
        }

        /// <summary>Dépose des déchets ; retourne les kg réellement acceptés.</summary>
        public float Deposit(BuildingData container, float kg, GameManager gm)
        {
            float cap = ContainerCapacity(container, gm);
            float accepted = Mathf.Min(kg, cap - container.fillKg);
            container.fillKg += Mathf.Max(0, accepted);
            if (accepted < kg)
                Site.groundPollution = Mathf.Min(100f, Site.groundPollution + 0.5f); // débordement
            return Mathf.Max(0, accepted);
        }

        // --- Cycle quotidien : chantiers + vidange/traitement ---
        public void OnNewDay(GameManager gm)
        {
            // Avancement des chantiers
            foreach (var b in Site.buildings)
            {
                if (b.buildDaysLeft > 0)
                {
                    b.buildDaysLeft -= 1f;
                    if (b.buildDaysLeft <= 0 && _views.TryGetValue(b, out var go))
                    {
                        go.transform.localScale = Vector3.one;
                        MaterialFactory.Untint(go);
                        EventBus.Notify(Loc.T("build.completed"), Loc.T("bld." + b.typeId), 0);
                        var def = BuildingCatalog.Get(b.typeId);
                        if (def != null && def.category == BuildingCategory.Conteneur)
                            EventBus.RaiseStat("containers_set", CountContainers());
                    }
                }
            }

            ProcessCollections(gm);

            // La pollution du sol se résorbe lentement
            foreach (var site in _s.sites)
                site.groundPollution = Mathf.Max(0, site.groundPollution - 0.3f * gm.Research.GetMult("pollution"));
        }

        /// <summary>Vidange des conteneurs par les camions et vente des matériaux.</summary>
        void ProcessCollections(GameManager gm)
        {
            float drivers = gm.Staff.Productivity("chauffeur", _s.activeSite, 1f);
            float sorters = gm.Staff.Productivity("agent_tri", _s.activeSite, gm.Research.GetMult("productivity"));
            float capacityKgPerDay = 3000f
                * (1f + gm.Equipment.Bonus("throughput", _s.activeSite))
                * (1f + drivers * 0.3f)
                * gm.Research.GetMult("throughput");

            float remaining = capacityKgPerDay;
            long dayRevenue = 0;
            foreach (var b in Site.buildings)
            {
                if (remaining <= 0) break;
                var def = BuildingCatalog.Get(b.typeId);
                if (def == null || def.category != BuildingCategory.Conteneur || b.fillKg <= 10f) continue;

                float taken = Mathf.Min(b.fillKg, remaining);
                b.fillKg -= taken;
                remaining -= taken;

                float tons = taken / 1000f;
                float price = gm.Contracts.EffectivePrice(b.streamId)
                    * (1f + gm.Equipment.Bonus("value", _s.activeSite))
                    * gm.Research.GetMult("value");
                float cost = AvgProcessCost(b.streamId) / (1f + sorters * 0.1f);
                float recycle = Mathf.Min(1f, AvgRecycleRate(b.streamId) * (1f + sorters * 0.05f));

                long net = (long)(tons * (price * recycle - cost));
                if (net > 0) { gm.Economy.Earn(net, Loc.T("eco.materials_sold")); dayRevenue += net; }
                else gm.Economy.Spend(-net, Loc.T("eco.processing_cost"), true);

                _s.stats.tonsRecycled += tons * recycle;
                _s.stats.co2SavedKg += taken * AvgCo2(b.streamId) * recycle;
                _s.stats.containersEmptied++;
                EventBus.RaiseStat("tons", tons * recycle);
                EventBus.RaiseStat("co2_saved", taken * AvgCo2(b.streamId) * recycle);
                EventBus.RaiseStat("containers_emptied", 1);
            }
            if (dayRevenue > _s.stats.bestDayIncome) _s.stats.bestDayIncome = dayRevenue;
        }

        static float AvgProcessCost(string stream)
        { float s = 0; int n = 0; foreach (var w in WasteCatalog.ByStream(stream)) { s += w.processCostPerTon; n++; } return n > 0 ? s / n : 0; }
        static float AvgRecycleRate(string stream)
        { float s = 0; int n = 0; foreach (var w in WasteCatalog.ByStream(stream)) { s += w.recycleRate; n++; } return n > 0 ? s / n : 0; }
        static float AvgCo2(string stream)
        { float s = 0; int n = 0; foreach (var w in WasteCatalog.ByStream(stream)) { s += w.co2SavedPerKg; n++; } return n > 0 ? s / n : 0; }
    }
}
