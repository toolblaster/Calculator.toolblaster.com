/**
 * mini-calculators.js
 * This file contains the logic for all embedded mini-calculators across the website.
 * It scans the page for specific calculator IDs and initializes them if found.
 * This centralized approach prevents the need for multiple JS files.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /**
     * Centralized function to add the affiliate links.
     * This function creates and appends the affiliate links to any given calculator element.
     * @param {HTMLElement} calculatorElement - The main container div of the mini-calculator.
     */
    function addAffiliateLinks(calculatorElement) {
        // Check if an affiliate container already exists to prevent duplication
        if (calculatorElement.querySelector('.mini-calculator-affiliate')) {
            return;
        }

        const affiliateContainer = document.createElement('div');
        affiliateContainer.className = 'mini-calculator-affiliate';

        // Upstox Link
        const upstoxLink = document.createElement('a');
        upstoxLink.href = 'https://upstox.onelink.me/0H1s/2JAL6D';
        upstoxLink.target = '_blank';
        upstoxLink.rel = 'noopener noreferrer';
        upstoxLink.textContent = 'Start investing with Upstox';
        
        // 5paisa Link
        const paisaLink = document.createElement('a');
        paisaLink.href = 'https://www.5paisa.com/demat-account?ReferralCode=54285431&ReturnUrl=invest-open-account'; // Please replace with your actual affiliate link if different
        paisaLink.target = '_blank';
        paisaLink.rel = 'noopener noreferrer';
        paisaLink.textContent = 'Start investing with 5paisa';
        
        // Separator
        const separator = document.createElement('span');
        separator.className = 'mx-2';
        separator.textContent = '|';

        affiliateContainer.appendChild(upstoxLink);
        affiliateContainer.appendChild(separator);
        affiliateContainer.appendChild(paisaLink);
        calculatorElement.appendChild(affiliateContainer);
    }

    /**
     * Initializes the Retirement Corpus Mini-Calculator.
     * Finds the calculator by its ID, attaches an event listener, performs the calculation, and adds links.
     */
    function initRetirementCorpusCalculator() {
        const calculator = document.getElementById('mini-calc-retirement');
        if (!calculator) {
            return;
        }

        const expensesInput = document.getElementById('annual-expenses-input');
        const resultValue = document.getElementById('corpus-value');
        
        if (!expensesInput || !resultValue) return;
        
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
        // Automatically add the affiliate links
        addAffiliateLinks(calculator);
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
        
        if (!navInput1 || !navInput2 || !unitsResult1 || !unitsResult2) return;

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

        // Automatically add the affiliate links
        addAffiliateLinks(calculator);
    }


    // --- INITIALIZATION ---
    initRetirementCorpusCalculator();
    initRcaCalculator(); 

});

