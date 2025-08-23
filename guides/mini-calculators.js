/**
 * mini-calculators.js
 * This file contains the logic for all embedded mini-calculators across the website.
 * It scans the page for specific calculator IDs and initializes them if found.
 * This centralized approach prevents the need for multiple JS files.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /**
     * NEW: Centralized function to add the affiliate link.
     * This function creates and appends the affiliate link to any given calculator element.
     * @param {HTMLElement} calculatorElement - The main container div of the mini-calculator.
     */
    function addAffiliateLink(calculatorElement) {
        const affiliateContainer = document.createElement('div');
        affiliateContainer.className = 'mini-calculator-affiliate';

        const affiliateLink = document.createElement('a');
        affiliateLink.href = 'https://upstox.onelink.me/0H1s/2JAL6D';
        affiliateLink.target = '_blank';
        affiliateLink.rel = 'noopener noreferrer';
        affiliateLink.className = 'inline-flex items-center';
        affiliateLink.innerHTML = `
            Start investing with Upstox
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        `;

        affiliateContainer.appendChild(affiliateLink);
        calculatorElement.appendChild(affiliateContainer);
    }

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
        // Automatically add the affiliate link
        addAffiliateLink(calculator);
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

        // Automatically add the affiliate link
        addAffiliateLink(calculator);
    }


    // --- INITIALIZATION ---
    initRetirementCorpusCalculator();
    initRcaCalculator(); 

});