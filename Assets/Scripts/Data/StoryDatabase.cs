using System.Collections.Generic;

namespace CPT.Data
{
    /// <summary>
    /// Histoire, lore et événements narratifs (emails reçus dans le bureau).
    /// Source française officielle ; les titres passent par la localisation,
    /// les corps de texte utilisent la table « mail.<id>.body ».
    /// </summary>
    public class StoryMail
    {
        public string id;
        public string senderFr;     // expéditeur (nom propre, non traduit)
        public int triggerDay;      // jour d'envoi (-1 = déclenché par mission)
        public string triggerMission;
        public StoryMail(string id, string sender, int day, string mission = "")
        { this.id = id; senderFr = sender; triggerDay = day; triggerMission = mission; }
    }

    public static class StoryDatabase
    {
        // --- LORE ---
        // 2031. La Belgique vise « Zéro enfouissement » pour 2040. L'intercommunale
        // historique WalRecy s'effondre après un scandale de pollution. Le joueur,
        // ancien chef de quai, rachète aux enchères un petit parc à conteneurs à Wavre
        // avec l'aide de sa tante Monique, ex-inspectrice régionale. Face à lui :
        // TriTop Group, multinationale qui rachète tous les parcs du pays.
        // Personnages récurrents :
        //  - Monique Lejeune : mentor, ton affectueux et direct.
        //  - Inspecteur Karel Mertens : Région wallonne, pointilleux mais juste.
        //  - Vince Delcourt : commercial TriTop, faux-ami arrogant.
        //  - Awa Diallo : journaliste à « La Gazette du Brabant », alliée si le parc est propre.

        public static readonly List<StoryMail> Mails = new List<StoryMail>
        {
            new StoryMail("bienvenue",        "Monique Lejeune", 1),
            new StoryMail("conseil_monique",  "Monique Lejeune", 3),
            new StoryMail("premier_controle", "Karel Mertens",   8),
            new StoryMail("offre_tritop",     "Vince Delcourt", 15),
            new StoryMail("article_gazette",  "Awa Diallo",     25),
            new StoryMail("subside_region",   "Région wallonne",40),
            new StoryMail("tritop_menace",    "Vince Delcourt", -1, "m13_dix_flux"),
            new StoryMail("monique_fierte",   "Monique Lejeune", -1, "m20_deuxieme_site"),
            new StoryMail("mertens_respect",  "Karel Mertens",  -1, "m21_reputation_80"),
            new StoryMail("tritop_defaite",   "Awa Diallo",     -1, "m24_empire_national"),
        };

        /// <summary>Dialogues d'ambiance des visiteurs (bulles au-dessus des PNJ), clés loc « npc.<n> ».</summary>
        public const int NpcLineCount = 12;
    }
}
