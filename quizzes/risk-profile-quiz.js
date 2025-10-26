// --- IMPORT SHARED UTILITIES ---
// No specific imports needed for this quiz's core logic currently
// Assuming showNotification is globally available via script.js

document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('risk-quiz-form');
    if (!quizForm) return; // Exit if not on this quiz page

    const resultsContent = document.getElementById('results-content');
    const quizContent = document.getElementById('quiz-content');
    const questions = document.querySelectorAll('.question-block');
    const prevButton = document.getElementById('prev-btn');
    const progressBar = document.getElementById('progress-bar');

    let currentQuestionIndex = 0;
    const userAnswers = {};
    let isTransitioning = false; // Flag to prevent rapid clicks
    let finalResultData = {}; // Store result for sharing

    // --- Helper for Notifications ---
    function notifyUser(message) {
        if (typeof showNotification === 'function') {
            showNotification(message);
        } else {
            console.warn("showNotification function not found. Message:", message);
            // alert(message); // Avoid alert
        }
    }

    /**
     * Shows the question at the specified index.
     * @param {number} index - The index of the question to show.
     */
    function showQuestion(index) {
        questions.forEach((question, i) => {
            question.classList.toggle('active', i === index);
        });
        currentQuestionIndex = index;
        prevButton.disabled = index === 0;
        updateProgressBar();
        isTransitioning = false; // Allow clicks again
    }

    /**
     * Updates the progress bar width based on the current question index.
     */
    function updateProgressBar() {
        if (!progressBar) return;
        // Progress based on completing the *previous* step
        const progress = questions.length > 1 ? (currentQuestionIndex / questions.length) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    }

    /**
     * Calculates the risk profile score based on answers and displays the results.
     */
    function calculateAndShowResults() {
        // Simple scoring: Assign 1 for conservative, 2 for balanced, 3 for aggressive
        // Q5 is inverted: value 1 means higher risk appetite (not missing out), value 3 means lower (fear of loss)
        let score = 0;
        score += parseInt(userAnswers.q1 || '1'); // Default to 1 if missing
        score += parseInt(userAnswers.q2 || '1');
        score += parseInt(userAnswers.q3 || '1');
        score += parseInt(userAnswers.q4 || '1');
        // Invert Q5 scoring: 1 -> 3, 2 -> 2, 3 -> 1
        const q5Value = parseInt(userAnswers.q5 || '3'); // Default to most conservative if missing
        score += (q5Value === 1 ? 3 : (q5Value === 3 ? 1 : 2));

        console.log("Risk Score Calculated:", score); // Debug log

        // Define profile data including CSS classes
        const resultProfiles = {
            conservative: {
                title: 'You are a Conservative Investor',
                iconBg: 'bg-blue-600', // Tailwind class for background
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
                titleColor: 'text-blue-700', // Tailwind text color
                actionBtnColor: 'text-blue-600', // For icons/text within action buttons
                description: 'You prioritize the safety of your initial capital above all else. You are most comfortable with low-risk investments that offer predictable, stable returns, even if they are modest.',
                recommendations: [
                    { text: 'FD Calculator', link: '../?mode=fd', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="11" rx="2"/><path d="M7 12v4"/><path d="M12 12v4"/><path d="M17 12v4"/><path d="M5 8v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/></svg>` },
                    { text: 'RD Calculator', link: '../?mode=rd', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>` },
                    { text: 'PPF Calculator', link: '../calculators/ppf-calculator/', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` }
                ],
                hoverClass: 'conservative-hover' // Class for hover effect
            },
            balanced: {
                title: 'You are a Balanced Investor',
                iconBg: 'bg-yellow-500',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18"/><path d="M16 16l-4-4-4 4"/><path d="M8 8l4 4 4-4"/></svg>`,
                titleColor: 'text-yellow-700',
                actionBtnColor: 'text-yellow-600',
                description: 'You seek a healthy mix of safety and growth. You\'re willing to take moderate risk for better returns than traditional savings, but still value capital preservation.',
                recommendations: [
                    { text: 'Lumpsum Calculator', link: '../?mode=lumpsum', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>` },
                    { text: 'Goal Planner', link: '../?mode=goal', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>` },
                    { text: 'Compare Investments', link: '../compare-investments.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>` }
                ],
                hoverClass: 'balanced-hover'
            },
            aggressive: {
                title: 'You are an Aggressive Investor',
                iconBg: 'bg-green-600',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>`,
                titleColor: 'text-green-700',
                 actionBtnColor: 'text-green-600',
                description: 'You focus on maximizing long-term growth and are comfortable taking significant market risk. You understand volatility is part of achieving high returns.',
                recommendations: [
                    { text: 'SIP Calculator', link: '../?mode=sip', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>` },
                    { text: 'Goal Planner', link: '../?mode=goal', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>` },
                    { text: 'Stock Market Guide', link: '../guides/stock-market-guide-in-india.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` }
                ],
                hoverClass: 'aggressive-hover'
            }
        };

        // Determine profile based on score thresholds
        if (score <= 7) {
            finalResultData = resultProfiles.conservative;
        } else if (score <= 12) {
            finalResultData = resultProfiles.balanced;
        } else {
            finalResultData = resultProfiles.aggressive;
        }

        // Generate HTML for recommendations, passing the action button color class
        let recommendationsHTML = finalResultData.recommendations.map(rec => `
            <a href="${rec.link}" class="action-btn ${finalResultData.hoverClass}">
                 <div class="icon-wrapper ${finalResultData.actionBtnColor}"> ${rec.icon} </div>
                <span class="${finalResultData.actionBtnColor}">${rec.text}</span>
            </a>
        `).join('');


        // Populate results content
        resultsContent.innerHTML = `
            <div class="report-card">
                 <div class="result-icon-wrapper ${finalResultData.iconBg}">
                     ${finalResultData.icon}
                 </div>
                <h2 class="result-title ${finalResultData.titleColor}">${finalResultData.title}</h2>
                <p class="result-description">${finalResultData.description}</p>

                <div class="recommendation-section">
                    <h3 class="recommendation-title">Explore Tools & Guides Suited For You:</h3>
                    <div class="action-btn-container">
                        ${recommendationsHTML}
                    </div>
                </div>

                <div class="results-actions">
                     <button id="share-report-btn" class="results-btn btn-secondary"> <!-- Applied btn-secondary style -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                        Share Report
                    </button>
                    <button class="results-btn retake-quiz-btn btn-secondary"> <!-- Applied btn-secondary style -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3l-3.3 3.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.3l3.3-3.3"/></svg>
                        Retake Quiz
                    </button>
                </div>
                <!-- Disclaimer -->
                <p class="text-xs font-light text-gray-500 mt-6 pt-4 border-t border-gray-200">
                    <strong>Disclaimer:</strong> This quiz provides a general indication of risk profile. For personalized investment advice, please consult a qualified financial advisor. Your answers are not stored.
                </p>
            </div>
        `;

        // Hide quiz, show results
        if (quizContent) quizContent.style.display = 'none';
        if (resultsContent) resultsContent.style.display = 'block';

        // Re-attach event listeners for the newly added buttons
        const retakeBtn = resultsContent.querySelector('.retake-quiz-btn');
        const shareBtn = resultsContent.querySelector('#share-report-btn');
        if (retakeBtn) retakeBtn.addEventListener('click', handleRetakeQuiz);
        if (shareBtn) shareBtn.addEventListener('click', handleShareReport);

        // --- Apply dynamic styles for action buttons using inline styles ---
         resultsContent.querySelectorAll('.action-btn').forEach(btn => {
            const actionBtnColorClass = finalResultData.actionBtnColor; // e.g., 'text-blue-600'

            // Extract the color name and shade (e.g., 'blue', '600')
            const colorParts = actionBtnColorClass.match(/text-([a-z]+)-(\d+)/);
            if (colorParts && colorParts.length === 3) {
                const colorName = colorParts[1];
                const colorShade = colorParts[2];
                // Construct the corresponding Tailwind variable name
                const colorVar = `var(--tw-${colorName}-${colorShade})`; // Assumes Tailwind CSS variables are available

                 // Apply color to the span text
                 const span = btn.querySelector('span');
                 if (span) {
                    span.style.color = colorVar;
                 }

                // Apply color to the SVG icon
                 const svgContainer = btn.querySelector('.icon-wrapper'); // Target the wrapper
                 if (svgContainer) {
                    svgContainer.style.color = colorVar; // Apply to wrapper for potential SVG inheritance
                     const svg = svgContainer.querySelector('svg');
                     if(svg) {
                        svg.style.color = colorVar; // Apply directly to SVG too
                     }
                 }
            } else {
                console.warn("Could not parse color class:", actionBtnColorClass);
            }
        });

    }


    /**
     * Resets the quiz to its initial state.
     */
    function handleRetakeQuiz() {
        Object.keys(userAnswers).forEach(key => delete userAnswers[key]); // Clear answers object
        finalResultData = {}; // Clear result data
        document.querySelectorAll('.option-label.selected').forEach(l => l.classList.remove('selected')); // Deselect visual options
        quizForm.reset(); // Reset the actual form inputs

        if(resultsContent) resultsContent.style.display = 'none'; // Hide results
        if(resultsContent) resultsContent.innerHTML = ''; // Clear results content
        if(quizContent) quizContent.style.display = 'block'; // Show quiz content
        showQuestion(0); // Show the first question
    }

    /**
     * Handles sharing the quiz results.
     */
    function handleShareReport() {
        if (!finalResultData.title) {
            notifyUser("Please complete the quiz first.");
            return;
        }
        // Extract the profile name cleanly
        const profileName = finalResultData.title.split(' are a ')[1] || 'Investor'; // Fallback
        const summaryText = `I took the Investor Profile Quiz and discovered I'm a ${profileName}! Find out your profile: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: 'My Investor Profile Result',
                text: summaryText,
                url: window.location.href,
            }).catch(err => {
                console.error("Share API failed:", err.message);
                // Fallback to copy if Share API fails or is cancelled
                copyToClipboard(summaryText);
            });
        } else {
            // Fallback for browsers without Share API
            copyToClipboard(summaryText);
        }
    }

    /**
     * Copies text to the clipboard (fallback mechanism).
     * @param {string} text - The text to copy.
     */
    function copyToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Prevent scrolling
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            // Use execCommand for broader compatibility
            const successful = document.execCommand('copy');
            if (successful) {
                notifyUser('Result summary copied to clipboard!');
            } else {
                 throw new Error('execCommand failed');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            notifyUser('Could not copy summary. Please copy manually.');
        }
        document.body.removeChild(textArea);
    }


    // --- Event Listeners Setup ---
    questions.forEach((question) => {
        const options = question.querySelectorAll('.option-label');
        options.forEach(label => {
            label.addEventListener('click', () => {
                if (isTransitioning) return; // Prevent multiple clicks during transition
                isTransitioning = true; // Set flag

                const radio = label.querySelector('input[type="radio"]');
                if (!radio) {
                    isTransitioning = false; // Reset flag if no radio found
                    return;
                }
                userAnswers[radio.name] = radio.value;

                // Update visual selection
                question.querySelectorAll('.option-label').forEach(opt => opt.classList.remove('selected'));
                label.classList.add('selected');

                // Advance to next question or show results after a short delay
                setTimeout(() => {
                    if (currentQuestionIndex < questions.length - 1) {
                        showQuestion(currentQuestionIndex + 1);
                    } else {
                         // Update progress to 100% before showing results
                         if(progressBar) progressBar.style.width = `100%`;
                        calculateAndShowResults();
                         isTransitioning = false; // Reset flag after results shown
                    }
                    // 'isTransitioning' is reset within showQuestion for normal flow
                }, 250); // Delay for visual feedback
            });
        });
    });

    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0 && !isTransitioning) {
            isTransitioning = true; // Prevent clicks while going back
            showQuestion(currentQuestionIndex - 1);
        }
    });

    // --- Initial setup ---
    showQuestion(0); // Show the first question
});
