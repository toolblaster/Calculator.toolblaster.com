// --- IMPORT SHARED UTILITIES ---
// Using functions from utils.js for consistency and code reuse.
import { formatCurrency, debounce, updateSliderFill, syncSliderAndInput } from './assets/js/utils.js';

// --- Helper for Notifications ---
// Ensure showNotification is globally available or defined here
const showNotification = window.showNotification || function(message) {
    // Simple fallback if global function isn't loaded yet
    console.log("Notification:", message);
    const toast = document.getElementById('notification-toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        toast.style.opacity = '1';
        toast.style.visibility = 'visible';
        setTimeout(() => {
            toast.classList.remove('show');
            toast.style.opacity = '0';
            toast.style.visibility = 'hidden';
        }, 3000);
    }
};


document.addEventListener('DOMContentLoaded', () => {
    // --- Element Variables ---
    const getElem = (id) => document.getElementById(id);

    // Inputs
    const initialLumpsumInput = getElem('initialLumpsumInput');
    const monthlyInvestmentInput = getElem('monthlyInvestmentInput');
    const investmentPeriodInput = getElem('investmentPeriodInput');
    const sipReturnInput = getElem('sipReturnInput');
    const rdReturnInput = getElem('rdReturnInput');
    const fdReturnInput = getElem('fdReturnInput');
    const debtReturnInput = getElem('debtReturnInput');
    const taxSlabSelect = getElem('taxSlabSelect');
    const inflationToggle = getElem('inflationToggle');
    const inflationRateInput = getElem('inflationRateInput');
    const sipIncreaseRateInput = getElem('sipIncreaseRateInput');
    const sipIncreaseTypeToggle = getElem('sipIncreaseTypeToggle');
    const rdIncreaseRateInput = getElem('rdIncreaseRateInput');
    const rdIncreaseTypeToggle = getElem('rdIncreaseTypeToggle');


    // Outputs - SIP
    const sipInvestedElem = getElem('sipInvested');
    const sipReturnsElem = getElem('sipReturns');
    const sipTotalElem = getElem('sipTotal');
    const sipRealValueElem = getElem('sipRealValue');
    const sipRealValueItem = getElem('sipRealValueItem');


    // Outputs - RD
    const rdInvestedElem = getElem('rdInvested');
    const rdReturnsElem = getElem('rdReturns');
    const rdReturnsPostTaxElem = getElem('rdReturnsPostTax');
    const rdTotalElem = getElem('rdTotal');
    const rdTotalPostTaxElem = getElem('rdTotalPostTax');
    const rdRealValueElem = getElem('rdRealValue');
    const rdRealValueItem = getElem('rdRealValueItem');

    // Outputs - Lumpsum
    const lumpsumInvestedElem = getElem('lumpsumInvested');
    const lumpsumReturnsElem = getElem('lumpsumReturns');
    const lumpsumTotalElem = getElem('lumpsumTotal');
    const lumpsumRealValueElem = getElem('lumpsumRealValue');
    const lumpsumRealValueItem = getElem('lumpsumRealValueItem');

    // Outputs - FD vs Debt (Post Tax)
    const fdReturnsPostTaxElem = getElem('fdReturnsPostTax');
    const fdTotalPostTaxElem = getElem('fdTotalPostTax');
    const fdRealValueElem = getElem('fdRealValue');
    const fdRealValueItem = getElem('fdRealValueItem');
    const debtReturnsPostTaxElem = getElem('debtReturnsPostTax');
    const debtTotalPostTaxElem = getElem('debtTotalPostTax');
    const debtRealValueElem = getElem('debtRealValue');
    const debtRealValueItem = getElem('debtRealValueItem');

    // Charts
    const finalValueCanvas = getElem('finalValueChart');
    const growthCanvas = getElem('growthChart');
    let finalValueChart;
    let growthChart;
    let growthChartData = {}; // To store yearly data for toggling

    // Chart toggle buttons
    const chartToggleButtons = document.querySelectorAll('.toggle-btn');
    let activeChartDataset = 'sip'; // Default view for growth chart

    // Share Elements
    const shareReportBtn = getElem('shareReportBtn');
    const shareModal = getElem('shareModal');
    const closeModalBtn = getElem('closeModalBtn');
    const modalReportContent = getElem('modalReportContent');
    const shareUrlInput = getElem('shareUrlInput');
    const copyUrlBtn = getElem('copyUrlBtn');

    // --- Calculation Functions ---

    // Calculate SIP Growth (with step-up and initial lumpsum)
    function calculateSIP(initialLumpsum, monthlyPrincipal, years, rate, increaseValue, isIncreaseAmount) {
        const months = years * 12;
        const monthlyRate = rate / 12 / 100;
        let futureValue = initialLumpsum * Math.pow(1 + monthlyRate, months); // Grow initial lumpsum
        let totalInvested = initialLumpsum;
        let yearlyData = [{ year: 0, value: initialLumpsum }];
        let currentMonthlyInvestment = monthlyPrincipal;
        let currentYearEndBalance = initialLumpsum; // Start with initial lumpsum

        for (let year = 1; year <= years; year++) {
            let yearInvestedMonthly = 0;
            // Calculate balance at end of year including monthly investments
             for (let month = 1; month <= 12; month++) {
                 currentYearEndBalance = currentYearEndBalance * (1 + monthlyRate) + currentMonthlyInvestment;
                 yearInvestedMonthly += currentMonthlyInvestment;
            }
            totalInvested += yearInvestedMonthly;
            yearlyData.push({ year: year, value: currentYearEndBalance });

            // Apply step-up for the next year
            if (isIncreaseAmount) {
                currentMonthlyInvestment += increaseValue;
            } else {
                currentMonthlyInvestment *= (1 + (increaseValue / 100));
            }
        }
        futureValue = currentYearEndBalance; // Final balance
        const totalReturns = futureValue - totalInvested;
        return { totalInvested, totalReturns, futureValue, yearlyData };
    }


    // Calculate Lumpsum Growth
    function calculateLumpsum(principal, years, rate) {
        const annualRate = rate / 100;
        let futureValue = principal;
        let yearlyData = [{ year: 0, value: principal }];
        for (let year = 1; year <= years; year++) {
            futureValue *= (1 + annualRate);
            yearlyData.push({ year: year, value: futureValue });
        }
        const totalReturns = futureValue - principal;
        return { totalInvested: principal, totalReturns, futureValue, yearlyData };
    }

     // Calculate RD Growth (with step-up and initial lumpsum)
    function calculateRD(initialLumpsum, monthlyPrincipal, years, rate, taxRate, increaseValue, isIncreaseAmount) {
        const months = years * 12;
        const monthlyRate = rate / 12 / 100;
        let futureValue = initialLumpsum * Math.pow(1 + monthlyRate, months); // Grow initial lumpsum
        let totalInvested = initialLumpsum;
        let yearlyData = [{ year: 0, value: initialLumpsum }];
        let currentMonthlyInvestment = monthlyPrincipal;
        let currentYearEndBalance = initialLumpsum; // Start with initial lumpsum

        for (let year = 1; year <= years; year++) {
            let yearInvestedMonthly = 0;
            // Calculate balance at end of year including monthly investments
            for (let month = 1; month <= 12; month++) {
                currentYearEndBalance = currentYearEndBalance * (1 + monthlyRate) + currentMonthlyInvestment;
                yearInvestedMonthly += currentMonthlyInvestment;
            }
            totalInvested += yearInvestedMonthly;
            yearlyData.push({ year: year, value: currentYearEndBalance });

            // Apply step-up for the next year
            if (isIncreaseAmount) {
                currentMonthlyInvestment += increaseValue;
            } else {
                currentMonthlyInvestment *= (1 + (increaseValue / 100));
            }
        }
        futureValue = currentYearEndBalance; // Final balance

        const totalReturns = futureValue - totalInvested;
        const taxOnReturns = totalReturns * taxRate;
        const returnsPostTax = totalReturns - taxOnReturns;
        const futureValuePostTax = totalInvested + returnsPostTax;

        // Generate yearly data for post-tax scenario (simplified linear reduction for chart)
        let yearlyDataPostTax = [{ year: 0, value: initialLumpsum }];
         for (let year = 1; year <= years; year++){
              // More accurate approximation: Assume linear growth of both principal and post-tax returns
              const investedFraction = (initialLumpsum + (totalInvested - initialLumpsum) * (year / years));
              const returnsFraction = returnsPostTax * (year / years);
              const yearValue = investedFraction + returnsFraction;
               yearlyDataPostTax.push({ year: year, value: yearValue});
         }


        return { totalInvested, totalReturns, futureValue, returnsPostTax, futureValuePostTax, yearlyData, yearlyDataPostTax };
    }


    // Calculate FD Growth (including post-tax)
    function calculateFD(principal, years, rate, taxRate) {
        const annualRate = rate / 100;
        let futureValue = principal;
        let yearlyData = [{ year: 0, value: principal }];

        for (let year = 1; year <= years; year++) {
             futureValue *= (1 + annualRate);
             yearlyData.push({ year: year, value: futureValue });
        }

        const totalReturns = futureValue - principal;
        const taxOnReturns = totalReturns * taxRate;
        const returnsPostTax = totalReturns - taxOnReturns;
        const futureValuePostTax = principal + returnsPostTax;

        // Generate yearly data for post-tax scenario (simplified linear reduction for chart)
        let yearlyDataPostTax = [{ year: 0, value: principal }];
        for (let year = 1; year <= years; year++){
             // More accurate approximation
             const yearValue = principal + returnsPostTax * (year / years);
             yearlyDataPostTax.push({ year: year, value: yearValue});
        }

        return { totalInvested: principal, totalReturns, futureValue, returnsPostTax, futureValuePostTax, yearlyData, yearlyDataPostTax };
    }

    // Calculate Debt Fund Growth (Simplified Post-Tax with Indexation > 3 yrs)
    function calculateDebtFund(principal, years, rate, taxRate, inflationRate) {
        const annualRate = rate / 100;
        let futureValue = principal;
        let yearlyData = [{ year: 0, value: principal }];
        for (let year = 1; year <= years; year++) {
            futureValue *= (1 + annualRate);
            yearlyData.push({ year: year, value: futureValue });
        }
        const totalReturns = futureValue - principal;

        let taxOnReturns = 0;
        if (years > 3) {
            // Apply indexation (simplified)
            const inflationForPeriod = inflationRate > 0 ? (inflationRate / 100) : 0;
            const indexedCost = principal * Math.pow(1 + inflationForPeriod, years);
            const longTermCapitalGain = Math.max(0, futureValue - indexedCost);
            taxOnReturns = longTermCapitalGain * 0.20; // 20% tax on indexed gain
        } else {
            // Short term: Tax at slab rate
            taxOnReturns = totalReturns * taxRate;
        }

        const returnsPostTax = totalReturns - taxOnReturns;
        const futureValuePostTax = principal + returnsPostTax;

         // Generate yearly data for post-tax scenario (simplified linear reduction for chart)
         let yearlyDataPostTax = [{ year: 0, value: principal }];
         for (let year = 1; year <= years; year++){
              // More accurate approximation
             const yearValue = principal + returnsPostTax * (year / years);
             yearlyDataPostTax.push({ year: year, value: yearValue});
         }

        return { totalInvested: principal, totalReturns, futureValue, returnsPostTax, futureValuePostTax, yearlyData, yearlyDataPostTax };
    }

    // Calculate Real Value
    function calculateRealValue(futureValue, years, inflationRate) {
        if (inflationRate <= 0) return futureValue; // No adjustment if inflation is zero or negative
        return futureValue / Math.pow(1 + inflationRate / 100, years);
    }


    // --- Main Update Function ---
    function updateComparison() {
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

        isValid &= validateInput('initialLumpsumInput', 0, 5000000, 'initialLumpsumError');
        isValid &= validateInput('monthlyInvestmentInput', 500, 100000, 'monthlyInvestmentError');
        isValid &= validateInput('investmentPeriodInput', 1, 40, 'investmentPeriodError');
        isValid &= validateInput('sipReturnInput', 1, 25, 'sipReturnError');
        isValid &= validateInput('rdReturnInput', 1, 10, 'rdReturnError');
        isValid &= validateInput('fdReturnInput', 1, 10, 'fdReturnError');
        isValid &= validateInput('debtReturnInput', 1, 12, 'debtReturnError');
        isValid &= validateInput('inflationRateInput', 0, 15, 'inflationRateError');

        // Validate step-up inputs based on type
        const isSipIncreaseAmount = sipIncreaseTypeToggle.checked;
        const sipIncreaseMax = isSipIncreaseAmount ? 5000 : 20;
        isValid &= validateInput('sipIncreaseRateInput', 0, sipIncreaseMax, 'sipIncreaseRateError');

        const isRdIncreaseAmount = rdIncreaseTypeToggle.checked;
        const rdIncreaseMax = isRdIncreaseAmount ? 5000 : 20;
        isValid &= validateInput('rdIncreaseRateInput', 0, rdIncreaseMax, 'rdIncreaseRateError');

        if (!isValid) {
            // Display error state in results - clear all values
            [sipInvestedElem, sipReturnsElem, sipTotalElem, sipRealValueElem,
             rdInvestedElem, rdReturnsElem, rdReturnsPostTaxElem, rdTotalElem, rdTotalPostTaxElem, rdRealValueElem,
             lumpsumInvestedElem, lumpsumReturnsElem, lumpsumTotalElem, lumpsumRealValueElem,
             fdReturnsPostTaxElem, fdTotalPostTaxElem, fdRealValueElem,
             debtReturnsPostTaxElem, debtTotalPostTaxElem, debtRealValueElem].forEach(el => el.textContent = '-');

            // Show Real Value items but with '-'
            [sipRealValueItem, rdRealValueItem, lumpsumRealValueItem, fdRealValueItem, debtRealValueItem].forEach(el => {
                el.style.display = inflationToggle.checked ? 'flex' : 'none';
                el.querySelector('.result-value.real').textContent = '-';
            });

            // Update charts to show error state
            updateFinalValueChart([0,0,0,0,0]); // Zero values
            growthChartData = {}; // Clear yearly data
            updateGrowthChart(); // Attempt to clear or show empty chart
            return;
        }
        // --- End Validation ---

        // Read Inputs
        const initialLumpsum = parseFloat(initialLumpsumInput.value) || 0;
        const monthlyInvestment = parseFloat(monthlyInvestmentInput.value) || 0;
        const years = parseInt(investmentPeriodInput.value) || 0;
        const sipRate = parseFloat(sipReturnInput.value) || 0;
        const rdRate = parseFloat(rdReturnInput.value) || 0;
        const fdRate = parseFloat(fdReturnInput.value) || 0;
        const debtRate = parseFloat(debtReturnInput.value) || 0;
        const taxRate = parseFloat(taxSlabSelect.value) || 0;
        const applyInflation = inflationToggle.checked;
        const inflationRate = applyInflation ? (parseFloat(inflationRateInput.value) || 0) : 0;
        const sipIncreaseValue = parseFloat(sipIncreaseRateInput.value) || 0;
        // isSipIncreaseAmount is already defined in validation
        const rdIncreaseValue = parseFloat(rdIncreaseRateInput.value) || 0;
        // isRdIncreaseAmount is already defined in validation


        // Calculate Equivalent Lumpsum for FD/Debt comparison
        const sipInvestedAmount = calculateSIP(initialLumpsum, monthlyInvestment, years, sipRate, sipIncreaseValue, isSipIncreaseAmount).totalInvested;
        const equivalentLumpsum = sipInvestedAmount;

        // Perform Calculations
        const sipData = calculateSIP(initialLumpsum, monthlyInvestment, years, sipRate, sipIncreaseValue, isSipIncreaseAmount);
        const rdData = calculateRD(initialLumpsum, monthlyInvestment, years, rdRate, taxRate, rdIncreaseValue, isRdIncreaseAmount);
        const lumpsumData = calculateLumpsum(equivalentLumpsum, years, sipRate); // Lumpsum uses SIP rate
        const fdData = calculateFD(equivalentLumpsum, years, fdRate, taxRate);
        const debtData = calculateDebtFund(equivalentLumpsum, years, debtRate, taxRate, inflationRate);


        // Calculate Real Values
        const sipReal = calculateRealValue(sipData.futureValue, years, inflationRate);
        const rdReal = calculateRealValue(rdData.futureValuePostTax, years, inflationRate);
        const lumpsumReal = calculateRealValue(lumpsumData.futureValue, years, inflationRate);
        const fdReal = calculateRealValue(fdData.futureValuePostTax, years, inflationRate);
        const debtReal = calculateRealValue(debtData.futureValuePostTax, years, inflationRate);

        // Store yearly data for growth chart
        const getAdjustedYearlyData = (data, isPostTax, isLumpsumType = false) => {
            const baseData = isPostTax ? data.yearlyDataPostTax : data.yearlyData;
            if (applyInflation) {
                return baseData.map(d => ({
                    year: d.year,
                    value: calculateRealValue(d.value, d.year, inflationRate)
                }));
            }
             if (!applyInflation && isLumpsumType && baseData[0]?.year !== 0) {
                 return [{ year: 0, value: data.totalInvested }, ...baseData.slice(1)];
             }
             if (!applyInflation && !isLumpsumType && baseData[0]?.year !== 0) {
                 const startValue = initialLumpsum > 0 ? initialLumpsum : 0;
                 return [{ year: 0, value: startValue }, ...baseData.slice(1)];
             }
            return baseData;
        };


        growthChartData = {
            sip: getAdjustedYearlyData(sipData, false),
            rd: getAdjustedYearlyData(rdData, true),
            lumpsum: getAdjustedYearlyData(lumpsumData, false, true),
            fd: getAdjustedYearlyData(fdData, true, true),
            debt: getAdjustedYearlyData(debtData, true, true),
        };

        // Update UI Results
        // SIP
        sipInvestedElem.textContent = formatCurrency(sipData.totalInvested);
        sipReturnsElem.textContent = formatCurrency(sipData.totalReturns);
        sipTotalElem.textContent = formatCurrency(sipData.futureValue);
        sipRealValueElem.textContent = formatCurrency(sipReal);
        sipRealValueItem.style.display = applyInflation ? 'flex' : 'none';

        // RD
        rdInvestedElem.textContent = formatCurrency(rdData.totalInvested);
        rdReturnsElem.textContent = formatCurrency(rdData.totalReturns);
        rdReturnsPostTaxElem.textContent = formatCurrency(rdData.returnsPostTax);
        rdTotalElem.textContent = formatCurrency(rdData.futureValue);
        rdTotalPostTaxElem.textContent = formatCurrency(rdData.futureValuePostTax);
        rdRealValueElem.textContent = formatCurrency(rdReal);
        rdRealValueItem.style.display = applyInflation ? 'flex' : 'none';


        // Lumpsum
        lumpsumInvestedElem.textContent = formatCurrency(lumpsumData.totalInvested);
        lumpsumReturnsElem.textContent = formatCurrency(lumpsumData.totalReturns);
        lumpsumTotalElem.textContent = formatCurrency(lumpsumData.futureValue);
        lumpsumRealValueElem.textContent = formatCurrency(lumpsumReal);
        lumpsumRealValueItem.style.display = applyInflation ? 'flex' : 'none';


        // FD vs Debt (Post Tax)
        fdReturnsPostTaxElem.textContent = formatCurrency(fdData.returnsPostTax);
        fdTotalPostTaxElem.textContent = formatCurrency(fdData.futureValuePostTax);
        fdRealValueElem.textContent = formatCurrency(fdReal);
        fdRealValueItem.style.display = applyInflation ? 'flex' : 'none';
        debtReturnsPostTaxElem.textContent = formatCurrency(debtData.returnsPostTax);
        debtTotalPostTaxElem.textContent = formatCurrency(debtData.futureValuePostTax);
        debtRealValueElem.textContent = formatCurrency(debtReal);
        debtRealValueItem.style.display = applyInflation ? 'flex' : 'none';

        // Update Charts
        updateFinalValueChart(applyInflation ? [sipReal, rdReal, lumpsumReal, fdReal, debtReal] : [
            sipData.futureValue,
            rdData.futureValuePostTax,
            lumpsumData.futureValue,
            fdData.futureValuePostTax,
            debtData.futureValuePostTax
        ]);
        updateGrowthChart();
    }


    // --- Other functions (updateFinalValueChart, updateGrowthChart, getChartColor, populateAndShowModal, loadFromUrl) remain unchanged ---
    function updateFinalValueChart(finalValues) {
        const data = {
            labels: ['SIP', 'RD', 'Lumpsum', 'FD', 'Debt Fund'], // Simplified labels
            datasets: [{
                label: inflationToggle.checked ? 'Final Real Value' : 'Final Post-Tax Value', // Dynamic Label
                data: finalValues,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)', // blue
                    'rgba(234, 179, 8, 0.7)',  // yellow
                    'rgba(34, 197, 94, 0.7)',  // green
                    'rgba(239, 68, 68, 0.7)',  // red
                    'rgba(168, 85, 247, 0.7)' // purple
                ],
                borderColor: [
                     'rgba(37, 99, 235, 1)',
                     'rgba(202, 138, 4, 1)',
                     'rgba(22, 163, 74, 1)',
                     'rgba(220, 38, 38, 1)',
                     'rgba(147, 51, 234, 1)'
                ],
                borderWidth: 1,
                borderRadius: 3
            }]
        };

        const options = {
            indexAxis: 'y', // Horizontal bars
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.x)}`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                     ticks: {
                        callback: (value) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value),
                        font:{size:8} // Squeezed ticks
                    }
                },
                 y: { ticks: { font: {size: 9} }} // Squeezed ticks
            }
        };

        if (finalValueChart) {
            finalValueChart.data = data;
             finalValueChart.options.plugins.tooltip.callbacks.label = (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.x)}`; // Update tooltip label
            finalValueChart.update();
        } else if (finalValueCanvas) { // Check if canvas exists
            finalValueChart = new Chart(finalValueCanvas, { type: 'bar', data, options });
        }
    }

    function updateGrowthChart() {
        const years = parseInt(investmentPeriodInput.value) || 0;
        if (years <= 0 || !activeChartDataset || !growthChartData[activeChartDataset]) {
             // Clear chart if no valid data
             if (growthChart) {
                 growthChart.data.labels = [];
                 growthChart.data.datasets = [];
                 growthChart.update();
             }
             return;
        }


        const yearlyData = growthChartData[activeChartDataset];
         // Ensure yearlyData is an array and has length
        if (!Array.isArray(yearlyData) || yearlyData.length === 0) {
            console.error("Yearly data for chart is invalid or empty for:", activeChartDataset);
             if (growthChart) { // Clear chart if data is bad
                 growthChart.data.labels = [];
                 growthChart.data.datasets = [];
                 growthChart.update();
             }
            return;
        }

        const labels = yearlyData.map(d => `Yr ${d.year}`);
        const dataPoints = yearlyData.map(d => d.value);

        const data = {
            labels: labels,
            datasets: [{
                label: `${activeChartDataset.toUpperCase()} Growth ${inflationToggle.checked ? '(Real Value)' : '(Adj. Value)'}`, // Dynamic Label
                data: dataPoints,
                borderColor: getChartColor(activeChartDataset).border,
                backgroundColor: getChartColor(activeChartDataset).background,
                fill: true,
                tension: 0.1,
                pointRadius: years <= 10 ? 3 : 0 // Show points only for shorter periods
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Value: ${formatCurrency(context.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                     ticks: {
                        callback: (value) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value),
                         font:{size:8} // Squeezed ticks
                    }
                },
                x: {
                    ticks: {
                        font: {size: 8}, // Squeezed ticks
                        maxRotation: 0,
                        autoSkipPadding: 15
                    }
                }
            }
        };

        if (growthChart) {
            growthChart.data = data;
             growthChart.options.plugins.tooltip.callbacks.label = (context) => `Value: ${formatCurrency(context.parsed.y)}`; // Update tooltip label
            growthChart.update();
        } else if (growthCanvas) { // Check if canvas exists
            growthChart = new Chart(growthCanvas, { type: 'line', data, options });
        }
    }


    function getChartColor(type) {
        switch(type) {
            case 'sip': return { border: 'rgba(59, 130, 246, 1)', background: 'rgba(59, 130, 246, 0.1)' }; // blue
            case 'rd': return { border: 'rgba(202, 138, 4, 1)', background: 'rgba(234, 179, 8, 0.1)' }; // yellow
            case 'lumpsum': return { border: 'rgba(22, 163, 74, 1)', background: 'rgba(34, 197, 94, 0.1)' }; // green
            case 'fd': return { border: 'rgba(220, 38, 38, 1)', background: 'rgba(239, 68, 68, 0.1)' }; // red
            case 'debt': return { border: 'rgba(147, 51, 234, 1)', background: 'rgba(168, 85, 247, 0.1)' }; // purple
            default: return { border: 'rgba(107, 114, 128, 1)', background: 'rgba(107, 114, 128, 0.1)' }; // gray
        }
    }

    // --- Share Functionality ---
    function populateAndShowModal() {
        const isInflationOn = inflationToggle.checked;
        const realValueLabel = 'Real Value'; // Keep label consistent
        const postTaxLabel = '(Post-Tax)';

        // **** MODIFIED: Apply distinct color classes for real values ****
        modalReportContent.innerHTML = `
            <h3>Investment Comparison</h3>
            <ul>
                <li><span>Monthly Investment:</span> <span>${formatCurrency(monthlyInvestmentInput.value)}</span></li>
                <li><span>Initial Lumpsum:</span> <span>${formatCurrency(initialLumpsumInput.value)}</span></li>
                <li><span>Period:</span> <span>${investmentPeriodInput.value} Years</span></li>

                <li data-type="sip" style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #eee;">
                    <span>SIP Value:</span> <span class="sip-color">${sipTotalElem.textContent}</span>
                </li>
                 ${isInflationOn ? `<li data-type="sip"><span>SIP ${realValueLabel}:</span> <span class="sip-real-color">${sipRealValueElem.textContent}</span></li>` : ''}

                <li data-type="rd">
                    <span>RD Value ${postTaxLabel}:</span> <span class="rd-color post-tax-color">${rdTotalPostTaxElem.textContent}</span>
                </li>
                 ${isInflationOn ? `<li data-type="rd"><span>RD ${realValueLabel} ${postTaxLabel}:</span> <span class="rd-real-color">${rdRealValueElem.textContent}</span></li>` : ''}

                <li data-type="lumpsum">
                    <span>Lumpsum Value:</span> <span class="lumpsum-color">${lumpsumTotalElem.textContent}</span>
                </li>
                 ${isInflationOn ? `<li data-type="lumpsum"><span>Lumpsum ${realValueLabel}:</span> <span class="lumpsum-real-color">${lumpsumRealValueElem.textContent}</span></li>` : ''}

                <li data-type="fd">
                    <span>FD Value ${postTaxLabel}:</span> <span class="fd-color post-tax-color">${fdTotalPostTaxElem.textContent}</span>
                </li>
                 ${isInflationOn ? `<li data-type="fd"><span>FD ${realValueLabel} ${postTaxLabel}:</span> <span class="fd-real-color">${fdRealValueElem.textContent}</span></li>` : ''}

                <li data-type="debt">
                    <span>Debt Fund Value ${postTaxLabel}:</span> <span class="debt-color post-tax-color">${debtTotalPostTaxElem.textContent}</span>
                </li>
                 ${isInflationOn ? `<li data-type="debt"><span>Debt Fund ${realValueLabel} ${postTaxLabel}:</span> <span class="debt-real-color">${debtRealValueElem.textContent}</span></li>` : ''}
            </ul>
        `;

        // Generate shareable URL (remains the same)
        const params = new URLSearchParams();
        params.set('init', initialLumpsumInput.value);
        params.set('monthly', monthlyInvestmentInput.value);
        params.set('period', investmentPeriodInput.value);
        params.set('sipRate', sipReturnInput.value);
        params.set('rdRate', rdReturnInput.value);
        params.set('fdRate', fdReturnInput.value);
        params.set('debtRate', debtReturnInput.value);
        params.set('tax', taxSlabSelect.value);
        params.set('sipInc', sipIncreaseRateInput.value);
        params.set('sipIncType', sipIncreaseTypeToggle.checked ? 'amt' : 'pct');
        params.set('rdInc', rdIncreaseRateInput.value);
        params.set('rdIncType', rdIncreaseTypeToggle.checked ? 'amt' : 'pct');
        if (inflationToggle.checked) {
            params.set('inf', inflationRateInput.value);
        }

        shareUrlInput.value = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

        shareModal.classList.remove('hidden');
    }

     function loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('monthly')) { // Check for a key parameter
            initialLumpsumInput.value = params.get('init') || 0;
            monthlyInvestmentInput.value = params.get('monthly') || 10000;
            investmentPeriodInput.value = params.get('period') || 15;
            sipReturnInput.value = params.get('sipRate') || 12;
            rdReturnInput.value = params.get('rdRate') || 7.1;
            fdReturnInput.value = params.get('fdRate') || 7.5;
            debtReturnInput.value = params.get('debtRate') || 8;
            taxSlabSelect.value = params.get('tax') || 0.3;
            sipIncreaseRateInput.value = params.get('sipInc') || 0;
            if (params.get('sipIncType') === 'amt') sipIncreaseTypeToggle.checked = true;
            rdIncreaseRateInput.value = params.get('rdInc') || 0;
            if (params.get('rdIncType') === 'amt') rdIncreaseTypeToggle.checked = true;

            if (params.has('inf')) {
                inflationToggle.checked = true;
                inflationRateInput.value = params.get('inf') || 6;
            } else {
                 inflationToggle.checked = false;
            }

            // Sync all sliders
            document.querySelectorAll('input[type="range"]').forEach(slider => {
                const inputId = slider.id.replace('Slider', 'Input');
                const input = getElem(inputId);
                if (input && slider) { // Added slider check
                    slider.value = input.value;
                    updateSliderFill(slider);
                }
            });
             // Dispatch change events for toggles to update labels/ranges
             sipIncreaseTypeToggle.dispatchEvent(new Event('change'));
             rdIncreaseTypeToggle.dispatchEvent(new Event('change'));
             inflationToggle.dispatchEvent(new Event('change')); // Ensure inflation section visibility is correct
        }
         updateComparison(); // Recalculate after loading
    }


    // --- Event Listeners ---
    function setupEventListeners() {
        const debouncedUpdate = debounce(updateComparison, 300);

        // Sync Sliders and Inputs using the imported function
        syncSliderAndInput({ sliderId: 'initialLumpsumSlider', inputId: 'initialLumpsumInput', decrementId: 'initialLumpsumDecrement', incrementId: 'initialLumpsumIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'monthlyInvestmentSlider', inputId: 'monthlyInvestmentInput', decrementId: 'monthlyInvestmentDecrement', incrementId: 'monthlyInvestmentIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'investmentPeriodSlider', inputId: 'investmentPeriodInput', decrementId: 'investmentPeriodDecrement', incrementId: 'investmentPeriodIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'sipReturnSlider', inputId: 'sipReturnInput', decrementId: 'sipReturnDecrement', incrementId: 'sipReturnIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'rdReturnSlider', inputId: 'rdReturnInput', decrementId: 'rdReturnDecrement', incrementId: 'rdReturnIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'fdReturnSlider', inputId: 'fdReturnInput', decrementId: 'fdReturnDecrement', incrementId: 'fdReturnIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'debtReturnSlider', inputId: 'debtReturnInput', decrementId: 'debtReturnDecrement', incrementId: 'debtReturnIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'inflationRateSlider', inputId: 'inflationRateInput', decrementId: 'inflationRateDecrement', incrementId: 'inflationRateIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'sipIncreaseRateSlider', inputId: 'sipIncreaseRateInput', decrementId: 'sipIncreaseRateDecrement', incrementId: 'sipIncreaseRateIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'rdIncreaseRateSlider', inputId: 'rdIncreaseRateInput', decrementId: 'rdIncreaseRateDecrement', incrementId: 'rdIncreaseRateIncrement', updateCallback: debouncedUpdate });


        taxSlabSelect.addEventListener('change', updateComparison); // Update immediately on tax change
        inflationToggle.addEventListener('change', () => {
             // Find the parent div containing the slider and input group
             const inflationInputContainer = getElem('inflationRateSlider')?.closest('.grid > div');
             if (inflationInputContainer) {
                 inflationInputContainer.style.display = inflationToggle.checked ? 'block' : 'none';
             }
             updateComparison();
        });


        // Step-up Toggles
        function setupIncreaseToggle(toggle, label, slider, input, modePrefix) {
             if (!toggle || !label || !slider || !input) return; // Add null checks
            toggle.addEventListener('change', () => {
                const isAmountMode = toggle.checked;
                let currentValue = parseFloat(input.value) || 0; // Keep current value if valid, else 0
                let maxAmount = 5000; // Default max amount increase
                let maxPercent = 20; // Default max percent increase
                let stepAmount = 100;
                let stepPercent = 1;


                if (modePrefix === 'sip' || modePrefix === 'rd') {
                     label.textContent = `${modePrefix.toUpperCase()} Annual Increase (${isAmountMode ? '₹' : '%'})`;
                     slider.max = isAmountMode ? maxAmount : maxPercent;
                     input.max = isAmountMode ? maxAmount : maxPercent;
                     slider.step = isAmountMode ? stepAmount : stepPercent;
                     input.step = isAmountMode ? stepAmount : stepPercent;
                     // Reset value only if it exceeds the new max
                     if (currentValue > parseFloat(input.max)) {
                         currentValue = 0;
                     }
                      // Update error message text based on mode
                     const errorElem = getElem(`${modePrefix}IncreaseRateError`);
                     if (errorElem) {
                          errorElem.textContent = `Value must be between 0 and ${isAmountMode ? formatCurrency(maxAmount) : maxPercent + '%'}.`;
                     }

                }
                slider.value = currentValue;
                input.value = currentValue;
                updateSliderFill(slider);
                updateComparison(); // Recalculate after changing toggle
            });
             // Initial label/range setup and validation message setup
             const event = new Event('change');
             toggle.dispatchEvent(event);
        }
        setupIncreaseToggle(sipIncreaseTypeToggle, getElem('sipIncreaseLabel'), getElem('sipIncreaseRateSlider'), sipIncreaseRateInput, 'sip');
        setupIncreaseToggle(rdIncreaseTypeToggle, getElem('rdIncreaseLabel'), getElem('rdIncreaseRateSlider'), rdIncreaseRateInput, 'rd');


        // Growth Chart Toggle Logic
        chartToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                activeChartDataset = button.dataset.chart;
                chartToggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateGrowthChart(); // Redraw chart with new data
            });
        });

         // Resize listener for charts
        window.addEventListener('resize', debounce(() => {
            if(finalValueChart) finalValueChart.resize();
            if(growthChart) growthChart.resize();
        }, 250));

        // Share Modal Listeners
        if(shareReportBtn) shareReportBtn.addEventListener('click', populateAndShowModal);
        if(closeModalBtn) closeModalBtn.addEventListener('click', () => shareModal.classList.add('hidden'));
        window.addEventListener('click', (event) => { if (event.target == shareModal) shareModal.classList.add('hidden'); });
        if(copyUrlBtn) copyUrlBtn.addEventListener('click', () => {
            shareUrlInput.select();
            try {
                // Use execCommand for better compatibility in potential iframe scenarios
                document.execCommand('copy');
                showNotification('Link copied to clipboard!');
            } catch (err) {
                 console.error('Copy failed:', err);
                 showNotification('Could not copy link.');
            }
        });
    }


    // --- Initial Run ---
    setupEventListeners();
    loadFromUrl(); // Load from URL first
    // Ensure initial state of inflation section is correct based on toggle
    const inflationInputContainer = getElem('inflationRateSlider')?.closest('.grid > div');
    if (inflationInputContainer) {
         inflationInputContainer.style.display = inflationToggle.checked ? 'block' : 'none';
    }
    updateComparison(); // Then run initial calculation
});
