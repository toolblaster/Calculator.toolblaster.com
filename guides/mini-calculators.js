/**
 * mini-calculators.js
 * This file contains the logic for all embedded mini-calculators across the website.
 * It scans the page for specific calculator IDs and initializes them if found.
 * This centralized approach prevents the need for multiple JS files.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /**
     * Initializes the Retirement Corpus Mini-Calculator.
     * Finds the calculator by its ID, attaches an event listener, and performs the calculation.
     */
    function initRetirementCorpusCalculator() {
        const calculator = document.getElementById('mini-calc-retirement');
        if (!calculator) {
            return;
        }

        const expensesInput = document.getElementById('annual-expenses-input');
        const resultValue = document.getElementById('corpus-value');
        
        const formatCurrency = (num) => {
            if (isNaN(num) || num <= 0) return '₹0';
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(num);
        };

        const calculateCorpus = () => {
            const annualExpenses = parseFloat(expensesInput.value);
            if (annualExpenses > 0) {
                const targetCorpus = annualExpenses * 25;
                resultValue.textContent = formatCurrency(targetCorpus);
            } else {
                resultValue.textContent = '₹0';
            }
        };

        expensesInput.addEventListener('input', calculateCorpus);
    }

    /**
     * Initializes the Rupee Cost Averaging Mini-Calculator.
     * Demonstrates how investing a fixed amount yields different units at different prices.
     */
    function initRcaCalculator() {
        const calculator = document.getElementById('mini-calc-rca');
        if (!calculator) {
            return;
        }

        const navInput1 = document.getElementById('rca-nav-1');
        const navInput2 = document.getElementById('rca-nav-2');
        const unitsResult1 = document.getElementById('rca-units-1');
        const unitsResult2 = document.getElementById('rca-units-2');
        
        const investmentAmount = 10000;

        const calculateUnits = (navInput, unitsResult) => {
            const nav = parseFloat(navInput.value);
            if (nav > 0) {
                const units = investmentAmount / nav;
                unitsResult.textContent = units.toFixed(2);
            } else {
                unitsResult.textContent = '0.00';
            }
        };
        
        navInput1.addEventListener('input', () => calculateUnits(navInput1, unitsResult1));
        navInput2.addEventListener('input', () => calculateUnits(navInput2, unitsResult2));
        
        calculateUnits(navInput1, unitsResult1);
        calculateUnits(navInput2, unitsResult2);
    }


    // --- INITIALIZATION ---
    initRetirementCorpusCalculator();
    initRcaCalculator(); 

});
