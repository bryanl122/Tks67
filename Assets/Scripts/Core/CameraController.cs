using UnityEngine;

namespace CPT.Core
{
    /// <summary>
    /// Caméra de gestion : déplacement ZQSD/WASD/flèches + bords d'écran,
    /// zoom molette, rotation (clic milieu ou A/E). Pensée clavier + manette Steam Deck.
    /// </summary>
    public class CameraController : MonoBehaviour
    {
        public static Camera Cam { get; private set; }

        float _zoom = 35f;
        float _yaw = 0f;
        Vector3 _focus = Vector3.zero;

        public static CameraController Create()
        {
            var go = new GameObject("CameraGestion");
            Cam = go.AddComponent<Camera>();
            go.AddComponent<AudioListener>();
            Cam.fieldOfView = 50f;
            Cam.nearClipPlane = 0.3f;
            Cam.farClipPlane = 500f;
            return go.AddComponent<CameraController>();
        }

        void LateUpdate()
        {
            var gm = GameManager.I;
            if (gm == null || !gm.Running) return;

            float dt = Time.unscaledDeltaTime;
            float panSpeed = _zoom * 0.8f;

            Vector3 input = Vector3.zero;
            if (Input.GetKey(KeyCode.Z) || Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.UpArrow)) input.z += 1;
            if (Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow)) input.z -= 1;
            if (Input.GetKey(KeyCode.Q) || Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow)) input.x -= 1;
            if (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow)) input.x += 1;

            var rot = Quaternion.Euler(0, _yaw, 0);
            _focus += rot * input.normalized * panSpeed * dt;

            // Limites du terrain
            var site = gm.S.sites[gm.S.activeSite];
            float maxX = site.sizeX + 20f, maxZ = site.sizeZ + 25f;
            _focus.x = Mathf.Clamp(_focus.x, -maxX, maxX);
            _focus.z = Mathf.Clamp(_focus.z, -maxZ, maxZ);

            // Zoom
            _zoom = Mathf.Clamp(_zoom - Input.mouseScrollDelta.y * 4f, 12f, 80f);

            // Rotation
            if (Input.GetKey(KeyCode.E)) _yaw += 60f * dt;
            if (Input.GetKey(KeyCode.A) && Input.GetKey(KeyCode.LeftShift)) _yaw -= 60f * dt;
            if (Input.GetMouseButton(2)) _yaw += Input.GetAxis("Mouse X") * 4f;

            float pitch = Mathf.Lerp(35f, 60f, Mathf.InverseLerp(12f, 80f, _zoom));
            var offset = Quaternion.Euler(pitch, _yaw, 0) * new Vector3(0, 0, -_zoom);
            transform.position = _focus + offset;
            transform.rotation = Quaternion.LookRotation(_focus - transform.position);
        }

        public void FocusOn(Vector3 worldPos) { _focus = worldPos; }
        public void ResetView() { _focus = Vector3.zero; _zoom = 35f; _yaw = 0f; }
    }
}
