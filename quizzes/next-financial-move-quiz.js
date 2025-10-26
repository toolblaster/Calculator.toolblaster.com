// --- IMPORT SHARED UTILITIES ---
// Importing formatCurrency from utils.js (assuming it's available)
import { formatCurrency } from '../assets/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('next-move-quiz-form');
    if(!quizForm) return; // Exit if not on this page

    const quizContent = document.getElementById('quiz-content');
    const resultsContent = document.getElementById('results-content');
    const allQuestions = Array.from(document.querySelectorAll('.question-block'));
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const prevBtn = document.getElementById('prev-btn');

    let userAnswers = {};
    let visibleQuestions = []; // Stores the currently relevant questions based on answers
    let currentVisibleIndex = 0; // Index within the visibleQuestions array

    // --- Helper for Notifications ---
    function notifyUser(message) {
        // Use the globally available showNotification or fallback
        if (typeof showNotification === 'function') {
            showNotification(message);
        } else {
            console.warn("showNotification function not found. Message:", message);
            // alert(message); // Avoid alert if possible
        }
    }

    // --- Results Data (Map containing info for each possible result) ---
    const resultsMap = {
        'emergency': {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
            title: "Build Your Emergency Fund",
            reason: "This is your financial foundation. Without it, any unexpected event (job loss, medical bill) can force you into debt or derail your investments.",
            whatIf: `Saving just ${formatCurrency(5000)} a month in an RD for one year builds a safety net over ${formatCurrency(60000)}.`,
            links: [
                { text: 'Guide to Emergency Funds', url: '../guides/emergency-fund-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
                { text: 'Use the RD Calculator', url: '../?mode=rd', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M15 18h1"/></svg>` }
            ]
        },
        'debt': {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
            title: "Tackle High-Interest Debt",
            reason: "High-interest debt (like credit cards) actively eats away at your wealth. Clearing it gives you a guaranteed high return (the interest rate you stop paying!).",
            whatIf: `Paying an extra ${formatCurrency(2000)}/month on a ${formatCurrency(50000)} credit card balance (at 36% APR) saves thousands in interest & clears it years sooner.`,
            links: [
                { text: 'Guide on Debt Management', url: '../guides/financial-health-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
                { text: 'Use the EMI Calculator', url: '../calculators/emi-calculator/', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M15 18h1"/></svg>` }
            ]
        },
        'savings': {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>`,
            title: "Boost Your Savings Rate",
            reason: "You can't invest what you don't save. Increasing your savings rate, even slightly, is the fuel for all your future financial goals and investments.",
            whatIf: `Increasing savings by 5% of a ${formatCurrency(50000)} income means ${formatCurrency(30000)} extra invested yearly. In 10 years, that's over ${formatCurrency(700000)} (at 12% return).`,
            links: [
                { text: 'Guide to Financial Health', url: '../guides/financial-health-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
                { text: 'Use the SIP Calculator', url: '../?mode=sip', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M15 18h1"/></svg>` }
            ]
        },
        'tax': {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9l-5-5Z"/><path d="M15 4v5h5"/><path d="M10 17h4"/><path d="M12 11v6"/></svg>`,
            title: "Plan Your Tax-Saving",
            reason: "Smart tax planning isn't just about saving tax now; it's a golden opportunity to build long-term wealth using powerful instruments like ELSS or PPF.",
            whatIf: `Investing ${formatCurrency(12500)}/month in ELSS via SIP to save tax could grow to over ${formatCurrency(2500000)} in 10 years (assuming 12% returns).`,
            links: [
                { text: 'Guide to Smart Tax-Saving', url: '../guides/tax-saving-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
                { text: 'Use the Tax Calculator', url: '../calculators/income-tax-calculator/', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M15 18h1"/></svg>` }
            ]
        },
        'investing': {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`,
            title: "Start Systematic Investing (SIP)",
            reason: "You've built a solid base. Now it's time to put your money to work consistently and let the magic of compounding build your long-term wealth.",
            whatIf: `A ${formatCurrency(10000)} monthly SIP for retirement could grow to over ${formatCurrency(10000000)} in 25 years (assuming 12% returns).`,
            links: [
                { text: 'Guide: SIP vs. Lumpsum', url: '../guides/sip-vs-lumpsum.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
                { text: 'Use the SIP Calculator', url: '../?mode=sip', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M15 18h1"/></svg>` }
            ]
        },
        'optimize': {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
            title: "Optimize Your Portfolio",
            reason: "You've mastered the basics! Now, focus on fine-tuning your investments to perfectly align with your risk profile and specific life goals for maximum efficiency.",
             whatIf: `Aligning specific investments (e.g., equity for long-term, debt for short-term) ensures you take the right risk and can reach goals sooner or with less stress.`,
            links: [
                { text: 'Guide to Goal-Based Investing', url: '../guides/goal-based-investing.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
                { text: 'Use the Goal Planner', url: '../?mode=goal', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M15 18h1"/></svg>` }
            ]
        }
    };

    // --- Core Logic Functions ---

    /**
     * Updates the visibleQuestions array based on current answers.
     */
    function updateVisibleQuestions() {
        visibleQuestions = allQuestions.filter(q => {
            const conditionAttr = q.dataset.condition;
            if (!conditionAttr) return true; // Always show if no condition
            try {
                const condition = JSON.parse(conditionAttr);
                // Check if all conditions for this question are met by current answers
                return Object.entries(condition).every(([key, value]) => userAnswers[key] === value);
            } catch (e) {
                console.error("Error parsing question condition:", conditionAttr, e);
                return true; // Show if condition is invalid (fail safe)
            }
        });
        // We only update the progress bar/text when showing the question
    }

    /**
     * Shows the question at the currentVisibleIndex within the visibleQuestions array.
     */
    function showCurrentQuestion() {
        allQuestions.forEach(q => q.classList.remove('active')); // Hide all first
        const currentQ = visibleQuestions[currentVisibleIndex];
        if (currentQ) {
            currentQ.classList.add('active');
            // Check if the current question has already been answered and highlight the option
            const inputName = currentQ.querySelector('input[type="radio"]')?.name;
            if (inputName && userAnswers[inputName]) {
                 const selectedRadio = currentQ.querySelector(`input[name="${inputName}"][value="${userAnswers[inputName]}"]`);
                 if(selectedRadio) {
                     // Ensure previous selections in the same question block are cleared visually
                     currentQ.querySelectorAll('.option-label').forEach(opt => opt.classList.remove('selected'));
                     // Select the current one
                     selectedRadio.closest('.option-label').classList.add('selected');
                 }
            }
        } else {
             console.error(`Attempted to show question at index ${currentVisibleIndex}, but it's not in the visible list.`);
             // Handle this error state, maybe reset or go back? For now, log it.
        }
        prevBtn.disabled = currentVisibleIndex === 0;
        updateProgress(); // Update progress bar and text
    }

    /**
     * Updates the progress bar and text based on the current position within visibleQuestions.
     */
    function updateProgress() {
        const totalVisible = visibleQuestions.length;
        // Calculate progress based on having *completed* the previous step, moving towards the current one.
        const progressPercentage = totalVisible > 0 ? (currentVisibleIndex / totalVisible) * 100 : 0;

        if(progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }
        if(progressText) {
             const currentStep = Math.min(currentVisibleIndex + 1, totalVisible); // Step number is 1-based
             progressText.textContent = `Step ${currentStep} of ${totalVisible}`;
        }
    }

    /**
     * Generates the HTML for the action links in the results card.
     */
    function generateActionLinksHTML(links) {
        // ... (function remains the same) ...
        return links.map(link => `
            <li>
                <a href="${link.url}">
                    ${link.icon || `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`}
                    <span>${link.text}</span>
                </a>
            </li>
        `).join('');
    }

    /**
     * Displays the final results based on the determined primary and secondary actions.
     */
    function displayResults(primaryKey, secondaryKey) {
        // ... (function remains the same) ...
        const primary = resultsMap[primaryKey];
        const secondary = resultsMap[secondaryKey];

        if (!primary || !secondary) {
            console.error("Invalid result keys:", primaryKey, secondaryKey);
            notifyUser("Could not generate results. Please try again.");
            return;
        }

        resultsContent.innerHTML = `
            <div class="results-header">
                <div id="result-header-icon">${primary.icon}</div>
                <h2 class="result-title">${primary.title}</h2>
                <p class="result-description">Based on your answers, this is your most important next step. See your personalized primary and secondary actions below.</p>
            </div>

            <div class="action-grid">
                <!-- Primary Action Card -->
                <div class="action-card primary">
                    <div class="action-card-header">
                        <span class="tag">Primary Action</span>
                        <h4>${primary.title}</h4>
                    </div>
                    <p class="reason">${primary.reason}</p>
                    <ul>${generateActionLinksHTML(primary.links)}</ul>
                    <div class="what-if-card">
                        <h5>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0V8.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L6.2 9.74a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clip-rule="evenodd" /></svg>
                            Impact Scenario
                        </h5>
                        <p class="what-if-body">${primary.whatIf}</p>
                    </div>
                </div>
                <!-- Secondary Action Card -->
                <div class="action-card secondary">
                     <div class="action-card-header">
                        <span class="tag">Secondary Action</span>
                        <h4>${secondary.title}</h4>
                    </div>
                    <p class="reason">${secondary.reason}</p>
                    <ul>${generateActionLinksHTML(secondary.links)}</ul>
                     <div class="what-if-card">
                         <h5>
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0V8.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L6.2 9.74a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clip-rule="evenodd" /></svg>
                             Impact Scenario
                         </h5>
                        <p class="what-if-body">${secondary.whatIf}</p>
                    </div>
                </div>
            </div>
            <!-- Using btn-secondary styles -->
            <button id="retake-quiz-btn" class="btn-secondary mt-6 inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3l-3.3 3.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.3l3.3-3.3"/></svg>
                <span>Take the Quiz Again</span>
            </button>
        `;

        quizContent.style.display = 'none';
        resultsContent.style.display = 'block';

        // Attach listener AFTER results content is added to DOM
        const retakeBtn = document.getElementById('retake-quiz-btn');
        if (retakeBtn) {
            retakeBtn.addEventListener('click', resetQuiz);
        } else {
            console.error("Retake button not found after rendering results.");
        }
    }

    /**
     * Calculates the primary and secondary action based on user answers.
     */
    function calculateResults() {
        // --- Scoring Logic ---
        const scores = {
            emergency: userAnswers.q_emergency === 'yes' ? 10 : 0,
            debt: userAnswers.q_debt === 'no' ? 10 : 1,
            savings: userAnswers.q_savings_rate === 'low' ? 2 : (userAnswers.q_savings_rate === 'medium' ? 5 : 10),
            tax: userAnswers.q_tax === 'yes' ? 10 : 3,
            investing: userAnswers.q_investing === 'yes' ? 10 : 4
        };
        console.log("Calculated Scores:", scores);

        // --- Determine Primary Action ---
        let primaryAction = 'optimize';
        if (scores.emergency === 0) primaryAction = 'emergency';
        else if (scores.debt === 1) primaryAction = 'debt';
        else if (scores.savings <= 5) primaryAction = 'savings'; // Includes low and medium savings
        else if (scores.tax === 3) primaryAction = 'tax';
        else if (scores.investing === 4) primaryAction = 'investing';
        console.log("Determined Primary Action:", primaryAction);

        // --- Determine Secondary Action ---
        let secondaryAction = 'optimize';
        let sortedScores = Object.entries(scores)
                                .filter(([key]) => key !== primaryAction) // Exclude primary
                                .sort(([,a],[,b]) => a-b); // Sort by score ascending (lowest score first)

        if (sortedScores.length > 0) {
            const [nextLowestKey, nextLowestScore] = sortedScores[0];
            // Map the key back to the action name
            if (nextLowestKey === 'emergency') secondaryAction = 'emergency';
            else if (nextLowestKey === 'debt') secondaryAction = 'debt';
            else if (nextLowestKey === 'savings') secondaryAction = 'savings';
            else if (nextLowestKey === 'tax') secondaryAction = 'tax';
            else if (nextLowestKey === 'investing') secondaryAction = 'investing';
            else secondaryAction = 'optimize'; // Fallback

            // If the next lowest score is actually high (10), default to optimize or investing
            if (nextLowestScore === 10) {
                secondaryAction = (primaryAction === 'investing') ? 'optimize' : 'investing';
            }
        } else {
             secondaryAction = (primaryAction === 'investing') ? 'optimize' : 'investing';
        }

        // Final check: if primary and secondary ended up the same, find the next best
        if (primaryAction === secondaryAction) {
             if (sortedScores.length > 1) { // Check if there's a second-lowest option
                  const [secondLowestKey] = sortedScores[1];
                  if (secondLowestKey === 'emergency') secondaryAction = 'emergency';
                  else if (secondLowestKey === 'debt') secondaryAction = 'debt';
                  else if (secondLowestKey === 'savings') secondaryAction = 'savings';
                  else if (secondLowestKey === 'tax') secondaryAction = 'tax';
                  else if (secondLowestKey === 'investing') secondaryAction = 'investing';
                  else secondaryAction = 'optimize'; // Fallback if needed
             } else {
                 // If truly no other low score, default to optimize
                 secondaryAction = 'optimize';
             }
        }

        console.log("Determined Secondary Action:", secondaryAction);
        displayResults(primaryAction, secondaryAction);
    }


    /**
     * Resets the quiz state and UI to start over.
     */
    function resetQuiz() {
        console.log("Resetting Quiz");
        userAnswers = {};
        currentVisibleIndex = 0;
        document.querySelectorAll('.option-label.selected').forEach(l => l.classList.remove('selected'));
        if(resultsContent) resultsContent.style.display = 'none';
        if(quizContent) quizContent.style.display = 'block';
        updateVisibleQuestions(); // Recalculate based on empty answers
        showCurrentQuestion(); // Show the first question
    }

    /**
     * Navigates to the previous visible question.
     */
    function handlePrevious() {
        if (currentVisibleIndex > 0) {
             // Simply decrement the index within the visible questions array
             currentVisibleIndex--;
             // When going back, clear the answer for the question we *were* on,
             // so the condition logic re-evaluates correctly if the user changes an earlier answer.
             // This assumes the user might change their path.
             // const questionToClear = visibleQuestions[currentVisibleIndex + 1]; // The one we came FROM
             // const inputNameToClear = questionToClear?.querySelector('input[type="radio"]')?.name;
             // if (inputNameToClear && userAnswers[inputNameToClear]) {
             //    delete userAnswers[inputNameToClear];
             //    console.log("Cleared answer for:", inputNameToClear);
             //    updateVisibleQuestions(); // Re-update visibility based on cleared answer
             //}
             // ^^ This clearing logic might be too aggressive or confusing. Let's stick to just showing the previous.
             showCurrentQuestion();
        }
    }


    // --- Event Listeners Setup ---
    allQuestions.forEach((question) => {
        const options = question.querySelectorAll('.option-label');
        options.forEach(label => {
            label.addEventListener('click', (e) => {
                const radio = label.querySelector('input[type="radio"]');
                if (!radio) return;

                const questionName = radio.name;
                const selectedValue = radio.value;
                const currentQuestionElement = radio.closest('.question-block'); // Get the DOM element of the current question
                const currentQuestionIndexInAll = allQuestions.indexOf(currentQuestionElement); // Get its index in the original full list


                // Update answer
                userAnswers[questionName] = selectedValue;
                console.log("Answered:", questionName, "=", selectedValue);

                // Update visual selection
                if (currentQuestionElement) {
                    currentQuestionElement.querySelectorAll('.option-label').forEach(opt => opt.classList.remove('selected'));
                    label.classList.add('selected');
                }

                // Use setTimeout for smoother transition
                setTimeout(() => {
                    // 1. Recalculate which questions should be visible based on *all* current answers
                    updateVisibleQuestions();

                    // 2. Find the *next* question in the *original* sequence (allQuestions)
                    //    that is *also* present in the *new* visibleQuestions array.
                    let nextQuestionToShow = null;
                    for (let i = currentQuestionIndexInAll + 1; i < allQuestions.length; i++) {
                        if (visibleQuestions.includes(allQuestions[i])) {
                            nextQuestionToShow = allQuestions[i];
                            break;
                        }
                    }

                    // 3. Determine the new index and show the question or results
                    if (nextQuestionToShow) {
                        // Find the index of this next question within the *visibleQuestions* array
                        const nextVisibleIndex = visibleQuestions.indexOf(nextQuestionToShow);
                        if (nextVisibleIndex !== -1) {
                             currentVisibleIndex = nextVisibleIndex; // Update the main index
                             showCurrentQuestion();
                        } else {
                             // This case should ideally not happen if updateVisibleQuestions is correct
                             console.error("Next question found but not in visible list?");
                             calculateResults(); // Fallback to results
                        }
                    } else {
                        // If no next visible question found in the sequence, calculate results
                        calculateResults();
                    }
                }, 150); // Short delay
            });
        });
    });

    prevBtn.addEventListener('click', handlePrevious);

    // --- Initial setup ---
    updateVisibleQuestions(); // Determine initial list of visible questions
    showCurrentQuestion(); // Show the first question (index 0)

});
