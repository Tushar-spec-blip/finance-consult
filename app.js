// app.js

const DOM = {
    p1: document.getElementById('page-1'),
    p2: document.getElementById('page-2'),
    p3: document.getElementById('page-3'),
    btnNext1: document.getElementById('btn-next-1'),
    btnBack2: document.getElementById('btn-back-2'),
    btnSubmit: document.getElementById('btn-submit'),
    btnEdit: document.getElementById('btn-edit'),
    progBar: document.getElementById('progress-bar'),
    progInd: document.getElementById('step-indicator'),
    progTitle: document.getElementById('step-title'),
    
    liveExpTotal: document.getElementById('live-expense-total'),
    liveSurplus: document.getElementById('live-surplus-display'),
    defWarning: document.getElementById('deficit-warning'),

    debtList: document.getElementById('debt-list'),
    btnAddDebt: document.getElementById('btn-add-debt'),
};

let charts = {};

// Sync Store to Form on Load
function syncStoreToForms() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        if (input.id && AppStore.state[input.id] !== undefined) {
            let val = AppStore.state[input.id];
            input.value = val === 0 ? '' : val;
        }
    });
    renderDebts();
    updateLiveSurplus();
}

// Bind Inputs to Store
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', (e) => {
        if (e.target.id && !e.target.id.startsWith('debt_')) {
            AppStore.update(e.target.id, Number(e.target.value));
            if (e.target.id.startsWith('exp_') || e.target.id.startsWith('income_')) {
                updateLiveSurplus();
            }
        }
    });
});

function updateLiveSurplus() {
    const inc = AppStore.getTotalIncome();
    const exp = AppStore.getTotalExpenses();
    const surp = inc - exp;
    
    DOM.liveExpTotal.innerText = `₹${exp.toLocaleString('en-IN')}`;
    DOM.liveSurplus.innerText = `₹${surp.toLocaleString('en-IN')}`;
    
    if (surp < 0) {
        DOM.liveSurplus.classList.remove('text-slate-800');
        DOM.liveSurplus.classList.add('text-red-600');
        DOM.defWarning.classList.remove('hidden');
    } else {
        DOM.liveSurplus.classList.add('text-slate-800');
        DOM.liveSurplus.classList.remove('text-red-600');
        DOM.defWarning.classList.add('hidden');
    }
}

// Navigation
DOM.btnNext1.addEventListener('click', () => {
    // Basic validation
    if (!document.getElementById('form-page-1').checkValidity()) {
        document.getElementById('form-page-1').reportValidity();
        return;
    }
    DOM.p1.classList.add('hidden');
    DOM.p2.classList.remove('hidden');
    DOM.progBar.style.width = "66%";
    DOM.progInd.innerText = "2 / 3";
    DOM.progTitle.innerText = "Step 2 — Protection & Future";
    window.scrollTo(0,0);
});

DOM.btnBack2.addEventListener('click', () => {
    DOM.p2.classList.add('hidden');
    DOM.p1.classList.remove('hidden');
    DOM.progBar.style.width = "33%";
    DOM.progInd.innerText = "1 / 3";
    DOM.progTitle.innerText = "Step 1 — Income & Expenses";
    window.scrollTo(0,0);
});

DOM.btnSubmit.addEventListener('click', () => {
    if (!document.getElementById('form-page-2').checkValidity()) {
        document.getElementById('form-page-2').reportValidity();
        return;
    }
    DOM.p2.classList.add('hidden');
    DOM.p3.classList.remove('hidden');
    DOM.progBar.parentElement.parentElement.classList.add('hidden');
    window.scrollTo(0,0);
    renderDashboard();
});

DOM.btnEdit.addEventListener('click', () => {
    DOM.p3.classList.add('hidden');
    DOM.p1.classList.remove('hidden');
    DOM.progBar.parentElement.parentElement.classList.remove('hidden');
    DOM.progBar.style.width = "33%";
    DOM.progInd.innerText = "1 / 3";
    DOM.progTitle.innerText = "Step 1 — Income & Expenses";
    window.scrollTo(0,0);
});

// Debts module
function renderDebts() {
    DOM.debtList.innerHTML = '';
    AppStore.state.debts.forEach((d, i) => {
        const div = document.createElement('div');
        div.className = 'grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white p-3 rounded-lg border border-slate-200';
        div.innerHTML = `
            <div>
                <label class="text-xs font-semibold text-slate-500 mb-1 block">Principal (₹)</label>
                <input type="number" class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" value="${d.principal === 0 ? '' : d.principal}" placeholder="0" onchange="updateDebt(${i}, 'principal', this.value)">
            </div>
            <div>
                <label class="text-xs font-semibold text-slate-500 mb-1 block">Rate (%)</label>
                <input type="number" class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" value="${d.rate}" onchange="updateDebt(${i}, 'rate', this.value)">
            </div>
            <div>
                <label class="text-xs font-semibold text-slate-500 mb-1 block">Tenure (mo)</label>
                <input type="number" class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" value="${d.tenure}" onchange="updateDebt(${i}, 'tenure', this.value)">
            </div>
            <div class="flex pb-0.5">
                <button type="button" class="text-red-500 hover:text-red-700 p-1.5" onclick="removeDebt(${i})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        DOM.debtList.appendChild(div);
    });
}

window.updateDebt = (index, field, value) => {
    AppStore.state.debts[index][field] = Number(value);
    AppStore.save();
}
window.removeDebt = (index) => {
    AppStore.removeDebt(index);
    renderDebts();
}
DOM.btnAddDebt.addEventListener('click', () => {
    if (AppStore.state.debts.length >= 5) {
        alert("Maximum 5 debts allowed.");
        return;
    }
    AppStore.addDebt({ principal: 0, rate: 10, tenure: 12 });
    renderDebts();
});

// Dashboard Rendering logic
function renderDashboard() {
    // 1. Scoring
    const fhs = computeFHS(AppStore.state);
    document.getElementById('final-score-val').innerText = fhs.total;
    const badge = document.getElementById('score-badge');
    badge.innerText = fhs.band.label;
    badge.style.color = fhs.band.color;
    badge.style.borderColor = fhs.band.color;
    badge.style.backgroundColor = fhs.band.color + "1A"; // 10% opacity tailwind-like
    document.getElementById('score-band-accent').style.backgroundColor = fhs.band.color;

    // Charts Config Common
    Chart.defaults.font.family = 'Inter, sans-serif';

    // Gauge Chart (Doughnut)
    if(charts.gauge) charts.gauge.destroy();
    charts.gauge = new Chart(document.getElementById('gaugeChart'), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [fhs.total, Math.max(100 - fhs.total, 0)],
                backgroundColor: [fhs.band.color, '#f1f5f9'],
                borderWidth: 0,
                circumference: 180,
                rotation: 270,
                cutout: '80%',
                borderRadius: [10, 0]
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, events: [] }
    });

    // Radar Chart
    if(charts.radar) charts.radar.destroy();
    charts.radar = new Chart(document.getElementById('radarChart'), {
        type: 'radar',
        data: {
            labels: fhs.components.map(c => c.name),
            datasets: [
                {
                    label: 'Ideal Benchmark',
                    data: fhs.components.map(c => c.max),
                    borderColor: '#cbd5e1',
                    borderDash: [5, 5],
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderWidth: 2,
                    pointRadius: 0
                },
                {
                    label: 'Your Score',
                    data: fhs.components.map(c => c.val),
                    backgroundColor: 'rgba(56, 189, 248, 0.4)',
                    borderColor: '#0284c7',
                    pointBackgroundColor: '#0284c7',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { beginAtZero: true, suggestedMax: 25, ticks: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });

    // Donut Expenses
    if(charts.donut) charts.donut.destroy();
    const expData = [
        AppStore.state.exp_rent||0, AppStore.state.exp_food||0, AppStore.state.exp_fuel||0, 
        AppStore.state.exp_utils||0, AppStore.state.exp_medical||0, AppStore.state.exp_emi||0,
        AppStore.state.exp_maid||0, AppStore.state.exp_ent||0, AppStore.state.exp_shop||0, AppStore.state.exp_misc||0
    ];
    const expLabels = ['Rent','Food','Fuel','Utils','Med','EMI','Maid','Ent','Shop','Misc'];
    const filteredData = expData.map((d, i) => ({d, l: expLabels[i]})).filter(v => v.d > 0);
    charts.donut = new Chart(document.getElementById('donutChart'), {
        type: 'doughnut',
        data: {
            labels: filteredData.map(v => v.l),
            datasets: [{
                data: filteredData.map(v => v.d),
                backgroundColor: ['#ef4444','#f97316','#f59e0b','#84cc16','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#d946ef','#f43f5e']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }
    });

    // Waterfall (Bar)
    if(charts.waterfall) charts.waterfall.destroy();
    let netSurplus = AppStore.getSurplus();
    charts.waterfall = new Chart(document.getElementById('waterfallChart'), {
        type: 'bar',
        data: {
            labels: ['Total Income', 'Fixed Expenses', 'EMIs', 'Monthly SIP', 'Net Surplus'],
            datasets: [{
                data: [
                    AppStore.getTotalIncome(), 
                    (AppStore.getTotalExpenses() - (AppStore.state.exp_emi||0)), 
                    AppStore.state.exp_emi||0, 
                    AppStore.state.sav_sip||0, 
                    netSurplus
                ],
                backgroundColor: ['#22c55e', '#ef4444', '#f43f5e', '#3b82f6', netSurplus >= 0 ? '#10b981' : '#dc2626'],
                borderRadius: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins:{legend:{display:false}} }
    });

    // SWOT
    const swot = generateSWOT(AppStore.state);
    
    document.getElementById('swot-s').innerHTML = swot.s.map(i => `<li>${i}</li>`).join('');
    document.getElementById('swot-w').innerHTML = swot.w.map(i => `<li>${i}</li>`).join('');
    document.getElementById('swot-o').innerHTML = swot.o.map(i => `<li>${i}</li>`).join('');
    document.getElementById('swot-t').innerHTML = swot.t.map(i => `<li>${i}</li>`).join('');

    // FIRE UI
    document.getElementById('fire-tv-need').innerText = Number(AppStore.state.fire_income).toLocaleString('en-IN');
    document.getElementById('fire-tv-age').innerText = AppStore.state.fire_target_age;
    document.getElementById('fire-tv-inf').innerText = AppStore.state.fire_inf;
    
    // Set slider max to 5x income
    document.getElementById('sip-simulator-slider').max = Math.max(AppStore.getTotalIncome() * 2, 500000);
    document.getElementById('sip-simulator-slider').value = AppStore.state.sav_sip || 0;
    
    updateFireModelling();
}

document.getElementById('sip-simulator-slider').addEventListener('input', (e) => {
    updateFireModelling(Number(e.target.value));
});

function updateFireModelling(sipOverride = null) {
    if (sipOverride === null) sipOverride = Number(AppStore.state.sav_sip) || 0;
    
    document.getElementById('slider-sip-val').innerText = sipOverride.toLocaleString('en-IN');
    document.getElementById('fire-display-sip').innerText = sipOverride.toLocaleString('en-IN');

    const fire = computeFIRE(AppStore.state, sipOverride);
    
    document.getElementById('card-fire-req').innerText = `₹${(fire.fireCorpus / 10000000).toFixed(2)} Cr`;
    document.getElementById('card-fire-monthly').innerText = `(Yielding ₹${Math.round(fire.fireCorpus * 0.04 / 12).toLocaleString('en-IN')}/mo safely)`;
    
    document.getElementById('card-fire-proj').innerText = `₹${(fire.projectedCorpus / 10000000).toFixed(2)} Cr`;
    
    let gapWrapper = document.getElementById('card-fire-gap-wrapper');
    let gapTxt = document.getElementById('card-fire-gap');
    if (fire.gap <= 0) {
        gapWrapper.classList.add('border-green-500/30');
        gapTxt.classList.remove('text-red-400');
        gapTxt.classList.add('text-green-400');
        gapTxt.innerText = "GOAL REACHED!";
        document.getElementById('card-fire-action').innerText = "Surplus: ₹" + (Math.abs(fire.gap) / 10000000).toFixed(2) + " Cr";
    } else {
        gapWrapper.classList.remove('border-green-500/30');
        gapTxt.classList.add('text-red-400');
        gapTxt.classList.remove('text-green-400');
        gapTxt.innerText = `₹${(fire.gap / 10000000).toFixed(2)} Cr GAP`;
        document.getElementById('card-fire-action').innerText = `Need extra ₹${Math.round(fire.additionalSip).toLocaleString('en-IN')}/mo`;
    }

    document.getElementById('fire-earliest-age').innerText = fire.earliestFireAge !== null ? fire.earliestFireAge : "100+";

    // FIRE Chart update
    if(charts.fire) charts.fire.destroy();
    charts.fire = new Chart(document.getElementById('fireChart'), {
        type: 'line',
        data: {
            labels: fire.trajectory.map(t => "Age " + t.age),
            datasets: [
                {
                    label: 'Projected Corpus',
                    data: fire.trajectory.map(t => t.projectedCorpus),
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'FIRE Target Need',
                    data: fire.trajectory.map(t => t.fireTarget),
                    borderColor: '#f59e0b',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => `₹${(v/10000000).toFixed(1)}Cr` } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#cbd5e1' } } }
        }
    });

}

// Init
syncStoreToForms();
