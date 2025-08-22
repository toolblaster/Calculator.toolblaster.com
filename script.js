/**
 * This script handles all functionalities for the Calculator.toolblaster website.
 * It loads components on every page and ONLY initializes the calculator
 * or specific quizzes if it finds their HTML on the current page.
 */

// --- GLOBAL UTILITY FUNCTION ---
// Moved to the global scope so it can be accessed by calculator.js
function showNotification(message) {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {

    // --- SECTION 1: DYNAMIC COMPONENT LOADING ---

    const loadComponent = (componentPath, placeholderId) => {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            return Promise.resolve();
        }

        return fetch(componentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${componentPath}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                if (placeholderId === 'header-placeholder' || placeholderId === 'footer-placeholder') {
                    placeholder.outerHTML = html;
                } else {
                    placeholder.innerHTML = html;
                }
            })
            .catch(error => {
                console.error(`Error loading component ${componentPath}:`, error);
                if(placeholder) {
                    placeholder.innerHTML = `<p class="text-center text-red-500">Error: Could not load component.</p>`;
                }
            });
    };

    const setActiveNavLink = () => {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links a');

        navLinks.forEach(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname;
            if (linkPath === currentPath || ( (currentPath === '/' || currentPath === '/index.html') && (linkPath === '/' || linkPath === '/index.html') )) {
                link.classList.add('active');
                const dropdownMenu = link.closest('.dropdown-menu');
                if (dropdownMenu) {
                    const dropdownToggle = dropdownMenu.previousElementSibling;
                    if (dropdownToggle) {
                        dropdownToggle.classList.add('active');
                    }
                }
            }
        });
    };

    // --- DYNAMIC GUIDES HUB LOGIC (REFINED) ---
    const initializeGuidesHub = () => {
        const guidesContainer = document.getElementById('guides-grid-container');
        const paginationContainer = document.getElementById('pagination-container');
        const filterContainer = document.getElementById('guides-filter-container');
        const searchInput = document.getElementById('search-input');
        const recommendationsSection = document.getElementById('recommendations-section');
        const recommendedGuidesContainer = document.getElementById('recommended-guides-container');

        if (!guidesContainer || !filterContainer) return;

        const allContent = [
            // --- Content with type property, no tags ---
            { id: 'financial-health-guide', url: 'guides/financial-health-guide.html', title: 'Your Guide to Financial Health & Wellness', description: 'Understand the pillars of financial health and get your personalized report card.', linkText: 'Read More', type: 'guide' },
            { id: 'emergency-fund-guide', url: 'guides/emergency-fund-guide.html', title: 'Your Step-by-Step Guide to Building an Emergency Fund', description: 'Learn the essential steps to create a robust financial safety net.', type: 'guide' },
            { id: 'goal-based-investing', url: 'guides/goal-based-investing.html', title: 'Goal-Based Investing: A Roadmap to Your Dreams', description: 'Discover how to align your investments with your life goals, big or small.', type: 'guide' },
            { id: 'mfguide', url: 'guides/mfguide.html', title: 'A Beginner\'s Guide to Investing in India', description: 'A comprehensive beginner\'s guide to mutual funds and SIPs.', type: 'guide' },
            { id: 'retirement-planning-guide', url: 'guides/retirement-planning-guide.html', title: 'Your Guide to a Happy and Stress-Free Retirement in India', description: 'An in-depth look at retirement planning for a secure future.', type: 'guide' },
            { id: 'tax-saving-guide', url: 'guides/tax-saving-guide.html', title: 'Your Friendly Guide to Smart Tax-Saving (Section 80C)', description: 'Explore the best tax-saving investments under Section 80C.', type: 'guide' },
            { id: 'sip-vs-lumpsum', url: 'guides/sip-vs-lumpsum.html', title: 'SIP vs. Lumpsum: The Ultimate Investment Showdown', description: 'Understand the pros and cons of SIP and Lumpsum investing to choose the right strategy.', type: 'guide' },
            { id: 'sip-vs-swp', url: 'guides/sip-vs-swp.html', title: 'SIP vs. SWP: Building Your Wealth vs. Creating Your Paycheck', description: 'Learn the difference between accumulating wealth with SIPs and generating income with SWPs.', type: 'guide' },
            { id: 'sip-vs-rd', url: 'guides/sip-vs-rd.html', title: 'SIP vs. RD: Which Investment is Right for You?', description: 'A guide to help you choose between a SIP and a Recurring Deposit for your financial goals.', type: 'guide' },
            { id: 'risk-profile-quiz', url: 'guides/risk-profile-quiz.html', title: 'What\'s Your Investor Profile?', description: 'Take our quick quiz to understand your tolerance for investment risks.', linkText: 'Take the Quiz', type: 'quiz' },
            { id: 'financial-health-assessment', url: 'guides/financial-health-assessment.html', title: 'Your Financial Health Assessment', description: 'Answer 15 quick questions to get your personalized financial report card.', linkText: 'Take the Assessment', type: 'quiz' },
            { id: 'financial-habits-assessment-quiz', url: 'guides/financial-habits-assessment-quiz.html', title: 'Financial Habits Assessment Quiz', description: 'Discover your money mindset and get a personalized score.', linkText: 'Take the Quiz', type: 'quiz' },
            { id: 'secure-retirement-forecaster-quiz', url: 'guides/secure-retirement-forecaster-quiz.html', title: 'Secure Retirement Forecaster Quiz', description: 'Assess your retirement readiness and get a personalized report on your target corpus.', linkText: 'Take the Quiz', type: 'quiz' },
            { id: 'are-you-on-track-to-become-a-millionaire-quiz', url: 'guides/are-you-on-track-to-become-a-millionaire-quiz.html', title: 'Are You on Track to Become a Millionaire? Quiz', description: 'Take this quick quiz to see if your financial habits are on track to build significant wealth.', linkText: 'Take the Quiz', type: 'quiz' }
        ];

        let currentPage = 1;
        let currentFilter = 'guide'; // Default to 'guide'
        let currentSearchQuery = '';
        const itemsPerPage = 9;

        function getFilteredAndSearchedContent() {
            let filtered = allContent.filter(item => item.type === currentFilter);
            if (currentSearchQuery) {
                const query = currentSearchQuery.toLowerCase();
                filtered = filtered.filter(item =>
                    item.title.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query)
                );
            }
            return filtered;
        }

        function createCardHTML(item) {
            const linkText = item.linkText || 'Read More';
            return `
                <a href="${item.url}" class="guide-card">
                    <h2>${item.title}</h2>
                    <p>${item.description || ''}</p>
                    <span class="read-more-link">${linkText}</span>
                </a>
            `;
        }

        function displayContent(page) {
            currentPage = page;
            const filteredContent = getFilteredAndSearchedContent();
            guidesContainer.classList.add('fade-out');
            setTimeout(() => {
                guidesContainer.innerHTML = '';
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedContent = filteredContent.slice(startIndex, endIndex);

                if (paginatedContent.length === 0) {
                    guidesContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">No items match your criteria.</p>`;
                } else {
                    paginatedContent.forEach(item => {
                        guidesContainer.innerHTML += createCardHTML(item);
                    });
                }
                guidesContainer.classList.remove('fade-out');
                guidesContainer.classList.add('fade-in');
                setupPagination();
            }, 300);
        }

        function setupPagination() {
            paginationContainer.innerHTML = '';
            const filteredContent = getFilteredAndSearchedContent();
            const pageCount = Math.ceil(filteredContent.length / itemsPerPage);

            if (pageCount <= 1) return;

            const createButton = (text, page, isDisabled = false) => {
                const button = document.createElement('button');
                button.innerHTML = text;
                button.disabled = isDisabled;
                if (page === currentPage) button.classList.add('active');
                button.classList.add('px-3', 'py-1', 'border', 'border-gray-300', 'rounded', 'hover:bg-gray-200', 'transition-colors');
                button.addEventListener('click', () => displayContent(page));
                return button;
            };

            paginationContainer.appendChild(createButton('&laquo; Prev', currentPage - 1, currentPage === 1));
            for (let i = 1; i <= pageCount; i++) {
                paginationContainer.appendChild(createButton(i, i));
            }
            paginationContainer.appendChild(createButton('Next &raquo;', currentPage + 1, currentPage === pageCount));
        }

        function showRecommendations() {
            const recommendations = JSON.parse(sessionStorage.getItem('financialHealthRecommendations'));
            if (recommendations && recommendations.length > 0) {
                recommendedGuidesContainer.innerHTML = '';
                recommendations.forEach(recId => {
                    const guide = allContent.find(g => g.id === recId);
                    if (guide) {
                        recommendedGuidesContainer.innerHTML += createCardHTML(guide);
                    }
                });
                recommendationsSection.classList.remove('hidden');
            }
        }

        filterContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.filter-btn');
            if (button) {
                const filter = button.dataset.filter;
                if (filter !== currentFilter) {
                    currentFilter = filter;
                    filterContainer.querySelector('.active').classList.remove('active');
                    button.classList.add('active');
                    searchInput.value = '';
                    currentSearchQuery = '';
                    displayContent(1);
                }
            }
        });

        searchInput.addEventListener('input', () => {
            currentSearchQuery = searchInput.value;
            displayContent(1);
        });

        showRecommendations();
        displayContent(1);
    };

    // --- SECTION 2: PAGE INITIALIZATION ---

    const initializePage = () => {
        const isGuidePage = window.location.pathname.includes('/guides/');
        const basePath = isGuidePage ? '../' : '';

        const loadPromises = [
            loadComponent(`${basePath}assets/components/header.html`, 'header-placeholder'),
            loadComponent(`${basePath}assets/components/footer.html`, 'footer-placeholder')
        ];

        if (document.getElementById('dynamic-content-area')) {
            loadPromises.push(loadComponent(`${basePath}assets/components/content.html`, 'dynamic-content-area'));
        }

        Promise.all(loadPromises).then(() => {
            setupMobileMenu();
            setupDropdownMenu();
            setActiveNavLink();

            if (window.location.pathname.endsWith('investingguides.html') || window.location.pathname === '/investingguides.html') {
                initializeGuidesHub();
            }

            initializeShareButtons();

            if (window.location.pathname.includes('financial-health-assessment.html')) {
                initializeFinancialHealthQuiz();
            }

            if (window.location.pathname.includes('secure-retirement-forecaster-quiz.html')) {
                initializeRetirementForecasterQuiz();
            }
            
            if (window.location.pathname.includes('are-you-on-track-to-become-a-millionaire-quiz.html')) {
                initializeMillionaireQuiz();
            }
        });
    };

    // --- FINANCIAL HEALTH QUIZ LOGIC ---
    function initializeFinancialHealthQuiz() {
        const quizContent = document.getElementById('quiz-content');
        const resultsContent = document.getElementById('results-content');
        const questions = document.querySelectorAll('.question-block');
        const prevButton = document.getElementById('prev-btn');
        const progressBar = document.getElementById('progress-bar');
        const retakeButtons = document.querySelectorAll('.retake-quiz-btn');
        const shareButton = document.getElementById('share-report-btn');
        
        let currentQuestionIndex = 0;
        const userAnswers = {};
        let isTransitioning = false;
        let finalReport = {};
        let savingsChart, debtChart;

        function showQuestion(index) {
            questions.forEach((question, i) => {
                question.classList.toggle('active', i === index);
            });
            currentQuestionIndex = index;
            prevButton.disabled = index === 0;
            updateProgressBar();
        }

        function updateProgressBar() {
            const progress = (currentQuestionIndex / (questions.length - 1)) * 100;
            progressBar.style.width = `${progress}%`;
        }

        function animateValue(obj, start, end, duration) {
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
        
        function createActionButton(text, link, iconSvg) {
            return `
                <a href="${link}" class="action-btn">
                    ${iconSvg}
                    <span>${text}</span>
                </a>
            `;
        }

        function createBarChart(canvasId, yourRate) {
            const ctx = document.getElementById(canvasId).getContext('2d');
            if (savingsChart) savingsChart.destroy();
            savingsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Your Rate', 'Recommended'],
                    datasets: [{
                        label: 'Savings Rate %',
                        data: [yourRate, 20],
                        backgroundColor: ['#fca5a5', '#86efac'],
                        borderColor: ['#ef4444', '#22c55e'],
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true, max: 40 } }
                }
            });
        }

        function createPieChart(canvasId, emiPercentage) {
            const ctx = document.getElementById(canvasId).getContext('2d');
            if (debtChart) debtChart.destroy();
            debtChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['EMIs', 'Remaining Income'],
                    datasets: [{
                        data: [emiPercentage, 100 - emiPercentage],
                        backgroundColor: ['#ef4444', '#e5e7eb'],
                        hoverOffset: 4
                    }]
                },
                 options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } }
                }
            });
        }

        function calculateAndShowResults() {
            const scoreCircle = document.getElementById('score-circle');
            if (!scoreCircle) {
                console.error("Score circle element not found!");
                return;
            }
            // Scoring Logic
            const scores = {
                savings: (parseInt(userAnswers.q1, 10) -1) * (100/3/7),
                emergency: (parseInt(userAnswers.q2, 10) -1) * (100/2/7),
                debt: (parseInt(userAnswers.q3, 10) -1) * (100/2/7),
                insurance: (parseInt(userAnswers.q4, 10) -1) * (100/3/7),
                goal: (parseInt(userAnswers.q_goal_started, 10) -1) * (100/1/7),
                tax: (parseInt(userAnswers.q_tax, 10) -1) * (100/2/7),
                investing: (
                    (parseInt(userAnswers.q5, 10) -1) +
                    (parseInt(userAnswers.q6, 10) -1) +
                    (parseInt(userAnswers.q7, 10) -1) +
                    (parseInt(userAnswers.q8, 10) -1) +
                    (parseInt(userAnswers.q9, 10) -1)
                ) * (100/10/7)
            };

            const totalScore = Math.round(scores.savings + scores.emergency + scores.debt + scores.insurance + scores.goal + scores.tax + scores.investing);
            const scoreElement = document.getElementById('overall-score');
            animateValue(scoreElement, 0, totalScore, 1000);

            // Dynamic Score Color Logic
            scoreCircle.className = 'score-circle'; // Reset classes
            if (totalScore <= 20) {
                scoreCircle.classList.add('score-very-low');
            } else if (totalScore <= 40) {
                scoreCircle.classList.add('score-low');
            } else if (totalScore <= 60) {
                scoreCircle.classList.add('score-medium');
            } else if (totalScore <= 80) {
                scoreCircle.classList.add('score-good');
            } else {
                scoreCircle.classList.add('score-excellent');
            }


            const pillarGrid = document.querySelector('.pillar-grid');
            pillarGrid.innerHTML = ''; // Clear previous results

            const iconGoal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`;
            const iconSIP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>`;
            const iconGuide = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;
            const iconFD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
            const iconLumpsum = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`;

            const pillars = [];

            // Savings Pillar
            let savingsPillar = { name: "Savings Rate", score: scores.savings };
            if (userAnswers.q1 >= 3) {
                savingsPillar.rating = 'Excellent';
                savingsPillar.ratingClass = 'rating-green';
                savingsPillar.advice = 'Great job! You have a strong savings habit. Consider optimizing your investments.';
                savingsPillar.actions = createActionButton('Use Goal Planner', '../index.html?mode=goal', iconGoal);
            } else {
                savingsPillar.rating = userAnswers.q1 == 2 ? 'Good' : 'Needs Improvement';
                savingsPillar.ratingClass = userAnswers.q1 == 2 ? 'rating-yellow' : 'rating-red';
                savingsPillar.advice = userAnswers.q1 == 2 ? 'You\'re on the right track. See if you can increase your savings slightly to accelerate your goals.' : 'Making saving a priority is the first step. Start small and see how it grows.';
                savingsPillar.actions = createActionButton('Go to SIP Calculator', '../index.html?mode=sip', iconSIP);
                savingsPillar.chart = `<div class="chart-container"><canvas id="savingsRateChart"></canvas></div>`;
            }
            pillars.push(savingsPillar);

            // Emergency Fund Pillar
            let emergencyPillar = { name: "Emergency Fund", score: scores.emergency };
            if (userAnswers.q2 == 3) {
                emergencyPillar.rating = 'Prepared';
                emergencyPillar.ratingClass = 'rating-green';
                emergencyPillar.advice = 'Excellent! Your safety net is in place, allowing you to invest with confidence.';
                emergencyPillar.actions = '';
            } else {
                emergencyPillar.rating = userAnswers.q2 == 2 ? 'Partially Prepared' : 'At Risk';
                emergencyPillar.ratingClass = userAnswers.q2 == 2 ? 'pillar-rating rating-yellow' : 'pillar-rating rating-red';
                emergencyPillar.advice = 'This should be a top priority to protect you from financial shocks.';
                emergencyPillar.actions = createActionButton('Read Emergency Fund Guide', 'emergency-fund-guide.html', iconGuide);
            }
            pillars.push(emergencyPillar);
            
            // Debt Pillar
            let debtPillar = { name: "Debt Management", score: scores.debt };
            if (userAnswers.q3 == 3) {
                debtPillar.rating = 'Healthy';
                debtPillar.ratingClass = 'rating-green';
                debtPillar.advice = 'Great work managing your debt. This gives you more freedom to invest for your goals.';
                debtPillar.actions = '';
            } else {
                debtPillar.rating = userAnswers.q3 == 2 ? 'Caution' : 'High';
                debtPillar.ratingClass = userAnswers.q3 == 2 ? 'pillar-rating rating-yellow' : 'pillar-rating rating-red';
                let debtAdvice = 'High debt can hinder wealth creation. Prioritize paying it down.';
                if (userAnswers.q_income == 1) {
                    debtAdvice = "At your income level, high EMIs can be very stressful. It's critical to focus on clearing this debt before making new investments."
                }
                debtPillar.advice = debtAdvice;
                debtPillar.actions = createActionButton('Read Investing Guides', '../investingguides.html', iconGuide);
                debtPillar.chart = `<div class="chart-container"><canvas id="debtPieChart"></canvas></div>`;
            }
            pillars.push(debtPillar);

            // Insurance Pillar
            let insurancePillar = { name: "Insurance Shield", score: scores.insurance };
            if (userAnswers.q4 == 4) {
                insurancePillar.rating = 'Well Protected';
                insurancePillar.ratingClass = 'rating-green';
                insurancePillar.advice = 'You\'ve taken the right steps to protect yourself and your family from financial shocks.';
                insurancePillar.actions = '';
            } else {
                insurancePillar.rating = userAnswers.q4 > 1 ? 'Partially Protected' : 'Under-Insured';
                insurancePillar.ratingClass = userAnswers.q4 > 1 ? 'pillar-rating rating-yellow' : 'pillar-rating rating-red';
                let advice = 'This is a critical gap. ';
                if(userAnswers.q_stage == 3) { // Married with kids
                    advice = 'With a family to support, being under-insured is a major risk. '
                }
                if(userAnswers.q4 == 1) advice += 'Having both Health and Term insurance is crucial.';
                if(userAnswers.q4 == 2) advice += 'You have Health Insurance, but a Term Life policy is vital to protect your family\'s future.';
                if(userAnswers.q4 == 3) advice += 'You have Term Life Insurance, but Health Insurance is essential to protect you from medical emergencies.';
                insurancePillar.advice = advice;
                insurancePillar.actions = createActionButton('Read Retirement Guide', 'retirement-planning-guide.html', iconGuide);
            }
            pillars.push(insurancePillar);
            
            // Goal Readiness Pillar
            let goalPillar = { name: "Goal Readiness", score: scores.goal };
            if (userAnswers.q_goal_started == 2) {
                goalPillar.rating = 'On Track';
                goalPillar.ratingClass = 'rating-green';
                goalPillar.advice = `It's great that you're already investing for ${userAnswers.q_goal}. Use our tools to ensure your plan is robust.`;
                goalPillar.actions = createActionButton('Go to Goal Planner', '../index.html?mode=goal', iconGoal);
            } else {
                goalPillar.rating = 'Needs Planning';
                goalPillar.ratingClass = 'rating-red';
                goalPillar.advice = `You've identified ${userAnswers.q_goal} as your priority. The next step is to make a plan.`;
                goalPillar.actions = createActionButton('Plan for Your Goal', '../index.html?mode=goal', iconGoal);
            }
            pillars.push(goalPillar);

            // Tax Efficiency Pillar
            let taxPillar = { name: "Tax Efficiency", score: scores.tax };
            if (userAnswers.q_tax == 3) {
                taxPillar.rating = 'Smart';
                taxPillar.ratingClass = 'rating-green';
                taxPillar.advice = 'Excellent! Investing throughout the year is the most efficient way to save tax and benefit from market movements.';
                taxPillar.actions = createActionButton('Read Tax Guide', 'tax-saving-guide.html', iconGuide);
            } else if (userAnswers.q_tax == 2) {
                taxPillar.rating = 'Average';
                taxPillar.ratingClass = 'rating-yellow';
                taxPillar.advice = 'You\'re saving tax, but last-minute investing can mean missing out on growth. Consider a monthly ELSS SIP.';
                taxPillar.actions = createActionButton('Read Tax Guide', 'tax-saving-guide.html', iconGuide);
            } else {
                taxPillar.rating = 'Needs Attention';
                taxPillar.ratingClass = 'rating-red';
                taxPillar.advice = 'You might be paying more tax than you need to. Planning your 80C investments can save you money.';
                taxPillar.actions = createActionButton('Read Tax Guide', 'tax-saving-guide.html', iconGuide);
            }
            pillars.push(taxPillar);


            // Investing Pillar
            const riskScore = parseInt(userAnswers.q5) + parseInt(userAnswers.q6) + parseInt(userAnswers.q7) + parseInt(userAnswers.q8) + parseInt(userAnswers.q9);
            let investorPillar = { name: "Investor Profile", score: scores.investing };
            if (riskScore <= 7) {
                investorPillar.rating = 'Conservative';
                investorPillar.ratingClass = 'rating-green';
                investorPillar.advice = 'You prioritize safety and capital protection.';
                investorPillar.actions = createActionButton('Go to FD Calculator', '../index.html?mode=fd', iconFD) + createActionButton('Go to RD Calculator', '../index.html?mode=rd', iconSIP);
            } else if (riskScore <= 12) {
                investorPillar.rating = 'Balanced';
                investorPillar.ratingClass = 'rating-yellow';
                investorPillar.advice = 'You seek a mix of growth and safety.';
                investorPillar.actions = createActionButton('Use Goal Planner', '../index.html?mode=goal', iconGoal);
            } else {
                investorPillar.rating = 'Aggressive';
                investorPillar.ratingClass = 'rating-red';
                investorPillar.advice = 'You are focused on long-term growth.';
                investorPillar.actions = createActionButton('Go to SIP Calculator', '../index.html?mode=sip', iconSIP) + createActionButton('Go to Lumpsum Calculator', '../index.html?mode=lumpsum', iconLumpsum);
            }
            pillars.push(investorPillar);

            // Prioritized Action Plan
            const sortedPillars = [...pillars].sort((a, b) => a.score - b.score);
            const priorityList = document.getElementById('priority-list');
            priorityList.innerHTML = `
                <li>Focus on improving your ${sortedPillars[0].name}.</li>
                <li>Your next step should be to work on your ${sortedPillars[1].name}.</li>
            `;

            // Render Pillars
            pillars.forEach(p => {
                const pillarEl = document.createElement('div');
                pillarEl.className = 'pillar-card';
                pillarEl.innerHTML = `
                    <div class="pillar-header">
                        <h3 class="pillar-title">${p.name}</h3>
                        <span class="pillar-rating ${p.ratingClass}">${p.rating}</span>
                    </div>
                    <p class="pillar-advice">${p.advice}</p>
                    ${p.chart || ''}
                    <div class="action-btn-container">${p.actions}</div>
                `;
                pillarGrid.appendChild(pillarEl);
            });

            // Activate Charts if needed
            if (savingsPillar.chart) {
                const savingsRateMap = { '1': 5, '2': 15, '3': 25, '4': 35 };
                createBarChart('savingsRateChart', savingsRateMap[userAnswers.q1]);
            }
            if (debtPillar.chart) {
                const debtRateMap = { '1': 30, '2': 20, '3': 10 };
                createPieChart('debtPieChart', debtRateMap[userAnswers.q3]);
            }
            
            finalReport = {
                score: totalScore,
                priorities: [sortedPillars[0].name, sortedPillars[1].name],
                pillars: pillars
            };

            quizContent.style.display = 'none';
            resultsContent.style.display = 'block';
        }

        function handleShareReport() {
            if (!finalReport.score) return;
            const summaryText = `I just took the Financial Health Assessment and got a score of ${finalReport.score}/100! My top priorities are to improve my ${finalReport.priorities[0]} and ${finalReport.priorities[1]}. Check out your own financial health here: ${window.location.href}`;

            if (navigator.share) {
                navigator.share({
                    title: 'My Financial Health Report',
                    text: summaryText,
                    url: window.location.href,
                }).catch(err => {
                    console.error("Share failed:", err.message);
                    showNotification('Could not share report.');
                });
            } else {
                 const textArea = document.createElement("textarea");
                textArea.value = summaryText;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    showNotification('Report summary copied to clipboard!');
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                    showNotification('Could not copy report summary.');
                }
                document.body.removeChild(textArea);
            }
        }

        function showNotification(message) {
            const toast = document.getElementById('notification-toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

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

        prevButton.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                showQuestion(currentQuestionIndex - 1);
            }
        });

        retakeButtons.forEach(button => {
            button.addEventListener('click', () => {
                Object.keys(userAnswers).forEach(key => delete userAnswers[key]);
                document.querySelectorAll('.option-label.selected').forEach(l => l.classList.remove('selected'));
                document.getElementById('health-quiz-form').reset();
                
                resultsContent.style.display = 'none';
                quizContent.style.display = 'block';
                showQuestion(0);
            });
        });

        shareButton.addEventListener('click', handleShareReport);

        showQuestion(0);
    }
    
    // --- SECURE RETIREMENT FORECASTER QUIZ LOGIC ---
    function initializeRetirementForecasterQuiz() {
        const quizForm = document.getElementById('retirement-quiz-form');
        const resultsContent = document.getElementById('results-content');
        const quizContent = document.getElementById('quiz-content');
        const prevButton = document.getElementById('prev-btn');
        const nextButton = document.getElementById('next-btn');
        const progressBar = document.getElementById('progress-bar');
        const questions = document.querySelectorAll('.question-block');

        if (!quizForm) return;

        let currentQuestionIndex = 0;
        const userAnswers = {};
        let isTransitioning = false;

        function showQuestion(index) {
            const isNumberInput = questions[index].querySelector('input[type="number"]');
            nextButton.style.display = isNumberInput ? 'block' : 'none';

            questions.forEach((q, i) => {
                q.classList.toggle('active', i === index);
            });
            currentQuestionIndex = index;
            prevButton.disabled = index === 0;
            updateProgressBar();
        }
        
        function updateProgressBar() {
            const progress = (currentQuestionIndex / (questions.length -1)) * 100;
            progressBar.style.width = `${progress}%`;
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
            const inflationRate = 0.06; // 6%
            const expectedReturnPreRetirement = 0.12; // 12%
            const expectedReturnPostRetirement = 0.08; // 8%

            const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
            const annualExpensesAtRetirement = futureMonthlyExpenses * 12;
            const realReturnPostRetirement = ((1 + expectedReturnPostRetirement) / (1 + inflationRate)) - 1;
            const targetCorpus = (annualExpensesAtRetirement / realReturnPostRetirement) * (1 - Math.pow(1 / (1 + realReturnPostRetirement), 30));

            const futureValueOfCurrentSavings = currentSavings * Math.pow(1 + expectedReturnPreRetirement, yearsToRetirement);
            const monthlyReturnRate = expectedReturnPreRetirement / 12;
            const totalMonths = yearsToRetirement * 12;
            const futureValueOfSIP = monthlyInvestment * ((Math.pow(1 + monthlyReturnRate, totalMonths) - 1) / monthlyReturnRate) * (1 + monthlyReturnRate);
            const projectedCorpus = futureValueOfCurrentSavings + futureValueOfSIP;

            const shortfall = targetCorpus - projectedCorpus;
            let requiredAdditionalSIP = 0;
            if (shortfall > 0) {
                requiredAdditionalSIP = (shortfall * monthlyReturnRate) / ((Math.pow(1 + monthlyReturnRate, totalMonths) - 1) * (1 + monthlyReturnRate));
            }
            
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
                        <h4 class="text-sm font-bold text-gray-700 text-center mb-2">What's Next?</h4>
                        <div class="flex justify-center gap-2">
                            <a href="../index.html?mode=goal" class="flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-red-700 transition transform hover:scale-105 text-xs">
                                <span>Goal Planner</span>
                            </a>
                            <a href="retirement-planning-guide.html" class="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-md hover:bg-gray-50 transition transform hover:scale-105 text-xs">
                                <span>Read Guide</span>
                            </a>
                        </div>
                    </div>

                     <div class="results-actions">
                        <button class="results-btn retake-quiz-btn">
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
        prevButton.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                showQuestion(currentQuestionIndex - 1);
            }
        });

        showQuestion(0);
    }
    
    // --- MILLIONAIRE QUIZ LOGIC ---
    function initializeMillionaireQuiz() {
        // Placeholder for the quiz logic
    }


    // --- SECTION 5: MOBILE NAVIGATION ---
    const setupMobileMenu = () => {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
    };

    // --- SECTION 6: DROPDOWN MENU ---
    const setupDropdownMenu = () => {
        const dropdownToggle = document.querySelector('.dropdown > a');
        if (!dropdownToggle) return;

        dropdownToggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                this.classList.toggle('open');
                const menu = this.nextElementSibling;
                
                if (menu.style.display === 'block') {
                    menu.style.display = 'none';
                } else {
                    menu.style.display = 'block';
                }
            }
        });
    };
    
    // --- SECTION 7: SHARE BUTTONS LOGIC ---
    const initializeShareButtons = () => {
        const shareContainer = document.querySelector('.share-buttons-container');
        if (!shareContainer) return;

        const pageUrl = window.location.href;
        const pageTitle = document.title;
        const encodedUrl = encodeURIComponent(pageUrl);
        const encodedTitle = encodeURIComponent(pageTitle);

        const shareLinks = {
            whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`
        };

        const whatsappBtn = document.getElementById('share-whatsapp');
        const facebookBtn = document.getElementById('share-facebook');
        const twitterBtn = document.getElementById('share-twitter');
        const linkedinBtn = document.getElementById('share-linkedin');
        const copyLinkBtn = document.getElementById('copy-link-btn');

        if (whatsappBtn) whatsappBtn.href = shareLinks.whatsapp;
        if (facebookBtn) facebookBtn.href = shareLinks.facebook;
        if (twitterBtn) twitterBtn.href = shareLinks.twitter;
        if (linkedinBtn) linkedinBtn.href = shareLinks.linkedin;

        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(pageUrl).then(() => {
                    showNotification('Link copied to clipboard!');
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                    showNotification('Failed to copy link.');
                });
            });
        }
    };

    initializePage();

});
