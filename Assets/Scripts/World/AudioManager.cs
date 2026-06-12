using System.Collections.Generic;
using UnityEngine;

namespace CPT.World
{
    /// <summary>
    /// Pilotage audio : canaux musique / effets / ambiance, volumes persistés,
    /// musique contextuelle (menu, gestion, événement, hiver).
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager I { get; private set; }

        AudioSource _music, _sfx, _ambience;
        readonly Dictionary<string, AudioClip> _clips = new Dictionary<string, AudioClip>();
        string _currentMood = "";

        public static float MusicVolume
        {
            get => PlayerPrefs.GetFloat("cpt_vol_music", 0.6f);
            set { PlayerPrefs.SetFloat("cpt_vol_music", value); if (I != null) I._music.volume = value; }
        }

        public static float SfxVolume
        {
            get => PlayerPrefs.GetFloat("cpt_vol_sfx", 0.8f);
            set { PlayerPrefs.SetFloat("cpt_vol_sfx", value); if (I != null) { I._sfx.volume = value; I._ambience.volume = value * 0.5f; } }
        }

        public static AudioManager Create(Transform parent)
        {
            var go = new GameObject("AudioManager");
            go.transform.SetParent(parent);
            var am = go.AddComponent<AudioManager>();
            return am;
        }

        void Awake()
        {
            I = this;
            _music = gameObject.AddComponent<AudioSource>();
            _music.loop = true; _music.volume = MusicVolume;
            _sfx = gameObject.AddComponent<AudioSource>();
            _sfx.volume = SfxVolume;
            _ambience = gameObject.AddComponent<AudioSource>();
            _ambience.loop = true; _ambience.volume = SfxVolume * 0.5f;

            // Pré-génération des effets
            _clips["click"] = ProceduralAudio.Click();
            _clips["cash"] = ProceduralAudio.Cash();
            _clips["notification"] = ProceduralAudio.Notification();
            _clips["alarm"] = ProceduralAudio.Alarm();
            _clips["achievement"] = ProceduralAudio.Achievement();
            _clips["mission"] = ProceduralAudio.Mission();
            _clips["machine"] = ProceduralAudio.MachineHum();
            _clips["truck"] = ProceduralAudio.TruckEngine();
        }

        public static void PlaySfx(string name)
        {
            if (I == null || !I._clips.TryGetValue(name, out var clip)) return;
            I._sfx.PlayOneShot(clip);
        }

        /// <summary>Musique contextuelle : menu, game, event, winter.</summary>
        public static void PlayMusic(string mood)
        {
            if (I == null || I._currentMood == mood) return;
            I._currentMood = mood;
            I._music.clip = ProceduralAudio.Music(mood);
            I._music.Play();
        }

        public static void StartAmbience()
        {
            if (I == null || I._ambience.isPlaying) return;
            I._ambience.clip = ProceduralAudio.Ambience();
            I._ambience.Play();
        }

        public static void StopAmbience() { if (I != null) I._ambience.Stop(); }
    }
}
