document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('retirement-quiz-form');
    if (!quizForm) return; // Exit if not on the quiz page
    
    const resultsContent = document.getElementById('results-content');
    const quizContent = document.getElementById('quiz-content');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const questions = document.querySelectorAll('.question-block');

    let currentQuestionIndex = 0;
    const userAnswers = {};
    let isTransitioning = false;

    function showQuestion(index) {
        const isNumberInput = questions[index].querySelector('input[type="number"]');
        nextButton.style.display = isNumberInput ? 'block' : 'none';
        questions.forEach((q, i) => q.classList.toggle('active', i === index));
        currentQuestionIndex = index;
        prevButton.disabled = index === 0;
        updateProgressBar();
    }
    
    function updateProgressBar() {
        progressBar.style.width = `${(currentQuestionIndex / (questions.length - 1)) * 100}%`;
    }

    function handleNext() {
         const currentQuestion = questions[currentQuestionIndex];
         const input = currentQuestion.querySelector('input');
         if (input.type === 'number' && !input.value) {
             alert('Please enter a value.');
             return;
         }
         userAnswers[input.name] = input.value;
         if (currentQuestionIndex < questions.length - 1) {
            showQuestion(currentQuestionIndex + 1);
         } else {
            calculateAndShowResults();
         }
    }

    function calculateAndShowResults() {
        const ageMap = { 'Under 25': 23, '25-35': 30, '36-45': 40, '46+': 50 };
        const expenseMap = { 'Less than ₹30,000': 25000, '₹30,000 - ₹60,000': 45000, '₹60,000 - ₹1 Lakh': 80000, 'More than ₹1 Lakh': 120000 };

        const currentAge = ageMap[userAnswers.currentAge];
        const retirementAge = parseInt(userAnswers.retirementAge);
        const monthlyExpenses = expenseMap[userAnswers.monthlyExpenses];
        const currentSavings = parseFloat(userAnswers.currentSavings);
        const monthlyInvestment = parseFloat(userAnswers.monthlyInvestment);

        const yearsToRetirement = retirementAge - currentAge;
        if (yearsToRetirement <= 0) {
            alert("Retirement age must be greater than current age.");
            return;
        }
        const inflationRate = 0.06;
        const preRetirementReturn = 0.12;
        const postRetirementReturn = 0.08;

        const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
        const annualExpenses = futureMonthlyExpenses * 12;
        const realReturn = ((1 + postRetirementReturn) / (1 + inflationRate)) - 1;
        const targetCorpus = (annualExpenses / realReturn) * (1 - Math.pow(1 / (1 + realReturn), 30));

        const fvSavings = currentSavings * Math.pow(1 + preRetirementReturn, yearsToRetirement);
        const monthlyRate = preRetirementReturn / 12;
        const months = yearsToRetirement * 12;
        const fvSip = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const projectedCorpus = fvSavings + fvSip;
        
        const shortfall = targetCorpus - projectedCorpus;
        const requiredAdditionalSIP = shortfall > 0 ? (shortfall * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)) : 0;
        
        displayResults({ targetCorpus, projectedCorpus, shortfall, requiredAdditionalSIP });
    }
    
    function formatCurrency(num) {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(num));
    }

    function displayResults(data) {
        quizContent.style.display = 'none';
        const isShortfall = data.shortfall > 0;
        const shortfallText = isShortfall ? formatCurrency(data.shortfall) : 'Surplus of ' + formatCurrency(Math.abs(data.shortfall));
        resultsContent.innerHTML = `...`; // Results HTML
        resultsContent.style.display = 'block';
        
        const ctx = document.getElementById('retirementChart').getContext('2d');
        new Chart(ctx, { /* ... chart config ... */ });
        
        document.querySelector('.retake-quiz-btn').addEventListener('click', () => { /* ... reset logic ... */ });
    }

    // Event Listeners
    questions.forEach((question, index) => {
        question.querySelectorAll('.option-label').forEach(label => {
            label.addEventListener('click', () => {
                userAnswers[label.querySelector('input').name] = label.querySelector('input').value;
                setTimeout(() => handleNext(), 300);
            });
        });
    });
    nextButton.addEventListener('click', handleNext);
    prevButton.addEventListener('click', () => { if (currentQuestionIndex > 0) showQuestion(currentQuestionIndex - 1); });
    showQuestion(0);
});