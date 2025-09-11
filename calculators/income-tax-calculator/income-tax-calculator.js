document.addEventListener('DOMContentLoaded', () => {
    // Check if the main calculator container exists on the page
    const calculatorContainer = document.querySelector('.calculator-container');
    if (calculatorContainer) {
        initializeTaxCalculator();
    }
});

function initializeTaxCalculator() {
    'use strict';
    const getElem = (id) => document.getElementById(id);

    // --- Element Variables ---
    const grossSalarySlider = getElem('grossSalarySlider');
    const grossSalaryInput = getElem('grossSalaryInput');
    const deduction80cSlider = getElem('deduction80cSlider');
    const deduction80cInput = getElem('deduction80cInput');
    const homeLoanInterestSlider = getElem('homeLoanInterestSlider');
    const homeLoanInterestInput = getElem('homeLoanInterestInput');
    const deductionNpsSlider = getElem('deductionNpsSlider');
    const deductionNpsInput = getElem('deductionNpsInput');
    const otherDeductionsSlider = getElem('otherDeductionsSlider');
    const otherDeductionsInput = getElem('otherDeductionsInput');
    const taxpayerProfileSelect = getElem('taxpayerProfile');

    const oldRegimeTaxElem = getElem('oldRegimeTax');
    const newRegimeTaxElem = getElem('newRegimeTax');
    const oldRegimeCard = getElem('oldRegimeCard');
    const newRegimeCard = getElem('newRegimeCard');
    const recommendationBox = getElem('recommendationBox');
    const recommendationText = getElem('recommendationText');

    const doughnutCanvas = getElem('taxDoughnutChart');
    const doughnutCtx = doughnutCanvas.getContext('2d');
    let taxDoughnutChart;

    const toggleDetailsBtn = getElem('toggleDetailsBtn');
    const detailsTableContainer = getElem('detailsTableContainer');
    
    // Share Modal Elements
    const shareReportBtn = getElem('shareReportBtn');
    const shareModal = getElem('shareModal');
    const closeModalBtn = getElem('closeModalBtn');
    const modalReportContent = getElem('modalReportContent');
    const shareUrlInput = getElem('shareUrlInput');
    const copyUrlBtn = getElem('copyUrlBtn');
    const printReportBtn = getElem('printReportBtn');

    // --- Utility Functions ---
    const debounce = (func, delay) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; };
    const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(num));
    const updateSliderFill = (slider) => { if (!slider) return; const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100; slider.style.setProperty('--fill-percentage', `${percentage}%`); };

    // --- Core Calculation Logic ---
    function calculateTax(taxableIncome, slabs) {
        let tax = 0;
        for (const slab of slabs) {
            if (taxableIncome > slab.min) {
                const taxableInSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
                tax += taxableInSlab * slab.rate;
            }
        }
        return tax;
    }

    function getTaxSlabs(profile) {
        let oldRegimeSlabs = [
            { min: 0, max: 250000, rate: 0 },
            { min: 250000, max: 500000, rate: 0.05 },
            { min: 500000, max: 1000000, rate: 0.20 },
            { min: 1000000, max: Infinity, rate: 0.30 }
        ];

        if (profile === 'senior') {
            oldRegimeSlabs[0].max = 300000;
            oldRegimeSlabs[1] = { min: 300000, max: 500000, rate: 0.05 };
        } else if (profile === 'super_senior') {
            oldRegimeSlabs[0].max = 500000;
            oldRegimeSlabs.splice(1, 1); // For >80, there's no 5% slab, it goes straight to 20%
            oldRegimeSlabs[1] = { min: 500000, max: 1000000, rate: 0.20 };
        }


        const newRegimeSlabs = [
            { min: 0, max: 300000, rate: 0 },
            { min: 300000, max: 600000, rate: 0.05 },
            { min: 600000, max: 900000, rate: 0.10 },
            { min: 900000, max: 1200000, rate: 0.15 },
            { min: 1200000, max: 1500000, rate: 0.20 },
            { min: 1500000, max: Infinity, rate: 0.30 }
        ];

        return { oldRegimeSlabs, newRegimeSlabs };
    }

    function updateCalculator() {
        const grossSalary = parseFloat(grossSalaryInput.value) || 0;
        const deduction80c = parseFloat(deduction80cInput.value) || 0;
        const homeLoanInterest = parseFloat(homeLoanInterestInput.value) || 0;
        const npsDeduction = parseFloat(deductionNpsInput.value) || 0;
        const otherDeductions = parseFloat(otherDeductionsInput.value) || 0;
        const taxpayerProfile = taxpayerProfileSelect.value;
        const standardDeduction = 50000;
        
        const totalDeductions = deduction80c + homeLoanInterest + npsDeduction + otherDeductions + standardDeduction;

        const { oldRegimeSlabs, newRegimeSlabs } = getTaxSlabs(taxpayerProfile);

        // --- Old Regime Calculation ---
        let taxableIncomeOld = grossSalary - totalDeductions;
        let taxOld = 0;
        if (taxableIncomeOld > 500000) {
            taxOld = calculateTax(taxableIncomeOld, oldRegimeSlabs);
        }
        const cessOld = taxOld * 0.04;
        const totalTaxOld = taxOld + cessOld;
        
        // --- New Regime Calculation ---
        let taxableIncomeNew = grossSalary - standardDeduction; // SD is now available in new regime
        let taxNew = 0;
        if (taxableIncomeNew > 700000) {
            taxNew = calculateTax(taxableIncomeNew, newRegimeSlabs);
        }
        const cessNew = taxNew * 0.04;
        const totalTaxNew = taxNew + cessNew;

        // --- Update UI ---
        oldRegimeTaxElem.textContent = formatCurrency(totalTaxOld);
        newRegimeTaxElem.textContent = formatCurrency(totalTaxNew);

        // Update recommendation
        oldRegimeCard.classList.remove('recommended');
        newRegimeCard.classList.remove('recommended');
        recommendationBox.classList.remove('bg-green-100', 'bg-gray-100');
        recommendationText.classList.remove('text-green-800');

        if (totalTaxOld < totalTaxNew) {
            oldRegimeCard.classList.add('recommended');
            recommendationText.textContent = 'Old Regime is more beneficial for you!';
            recommendationBox.classList.add('bg-green-100');
            recommendationText.classList.add('text-green-800');
        } else if (totalTaxNew < totalTaxOld) {
            newRegimeCard.classList.add('recommended');
            recommendationText.textContent = 'New Regime is more beneficial for you!';
            recommendationBox.classList.add('bg-green-100');
            recommendationText.classList.add('text-green-800');
        } else {
            recommendationText.textContent = 'Both regimes result in the same tax.';
            recommendationBox.classList.add('bg-gray-100');
        }

        // Update Doughnut Chart
        updateDoughnutChart([totalTaxOld, totalTaxNew], ['Old Regime', 'New Regime'], ['#F87171', '#60A5FA']);
        
        // Update Details Table
        updateDetailsTable({
            grossSalary, standardDeduction, deduction80c, homeLoanInterest, npsDeduction, otherDeductions,
            taxableIncomeOld, taxOld, cessOld, totalTaxOld,
            taxableIncomeNew, taxNew, cessNew, totalTaxNew
        });
    }
    
    function updateDoughnutChart(data, labels, colors) {
      const chartData = { labels: labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 4, borderRadius: 3, spacing: 1 }] };
      const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: window.innerWidth < 640 ? '60%' : '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` } } } };
      if (taxDoughnutChart) { taxDoughnutChart.data = chartData; taxDoughnutChart.update(); } else { taxDoughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: chartData, options: chartOptions }); }
    }

    function updateDetailsTable(data) {
        detailsTableContainer.innerHTML = `
            <h3 class="text-center text-sm font-bold text-gray-800 mb-2">Detailed Tax Calculation</h3>
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-2 py-1 text-left text-xxs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                        <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase tracking-wider">Old Regime</th>
                        <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase tracking-wider">New Regime</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 text-xs">
                    <tr><td class="px-2 py-1">Gross Annual Salary</td><td class="px-2 py-1 text-right">${formatCurrency(data.grossSalary)}</td><td class="px-2 py-1 text-right">${formatCurrency(data.grossSalary)}</td></tr>
                    <tr class="bg-gray-50"><td colspan="3" class="px-2 py-1 font-semibold">Deductions</td></tr>
                    <tr><td class="px-2 py-1 pl-4">Standard Deduction</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.standardDeduction)}</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.standardDeduction)}</td></tr>
                    <tr><td class="px-2 py-1 pl-4">Section 80C</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.deduction80c)}</td><td class="px-2 py-1 text-right">-</td></tr>
                    <tr><td class="px-2 py-1 pl-4">Home Loan Interest</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.homeLoanInterest)}</td><td class="px-2 py-1 text-right">-</td></tr>
                    <tr><td class="px-2 py-1 pl-4">NPS (80CCD-1B)</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.npsDeduction)}</td><td class="px-2 py-1 text-right">-</td></tr>
                    <tr><td class="px-2 py-1 pl-4">Other Deductions</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.otherDeductions)}</td><td class="px-2 py-1 text-right">-</td></tr>
                    <tr class="font-bold bg-blue-50"><td class="px-2 py-1">Taxable Income</td><td class="px-2 py-1 text-right">${formatCurrency(data.taxableIncomeOld > 0 ? data.taxableIncomeOld : 0)}</td><td class="px-2 py-1 text-right">${formatCurrency(data.taxableIncomeNew > 0 ? data.taxableIncomeNew : 0)}</td></tr>
                    <tr><td class="px-2 py-1">Income Tax</td><td class="px-2 py-1 text-right">${formatCurrency(data.taxOld)}</td><td class="px-2 py-1 text-right">${formatCurrency(data.taxNew)}</td></tr>
                    <tr><td class="px-2 py-1">Health & Edu Cess (4%)</td><td class="px-2 py-1 text-right">(+) ${formatCurrency(data.cessOld)}</td><td class="px-2 py-1 text-right">(+) ${formatCurrency(data.cessNew)}</td></tr>
                    <tr class="font-bold text-base bg-green-50"><td class="px-2 py-1">Total Tax Payable</td><td class="px-2 py-1 text-right">${formatCurrency(data.totalTaxOld)}</td><td class="px-2 py-1 text-right">${formatCurrency(data.totalTaxNew)}</td></tr>
                </tbody>
            </table>
        `;
    }
    
    function populateAndShowModal() {
        const grossSalary = parseFloat(grossSalaryInput.value);
        const totalDeductionsOld = parseFloat(deduction80cInput.value) + parseFloat(homeLoanInterestInput.value) + parseFloat(deductionNpsInput.value) + parseFloat(otherDeductionsInput.value) + 50000;
        const totalDeductionsNew = 50000;
        const taxOld = parseFloat(oldRegimeTaxElem.textContent.replace(/[^0-9.]/g, ''));
        const taxNew = parseFloat(newRegimeTaxElem.textContent.replace(/[^0-9.]/g, ''));

        modalReportContent.innerHTML = `
            <h3>Your Inputs</h3>
            <ul>
                <li><span>Annual Gross Salary:</span> <span>${formatCurrency(grossSalary)}</span></li>
                <li><span>Taxpayer Profile:</span> <span>${taxpayerProfileSelect.options[taxpayerProfileSelect.selectedIndex].text}</span></li>
                <li><span>Total Deductions (Old Regime):</span> <span>${formatCurrency(totalDeductionsOld)}</span></li>
            </ul>
            <h3 style="margin-top: 1rem;">Final Tax Liability</h3>
            <ul>
                <li><span>Old Regime Tax:</span> <span>${formatCurrency(taxOld)}</span></li>
                <li><span>New Regime Tax:</span> <span>${formatCurrency(taxNew)}</span></li>
                <li style="font-size: 1rem; font-weight: bold; color: ${taxOld < taxNew ? '#166534' : '#991b1b'}; margin-top: 0.5rem; border-top: 1px solid #e5e7eb; padding-top: 0.5rem;">
                    <span>Total Savings:</span> <span>${formatCurrency(Math.abs(taxOld - taxNew))}</span>
                </li>
            </ul>
        `;
        
        // Generate shareable URL
        const params = new URLSearchParams();
        params.set('salary', grossSalary);
        params.set('profile', taxpayerProfileSelect.value);
        params.set('d80c', deduction80cInput.value);
        params.set('d24', homeLoanInterestInput.value);
        params.set('dnps', deductionNpsInput.value);
        params.set('dother', otherDeductionsInput.value);
        shareUrlInput.value = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

        shareModal.classList.remove('hidden');
    }

    function loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('salary')) {
            grossSalaryInput.value = params.get('salary');
            taxpayerProfileSelect.value = params.get('profile') || 'regular';
            deduction80cInput.value = params.get('d80c') || '150000';
            homeLoanInterestInput.value = params.get('d24') || '0';
            deductionNpsInput.value = params.get('dnps') || '0';
            otherDeductionsInput.value = params.get('dother') || '0';
            
            // Sync sliders
            [grossSalarySlider, deduction80cSlider, homeLoanInterestSlider, deductionNpsSlider, otherDeductionsSlider].forEach(slider => {
                const input = getElem(slider.id.replace('Slider', 'Input'));
                slider.value = input.value;
                updateSliderFill(slider);
            });
            
            updateCalculator();
        }
    }

    // --- Event Listeners ---
    function setupEventListeners() {
      const inputs = [
        { slider: grossSalarySlider, input: grossSalaryInput },
        { slider: deduction80cSlider, input: deduction80cInput },
        { slider: homeLoanInterestSlider, input: homeLoanInterestInput },
        { slider: deductionNpsSlider, input: deductionNpsInput },
        { slider: otherDeductionsSlider, input: otherDeductionsInput }
      ];
      
      inputs.forEach(({ slider, input }) => {
        slider.addEventListener('input', () => { input.value = slider.value; updateSliderFill(slider); debouncedUpdate(); });
        input.addEventListener('input', () => { slider.value = input.value; updateSliderFill(slider); debouncedUpdate(); });
      });
      
      taxpayerProfileSelect.addEventListener('change', updateCalculator);
      
      toggleDetailsBtn.addEventListener('click', () => {
          detailsTableContainer.classList.toggle('hidden');
          toggleDetailsBtn.textContent = detailsTableContainer.classList.contains('hidden') ? 'Show Calculation Details' : 'Hide Calculation Details';
      });

      // Modal event listeners
      shareReportBtn.addEventListener('click', populateAndShowModal);
      closeModalBtn.addEventListener('click', () => shareModal.classList.add('hidden'));
      window.addEventListener('click', (event) => { if (event.target == shareModal) shareModal.classList.add('hidden'); });
      copyUrlBtn.addEventListener('click', () => {
          shareUrlInput.select();
          document.execCommand('copy');
          showNotification('Link copied to clipboard!');
      });
      printReportBtn.addEventListener('click', () => {
         const modalContent = getElem('modalReportContent');
         modalContent.classList.add('print-area');
         window.print();
         modalContent.classList.remove('print-area');
      });
    }

    // --- Dynamic SEO Content Loading ---
    function loadSeoContent() {
        const contentArea = getElem('dynamic-content-area');
        if (contentArea) {
            fetch('income-tax-calculator-seo-content.html')
                .then(response => response.ok ? response.text() : Promise.reject('File not found'))
                .then(html => contentArea.innerHTML = html)
                .catch(error => console.error('Error loading SEO content:', error));
        }
    }
    
    // --- Initial Run ---
    const debouncedUpdate = debounce(updateCalculator, 250);
    setupEventListeners();
    loadFromUrl(); // Load from URL first
    document.querySelectorAll('.range-slider').forEach(updateSliderFill);
    if (!window.location.search) {
        updateCalculator(); // Then do initial calculation if no params
    }
    loadSeoContent();
}
