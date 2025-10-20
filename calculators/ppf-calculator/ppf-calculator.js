// --- IMPORT SHARED UTILITIES ---
// By importing, we remove duplicated code and make this file cleaner and easier to read.
import { formatCurrency, debounce, updateSliderFill, syncSliderAndInput } from '../../assets/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const calculatorContainer = document.querySelector('.calculator-container');
    if (calculatorContainer && document.getElementById('annualInvestmentSlider')) {
        initializePpfCalculator();
    }
});

function initializePpfCalculator() {
    'use strict';
    const getElem = (id) => document.getElementById(id);

    // --- Element Variables ---
    // (Slider and input elements are now handled by syncSliderAndInput)
    const annualInvestmentInput = getElem('annualInvestmentInput');
    const interestRateInput = getElem('interestRateInput');
    const extensionBlocksInput = getElem('extensionBlocksInput');
    const decreaseExtensionBtn = getElem('decreaseExtension');
    const increaseExtensionBtn = getElem('increaseExtension');
    const extensionContributionDiv = getElem('extensionContributionDiv');
    const contributionToggle = getElem('contributionToggle');
    const lwYearSlider = getElem('lwYearSlider');
    const lwYearDisplay = getElem('lwYearDisplay');
    const eligibleLoanAmountElem = getElem('eligibleLoanAmount');
    const maxWithdrawalAmountElem = getElem('maxWithdrawalAmount');
    const totalInvestmentElem = getElem('totalInvestment');
    const totalInterestElem = getElem('totalInterest');
    const maturityValueElem = getElem('maturityValue');
    const doughnutCanvas = getElem('ppfDoughnutChart');
    const toggleGrowthBtn = getElem('toggleYearlyGrowthBtn');
    const growthContainer = getElem('yearlyGrowthContainer');
    const shareReportBtn = getElem('shareReportBtn');

    let ppfDoughnutChart;
    let extensionBlocks = 0;
    const MAX_EXTENSIONS = 4;
    let yearlyDataCache = [];

    // --- Main Calculation Logic ---
    function updateCalculator() {
        const annualInvestment = parseFloat(annualInvestmentInput.value) || 0;
        const interestRate = parseFloat(interestRateInput.value) / 100 || 0;
        const continueContributions = contributionToggle.checked;

        if (annualInvestment === 0 || interestRate === 0) return;

        let balance = 0;
        let totalInvested = 0;
        let yearlyData = [];
        const initialTerm = 15;
        const totalTerm = initialTerm + (extensionBlocks * 5);
        
        lwYearSlider.max = totalTerm;
        updateSliderFill(lwYearSlider);

        for (let year = 1; year <= totalTerm; year++) {
            let yearlyInvestment = (year <= initialTerm || (year > initialTerm && continueContributions)) ? annualInvestment : 0;
            totalInvested += yearlyInvestment;
            const interestEarned = (balance + yearlyInvestment) * interestRate;
            balance += yearlyInvestment + interestEarned;
            
            yearlyData.push({
                year: year,
                openingBalance: year === 1 ? 0 : yearlyData[year - 2].closingBalance,
                invested: yearlyInvestment,
                interest: interestEarned,
                closingBalance: balance
            });
        }
        
        const totalInterest = balance - totalInvested;
        yearlyDataCache = yearlyData;

        totalInvestmentElem.textContent = formatCurrency(totalInvested);
        totalInterestElem.textContent = formatCurrency(totalInterest);
        maturityValueElem.textContent = formatCurrency(balance);

        updateDoughnutChart([totalInvested, totalInterest], ['Total Investment', 'Total Interest'], ['#3B82F6', '#22C55E']);
        generateYearlyGrowthTable(yearlyData);
        updateLoanAndWithdrawal();
    }

    // --- Loan and Withdrawal Logic ---
    function updateLoanAndWithdrawal() {
        const selectedYear = parseInt(lwYearSlider.value);
        lwYearDisplay.textContent = selectedYear;
        updateSliderFill(lwYearSlider);

        let eligibleLoan = 0;
        let maxWithdrawal = 0;

        // Loan Eligibility: From 3rd to 6th financial year
        if (selectedYear >= 3 && selectedYear <= 6) {
            const balanceYear = selectedYear - 2;
            if (yearlyDataCache[balanceYear - 1]) {
                eligibleLoan = yearlyDataCache[balanceYear - 1].closingBalance * 0.25;
            }
        }

        // Withdrawal Eligibility: From 7th financial year onwards
        if (selectedYear >= 7) {
            const balanceAtYear4 = yearlyDataCache[selectedYear - 4 - 1]?.closingBalance || 0;
            const balanceAtPrevYear = yearlyDataCache[selectedYear - 1 - 1]?.closingBalance || 0;
            maxWithdrawal = Math.min(balanceAtYear4 * 0.5, balanceAtPrevYear * 0.5);
        }

        eligibleLoanAmountElem.textContent = formatCurrency(eligibleLoan);
        maxWithdrawalAmountElem.textContent = formatCurrency(maxWithdrawal);
    }

    // --- UI Update Functions ---
    function generateYearlyGrowthTable(data) {
        let tableHTML = `
            <h3 class="text-center text-sm font-bold text-gray-800 mb-2">Yearly Growth Details</h3>
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-2 py-1 text-left text-xxs font-medium text-gray-500 uppercase">Year</th>
                        <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase">Investment</th>
                        <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase">Interest Earned</th>
                        <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase">Closing Balance</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 text-xs">`;

        data.forEach(row => {
            tableHTML += `<tr>
                <td class="px-2 py-1">${row.year}</td>
                <td class="px-2 py-1 text-right">${formatCurrency(row.invested)}</td>
                <td class="px-2 py-1 text-right text-green-600 font-semibold">${formatCurrency(row.interest)}</td>
                <td class="px-2 py-1 text-right font-bold">${formatCurrency(row.closingBalance)}</td>
            </tr>`;
        });

        tableHTML += `</tbody></table>`;
        growthContainer.innerHTML = tableHTML;
    }

    function updateDoughnutChart(data, labels, colors) {
        const doughnutCtx = doughnutCanvas.getContext('2d');
        const chartData = { labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 4, borderRadius: 3, spacing: 1 }] };
        const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: '50%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` } } } };
        if (ppfDoughnutChart) { ppfDoughnutChart.data = chartData; ppfDoughnutChart.update(); } 
        else { ppfDoughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: chartData, options: chartOptions }); }
    }
    
    function updateExtensionUI() {
        extensionBlocksInput.value = `${extensionBlocks} blocks (${extensionBlocks * 5} yrs)`;
        extensionContributionDiv.classList.toggle('hidden', extensionBlocks === 0);
        decreaseExtensionBtn.disabled = extensionBlocks === 0;
        increaseExtensionBtn.disabled = extensionBlocks >= MAX_EXTENSIONS;
        updateCalculator();
    }
    
    function loadSeoContent() {
        const contentArea = getElem('dynamic-content-area-ppf');
        if (contentArea) {
            fetch('ppf-calculator-seo-content.html')
                .then(response => response.ok ? response.text() : Promise.reject('File not found'))
                .then(html => contentArea.innerHTML = html)
                .catch(error => console.error('Error loading PPF SEO content:', error));
        }
    }
    
    // --- Event Handlers & Initializers ---
    
    function handleShare() {
        const params = new URLSearchParams();
        params.set('investment', annualInvestmentInput.value);
        params.set('rate', interestRateInput.value);
        params.set('extensions', extensionBlocks);
        params.set('contributions', contributionToggle.checked);

        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My PPF Investment Plan',
                text: `Check out my projected PPF maturity of ${maturityValueElem.textContent}!`,
                url: shareUrl,
            }).catch(err => {
                console.error("Share failed:", err.message);
                // Assuming showNotification is globally available from another script
                if(typeof showNotification === 'function') showNotification('Could not share report.');
            });
        } else {
             const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                if(typeof showNotification === 'function') showNotification('Link copied to clipboard!');
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                if(typeof showNotification === 'function') showNotification('Could not copy link.');
            }
            document.body.removeChild(textArea);
        }
    }

    function loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('investment')) {
            getElem('annualInvestmentInput').value = params.get('investment');
            getElem('interestRateInput').value = params.get('rate');
            extensionBlocks = parseInt(params.get('extensions')) || 0;
            getElem('contributionToggle').checked = params.get('contributions') === 'true';

            // Sync sliders
            getElem('annualInvestmentSlider').value = getElem('annualInvestmentInput').value;
            getElem('interestRateSlider').value = getElem('interestRateInput').value;
            updateExtensionUI(); // This will also trigger updateCalculator
        }
    }

    function setupEventListeners() {
        // USE THE NEW SYNC FUNCTION
        syncSliderAndInput({ sliderId: 'annualInvestmentSlider', inputId: 'annualInvestmentInput', updateCallback: updateCalculator });
        syncSliderAndInput({ sliderId: 'interestRateSlider', inputId: 'interestRateInput', updateCallback: updateCalculator });
        
        increaseExtensionBtn.addEventListener('click', () => {
            if (extensionBlocks < MAX_EXTENSIONS) {
                extensionBlocks++;
                updateExtensionUI();
            }
        });
        
        decreaseExtensionBtn.addEventListener('click', () => {
            if (extensionBlocks > 0) {
                extensionBlocks--;
                updateExtensionUI();
            }
        });
        
        contributionToggle.addEventListener('change', updateCalculator);
        toggleGrowthBtn.addEventListener('click', () => {
            growthContainer.classList.toggle('hidden');
            toggleGrowthBtn.textContent = growthContainer.classList.contains('hidden') ? 'Show Yearly Growth' : 'Hide Yearly Growth';
        });

        if(shareReportBtn) shareReportBtn.addEventListener('click', handleShare);
        
        const debouncedLoanUpdate = debounce(updateLoanAndWithdrawal, 250);
        lwYearSlider.addEventListener('input', () => {
            lwYearDisplay.textContent = lwYearSlider.value;
            updateSliderFill(lwYearSlider);
            debouncedLoanUpdate();
        });
    }
    
    loadFromUrl();
    setupEventListeners();
    updateCalculator();
    loadSeoContent();
}
