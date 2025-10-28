// --- IMPORT SHARED UTILITIES ---
// Refactored to import common functions from the central utils.js file, removing duplicated code.
import { formatCurrency, debounce, updateSliderFill, syncSliderAndInput } from '../../assets/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if the main calculator container exists on the page
    const calculatorContainer = document.querySelector('.calculator-container');
    if (calculatorContainer && getElem('grossSalaryInput')) { // Added check for a specific input
        initializeTaxCalculator();
    }
});

// Helper function to get elements
const getElem = (id) => document.getElementById(id);

function initializeTaxCalculator() {
    'use strict';

    // --- Element Variables ---
    const grossSalaryInput = getElem('grossSalaryInput');
    const deduction80cInput = getElem('deduction80cInput');
    const homeLoanInterestInput = getElem('homeLoanInterestInput');
    const deductionNpsInput = getElem('deductionNpsInput');
    const otherDeductionsInput = getElem('otherDeductionsInput');
    const taxpayerProfileSelect = getElem('taxpayerProfile');

    const oldRegimeTaxElem = getElem('oldRegimeTax');
    const newRegimeTaxElem = getElem('newRegimeTax');
    const oldRegimeCard = getElem('oldRegimeCard');
    const newRegimeCard = getElem('newRegimeCard');
    const recommendationBox = getElem('recommendationBox');
    const recommendationText = getElem('recommendationText');

    const doughnutCanvas = getElem('taxDoughnutChart');
    let taxDoughnutChart;
    // --- ADDED: Check for canvas and get context ---
    let doughnutCtx = null;
    if (doughnutCanvas) {
        doughnutCtx = doughnutCanvas.getContext('2d');
    } else {
        console.error("Doughnut chart canvas element not found!");
    }
    // --- END ADDED ---

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
        // --- Validation ---
        let isValid = true;
        const validateInput = (inputId, min, max, errorMessageElemId) => {
            const inputElem = getElem(inputId);
            const value = parseFloat(inputElem.value);
            const errorElem = getElem(errorMessageElemId);
            if (isNaN(value) || value < min || value > max) {
                errorElem?.classList.remove('hidden');
                return false;
            } else {
                errorElem?.classList.add('hidden');
                return true;
            }
        };

        isValid &= validateInput('grossSalaryInput', 250000, 20000000, 'grossSalaryError');
        isValid &= validateInput('deduction80cInput', 0, 150000, 'deduction80cError');
        isValid &= validateInput('homeLoanInterestInput', 0, 200000, 'homeLoanInterestError');
        isValid &= validateInput('deductionNpsInput', 0, 50000, 'deductionNpsError');
        isValid &= validateInput('otherDeductionsInput', 0, 100000, 'otherDeductionsError');


        if (!isValid) {
            // Display error state in results
            oldRegimeTaxElem.textContent = '-';
            newRegimeTaxElem.textContent = '-';
            recommendationBox.classList.remove('bg-green-100', 'bg-gray-100');
            recommendationText.classList.remove('text-green-800');
            recommendationText.textContent = 'Please enter valid inputs.';
            recommendationBox.classList.add('bg-red-100'); // Indicate error
            recommendationText.classList.add('text-red-800');
            oldRegimeCard.classList.remove('recommended');
            newRegimeCard.classList.remove('recommended');
            // --- UPDATED: Pass default error state to chart ---
            updateDoughnutChart([1], ['Invalid Input'], ['#E5E7EB']); // Show gray chart
            // --- END UPDATED ---
            detailsTableContainer.innerHTML = '<p class="text-center text-gray-500 text-xs">Enter valid inputs to see details.</p>';
            return;
        } else {
             // Ensure error styles are removed if valid
             recommendationBox.classList.remove('bg-red-100');
             recommendationText.classList.remove('text-red-800');
        }
        // --- End Validation ---

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
        taxableIncomeOld = Math.max(0, taxableIncomeOld); // Ensure income doesn't go below 0
        let taxOld = 0;
        let rebateOld = 0;
        // Apply rebate u/s 87A for Old Regime if taxable income <= 5L
        if (taxableIncomeOld <= 500000) {
            taxOld = calculateTax(taxableIncomeOld, oldRegimeSlabs);
            rebateOld = Math.min(taxOld, 12500);
            taxOld = 0; // Tax becomes 0 after rebate
        } else {
             taxOld = calculateTax(taxableIncomeOld, oldRegimeSlabs);
        }
        const cessOld = taxOld * 0.04; // Cess is applied on tax after rebate
        const totalTaxOld = taxOld + cessOld;

        // --- New Regime Calculation ---
        let taxableIncomeNew = grossSalary - standardDeduction; // SD is now available in new regime
        taxableIncomeNew = Math.max(0, taxableIncomeNew); // Ensure income doesn't go below 0
        let taxNew = 0;
        let rebateNew = 0;
         // Apply rebate u/s 87A for New Regime if taxable income <= 7L
        if (taxableIncomeNew <= 700000) {
            taxNew = calculateTax(taxableIncomeNew, newRegimeSlabs);
            rebateNew = Math.min(taxNew, 25000); // Higher rebate limit
            taxNew = 0; // Tax becomes 0 after rebate
        } else {
            taxNew = calculateTax(taxableIncomeNew, newRegimeSlabs);
        }
        const cessNew = taxNew * 0.04; // Cess is applied on tax after rebate
        const totalTaxNew = taxNew + cessNew;

        // --- Update UI ---
        oldRegimeTaxElem.textContent = formatCurrency(totalTaxOld);
        newRegimeTaxElem.textContent = formatCurrency(totalTaxNew);

        // Update recommendation
        oldRegimeCard.classList.remove('recommended');
        newRegimeCard.classList.remove('recommended');
        recommendationBox.classList.remove('bg-green-100', 'bg-gray-100', 'bg-red-100'); // Also remove red bg
        recommendationText.classList.remove('text-green-800', 'text-red-800');

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
            taxableIncomeOld, taxOldBeforeRebate: calculateTax(taxableIncomeOld, oldRegimeSlabs), rebateOld, taxOld, cessOld, totalTaxOld, // Pass rebate info
            taxableIncomeNew, taxNewBeforeRebate: calculateTax(taxableIncomeNew, newRegimeSlabs), rebateNew, taxNew, cessNew, totalTaxNew // Pass rebate info
        });
    }

    // --- Chart Update Function ---
    function updateDoughnutChart(data, labels, colors) {
        // --- ADDED: Check if context exists ---
        if (!doughnutCtx) {
            console.error("Chart context (doughnutCtx) is not available.");
            return;
        }
        // --- END ADDED ---
        const chartData = { labels: labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 4, borderRadius: 3, spacing: 1 }] };
        const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: '50%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` } } } };
        if (taxDoughnutChart) { taxDoughnutChart.data = chartData; taxDoughnutChart.update(); }
        else { taxDoughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: chartData, options: chartOptions }); }
    }


    // --- Other functions (updateDetailsTable, populateAndShowModal, loadFromUrl) remain unchanged ---
     function updateDetailsTable(data) {
        // Only show rebate row if rebate is actually applied (> 0)
        const rebateRowOld = data.rebateOld > 0 ? `<tr><td class="px-2 py-1 pl-4">Rebate u/s 87A</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.rebateOld)}</td><td class="px-2 py-1 text-right">-</td></tr>` : '';
        const rebateRowNew = data.rebateNew > 0 ? `<tr><td class="px-2 py-1 pl-4">Rebate u/s 87A</td><td class="px-2 py-1 text-right">-</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.rebateNew)}</td></tr>` : '';

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
                    <tr><td class="px-2 py-1 pl-4">Home Loan Interest (Sec 24b)</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.homeLoanInterest)}</td><td class="px-2 py-1 text-right">-</td></tr>
                    <tr><td class="px-2 py-1 pl-4">NPS (80CCD-1B)</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.npsDeduction)}</td><td class="px-2 py-1 text-right">-</td></tr>
                    <tr><td class="px-2 py-1 pl-4">Other Deductions (80D etc.)</td><td class="px-2 py-1 text-right">(-) ${formatCurrency(data.otherDeductions)}</td><td class="px-2 py-1 text-right">-</td></tr>
                    <tr class="font-semibold bg-blue-50"><td class="px-2 py-1">Net Taxable Income</td><td class="px-2 py-1 text-right">${formatCurrency(data.taxableIncomeOld)}</td><td class="px-2 py-1 text-right">${formatCurrency(data.taxableIncomeNew)}</td></tr>
                    <tr><td class="px-2 py-1">Income Tax (Before Rebate)</td><td class="px-2 py-1 text-right">${formatCurrency(data.taxOldBeforeRebate)}</td><td class="px-2 py-1 text-right">${formatCurrency(data.taxNewBeforeRebate)}</td></tr>
                    ${rebateRowOld}
                    ${rebateRowNew}
                    <tr><td class="px-2 py-1 font-semibold">Income Tax (After Rebate)</td><td class="px-2 py-1 text-right">${formatCurrency(data.taxOld)}</td><td class="px-2 py-1 text-right">${formatCurrency(data.taxNew)}</td></tr>
                    <tr><td class="px-2 py-1">Health & Edu Cess (4%)</td><td class="px-2 py-1 text-right">(+) ${formatCurrency(data.cessOld)}</td><td class="px-2 py-1 text-right">(+) ${formatCurrency(data.cessNew)}</td></tr>
                    <tr class="font-bold text-base bg-green-50"><td class="px-2 py-1">Total Tax Payable</td><td class="px-2 py-1 text-right">${formatCurrency(data.totalTaxOld)}</td><td class="px-2 py-1 text-right">${formatCurrency(data.totalTaxNew)}</td></tr>
                </tbody>
            </table>
        `;
    }

    function populateAndShowModal() {
        const grossSalary = parseFloat(grossSalaryInput.value);
        const totalDeductionsOld = parseFloat(deduction80cInput.value) + parseFloat(homeLoanInterestInput.value) + parseFloat(deductionNpsInput.value) + parseFloat(otherDeductionsInput.value) + 50000;
        const taxOldText = oldRegimeTaxElem.textContent;
        const taxNewText = newRegimeTaxElem.textContent;

        const taxOld = taxOldText ? parseFloat(taxOldText.replace(/[^0-9.]/g, '')) : 0;
        const taxNew = taxNewText ? parseFloat(taxNewText.replace(/[^0-9.]/g, '')) : 0;

        const recommendedRegime = recommendationText.textContent; // Get the recommendation text
        const savings = Math.abs(taxOld - taxNew);

        modalReportContent.innerHTML = `
            <h3>Your Inputs</h3>
            <ul>
                <li><span>Annual Gross Salary:</span> <span>${formatCurrency(grossSalary)}</span></li>
                <li><span>Taxpayer Profile:</span> <span>${taxpayerProfileSelect.options[taxpayerProfileSelect.selectedIndex].text}</span></li>
                <li><span>Total Deductions Claimed (Old Regime):</span> <span>${formatCurrency(totalDeductionsOld)}</span></li>
            </ul>
            <h3 style="margin-top: 1rem;">Final Tax Liability</h3>
            <ul>
                <li><span>Old Regime Tax:</span> <span>${formatCurrency(taxOld)}</span></li>
                <li><span>New Regime Tax:</span> <span>${formatCurrency(taxNew)}</span></li>
                <li style="font-size: 0.9rem; font-weight: bold; color: ${taxOld < taxNew ? '#166534' : (taxNew < taxOld ? '#166534' : '#1f2937')}; margin-top: 0.5rem; border-top: 1px solid #e5e7eb; padding-top: 0.5rem;">
                    <span>Recommendation:</span> <span>${recommendedRegime}</span>
                </li>
                 ${savings > 0 ? `
                 <li style="font-size: 0.9rem; font-weight: bold; color: #15803d; ">
                     <span>Total Savings with Recommended Regime:</span> <span>${formatCurrency(savings)}</span>
                 </li>` : ''}
            </ul>
        `;

        // Generate shareable URL
        const params = new URLSearchParams();
        params.set('salary', grossSalaryInput.value);
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
            grossSalaryInput.value = params.get('salary') || 1200000;
            taxpayerProfileSelect.value = params.get('profile') || 'regular';
            deduction80cInput.value = params.get('d80c') || 150000;
            homeLoanInterestInput.value = params.get('d24') || 0;
            deductionNpsInput.value = params.get('dnps') || 0;
            otherDeductionsInput.value = params.get('dother') || 0;

            // Sync sliders
            ['grossSalarySlider', 'deduction80cSlider', 'homeLoanInterestSlider', 'deductionNpsSlider', 'otherDeductionsSlider'].forEach(sliderId => {
                const slider = getElem(sliderId);
                const input = getElem(sliderId.replace('Slider', 'Input'));
                if(input && slider) {
                    slider.value = input.value;
                    // Ensure the imported updateSliderFill is used
                    if (typeof updateSliderFill === 'function') {
                        updateSliderFill(slider);
                    }
                }
            });

            // Call updateCalculator only *after* potentially loading from URL and syncing sliders
            updateCalculator();
        } else {
             // If no URL params, call updateCalculator for initial display
             updateCalculator();
        }
    }


    // --- Event Listeners ---
    function setupEventListeners() {
        const debouncedUpdate = debounce(updateCalculator, 250);

        // REFACTORED: Use syncSliderAndInput for cleaner code, passing button IDs
        syncSliderAndInput({ sliderId: 'grossSalarySlider', inputId: 'grossSalaryInput', decrementId: 'grossSalaryDecrement', incrementId: 'grossSalaryIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'deduction80cSlider', inputId: 'deduction80cInput', decrementId: 'deduction80cDecrement', incrementId: 'deduction80cIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'homeLoanInterestSlider', inputId: 'homeLoanInterestInput', decrementId: 'homeLoanInterestDecrement', incrementId: 'homeLoanInterestIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'deductionNpsSlider', inputId: 'deductionNpsInput', decrementId: 'deductionNpsDecrement', incrementId: 'deductionNpsIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'otherDeductionsSlider', inputId: 'otherDeductionsInput', decrementId: 'otherDeductionsDecrement', incrementId: 'otherDeductionsIncrement', updateCallback: debouncedUpdate });

        if (taxpayerProfileSelect) taxpayerProfileSelect.addEventListener('change', updateCalculator); // Update immediately on profile change

        if(toggleDetailsBtn) toggleDetailsBtn.addEventListener('click', () => {
            detailsTableContainer.classList.toggle('hidden');
            toggleDetailsBtn.textContent = detailsTableContainer.classList.contains('hidden') ? 'Show Calculation Details' : 'Hide Calculation Details';
        });

        // Modal event listeners
        if(shareReportBtn) shareReportBtn.addEventListener('click', populateAndShowModal);
        if(closeModalBtn) closeModalBtn.addEventListener('click', () => shareModal.classList.add('hidden'));
        window.addEventListener('click', (event) => { if (event.target == shareModal) shareModal.classList.add('hidden'); });

        if(copyUrlBtn) copyUrlBtn.addEventListener('click', () => {
            shareUrlInput.select();
            // Use the older document.execCommand for broader compatibility within potential iframe restrictions
            try {
                const successful = document.execCommand('copy');
                if (successful && typeof showNotification === 'function') {
                    showNotification('Link copied to clipboard!');
                } else if (typeof showNotification === 'function') {
                    showNotification('Could not copy link.');
                }
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                if (typeof showNotification === 'function') {
                    showNotification('Could not copy link.');
                }
            }
        });


        if(printReportBtn) printReportBtn.addEventListener('click', () => {
           // Removed the dynamic class adding/removing logic
           window.print();
        });
    }

    // --- Dynamic SEO Content Loading ---
    function loadSeoContent() {
        // --- UPDATED: Target unique ID ---
        const contentArea = getElem('dynamic-content-area-tax');
        // --- END UPDATED ---
        if (contentArea) {
            // Corrected path assuming SEO content is in the same directory
            fetch('income-tax-calculator-seo-content.html')
                .then(response => response.ok ? response.text() : Promise.reject('File not found'))
                .then(html => contentArea.innerHTML = html)
                .catch(error => console.error('Error loading SEO content:', error));
        } else {
             console.error("SEO content area ('dynamic-content-area-tax') not found!");
        }
    }

    // --- Initial Run ---
    setupEventListeners();
    loadFromUrl(); // Load from URL and potentially triggers updateCalculator

    // Initial slider fill update needs to happen after potential loading from URL
    document.querySelectorAll('.range-slider').forEach(slider => {
        // Ensure the imported updateSliderFill is used
        if (typeof updateSliderFill === 'function') {
            updateSliderFill(slider);
        }
    });

    loadSeoContent();
}
