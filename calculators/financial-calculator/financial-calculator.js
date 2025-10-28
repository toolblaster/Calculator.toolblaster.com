// --- Import utility functions ---
// Explicitly import functions from utils.js
import { formatCurrency, debounce, updateSliderFill, syncSliderAndInput } from '../../assets/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Add a check specifically for the calculator container *and* a key input element
    // to ensure this script only runs on the main calculator page.
    if (document.querySelector('.calculator-container') && document.getElementById('sipAmountInput')) {
        console.log("Initializing All-in-One Calculator..."); // Debug log
        initializeCalculator();
    } else {
        console.log("All-in-One Calculator elements not found, skipping initialization."); // Debug log
    }
});

function initializeCalculator() {
    'use strict';
    // --- Debug log ---
    console.log("initializeCalculator function called.");

    const getElem = (id) => document.getElementById(id);

    // --- Element Variables ---
    // ... (keep all existing element variable declarations) ...
    const sipModeBtn = getElem('sipModeBtn');
    const lumpsumModeBtn = getElem('lumpsumModeBtn');
    const swpModeBtn = getElem('swpModeBtn');
    const rdModeBtn = getElem('rdModeBtn');
    const fdModeBtn = getElem('fdModeBtn');
    const goalModeBtn = getElem('goalModeBtn');

    const sipSection = getElem('sipSection');
    const lumpsumSection = getElem('lumpsumSection');
    const rdSection = getElem('rdSection');
    const fdSection = getElem('fdSection');
    const swpSection = getElem('swpSection');
    const goalSection = getElem('goalSection');
    const generalInputsSection = getElem('generalInputsSection');
    const taxSection = getElem('taxSection');

    const sipAmountInput = getElem('sipAmountInput');
    const sipFrequencySelect = getElem('sipFrequency');
    const sipIncreaseRateInput = getElem('sipIncreaseRateInput');
    const lumpsumAmountInput = getElem('lumpsumAmountInput');
    const rdAmountInput = getElem('rdAmountInput');
    const rdFrequencySelect = getElem('rdFrequency');
    const rdIncreaseRateInput = getElem('rdIncreaseRateInput');
    const fdAmountInput = getElem('fdAmountInput');
    const initialCorpusInput = getElem('initialCorpusInput');
    const withdrawalAmountInput = getElem('withdrawalAmountInput');
    const withdrawalFrequencySelect = getElem('withdrawalFrequency');
    const withdrawalIncreaseInput = getElem('withdrawalIncreaseInput');
    const withdrawalIncreaseTypeToggle = getElem('withdrawalIncreaseTypeToggle');
    const withdrawalIncreaseLabel = getElem('withdrawalIncreaseLabel');

    const targetAmountInput = getElem('targetAmountInput');
    const goalReturnRateInput = getElem('goalReturnRateInput');
    const goalPeriodInput = getElem('goalPeriodInput');
    const returnRateInput = getElem('returnRateInput');
    const investmentPeriodInput = getElem('investmentPeriodInput');
    const inflationToggle = getElem('inflationToggle');
    const inflationInputGroup = getElem('inflationInputGroup');
    const inflationRateInput = getElem('inflationRateInput');
    const taxToggle = getElem('taxToggle');
    const taxInputGroup = getElem('taxInputGroup');
    const taxSlabSelect = getElem('taxSlabSelect');

    const sipIncreaseTypeToggle = getElem('sipIncreaseTypeToggle');
    const sipIncreaseLabel = getElem('sipIncreaseLabel');
    const rdIncreaseTypeToggle = getElem('rdIncreaseTypeToggle');
    const rdIncreaseLabel = getElem('rdIncreaseLabel');


    const errorMessages = {
      sipAmount: getElem('sipAmountError'), lumpsumAmount: getElem('lumpsumAmountError'),
      rdAmount: getElem('rdAmountError'), fdAmount: getElem('fdAmountError'),
      initialCorpus: getElem('initialCorpusError'), withdrawalAmount: getElem('withdrawalAmountError'),
      returnRate: getElem('returnRateError'), investmentPeriod: getElem('investmentPeriodError'),
      inflationRate: getElem('inflationRateError'),
      targetAmount: getElem('targetAmountError'), goalReturnRate: getElem('goalReturnRateError'), goalPeriod: getElem('goalPeriodError'),
      sipIncreaseRate: getElem('sipIncreaseRateError'), rdIncreaseRate: getElem('rdIncreaseRateError'), withdrawalIncrease: getElem('withdrawalIncreaseError') // Corrected ID
    };

    const calculatorTitle = getElem('calculatorTitle');
    const calculatorDescription = getElem('calculatorDescription');
    const periodLabel = getElem('periodLabel');
    const growthTableHeader = getElem('growthTableHeader');
    const tableHeaderInvested = getElem('tableHeaderInvested');

    const sipSummary = getElem('sipSummary');
    const investedAmountSIP = getElem('investedAmountSIP');
    const estimatedReturnsSIP = getElem('estimatedReturnsSIP');
    const totalValueSIP = getElem('totalValueSIP');
    const realValueSectionSIP = getElem('realValueSectionSIP');
    const realTotalValueSIP = getElem('realTotalValueSIP');
    const lumpsumSummary = getElem('lumpsumSummary');
    const investedAmountLumpsum = getElem('investedAmountLumpsum');
    const estimatedReturnsLumpsum = getElem('estimatedReturnsLumpsum');
    const totalValueLumpsum = getElem('totalValueLumpsum');
    const realValueSectionLumpsum = getElem('realValueSectionLumpsum');
    const rdSummary = getElem('rdSummary');
    const investedAmountRD = getElem('investedAmountRD');
    const estimatedReturnsRD = getElem('estimatedReturnsRD');
    const totalValueRD = getElem('totalValueRD');
    const postTaxSectionRD = getElem('postTaxSectionRD');
    const postTaxTotalValueRD = getElem('postTaxTotalValueRD');
    const realValueSectionRD = getElem('realValueSectionRD');
    const realTotalValueRD = getElem('realTotalValueRD');
    const fdSummary = getElem('fdSummary');
    const investedAmountFD = getElem('investedAmountFD');
    const estimatedReturnsFD = getElem('estimatedReturnsFD');
    const totalValueFD = getElem('totalValueFD');
    const postTaxSectionFD = getElem('postTaxSectionFD');
    const postTaxTotalValueFD = getElem('postTaxTotalValueFD');
    const realValueSectionFD = getElem('realValueSectionFD');
    const realTotalValueFD = getElem('realTotalValueFD');
    const swpSummary = getElem('swpSummary');
    const initialCorpusSWP = getElem('initialCorpusSWP');
    const totalWithdrawnSWP = getElem('totalWithdrawnSWP');
    const totalInterestSWP = getElem('totalInterestSWP');
    const remainingCorpusSWP = getElem('remainingCorpusSWP');
    const realValueSectionSWP = getElem('realValueSectionSWP');
    const realRemainingCorpusSWP = getElem('realRemainingCorpusSWP');
    const corpusExhaustedInfo = getElem('corpusExhaustedInfo');
    const exhaustionPeriodSWP = getElem('exhaustionPeriodSWP');
    const goalSummary = getElem('goalSummary');
    const targetAmountGoal = getElem('targetAmountGoal');
    const totalInvestmentGoal = getElem('totalInvestmentGoal');
    const expectedReturnsGoal = getElem('expectedReturnsGoal');
    const monthlyInvestmentGoal = getElem('monthlyInvestmentGoal');

    const growthTableContainer = getElem('growthTableContainer');
    const growthTableBody = getElem('growthTableBody');
    const toggleGrowthTableBtn = getElem('toggleGrowthTableBtn');
    const doughnutCanvas = getElem('investmentDoughnutChart');
    let investmentDoughnutChart;
    let doughnutCtx = null;
    if (doughnutCanvas) {
        doughnutCtx = doughnutCanvas.getContext('2d');
    } else {
        console.error("Doughnut chart canvas element not found!");
    }
    let currentMode = 'sip';


    // --- Core Calculation Logic ---

    function updateDoughnutChart(data, labels, colors) {
      if (!doughnutCtx) {
          console.error("Chart context (doughnutCtx) is not available.");
          return;
      }
      const chartData = { labels: labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 4, borderRadius: 3, spacing: 1 }] };
      const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: '50%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` }, bodyFont: { family: 'Inter', size: window.innerWidth < 640 ? 8 : 10 }, titleFont: { family: 'Inter', size: window.innerWidth < 640 ? 8 : 10 }, padding: window.innerWidth < 640 ? 4 : 6, cornerRadius: 4 } } };
      if (investmentDoughnutChart) { investmentDoughnutChart.data = chartData; investmentDoughnutChart.update(); }
      else { investmentDoughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: chartData, options: chartOptions }); }
    }

    function generateGrowthTable(data) {
      // --- ADDED: Check if growthTableBody exists ---
      if (!growthTableBody) {
          console.error("Growth table body element not found.");
          return;
      }
      // --- END ADDED ---
      growthTableBody.innerHTML = '';
      data.forEach(yearData => { const row = document.createElement('tr'); row.className = 'hover:bg-gray-100 transition-colors';

      if (currentMode === 'swp') {
          row.innerHTML = `<td class="px-2 py-1 whitespace-nowrap text-left">${yearData.year}</td>
                           <td class="px-2 py-1 whitespace-nowrap font-semibold text-blue-700 text-right">${formatCurrency(yearData.openingBalance)}</td>
                           <td class="px-2 py-1 whitespace-nowrap font-semibold text-green-700 text-right">${formatCurrency(yearData.interestEarned)}</td>
                           <td class="px-2 py-1 whitespace-nowrap font-semibold text-red-700 text-right">${formatCurrency(yearData.withdrawn)}</td>
                           <td class="px-2 py-1 whitespace-nowrap font-bold text-purple-700 text-right">${formatCurrency(yearData.closingBalance)}</td>`;
      } else {
          row.innerHTML = `<td class="px-2 py-1 whitespace-nowrap text-left">${yearData.year}</td>
                           <td class="px-2 py-1 whitespace-nowrap font-semibold text-blue-700 text-right">${formatCurrency(yearData.invested)}</td>
                           <td class="px-2 py-1 whitespace-nowrap font-semibold text-green-700 text-right">${formatCurrency(yearData.returns)}</td>
                           <td class="px-2 py-1 whitespace-nowrap font-bold text-purple-700 text-right">${formatCurrency(yearData.total)}</td>`;
      }
      growthTableBody.appendChild(row); });
    }

    function updateCalculator() {
        console.log("updateCalculator called. Current mode:", currentMode); // Debug log
        // --- Validation ---
        let isValid = true;
        const validateInput = (inputId, min, max, errorMessageElemId) => {
            const inputElem = getElem(inputId);
            const errorElem = errorMessages[errorMessageElemId.replace('Error', '')]; // Use errorMessages map

            // If input element doesn't exist (e.g., wrong ID), fail validation
            if (!inputElem) {
                console.error(`Validation Error: Input element with ID '${inputId}' not found.`);
                return false;
            }

            // If the element is hidden (due to mode change), consider it valid
            if (inputElem.offsetParent === null) {
                if (errorElem) errorElem.classList.add('hidden'); // Ensure error message is hidden
                return true;
            }

            const value = parseFloat(inputElem.value);
            if (isNaN(value) || value < min || value > max) {
                 console.warn(`Validation failed for ${inputId}: Value "${inputElem.value}" is not between ${min} and ${max}`); // Debug log
                if (errorElem) errorElem.classList.remove('hidden');
                return false;
            } else {
                if (errorElem) errorElem.classList.add('hidden');
                return true;
            }
        };

        // --- ADDED: Wrap validation checks in try...catch ---
        try {
            // Validate based on current mode
            if (currentMode === 'sip') {
                isValid &= validateInput('sipAmountInput', 500, 50000, 'sipAmountError');
                isValid &= validateInput('returnRateInput', 1, 30, 'returnRateError');
                isValid &= validateInput('investmentPeriodInput', 1, 40, 'investmentPeriodError');
                const isSipIncreaseAmount = sipIncreaseTypeToggle.checked;
                const sipIncreaseMax = isSipIncreaseAmount ? 5000 : 20;
                isValid &= validateInput('sipIncreaseRateInput', 0, sipIncreaseMax, 'sipIncreaseRateError');
            } else if (currentMode === 'lumpsum') {
                isValid &= validateInput('lumpsumAmountInput', 5000, 10000000, 'lumpsumAmountError');
                isValid &= validateInput('returnRateInput', 1, 30, 'returnRateError');
                isValid &= validateInput('investmentPeriodInput', 1, 40, 'investmentPeriodError');
            } else if (currentMode === 'rd') {
                isValid &= validateInput('rdAmountInput', 100, 50000, 'rdAmountError');
                isValid &= validateInput('returnRateInput', 1, 30, 'returnRateError');
                isValid &= validateInput('investmentPeriodInput', 1, 40, 'investmentPeriodError');
                const isRdIncreaseAmount = rdIncreaseTypeToggle.checked;
                const rdIncreaseMax = isRdIncreaseAmount ? 5000 : 20;
                isValid &= validateInput('rdIncreaseRateInput', 0, rdIncreaseMax, 'rdIncreaseRateError');
            } else if (currentMode === 'fd') {
                isValid &= validateInput('fdAmountInput', 1000, 10000000, 'fdAmountError');
                isValid &= validateInput('returnRateInput', 1, 30, 'returnRateError');
                isValid &= validateInput('investmentPeriodInput', 1, 40, 'investmentPeriodError');
            } else if (currentMode === 'swp') {
                isValid &= validateInput('initialCorpusInput', 100000, 50000000, 'initialCorpusError');
                isValid &= validateInput('withdrawalAmountInput', 1000, 100000, 'withdrawalAmountError');
                isValid &= validateInput('returnRateInput', 1, 30, 'returnRateError');
                isValid &= validateInput('investmentPeriodInput', 1, 40, 'investmentPeriodError');
                const isWithdrawalIncreaseAmount = withdrawalIncreaseTypeToggle.checked;
                const withdrawalIncreaseMax = isWithdrawalIncreaseAmount ? 5000 : 10;
                 // Use the correct error ID key
                isValid &= validateInput('withdrawalIncreaseInput', 0, withdrawalIncreaseMax, 'withdrawalIncreaseError');
            } else if (currentMode === 'goal') {
                isValid &= validateInput('targetAmountInput', 100000, 100000000, 'targetAmountError');
                isValid &= validateInput('goalReturnRateInput', 1, 30, 'goalReturnRateError');
                isValid &= validateInput('goalPeriodInput', 1, 40, 'goalPeriodError');
            }

            // Validate inflation if toggled on
            if (inflationToggle && inflationToggle.checked) {
                isValid &= validateInput('inflationRateInput', 0, 15, 'inflationRateError');
            }
        } catch (error) {
            console.error("Error during validation:", error);
            isValid = false; // Treat any error during validation as invalid input
        }
        // --- END ADDED ---

        if (!isValid) {
            console.warn("Form is invalid. Stopping calculation."); // Debug log
            updateDoughnutChart([1], ['Invalid Input'], ['#E5E7EB']); // Show gray chart
            // Clear summary fields
             [investedAmountSIP, estimatedReturnsSIP, totalValueSIP, realTotalValueSIP,
              investedAmountLumpsum, estimatedReturnsLumpsum, totalValueLumpsum, realTotalValueLumpsum,
              investedAmountRD, estimatedReturnsRD, totalValueRD, postTaxTotalValueRD, realTotalValueRD,
              investedAmountFD, estimatedReturnsFD, totalValueFD, postTaxTotalValueFD, realTotalValueFD,
              initialCorpusSWP, totalWithdrawnSWP, totalInterestSWP, remainingCorpusSWP, realRemainingCorpusSWP,
              targetAmountGoal, totalInvestmentGoal, expectedReturnsGoal, monthlyInvestmentGoal].forEach(el => { if(el) el.textContent = '-'; }); // Added null check
             if (growthTableBody) growthTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500 py-4">Enter valid inputs to see growth.</td></tr>';
            return;
        }
        // --- End Validation ---

        // --- ADDED: Wrap calculation logic in try...catch ---
        try {
            console.log("Inputs valid. Proceeding with calculation..."); // Debug log
            let yearlyGrowthData = [];

            // Ensure these inputs exist before parsing, provide defaults
            const annualReturnRateValue = (currentMode === 'goal' && goalReturnRateInput) ? goalReturnRateInput.value : (returnRateInput ? returnRateInput.value : '0');
            const investmentPeriodValue = (currentMode === 'goal' && goalPeriodInput) ? goalPeriodInput.value : (investmentPeriodInput ? investmentPeriodInput.value : '0');
            const inflationRateValue = (inflationToggle && inflationToggle.checked && inflationRateInput) ? inflationRateInput.value : '0';

            const annualReturnRate = parseFloat(annualReturnRateValue) / 100;
            const investmentPeriodYears = parseFloat(investmentPeriodValue);
            const annualInflationRate = parseFloat(inflationRateValue) / 100;

            // Null checks for UI elements updated within the calculation loop
            if (toggleGrowthTableBtn) toggleGrowthTableBtn.classList.toggle('hidden', currentMode === 'goal');
            if (tableHeaderInvested) tableHeaderInvested.textContent = (currentMode === 'fd' || currentMode === 'lumpsum') ? 'Principal' : 'Invested';


            if (currentMode === 'sip') {
              // ... (SIP calculation code - ensure all element accesses are checked or guarded) ...
              const sipAmount = parseFloat(sipAmountInput.value);
              const isIncreaseAmountMode = sipIncreaseTypeToggle.checked;
              const increaseValue = parseFloat(sipIncreaseRateInput.value);

              const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2 }[sipFrequencySelect.value];
              const periodicReturnRate = annualReturnRate / frequency;
              let currentSipAmount = sipAmount, investedAmount = 0, currentCorpus = 0;

              for (let year = 1; year <= investmentPeriodYears; year++) {
                let yearInvested = 0;
                for (let i = 0; i < frequency; i++) { yearInvested += currentSipAmount; currentCorpus = currentCorpus * (1 + periodicReturnRate) + currentSipAmount; }
                investedAmount += yearInvested;

                if (isIncreaseAmountMode) {
                  currentSipAmount += increaseValue;
                } else {
                  currentSipAmount *= (1 + (increaseValue / 100));
                }

                yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus });
              }
              if (investedAmountSIP) investedAmountSIP.textContent = formatCurrency(investedAmount);
              if (estimatedReturnsSIP) estimatedReturnsSIP.textContent = formatCurrency(currentCorpus - investedAmount);
              if (totalValueSIP) totalValueSIP.textContent = formatCurrency(currentCorpus);
              if (inflationToggle.checked && realTotalValueSIP && realValueSectionSIP) {
                const finalCorpusInTodayValue = currentCorpus / Math.pow(1 + annualInflationRate, investmentPeriodYears);
                realTotalValueSIP.textContent = formatCurrency(finalCorpusInTodayValue);
                realValueSectionSIP.classList.remove('hidden');
              } else if (realValueSectionSIP) { realValueSectionSIP.classList.add('hidden'); }
              updateDoughnutChart([investedAmount, Math.max(0, currentCorpus - investedAmount)], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
              generateGrowthTable(yearlyGrowthData);

            } else if (currentMode === 'lumpsum') {
              // ... (Lumpsum calculation code - ensure all element accesses are checked or guarded) ...
               const investedAmount = parseFloat(lumpsumAmountInput.value);
                const totalValue = investedAmount * Math.pow(1 + annualReturnRate, investmentPeriodYears);
                const estimatedReturns = totalValue - investedAmount;
                if (investedAmountLumpsum) investedAmountLumpsum.textContent = formatCurrency(investedAmount);
                if (estimatedReturnsLumpsum) estimatedReturnsLumpsum.textContent = formatCurrency(estimatedReturns);
                if (totalValueLumpsum) totalValueLumpsum.textContent = formatCurrency(totalValue);
                if (inflationToggle.checked && realTotalValueLumpsum && realValueSectionLumpsum) {
                  const realReturnRate = ((1 + annualReturnRate) / (1 + annualInflationRate)) - 1;
                  const realTotalValue = investedAmount * Math.pow(1 + realReturnRate, investmentPeriodYears);
                  realTotalValueLumpsum.textContent = formatCurrency(realTotalValue);
                  realValueSectionLumpsum.classList.remove('hidden');
                } else if (realValueSectionLumpsum) { realValueSectionLumpsum.classList.add('hidden'); }
                updateDoughnutChart([investedAmount, Math.max(0, estimatedReturns)], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
                let currentCorpus = investedAmount;
                for (let year = 1; year <= investmentPeriodYears; year++) { currentCorpus *= (1 + annualReturnRate); yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus }); }
                generateGrowthTable(yearlyGrowthData);

            } else if (currentMode === 'rd') {
               // ... (RD calculation code - ensure all element accesses are checked or guarded) ...
                const rdAmount = parseFloat(rdAmountInput.value);
                const isIncreaseAmountMode = rdIncreaseTypeToggle.checked;
                const increaseValue = parseFloat(rdIncreaseRateInput.value);

                const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2 }[rdFrequencySelect.value];
                const periodicReturnRate = annualReturnRate / frequency;
                let currentRdAmount = rdAmount, investedAmount = 0, currentCorpus = 0;

                for (let year = 1; year <= investmentPeriodYears; year++) {
                  let yearInvested = 0;
                  for (let i = 0; i < frequency; i++) { yearInvested += currentRdAmount; currentCorpus = currentCorpus * (1 + periodicReturnRate) + currentRdAmount; }
                  investedAmount += yearInvested;

                  if (isIncreaseAmountMode) {
                      currentRdAmount += increaseValue;
                  } else {
                      currentRdAmount *= (1 + (increaseValue / 100));
                  }

                  yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus });
                }
                const estimatedReturns = currentCorpus - investedAmount;
                if (investedAmountRD) investedAmountRD.textContent = formatCurrency(investedAmount);
                if (estimatedReturnsRD) estimatedReturnsRD.textContent = formatCurrency(estimatedReturns);
                if (totalValueRD) totalValueRD.textContent = formatCurrency(currentCorpus);

                let finalCorpusRD = currentCorpus;

                if (taxToggle.checked && postTaxTotalValueRD && postTaxSectionRD) {
                    const taxRate = parseFloat(taxSlabSelect.value);
                    const taxPayable = estimatedReturns * taxRate;
                    const postTaxReturns = estimatedReturns - taxPayable;
                    const postTaxTotal = investedAmount + postTaxReturns;
                    postTaxTotalValueRD.textContent = formatCurrency(postTaxTotal);
                    postTaxSectionRD.classList.remove('hidden');
                    finalCorpusRD = postTaxTotal;
                } else if (postTaxSectionRD) {
                    postTaxSectionRD.classList.add('hidden');
                }

                if (inflationToggle.checked && realTotalValueRD && realValueSectionRD) {
                  const finalCorpusInTodayValue = finalCorpusRD / Math.pow(1 + annualInflationRate, investmentPeriodYears);
                  realTotalValueRD.textContent = formatCurrency(finalCorpusInTodayValue);
                  realValueSectionRD.classList.remove('hidden');
                } else if (realValueSectionRD) { realValueSectionRD.classList.add('hidden'); }
                updateDoughnutChart([investedAmount, Math.max(0, estimatedReturns)], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
                generateGrowthTable(yearlyGrowthData);

            } else if (currentMode === 'fd') {
               // ... (FD calculation code - ensure all element accesses are checked or guarded) ...
                const investedAmount = parseFloat(fdAmountInput.value);
                const totalValue = investedAmount * Math.pow(1 + annualReturnRate, investmentPeriodYears);
                const estimatedReturns = totalValue - investedAmount;
                 if (investedAmountFD) investedAmountFD.textContent = formatCurrency(investedAmount);
                if (estimatedReturnsFD) estimatedReturnsFD.textContent = formatCurrency(estimatedReturns);
                if (totalValueFD) totalValueFD.textContent = formatCurrency(totalValue);

                let finalCorpusFD = totalValue;

                if (taxToggle.checked && postTaxTotalValueFD && postTaxSectionFD) {
                    const taxRate = parseFloat(taxSlabSelect.value);
                    const taxPayable = estimatedReturns * taxRate;
                    const postTaxReturns = estimatedReturns - taxPayable;
                    const postTaxTotal = investedAmount + postTaxReturns;
                    postTaxTotalValueFD.textContent = formatCurrency(postTaxTotal);
                    postTaxSectionFD.classList.remove('hidden');
                    finalCorpusFD = postTaxTotal;
                } else if (postTaxSectionFD) {
                    postTaxSectionFD.classList.add('hidden');
                }

                if (inflationToggle.checked && realTotalValueFD && realValueSectionFD) {
                  const realTotalValue = finalCorpusFD / Math.pow(1 + annualInflationRate, investmentPeriodYears);
                  realTotalValueFD.textContent = formatCurrency(realTotalValue);
                  realValueSectionFD.classList.remove('hidden');
                } else if (realValueSectionFD) { realValueSectionFD.classList.add('hidden'); }
                updateDoughnutChart([investedAmount, Math.max(0, estimatedReturns)], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
                let currentCorpus = investedAmount;
                for (let year = 1; year <= investmentPeriodYears; year++) { currentCorpus *= (1 + annualReturnRate); yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus }); }
                generateGrowthTable(yearlyGrowthData);

            } else if (currentMode === 'swp') {
              // ... (SWP calculation code - ensure all element accesses are checked or guarded) ...
                let corpus = parseFloat(initialCorpusInput.value);
                const initialCorpus = corpus;
                const initialWithdrawalAmount = parseFloat(withdrawalAmountInput.value);
                const isIncreaseAmountMode = withdrawalIncreaseTypeToggle.checked;
                const increaseValue = parseFloat(withdrawalIncreaseInput.value);

                const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2, yearly: 1 }[withdrawalFrequencySelect.value];
                const periodicReturnRate = annualReturnRate / 12;

                let totalWithdrawn = 0;
                let totalInterest = 0;
                let exhaustionYear = 0;
                let currentWithdrawalAmountPerPeriod = initialWithdrawalAmount * (12 / frequency);

                for (let year = 1; year <= investmentPeriodYears; year++) {
                    let yearOpeningBalance = corpus;
                    let yearInterest = 0;
                    let yearWithdrawn = 0;

                    for (let period = 1; period <= frequency; period++) {
                        const monthsInPeriod = 12 / frequency;
                        for (let m = 0; m < monthsInPeriod; m++) {
                             if (corpus <= 0) break;
                             const interestThisMonth = corpus * periodicReturnRate;
                             yearInterest += interestThisMonth;
                             corpus += interestThisMonth;
                        }
                         if (corpus <= 0) break;

                        const withdrawalThisPeriod = Math.min(corpus, currentWithdrawalAmountPerPeriod);
                        corpus -= withdrawalThisPeriod;
                        yearWithdrawn += withdrawalThisPeriod;
                    }


                    totalWithdrawn += yearWithdrawn;
                    totalInterest += yearInterest;

                     yearlyGrowthData.push({ year: year, openingBalance: yearOpeningBalance, interestEarned: yearInterest, withdrawn: yearWithdrawn, closingBalance: corpus });

                    if (corpus <= 0 && exhaustionYear === 0) {
                        exhaustionYear = year;
                    }

                    if (isIncreaseAmountMode) {
                         currentWithdrawalAmountPerPeriod += increaseValue / frequency;
                    } else {
                        currentWithdrawalAmountPerPeriod *= (1 + (increaseValue / 100));
                    }
                }

                if (initialCorpusSWP) initialCorpusSWP.textContent = formatCurrency(initialCorpus);
                if (totalWithdrawnSWP) totalWithdrawnSWP.textContent = formatCurrency(totalWithdrawn);
                if (totalInterestSWP) totalInterestSWP.textContent = formatCurrency(totalInterest);
                if (remainingCorpusSWP) remainingCorpusSWP.textContent = formatCurrency(corpus);

                 if (corpusExhaustedInfo) corpusExhaustedInfo.classList.toggle('hidden', exhaustionYear === 0 || corpus > 0);
                 if (exhaustionYear > 0 && corpus <= 0 && exhaustionPeriodSWP) {
                     exhaustionPeriodSWP.textContent = `${exhaustionYear} Yrs`;
                 }

                if (inflationToggle.checked && realRemainingCorpusSWP && realValueSectionSWP) {
                  realRemainingCorpusSWP.textContent = formatCurrency(corpus / Math.pow(1 + annualInflationRate, investmentPeriodYears));
                  realValueSectionSWP.classList.remove('hidden');
                } else if (realValueSectionSWP) { realValueSectionSWP.classList.add('hidden'); }

                updateDoughnutChart([totalWithdrawn, Math.max(0, totalInterest), Math.max(0, corpus)], ['Withdrawn', 'Interest', 'Remaining'], ['#10B981', '#6366F1', '#EF4444']);
                generateGrowthTable(yearlyGrowthData);

            } else if (currentMode === 'goal') {
              // ... (Goal calculation code - ensure all element accesses are checked or guarded) ...
                let targetAmount = parseFloat(targetAmountInput.value);
                const annualRate = parseFloat(goalReturnRateInput.value) / 100;
                const years = parseFloat(goalPeriodInput.value);
                const months = years * 12;
                const monthlyRate = annualRate / 12;
                let monthlyInvestment;

                let inflatedTargetAmount = targetAmount;
                if (inflationToggle.checked && inflationRateInput) { // Added check for inflationRateInput
                    const inflationRate = parseFloat(inflationRateInput.value) / 100;
                    inflatedTargetAmount = targetAmount * Math.pow(1 + inflationRate, years);
                }

                if (monthlyRate === 0) {
                    monthlyInvestment = inflatedTargetAmount / months;
                } else {
                    monthlyInvestment = inflatedTargetAmount / ( ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate) );
                }

                const totalInvestment = monthlyInvestment * months;
                const expectedReturns = inflatedTargetAmount - totalInvestment;

                if (targetAmountGoal) targetAmountGoal.textContent = formatCurrency(inflatedTargetAmount);
                if (totalInvestmentGoal) totalInvestmentGoal.textContent = formatCurrency(totalInvestment);
                 if (expectedReturnsGoal) expectedReturnsGoal.textContent = formatCurrency(expectedReturns); // Ensure this element ID exists
                 if (monthlyInvestmentGoal) monthlyInvestmentGoal.textContent = formatCurrency(monthlyInvestment);

                updateDoughnutChart([Math.max(0, totalInvestment), Math.max(0, expectedReturns)], ['Total Investment', 'Expected Returns'], ['#22C55E', '#6366F1']);
            }
             console.log("Calculation complete."); // Debug log
        } catch (error) {
             console.error("Error during calculation:", error); // Debug log calculation errors
             updateDoughnutChart([1], ['Calculation Error'], ['#DC2626']); // Show red error chart
             // Optionally clear summary fields on calculation error
             [investedAmountSIP, estimatedReturnsSIP, totalValueSIP, realTotalValueSIP, /* ... other summary elements ... */ monthlyInvestmentGoal].forEach(el => { if(el) el.textContent = 'Error'; });
             if (growthTableBody) growthTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-red-600 py-4">Error during calculation. Please check inputs.</td></tr>';
        }
         // --- END ADDED ---
    }


    const debouncedUpdate = debounce(updateCalculator, 250);

    // --- Other functions (switchMode, handleShare, loadFromUrl, setupIncreaseToggle) remain unchanged ---
    function switchMode(newMode) {
      // ... (rest of switchMode function as before, ensuring null checks) ...
      console.log("Switching mode to:", newMode); // Debug log
      currentMode = newMode;
      [sipSection, lumpsumSection, rdSection, fdSection, swpSection, goalSection, sipSummary, lumpsumSummary, rdSummary, fdSummary, swpSummary, goalSummary].forEach(el => el?.classList.add('hidden'));

      generalInputsSection?.classList.toggle('hidden', newMode === 'goal');
      taxSection?.classList.toggle('hidden', !(newMode === 'rd' || newMode === 'fd'));

      const activeClasses = 'bg-blue-600 text-white shadow-md'.split(' ');
      const inactiveClasses = 'bg-gray-200 text-gray-700 hover:bg-gray-300'.split(' ');
      [sipModeBtn, lumpsumModeBtn, rdModeBtn, fdModeBtn, swpModeBtn, goalModeBtn].forEach(btn => {
           if (btn) {
               btn.classList.remove(...activeClasses, ...inactiveClasses);
               btn.classList.add(...(btn.id.startsWith(newMode) ? activeClasses : inactiveClasses));
           }
      });

      // Update titles and labels based on the new mode
      if (newMode === 'sip') { sipSection?.classList.remove('hidden'); sipSummary?.classList.remove('hidden'); calculatorTitle.textContent = 'SIP Calculator with Inflation'; calculatorDescription.textContent = 'Plan your investments with our advanced SIP Calculator. Also includes tools for RD, FD, SWP, Goal Planning.'; if(periodLabel) periodLabel.textContent = 'Investment Period (Years)'; }
      else if (newMode === 'lumpsum') { lumpsumSection?.classList.remove('hidden'); lumpsumSummary?.classList.remove('hidden'); calculatorTitle.textContent = 'Lumpsum Calculator'; calculatorDescription.textContent = 'Calculate the future value of your one-time investment.'; if(periodLabel) periodLabel.textContent = 'Investment Period (Years)'; }
      else if (newMode === 'rd') { rdSection?.classList.remove('hidden'); rdSummary?.classList.remove('hidden'); calculatorTitle.textContent = 'RD Calculator'; calculatorDescription.textContent = 'Calculate the maturity amount of your Recurring Deposit.'; if(periodLabel) periodLabel.textContent = 'Investment Period (Years)'; }
      else if (newMode === 'fd') { fdSection?.classList.remove('hidden'); fdSummary?.classList.remove('hidden'); calculatorTitle.textContent = 'FD Calculator'; calculatorDescription.textContent = 'Calculate the maturity amount of your Fixed Deposit.'; if(periodLabel) periodLabel.textContent = 'Investment Period (Years)'; }
      else if (newMode === 'swp') {
          swpSection?.classList.remove('hidden');
          swpSummary?.classList.remove('hidden');
          calculatorTitle.textContent = 'SWP Calculator';
          calculatorDescription.textContent = 'Plan post-retirement income with a Systematic Withdrawal Plan.';
           if(periodLabel) periodLabel.textContent = 'Withdrawal Period (Years)';
           if (growthTableHeader) {
               growthTableHeader.innerHTML = `<tr>
                  <th class="px-2 py-1 text-left text-xxs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase tracking-wider">Opening Balance</th>
                  <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase tracking-wider">Interest Earned</th>
                  <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase tracking-wider">Withdrawn</th>
                  <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase tracking-wider">Closing Balance</th>
              </tr>`;
          }
      }
      else if (newMode === 'goal') { goalSection?.classList.remove('hidden'); goalSummary?.classList.remove('hidden'); calculatorTitle.textContent = 'Goal Planner'; calculatorDescription.textContent = 'Calculate the monthly investment needed to reach your financial goal.'; }

      if (newMode !== 'swp' && growthTableHeader) {
          growthTableHeader.innerHTML = `<tr>
              <th class="px-2 py-1 text-left text-xxs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase tracking-wider" id="tableHeaderInvested">Invested</th>
              <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
              <th class="px-2 py-1 text-right text-xxs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
          </tr>`;
      }


      if (sipIncreaseTypeToggle) {
        sipIncreaseTypeToggle.checked = false;
        sipIncreaseTypeToggle.dispatchEvent(new Event('change'));
      }
      if (rdIncreaseTypeToggle) {
        rdIncreaseTypeToggle.checked = false;
        rdIncreaseTypeToggle.dispatchEvent(new Event('change'));
      }
      if (withdrawalIncreaseTypeToggle) {
        withdrawalIncreaseTypeToggle.checked = false;
        withdrawalIncreaseTypeToggle.dispatchEvent(new Event('change'));
      }


      updateCalculator(); // Recalculate for the new mode
    }

    const handleShare = () => {
        // ... (handleShare function remains the same) ...
        const params = new URLSearchParams();
        params.set('mode', currentMode);

        if (currentMode === 'sip') {
            params.set('amount', sipAmountInput.value);
            params.set('increase', sipIncreaseRateInput.value);
            params.set('increaseType', sipIncreaseTypeToggle.checked ? 'amount' : 'percent');
            params.set('rate', returnRateInput.value);
            params.set('period', investmentPeriodInput.value);
        } else if (currentMode === 'lumpsum') {
            params.set('amount', lumpsumAmountInput.value);
            params.set('rate', returnRateInput.value);
            params.set('period', investmentPeriodInput.value);
        } else if (currentMode === 'goal') {
            params.set('target', targetAmountInput.value);
            params.set('rate', goalReturnRateInput.value);
            params.set('period', goalPeriodInput.value);
        } else if (currentMode === 'rd' || currentMode === 'fd') {
            const amount = currentMode === 'rd' ? rdAmountInput.value : fdAmountInput.value;
            params.set('amount', amount);
            params.set('rate', returnRateInput.value);
            params.set('period', investmentPeriodInput.value);
            if (taxToggle.checked) {
                params.set('tax', 'true');
                params.set('taxSlab', taxSlabSelect.value);
            }
        } else if (currentMode === 'swp') {
            params.set('corpus', initialCorpusInput.value);
            params.set('withdrawal', withdrawalAmountInput.value);
            params.set('increase', withdrawalIncreaseInput.value);
            params.set('increaseType', withdrawalIncreaseTypeToggle.checked ? 'amount' : 'percent');
            params.set('rate', returnRateInput.value);
            params.set('period', investmentPeriodInput.value);
        }

        if (inflationToggle.checked) {
            params.set('inflation', inflationRateInput.value);
        }

        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

        if (navigator.share) {
            navigator.share({
                title: 'Financial Calculator Plan',
                text: 'Check out my investment plan!',
                url: shareUrl,
            }).catch(err => {
                console.error("Share failed:", err.message);
                showNotification('Could not share report.');
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
                showNotification('Link copied to clipboard!');
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                showNotification('Could not copy link.');
            }
            document.body.removeChild(textArea);
        }
    };

    function loadFromUrl() {
        // ... (loadFromUrl function remains the same, ensuring null checks) ...
         console.log("Loading from URL..."); // Debug log
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');

        if (mode) {
             console.log("Mode found in URL:", mode); // Debug log
            // switchMode will trigger updateCalculator
            switchMode(mode);

            // Set values based on mode AFTER switching
            if (mode === 'sip') {
                if (sipAmountInput) sipAmountInput.value = params.get('amount') || 10000;
                if (params.get('increaseType') === 'amount' && sipIncreaseTypeToggle) {
                    sipIncreaseTypeToggle.checked = true;
                    // Note: switchMode already triggers the 'change' event for toggles
                }
                if (sipIncreaseRateInput) sipIncreaseRateInput.value = params.get('increase') || 0;
                if (returnRateInput) returnRateInput.value = params.get('rate') || 12;
                if (investmentPeriodInput) investmentPeriodInput.value = params.get('period') || 10;
            } else if (mode === 'lumpsum') {
                if (lumpsumAmountInput) lumpsumAmountInput.value = params.get('amount') || 500000;
                if (returnRateInput) returnRateInput.value = params.get('rate') || 10;
                if (investmentPeriodInput) investmentPeriodInput.value = params.get('period') || 10;
            } else if (mode === 'goal') {
                if (targetAmountInput) targetAmountInput.value = params.get('target') || 5000000;
                if (goalReturnRateInput) goalReturnRateInput.value = params.get('rate') || 12;
                if (goalPeriodInput) goalPeriodInput.value = params.get('period') || 10;
            } else if (mode === 'rd' || mode === 'fd') {
                const amountInputEl = mode === 'rd' ? rdAmountInput : fdAmountInput;
                if (amountInputEl) amountInputEl.value = params.get('amount') || (mode === 'rd' ? 5000 : 100000);
                if (returnRateInput) returnRateInput.value = params.get('rate') || 7;
                if (investmentPeriodInput) investmentPeriodInput.value = params.get('period') || 5;
                 if(params.get('tax') === 'true' && taxToggle && taxInputGroup && taxSlabSelect) {
                    taxToggle.checked = true;
                     taxInputGroup.classList.remove('hidden'); // Ensure section is visible
                    taxSlabSelect.value = params.get('taxSlab') || '0.3';
                 } else if (taxToggle) {
                     taxToggle.checked = false; // Ensure unchecked if param not present
                 }
                 // RD specific increase rate
                 if (mode === 'rd' && rdIncreaseRateInput) {
                     if (params.get('increaseType') === 'amount' && rdIncreaseTypeToggle) {
                         rdIncreaseTypeToggle.checked = true;
                     }
                     rdIncreaseRateInput.value = params.get('increase') || 0;
                 }

            } else if (mode === 'swp') {
                if (initialCorpusInput) initialCorpusInput.value = params.get('corpus') || 2000000;
                if (withdrawalAmountInput) withdrawalAmountInput.value = params.get('withdrawal') || 20000;
                if (params.get('increaseType') === 'amount' && withdrawalIncreaseTypeToggle) {
                    withdrawalIncreaseTypeToggle.checked = true;
                }
                if (withdrawalIncreaseInput) withdrawalIncreaseInput.value = params.get('increase') || 0;
                if (returnRateInput) returnRateInput.value = params.get('rate') || 8;
                if (investmentPeriodInput) investmentPeriodInput.value = params.get('period') || 20;
            }

             // Handle inflation toggle universally
             if (params.has('inflation') && inflationToggle && inflationRateInput && inflationInputGroup) {
                 inflationToggle.checked = true;
                 inflationRateInput.value = params.get('inflation');
                 inflationInputGroup.classList.remove('hidden'); // Ensure section is visible
             } else if (inflationToggle && inflationInputGroup) {
                  inflationToggle.checked = false; // Ensure unchecked if param not present
                  inflationInputGroup.classList.add('hidden'); // Ensure section is hidden
             }

             // Re-trigger change events AFTER setting values to ensure UI consistency
             if (sipIncreaseTypeToggle) sipIncreaseTypeToggle.dispatchEvent(new Event('change'));
             if (rdIncreaseTypeToggle) rdIncreaseTypeToggle.dispatchEvent(new Event('change'));
             if (withdrawalIncreaseTypeToggle) withdrawalIncreaseTypeToggle.dispatchEvent(new Event('change'));
             if (inflationToggle) inflationToggle.dispatchEvent(new Event('change'));
             if (taxToggle) taxToggle.dispatchEvent(new Event('change'));


            // Sync all sliders after setting input values
            document.querySelectorAll('input[type="range"]').forEach(slider => {
                const input = getElem(slider.id.replace('Slider', 'Input'));
                if (input && slider) {
                   // Ensure slider value doesn't exceed its max, clamp if necessary
                   const maxVal = parseFloat(slider.max);
                   const inputVal = parseFloat(input.value);
                   if (!isNaN(inputVal) && !isNaN(maxVal)) {
                       slider.value = Math.min(inputVal, maxVal);
                   } else {
                       slider.value = input.value; // Fallback if parsing fails
                   }
                   updateSliderFill(slider);
                }
            });

             console.log("Values loaded from URL."); // Debug log
            // updateCalculator(); // Calculation is triggered by switchMode and toggle changes
        } else {
            console.log("No mode found in URL, defaulting."); // Debug log
        }
    };


    function setupIncreaseToggle(toggle, label, slider, input) {
        // ... (setupIncreaseToggle function remains the same, ensuring null checks) ...
        if (!toggle || !label || !slider || !input) {
            console.warn("Missing elements for increase toggle setup:", toggle, label, slider, input); // Debug log
            return;
        }

        toggle.addEventListener('change', () => {
             console.log("Increase toggle changed for:", label.id); // Debug log
            const isAmountMode = toggle.checked;
            let currentValue = parseFloat(input.value) || 0;

            let labelTextPrefix = '';
            let maxAmount = 5000;
            let maxPercent = 20;
            let stepAmount = 100;
            let stepPercent = 1;
            let errorElemId = '';

            if (label.id.includes('sip')) { labelTextPrefix = 'Annual Increase'; errorElemId = 'sipIncreaseRateError'; }
            else if (label.id.includes('rd')) { labelTextPrefix = 'Annual Increase'; errorElemId = 'rdIncreaseRateError'; }
            else if (label.id.includes('withdrawal')) { labelTextPrefix = 'Annual Withdrawal Increase'; maxPercent = 10; errorElemId = 'withdrawalIncreaseError'; }

            const errorElem = getElem(errorElemId); // Use getElem for consistency

            if (isAmountMode) {
                label.textContent = `${labelTextPrefix} (₹)`;
                slider.min = 0; slider.max = maxAmount; slider.step = stepAmount;
                input.min = 0; input.max = maxAmount; input.step = stepAmount;
                 if (errorElem) errorElem.textContent = `Value must be between 0 and ${formatCurrency(maxAmount)}.`;
            } else {
                label.textContent = `${labelTextPrefix} (%)`;
                slider.min = 0; slider.max = maxPercent; slider.step = stepPercent;
                input.min = 0; input.max = maxPercent; input.step = stepPercent;
                 if (errorElem) errorElem.textContent = `Value must be between 0% and ${maxPercent}%.`;
            }

            if (currentValue > parseFloat(input.max)) { currentValue = 0; }

            slider.value = currentValue;
            input.value = currentValue;
            updateSliderFill(slider);
            // Don't call updateCalculator here, let the sync function handle it via debounce
            // updateCalculator();
        });
        // Trigger initial setup *without* calling updateCalculator directly
        const isAmountMode = toggle.checked;
        let labelTextPrefix = '';
        let maxAmount = 5000;
        let maxPercent = 20;
        let errorElemId = '';
         if (label.id.includes('sip')) { labelTextPrefix = 'Annual Increase'; errorElemId = 'sipIncreaseRateError'; }
         else if (label.id.includes('rd')) { labelTextPrefix = 'Annual Increase'; errorElemId = 'rdIncreaseRateError'; }
         else if (label.id.includes('withdrawal')) { labelTextPrefix = 'Annual Withdrawal Increase'; maxPercent = 10; errorElemId = 'withdrawalIncreaseError'; }
         const errorElem = getElem(errorElemId);
        if (isAmountMode) {
            label.textContent = `${labelTextPrefix} (₹)`;
             if (errorElem) errorElem.textContent = `Value must be between 0 and ${formatCurrency(maxAmount)}.`;
        } else {
            label.textContent = `${labelTextPrefix} (%)`;
             if (errorElem) errorElem.textContent = `Value must be between 0% and ${maxPercent}%.`;
        }

    }


    function setupEventListeners() {
        console.log("Setting up event listeners..."); // Debug log
        // Debounced update function
        const debouncedUpdate = debounce(() => {
             console.log("Debounced update triggered."); // Debug log
            updateCalculator();
        }, 300); // Increased debounce slightly

        // Define all input configurations
        const inputsConfig = [
            { sliderId: 'sipAmountSlider', inputId: 'sipAmountInput', decrementId: 'sipAmountDecrement', incrementId: 'sipAmountIncrement' },
            { sliderId: 'sipIncreaseRateSlider', inputId: 'sipIncreaseRateInput', decrementId: 'sipIncreaseRateDecrement', incrementId: 'sipIncreaseRateIncrement' },
            { sliderId: 'lumpsumAmountSlider', inputId: 'lumpsumAmountInput', decrementId: 'lumpsumAmountDecrement', incrementId: 'lumpsumAmountIncrement' },
            { sliderId: 'rdAmountSlider', inputId: 'rdAmountInput', decrementId: 'rdAmountDecrement', incrementId: 'rdAmountIncrement' },
            { sliderId: 'rdIncreaseRateSlider', inputId: 'rdIncreaseRateInput', decrementId: 'rdIncreaseRateDecrement', incrementId: 'rdIncreaseRateIncrement' },
            { sliderId: 'fdAmountSlider', inputId: 'fdAmountInput', decrementId: 'fdAmountDecrement', incrementId: 'fdAmountIncrement' },
            { sliderId: 'initialCorpusSlider', inputId: 'initialCorpusInput', decrementId: 'initialCorpusDecrement', incrementId: 'initialCorpusIncrement' },
            { sliderId: 'withdrawalAmountSlider', inputId: 'withdrawalAmountInput', decrementId: 'withdrawalAmountDecrement', incrementId: 'withdrawalAmountIncrement' },
            { sliderId: 'withdrawalIncreaseSlider', inputId: 'withdrawalIncreaseInput', decrementId: 'withdrawalIncreaseDecrement', incrementId: 'withdrawalIncreaseIncrement' },
            { sliderId: 'targetAmountSlider', inputId: 'targetAmountInput', decrementId: 'targetAmountDecrement', incrementId: 'targetAmountIncrement' },
            { sliderId: 'goalReturnRateSlider', inputId: 'goalReturnRateInput', decrementId: 'goalReturnRateDecrement', incrementId: 'goalReturnRateIncrement' },
            { sliderId: 'goalPeriodSlider', inputId: 'goalPeriodInput', decrementId: 'goalPeriodDecrement', incrementId: 'goalPeriodIncrement' },
            { sliderId: 'returnRateSlider', inputId: 'returnRateInput', decrementId: 'returnRateDecrement', incrementId: 'returnRateIncrement' },
            { sliderId: 'investmentPeriodSlider', inputId: 'investmentPeriodInput', decrementId: 'investmentPeriodDecrement', incrementId: 'investmentPeriodIncrement' },
            { sliderId: 'inflationRateSlider', inputId: 'inflationRateInput', decrementId: 'inflationRateDecrement', incrementId: 'inflationRateIncrement' }
        ];

        // Apply syncSliderAndInput to all defined configurations
        inputsConfig.forEach(config => {
            // --- ADDED: Check if all elements for a config exist before syncing ---
            const slider = getElem(config.sliderId);
            const input = getElem(config.inputId);
            const decBtn = config.decrementId ? getElem(config.decrementId) : true; // Treat as existing if ID not provided
            const incBtn = config.incrementId ? getElem(config.incrementId) : true; // Treat as existing if ID not provided

            if (slider && input && decBtn && incBtn) {
                 console.log("Syncing:", config.inputId); // Debug log
                syncSliderAndInput({ ...config, updateCallback: debouncedUpdate });
            } else {
                 console.warn("Skipping sync for:", config.inputId, " - Elements missing."); // Debug log missing elements
                 // Log which specific elements are missing
                 if (!slider) console.warn(` - Slider missing: ${config.sliderId}`);
                 if (!input) console.warn(` - Input missing: ${config.inputId}`);
                 if (!decBtn && config.decrementId) console.warn(` - Decrement button missing: ${config.decrementId}`);
                 if (!incBtn && config.incrementId) console.warn(` - Increment button missing: ${config.incrementId}`);
            }
            // --- END ADDED ---
        });

      // Event listeners for selects and toggles (update immediately)
      [sipFrequencySelect, rdFrequencySelect, withdrawalFrequencySelect, inflationToggle, taxToggle, taxSlabSelect].forEach(el => {
        if (el) {
          el.addEventListener('change', () => {
             console.log("Select/Toggle changed:", el.id); // Debug log
            if (el.id === 'inflationToggle') { inflationInputGroup?.classList.toggle('hidden', !inflationToggle.checked); }
            if (el.id === 'taxToggle') { taxInputGroup?.classList.toggle('hidden', !taxToggle.checked); }
            updateCalculator(); // Immediate update for these changes
          });
        }
      });

      // Mode switch buttons
      sipModeBtn?.addEventListener('click', () => switchMode('sip'));
      lumpsumModeBtn?.addEventListener('click', () => switchMode('lumpsum'));
      rdModeBtn?.addEventListener('click', () => switchMode('rd'));
      fdModeBtn?.addEventListener('click', () => switchMode('fd'));
      swpModeBtn?.addEventListener('click', () => switchMode('swp'));
      goalModeBtn?.addEventListener('click', () => switchMode('goal'));

      // Goal template buttons
        document.querySelectorAll('.goal-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                 console.log("Goal template button clicked."); // Debug log
                const goal = e.currentTarget.dataset.goal;
                document.querySelectorAll('.goal-template-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Sliders need corresponding Input IDs
                const targetAmountSliderEl = getElem('targetAmountSlider');
                const goalPeriodSliderEl = getElem('goalPeriodSlider');
                const goalReturnRateSliderEl = getElem('goalReturnRateSlider');

                if (goal === 'retirement') {
                    if(targetAmountSliderEl) targetAmountSliderEl.value = 10000000;
                    if(goalPeriodSliderEl) goalPeriodSliderEl.value = 25;
                    if(goalReturnRateSliderEl) goalReturnRateSliderEl.value = 12;
                } else if (goal === 'education') {
                    if(targetAmountSliderEl) targetAmountSliderEl.value = 2500000;
                    if(goalPeriodSliderEl) goalPeriodSliderEl.value = 15;
                    if(goalReturnRateSliderEl) goalReturnRateSliderEl.value = 11;
                } else if (goal === 'car') {
                    if(targetAmountSliderEl) targetAmountSliderEl.value = 1000000;
                    if(goalPeriodSliderEl) goalPeriodSliderEl.value = 5;
                    if(goalReturnRateSliderEl) goalReturnRateSliderEl.value = 9;
                } else if (goal === 'vacation') {
                    if(targetAmountSliderEl) targetAmountSliderEl.value = 300000;
                    if(goalPeriodSliderEl) goalPeriodSliderEl.value = 3;
                    if(goalReturnRateSliderEl) goalReturnRateSliderEl.value = 8;
                }

                // Update input fields and slider fills
                if(targetAmountInput && targetAmountSliderEl) targetAmountInput.value = targetAmountSliderEl.value;
                if(goalPeriodInput && goalPeriodSliderEl) goalPeriodInput.value = goalPeriodSliderEl.value;
                if(goalReturnRateInput && goalReturnRateSliderEl) goalReturnRateInput.value = goalReturnRateSliderEl.value;
                document.querySelectorAll('.range-slider').forEach(updateSliderFill);
                updateCalculator(); // Trigger recalculation
            });
        });

      // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            if (btn) btn.addEventListener('click', handleShare);
        });

      // Growth table toggle
      if (toggleGrowthTableBtn) {
          toggleGrowthTableBtn.addEventListener('click', () => {
              growthTableContainer?.classList.toggle('hidden');
              toggleGrowthTableBtn.textContent = growthTableContainer?.classList.contains('hidden') ? 'Show Yearly Growth' : 'Hide Yearly Growth';
          });
      }

      // Chart resize listener
      window.addEventListener('resize', debounce(() => { if(investmentDoughnutChart) investmentDoughnutChart.resize(); }, 250));

      // Setup increase toggles - pass only necessary elements
      setupIncreaseToggle(sipIncreaseTypeToggle, sipIncreaseLabel, getElem('sipIncreaseRateSlider'), sipIncreaseRateInput);
      setupIncreaseToggle(rdIncreaseTypeToggle, rdIncreaseLabel, getElem('rdIncreaseRateSlider'), rdIncreaseRateInput);
      setupIncreaseToggle(withdrawalIncreaseTypeToggle, withdrawalIncreaseLabel, getElem('withdrawalIncreaseSlider'), withdrawalIncreaseInput);

       console.log("Event listeners setup complete."); // Debug log
    }


    function loadSeoContent() {
         console.log("Attempting to load SEO content..."); // Debug log
        const contentArea = getElem('dynamic-content-area-main');
        if (contentArea) {
            fetch('calculators/financial-calculator/financial-calculator-seo-content.html')
                .then(response => {
                    if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
                    return response.text();
                })
                .then(html => {
                     console.log("SEO content fetched successfully."); // Debug log
                    contentArea.innerHTML = html;
                })
                .catch(error => console.error('Error loading main SEO content:', error));
        } else {
             console.error("SEO content area ('dynamic-content-area-main') not found!");
        }
    }

    // --- Initial Run ---
    // --- Wrap initialization in a try...catch block ---
    try {
        setupEventListeners();
        loadFromUrl(); // Load from URL first
        // Initial UI setup
        document.querySelectorAll('.range-slider').forEach(slider => {
             // Added check for slider existence
             if(slider) updateSliderFill(slider);
        });
        if(inflationToggle && inflationInputGroup) inflationInputGroup.classList.toggle('hidden', !inflationToggle.checked);
        if(taxToggle && taxInputGroup) taxInputGroup.classList.toggle('hidden', !taxToggle.checked);

        if (!window.location.search) {
             console.log("No URL params, setting default mode to SIP."); // Debug log
             switchMode('sip'); // Default to SIP if no params
        } else {
             // If loading from URL, updateCalculator was already called within loadFromUrl/switchMode
             console.log("Loaded from URL, initial calculation already triggered."); // Debug log
        }
        loadSeoContent();
         console.log("Initial setup complete."); // Debug log
    } catch (error) {
         console.error("Critical error during calculator initialization:", error); // Log critical errors
         // Optionally display an error message to the user on the page
         const calcContainer = getElem('calculator');
         if (calcContainer) {
             calcContainer.innerHTML = `<p class="text-center text-red-600 font-bold p-4">An error occurred loading the calculator. Please refresh the page.</p>`;
         }
    }
    // --- END Wrap ---
}
