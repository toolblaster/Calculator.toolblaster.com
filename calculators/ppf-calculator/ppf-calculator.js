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
    const annualInvestmentSlider = getElem('annualInvestmentSlider');
    const annualInvestmentInput = getElem('annualInvestmentInput');
    const interestRateSlider = getElem('interestRateSlider');
    const interestRateInput = getElem('interestRateInput');
    
    const extensionBlocksInput = getElem('extensionBlocksInput');
    const decreaseExtensionBtn = getElem('decreaseExtension');
    const increaseExtensionBtn = getElem('increaseExtension');
    const extensionContributionDiv = getElem('extensionContributionDiv');
    const contributionToggle = getElem('contributionToggle');

    // --- Result Elements ---
    const totalInvestmentElem = getElem('totalInvestment');
    const totalInterestElem = getElem('totalInterest');
    const maturityValueElem = getElem('maturityValue');
    
    const doughnutCanvas = getElem('ppfDoughnutChart');
    const doughnutCtx = doughnutCanvas.getContext('2d');
    let ppfDoughnutChart;

    const toggleGrowthBtn = getElem('toggleYearlyGrowthBtn');
    const growthContainer = getElem('yearlyGrowthContainer');
    const shareReportBtn = getElem('shareReportBtn');


    let extensionBlocks = 0;
    const MAX_EXTENSIONS = 4; // Max 20 extra years

    // --- Utility Functions ---
    const debounce = (func, delay) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; };
    const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(num));
    const updateSliderFill = (slider) => { if (!slider) return; const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100; slider.style.setProperty('--fill-percentage', `${percentage}%`); };

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

        for (let year = 1; year <= totalTerm; year++) {
            let yearlyInvestment = 0;
            // Check if we should add contribution for the current year
            if (year <= initialTerm || (year > initialTerm && continueContributions)) {
                yearlyInvestment = annualInvestment;
            }
            
            totalInvested += yearlyInvestment;
            // PPF interest is compounded annually. Investment is assumed to be made at the start of the year.
            const interestEarned = (balance + yearlyInvestment) * interestRate;
            balance += yearlyInvestment + interestEarned;
            
            yearlyData.push({
                year: year,
                openingBalance: year === 1 ? 0 : yearlyData[year-2].closingBalance,
                invested: yearlyInvestment,
                interest: interestEarned,
                closingBalance: balance
            });
        }
        
        const totalInterest = balance - totalInvested;

        totalInvestmentElem.textContent = formatCurrency(totalInvested);
        totalInterestElem.textContent = formatCurrency(totalInterest);
        maturityValueElem.textContent = formatCurrency(balance);

        updateDoughnutChart([totalInvested, totalInterest], ['Total Investment', 'Total Interest'], ['#3B82F6', '#22C55E']);
        generateYearlyGrowthTable(yearlyData);
    }

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
      const chartData = { labels: labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 4, borderRadius: 3, spacing: 1 }] };
      const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: window.innerWidth < 640 ? '60%' : '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` } } } };
      if (ppfDoughnutChart) { ppfDoughnutChart.data = chartData; ppfDoughnutChart.update(); } else { ppfDoughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: chartData, options: chartOptions }); }
    }
    
    function updateExtensionUI() {
        extensionBlocksInput.value = `${extensionBlocks} blocks (${extensionBlocks * 5} yrs)`;
        extensionContributionDiv.classList.toggle('hidden', extensionBlocks === 0);
        decreaseExtensionBtn.disabled = extensionBlocks === 0;
        increaseExtensionBtn.disabled = extensionBlocks >= MAX_EXTENSIONS;
        updateCalculator();
    }
    
    function handleShare() {
        const params = new URLSearchParams();
        params.set('investment', annualInvestmentInput.value);
        params.set('rate', interestRateInput.value);
        params.set('extend', extensionBlocks);
        if (extensionBlocks > 0) {
            params.set('contrib', contributionToggle.checked);
        }
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

        if (navigator.share) {
            navigator.share({
                title: 'My PPF Calculation',
                text: 'Check out my PPF investment plan!',
                url: shareUrl,
            }).catch(err => console.error("Share failed:", err.message));
        } else {
            // Fallback for browsers that don't support navigator.share
            navigator.clipboard.writeText(shareUrl).then(() => {
                showNotification('Link copied to clipboard!');
            }).catch(err => {
                console.error('Could not copy text: ', err);
                // A global showNotification function should exist in script.js
                showNotification('Failed to copy link.');
            });
        }
    }

    function loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('investment')) {
            annualInvestmentInput.value = params.get('investment') || 150000;
            interestRateInput.value = params.get('rate') || 7.1;
            extensionBlocks = parseInt(params.get('extend'), 10) || 0;
            
            if (extensionBlocks > 0) {
                contributionToggle.checked = params.get('contrib') === 'true';
            }
            
            // Sync sliders
            annualInvestmentSlider.value = annualInvestmentInput.value;
            interestRateSlider.value = interestRateInput.value;
            
            updateExtensionUI(); // This will also trigger updateCalculator
        } else {
             updateCalculator(); // Initial calculation if no params
        }
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

    function setupEventListeners() {
        const inputs = [
            { slider: annualInvestmentSlider, input: annualInvestmentInput },
            { slider: interestRateSlider, input: interestRateInput },
        ];
        
        inputs.forEach(({ slider, input }) => {
            if (slider && input) {
                slider.addEventListener('input', () => { input.value = slider.value; updateSliderFill(slider); debouncedUpdate(); });
                input.addEventListener('input', () => { slider.value = input.value; updateSliderFill(slider); debouncedUpdate(); });
            }
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
        
        shareReportBtn.addEventListener('click', handleShare);
    }

    const debouncedUpdate = debounce(updateCalculator, 250);
    setupEventListeners();
    document.querySelectorAll('.range-slider').forEach(updateSliderFill);
    loadFromUrl(); // Initial calculation and loading from URL parameters
    loadSeoContent();
}
