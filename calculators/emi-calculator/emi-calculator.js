// --- IMPORT SHARED UTILITIES ---
// We're importing the reusable functions to keep our code clean and maintainable.
import { formatCurrency, debounce, updateSliderFill, syncSliderAndInput } from '../../assets/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const calculatorContainer = document.querySelector('.calculator-container');
    if (calculatorContainer && document.getElementById('loanAmountSlider')) {
        initializeEmiCalculator();
    }
});

function initializeEmiCalculator() {
    'use strict';
    const getElem = (id) => document.getElementById(id);

    // --- Element Variables ---
    const loanAmountInput = getElem('loanAmountInput');
    const interestRateInput = getElem('interestRateInput');
    const loanTenureInput = getElem('loanTenureInput');
    const homeLoanPreset = getElem('homeLoanPreset');
    const carLoanPreset = getElem('carLoanPreset');
    const personalLoanPreset = getElem('personalLoanPreset');
    const rateTypeToggle = getElem('rateTypeToggle');
    const floatingRateSection = getElem('floatingRateSection');
    const rateIncreaseInput = getElem('rateIncreaseInput');
    const increaseAfterInput = getElem('increaseAfterInput');
    const prepaymentAmountInput = getElem('prepaymentAmountInput');
    const prepaymentFrequencySelect = getElem('prepaymentFrequency');
    const oneTimePrepaymentStartDiv = getElem('oneTimePrepaymentStartDiv');
    const prepaymentStartInput = getElem('prepaymentStartInput');
    const prepaymentStartSlider = getElem('prepaymentStartSlider');

    // Tax Benefit Elements
    const taxBenefitSection = getElem('taxBenefitSection');
    const taxSlabSelect = getElem('taxSlabSelect');
    const principalTaxSavingElem = getElem('principalTaxSaving');
    const interestTaxSavingElem = getElem('interestTaxSaving');
    const totalTaxSavingElem = getElem('totalTaxSaving');

    // Result Elements
    const monthlyEmiElem = getElem('monthlyEmi');
    const principalAmountElem = getElem('principalAmount');
    const totalInterestElem = getElem('totalInterest');
    const totalPayableElem = getElem('totalPayment');
    const interestSavedElem = getElem('interestSaved');
    const tenureReducedElem = getElem('tenureReduced');
    const newEndDateElem = getElem('newEndDate');
    const totalPrepaidAmountElem = getElem('totalPrepaidAmount');
    const prepaymentResultSection = getElem('prepaymentResultSection');
    const newEmiSection = getElem('newEmiSection');
    const newEmiElem = getElem('newEmi');

    const doughnutCanvas = getElem('emiDoughnutChart');
    let loanDoughnutChart;
    const amortizationChartCanvas = getElem('amortizationLineChart');
    let amortizationLineChart;

    const toggleDetailsBtn = getElem('toggleAmortizationBtn');
    const detailsTableContainer = getElem('amortizationTableContainer');

    // Share Modal Elements
    const shareReportBtn = getElem('shareReportBtn');
    const shareModal = getElem('shareModal');
    const closeModalBtn = getElem('closeModalBtn');
    const modalReportContent = getElem('modalReportContent');
    const shareUrlInput = getElem('shareUrlInput');
    const copyUrlBtn = getElem('copyUrlBtn');
    const printReportBtn = getElem('printReportBtn');
    const downloadCsvBtn = getElem('downloadCsvBtn');

    let currentAmortizationData = [];
    let isHomeLoanActive = false;

    // --- Core Calculation Logic ---
    function calculateEMI(p, r, n) {
        if (r <= 0) return p / n;
        if (n <= 0) return p;
        return p * r * (Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
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

        isValid &= validateInput('loanAmountInput', 50000, 20000000, 'loanAmountError');
        isValid &= validateInput('interestRateInput', 1, 20, 'interestRateError');
        isValid &= validateInput('loanTenureInput', 1, 30, 'loanTenureError');

        const isFloatingRate = rateTypeToggle.checked;
        if (isFloatingRate) {
            isValid &= validateInput('rateIncreaseInput', 0.25, 5, 'rateIncreaseError');
            isValid &= validateInput('increaseAfterInput', 1, 10, 'increaseAfterError');
        }

        const prepaymentAmount = parseFloat(prepaymentAmountInput.value) || 0;
        if (prepaymentAmount > 0) {
            isValid &= validateInput('prepaymentAmountInput', 0, 1000000, 'prepaymentAmountError');
            if (prepaymentFrequencySelect.value === '0') {
                 // Validate start month only if prepayment amount is > 0 and freq is 'One Time'
                 const totalMonths = (parseFloat(loanTenureInput.value) || 0) * 12;
                 const startMonth = parseInt(prepaymentStartInput.value);
                 const errorElem = getElem('prepaymentStartError');
                 if (isNaN(startMonth) || startMonth < 1 || startMonth > totalMonths) {
                    if (errorElem) {
                        errorElem.textContent = `Month must be between 1 and ${totalMonths}.`;
                        errorElem.classList.remove('hidden');
                    }
                    isValid = false;
                 } else {
                    errorElem?.classList.add('hidden');
                 }
            } else {
                 getElem('prepaymentStartError')?.classList.add('hidden'); // Hide start month error if not one-time
            }
        } else {
             // Hide errors if prepayment amount is 0
            getElem('prepaymentAmountError')?.classList.add('hidden');
            getElem('prepaymentStartError')?.classList.add('hidden');
        }


        if (!isValid) {
            // Display error state in results
            monthlyEmiElem.textContent = '-';
            principalAmountElem.textContent = '-';
            totalInterestElem.textContent = '-';
            totalPayableElem.textContent = '-';
            prepaymentResultSection.classList.add('hidden');
            newEmiSection.classList.add('hidden');
            taxBenefitSection.classList.add('hidden');
            updateDoughnutChart([1], ['Invalid Input'], ['#E5E7EB']);
            // Clear amortization table and chart if invalid
            detailsTableContainer.innerHTML = '<p class="text-center text-gray-500 text-xs">Enter valid inputs to see schedule.</p>';
            if (amortizationLineChart) {
                amortizationLineChart.data.labels = [];
                amortizationLineChart.data.datasets = [];
                amortizationLineChart.update();
            }
            return;
        }
        // --- End Validation ---


        const principal = parseFloat(loanAmountInput.value) || 0;
        const annualRate = parseFloat(interestRateInput.value) || 0;
        const years = parseFloat(loanTenureInput.value) || 0;
        // Prepayment values read again after validation
        const currentPrepaymentAmount = parseFloat(prepaymentAmountInput.value) || 0;
        const prepaymentFrequency = parseInt(prepaymentFrequencySelect.value, 10);
        const oneTimeStartMonth = parseInt(prepaymentStartInput.value, 10);
        // Floating rate values read again after validation
        const currentRateIncrease = isFloatingRate ? parseFloat(rateIncreaseInput.value) / 100 : 0;
        const increaseAfterYears = isFloatingRate ? parseInt(increaseAfterInput.value) : Infinity;


        let monthlyRate = annualRate / 12 / 100;
        const totalMonths = years * 12;

        prepaymentStartSlider.max = totalMonths;
        // No need to adjust input value here as validation already handles it
        updateSliderFill(prepaymentStartSlider);

        const initialEmi = calculateEMI(principal, monthlyRate, totalMonths);

        let originalLoanData = generateAmortizationData(principal, initialEmi, monthlyRate, totalMonths, 0, 0, 0, currentRateIncrease, increaseAfterYears);

        monthlyEmiElem.textContent = formatCurrency(initialEmi);
        principalAmountElem.textContent = formatCurrency(principal);
        totalInterestElem.textContent = formatCurrency(originalLoanData.totalInterest);
        totalPayableElem.textContent = formatCurrency(principal + originalLoanData.totalInterest);

        if (isFloatingRate && originalLoanData.newEmi > 0 && originalLoanData.newEmi !== initialEmi) {
            newEmiSection.classList.remove('hidden');
            newEmiElem.textContent = formatCurrency(originalLoanData.newEmi);
        } else {
            newEmiSection.classList.add('hidden');
        }

        updateDoughnutChart([principal, originalLoanData.totalInterest], ['Principal Amount', 'Total Interest'], ['#3B82F6', '#F87171']);

        let prepayLoanData = { amortization: [], totalInterest: 0, totalPrepaid: 0 };
        if (currentPrepaymentAmount > 0) {
            prepaymentResultSection.classList.remove('hidden');
            prepayLoanData = generateAmortizationData(principal, initialEmi, monthlyRate, totalMonths, currentPrepaymentAmount, prepaymentFrequency, oneTimeStartMonth, currentRateIncrease, increaseAfterYears);

            const interestSaved = originalLoanData.totalInterest - prepayLoanData.totalInterest;
            const tenureReducedMonths = originalLoanData.amortization.length - prepayLoanData.amortization.length;

            interestSavedElem.textContent = formatCurrency(interestSaved);
            tenureReducedElem.textContent = `${Math.floor(tenureReducedMonths / 12)} yrs ${tenureReducedMonths % 12} mos`;
            totalPrepaidAmountElem.textContent = formatCurrency(prepayLoanData.totalPrepaid);

            const today = new Date();
             // Ensure amortization length is valid before calculating date
             if (prepayLoanData.amortization.length > 0) {
                const newEndDate = new Date(new Date().setMonth(today.getMonth() + prepayLoanData.amortization.length));
                newEndDateElem.textContent = newEndDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
             } else {
                 newEndDateElem.textContent = '-'; // Handle case where loan is paid off instantly (unlikely but possible)
             }
        } else {
            prepaymentResultSection.classList.add('hidden');
        }

        currentAmortizationData = currentPrepaymentAmount > 0 ? prepayLoanData.amortization : originalLoanData.amortization;
        generateAmortizationTable(currentAmortizationData);
        generateAmortizationChart(originalLoanData.amortization, prepayLoanData.amortization);

        if(isHomeLoanActive) {
            taxBenefitSection.classList.remove('hidden');
            calculateTaxBenefits(originalLoanData.amortization);
        } else {
            taxBenefitSection.classList.add('hidden');
        }
    }


    // --- Other functions remain unchanged ---
    function generateAmortizationData(principal, emi, initialMonthlyRate, totalMonths, prepayment, prepFrequency, oneTimeStart, rateIncrease, increaseAfterYears) {
        let amortization = [];
        let balance = principal;
        let totalInterest = 0;
        let totalPrepaid = 0;
        let monthlyRate = initialMonthlyRate;
        let currentEmi = emi;
        let newEmi = 0; // Track if EMI changes

        for (let i = 1; i <= totalMonths; i++) {
            if (balance <= 0) break;

            // Check if rate increases (only once)
            if (i > increaseAfterYears * 12 && rateIncrease > 0 && newEmi === 0) {
                 // Calculate new annual rate based on the *initial* rate + increase
                 const initialAnnualRate = parseFloat(interestRateInput.value) || 0; // Read initial rate again
                 const newAnnualRate = initialAnnualRate + (rateIncrease * 100);
                 console.log("Rate Increase Triggered:", { i, increaseAfterYears, initialAnnualRate, rateIncrease, newAnnualRate }); // Debug
                 monthlyRate = newAnnualRate / 12 / 100;

                 // Recalculate EMI based on remaining balance and tenure
                 const remainingMonths = totalMonths - (i - 1);
                 // Only recalculate if remainingMonths is positive
                 const recalculatedEmi = remainingMonths > 0 ? calculateEMI(balance, monthlyRate, remainingMonths) : balance; // If last month, EMI is remaining balance + interest
                 console.log("Recalculated EMI:", { balance, monthlyRate, remainingMonths, recalculatedEmi }); // Debug

                 // Only update if the new EMI is meaningfully different (handle floating point issues)
                 if (Math.abs(recalculatedEmi - currentEmi) > 0.01) {
                    newEmi = recalculatedEmi;
                    currentEmi = recalculatedEmi;
                 } else {
                      newEmi = currentEmi; // Keep track that recalculation happened but didn't change EMI much
                 }
            }


            const interest = balance * monthlyRate;
            let principalPaid = currentEmi - interest;

             // Ensure principal paid doesn't exceed balance
             // Also handles the final payment correctly
             if (principalPaid >= balance || Math.abs(balance - principalPaid) < 0.01) {
                principalPaid = balance;
                currentEmi = balance + interest; // Final EMI is just balance + interest for that month
            }


            let currentPrepayment = 0;
            // Calculate prepayment only if balance > 0 after principal payment
            if (balance - principalPaid > 0) {
                if (prepayment > 0) {
                    if (prepFrequency > 0 && i % prepFrequency === 0) { // Recurring prepayment
                        currentPrepayment = Math.min(balance - principalPaid, prepayment);
                    } else if (prepFrequency === 0 && i === oneTimeStart) { // One-time prepayment
                        currentPrepayment = Math.min(balance - principalPaid, prepayment);
                    }
                }
            }


            balance -= (principalPaid + currentPrepayment);
            // Ensure balance doesn't go negative due to rounding
            if (balance < 0.01) balance = 0;

            totalInterest += interest;
            totalPrepaid += currentPrepayment;

            amortization.push({
                month: i,
                principalPaid: principalPaid,
                interest: interest,
                prepayment: currentPrepayment,
                balance: balance,
            });

             // Break loop early if balance is cleared
             if (balance <= 0) break;
        }
        // Return the potentially changed EMI
        return { amortization, totalInterest, totalPrepaid, newEmi };
    }

    function calculateTaxBenefits(amortizationData) {
        const taxSlab = parseFloat(taxSlabSelect.value);

        const firstYearData = amortizationData.slice(0, 12);
        const principalPaidInFirstYear = firstYearData.reduce((acc, row) => acc + row.principalPaid, 0);
        const interestPaidInFirstYear = firstYearData.reduce((acc, row) => acc + row.interest, 0);

        const principalDeduction = Math.min(principalPaidInFirstYear, 150000); // Max 1.5L u/s 80C
        const interestDeduction = Math.min(interestPaidInFirstYear, 200000); // Max 2L u/s 24b

        const principalSaving = principalDeduction * taxSlab;
        const interestSaving = interestDeduction * taxSlab;
        const totalSaving = principalSaving + interestSaving;

        principalTaxSavingElem.textContent = formatCurrency(principalSaving);
        interestTaxSavingElem.textContent = formatCurrency(interestSaving);
        totalTaxSavingElem.textContent = formatCurrency(totalSaving);
    }

    function generateAmortizationTable(amortizationData) {
        let tableHTML = `
            <h3 class="text-center text-sm font-bold text-gray-800 mb-2">Amortization Schedule</h3>
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-2 py-1 text-left text-xxs font-medium text-gray-500 uppercase">Month</th>
                        <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase">Principal</th>
                        <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase">Interest</th>
                        <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase">Prepayment</th>
                        <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase">Balance</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 text-xs">`;

        amortizationData.forEach(row => {
            tableHTML += `<tr class="${row.prepayment > 0 ? 'prepayment-row' : ''}">
                <td class="px-2 py-1">${row.month}</td>
                <td class="px-2 py-1 text-right">${formatCurrency(row.principalPaid)}</td>
                <td class="px-2 py-1 text-right">${formatCurrency(row.interest)}</td>
                <td class="px-2 py-1 text-right font-semibold">${formatCurrency(row.prepayment)}</td>
                <td class="px-2 py-1 text-right font-bold">${formatCurrency(row.balance)}</td>
            </tr>`;
        });

        tableHTML += `</tbody></table>`;
        detailsTableContainer.innerHTML = tableHTML;
    }

    function generateAmortizationChart(originalData, prepayData) {
        const labels = originalData.map(d => d.month);
        const originalBalance = originalData.map(d => d.balance);

        const datasets = [{
            label: 'Original Loan Balance',
            data: originalBalance,
            borderColor: '#F87171',
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            fill: true,
            pointRadius: 0,
            tension: 0.1
        }];

        if (prepayData && prepayData.length > 0) {
            // Need to map prepay data balance to the original month labels
            const prepayBalanceMapped = labels.map(month => {
                const dataPoint = prepayData.find(d => d.month === month);
                // Continue showing 0 balance after loan ends
                return dataPoint ? dataPoint.balance : (prepayData.length > 0 && month > prepayData[prepayData.length-1].month ? 0 : null);
            }).filter(val => val !== null); // Filter out potential nulls if original loan is shorter? (Shouldn't happen here)

             // Ensure the prepay data aligns correctly with the original labels
             const prepayBalancePadded = labels.map(month => {
                const dataPoint = prepayData.find(d => d.month === month);
                if (dataPoint) {
                    return dataPoint.balance;
                } else if (prepayData.length > 0 && month > prepayData[prepayData.length - 1].month && prepayData[prepayData.length - 1].balance <= 0) {
                    // If the loan finished in prepayData, fill subsequent months with 0
                    return 0;
                } else {
                    // If the month is beyond the original loan or before prepay starts matching, use null
                    return null; // Chart.js handles nulls by breaking the line
                }
             });

            datasets.push({
                label: 'Balance with Prepayment',
                data: prepayBalancePadded, // Use the padded/mapped data
                borderColor: '#4ADE80',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                fill: true,
                pointRadius: 0,
                tension: 0.1,
                spanGaps: false // Don't connect points across nulls
            });
        }

        const chartData = { labels, datasets };
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
                        title: (context) => `Month: ${context[0].label}`
                    }
                }
            },
            scales: {
                y: { ticks: { callback: (value) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value), font:{size: 8} } }, // Squeezed ticks
                x: { ticks: { maxTicksLimit: 10, font: {size: 8} } } // Squeezed ticks
            }
        };

        if (amortizationLineChart) {
            amortizationLineChart.data = chartData;
            amortizationLineChart.update();
        } else {
            amortizationLineChart = new Chart(amortizationChartCanvas.getContext('2d'), { type: 'line', data: chartData, options: chartOptions });
        }
    }


    function updateDoughnutChart(data, labels, colors) {
      const chartData = { labels: labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 4, borderRadius: 3, spacing: 1 }] };
      const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: '50%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` } } } };
      if (loanDoughnutChart) { loanDoughnutChart.data = chartData; loanDoughnutChart.update(); } else { loanDoughnutChart = new Chart(doughnutCanvas.getContext('2d'), { type: 'doughnut', data: chartData, options: chartOptions }); }
    }

    function loadSeoContent() {
        const contentArea = getElem('dynamic-content-area-emi');
        if (contentArea) {
            fetch('emi-calculator-seo-content.html')
                .then(response => response.ok ? response.text() : Promise.reject('File not found'))
                .then(html => contentArea.innerHTML = html)
                .catch(error => console.error('Error loading EMI SEO content:', error));
        }
    }

    function populateAndShowModal() {
        // ... (rest of the function remains the same) ...
        const loanAmount = parseFloat(loanAmountInput.value);
        const interestRate = parseFloat(interestRateInput.value);
        const loanTenure = parseFloat(loanTenureInput.value);
        const emiText = monthlyEmiElem.textContent;
        const totalPaymentText = totalPayableElem.textContent;
        const totalInterestText = totalInterestElem.textContent;

        const emi = emiText ? parseFloat(emiText.replace(/[^0-9.]/g, '')) : 0;
        const totalPayment = totalPaymentText ? parseFloat(totalPaymentText.replace(/[^0-9.]/g, '')) : 0;
        const totalInterest = totalInterestText ? parseFloat(totalInterestText.replace(/[^0-9.]/g, '')) : 0;

        modalReportContent.innerHTML = `
            <h3>Your Loan Summary</h3>
            <ul>
                <li><span>Loan Amount:</span> <span>${formatCurrency(loanAmount)}</span></li>
                <li><span>Interest Rate:</span> <span>${interestRate}% p.a.</span></li>
                <li><span>Loan Tenure:</span> <span>${loanTenure} Years</span></li>
                <li style="font-size: 1rem; font-weight: bold; margin-top: 0.5rem; border-top: 1px solid #e5e7eb; padding-top: 0.5rem;">
                    <span>Monthly EMI:</span> <span>${formatCurrency(emi)}</span>
                </li>
                <li><span>Total Interest Payable:</span> <span>${formatCurrency(totalInterest)}</span></li>
                <li><span>Total Payment:</span> <span>${formatCurrency(totalPayment)}</span></li>
            </ul>
        `;

        const params = new URLSearchParams();
        params.set('amount', loanAmount);
        params.set('rate', interestRate);
        params.set('tenure', loanTenure);

        const prepaymentAmountVal = parseFloat(prepaymentAmountInput.value);
        if (prepaymentAmountVal > 0) {
            params.set('prepay', prepaymentAmountVal);
            params.set('prepayFreq', prepaymentFrequencySelect.value);
             if (prepaymentFrequencySelect.value === '0') {
                 params.set('prepayStart', prepaymentStartInput.value);
            }
        }
        // Add floating rate params if applicable
        if (rateTypeToggle.checked) {
             params.set('float', 'true');
             params.set('rateInc', rateIncreaseInput.value);
             params.set('incAfter', increaseAfterInput.value);
        }

        shareUrlInput.value = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

        shareModal.classList.remove('hidden');
    }

    function loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('amount')) {
            loanAmountInput.value = params.get('amount') || 2000000;
            interestRateInput.value = params.get('rate') || 8.5;
            loanTenureInput.value = params.get('tenure') || 10;

            if (params.has('prepay')) {
                prepaymentAmountInput.value = params.get('prepay') || 0;
                prepaymentFrequencySelect.value = params.get('prepayFreq') || '0';
                 oneTimePrepaymentStartDiv.style.display = prepaymentFrequencySelect.value === '0' ? 'block' : 'none';
                if (params.get('prepayFreq') === '0') {
                    prepaymentStartInput.value = params.get('prepayStart') || 12;
                }
            }
            // Load floating rate params
            if (params.get('float') === 'true') {
                 rateTypeToggle.checked = true;
                 floatingRateSection.classList.remove('hidden');
                 rateIncreaseInput.value = params.get('rateInc') || 1;
                 increaseAfterInput.value = params.get('incAfter') || 3;
            } else {
                 rateTypeToggle.checked = false;
                 floatingRateSection.classList.add('hidden');
            }


            // Sync all sliders to their input values after loading from URL
            document.querySelectorAll('input[type="range"]').forEach(slider => {
                const input = getElem(slider.id.replace('Slider', 'Input'));
                if (input && slider) { // Added slider check
                    slider.value = input.value;
                }
            });
        }
    }


    function downloadAmortizationCSV() {
        if (currentAmortizationData.length === 0) {
            if (typeof showNotification === 'function') {
                showNotification('No data available to download.');
            }
            return;
        }

        const headers = ["Month", "Principal Paid", "Interest Paid", "Prepayment", "Outstanding Balance"];
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

        currentAmortizationData.forEach(row => {
            const rowData = [
                row.month,
                Math.round(row.principalPaid),
                Math.round(row.interest),
                Math.round(row.prepayment),
                Math.round(row.balance)
            ].join(",");
            csvContent += rowData + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "amortization_schedule.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (typeof showNotification === 'function') {
            showNotification('CSV download started!');
        }
    }

    function setupEventListeners() {
        const debouncedUpdate = debounce(updateCalculator, 250);

      // Use the new sync function for all slider/input pairs, passing button IDs
      syncSliderAndInput({ sliderId: 'loanAmountSlider', inputId: 'loanAmountInput', decrementId: 'loanAmountDecrement', incrementId: 'loanAmountIncrement', updateCallback: debouncedUpdate });
      syncSliderAndInput({ sliderId: 'interestRateSlider', inputId: 'interestRateInput', decrementId: 'interestRateDecrement', incrementId: 'interestRateIncrement', updateCallback: debouncedUpdate });
      syncSliderAndInput({ sliderId: 'loanTenureSlider', inputId: 'loanTenureInput', decrementId: 'loanTenureDecrement', incrementId: 'loanTenureIncrement', updateCallback: debouncedUpdate });
      syncSliderAndInput({ sliderId: 'prepaymentAmountSlider', inputId: 'prepaymentAmountInput', decrementId: 'prepaymentAmountDecrement', incrementId: 'prepaymentAmountIncrement', updateCallback: debouncedUpdate });
      syncSliderAndInput({ sliderId: 'prepaymentStartSlider', inputId: 'prepaymentStartInput', decrementId: 'prepaymentStartDecrement', incrementId: 'prepaymentStartIncrement', updateCallback: debouncedUpdate });
      syncSliderAndInput({ sliderId: 'rateIncreaseSlider', inputId: 'rateIncreaseInput', decrementId: 'rateIncreaseDecrement', incrementId: 'rateIncreaseIncrement', updateCallback: debouncedUpdate });
      syncSliderAndInput({ sliderId: 'increaseAfterSlider', inputId: 'increaseAfterInput', decrementId: 'increaseAfterDecrement', incrementId: 'increaseAfterIncrement', updateCallback: debouncedUpdate });

        // ... rest of event listeners remain the same ...
      homeLoanPreset.addEventListener('click', () => setPreset('home'));
      carLoanPreset.addEventListener('click', () => setPreset('car'));
      personalLoanPreset.addEventListener('click', () => setPreset('personal'));

      rateTypeToggle.addEventListener('change', () => {
          floatingRateSection.classList.toggle('hidden', !rateTypeToggle.checked);
          updateCalculator();
      });

      prepaymentFrequencySelect.addEventListener('change', () => {
          oneTimePrepaymentStartDiv.style.display = prepaymentFrequencySelect.value === '0' ? 'block' : 'none';
          updateCalculator();
      });

      toggleDetailsBtn.addEventListener('click', () => {
          detailsTableContainer.classList.toggle('hidden');
          toggleDetailsBtn.textContent = detailsTableContainer.classList.contains('hidden') ? 'Show Amortization Schedule' : 'Hide Schedule';
      });

      if(shareReportBtn) shareReportBtn.addEventListener('click', populateAndShowModal);
      if(closeModalBtn) closeModalBtn.addEventListener('click', () => shareModal.classList.add('hidden'));
      window.addEventListener('click', (event) => { if (event.target == shareModal) shareModal.classList.add('hidden'); });
      if(copyUrlBtn) copyUrlBtn.addEventListener('click', () => {
          shareUrlInput.select();
          // Use execCommand for broader compatibility
          try {
            document.execCommand('copy');
             if (typeof showNotification === 'function') { showNotification('Link copied to clipboard!'); }
          } catch (err) {
              console.error('Fallback copy failed', err);
              if (typeof showNotification === 'function') { showNotification('Could not copy link.'); }
          }
      });
      if(printReportBtn) printReportBtn.addEventListener('click', () => {
         const modalContent = getElem('modalReportContent');
         const printArea = document.createElement('div');
         printArea.classList.add('print-area'); // Class for print styles
         printArea.innerHTML = modalContent.innerHTML;
         document.body.appendChild(printArea);
         window.print();
         document.body.removeChild(printArea);
      });
      if(downloadCsvBtn) downloadCsvBtn.addEventListener('click', downloadAmortizationCSV);

      taxSlabSelect.addEventListener('change', () => {
        if(isHomeLoanActive) {
            // Recalculate benefits only if data exists
            if (currentAmortizationData && currentAmortizationData.length > 0) {
                 calculateTaxBenefits(currentAmortizationData);
            }
        }
      });
    }


    function setPreset(loanType) {
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        let activeBtn;
        isHomeLoanActive = (loanType === 'home');

        if (loanType === 'home') {
            loanAmountInput.value = 5000000;
            interestRateInput.value = 8.5;
            loanTenureInput.value = 20;
            activeBtn = homeLoanPreset;
        } else if (loanType === 'car') {
            loanAmountInput.value = 800000;
            interestRateInput.value = 9.5;
            loanTenureInput.value = 7;
            activeBtn = carLoanPreset;
        } else if (loanType === 'personal') {
            loanAmountInput.value = 500000;
            interestRateInput.value = 14;
            loanTenureInput.value = 5;
            activeBtn = personalLoanPreset;
        }

        if (activeBtn) activeBtn.classList.add('active');

        // Reset prepayment and floating rate to defaults when preset is clicked
        rateTypeToggle.checked = false;
        floatingRateSection.classList.add('hidden');
        rateIncreaseInput.value = 1; // Default
        increaseAfterInput.value = 3; // Default
        prepaymentAmountInput.value = 0;
        prepaymentFrequencySelect.value = '0'; // Default to One Time
        oneTimePrepaymentStartDiv.style.display = 'block'; // Show start month for One Time
        prepaymentStartInput.value = 12; // Default start month


        // After setting input values, sync all sliders AND recalculate
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const input = getElem(slider.id.replace('Slider', 'Input'));
            if(input && slider) { // Added slider check
                slider.value = input.value;
                updateSliderFill(slider);
            }
        });
        updateCalculator(); // Trigger calculation after applying preset and resetting options
    }

    // --- Initial Run ---
    setupEventListeners();
    oneTimePrepaymentStartDiv.style.display = 'block'; // Show by default
    loadFromUrl(); // Load potentially overriding defaults

    // If no URL params loaded, set a default preset
    if (!window.location.search) {
        setPreset('home');
    } else {
        // Ensure sliders are filled and calculator runs if loaded from URL
        document.querySelectorAll('.range-slider').forEach(slider => {
             if (slider) updateSliderFill(slider); // Added check for slider existence
        });
        updateCalculator(); // Calculate based on loaded URL params
    }

    loadSeoContent();
}
