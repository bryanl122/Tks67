using UnityEngine;

namespace CPT.World
{
    /// <summary>
    /// Synthèse audio procédurale : tous les sons et musiques sont générés par code
    /// (aucun fichier binaire requis). Bruits d'interface, alarmes, machines,
    /// et boucles musicales génératives par contexte.
    /// </summary>
    public static class ProceduralAudio
    {
        const int Rate = 44100;

        static AudioClip Render(string name, float seconds, System.Func<float, float> wave)
        {
            int n = Mathf.CeilToInt(seconds * Rate);
            var data = new float[n];
            for (int i = 0; i < n; i++) data[i] = Mathf.Clamp(wave(i / (float)Rate), -1f, 1f);
            var clip = AudioClip.Create(name, n, 1, Rate, false);
            clip.SetData(data, 0);
            return clip;
        }

        static float Sine(float t, float f) => Mathf.Sin(2f * Mathf.PI * f * t);
        static float Noise() => Random.value * 2f - 1f;
        static float Env(float t, float dur) => Mathf.Clamp01(1f - t / dur);

        // --- Effets sonores ---
        public static AudioClip Click() =>
            Render("sfx_click", 0.06f, t => Sine(t, 1400f) * Env(t, 0.06f) * 0.4f);

        public static AudioClip Cash() =>
            Render("sfx_cash", 0.35f, t =>
                (Sine(t, 1318f) * Env(t, 0.15f) + (t > 0.12f ? Sine(t, 1760f) * Env(t - 0.12f, 0.2f) : 0f)) * 0.35f);

        public static AudioClip Notification() =>
            Render("sfx_notif", 0.3f, t =>
                (Sine(t, 880f) * Env(t, 0.12f) + (t > 0.1f ? Sine(t, 1108f) * Env(t - 0.1f, 0.18f) : 0f)) * 0.3f);

        public static AudioClip Alarm() =>
            Render("sfx_alarm", 1.2f, t =>
                Sine(t, 700f + 250f * Mathf.PingPong(t * 4f, 1f)) * 0.4f * (1f - t / 1.4f));

        public static AudioClip Achievement() =>
            Render("sfx_achievement", 0.7f, t =>
            {
                float v = 0f;
                float[] notes = { 523f, 659f, 784f, 1046f };
                for (int i = 0; i < notes.Length; i++)
                {
                    float start = i * 0.12f;
                    if (t >= start) v += Sine(t, notes[i]) * Env(t - start, 0.25f) * 0.22f;
                }
                return v;
            });

        public static AudioClip Mission() =>
            Render("sfx_mission", 0.6f, t =>
                (Sine(t, 659f) * Env(t, 0.2f) + (t > 0.18f ? Sine(t, 988f) * Env(t - 0.18f, 0.3f) : 0f)) * 0.32f);

        public static AudioClip MachineHum() =>
            Render("sfx_machine", 2f, t =>
                (Sine(t, 85f) * 0.3f + Sine(t, 170f) * 0.15f + Noise() * 0.05f));

        public static AudioClip TruckEngine() =>
            Render("sfx_truck", 1.5f, t =>
                (Sine(t, 60f + Sine(t, 3f) * 6f) * 0.35f + Noise() * 0.08f));

        public static AudioClip Ambience() =>
            Render("sfx_ambience", 4f, t =>
                Noise() * 0.04f * (0.7f + 0.3f * Sine(t, 0.4f)) + Sine(t, 130f) * 0.02f);

        // --- Musique générative ---
        // Progressions d'accords par contexte (fréquences fondamentales).
        static readonly float[][] MenuChords = { Pc(261.6f), Pc(196.0f), Pc(220.0f), Pc(174.6f) };       // C G Am F
        static readonly float[][] GameChords = { Pc(220.0f), Pc(174.6f), Pc(261.6f), Pc(196.0f) };       // Am F C G
        static readonly float[][] EventChords = { Pc(220.0f, true), Pc(207.7f, true), Pc(220.0f, true), Pc(246.9f, true) };
        static readonly float[][] WinterChords = { Pc(293.7f), Pc(220.0f), Pc(246.9f), Pc(196.0f) };     // saisonnier

        static float[] Pc(float root, bool minor = false) =>
            new[] { root, root * (minor ? 1.189f : 1.26f), root * 1.5f };  // triade majeure/mineure

        public static AudioClip Music(string mood)
        {
            float[][] prog = mood switch
            {
                "menu" => MenuChords,
                "event" => EventChords,
                "winter" => WinterChords,
                _ => GameChords
            };
            float chordDur = 2f;
            float total = chordDur * prog.Length;
            return Render("music_" + mood, total, t =>
            {
                int idx = Mathf.Min(prog.Length - 1, (int)(t / chordDur));
                float local = t - idx * chordDur;
                float v = 0f;
                // Nappes d'accords
                foreach (var f in prog[idx])
                    v += Sine(t, f) * 0.07f * Mathf.Clamp01(local * 3f) * Mathf.Clamp01((chordDur - local) * 1.5f);
                // Basse
                v += Sine(t, prog[idx][0] * 0.5f) * 0.09f;
                // Arpège doux
                float arpFreq = prog[idx][(int)(local * 4f) % 3] * 2f;
                v += Sine(t, arpFreq) * 0.05f * Env(local % 0.5f, 0.4f);
                return v;
            });
        }
    }
}
