// Simple global store for Data
const AppStore = {
    state: {
        // Page 1
        income_gross: 0,
        income_other: 0,
        exp_rent: 0,
        exp_food: 0,
        exp_fuel: 0,
        exp_utils: 0,
        exp_medical: 0,
        exp_emi: 0,
        exp_maid: 0,
        exp_ent: 0,
        exp_shop: 0,
        exp_misc: 0,

        // Page 2 - Protection
        ins_health_prem: 0,
        ins_health_cover: 0,
        ins_life_prem: 0,
        ins_life_cover: 0,

        // Savings
        sav_emergency: 0,
        sav_sip: 0,
        sav_corpus: 0,

        // Debt list
        debts: [],

        // FIRE logic
        fire_age: 30,
        fire_target_age: 50,
        fire_income: 100000,
        fire_roi: 12,
        fire_inf: 6
    },
    
    init() {
        const saved = localStorage.getItem('moneydhan_data');
        if (saved) {
            try {
                this.state = { ...this.state, ...JSON.parse(saved) };
            } catch(e) {}
        }
    },
    
    save() {
        localStorage.setItem('moneydhan_data', JSON.stringify(this.state));
    },

    update(key, value) {
        this.state[key] = value;
        this.save();
    },

    addDebt(debt) {
        this.state.debts.push(debt);
        this.save();
    },

    removeDebt(index) {
        this.state.debts.splice(index, 1);
        this.save();
    },

    // Derived compute
    getTotalIncome() {
        return (this.state.income_gross || 0) + (this.state.income_other || 0);
    },

    getTotalExpenses() {
        return (this.state.exp_rent || 0) +
               (this.state.exp_food || 0) +
               (this.state.exp_fuel || 0) +
               (this.state.exp_utils || 0) +
               (this.state.exp_medical || 0) +
               (this.state.exp_emi || 0) +
               (this.state.exp_maid || 0) +
               (this.state.exp_ent || 0) +
               (this.state.exp_shop || 0) +
               (this.state.exp_misc || 0);
    },

    getSurplus() {
        return this.getTotalIncome() - this.getTotalExpenses();
    },

    getTotalOutstandingDebt() {
        return this.state.debts.reduce((sum, d) => sum + (Number(d.principal) || 0), 0);
    }
};

AppStore.init();
