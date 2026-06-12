using System.Collections.Generic;
using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>
    /// Agent 3D d'un visiteur : conduite vers le conteneur, file d'attente,
    /// déchargement, calcul de satisfaction, sortie du parc.
    /// Cliquer sur le véhicule affiche le profil du visiteur.
    /// </summary>
    public class VisitorAgent : MonoBehaviour
    {
        enum Phase { Entering, Driving, Queueing, Unloading, Leaving }

        public BuildingData TargetContainer { get; private set; }

        GameManager _gm;
        VisitorManager _mgr;
        VisitorProfile _p;
        Phase _phase;
        int _loadIndex;
        float _unloadTimer;
        float _waitedSeconds;
        Vector3 _target;
        List<Transform> _wheels = new List<Transform>();

        public void Init(GameManager gm, VisitorManager mgr, VisitorProfile p)
        {
            _gm = gm; _mgr = mgr; _p = p;
            foreach (Transform t in transform) if (t.name.StartsWith("wheel")) _wheels.Add(t);

            var site = gm.S.sites[gm.S.activeSite];
            float entranceZ = -site.sizeZ * ConstructionManager.Cell * 0.5f - 10f;
            transform.position = new Vector3(0f, 0f, entranceZ);
            _phase = Phase.Entering;
            PickNextTarget();
        }

        void PickNextTarget()
        {
            while (_loadIndex < _p.load.Count)
            {
                var waste = WasteCatalog.Get(_p.load[_loadIndex].Key);
                TargetContainer = _gm.Construction.FindContainer(waste.streamId);
                if (TargetContainer != null)
                {
                    var def = BuildingCatalog.Get(TargetContainer.typeId);
                    var pos = _gm.Construction.CellToWorld(TargetContainer.x, TargetContainer.z, def);
                    _target = pos + new Vector3(0f, 0f, -3.5f);   // place de dépose devant le conteneur
                    _phase = Phase.Driving;
                    return;
                }
                // Pas de conteneur pour ce flux : déchet refusé → frustration + petite pollution
                _p.satisfaction -= 12f;
                _gm.S.sites[_gm.S.activeSite].groundPollution += 0.2f;
                _loadIndex++;
            }
            // Tout déposé (ou refusé) : sortie
            var site = _gm.S.sites[_gm.S.activeSite];
            _target = new Vector3(0f, 0f, -site.sizeZ * ConstructionManager.Cell * 0.5f - 14f);
            _phase = Phase.Leaving;
            TargetContainer = null;
        }

        void Update()
        {
            float speedMult = Mathf.Max(0, _gm.S.speed);
            if (speedMult <= 0) return;
            float dt = Time.deltaTime * speedMult;

            switch (_phase)
            {
                case Phase.Entering:
                case Phase.Driving:
                case Phase.Leaving:
                    Drive(dt);
                    break;

                case Phase.Queueing:
                    _waitedSeconds += dt;
                    if (_mgr.QueueLengthFor(TargetContainer) <= 2 || _waitedSeconds > 20f)
                    {
                        _phase = Phase.Unloading;
                        _unloadTimer = Random.Range(4f, 8f);
                    }
                    break;

                case Phase.Unloading:
                    _unloadTimer -= dt;
                    if (_unloadTimer <= 0f) FinishUnload();
                    break;
            }
        }

        void Drive(float dt)
        {
            Vector3 to = _target - transform.position; to.y = 0;
            if (to.magnitude < 0.4f)
            {
                if (_phase == Phase.Leaving) { Done(); return; }
                // Arrivé devant le conteneur : file d'attente si occupé
                _waitedSeconds = 0f;
                _phase = _mgr.QueueLengthFor(TargetContainer) > 3 ? Phase.Queueing : Phase.Unloading;
                _unloadTimer = Random.Range(4f, 8f);
                return;
            }
            var dir = to.normalized;
            transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(dir), dt * 4f);
            float speed = 6f;
            transform.position += dir * speed * dt;
            foreach (var w in _wheels) w.Rotate(Vector3.right, speed * dt * 90f, Space.Self);
        }

        void FinishUnload()
        {
            var entry = _p.load[_loadIndex];
            var waste = WasteCatalog.Get(entry.Key);
            float accepted = _gm.Construction.Deposit(TargetContainer, entry.Value, _gm);

            // Tarification visiteur (flux payants)
            if (waste.dropFeePerKg > 0f && accepted > 0f)
            {
                long fee = (long)(accepted * waste.dropFeePerKg);
                if (fee > 0) _gm.Economy.Earn(fee, Loc.T("eco.drop_fees"));
            }

            // Satisfaction : attente, conteneur plein, agents de tri présents, décorations
            if (accepted < entry.Value * 0.9f) _p.satisfaction -= 15f;
            _p.satisfaction -= Mathf.Min(15f, _waitedSeconds * 0.6f);
            if (_gm.Staff.Count("agent_tri", _gm.S.activeSite) > 0) _p.satisfaction += 5f;
            _p.satisfaction = Mathf.Clamp(_p.satisfaction, 0f, 100f);

            _loadIndex++;
            PickNextTarget();
        }

        void Done()
        {
            _mgr.OnAgentDone(this, _p);
            Destroy(gameObject);
        }

        /// <summary>Clic : profil du visiteur + réplique d'ambiance.</summary>
        void OnMouseDown()
        {
            string typeLabel = Loc.T("visitor.type" + _p.profileType);
            string line = Loc.T("npc." + (Random.Range(0, StoryDatabase.NpcLineCount) + 1));
            EventBus.Notify(
                _p.firstName + " " + _p.lastName + ", " + _p.age + " " + Loc.T("ui.years"),
                typeLabel + " — " + Loc.T("visitor.visits", _p.visitsCount) + "\n« " + line + " »", 0);
        }
    }
}
