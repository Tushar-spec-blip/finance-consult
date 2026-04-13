// fireCalculator.js

function computeFIRE(state, sliderSipOverride = null) {
    const age = Number(state.fire_age) || 30;
    const targetAge = Number(state.fire_target_age) || 50;
    const desiredIncome = Number(state.fire_income) || 100000;
    const roiAnn = Number(state.fire_roi) || 12;
    const infAnn = Number(state.fire_inf) || 6;
    
    let currentCorpus = Number(state.sav_corpus) || 0;
    let monthlySip = sliderSipOverride !== null ? sliderSipOverride : (Number(state.sav_sip) || 0);

    let yearsToRetire = targetAge - age;
    if (yearsToRetire <= 0) yearsToRetire = 1; // prevent negative/zero div

    let nMonths = yearsToRetire * 12;
    let rMonthly = (roiAnn / 100) / 12;

    // 1. Inflation Adjusted Monthly Need
    let inflRate = infAnn / 100;
    let futureMonthlyNeed = desiredIncome * Math.pow(1 + inflRate, yearsToRetire);

    // 2. Required Ret Corpus (25x Rule) -> SWR 4% = 25x Annual
    let fireCorpus = (futureMonthlyNeed * 12) / 0.04;

    // 3. Projected FV
    let fv = currentCorpus * Math.pow(1 + rMonthly, nMonths) + 
             monthlySip * ((Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly) * (1 + rMonthly); 
             // using begin-of-month sip is safer, but let's stick to standard end-of-month or begin.

    // 4. Gap
    let gap = fireCorpus - fv;

    // 5. Additional SIP required
    let additionalSip = 0;
    if (gap > 0) {
        let pmtFactor = ((Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly) * (1 + rMonthly);
        additionalSip = gap / pmtFactor;
    }

    // Projections Array for Charts
    let trajectory = [];
    let earliestFireAge = null;

    let projC = currentCorpus;
    for (let i = 0; i <= Math.max(yearsToRetire + 10, 30); i++) { // Project up to +10 yrs past target
        let currentYearAge = age + i;
        
        let inflAdjNeedCurrentYr = desiredIncome * Math.pow(1 + inflRate, i);
        let fireTargetCurrentYr = (inflAdjNeedCurrentYr * 12) / 0.04;

        if (i > 0) {
            // Compound 1 year
            // simplified annual compounding for quick charting based on monthly investments
            let ms = nMonths; // not used, we compound exactly 12m
            let fvYear = projC * Math.pow(1 + rMonthly, 12) + 
                         monthlySip * ((Math.pow(1 + rMonthly, 12) - 1) / rMonthly) * (1 + rMonthly);
            projC = fvYear;
        }

        trajectory.push({
            age: currentYearAge,
            projectedCorpus: Math.round(projC),
            fireTarget: Math.round(fireTargetCurrentYr)
        });

        if (earliestFireAge === null && projC >= fireTargetCurrentYr) {
            earliestFireAge = currentYearAge;
        }
    }

    return {
        futureMonthlyNeed,
        fireCorpus,
        projectedCorpus: fv,
        gap,
        additionalSip,
        trajectory,
        earliestFireAge
    };
}
