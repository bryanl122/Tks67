using System.Collections.Generic;
using CPT.Core;
using CPT.Data;
using UnityEngine;

namespace CPT.Sim
{
    /// <summary>
    /// Économie : trésorerie, journal comptable, emprunts, taxes, assurances,
    /// subventions et clôtures mensuelles.
    /// </summary>
    public class EconomyManager
    {
        public struct LedgerEntry { public int day; public string label; public long amount; }

        readonly GameState _s;
        public readonly List<LedgerEntry> Ledger = new List<LedgerEntry>(256);
        public long Money => _s.money;

        public EconomyManager(GameState s) { _s = s; }

        public void Earn(long amount, string label)
        {
            if (amount <= 0) return;
            _s.money += amount;
            _s.eco.monthIncome += amount;
            _s.eco.lifetimeIncome += amount;
            Push(label, amount);
            EventBus.RaiseStat("money_earned", amount);
            EventBus.RaiseStat("money_balance_set", _s.money);
            EventBus.RaiseMoneyChanged();
        }

        public bool Spend(long amount, string label, bool allowDebt = false)
        {
            if (amount <= 0) return true;
            if (_s.money < amount && !allowDebt) return false;
            _s.money -= amount;
            _s.eco.monthExpense += amount;
            _s.eco.lifetimeExpense += amount;
            Push(label, -amount);
            EventBus.RaiseMoneyChanged();
            return true;
        }

        void Push(string label, long amount)
        {
            Ledger.Add(new LedgerEntry { day = _s.day, label = label, amount = amount });
            if (Ledger.Count > 200) Ledger.RemoveAt(0);
        }

        // --- Emprunts ---
        public static readonly long[] LoanOffers = { 25000, 75000, 200000, 500000 };

        public bool TakeLoan(long principal)
        {
            if (_s.eco.loans.Count >= 3) return false;
            float rate = 0.05f + 0.01f * _s.eco.loans.Count;   // taux croissant
            int months = 24;
            long monthly = (long)(principal * (1f + rate * months / 12f) / months);
            _s.eco.loans.Add(new LoanData { principal = principal, annualRate = rate, monthsLeft = months, monthlyPayment = monthly });
            Earn(principal, Loc.T("eco.loan_received"));
            return true;
        }

        // --- Cycle mensuel ---
        public void OnNewMonth(GameManager gm)
        {
            // Salaires
            long salaries = 0;
            foreach (var e in _s.employees) salaries += e.salaryMonthly;
            if (salaries > 0) Spend(salaries, Loc.T("eco.salaries"), true);

            // Entretien bâtiments + machines (tous sites)
            long upkeep = 0;
            foreach (var site in _s.sites)
            {
                foreach (var b in site.buildings)
                {
                    var def = BuildingCatalog.Get(b.typeId);
                    if (def != null) upkeep += def.upkeepMonthly;
                }
                foreach (var m in site.machines)
                {
                    var def = MachineCatalog.Get(m.typeId);
                    if (def != null) upkeep += def.upkeepMonthly;
                }
            }
            float energyMult = Mathf.Max(0.3f, gm.Research.GetMult("energy"));
            upkeep = (long)(upkeep * energyMult);
            if (upkeep > 0) Spend(upkeep, Loc.T("eco.upkeep"), true);

            // Assurance
            long insurance = _s.eco.insuranceTier * 800L * _s.sites.Count;
            if (insurance > 0) Spend(insurance, Loc.T("eco.insurance"), true);

            // Emprunts
            for (int i = _s.eco.loans.Count - 1; i >= 0; i--)
            {
                var l = _s.eco.loans[i];
                Spend(l.monthlyPayment, Loc.T("eco.loan_payment"), true);
                l.monthsLeft--;
                if (l.monthsLeft <= 0) _s.eco.loans.RemoveAt(i);
            }

            // Taxes sur le bénéfice mensuel
            long profit = _s.eco.monthIncome - _s.eco.monthExpense;
            if (profit > 0)
            {
                long tax = (long)(profit * _s.eco.taxRate);
                Spend(tax, Loc.T("eco.taxes"), true);
            }

            // Subventions régionales : réputation administrative élevée + faible pollution
            if (_s.rep.government >= 65f)
            {
                long subsidy = (long)(2000 + _s.rep.government * 40) * _s.sites.Count;
                _s.eco.subsidiesReceived += subsidy;
                Earn(subsidy, Loc.T("eco.subsidy"));
                EventBus.Notify(Loc.T("eco.subsidy"), Loc.T("eco.subsidy_body", Loc.Money(subsidy)), 0);
            }

            _s.eco.lastMonthIncome = _s.eco.monthIncome;
            _s.eco.lastMonthExpense = _s.eco.monthExpense;
            _s.eco.monthIncome = 0;
            _s.eco.monthExpense = 0;

            // Faillite ?
            if (_s.money < -50000)
                EventBus.Notify(Loc.T("eco.bankruptcy_warning"), Loc.T("eco.bankruptcy_body"), 2);
        }
    }
}
