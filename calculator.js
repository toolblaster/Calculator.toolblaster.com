document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.calculator-container')) {
        initializeCalculator();
    }
});

function initializeCalculator() {
    'use strict';
    const getElem = (id) => document.getElementById(id);

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

    const sipAmountSlider = getElem('sipAmountSlider');
    const sipAmountInput = getElem('sipAmountInput');
    const sipFrequencySelect = getElem('sipFrequency');
    const sipIncreaseRateSlider = getElem('sipIncreaseRateSlider');
    const sipIncreaseRateInput = getElem('sipIncreaseRateInput');
    const lumpsumAmountSlider = getElem('lumpsumAmountSlider');
    const lumpsumAmountInput = getElem('lumpsumAmountInput');
    const rdAmountSlider = getElem('rdAmountSlider');
    const rdAmountInput = getElem('rdAmountInput');
    const rdFrequencySelect = getElem('rdFrequency');
    const rdIncreaseRateSlider = getElem('rdIncreaseRateSlider');
    const rdIncreaseRateInput = getElem('rdIncreaseRateInput');
    const fdAmountSlider = getElem('fdAmountSlider');
    const fdAmountInput = getElem('fdAmountInput');
    const initialCorpusSlider = getElem('initialCorpusSlider');
    const initialCorpusInput = getElem('initialCorpusInput');
    const withdrawalAmountSlider = getElem('withdrawalAmountSlider');
    const withdrawalAmountInput = getElem('withdrawalAmountInput');
    const withdrawalFrequencySelect = getElem('withdrawalFrequency');
    const targetAmountSlider = getElem('targetAmountSlider');
    const targetAmountInput = getElem('targetAmountInput');
    const goalReturnRateSlider = getElem('goalReturnRateSlider');
    const goalReturnRateInput = getElem('goalReturnRateInput');
    const goalPeriodSlider = getElem('goalPeriodSlider');
    const goalPeriodInput = getElem('goalPeriodInput');
    const returnRateSlider = getElem('returnRateSlider');
    const returnRateInput = getElem('returnRateInput');
    const investmentPeriodSlider = getElem('investmentPeriodSlider');
    const investmentPeriodInput = getElem('investmentPeriodInput');
    const inflationToggle = getElem('inflationToggle');
    const inflationInputGroup = getElem('inflationInputGroup');
    const inflationRateSlider = getElem('inflationRateSlider');
    const inflationRateInput = getElem('inflationRateInput');

    const errorMessages = {
      sipAmount: getElem('sipAmountError'), lumpsumAmount: getElem('lumpsumAmountError'),
      rdAmount: getElem('rdAmountError'), fdAmount: getElem('fdAmountError'),
      initialCorpus: getElem('initialCorpusError'), withdrawalAmount: getElem('withdrawalAmountError'),
      returnRate: getElem('returnRateError'), investmentPeriod: getElem('investmentPeriodError'),
      inflationRate: getElem('inflationRateError'),
      targetAmount: getElem('targetAmountError'), goalReturnRate: getElem('goalReturnRateError'), goalPeriod: getElem('goalPeriodError')
    };

    const calculatorTitle = getElem('calculatorTitle');
    const calculatorDescription = getElem('calculatorDescription');
    const periodLabel = getElem('periodLabel');
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
    const realTotalValueLumpsum = getElem('realTotalValueLumpsum');
    const rdSummary = getElem('rdSummary');
    const investedAmountRD = getElem('investedAmountRD');
    const estimatedReturnsRD = getElem('estimatedReturnsRD');
    const totalValueRD = getElem('totalValueRD');
    const realValueSectionRD = getElem('realValueSectionRD');
    const realTotalValueRD = getElem('realTotalValueRD');
    const fdSummary = getElem('fdSummary');
    const investedAmountFD = getElem('investedAmountFD');
    const estimatedReturnsFD = getElem('estimatedReturnsFD');
    const totalValueFD = getElem('totalValueFD');
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
    const doughnutCtx = doughnutCanvas.getContext('2d');
    let investmentDoughnutChart;
    let currentMode = 'sip';

    const debounce = (func, delay) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; };
    const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(num));
    const updateSliderFill = (slider) => { if (!slider) return; const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100; slider.style.setProperty('--fill-percentage', `${percentage}%`); };
    const validateSlider = (slider, errorElement) => { if (!slider || !errorElement) return true; const value = parseFloat(slider.value); const min = parseFloat(slider.min); const max = parseFloat(slider.max); const isValid = !isNaN(value) && value >= min && value <= max; errorElement.classList.toggle('hidden', isValid); return isValid; };

    function updateDoughnutChart(data, labels, colors) {
      const chartData = { labels: labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 4, borderRadius: 3, spacing: 1 }] };
      const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: window.innerWidth < 640 ? '60%' : '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` }, bodyFont: { family: 'Inter', size: window.innerWidth < 640 ? 8 : 10 }, titleFont: { family: 'Inter', size: window.innerWidth < 640 ? 8 : 10 }, padding: window.innerWidth < 640 ? 4 : 6, cornerRadius: 4 } } };
      if (investmentDoughnutChart) { investmentDoughnutChart.data = chartData; investmentDoughnutChart.update(); } else { investmentDoughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: chartData, options: chartOptions }); }
    }

    function generateGrowthTable(data) {
      growthTableBody.innerHTML = '';
      data.forEach(yearData => { const row = document.createElement('tr'); row.className = 'hover:bg-gray-100 transition-colors'; row.innerHTML = `<td class="px-2 py-1 whitespace-nowrap">${yearData.year}</td><td class="px-2 py-1 whitespace-nowrap font-semibold text-blue-700">${formatCurrency(yearData.invested)}</td><td class="px-2 py-1 whitespace-nowrap font-semibold text-green-700">${formatCurrency(yearData.returns)}</td><td class="px-2 py-1 whitespace-nowrap font-bold text-purple-700">${formatCurrency(yearData.total)}</td>`; growthTableBody.appendChild(row); });
    }

    function updateCalculator() {
      let isFormValid = true;
      if (currentMode !== 'goal') {
          isFormValid = validateSlider(returnRateSlider, errorMessages.returnRate) && validateSlider(investmentPeriodSlider, errorMessages.investmentPeriod);
          if (inflationToggle.checked) isFormValid = isFormValid && validateSlider(inflationRateSlider, errorMessages.inflationRate);
      } else {
          isFormValid = validateSlider(goalReturnRateSlider, errorMessages.goalReturnRate) && validateSlider(goalPeriodSlider, errorMessages.goalPeriod) && validateSlider(targetAmountSlider, errorMessages.targetAmount);
          if (inflationToggle.checked) isFormValid = isFormValid && validateSlider(inflationRateSlider, errorMessages.inflationRate);
      }

      let yearlyGrowthData = [];

      const annualReturnRate = (currentMode === 'goal' ? parseFloat(goalReturnRateSlider.value) : parseFloat(returnRateSlider.value)) / 100;
      const investmentPeriodYears = (currentMode === 'goal' ? parseFloat(goalPeriodSlider.value) : parseFloat(investmentPeriodSlider.value));
      const annualInflationRate = inflationToggle.checked ? parseFloat(inflationRateSlider.value) / 100 : 0;

      toggleGrowthTableBtn.classList.toggle('hidden', currentMode === 'swp' || currentMode === 'goal');
      tableHeaderInvested.textContent = (currentMode === 'fd' || currentMode === 'lumpsum') ? 'Principal' : 'Invested';

      if (currentMode === 'sip') {
        isFormValid = isFormValid && validateSlider(sipAmountSlider, errorMessages.sipAmount);
        if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);
        const sipAmount = parseFloat(sipAmountSlider.value);
        const annualIncreaseRate = parseFloat(sipIncreaseRateSlider.value) / 100;
        const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2 }[sipFrequencySelect.value];
        const periodicReturnRate = annualReturnRate / frequency;
        let currentSipAmount = sipAmount, investedAmount = 0, currentCorpus = 0;
        for (let year = 1; year <= investmentPeriodYears; year++) {
          let yearInvested = 0;
          for (let i = 0; i < frequency; i++) { yearInvested += currentSipAmount; currentCorpus = currentCorpus * (1 + periodicReturnRate) + currentSipAmount; }
          investedAmount += yearInvested;
          currentSipAmount *= (1 + annualIncreaseRate);
          yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus });
        }
        investedAmountSIP.textContent = formatCurrency(investedAmount);
        estimatedReturnsSIP.textContent = formatCurrency(currentCorpus - investedAmount);
        totalValueSIP.textContent = formatCurrency(currentCorpus);
        if (inflationToggle.checked) {
          const realReturnRate = ((1 + annualReturnRate) / (1 + annualInflationRate)) - 1;
          const periodicRealReturnRate = realReturnRate / frequency;
          let realCorpus = 0, realSipAmount = sipAmount;
          for (let year = 1; year <= investmentPeriodYears; year++) {
            for (let i = 0; i < frequency; i++) { realCorpus = realCorpus * (1 + periodicRealReturnRate) + realSipAmount; }
            realSipAmount *= (1 + annualIncreaseRate);
          }
          realTotalValueSIP.textContent = formatCurrency(realCorpus);
          realValueSectionSIP.classList.remove('hidden');
        } else { realValueSectionSIP.classList.add('hidden'); }
        updateDoughnutChart([investedAmount, currentCorpus - investedAmount], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
        generateGrowthTable(yearlyGrowthData);

      } else if (currentMode === 'lumpsum') {
        isFormValid = isFormValid && validateSlider(lumpsumAmountSlider, errorMessages.lumpsumAmount);
        if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);
        const investedAmount = parseFloat(lumpsumAmountSlider.value);
        const totalValue = investedAmount * Math.pow(1 + annualReturnRate, investmentPeriodYears);
        const estimatedReturns = totalValue - investedAmount;
        investedAmountLumpsum.textContent = formatCurrency(investedAmount);
        estimatedReturnsLumpsum.textContent = formatCurrency(estimatedReturns);
        totalValueLumpsum.textContent = formatCurrency(totalValue);
        if (inflationToggle.checked) {
          const realReturnRate = ((1 + annualReturnRate) / (1 + annualInflationRate)) - 1;
          const realTotalValue = investedAmount * Math.pow(1 + realReturnRate, investmentPeriodYears);
          realTotalValueLumpsum.textContent = formatCurrency(realTotalValue);
          realValueSectionLumpsum.classList.remove('hidden');
        } else { realValueSectionLumpsum.classList.add('hidden'); }
        updateDoughnutChart([investedAmount, estimatedReturns], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
        let currentCorpus = investedAmount;
        for (let year = 1; year <= investmentPeriodYears; year++) { currentCorpus *= (1 + annualReturnRate); yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus }); }
        generateGrowthTable(yearlyGrowthData);

      } else if (currentMode === 'rd') {
        isFormValid = isFormValid && validateSlider(rdAmountSlider, errorMessages.rdAmount);
        if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);
        const rdAmount = parseFloat(rdAmountSlider.value);
        const annualIncreaseRate = parseFloat(rdIncreaseRateSlider.value) / 100;
        const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2 }[rdFrequencySelect.value];
        const periodicReturnRate = annualReturnRate / frequency;
        let currentRdAmount = rdAmount, investedAmount = 0, currentCorpus = 0;
        for (let year = 1; year <= investmentPeriodYears; year++) {
          let yearInvested = 0;
          for (let i = 0; i < frequency; i++) { yearInvested += currentRdAmount; currentCorpus = currentCorpus * (1 + periodicReturnRate) + currentRdAmount; }
          investedAmount += yearInvested;
          currentRdAmount *= (1 + annualIncreaseRate);
          yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus });
        }
        investedAmountRD.textContent = formatCurrency(investedAmount);
        estimatedReturnsRD.textContent = formatCurrency(currentCorpus - investedAmount);
        totalValueRD.textContent = formatCurrency(currentCorpus);
        if (inflationToggle.checked) {
          const realReturnRate = ((1 + annualReturnRate) / (1 + annualInflationRate)) - 1;
          const periodicRealReturnRate = realReturnRate / frequency;
          let realCorpus = 0, realRdAmount = rdAmount;
          for (let year = 1; year <= investmentPeriodYears; year++) {
            for (let i = 0; i < frequency; i++) { realCorpus = realCorpus * (1 + periodicRealReturnRate) + realRdAmount; }
            realRdAmount *= (1 + annualIncreaseRate);
          }
          realTotalValueRD.textContent = formatCurrency(realCorpus);
          realValueSectionRD.classList.remove('hidden');
        } else { realValueSectionRD.classList.add('hidden'); }
        updateDoughnutChart([investedAmount, currentCorpus - investedAmount], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
        generateGrowthTable(yearlyGrowthData);

      } else if (currentMode === 'fd') {
        isFormValid = isFormValid && validateSlider(fdAmountSlider, errorMessages.fdAmount);
        if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);
        const investedAmount = parseFloat(fdAmountSlider.value);
        const totalValue = investedAmount * Math.pow(1 + annualReturnRate, investmentPeriodYears);
        const estimatedReturns = totalValue - investedAmount;
        investedAmountFD.textContent = formatCurrency(investedAmount);
        estimatedReturnsFD.textContent = formatCurrency(estimatedReturns);
        totalValueFD.textContent = formatCurrency(totalValue);
        if (inflationToggle.checked) {
          const realReturnRate = ((1 + annualReturnRate) / (1 + annualInflationRate)) - 1;
          const realTotalValue = investedAmount * Math.pow(1 + realReturnRate, investmentPeriodYears);
          realTotalValueFD.textContent = formatCurrency(realTotalValue);
          realValueSectionFD.classList.remove('hidden');
        } else { realValueSectionFD.classList.add('hidden'); }
        updateDoughnutChart([investedAmount, estimatedReturns], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
        let currentCorpus = investedAmount;
        for (let year = 1; year <= investmentPeriodYears; year++) { currentCorpus *= (1 + annualReturnRate); yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus }); }
        generateGrowthTable(yearlyGrowthData);

      } else if (currentMode === 'swp') {
        isFormValid = isFormValid && validateSlider(initialCorpusSlider, errorMessages.initialCorpus) && validateSlider(withdrawalAmountSlider, errorMessages.withdrawalAmount);
        if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);
        let corpus = parseFloat(initialCorpusSlider.value);
        const initialCorpus = corpus;
        const withdrawalAmount = parseFloat(withdrawalAmountSlider.value);
        const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2, yearly: 1 }[withdrawalFrequencySelect.value];
        const numWithdrawals = investmentPeriodYears * frequency;
        const periodicReturnRate = annualReturnRate / frequency;
        let totalWithdrawn = 0, totalInterest = 0, exhaustionPeriodYears = 0;
        for (let i = 1; i <= numWithdrawals; i++) {
          if (corpus <= 0) { exhaustionPeriodYears = (i - 1) / frequency; corpus = 0; break; }
          const interestEarned = corpus * periodicReturnRate;
          totalInterest += interestEarned;
          corpus += interestEarned;
          const withdrawal = Math.min(corpus, withdrawalAmount);
          corpus -= withdrawal;
          totalWithdrawn += withdrawal;
        }
        initialCorpusSWP.textContent = formatCurrency(initialCorpus);
        totalWithdrawnSWP.textContent = formatCurrency(totalWithdrawn);
        totalInterestSWP.textContent = formatCurrency(totalInterest);
        remainingCorpusSWP.textContent = formatCurrency(corpus);
        corpusExhaustedInfo.classList.toggle('hidden', !(exhaustionPeriodYears > 0));
        if (exhaustionPeriodYears > 0) exhaustionPeriodSWP.textContent = `${exhaustionPeriodYears.toFixed(1)} Yrs`;
        if (inflationToggle.checked) {
          realRemainingCorpusSWP.textContent = formatCurrency(corpus / Math.pow(1 + annualInflationRate, investmentPeriodYears));
          realValueSectionSWP.classList.remove('hidden');
        } else { realValueSectionSWP.classList.add('hidden'); }
        updateDoughnutChart([totalWithdrawn, totalInterest, corpus], ['Withdrawn', 'Interest', 'Remaining'], ['#10B981', '#6366F1', '#EF4444']);

      } else if (currentMode === 'goal') {
        isFormValid = isFormValid && validateSlider(targetAmountSlider, errorMessages.targetAmount) && validateSlider(goalReturnRateSlider, errorMessages.goalReturnRate) && validateSlider(goalPeriodSlider, errorMessages.goalPeriod);
        if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);

        let targetAmount = parseFloat(targetAmountSlider.value);
        const annualRate = parseFloat(goalReturnRateSlider.value) / 100;
        const years = parseFloat(goalPeriodSlider.value);
        const months = years * 12;
        const monthlyRate = annualRate / 12;
        let monthlyInvestment;

        let inflatedTargetAmount = targetAmount;
        if (inflationToggle.checked) {
            const inflationRate = parseFloat(inflationRateSlider.value) / 100;
            inflatedTargetAmount = targetAmount * Math.pow(1 + inflationRate, years);
        }

        if (monthlyRate === 0) {
            monthlyInvestment = inflatedTargetAmount / months;
        } else {
            monthlyInvestment = (inflatedTargetAmount * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
        }

        const totalInvestment = monthlyInvestment * months;
        const expectedReturns = inflatedTargetAmount - totalInvestment;

        targetAmountGoal.textContent = formatCurrency(targetAmount);
        totalInvestmentGoal.textContent = formatCurrency(totalInvestment);
        expectedReturnsGoal.textContent = formatCurrency(expectedReturns);
        monthlyInvestmentGoal.textContent = formatCurrency(monthlyInvestment);

        updateDoughnutChart([totalInvestment, expectedReturns], ['Total Investment', 'Expected Returns'], ['#22C55E', '#6366F1']);
      }
    }

    const debouncedUpdate = debounce(updateCalculator, 250);

    function switchMode(newMode) {
      currentMode = newMode;
      [sipSection, lumpsumSection, rdSection, fdSection, swpSection, goalSection, sipSummary, lumpsumSummary, rdSummary, fdSummary, swpSummary, goalSummary].forEach(el => el.classList.add('hidden'));
      const activeClasses = 'bg-blue-600 text-white shadow-md'.split(' ');
      const inactiveClasses = 'bg-gray-200 text-gray-700 hover:bg-gray-300'.split(' ');
      [sipModeBtn, lumpsumModeBtn, rdModeBtn, fdModeBtn, swpModeBtn, goalModeBtn].forEach(btn => { btn.classList.remove(...activeClasses, ...inactiveClasses); btn.classList.add(...(btn.id.startsWith(newMode) ? activeClasses : inactiveClasses)); });

      if (newMode === 'sip') { sipSection.classList.remove('hidden'); sipSummary.classList.remove('hidden'); calculatorTitle.textContent = 'SIP Calculator'; calculatorDescription.textContent = 'Calculate the future value of your SIP investments.'; periodLabel.textContent = 'Investment Period (Years)'; }
      else if (newMode === 'lumpsum') { lumpsumSection.classList.remove('hidden'); lumpsumSummary.classList.remove('hidden'); calculatorTitle.textContent = 'Lumpsum Calculator'; calculatorDescription.textContent = 'Calculate the future value of your one-time lumpsum investment.'; periodLabel.textContent = 'Investment Period (Years)'; }
      else if (newMode === 'rd') { rdSection.classList.remove('hidden'); rdSummary.classList.remove('hidden'); calculatorTitle.textContent = 'RD Calculator'; calculatorDescription.textContent = 'Calculate the maturity amount of your recurring deposits.'; periodLabel.textContent = 'Investment Period (Years)'; }
      else if (newMode === 'fd') { fdSection.classList.remove('hidden'); fdSummary.classList.remove('hidden'); calculatorTitle.textContent = 'FD Calculator'; calculatorDescription.textContent = 'Calculate the maturity amount of your fixed deposit.'; periodLabel.textContent = 'Investment Period (Years)'; }
      else if (newMode === 'swp') { swpSection.classList.remove('hidden'); swpSummary.classList.remove('hidden'); calculatorTitle.textContent = 'SWP Calculator'; calculatorDescription.textContent = 'Calculate your Systematic Withdrawal Plan returns and remaining corpus.'; periodLabel.textContent = 'Withdrawal Period (Years)'; }
      else if (newMode === 'goal') { goalSection.classList.remove('hidden'); goalSummary.classList.remove('hidden'); calculatorTitle.textContent = 'Goal Planner'; calculatorDescription.textContent = 'Calculate the monthly investment needed to reach your financial goal.'; }

      document.querySelectorAll('.range-slider').forEach(updateSliderFill);
      updateCalculator();
    }

    const handleShare = () => {
        const params = new URLSearchParams();
        params.set('mode', currentMode);

        if (currentMode === 'sip') {
            params.set('amount', sipAmountSlider.value);
            params.set('increase', sipIncreaseRateSlider.value);
            params.set('rate', returnRateSlider.value);
            params.set('period', investmentPeriodSlider.value);
        } else if (currentMode === 'lumpsum') {
            params.set('amount', lumpsumAmountSlider.value);
            params.set('rate', returnRateSlider.value);
            params.set('period', investmentPeriodSlider.value);
        } else if (currentMode === 'goal') {
            params.set('target', targetAmountSlider.value);
            params.set('rate', goalReturnRateSlider.value);
            params.set('period', goalPeriodSlider.value);
        }

        if (inflationToggle.checked) {
            params.set('inflation', inflationRateSlider.value);
        }

        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

        if (navigator.share) {
            navigator.share({
                title: 'Financial Calculator Plan',
                text: 'Check out my investment plan!',
                url: shareUrl,
            }).catch(err => {
                console.error("Share failed:", err.message);
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

    const loadFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');

        if (mode) {
            switchMode(mode);

            if (mode === 'sip') {
                sipAmountSlider.value = params.get('amount') || 10000;
                sipIncreaseRateSlider.value = params.get('increase') || 0;
                returnRateSlider.value = params.get('rate') || 12;
                investmentPeriodSlider.value = params.get('period') || 10;
            } else if (mode === 'lumpsum') {
                lumpsumAmountSlider.value = params.get('amount') || 500000;
                returnRateSlider.value = params.get('rate') || 10;
                investmentPeriodSlider.value = params.get('period') || 10;
            } else if (mode === 'goal') {
                targetAmountSlider.value = params.get('target') || 5000000;
                goalReturnRateSlider.value = params.get('rate') || 12;
                goalPeriodSlider.value = params.get('period') || 10;
            }

            if (params.has('inflation')) {
                inflationToggle.checked = true;
                inflationRateSlider.value = params.get('inflation');
                inflationInputGroup.classList.remove('hidden');
            }

            document.querySelectorAll('input[type="range"]').forEach(slider => {
                const input = getElem(slider.id.replace('Slider', 'Input'));
                if (input) input.value = slider.value;
            });

            updateCalculator();
        }
    };

    function setupEventListeners() {
      const inputs = [
       { slider: sipAmountSlider, input: sipAmountInput }, { slider: lumpsumAmountSlider, input: lumpsumAmountInput },
       { slider: rdAmountSlider, input: rdAmountInput }, { slider: fdAmountSlider, input: fdAmountInput },
       { slider: initialCorpusSlider, input: initialCorpusInput }, { slider: withdrawalAmountSlider, input: withdrawalAmountInput },
       { slider: returnRateSlider, input: returnRateInput }, { slider: investmentPeriodSlider, input: investmentPeriodInput },
       { slider: inflationRateSlider, input: inflationRateInput }, { slider: sipIncreaseRateSlider, input: sipIncreaseRateInput },
       { slider: rdIncreaseRateSlider, input: rdIncreaseRateInput }, { slider: targetAmountSlider, input: targetAmountInput },
       { slider: goalReturnRateSlider, input: goalReturnRateInput }, { slider: goalPeriodSlider, input: goalPeriodInput }
     ];

      inputs.forEach(({ slider, input }) => {
        if (slider && input) {
          slider.addEventListener('input', () => { input.value = slider.value; updateSliderFill(slider); debouncedUpdate(); });
          input.addEventListener('input', () => { slider.value = input.value; updateSliderFill(slider); debouncedUpdate(); });
        }
      });

      [sipFrequencySelect, rdFrequencySelect, withdrawalFrequencySelect, inflationToggle].forEach(el => {
        if (el) {
          el.addEventListener('change', () => {
            if (el.id === 'inflationToggle') { inflationInputGroup.classList.toggle('hidden', !inflationToggle.checked); }
            updateCalculator();
          });
        }
      });

      sipModeBtn.addEventListener('click', () => switchMode('sip'));
      lumpsumModeBtn.addEventListener('click', () => switchMode('lumpsum'));
      rdModeBtn.addEventListener('click', () => switchMode('rd'));
      fdModeBtn.addEventListener('click', () => switchMode('fd'));
      swpModeBtn.addEventListener('click', () => switchMode('swp'));
      goalModeBtn.addEventListener('click', () => switchMode('goal'));

        document.querySelectorAll('.goal-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const goal = e.target.dataset.goal;
                document.querySelectorAll('.goal-template-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                if (goal === 'retirement') {
                    targetAmountSlider.value = 10000000;
                    goalPeriodSlider.value = 25;
                    goalReturnRateSlider.value = 12;
                } else if (goal === 'education') {
                    targetAmountSlider.value = 2500000;
                    goalPeriodSlider.value = 15;
                    goalReturnRateSlider.value = 11;
                } else if (goal === 'car') {
                    targetAmountSlider.value = 1000000;
                    goalPeriodSlider.value = 5;
                    goalReturnRateSlider.value = 9;
                }

                targetAmountInput.value = targetAmountSlider.value;
                goalPeriodInput.value = goalPeriodSlider.value;
                goalReturnRateInput.value = goalReturnRateSlider.value;
                document.querySelectorAll('.range-slider').forEach(updateSliderFill);
                updateCalculator();
            });
        });

        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', handleShare);
        });

      toggleGrowthTableBtn.addEventListener('click', () => { growthTableContainer.classList.toggle('hidden'); toggleGrowthTableBtn.textContent = growthTableContainer.classList.contains('hidden') ? 'Show Yearly Growth' : 'Hide Yearly Growth'; });
      window.addEventListener('resize', debounce(() => { if(investmentDoughnutChart) investmentDoughnutChart.resize(); }, 250));
    }

    setupEventListeners();
    loadFromUrl();
    document.querySelectorAll('.range-slider').forEach(updateSliderFill);
    if (!window.location.search) {
         switchMode('sip');
    }
}