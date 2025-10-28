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
        // --- Validation ---
        // Basic check before complex calculations
        const annualInvestmentValue = parseFloat(annualInvestmentInput.value);
        const interestRateValue = parseFloat(interestRateInput.value);
        let isValid = true;

        // Validate Annual Investment
        if (isNaN(annualInvestmentValue) || annualInvestmentValue < 500 || annualInvestmentValue > 150000) {
            getElem('annualInvestmentError')?.classList.remove('hidden');
            isValid = false;
        } else {
            getElem('annualInvestmentError')?.classList.add('hidden');
        }

        // Validate Interest Rate
        if (isNaN(interestRateValue) || interestRateValue < 5 || interestRateValue > 10) {
            getElem('interestRateError')?.classList.remove('hidden');
             isValid = false;
        } else {
             getElem('interestRateError')?.classList.add('hidden');
        }

        if (!isValid) {
            // Optionally clear results or show an error state in the results area
            totalInvestmentElem.textContent = '-';
            totalInterestElem.textContent = '-';
            maturityValueElem.textContent = '-';
            updateDoughnutChart([1], ['Invalid Input'], ['#E5E7EB']); // Show gray chart
             eligibleLoanAmountElem.textContent = '-';
             maxWithdrawalAmountElem.textContent = '-';
            return;
        }
        // --- End Validation ---

        const annualInvestment = annualInvestmentValue || 0;
        const interestRate = interestRateValue / 100 || 0;
        const continueContributions = contributionToggle.checked;

        // Rest of the calculation logic...
        let balance = 0;
        let totalInvested = 0;
        let yearlyData = [];
        const initialTerm = 15;
        const totalTerm = initialTerm + (extensionBlocks * 5);

        lwYearSlider.max = totalTerm;
        if (parseInt(lwYearSlider.value) > totalTerm) {
            lwYearSlider.value = totalTerm; // Adjust slider if max changes
        }
        updateSliderFill(lwYearSlider);

        for (let year = 1; year <= totalTerm; year++) {
            let yearlyInvestment = (year <= initialTerm || (year > initialTerm && continueContributions)) ? annualInvestment : 0;
            // Ensure investment does not exceed 1.5L limit if continuing contributions
            if (year > initialTerm && continueContributions) {
                yearlyInvestment = Math.min(yearlyInvestment, 150000);
            }
            totalInvested += yearlyInvestment;
            // PPF interest is calculated monthly on the minimum balance between 5th and end of month,
            // but compounded annually. For simplicity and general projection, annual compounding is used here.
            // A more precise calculator would simulate monthly balances.
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
        updateLoanAndWithdrawal(); // Recalculate loan/withdrawal based on new data
    }

    // --- Loan and Withdrawal Logic ---
    function updateLoanAndWithdrawal() {
        const selectedYear = parseInt(lwYearSlider.value);
        lwYearDisplay.textContent = selectedYear;
        updateSliderFill(lwYearSlider);

        let eligibleLoan = 0;
        let maxWithdrawal = 0;

        // Ensure yearlyDataCache is populated
        if (yearlyDataCache.length === 0) {
            eligibleLoanAmountElem.textContent = '₹0';
            maxWithdrawalAmountElem.textContent = '₹0';
            return;
        }

        // Loan Eligibility: From 3rd to 6th financial year
        if (selectedYear >= 3 && selectedYear <= 6) {
            // Balance at the end of the year preceding the year for which loan is applied
            // Loan can be taken *during* year 3, based on balance at end of year 1 (index 0)
            const balanceYearIndex = selectedYear - 3; // Index for balance calculation (Year 1 -> index 0)
            if (yearlyDataCache[balanceYearIndex]) {
                eligibleLoan = yearlyDataCache[balanceYearIndex].closingBalance * 0.25;
            }
        }

        // Withdrawal Eligibility: From 7th financial year onwards (Partial Withdrawal)
        // Can withdraw ONCE per year, starting from year 7
        if (selectedYear >= 7) {
            // Amount is lower of:
            // 1. 50% of balance at end of the year immediately preceding the withdrawal year.
            // 2. 50% of balance at end of the 4th year immediately preceding the withdrawal year.
            const balancePrevYearIndex = selectedYear - 2; // Index for balance at end of previous year
            const balance4thPrevYearIndex = selectedYear - 5; // Index for balance at end of 4th preceding year

            const balanceAtPrevYear = yearlyDataCache[balancePrevYearIndex]?.closingBalance || 0;
            const balanceAt4thPrevYear = yearlyDataCache[balance4thPrevYearIndex]?.closingBalance || 0;

            maxWithdrawal = Math.min(balanceAtPrevYear * 0.5, balanceAt4thPrevYear * 0.5);
        }

        // Handle cases where withdrawal might exceed current balance (though rules prevent this)
        const currentBalanceIndex = selectedYear - 1;
        const currentBalance = yearlyDataCache[currentBalanceIndex]?.closingBalance || 0;
        maxWithdrawal = Math.min(maxWithdrawal, currentBalance); // Cannot withdraw more than available

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
        updateCalculator(); // Recalculate when extensions change
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
        // Basic sharing of inputs and main results
        const params = new URLSearchParams();
        params.set('investment', annualInvestmentInput.value);
        params.set('rate', interestRateInput.value);
        params.set('extensions', extensionBlocks);
        params.set('contributions', contributionToggle.checked);
        // Include maturity value
        params.set('maturity', maturityValueElem.textContent.replace(/[^0-9.]/g, ''));


        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

        if (navigator.share) {
            navigator.share({
                title: 'My PPF Investment Plan',
                text: `Check out my projected PPF maturity of ${maturityValueElem.textContent}! Plan yours here:`,
                url: shareUrl,
            }).catch(err => {
                console.error("Share failed:", err.message);
                copyToClipboard(shareUrl); // Fallback to copy link
            });
        } else {
            copyToClipboard(shareUrl); // Fallback if navigator.share not supported
        }
    }
    // Helper function to copy text to clipboard
    function copyToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
             // Use global showNotification if available
             if (typeof showNotification === 'function') {
                 showNotification('Link copied to clipboard!');
             }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
             if (typeof showNotification === 'function') {
                 showNotification('Could not copy link.');
             }
        }
        document.body.removeChild(textArea);
    }


    function loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('investment')) {
            getElem('annualInvestmentInput').value = params.get('investment') || 150000; // Default if param exists but is empty
            getElem('interestRateInput').value = params.get('rate') || 7.1;
            extensionBlocks = parseInt(params.get('extensions')) || 0;
            extensionBlocks = Math.max(0, Math.min(extensionBlocks, MAX_EXTENSIONS)); // Clamp value
            getElem('contributionToggle').checked = params.get('contributions') === 'true';

            // Sync sliders
            getElem('annualInvestmentSlider').value = getElem('annualInvestmentInput').value;
            getElem('interestRateSlider').value = getElem('interestRateInput').value;
            updateSliderFill(getElem('annualInvestmentSlider'));
            updateSliderFill(getElem('interestRateSlider'));
            updateExtensionUI(); // This will also trigger updateCalculator
        } else {
            // If no params, run initial calculation with defaults
             updateCalculator();
        }
    }


    function setupEventListeners() {
        const debouncedUpdate = debounce(updateCalculator, 250);

        // USE THE NEW SYNC FUNCTION for inputs with steppers
        syncSliderAndInput({
            sliderId: 'annualInvestmentSlider',
            inputId: 'annualInvestmentInput',
            decrementId: 'annualInvestmentDecrement', // Pass button ID
            incrementId: 'annualInvestmentIncrement', // Pass button ID
            updateCallback: debouncedUpdate // Use debounced update for sliders/typing
        });
        syncSliderAndInput({
            sliderId: 'interestRateSlider',
            inputId: 'interestRateInput',
            decrementId: 'interestRateDecrement', // Pass button ID
            incrementId: 'interestRateIncrement', // Pass button ID
            updateCallback: debouncedUpdate // Use debounced update for sliders/typing
        });

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

        const debouncedLoanUpdate = debounce(updateLoanAndWithdrawal, 150); // Shorter debounce for responsiveness
        lwYearSlider.addEventListener('input', () => {
            // Update display immediately for better UX
            lwYearDisplay.textContent = lwYearSlider.value;
            updateSliderFill(lwYearSlider);
            // Debounce the actual calculation which depends on yearlyDataCache
            debouncedLoanUpdate();
        });
    }

    loadFromUrl(); // Load URL params or run initial calculation
    setupEventListeners();
    // Initial calculation is now triggered within loadFromUrl or updateExtensionUI
    loadSeoContent();
}
