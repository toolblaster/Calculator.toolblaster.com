document.addEventListener('DOMContentLoaded', () => {
    const calculatorContainer = document.querySelector('.calculator-container');
    if (calculatorContainer) {
        initializeEmiCalculator();
    }
});

function initializeEmiCalculator() {
    'use strict';
    const getElem = (id) => document.getElementById(id);

    // --- Element Variables ---
    const loanAmountSlider = getElem('loanAmountSlider');
    const loanAmountInput = getElem('loanAmountInput');
    const interestRateSlider = getElem('interestRateSlider');
    const interestRateInput = getElem('interestRateInput');
    const loanTenureSlider = getElem('loanTenureSlider');
    const loanTenureInput = getElem('loanTenureInput');
    const prepaymentAmountSlider = getElem('prepaymentAmountSlider');
    const prepaymentAmountInput = getElem('prepaymentAmountInput');
    const prepaymentFrequencySelect = getElem('prepaymentFrequency');
    const oneTimePrepaymentStartDiv = getElem('oneTimePrepaymentStartDiv');
    const prepaymentStartSlider = getElem('prepaymentStartSlider');
    const prepaymentStartInput = getElem('prepaymentStartInput');


    // --- Result Elements ---
    const monthlyEmiElem = getElem('monthlyEmi');
    const principalAmountElem = getElem('principalAmount');
    const totalInterestElem = getElem('totalInterest');
    const totalPayableElem = getElem('totalPayment');
    const interestSavedElem = getElem('interestSaved');
    const tenureReducedElem = getElem('tenureReduced');
    const newEndDateElem = getElem('newEndDate');
    const totalPrepaidAmountElem = getElem('totalPrepaidAmount');
    const prepaymentResultSection = getElem('prepaymentResultSection');


    const doughnutCanvas = getElem('emiDoughnutChart');
    const doughnutCtx = doughnutCanvas.getContext('2d');
    let loanDoughnutChart;

    const toggleDetailsBtn = getElem('toggleAmortizationBtn');
    const detailsTableContainer = getElem('amortizationTableContainer');
    
    // --- Share Modal Elements ---
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

    function calculateEMI(p, r, n) {
        if (r <= 0) return p / n;
        const emi = p * r * (Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return emi;
    }

    function updateCalculator() {
        const principal = parseFloat(loanAmountInput.value) || 0;
        const annualRate = parseFloat(interestRateInput.value) || 0;
        const years = parseFloat(loanTenureInput.value) || 0;
        const prepaymentAmount = parseFloat(prepaymentAmountInput.value) || 0;
        const prepaymentFrequency = parseInt(prepaymentFrequencySelect.value, 10);
        const oneTimeStartMonth = parseInt(prepaymentStartInput.value, 10);

        if (principal === 0 || annualRate === 0 || years === 0) return;

        const monthlyRate = annualRate / 12 / 100;
        const totalMonths = years * 12;
        
        // Update max value for one-time prepayment slider
        prepaymentStartSlider.max = totalMonths;
        if (parseInt(prepaymentStartInput.value) > totalMonths) {
            prepaymentStartInput.value = totalMonths;
        }


        const emi = calculateEMI(principal, monthlyRate, totalMonths);
        const totalPayment = emi * totalMonths;
        const totalInterest = totalPayment - principal;

        monthlyEmiElem.textContent = formatCurrency(emi);
        principalAmountElem.textContent = formatCurrency(principal);
        totalInterestElem.textContent = formatCurrency(totalInterest);
        totalPayableElem.textContent = formatCurrency(totalPayment);

        updateDoughnutChart([principal, totalInterest], ['Principal Amount', 'Total Interest'], ['#3B82F6', '#F87171']);

        // --- Prepayment Calculation ---
        if (prepaymentAmount > 0) {
            prepaymentResultSection.classList.remove('hidden');
            let balance = principal;
            let monthsWithPrepayment = 0;
            let totalInterestWithPrepayment = 0;
            let totalPrepaid = 0;
            
            while (balance > 0) {
                monthsWithPrepayment++;
                let interestThisMonth = balance * monthlyRate;
                let principalPaid = emi - interestThisMonth;
                
                // Ensure principal paid doesn't exceed balance
                if (principalPaid > balance) {
                    principalPaid = balance;
                }
                
                balance -= principalPaid;
                totalInterestWithPrepayment += interestThisMonth;
                
                let currentPrepayment = 0;
                // Recurring prepayment
                if (prepaymentFrequency > 0 && monthsWithPrepayment % prepaymentFrequency === 0) {
                    currentPrepayment = Math.min(balance, prepaymentAmount);
                } 
                // One-time prepayment
                else if (prepaymentFrequency === 0 && monthsWithPrepayment === oneTimeStartMonth) {
                     currentPrepayment = Math.min(balance, prepaymentAmount);
                }

                balance -= currentPrepayment;
                totalPrepaid += currentPrepayment;

                if (balance < 0) balance = 0;
                if (monthsWithPrepayment > totalMonths * 2) break; // Safety break
            }
            
            const interestSaved = totalInterest - totalInterestWithPrepayment;
            const tenureReducedMonths = totalMonths - monthsWithPrepayment;

            interestSavedElem.textContent = formatCurrency(interestSaved);
            tenureReducedElem.textContent = `${Math.floor(tenureReducedMonths / 12)} yrs ${tenureReducedMonths % 12} mos`;
            totalPrepaidAmountElem.textContent = formatCurrency(totalPrepaid);

            const today = new Date();
            const newEndDate = new Date(today.setMonth(today.getMonth() + monthsWithPrepayment));
            newEndDateElem.textContent = newEndDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

        } else {
            prepaymentResultSection.classList.add('hidden');
        }
        
        generateAmortizationTable(principal, emi, monthlyRate, totalMonths, prepaymentAmount, prepaymentFrequency, oneTimeStartMonth);
    }

    function generateAmortizationTable(principal, emi, monthlyRate, totalMonths, prepayment, prepFrequency, oneTimeStart) {
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

        let balance = principal;
        for (let i = 1; i <= totalMonths; i++) {
            if (balance <= 0) break;
            const interest = balance * monthlyRate;
            let principalPaid = emi - interest;
            
            if ((principalPaid) > balance) {
                principalPaid = balance;
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
            
            tableHTML += `<tr>
                <td class="px-2 py-1">${i}</td>
                <td class="px-2 py-1 text-right">${formatCurrency(principalPaid)}</td>
                <td class="px-2 py-1 text-right">${formatCurrency(interest)}</td>
                <td class="px-2 py-1 text-right text-green-600 font-semibold">${formatCurrency(currentPrepayment)}</td>
                <td class="px-2 py-1 text-right font-bold">${formatCurrency(balance)}</td>
            </tr>`;
        }

        tableHTML += `</tbody></table>`;
        detailsTableContainer.innerHTML = tableHTML;
    }

    function updateDoughnutChart(data, labels, colors) {
      const chartData = { labels: labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 4, borderRadius: 3, spacing: 1 }] };
      const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: window.innerWidth < 640 ? '60%' : '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` } } } };
      if (loanDoughnutChart) { loanDoughnutChart.data = chartData; loanDoughnutChart.update(); } else { loanDoughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: chartData, options: chartOptions }); }
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
        // Gather data
        const loanAmount = parseFloat(loanAmountInput.value);
        const interestRate = parseFloat(interestRateInput.value);
        const loanTenure = parseFloat(loanTenureInput.value);
        const emiText = monthlyEmiElem.textContent;
        const totalPaymentText = totalPayableElem.textContent;
        const totalInterestText = totalInterestElem.textContent;

        const emi = emiText ? parseFloat(emiText.replace(/[^0-9.]/g, '')) : 0;
        const totalPayment = totalPaymentText ? parseFloat(totalPaymentText.replace(/[^0-9.]/g, '')) : 0;
        const totalInterest = totalInterestText ? parseFloat(totalInterestText.replace(/[^0-9.]/g, '')) : 0;

        // Populate modal content
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
        
        // Generate shareable URL
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
            
            // Sync sliders
            document.querySelectorAll('input[type="range"]').forEach(slider => {
                const input = getElem(slider.id.replace('Slider', 'Input'));
                if(input && slider) {
                    slider.value = input.value;
                }
            });
        }
    }


    function setupEventListeners() {
      const inputs = [
        { slider: loanAmountSlider, input: loanAmountInput },
        { slider: interestRateSlider, input: interestRateInput },
        { slider: loanTenureSlider, input: loanTenureInput },
        { slider: prepaymentAmountSlider, input: prepaymentAmountInput },
        { slider: prepaymentStartSlider, input: prepaymentStartInput },
      ];
      
      inputs.forEach(({ slider, input }) => {
        if (slider && input) {
          slider.addEventListener('input', () => { input.value = slider.value; updateSliderFill(slider); debouncedUpdate(); });
          input.addEventListener('input', () => { slider.value = input.value; updateSliderFill(slider); debouncedUpdate(); });
        }
      });
      
      prepaymentFrequencySelect.addEventListener('change', () => {
          oneTimePrepaymentStartDiv.style.display = prepaymentFrequencySelect.value === '0' ? 'block' : 'none';
          updateCalculator();
      });
      
      toggleDetailsBtn.addEventListener('click', () => {
          detailsTableContainer.classList.toggle('hidden');
          toggleDetailsBtn.textContent = detailsTableContainer.classList.contains('hidden') ? 'Show Amortization Schedule' : 'Hide Schedule';
      });

      // Modal event listeners
      if(shareReportBtn) shareReportBtn.addEventListener('click', populateAndShowModal);
      if(closeModalBtn) closeModalBtn.addEventListener('click', () => shareModal.classList.add('hidden'));
      window.addEventListener('click', (event) => { if (event.target == shareModal) shareModal.classList.add('hidden'); });
      if(copyUrlBtn) copyUrlBtn.addEventListener('click', () => {
          shareUrlInput.select();
          document.execCommand('copy');
          showNotification('Link copied to clipboard!');
      });
      if(printReportBtn) printReportBtn.addEventListener('click', () => {
         const modalContent = getElem('modalReportContent');
         modalContent.classList.add('print-area');
         window.print();
         modalContent.classList.remove('print-area');
      });
    }

    const debouncedUpdate = debounce(updateCalculator, 250);
    setupEventListeners();
    oneTimePrepaymentStartDiv.style.display = 'block'; // Show by default for "One Time"
    loadFromUrl(); // Load from URL first
    document.querySelectorAll('.range-slider').forEach(updateSliderFill);
    if (!window.location.search) {
        updateCalculator(); // Then do initial calculation if no params
    }
    loadSeoContent();
}
