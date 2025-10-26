// **** UPDATED: Import necessary functions ****
import { formatCurrency, debounce, updateSliderFill, syncSliderAndInput } from '../assets/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('retirement-quiz-form');
    if (!quizForm) return; // Exit if not on this quiz page

    const resultsContent = document.getElementById('results-content');
    const quizContent = document.getElementById('quiz-content');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const questions = document.querySelectorAll('.question-block');

    // **** UPDATED: Get references to new slider/input elements ****
    const currentSavingsInput = document.getElementById('currentSavingsInput');
    const monthlyInvestmentInput = document.getElementById('monthlyInvestmentInput');
    const currentSavingsSlider = document.getElementById('currentSavingsSlider');
    const monthlyInvestmentSlider = document.getElementById('monthlyInvestmentSlider');

    let currentQuestionIndex = 0;
    const userAnswers = {};
    let isTransitioning = false;

    // --- Helper to safely call showNotification ---
    function notifyUser(message) {
        // Use the globally available showNotification or fallback
        if (typeof showNotification === 'function') {
            showNotification(message);
        } else {
            console.warn("showNotification function not found. Message:", message);
            // Fallback alert (avoid in production if possible)
            // alert(message); 
        }
    }
    // --- End Helper ---

    function showQuestion(index) {
        // **** UPDATED: Check for specific input types to show/hide Next button ****
        const currentQuestion = questions[index];
        const hasSliderInput = currentQuestion.querySelector('input[type="range"]'); // Check if it uses a slider
        const isRadioInput = currentQuestion.querySelector('input[type="radio"]');

        // Show next button only for slider/number inputs, hide for radio buttons
        if (nextButton) {
             nextButton.style.display = hasSliderInput ? 'block' : 'none';
        }
        
        questions.forEach((q, i) => q.classList.toggle('active', i === index));
        currentQuestionIndex = index;
        if (prevButton) {
            prevButton.disabled = index === 0;
        }
        updateProgressBar();
    }

    function updateProgressBar() {
        if (!progressBar) return;
        const progress = questions.length > 1 ? (currentQuestionIndex / (questions.length - 1)) * 100 : (currentQuestionIndex >= 0 ? 100 : 0);
        progressBar.style.width = `${progress}%`;
    }

    function handleNext() {
         const currentQuestion = questions[currentQuestionIndex];
         // **** UPDATED: Get the number input associated with the slider ****
         const input = currentQuestion.querySelector('input[type="number"]'); 
         
         if (!input) {
             console.error("Number input element not found in current question block.");
             return; 
         }

         // Basic validation for number inputs
         const value = parseFloat(input.value);
         const min = parseFloat(input.min);
         const max = parseFloat(input.max);

         if (isNaN(value) || value < min || value > max || input.value.trim() === '') {
             notifyUser(`Please enter a valid amount between ${formatCurrency(min)} and ${formatCurrency(max)}.`);
             input.classList.add('input-error'); // Add error class
             const errorElement = document.getElementById(input.id.replace('Input', 'Error'));
             if(errorElement) errorElement.classList.remove('hidden');
             return;
         } else {
             input.classList.remove('input-error'); // Remove error class if valid
             const errorElement = document.getElementById(input.id.replace('Input', 'Error'));
             if(errorElement) errorElement.classList.add('hidden');
         }

         userAnswers[input.name] = input.value; // Store the value from the number input
         
         if (currentQuestionIndex < questions.length - 1) {
            showQuestion(currentQuestionIndex + 1);
         } else {
            calculateAndShowResults();
         }
    }

    function calculateAndShowResults() {
        const ageMap = { 'Under 25': 23, '25-35': 30, '36-45': 40, '46+': 50 };
        const expenseMap = { 'Less than ₹30,000': 25000, '₹30,000 - ₹60,000': 45000, '₹60,000 - ₹1 Lakh': 80000, 'More than ₹1 Lakh': 120000 };

        if (!userAnswers.currentAge || !userAnswers.retirementAge || !userAnswers.monthlyExpenses || userAnswers.currentSavings === undefined || userAnswers.monthlyInvestment === undefined) {
             notifyUser("Please answer all questions before submitting.");
             return;
        }

        // **** UPDATED: Read values directly from userAnswers object ****
        const currentAge = ageMap[userAnswers.currentAge];
        const retirementAge = parseInt(userAnswers.retirementAge);
        const monthlyExpenses = expenseMap[userAnswers.monthlyExpenses];
        const currentSavings = parseFloat(userAnswers.currentSavings); // Value is already stored from handleNext
        const monthlyInvestment = parseFloat(userAnswers.monthlyInvestment); // Value is already stored from handleNext

        const yearsToRetirement = retirementAge - currentAge;
        if (yearsToRetirement <= 0) {
            notifyUser("Retirement age must be greater than current age.");
            return;
        }
        const inflationRate = 0.06;
        const preRetirementReturn = 0.12;
        const postRetirementReturn = 0.08;

        const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
        const annualExpenses = futureMonthlyExpenses * 12;
        const realReturn = ((1 + postRetirementReturn) / (1 + inflationRate)) - 1;

        if (realReturn <= 0) {
             notifyUser("Calculations suggest post-retirement returns may not beat inflation. Target corpus cannot be accurately determined.");
             displayResults({ targetCorpus: Infinity, projectedCorpus: 0, shortfall: Infinity, requiredAdditionalSIP: Infinity }); 
             return;
        }

        // Calculate Target Corpus (using annuity formula for post-retirement period of 30 years)
        // PV = C * [1 - (1 + r)^-n] / r
        const targetCorpus = (annualExpenses / realReturn) * (1 - Math.pow(1 + realReturn, -30));


        // Calculate Projected Corpus
        const fvSavings = currentSavings * Math.pow(1 + preRetirementReturn, yearsToRetirement);
        const monthlyRate = preRetirementReturn / 12;
        const months = yearsToRetirement * 12;
        // FV of SIP = P * [((1 + i)^n - 1) / i] * (1 + i)
        const fvSip = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate); 
        const projectedCorpus = fvSavings + fvSip;

        const shortfall = targetCorpus - projectedCorpus;
        // Required SIP = FV * [i / ((1 + i)^n - 1)] / (1 + i)
        const requiredAdditionalSIP = shortfall > 0 ? (shortfall * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)) : 0;

        if (!isFinite(targetCorpus) || !isFinite(projectedCorpus) || !isFinite(shortfall) || !isFinite(requiredAdditionalSIP)) {
             notifyUser("Could not calculate results due to input values. Please review your entries.");
             displayResults({ targetCorpus: NaN, projectedCorpus: NaN, shortfall: NaN, requiredAdditionalSIP: NaN });
             return;
        }

        displayResults({ targetCorpus, projectedCorpus, shortfall, requiredAdditionalSIP });
    }

    // formatCurrency is now imported from utils.js

    function displayResults(data) {
        if (!quizContent || !resultsContent) return;
        quizContent.style.display = 'none';

        if (isNaN(data.targetCorpus) || !isFinite(data.targetCorpus)) {
             resultsContent.innerHTML = `
                 <div class="report-card">
                     <h2 class="text-lg font-bold text-gray-800 mb-2 title-with-accent">Calculation Error</h2>
                     <p class="text-red-600 mb-4">Could not calculate retirement needs based on the provided inputs. Please ensure retirement age is greater than current age and review other entries.</p>
                     <div class="results-actions">
                         <button class="results-btn retake-quiz-btn">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>
                             Retake Assessment
                         </button>
                     </div>
                 </div>
             `;
             resultsContent.style.display = 'block';
             const retakeBtn = resultsContent.querySelector('.retake-quiz-btn');
             if(retakeBtn) {
                 retakeBtn.addEventListener('click', handleRetake);
             }
             return; 
        }

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
                        <a href="../?mode=goal" class="flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-red-700 transition transform hover:scale-105 text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                            <span>Goal Planner</span>
                        </a>
                        <a href="../guides/retirement-planning-guide.html" class="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-md hover:bg-gray-50 transition transform hover:scale-105 text-xs">
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

        const chartCanvas = document.getElementById('retirementChart');
        if (chartCanvas) {
            const ctx = chartCanvas.getContext('2d');
            new Chart(ctx, { /* ... Chart config remains the same ... */ 
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
                    scales: { 
                         x: { 
                             beginAtZero: true, 
                             ticks: { 
                                 callback: value => formatCurrency(value).replace('₹', '') + ' ' 
                             } 
                         } 
                    }
                }
            });
        }
        const retakeBtn = resultsContent.querySelector('.retake-quiz-btn');
        if (retakeBtn) {
            retakeBtn.addEventListener('click', handleRetake);
        }
    }

    function handleRetake() {
        currentQuestionIndex = 0;
        Object.keys(userAnswers).forEach(key => delete userAnswers[key]);
        isTransitioning = false;
        resultsContent.style.display = 'none';
        resultsContent.innerHTML = '';
        quizContent.style.display = 'block';
        quizForm.reset();
        document.querySelectorAll('.option-label.selected').forEach(label => label.classList.remove('selected'));
        // **** UPDATED: Reset slider values and fills ****
        if (currentSavingsSlider && currentSavingsInput) {
            currentSavingsInput.value = 500000; // Reset to default
            currentSavingsSlider.value = 500000;
            updateSliderFill(currentSavingsSlider);
        }
         if (monthlyInvestmentSlider && monthlyInvestmentInput) {
            monthlyInvestmentInput.value = 10000; // Reset to default
            monthlyInvestmentSlider.value = 10000;
            updateSliderFill(monthlyInvestmentSlider);
        }
        
        showQuestion(0);
        if (prevButton) prevButton.disabled = true;
    }

    // Event Listeners
    questions.forEach((question, index) => {
        const options = question.querySelectorAll('.option-label');
        options.forEach(label => {
            label.addEventListener('click', () => {
                // Radio button logic (auto-advance)
                if (isTransitioning) return;
                isTransitioning = true;
                const radio = label.querySelector('input[type="radio"]');
                if (radio) { // Ensure it's a radio button
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
                } else {
                    // If not a radio button (e.g., slider question), just mark as done conceptually
                    // The 'Next' button handles saving the value for sliders/numbers
                    isTransitioning = false; 
                }
            });
        });
    });

    if (nextButton) nextButton.addEventListener('click', handleNext);
    if (prevButton) prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    });

    // **** UPDATED: Initial setup for sliders ****
    // Ensure sliders sync with inputs initially and update on change
    if(currentSavingsSlider && currentSavingsInput) {
        syncSliderAndInput({ sliderId: 'currentSavingsSlider', inputId: 'currentSavingsInput', updateCallback: null }); // No need to auto-calculate on slider change
    }
     if(monthlyInvestmentSlider && monthlyInvestmentInput) {
        syncSliderAndInput({ sliderId: 'monthlyInvestmentSlider', inputId: 'monthlyInvestmentInput', updateCallback: null }); // No need to auto-calculate on slider change
    }
    
    // Initial setup
    showQuestion(0);
});
