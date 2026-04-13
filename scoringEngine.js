// scoringEngine.js

function computeFHS(state) {
    const grossIncome = Number(state.income_gross) || 1; 
    const totalIncome = AppStore.getTotalIncome() || 1;
    const totalExp = AppStore.getTotalExpenses();
    const surplus = AppStore.getSurplus();
    
    // 1. Savings Rate (25%)
    let savingsRate = surplus / totalIncome;
    let s_sav = 0;
    if (savingsRate < 0.1) s_sav = 4;
    else if (savingsRate <= 0.2) s_sav = 12;
    else s_sav = 22; // max ~25
    if (savingsRate >= 0.3) s_sav = 25;
    if (savingsRate < 0) s_sav = 0;

    // 2. Expense Ratio (20%)
    let expRatio = totalExp / totalIncome;
    let s_exp = 0;
    if (expRatio > 0.7) s_exp = 4;
    else if (expRatio >= 0.5) s_exp = 12;
    else s_exp = 18;
    if (expRatio < 0.4) s_exp = 20;

    // 3. Debt to Income DTI (20%)
    let emi = Number(state.exp_emi) || 0;
    let dti = emi / grossIncome;
    let s_dti = 0;
    if (dti > 0.35) s_dti = 4;
    else if (dti >= 0.2) s_dti = 12;
    else s_dti = 18;
    if (dti == 0) s_dti = 20;

    // 4. Emergency Fund (15%)
    let emFund = Number(state.sav_emergency) || 0;
    let expPerMonth = totalExp > 0 ? totalExp : 1;
    let emMonths = emFund / expPerMonth;
    let s_em = 0;
    if (emMonths < 3) s_em = 3;
    else if (emMonths < 6) s_em = 8;
    else s_em = 15;

    // 5. Insurance Cover (10%)
    let lifeCover = Number(state.ins_life_cover) || 0;
    let healthCover = Number(state.ins_health_cover) || 0;
    let annualIncome = grossIncome * 12;
    let s_ins = 0;
    let lifeRatio = lifeCover / annualIncome;
    
    if (lifeRatio >= 10 && healthCover >= 500000) s_ins = 10;
    else if (lifeRatio > 0 || healthCover > 0) s_ins = 5;
    else s_ins = 0;

    // 6. Investment Rate (10%)
    let sip = Number(state.sav_sip) || 0;
    let invRate = sip / totalIncome;
    let s_inv = 0;
    if (invRate < 0.05) s_inv = 2;
    else if (invRate < 0.15) s_inv = 6;
    else s_inv = 10;

    const totalScore = s_sav + s_exp + s_dti + s_em + s_ins + s_inv;
    
    // Band extraction
    let band = { label: "Critical 🚨", color: "#7B241C", action: "Seek professional financial advice" };
    if (totalScore >= 80) band = { label: "Financially Fit 💚", color: "#1E8449", action: "Optimise & accelerate FIRE" };
    else if (totalScore >= 65) band = { label: "Healthy 🟡", color: "#D4AC0D", action: "Fine-tune 1–2 weak areas" };
    else if (totalScore >= 50) band = { label: "Moderate 🟠", color: "#CA6F1E", action: "Address debt & savings gaps" };
    else if (totalScore >= 35) band = { label: "At Risk 🔴", color: "#C0392B", action: "Urgent debt & insurance review" };

    return {
        total: Math.round(totalScore),
        band: band,
        components: [
            { name: "Savings Rate", val: s_sav, max: 25 },
            { name: "Expense Ratio", val: s_exp, max: 20 },
            { name: "Debt Burden", val: s_dti, max: 20 },
            { name: "Emergency", val: s_em, max: 15 },
            { name: "Protection", val: s_ins, max: 10 },
            { name: "Investment", val: s_inv, max: 10 }
        ]
    };
}
