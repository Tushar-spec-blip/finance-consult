// swotEngine.js

function generateSWOT(state) {
    let s = [];
    let w = [];
    let o = [];
    let t = [];

    const grossIncome = Number(state.income_gross) || 1;
    const surplus = AppStore.getSurplus();
    const savingsRate = surplus / AppStore.getTotalIncome();
    const emFund = Number(state.sav_emergency) || 0;
    const expPerMonth = AppStore.getTotalExpenses() || 1;
    const emMonths = emFund / expPerMonth;
    const lifeCover = Number(state.ins_life_cover) || 0;
    const healthCover = Number(state.ins_health_cover) || 0;
    const emi = Number(state.exp_emi) || 0;
    const dti = emi / grossIncome;
    const age = Number(state.fire_age) || 30;

    // Strengths
    if (savingsRate >= 0.20) {
        s.push(`Your savings rate of ${(savingsRate*100).toFixed(1)}% is above the 20% benchmark — exceptional wealth-building discipline.`);
    }
    if (emMonths >= 6) {
        s.push(`You have ${emMonths.toFixed(1)} months of emergency buffer — strong resilience against income disruption.`);
    }
    if (lifeCover >= (grossIncome * 12 * 10)) {
        s.push(`Adequate life insurance ensures your family is protected — well-structured protection layer.`);
    }
    if (state.debts.length === 0 && emi === 0) {
        s.push(`You are completely debt-free — excellent financial position giving you maximum cash flow flexibility.`);
    }

    // Weaknesses
    if (dti > 0.40) {
        w.push(`Your EMI burden is ${(dti*100).toFixed(1)}% of income, significantly above the safe 35% threshold.`);
    }
    if (savingsRate < 0.10) {
        w.push(`Saving only ${(savingsRate*100).toFixed(1)}% monthly — below critical minimum; wealth accumulation is at risk.`);
    }
    if (healthCover === 0) {
        w.push(`No health coverage detected — a single hospitalisation could derail your finances.`);
    }
    if (emMonths < 3) {
        w.push(`Emergency fund covers only ${emMonths.toFixed(1)} months — vulnerable to sudden income shocks.`);
    }

    // Opportunities
    if (surplus > 10000 && (Number(state.sav_sip) || 0) < surplus * 0.5) {
        o.push(`A surplus of ₹${surplus.toLocaleString('en-IN')}/month is available — increasing your SIP could drastically advance your FIRE date.`);
    }
    if (age <= 30) {
        o.push(`At age ${age} you have decades to retirement — compounding works most powerfully in your favour if invested aggressively.`);
    }
    let highIntDebt = state.debts.filter(d => Number(d.rate) > 12);
    if (highIntDebt.length > 0) {
        o.push(`You have high-interest debt (>12%). Pre-paying this guarantees a risk-free return on your money equivalent to the interest rate.`);
    }

    // Threats
    if (Number(state.fire_inf) > 7) {
        t.push(`With ${state.fire_inf}% inflation assumption, the real future value of your income erodes rapidly — underfunding risk is high.`);
    }
    if ((Number(state.income_other) || 0) === 0) {
        t.push(`Dependence on a single income stream increases financial vulnerability to job losses.`);
    }
    if (dti > 0.35) {
        t.push(`Your elevated DTI leaves a minimal buffer if income drops or unexpected medical expenses occur.`);
    }
    if (lifeCover === 0) {
        t.push(`No life insurance cover — your dependents face severe financial risk in case of untimely death.`);
    }

    // Fallbacks if empty
    if (s.length === 0) s.push("No major strengths identified based on current benchmarks.");
    if (w.length === 0) w.push("No critical weaknesses detected in your core financial pillars!");
    if (o.length === 0) o.push("Continue optimizing your current path.");
    if (t.length === 0) t.push("Your risk management looks solid. Stay disciplined.");

    return { s, w, o, t };
}
