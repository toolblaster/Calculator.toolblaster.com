// --- IMPORT SHARED UTILITIES ---
// No specific imports currently needed, assuming showNotification is global

document.addEventListener('DOMContentLoaded', () => {
    const quizContent = document.getElementById('quiz-content');
    if (!quizContent || !document.getElementById('health-quiz-form')) return;

    const resultsContent = document.getElementById('results-content');
    const questions = Array.from(document.querySelectorAll('.question-block')); // Get all question blocks
    const prevButton = document.getElementById('prev-btn');
    const progressBar = document.getElementById('progress-bar');
    
    const TOTAL_QUESTIONS = questions.length; // This will now correctly be 15
    if (TOTAL_QUESTIONS === 0) {
        console.error("No question blocks found!");
        return;
    }

    let currentQuestionIndex = 0;
    const userAnswers = {};
    let isTransitioning = false; // Flag to prevent rapid clicks
    let finalReport = {}; // To store results for sharing

    // --- Helper for Notifications ---
    function notifyUser(message) {
        if (typeof showNotification === 'function') {
            showNotification(message);
        } else {
            console.warn("showNotification function not found. Message:", message);
            // alert(message); // Avoid alert
        }
    }

    // --- Pillar Data Map ---
    const pillarMap = {
        'savings': {
            name: "Savings Rate",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>`,
            advice: {
                bad: 'Your savings rate is low. Focusing on this is the fastest way to build wealth. Aim for 15-20% of your income.',
                medium: 'You are on a good path, but increasing your savings rate even a little can dramatically accelerate your goals.',
                good: 'You have a great savings rate. Continue this discipline, and your future is bright.',
            },
            actions: [
                { text: 'Start an SIP', link: '../?mode=sip', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` },
                { text: 'Read Budget Guide', link: '../guides/financial-health-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` }
            ]
        },
        'emergency': {
            name: "Emergency Fund",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
            advice: {
                bad: 'Without a proper emergency fund, any unexpected event can force you into debt. This is your top priority.',
                medium: 'You have some savings, but aim to build a dedicated fund covering 3-6 months of expenses for full peace of mind.',
                good: 'Your emergency fund is strong. This provides a solid foundation for all other financial goals.',
            },
            actions: [
                { text: 'Read the Guide', link: '../guides/emergency-fund-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` },
                { text: 'Use RD Calculator', link: '../?mode=rd', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` }
            ]
        },
        'debt': {
            name: "Debt Management",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
            advice: {
                bad: 'High-interest debt is actively working against your wealth. Prioritize clearing this before anything else. It is a guaranteed return on investment.',
                medium: 'Your debt is manageable, but keep an eye on it. Use a strategy like the debt avalanche or snowball to clear it faster.',
                good: 'Your debt is well under control. This frees up your cash flow for savings and investments.',
            },
            actions: [
                { text: 'Read Debt Guide', link: '../guides/financial-health-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` },
                { text: 'Check Credit Score', link: '../guides/complete-credit-score-guide-in-india.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` }
            ]
        },
        'insurance': {
            name: "Insurance Coverage",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v6"/><path d="M15 11h-6"/></svg>`, // Changed icon to ShieldPlus
            advice: {
                bad: 'Inadequate insurance is a major risk. A medical event or tragedy could wipe out savings. Prioritize Health & Term insurance.',
                medium: 'You have some coverage, but review if it\'s truly adequate for your family\'s needs (sum insured, critical illness).',
                good: 'You are well-protected with essential insurance. This secures your financial foundation.',
            },
            actions: [
                { text: 'Read Insurance Guide', link: '../guides/financial-health-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` }
            ]
        },
        'goal': {
            name: "Goal Planning",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
            advice: {
                bad: 'Setting specific, measurable goals is the first step to investing successfully. Without a clear goal, you risk aimless saving and under-preparation.',
                medium: 'You have a goal in mind, but turning it into a concrete, actionable plan is key to staying on track and motivated.',
                good: 'You have a clear goal and a plan to achieve it. This focus will keep you motivated and disciplined.',
            },
            actions: [
                { text: 'Use the Goal Planner', link: '../?mode=goal', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` },
                { text: 'Read Goal Guide', link: '../guides/goal-based-investing.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` }
            ]
        },
        'tax': {
            name: "Tax Planning",
             icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9l-5-5Z"/><path d="M15 4v5h5"/><path d="M10 17h4"/><path d="M12 11v6"/></svg>`,
            advice: {
                bad: 'Last-minute tax planning often leads to suboptimal investment choices. Proactive planning saves tax AND builds wealth.',
                medium: 'You are planning your taxes, which is good. Automating investments (like ELSS SIP) can make it effortless and more effective.',
                good: 'You have a disciplined tax planning strategy. This ensures you save tax and align investments with long-term goals.',
            },
            actions: [
                { text: 'Read Tax Guide', link: '../guides/tax-saving-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` },
                 { text: 'Use Tax Calculator', link: '../calculators/income-tax-calculator/', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` }
            ]
        },
        'investing': { 
            name: "Investment Mindset",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m18 9-6 6-4-4-3 3"/></svg>`,
            advice: {
                bad: 'Your investment mindset appears very conservative. While safety is vital, consider growth assets (like equity MFs) to beat inflation and build significant wealth long-term.',
                medium: 'You have a balanced approach. Exploring diversification and goal-based investing can further enhance your portfolio.',
                good: 'You are a confident investor who understands risk and reward. Continue your disciplined approach to achieve your long-term goals.',
            },
            actions: [
                 { text: 'Take Risk Quiz', link: '../quizzes/risk-profile-quiz.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` },
                { text: 'Read Investing Guide', link: '../guides/beginner-investing-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` }
            ]
        }
    };


    /**
     * Shows the question at the specified index.
     * @param {number} index - The index of the question to show (0-based).
     */
    function showQuestion(index) {
        if (index < 0 || index >= TOTAL_QUESTIONS) {
             console.error("Attempted to show invalid question index:", index);
             return; // Prevent showing invalid index
        }
        questions.forEach((question, i) => {
            // Compare the node's index in the `questions` array
            question.classList.toggle('active', i === index);
        });
        currentQuestionIndex = index;
        prevButton.disabled = index === 0;
        updateProgressBar();
        isTransitioning = false; // Allow clicks again after showing
    }

    /**
     * Updates the progress bar width based on the current question index.
     */
    function updateProgressBar() {
        if (!progressBar) return;
        // Progress based on completing the *previous* step, out of TOTAL_QUESTIONS
        const progress = TOTAL_QUESTIONS > 0 ? (currentQuestionIndex / TOTAL_QUESTIONS) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    }

    /**
     * Animates the score display from start to end.
     */
    function animateValue(obj, start, end, duration) {
        // ... (function remains the same) ...
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    /**
     * Calculates scores for each pillar and the overall score, then displays results.
     */
    function calculateAndShowResults() {
        // --- Scoring Logic (FIXED to use all 15 questions) ---
        // This logic now matches the 15-question HTML file
        const savingsScore = parseInt(userAnswers.q1 || '1'); // Q7
        const emergencyScore = parseInt(userAnswers.q2 || '1'); // Q8
        const debtScore = 4 - parseInt(userAnswers.q3 || '1'); // Q9 (inverted)
        const insuranceScore = parseInt(userAnswers.q4 || '1'); // Q10
        const goalScore = parseInt(userAnswers.q_goal_started || '1'); // Q5
        const taxScore = parseInt(userAnswers.q_tax || '1'); // Q6

        // Risk questions (Q11-Q15, which are q5-q9 in the form)
        const q5 = parseInt(userAnswers.q5 || '1'); // Q11
        const q6 = parseInt(userAnswers.q6 || '1'); // Q12
        const q7 = parseInt(userAnswers.q7 || '1'); // Q13
        const q8 = parseInt(userAnswers.q8 || '1'); // Q14
        const q9 = parseInt(userAnswers.q9 || '3'); // Q15 (default to conservative)

        // Calculate investing rating
        const rawRiskScore = (q5 + q6 + q7 + q8 + (4 - q9)); // Invert q9
        let investingRating = 'bad'; // Default to 'bad' (conservative)
        if (rawRiskScore <= 7) investingRating = 'bad'; // Conservative
        else if (rawRiskScore <= 12) investingRating = 'medium'; // Balanced
        else investingRating = 'good'; // Aggressive
        
        // --- Normalization & Weighting ---
        const normalizedScores = {
            savings: ((savingsScore - 1) / (4 - 1)) * 100,
            emergency: ((emergencyScore - 1) / (3 - 1)) * 100,
            debt: ((debtScore - 1) / (3 - 1)) * 100,
            insurance: ((insuranceScore - 1) / (4 - 1)) * 100,
            goal: ((goalScore - 1) / (2 - 1)) * 100,
            tax: ((taxScore - 1) / (3 - 1)) * 100,
            investing: (investingRating === 'good' ? 100 : (investingRating === 'medium' ? 66 : 33))
        };


        // --- Calculate Weighted Overall Score ---
        const weights = { savings: 0.15, emergency: 0.20, debt: 0.15, insurance: 0.10, goal: 0.10, tax: 0.10, investing: 0.20 };
        let weightedScoreSum = 0;
        let totalWeight = 0;
        for (const pillar in normalizedScores) {
             const scoreValue = parseFloat(normalizedScores[pillar]);
             if (!isNaN(scoreValue)) {
                 weightedScoreSum += scoreValue * (weights[pillar] || 0.10);
                 totalWeight += (weights[pillar] || 0.10);
             } else {
                 console.warn(`Invalid score for pillar: ${pillar}`);
             }
        }
        const overallScore = totalWeight > 0 ? Math.max(0, Math.min(100, Math.round(weightedScoreSum / totalWeight))) : 0;

        console.log("Normalized Scores:", normalizedScores);
        console.log("Overall Score:", overallScore);

        // --- Determine Ratings & Priorities ---
        const getRating = (score) => {
             const numericScore = parseFloat(score);
             if (isNaN(numericScore)) return 'bad';
             if (numericScore < 40) return 'bad';
             if (numericScore < 70) return 'medium';
             return 'good';
        };

        const pillars = Object.keys(normalizedScores).map(key => ({
            id: key,
            score: normalizedScores[key],
            // Use the specific investingRating for the investing pillar
            rating: (key === 'investing') ? investingRating : getRating(normalizedScores[key])
        }));


        // Sort pillars by score (lowest first) to determine priorities
        const sortedPillars = [...pillars].sort((a, b) => a.score - b.score);

        // Populate the priority list in the results HTML
        const priorityList = document.getElementById('priority-list');
        if (priorityList) {
            let priorityHTML = `<li>Focus on improving your <strong>${pillarMap[sortedPillars[0].id]?.name || sortedPillars[0].id}</strong>.</li>`;
            if (sortedPillars.length > 1) {
                priorityHTML += `<li>Your next step should be to work on your <strong>${pillarMap[sortedPillars[1].id]?.name || sortedPillars[1].id}</strong>.</li>`;
            }
             if (sortedPillars.length > 2) {
                priorityHTML += `<li>Then address your <strong>${pillarMap[sortedPillars[2].id]?.name || sortedPillars[2].id}</strong>.</li>`;
            }
            priorityList.innerHTML = priorityHTML;
        } else {
            console.error("Priority list element not found");
        }


        // --- Generate Results HTML ---
        const pillarGrid = document.querySelector('.pillar-grid');
        pillarGrid.innerHTML = ''; // Clear previous cards
        pillars.forEach(p => {
            const data = pillarMap[p.id];
            if (!data) {
                console.error(`Pillar data not found for key: ${p.id}`);
                return;
            }
             let advice = data.advice[p.rating];

            const ratingText = p.rating.charAt(0).toUpperCase() + p.rating.slice(1);
            const ratingClass = `rating-${p.rating === 'good' ? 'green' : (p.rating === 'medium' ? 'yellow' : 'red')}`;

            const actionButtons = data.actions.map(action => `
                 <a href="${action.link}" class="action-btn">
                    ${action.icon || ''}
                    <span>${action.text}</span>
                 </a>
            `).join('');

            pillarGrid.innerHTML += `
                <div class="pillar-card">
                    <div class="pillar-header">
                        <h4 class="pillar-title">${data.icon} ${data.name}</h4>
                        <span class="pillar-rating ${ratingClass}">${ratingText}</span>
                    </div>
                    <p class="pillar-advice">${advice}</p>
                    <div class="action-btn-container">
                        ${actionButtons}
                    </div>
                </div>
            `;
        });

        // Update Overall Score Display
        const scoreCircle = document.getElementById('score-circle');
        const overallScoreElem = document.getElementById('overall-score');
        if (scoreCircle && overallScoreElem) {
            scoreCircle.className = 'score-circle'; // Reset classes
            if (overallScore <= 20) scoreCircle.classList.add('score-very-low');
            else if (overallScore <= 40) scoreCircle.classList.add('score-low');
            else if (overallScore <= 60) scoreCircle.classList.add('score-medium');
            else if (overallScore <= 80) scoreCircle.classList.add('score-good');
            else scoreCircle.classList.add('score-excellent');

            animateValue(overallScoreElem, 0, overallScore, 1000); // Animate score
        } else {
             console.error("Score display elements not found");
        }

        // Store final report data for sharing
        finalReport = {
            score: overallScore,
            priorities: [
                pillarMap[sortedPillars[0]?.id]?.name || 'N/A',
                pillarMap[sortedPillars[1]?.id]?.name || 'N/A'
            ]
        };

        // --- Show Results ---
        if (quizContent) quizContent.style.display = 'none';
        if (resultsContent) resultsContent.style.display = 'block';

        // --- Re-attach Event Listeners for Dynamic Buttons ---
        const retakeButtons = resultsContent.querySelectorAll('.retake-quiz-btn');
        const shareButton = resultsContent.querySelector('#share-report-btn');

        retakeButtons.forEach(btn => {
             btn.removeEventListener('click', resetQuiz);
             btn.addEventListener('click', resetQuiz);
        });
        if (shareButton) {
             shareButton.removeEventListener('click', handleShareReport);
             shareButton.addEventListener('click', handleShareReport);
        } else {
            console.error("Share button not found in results content.");
        }
    }


    /**
     * Handles sharing the quiz results via Web Share API or clipboard fallback.
     */
    function handleShareReport() {
        // ... (function remains the same) ...
        if (!finalReport.score) {
            notifyUser("Please complete the assessment first.");
            return;
        }
        const summaryText = `I just took the Financial Health Assessment and scored ${finalReport.score}/100! My top priorities are ${finalReport.priorities[0]} and ${finalReport.priorities[1]}. Check your score: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: 'My Financial Health Report Card',
                text: summaryText,
                url: window.location.href,
            }).catch(err => {
                console.error("Share API failed:", err.message);
                copyToClipboard(summaryText); // Fallback to copy
            });
        } else {
            copyToClipboard(summaryText); // Fallback if Share API not supported
        }
    }

    /**
     * Copies text to the clipboard (fallback mechanism).
     */
    function copyToClipboard(text) {
        // ... (function remains the same) ...
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Prevent scrolling
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                notifyUser('Report summary copied to clipboard!');
            } else {
                 throw new Error('execCommand failed');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            notifyUser('Could not copy summary. Please copy manually.');
        }
        document.body.removeChild(textArea);
    }

    /**
     * Resets the quiz state and UI.
     */
    function resetQuiz() {
        // ... (function remains the same) ...
        Object.keys(userAnswers).forEach(key => delete userAnswers[key]);
        finalReport = {};
        document.querySelectorAll('.option-label.selected').forEach(l => l.classList.remove('selected'));
        const quizForm = quizContent.querySelector('#health-quiz-form');
        if(quizForm) quizForm.reset();

        resultsContent.style.display = 'none';
        quizContent.style.display = 'block';
        showQuestion(0); // Go back to the first question
    }

    // --- Event Listeners Setup (FIXED) ---
    questions.forEach((question, index) => { // 'index' is the 0-14 index in the NodeList
        const options = question.querySelectorAll('.option-label');
        options.forEach(label => {
            label.addEventListener('click', () => {
                if (isTransitioning) return;
                isTransitioning = true;

                const radio = label.querySelector('input[type="radio"]');
                if (!radio) { isTransitioning = false; return; }
                userAnswers[radio.name] = radio.value;

                // Update visual selection
                question.querySelectorAll('.option-label').forEach(opt => opt.classList.remove('selected'));
                label.classList.add('selected');

                // Advance after delay
                setTimeout(() => {
                    // We use the 'index' from the forEach loop's closure
                    // which is 0 for Q1, 1 for Q2, ... 14 for Q15.
                    if (index < TOTAL_QUESTIONS - 1) { // e.g., on Q14 (index 13): 13 < 14 -> TRUE
                        showQuestion(index + 1); // Show next question in the list
                    } else {
                        // This block runs when the last question (index 14) is clicked
                        if(progressBar) progressBar.style.width = '100%';
                        calculateAndShowResults();
                        isTransitioning = false; // **FIX**: Reset flag here
                    }
                     // 'isTransitioning' is reset in showQuestion() for non-final questions
                }, 250);
            });
        });
    });


    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0 && !isTransitioning) {
            isTransitioning = true; // Prevent clicks while going back
            // 'currentQuestionIndex' is updated by showQuestion, so this is correct
            showQuestion(currentQuestionIndex - 1); 
        }
    });

    // --- Initial setup ---
    showQuestion(0); // Show the first question (index 0)

});
