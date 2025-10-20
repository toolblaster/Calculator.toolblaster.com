document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('retirement-quiz-form');
    if (!quizForm) return; // Exit if not on this quiz page

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
        const progress = (currentQuestionIndex / (questions.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function handleNext() {
         const currentQuestion = questions[currentQuestionIndex];
         const input = currentQuestion.querySelector('input');
         // UPDATED: Replaced alert() with showNotification() for better UX
         if (input.type === 'number' && !input.value) {
             // Ensure showNotification is available globally (from global-elements.js)
             if (typeof showNotification === 'function') {
                 showNotification('Please enter a value.');
             } else {
                 // Fallback for standalone testing
                 console.error('showNotification function not found. Please enter a value.');
             }
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
            // UPDATED: Replaced alert()
            if (typeof showNotification === 'function') {
                 showNotification("Retirement age must be greater than current age.");
            } else {
                 console.error("Retirement age must be greater than current age.");
            }
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
        const shortfallColor = isShortfall ? 'text-red-600' : 'text-green-600';
        const shortfallText = isShortfall ? formatCurrency(data.shortfall) : 'Surplus of ' + formatCurrency(Math.abs(data.shortfall));

        resultsContent.innerHTML = `
            <div class="report-card">
                <h2 class="text-lg font-bold text-gray-800 mb-2 title-with-accent">Your Retirement Report</h2>
                
                <div class="chart-container">
                    <canvas id="retirementChart"></canvas>
                </div>

                <div class="grid grid-cols-2 gap-2 text-left my-4">
                    <div class="bg-white p-2 rounded-lg shadow-sm">
                        <p class="text-xxs text-gray-500">Target Corpus</p>
                        <p class="font-bold text-md text-blue-600">${formatCurrency(data.targetCorpus)}</p>
                    </div>
                    <div class="bg-white p-2 rounded-lg shadow-sm">
                        <p class="text-xxs text-gray-500">Projected Corpus</p>
                        <p class="font-bold text-md text-green-600">${formatCurrency(data.projectedCorpus)}</p>
                    </div>
                     <div class="bg-white p-2 rounded-lg shadow-sm col-span-2">
                        <p class="text-xxs text-gray-500">Retirement Status</p>
                        <p class="font-bold text-md ${shortfallColor}">${shortfallText}</p>
                    </div>
                </div>
                
                ${isShortfall ? `
                <div class="bg-red-50 border-l-4 border-red-500 p-3 text-left rounded-r-lg">
                    <h3 class="font-bold text-red-800 text-sm">Action Plan</h3>
                    <p class="text-xs text-red-700 mt-1">To bridge this gap, you need to invest an additional <strong class="text-base">${formatCurrency(data.requiredAdditionalSIP)}</strong> per month.</p>
                </div>
                ` : `
                <div class="bg-green-50 border-l-4 border-green-500 p-3 text-left rounded-r-lg">
                     <h3 class="font-bold text-green-800 text-sm">Congratulations!</h3>
                    <p class="text-xs text-green-700 mt-1">You are on track to meet your retirement goals. Keep up the great work!</p>
                </div>
                `}
                
                <div class="mt-4 text-left">
                    <h3 class="text-sm font-bold text-gray-700 text-center mb-2">What's Next?</h3>
                    <div class="flex justify-center gap-2">
                        <a href="../index.html?mode=goal" class="flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-red-700 transition transform hover:scale-105 text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                            <span>Goal Planner</span>
                        </a>
                        <a href="retirement-planning-guide.html" class="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-md hover:bg-gray-50 transition transform hover:scale-105 text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                            <span>Read Guide</span>
                        </a>
                    </div>
                </div>

                 <div class="results-actions">
                    <button class="results-btn retake-quiz-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>
                        Retake Assessment
                    </button>
                </div>
            </div>
        `;
        resultsContent.style.display = 'block';
        
        const ctx = document.getElementById('retirementChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Projected', 'Target'],
                datasets: [{
                    label: 'Corpus Amount',
                    data: [data.projectedCorpus, data.targetCorpus],
                    backgroundColor: ['#60a5fa', '#f87171'],
                    borderColor: ['#2563eb', '#ef4444'],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { callback: value => formatCurrency(value).replace('₹', '') + ' ' } } }
            }
        });
        
        document.querySelector('.retake-quiz-btn').addEventListener('click', () => {
            currentQuestionIndex = 0;
            Object.keys(userAnswers).forEach(key => delete userAnswers[key]);
            resultsContent.style.display = 'none';
            quizContent.style.display = 'block';
            showQuestion(0);
            prevButton.disabled = true;
        });
    }

    // Event Listeners
    questions.forEach((question, index) => {
        const options = question.querySelectorAll('.option-label');
        options.forEach(label => {
            label.addEventListener('click', () => {
                if (isTransitioning) return;
                isTransitioning = true;

                const radio = label.querySelector('input[type="radio"]');
                userAnswers[radio.name] = radio.value;
                
                options.forEach(opt => opt.classList.remove('selected'));
                label.classList.add('selected');

                setTimeout(() => {
                    if (currentQuestionIndex < questions.length - 1) {
                        showQuestion(currentQuestionIndex + 1);
                    } else {
                        calculateAndShowResults();
                    }
                    isTransitioning = false;
                }, 300);
            });
        });
    });

    nextButton.addEventListener('click', handleNext);
    prevButton.addEventListener('click', () => { if (currentQuestionIndex > 0) showQuestion(currentQuestionIndex - 1); });
    
    showQuestion(0);
});
