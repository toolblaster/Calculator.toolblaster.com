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
        const principal = parseFloat(loanAmountInput.value) || 0;
        const annualRate = parseFloat(interestRateInput.value) || 0;
        const years = parseFloat(loanTenureInput.value) || 0;
        const prepaymentAmount = parseFloat(prepaymentAmountInput.value) || 0;
        const prepaymentFrequency = parseInt(prepaymentFrequencySelect.value, 10);
        const oneTimeStartMonth = parseInt(prepaymentStartInput.value, 10);
        const isFloatingRate = rateTypeToggle.checked;
        const rateIncrease = isFloatingRate ? parseFloat(rateIncreaseInput.value) / 100 : 0;
        const increaseAfterYears = isFloatingRate ? parseInt(increaseAfterInput.value) : Infinity;

        if (principal === 0 || annualRate === 0 || years === 0) return;

        let monthlyRate = annualRate / 12 / 100;
        const totalMonths = years * 12;
        
        prepaymentStartSlider.max = totalMonths;
        if (parseInt(prepaymentStartInput.value) > totalMonths) {
            prepaymentStartInput.value = totalMonths;
        }
        updateSliderFill(prepaymentStartSlider);

        const initialEmi = calculateEMI(principal, monthlyRate, totalMonths);
        
        let originalLoanData = generateAmortizationData(principal, initialEmi, monthlyRate, totalMonths, 0, 0, 0, rateIncrease, increaseAfterYears);
        
        monthlyEmiElem.textContent = formatCurrency(initialEmi);
        principalAmountElem.textContent = formatCurrency(principal);
        totalInterestElem.textContent = formatCurrency(originalLoanData.totalInterest);
        totalPayableElem.textContent = formatCurrency(principal + originalLoanData.totalInterest);

        if (isFloatingRate && originalLoanData.newEmi > 0) {
            newEmiSection.classList.remove('hidden');
            newEmiElem.textContent = formatCurrency(originalLoanData.newEmi);
        } else {
            newEmiSection.classList.add('hidden');
        }
        
        updateDoughnutChart([principal, originalLoanData.totalInterest], ['Principal Amount', 'Total Interest'], ['#3B82F6', '#F87171']);

        let prepayLoanData = { amortization: [], totalInterest: 0, totalPrepaid: 0 };
        if (prepaymentAmount > 0) {
            prepaymentResultSection.classList.remove('hidden');
            prepayLoanData = generateAmortizationData(principal, initialEmi, monthlyRate, totalMonths, prepaymentAmount, prepaymentFrequency, oneTimeStartMonth, rateIncrease, increaseAfterYears);
            
            const interestSaved = originalLoanData.totalInterest - prepayLoanData.totalInterest;
            const tenureReducedMonths = originalLoanData.amortization.length - prepayLoanData.amortization.length;

            interestSavedElem.textContent = formatCurrency(interestSaved);
            tenureReducedElem.textContent = `${Math.floor(tenureReducedMonths / 12)} yrs ${tenureReducedMonths % 12} mos`;
            totalPrepaidAmountElem.textContent = formatCurrency(prepayLoanData.totalPrepaid);

            const today = new Date();
            const newEndDate = new Date(new Date().setMonth(today.getMonth() + prepayLoanData.amortization.length));
            newEndDateElem.textContent = newEndDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        } else {
            prepaymentResultSection.classList.add('hidden');
        }
        
        currentAmortizationData = prepaymentAmount > 0 ? prepayLoanData.amortization : originalLoanData.amortization;
        generateAmortizationTable(currentAmortizationData);
        generateAmortizationChart(originalLoanData.amortization, prepayLoanData.amortization);

        if(isHomeLoanActive) {
            taxBenefitSection.classList.remove('hidden');
            calculateTaxBenefits(originalLoanData.amortization);
        } else {
            taxBenefitSection.classList.add('hidden');
        }
    }

    function generateAmortizationData(principal, emi, initialMonthlyRate, totalMonths, prepayment, prepFrequency, oneTimeStart, rateIncrease, increaseAfterYears) {
        let amortization = [];
        let balance = principal;
        let totalInterest = 0;
        let totalPrepaid = 0;
        let monthlyRate = initialMonthlyRate;
        let currentEmi = emi;
        let newEmi = 0;

        for (let i = 1; i <= totalMonths; i++) {
            if (balance <= 0) break;

            if (i > increaseAfterYears * 12 && rateIncrease > 0 && newEmi === 0) {
                const newAnnualRate = parseFloat(interestRateInput.value) + (rateIncrease * 100);
                monthlyRate = newAnnualRate / 12 / 100;
                
                const recalculatedEmi = calculateEMI(balance, monthlyRate, totalMonths - (i - 1));
                newEmi = recalculatedEmi;
                currentEmi = recalculatedEmi;
            }

            const interest = balance * monthlyRate;
            let principalPaid = currentEmi - interest;
            
            if ((principalPaid) > balance) {
                principalPaid = balance;
                currentEmi = balance + interest;
            }

            let currentPrepayment = 0;
            if (prepayment > 0) {
                if (prepFrequency > 0 && i % prepFrequency === 0) {
                    currentPrepayment = Math.min(balance - principalPaid, prepayment);
                } else if (prepFrequency === 0 && i === oneTimeStart) {
                    currentPrepayment = Math.min(balance - principalPaid, prepayment);
                }
            }
            
            balance -= (principalPaid + currentPrepayment);
            if (balance < 0) balance = 0;

            totalInterest += interest;
            totalPrepaid += currentPrepayment;
            
            amortization.push({
                month: i,
                principalPaid: principalPaid,
                interest: interest,
                prepayment: currentPrepayment,
                balance: balance,
            });
        }
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
            const prepayBalance = prepayData.map(d => d.balance);
            datasets.push({
                label: 'Balance with Prepayment',
                data: prepayBalance,
                borderColor: '#4ADE80',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                fill: true,
                pointRadius: 0,
                tension: 0.1
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
                y: { ticks: { callback: (value) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value) } },
                x: { ticks: { maxTicksLimit: 10 } }
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
        
        const prepaymentAmount = parseFloat(prepaymentAmountInput.value);
        if (prepaymentAmount > 0) {
            params.set('prepay', prepaymentAmount);
            params.set('prepayFreq', prepaymentFrequencySelect.value);
             if (prepaymentFrequencySelect.value === '0') {
                 params.set('prepayStart', prepaymentStartInput.value);
            }
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
            
            // Sync all sliders to their input values after loading from URL
            document.querySelectorAll('input[type="range"]').forEach(slider => {
                const input = getElem(slider.id.replace('Slider', 'Input'));
                if (input) {
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
      // Use the new sync function for all slider/input pairs
      syncSliderAndInput({ sliderId: 'loanAmountSlider', inputId: 'loanAmountInput', updateCallback: updateCalculator });
      syncSliderAndInput({ sliderId: 'interestRateSlider', inputId: 'interestRateInput', updateCallback: updateCalculator });
      syncSliderAndInput({ sliderId: 'loanTenureSlider', inputId: 'loanTenureInput', updateCallback: updateCalculator });
      syncSliderAndInput({ sliderId: 'prepaymentAmountSlider', inputId: 'prepaymentAmountInput', updateCallback: updateCalculator });
      syncSliderAndInput({ sliderId: 'prepaymentStartSlider', inputId: 'prepaymentStartInput', updateCallback: updateCalculator });
      syncSliderAndInput({ sliderId: 'rateIncreaseSlider', inputId: 'rateIncreaseInput', updateCallback: updateCalculator });
      syncSliderAndInput({ sliderId: 'increaseAfterSlider', inputId: 'increaseAfterInput', updateCallback: updateCalculator });
      
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
          document.execCommand('copy');
          if (typeof showNotification === 'function') {
            showNotification('Link copied to clipboard!');
          }
      });
      if(printReportBtn) printReportBtn.addEventListener('click', () => {
         const modalContent = getElem('modalReportContent');
         const printArea = document.createElement('div');
         printArea.classList.add('print-area');
         printArea.innerHTML = modalContent.innerHTML;
         document.body.appendChild(printArea);
         window.print();
         document.body.removeChild(printArea);
      });
      if(downloadCsvBtn) downloadCsvBtn.addEventListener('click', downloadAmortizationCSV);

      taxSlabSelect.addEventListener('change', () => {
        if(isHomeLoanActive) {
            calculateTaxBenefits(currentAmortizationData);
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

        // After setting input values, sync all sliders
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const input = getElem(slider.id.replace('Slider', 'Input'));
            if(input) {
                slider.value = input.value;
                updateSliderFill(slider);
            }
        });
        updateCalculator();
    }
    
    setupEventListeners();
    oneTimePrepaymentStartDiv.style.display = 'block';
    loadFromUrl();
    
    if (!window.location.search) {
        setPreset('home');
    } else {
        // Ensure sliders are filled and calculator runs if loaded from URL
        document.querySelectorAll('.range-slider').forEach(updateSliderFill);
        updateCalculator();
    }
    
    loadSeoContent();
}
