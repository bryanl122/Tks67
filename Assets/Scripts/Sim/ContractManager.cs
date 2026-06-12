using System.Collections.Generic;
using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>
    /// Contrats de rachat de matériaux : des entreprises belges proposent
    /// des prix garantis par flux. Sans contrat, vente au prix « spot » du catalogue.
    /// </summary>
    public class ContractManager
    {
        readonly GameState _s;
        public readonly List<ContractData> Offers = new List<ContractData>();
        int _nextId = 1;

        public ContractManager(GameState s) { _s = s; }

        /// <summary>Prix spot moyen €/t d'un flux (moyenne des catégories).</summary>
        public static float SpotPrice(string streamId)
        {
            float sum = 0; int n = 0;
            foreach (var w in WasteCatalog.ByStream(streamId)) { sum += w.pricePerTon; n++; }
            return n > 0 ? sum / n : 0f;
        }

        /// <summary>Prix effectif €/t d'un flux : contrat signé prioritaire, sinon spot.</summary>
        public float EffectivePrice(string streamId)
        {
            foreach (var c in _s.eco.contracts)
                if (c.signed && c.streamId == streamId && c.daysLeft > 0)
                    return c.pricePerTon;
            return SpotPrice(streamId);
        }

        public void OnNewDay()
        {
            // Expiration des contrats signés
            for (int i = _s.eco.contracts.Count - 1; i >= 0; i--)
            {
                var c = _s.eco.contracts[i];
                c.daysLeft--;
                if (c.daysLeft <= 0)
                {
                    EventBus.Notify(Loc.T("contract.expired"), c.company + " — " + Loc.T("stream." + c.streamId), 1);
                    _s.eco.contracts.RemoveAt(i);
                }
            }

            // Génération d'offres (max 4 simultanées), favorisée par la réputation entreprises
            for (int i = Offers.Count - 1; i >= 0; i--)
                if (--Offers[i].daysLeft <= 0) Offers.RemoveAt(i);

            float chance = 0.15f + _s.rep.companies / 400f;
            if (Offers.Count < 4 && Random.value < chance)
            {
                var stream = WasteCatalog.Streams[Random.Range(0, WasteCatalog.Streams.Count)];
                float spot = SpotPrice(stream.id);
                float bonus = Random.Range(1.05f, 1.10f + _s.rep.companies / 500f);
                Offers.Add(new ContractData
                {
                    id = "c" + _nextId++,
                    company = NameDatabase.Companies[Random.Range(0, NameDatabase.Companies.Length)],
                    streamId = stream.id,
                    pricePerTon = Mathf.Round(spot * bonus),
                    daysLeft = Random.Range(10, 25),   // durée de validité de l'offre
                    signed = false
                });
                EventBus.Notify(Loc.T("contract.new_offer"), Loc.T("stream." + stream.id), 0);
            }
        }

        public bool Sign(ContractData offer)
        {
            // Un seul contrat actif par flux
            foreach (var c in _s.eco.contracts)
                if (c.signed && c.streamId == offer.streamId) return false;
            offer.signed = true;
            offer.daysLeft = 60;                        // durée du contrat : 2 mois
            _s.eco.contracts.Add(offer);
            Offers.Remove(offer);
            _s.stats.contractsSigned++;
            EventBus.RaiseStat("contracts_signed", 1);
            EventBus.Notify(Loc.T("contract.signed"), offer.company, 0);
            return true;
        }
    }
}
