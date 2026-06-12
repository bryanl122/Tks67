using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.World
{
    /// <summary>
    /// Fabrique d'assets 3D procéduraux : conteneurs, bâtiments, véhicules, décor.
    /// Chaque asset est assemblé à partir de primitives (colliders inclus) et
    /// reçoit un LODGroup (détails coupés à distance) pour tenir sur PC modeste et Steam Deck.
    /// </summary>
    public static class MeshFactory
    {
        // --- Primitives utilitaires ---
        static GameObject Box(Transform parent, string name, Vector3 center, Vector3 size, Color color)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.SetParent(parent, false);
            go.transform.localPosition = center;
            go.transform.localScale = size;
            go.GetComponent<Renderer>().sharedMaterial = MaterialFactory.Get(color);
            return go;
        }

        static GameObject Cyl(Transform parent, string name, Vector3 center, float radius, float height, Color color)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            go.name = name;
            go.transform.SetParent(parent, false);
            go.transform.localPosition = center;
            go.transform.localScale = new Vector3(radius * 2f, height * 0.5f, radius * 2f);
            go.GetComponent<Renderer>().sharedMaterial = MaterialFactory.Get(color);
            return go;
        }

        static void SetupLOD(GameObject root, params GameObject[] detailParts)
        {
            var lod = root.AddComponent<LODGroup>();
            var allRenderers = root.GetComponentsInChildren<Renderer>();
            var detailRenderers = new System.Collections.Generic.List<Renderer>();
            var mainRenderers = new System.Collections.Generic.List<Renderer>(allRenderers);
            foreach (var p in detailParts)
                foreach (var r in p.GetComponentsInChildren<Renderer>())
                { detailRenderers.Add(r); mainRenderers.Remove(r); }

            lod.SetLODs(new[]
            {
                new LOD(0.25f, allRenderers),                 // proche : tout
                new LOD(0.02f, mainRenderers.ToArray()),      // loin : silhouette seule
            });
            lod.RecalculateBounds();
        }

        // --- Sol du site ---
        public static void CreateGround(SiteData site, Transform root)
        {
            float w = site.sizeX * 2f, d = site.sizeZ * 2f;
            // Dalle de béton du parc
            var slab = Box(root, "sol_beton", new Vector3(0, -0.05f, 0), new Vector3(w, 0.1f, d), new Color(0.55f, 0.55f, 0.53f));
            slab.isStatic = true;
            // Herbe environnante
            var grass = Box(root, "herbe", new Vector3(0, -0.12f, 0), new Vector3(w + 60f, 0.1f, d + 60f), new Color(0.30f, 0.45f, 0.22f));
            grass.isStatic = true;
            // Route d'accès (entrée au sud)
            Box(root, "route_acces", new Vector3(0, -0.02f, -d * 0.5f - 10f), new Vector3(8f, 0.06f, 20f), new Color(0.22f, 0.22f, 0.24f)).isStatic = true;
            // Marquage central
            Box(root, "marquage", new Vector3(0, 0.02f, 0), new Vector3(3.5f, 0.02f, d - 2f), new Color(0.35f, 0.35f, 0.37f)).isStatic = true;
        }

        // --- Bâtiments / éléments constructibles ---
        public static GameObject CreateBuilding(BuildingDef def, BuildingData data)
        {
            var root = new GameObject(def.id);
            switch (def.category)
            {
                case BuildingCategory.Conteneur: BuildContainer(root.transform, data); break;
                case BuildingCategory.Decoration: BuildDecoration(root.transform, def.id); break;
                default: BuildStructure(root.transform, def); break;
            }
            return root;
        }

        static void BuildContainer(Transform t, BuildingData data)
        {
            var stream = WasteCatalog.GetStream(data.streamId);
            Color c = stream != null ? stream.color : Color.gray;

            // Benne ouverte : fond + 4 parois, peinte à la couleur du flux
            Box(t, "fond", new Vector3(0, 0.15f, 0), new Vector3(5.6f, 0.3f, 3.6f), MaterialColorWorn(c));
            Box(t, "paroi_g", new Vector3(-2.8f, 1.1f, 0), new Vector3(0.15f, 2.2f, 3.6f), c);
            Box(t, "paroi_d", new Vector3(2.8f, 1.1f, 0), new Vector3(0.15f, 2.2f, 3.6f), c);
            Box(t, "paroi_av", new Vector3(0, 1.1f, 1.8f), new Vector3(5.6f, 2.2f, 0.15f), c);
            Box(t, "paroi_ar", new Vector3(0, 0.8f, -1.8f), new Vector3(5.6f, 1.6f, 0.15f), c); // plus basse : côté dépose
            var rails = Box(t, "rails", new Vector3(0, 0.05f, 0), new Vector3(5.9f, 0.12f, 0.5f), new Color(0.3f, 0.3f, 0.32f));
            // Contenu visible (monte avec le remplissage, mis à jour par ContainerFillView)
            var fill = Box(t, "contenu", new Vector3(0, 0.4f, 0), new Vector3(5.3f, 0.5f, 3.3f), Color.Lerp(c, Color.black, 0.55f));
            var view = t.gameObject.AddComponent<ContainerFillView>();
            view.Init(data, fill.transform);
            SetupLOD(t.gameObject, rails);
        }

        static Color MaterialColorWorn(Color c) => Color.Lerp(c, new Color(0.2f, 0.2f, 0.2f), 0.4f);

        static void BuildStructure(Transform t, BuildingDef def)
        {
            float w = def.sizeX * 2f - 0.4f, d = def.sizeZ * 2f - 0.4f;
            switch (def.id)
            {
                case "route":
                    Box(t, "voirie", new Vector3(0, 0.02f, 0), new Vector3(2f, 0.05f, 2f), new Color(0.22f, 0.22f, 0.24f));
                    break;
                case "parking":
                    Box(t, "dalle", new Vector3(0, 0.02f, 0), new Vector3(w, 0.05f, d), new Color(0.3f, 0.3f, 0.32f));
                    Box(t, "ligne", new Vector3(0, 0.06f, 0), new Vector3(0.15f, 0.02f, d), Color.white);
                    break;
                case "cloture":
                    Box(t, "grillage", new Vector3(0, 0.9f, 0), new Vector3(2f, 1.8f, 0.08f), new Color(0.5f, 0.52f, 0.55f));
                    break;
                case "lampadaire":
                    Cyl(t, "mat", new Vector3(0, 2.5f, 0), 0.08f, 5f, new Color(0.35f, 0.35f, 0.38f));
                    var lampe = Box(t, "lampe", new Vector3(0.5f, 4.9f, 0), new Vector3(1.2f, 0.18f, 0.35f), new Color(0.95f, 0.92f, 0.7f));
                    var l = lampe.AddComponent<Light>();
                    l.type = LightType.Point; l.range = 14f; l.intensity = 0f; // allumé la nuit par LightingController
                    l.color = new Color(1f, 0.93f, 0.75f);
                    lampe.tag = "Untagged"; lampe.name = "lampe_eclairage";
                    break;
                case "borne_incendie":
                    Cyl(t, "borne", new Vector3(0, 0.4f, 0), 0.25f, 0.8f, new Color(0.8f, 0.15f, 0.12f));
                    break;
                case "camera":
                    Cyl(t, "poteau", new Vector3(0, 1.5f, 0), 0.06f, 3f, new Color(0.4f, 0.4f, 0.42f));
                    Box(t, "boitier", new Vector3(0, 3f, 0.2f), new Vector3(0.3f, 0.2f, 0.5f), Color.white);
                    break;
                default:
                    // Bâtiments génériques : murs + toit en pente + porte
                    float h = def.id == "entrepot" || def.id == "hangar" ? 5f : 3.2f;
                    Color wall = def.id == "bureau" ? new Color(0.85f, 0.82f, 0.75f) : new Color(0.6f, 0.62f, 0.66f);
                    Box(t, "murs", new Vector3(0, h * 0.5f, 0), new Vector3(w, h, d), wall);
                    var roof = Box(t, "toit", new Vector3(0, h + 0.25f, 0), new Vector3(w + 0.5f, 0.5f, d + 0.5f), new Color(0.25f, 0.3f, 0.35f));
                    var door = Box(t, "porte", new Vector3(0, 1.1f, d * 0.5f + 0.02f), new Vector3(1.6f, 2.2f, 0.1f), new Color(0.2f, 0.4f, 0.25f));
                    SetupLOD(t.gameObject, door);
                    return;
            }
        }

        static void BuildDecoration(Transform t, string id)
        {
            switch (id)
            {
                case "arbre":
                    Cyl(t, "tronc", new Vector3(0, 1f, 0), 0.18f, 2f, new Color(0.4f, 0.28f, 0.15f));
                    var feuillage = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                    feuillage.name = "feuillage";
                    feuillage.transform.SetParent(t, false);
                    feuillage.transform.localPosition = new Vector3(0, 2.8f, 0);
                    feuillage.transform.localScale = new Vector3(2.4f, 2.2f, 2.4f);
                    feuillage.GetComponent<Renderer>().sharedMaterial = MaterialFactory.Get(new Color(0.22f, 0.5f, 0.2f));
                    break;
                case "haie":
                    Box(t, "haie", new Vector3(0, 0.5f, 0), new Vector3(1.9f, 1f, 0.7f), new Color(0.25f, 0.5f, 0.22f));
                    break;
                case "parterre":
                    Box(t, "terre", new Vector3(0, 0.1f, 0), new Vector3(1.8f, 0.2f, 1.8f), new Color(0.35f, 0.25f, 0.15f));
                    Box(t, "fleurs", new Vector3(0, 0.3f, 0), new Vector3(1.4f, 0.2f, 1.4f), new Color(0.9f, 0.4f, 0.6f));
                    break;
                case "fontaine_eco":
                    Cyl(t, "bassin", new Vector3(0, 0.25f, 0), 1.6f, 0.5f, new Color(0.6f, 0.65f, 0.7f));
                    Cyl(t, "eau", new Vector3(0, 0.45f, 0), 1.4f, 0.1f, new Color(0.3f, 0.6f, 0.85f));
                    Cyl(t, "jet", new Vector3(0, 1.1f, 0), 0.12f, 1.4f, new Color(0.65f, 0.8f, 0.95f));
                    break;
                case "statue_recyclage":
                    Box(t, "socle", new Vector3(0, 0.4f, 0), new Vector3(1.6f, 0.8f, 1.6f), new Color(0.5f, 0.5f, 0.52f));
                    // Trois flèches du recyclage stylisées
                    for (int i = 0; i < 3; i++)
                    {
                        var arrow = Box(t, "fleche" + i, Vector3.zero, new Vector3(1.4f, 0.25f, 0.25f), new Color(0.2f, 0.65f, 0.3f));
                        arrow.transform.localPosition = Quaternion.Euler(0, i * 120f, 0) * new Vector3(0.6f, 1.4f, 0);
                        arrow.transform.localRotation = Quaternion.Euler(0, i * 120f + 60f, 25f);
                    }
                    break;
            }
        }

        // --- Véhicules visiteurs : 0 voiture, 1 voiture+remorque, 2 utilitaire, 3 camion ---
        static readonly Color[] CarColors =
        {
            new Color(0.75f, 0.75f, 0.78f), new Color(0.2f, 0.25f, 0.55f), new Color(0.55f, 0.15f, 0.15f),
            new Color(0.15f, 0.15f, 0.17f), new Color(0.85f, 0.85f, 0.88f), new Color(0.2f, 0.45f, 0.3f)
        };

        public static GameObject CreateVehicle(int type)
        {
            var root = new GameObject("vehicule_" + type);
            var t = root.transform;
            Color c = CarColors[Random.Range(0, CarColors.Length)];

            switch (type)
            {
                case 0: // voiture
                    Box(t, "caisse", new Vector3(0, 0.55f, 0), new Vector3(1.7f, 0.5f, 3.8f), c);
                    Box(t, "habitacle", new Vector3(0, 1.05f, -0.2f), new Vector3(1.5f, 0.5f, 2f), Color.Lerp(c, Color.black, 0.3f));
                    Wheels(t, 0.8f, 1.2f);
                    break;
                case 1: // voiture + remorque
                    Box(t, "caisse", new Vector3(0, 0.55f, 0.8f), new Vector3(1.7f, 0.5f, 3.6f), c);
                    Box(t, "habitacle", new Vector3(0, 1.05f, 0.6f), new Vector3(1.5f, 0.5f, 1.9f), Color.Lerp(c, Color.black, 0.3f));
                    Box(t, "remorque", new Vector3(0, 0.5f, -2.6f), new Vector3(1.5f, 0.45f, 2f), new Color(0.45f, 0.45f, 0.48f));
                    Wheels(t, 0.8f, 1.9f);
                    break;
                case 2: // utilitaire
                    Box(t, "caisse", new Vector3(0, 1f, 0), new Vector3(2f, 1.9f, 4.8f), Color.Lerp(c, Color.white, 0.5f));
                    Box(t, "cabine", new Vector3(0, 0.85f, 2.2f), new Vector3(1.95f, 1.5f, 1f), Color.Lerp(c, Color.white, 0.5f));
                    Wheels(t, 0.95f, 1.7f);
                    break;
                default: // camion
                    Box(t, "benne", new Vector3(0, 1.4f, -0.8f), new Vector3(2.4f, 2f, 5f), new Color(0.5f, 0.52f, 0.55f));
                    Box(t, "cabine", new Vector3(0, 1.2f, 2.6f), new Vector3(2.3f, 1.9f, 1.6f), c);
                    Wheels(t, 1.1f, 2.2f);
                    break;
            }

            // Collider de clic (profil visiteur)
            var col = root.AddComponent<BoxCollider>();
            col.center = new Vector3(0, 1f, 0);
            col.size = new Vector3(2.5f, 2f, type >= 1 ? 7f : 4.5f);
            return root;
        }

        static void Wheels(Transform t, float halfWidth, float halfBase)
        {
            for (int i = 0; i < 4; i++)
            {
                float x = (i % 2 == 0 ? -1 : 1) * halfWidth;
                float z = (i < 2 ? 1 : -1) * halfBase;
                var w = Cyl(t, "wheel" + i, new Vector3(x, 0.35f, z), 0.35f, 0.25f, new Color(0.1f, 0.1f, 0.1f));
                w.transform.localRotation = Quaternion.Euler(0, 0, 90);
                Object.Destroy(w.GetComponent<Collider>());
            }
        }

        // --- Personnage simple (employés visibles sur site) ---
        public static GameObject CreateWorker(Color vest)
        {
            var root = new GameObject("employe");
            var t = root.transform;
            Cyl(t, "corps", new Vector3(0, 0.85f, 0), 0.25f, 1.1f, vest);
            var head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            head.name = "tete";
            head.transform.SetParent(t, false);
            head.transform.localPosition = new Vector3(0, 1.6f, 0);
            head.transform.localScale = Vector3.one * 0.4f;
            head.GetComponent<Renderer>().sharedMaterial = MaterialFactory.Get(new Color(0.9f, 0.75f, 0.6f));
            Box(t, "casque", new Vector3(0, 1.78f, 0), new Vector3(0.42f, 0.18f, 0.42f), new Color(0.95f, 0.8f, 0.1f));
            return root;
        }
    }

    /// <summary>Met à jour la hauteur du contenu visible d'un conteneur selon son remplissage.</summary>
    public class ContainerFillView : MonoBehaviour
    {
        BuildingData _data;
        Transform _fill;

        public void Init(BuildingData data, Transform fill) { _data = data; _fill = fill; }

        void Update()
        {
            if (_data == null || _fill == null) return;
            var def = BuildingCatalog.Get(_data.typeId);
            float ratio = def != null && def.capacityKg > 0 ? Mathf.Clamp01(_data.fillKg / def.capacityKg) : 0f;
            float h = 0.2f + ratio * 1.6f;
            _fill.localScale = new Vector3(5.3f, h, 3.3f);
            _fill.localPosition = new Vector3(0, 0.3f + h * 0.5f, 0);
            _fill.gameObject.SetActive(ratio > 0.02f);
        }
    }
}
