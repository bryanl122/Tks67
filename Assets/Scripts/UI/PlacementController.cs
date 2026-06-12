using CPT.Core;
using CPT.Data;
using CPT.Sim;
using UnityEngine;

namespace CPT.UI
{
    /// <summary>
    /// Mode construction : fantôme sous le curseur aligné sur la grille,
    /// clic gauche pour placer, clic droit / Échap pour annuler.
    /// </summary>
    public class PlacementController : MonoBehaviour
    {
        public static PlacementController I { get; private set; }

        string _typeId;
        GameObject _ghost;
        bool _premiumPaid;

        void Awake() { I = this; }

        public bool IsPlacing => _typeId != null;

        public void BeginPlacement(string typeId, bool premiumPaid = false)
        {
            CancelPlacement();
            _typeId = typeId;
            _premiumPaid = premiumPaid;
            var def = BuildingCatalog.Get(typeId);
            _ghost = World.MeshFactory.CreateBuilding(def, new BuildingData { typeId = typeId, streamId = def.defaultStream });
            foreach (var c in _ghost.GetComponentsInChildren<Collider>()) c.enabled = false;
            World.MaterialFactory.Tint(_ghost, new Color(0.4f, 1f, 0.5f, 0.6f));
        }

        public void CancelPlacement()
        {
            if (_ghost != null) Destroy(_ghost);
            _ghost = null;
            _typeId = null;
        }

        void Update()
        {
            if (!IsPlacing) return;
            var gm = GameManager.I;
            if (gm == null || !gm.Running) { CancelPlacement(); return; }

            if (Input.GetKeyDown(KeyCode.Escape) || Input.GetMouseButtonDown(1)) { CancelPlacement(); return; }

            // Projection du curseur sur le plan du sol
            var ray = CameraController.Cam.ScreenPointToRay(Input.mousePosition);
            if (!new Plane(Vector3.up, Vector3.zero).Raycast(ray, out float dist)) return;
            var world = ray.GetPoint(dist);

            var def = BuildingCatalog.Get(_typeId);
            var site = gm.S.sites[gm.S.activeSite];
            int cx = Mathf.FloorToInt(world.x / ConstructionManager.Cell + site.sizeX * 0.5f - def.sizeX * 0.5f);
            int cz = Mathf.FloorToInt(world.z / ConstructionManager.Cell + site.sizeZ * 0.5f - def.sizeZ * 0.5f);

            bool ok = gm.Construction.CanPlace(def, cx, cz);
            _ghost.transform.position = gm.Construction.CellToWorld(
                Mathf.Clamp(cx, 0, site.sizeX - def.sizeX), Mathf.Clamp(cz, 0, site.sizeZ - def.sizeZ), def);
            World.MaterialFactory.Tint(_ghost, ok ? new Color(0.4f, 1f, 0.5f) : new Color(1f, 0.35f, 0.3f));

            if (ok && Input.GetMouseButtonDown(0) && !UnityEngine.EventSystems.EventSystem.current.IsPointerOverGameObject())
            {
                if (gm.Construction.Place(_typeId, cx, cz, gm.Economy, _premiumPaid))
                {
                    World.AudioManager.PlaySfx("click");
                    World.VFXFactory.DustPuff(_ghost.transform.position);
                    if (gm.S.mode == 0 && !gm.S.tutorialDone && gm.S.tutorialStep == 2) gm.Missions.AdvanceTutorial();
                    if (!Input.GetKey(KeyCode.LeftShift)) CancelPlacement();  // Maj : placement en série
                }
                else
                {
                    EventBus.Notify(Loc.T("build.cannot_afford"), "", 1);
                }
            }
        }
    }
}
