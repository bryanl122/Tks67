using System;

namespace CPT.Meta
{
    /// <summary>
    /// Abstraction des paiements réels. En production : SteamPaymentProvider
    /// (microtransactions Steamworks ISteamMicroTxn). En développement : mock instantané.
    /// </summary>
    public interface IPaymentProvider
    {
        /// <param name="productId">Identifiant produit (pack de gemmes, BP premium, VIP).</param>
        /// <param name="priceEur">Prix affiché en euros.</param>
        /// <param name="onResult">true si le paiement a abouti.</param>
        void Purchase(string productId, float priceEur, Action<bool> onResult);
        bool IsAvailable { get; }
        string ProviderName { get; }
    }

    /// <summary>Fournisseur de développement : accepte tout achat immédiatement.</summary>
    public class MockPaymentProvider : IPaymentProvider
    {
        public bool IsAvailable => true;
        public string ProviderName => "Mock (développement)";
        public void Purchase(string productId, float priceEur, Action<bool> onResult)
        {
            UnityEngine.Debug.Log($"[Paiement-Mock] {productId} — {priceEur:0.00} € → accepté");
            onResult?.Invoke(true);
        }
    }

    /// <summary>
    /// Intégration Steam (à activer avec Steamworks.NET avant la publication) :
    ///  1. InitTxn via l'API Web ISteamMicroTxn avec l'AppId du jeu,
    ///  2. callback MicroTxnAuthorizationResponse_t,
    ///  3. FinalizeTxn côté serveur partenaire.
    /// Les identifiants produits de MonetizationCatalog correspondent aux itemid Steam.
    /// </summary>
    public class SteamPaymentProvider : IPaymentProvider
    {
        public bool IsAvailable => false;   // bascule à true une fois Steamworks initialisé
        public string ProviderName => "Steam";
        public void Purchase(string productId, float priceEur, Action<bool> onResult)
        {
            UnityEngine.Debug.LogWarning("[Paiement-Steam] Steamworks non initialisé — achat refusé.");
            onResult?.Invoke(false);
        }
    }
}
