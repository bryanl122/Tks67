namespace CPT.Data
{
    /// <summary>Identité francophone belge : noms de visiteurs, d'employés, d'entreprises et de régions.</summary>
    public static class NameDatabase
    {
        public static readonly string[] FirstNames =
        {
            "Jean", "Marie", "Luc", "Sophie", "Pierre", "Camille", "Hugo", "Émilie",
            "Thomas", "Julie", "Nicolas", "Laura", "Maxime", "Charlotte", "Antoine",
            "Manon", "Quentin", "Élise", "Baptiste", "Aurélie", "François", "Nathalie",
            "Olivier", "Isabelle", "Vincent", "Céline", "Damien", "Pauline", "Geoffrey",
            "Amandine", "Kevin", "Sarah", "Dimitri", "Justine", "Sébastien", "Florence",
            "Mehdi", "Fatima", "Youssef", "Aïcha", "Jan", "Els", "Wouter", "Lien"
        };

        public static readonly string[] LastNames =
        {
            "Dubois", "Lambert", "Martin", "Dupont", "Simon", "Leclercq", "Laurent",
            "Denis", "Lejeune", "Renard", "Gérard", "Bauwens", "Janssens", "Maes",
            "Peeters", "Willems", "Claes", "Goossens", "Wouters", "De Smet",
            "Vandenberghe", "Lemaire", "Charlier", "Delvaux", "Fontaine", "Henrard",
            "Massart", "Noël", "Pirotte", "Servais", "Toussaint", "Wathelet"
        };

        /// <summary>Entreprises partenaires fictives (contrats de rachat).</summary>
        public static readonly string[] Companies =
        {
            "CartoWal SA", "Papeteries de la Meuse", "PlastiBel Recycling",
            "Verreries de Charleroi", "BoisFlandre NV", "MétalLiège Group",
            "CompoVert SPRL", "Gravats & Co", "ElectroRecup Belgium",
            "BatteRecycle SA", "PneuCycle Wallonie", "TexTri Solidaire",
            "ChimieSûre SA", "e-Waste Brussels", "EncombExpress"
        };

        /// <summary>Régions disponibles pour l'expansion multi-sites (carte nationale).</summary>
        public static readonly string[] Regions =
        {
            "Brabant wallon", "Liège", "Hainaut", "Namur", "Luxembourg",
            "Bruxelles-Capitale", "Brabant flamand", "Anvers", "Flandre-Orientale",
            "Flandre-Occidentale", "Limbourg"
        };

        public static readonly string[] SiteNames =
        {
            "Recypark Wavre", "Recypark Liège-Angleur", "Recypark Charleroi-Couillet",
            "Recypark Namur-Bouge", "Recypark Arlon", "Recypark Anderlecht",
            "Recypark Louvain", "Recypark Anvers-Sud", "Recypark Gand-Nord",
            "Recypark Bruges", "Recypark Hasselt"
        };

        public static string RandomPersonName(out string first, out string last)
        {
            first = FirstNames[UnityEngine.Random.Range(0, FirstNames.Length)];
            last = LastNames[UnityEngine.Random.Range(0, LastNames.Length)];
            return first + " " + last;
        }
    }
}
