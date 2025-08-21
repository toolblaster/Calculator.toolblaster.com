/**
 * This script handles all functionalities for the Calculator.toolblaster website.
 * It loads components on every page and ONLY initializes the calculator
 * or specific quizzes if it finds their HTML on the current page.
 */
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
            { id: 'secure-retirement-forecaster-quiz', url: 'guides/secure-retirement-forecaster-quiz.html', title: 'Secure Retirement Forecaster Quiz', description: 'Assess your retirement readiness and get a personalized report on your target corpus.', linkText: 'Take the Quiz', type: 'quiz' }
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

            if (document.querySelector('.calculator-container')) {
                initializeCalculator();
            }

            if (window.location.pathname.includes('financial-health-assessment.html')) {
                initializeFinancialHealthQuiz();
            }

            if (window.location.pathname.includes('secure-retirement-forecaster-quiz.html')) {
                initializeRetirementForecasterQuiz();
            }
        });
    };

    // --- FINANCIAL HEALTH QUIZ LOGIC ---
    function initializeFinancialHealthQuiz() {
        // Placeholder for the quiz logic
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


    // --- SECTION 3: UTILITY FUNCTIONS ---
    function showNotification(message) {
        const toast = document.getElementById('notification-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // --- SECTION 4: FINANCIAL CALCULATOR LOGIC ---
    function initializeCalculator() {
        // ... (The entire existing calculator logic remains unchanged)
        'use strict';
        const getElem = (id) => document.getElementById(id);

        const sipModeBtn = getElem('sipModeBtn');
        const lumpsumModeBtn = getElem('lumpsumModeBtn');
        const swpModeBtn = getElem('swpModeBtn');
        const rdModeBtn = getElem('rdModeBtn');
        const fdModeBtn = getElem('fdModeBtn');
        const goalModeBtn = getElem('goalModeBtn');
        
        const sipSection = getElem('sipSection');
        const lumpsumSection = getElem('lumpsumSection');
        const rdSection = getElem('rdSection');
        const fdSection = getElem('fdSection');
        const swpSection = getElem('swpSection');
        const goalSection = getElem('goalSection');

        const sipAmountSlider = getElem('sipAmountSlider');
        const sipAmountInput = getElem('sipAmountInput');
        const sipFrequencySelect = getElem('sipFrequency');
        const sipIncreaseRateSlider = getElem('sipIncreaseRateSlider');
        const sipIncreaseRateInput = getElem('sipIncreaseRateInput');
        const lumpsumAmountSlider = getElem('lumpsumAmountSlider');
        const lumpsumAmountInput = getElem('lumpsumAmountInput');
        const rdAmountSlider = getElem('rdAmountSlider');
        const rdAmountInput = getElem('rdAmountInput');
        const rdFrequencySelect = getElem('rdFrequency');
        const rdIncreaseRateSlider = getElem('rdIncreaseRateSlider');
        const rdIncreaseRateInput = getElem('rdIncreaseRateInput');
        const fdAmountSlider = getElem('fdAmountSlider');
        const fdAmountInput = getElem('fdAmountInput');
        const initialCorpusSlider = getElem('initialCorpusSlider');
        const initialCorpusInput = getElem('initialCorpusInput');
        const withdrawalAmountSlider = getElem('withdrawalAmountSlider');
        const withdrawalAmountInput = getElem('withdrawalAmountInput');
        const withdrawalFrequencySelect = getElem('withdrawalFrequency');
        const targetAmountSlider = getElem('targetAmountSlider');
        const targetAmountInput = getElem('targetAmountInput');
        const goalReturnRateSlider = getElem('goalReturnRateSlider');
        const goalReturnRateInput = getElem('goalReturnRateInput');
        const goalPeriodSlider = getElem('goalPeriodSlider');
        const goalPeriodInput = getElem('goalPeriodInput');
        const returnRateSlider = getElem('returnRateSlider');
        const returnRateInput = getElem('returnRateInput');
        const investmentPeriodSlider = getElem('investmentPeriodSlider');
        const investmentPeriodInput = getElem('investmentPeriodInput');
        const inflationToggle = getElem('inflationToggle');
        const inflationInputGroup = getElem('inflationInputGroup');
        const inflationRateSlider = getElem('inflationRateSlider');
        const inflationRateInput = getElem('inflationRateInput');

        const errorMessages = {
          sipAmount: getElem('sipAmountError'), lumpsumAmount: getElem('lumpsumAmountError'),
          rdAmount: getElem('rdAmountError'), fdAmount: getElem('fdAmountError'),
          initialCorpus: getElem('initialCorpusError'), withdrawalAmount: getElem('withdrawalAmountError'),
          returnRate: getElem('returnRateError'), investmentPeriod: getElem('investmentPeriodError'),
          inflationRate: getElem('inflationRateError'),
          targetAmount: getElem('targetAmountError'), goalReturnRate: getElem('goalReturnRateError'), goalPeriod: getElem('goalPeriodError')
        };
        
        const calculatorTitle = getElem('calculatorTitle');
        const calculatorDescription = getElem('calculatorDescription');
        const periodLabel = getElem('periodLabel');
        const tableHeaderInvested = getElem('tableHeaderInvested');
        const sipSummary = getElem('sipSummary');
        const investedAmountSIP = getElem('investedAmountSIP');
        const estimatedReturnsSIP = getElem('estimatedReturnsSIP');
        const totalValueSIP = getElem('totalValueSIP');
        const realValueSectionSIP = getElem('realValueSectionSIP');
        const realTotalValueSIP = getElem('realTotalValueSIP');
        const lumpsumSummary = getElem('lumpsumSummary');
        const investedAmountLumpsum = getElem('investedAmountLumpsum');
        const estimatedReturnsLumpsum = getElem('estimatedReturnsLumpsum');
        const totalValueLumpsum = getElem('totalValueLumpsum');
        const realValueSectionLumpsum = getElem('realValueSectionLumpsum');
        const realTotalValueLumpsum = getElem('realTotalValueLumpsum');
        const rdSummary = getElem('rdSummary');
        const investedAmountRD = getElem('investedAmountRD');
        const estimatedReturnsRD = getElem('estimatedReturnsRD');
        const totalValueRD = getElem('totalValueRD');
        const realValueSectionRD = getElem('realValueSectionRD');
        const realTotalValueRD = getElem('realTotalValueRD');
        const fdSummary = getElem('fdSummary');
        const investedAmountFD = getElem('investedAmountFD');
        const estimatedReturnsFD = getElem('estimatedReturnsFD');
        const totalValueFD = getElem('totalValueFD');
        const realValueSectionFD = getElem('realValueSectionFD');
        const realTotalValueFD = getElem('realTotalValueFD');
        const swpSummary = getElem('swpSummary');
        const initialCorpusSWP = getElem('initialCorpusSWP');
        const totalWithdrawnSWP = getElem('totalWithdrawnSWP');
        const totalInterestSWP = getElem('totalInterestSWP');
        const remainingCorpusSWP = getElem('remainingCorpusSWP');
        const realValueSectionSWP = getElem('realValueSectionSWP');
        const realRemainingCorpusSWP = getElem('realRemainingCorpusSWP');
        const corpusExhaustedInfo = getElem('corpusExhaustedInfo');
        const exhaustionPeriodSWP = getElem('exhaustionPeriodSWP');
        const goalSummary = getElem('goalSummary');
        const targetAmountGoal = getElem('targetAmountGoal');
        const totalInvestmentGoal = getElem('totalInvestmentGoal');
        const expectedReturnsGoal = getElem('expectedReturnsGoal');
        const monthlyInvestmentGoal = getElem('monthlyInvestmentGoal');

        const growthTableContainer = getElem('growthTableContainer');
        const growthTableBody = getElem('growthTableBody');
        const toggleGrowthTableBtn = getElem('toggleGrowthTableBtn');
        const doughnutCanvas = getElem('investmentDoughnutChart');
        const doughnutCtx = doughnutCanvas.getContext('2d');
        let investmentDoughnutChart;
        let currentMode = 'sip';

        const debounce = (func, delay) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; };
        const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(num));
        const updateSliderFill = (slider) => { if (!slider) return; const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100; slider.style.setProperty('--fill-percentage', `${percentage}%`); };
        const validateSlider = (slider, errorElement) => { if (!slider || !errorElement) return true; const value = parseFloat(slider.value); const min = parseFloat(slider.min); const max = parseFloat(slider.max); const isValid = !isNaN(value) && value >= min && value <= max; errorElement.classList.toggle('hidden', isValid); return isValid; };

        function updateDoughnutChart(data, labels, colors) {
          const chartData = { labels: labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 4, borderRadius: 3, spacing: 1 }] };
          const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: window.innerWidth < 640 ? '60%' : '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` }, bodyFont: { family: 'Inter', size: window.innerWidth < 640 ? 8 : 10 }, titleFont: { family: 'Inter', size: window.innerWidth < 640 ? 8 : 10 }, padding: window.innerWidth < 640 ? 4 : 6, cornerRadius: 4 } } };
          if (investmentDoughnutChart) { investmentDoughnutChart.data = chartData; investmentDoughnutChart.update(); } else { investmentDoughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: chartData, options: chartOptions }); }
        }

        function generateGrowthTable(data) {
          growthTableBody.innerHTML = '';
          data.forEach(yearData => { const row = document.createElement('tr'); row.className = 'hover:bg-gray-100 transition-colors'; row.innerHTML = `<td class="px-2 py-1 whitespace-nowrap">${yearData.year}</td><td class="px-2 py-1 whitespace-nowrap font-semibold text-blue-700">${formatCurrency(yearData.invested)}</td><td class="px-2 py-1 whitespace-nowrap font-semibold text-green-700">${formatCurrency(yearData.returns)}</td><td class="px-2 py-1 whitespace-nowrap font-bold text-purple-700">${formatCurrency(yearData.total)}</td>`; growthTableBody.appendChild(row); });
        }

        function updateCalculator() {
          let isFormValid = true;
          if (currentMode !== 'goal') {
              isFormValid = validateSlider(returnRateSlider, errorMessages.returnRate) && validateSlider(investmentPeriodSlider, errorMessages.investmentPeriod);
              if (inflationToggle.checked) isFormValid = isFormValid && validateSlider(inflationRateSlider, errorMessages.inflationRate);
          } else {
              isFormValid = validateSlider(goalReturnRateSlider, errorMessages.goalReturnRate) && validateSlider(goalPeriodSlider, errorMessages.goalPeriod) && validateSlider(targetAmountSlider, errorMessages.targetAmount);
              if (inflationToggle.checked) isFormValid = isFormValid && validateSlider(inflationRateSlider, errorMessages.inflationRate);
          }
          
          let yearlyGrowthData = [];
          
          const annualReturnRate = (currentMode === 'goal' ? parseFloat(goalReturnRateSlider.value) : parseFloat(returnRateSlider.value)) / 100;
          const investmentPeriodYears = (currentMode === 'goal' ? parseFloat(goalPeriodSlider.value) : parseFloat(investmentPeriodSlider.value));
          const annualInflationRate = inflationToggle.checked ? parseFloat(inflationRateSlider.value) / 100 : 0;
          
          toggleGrowthTableBtn.classList.toggle('hidden', currentMode === 'swp' || currentMode === 'goal');
          tableHeaderInvested.textContent = (currentMode === 'fd' || currentMode === 'lumpsum') ? 'Principal' : 'Invested';
          
          if (currentMode === 'sip') {
            isFormValid = isFormValid && validateSlider(sipAmountSlider, errorMessages.sipAmount);
            if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);
            const sipAmount = parseFloat(sipAmountSlider.value);
            const annualIncreaseRate = parseFloat(sipIncreaseRateSlider.value) / 100;
            const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2 }[sipFrequencySelect.value];
            const periodicReturnRate = annualReturnRate / frequency;
            let currentSipAmount = sipAmount, investedAmount = 0, currentCorpus = 0;
            for (let year = 1; year <= investmentPeriodYears; year++) {
              let yearInvested = 0;
              for (let i = 0; i < frequency; i++) { yearInvested += currentSipAmount; currentCorpus = currentCorpus * (1 + periodicReturnRate) + currentSipAmount; }
              investedAmount += yearInvested;
              currentSipAmount *= (1 + annualIncreaseRate);
              yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus });
            }
            investedAmountSIP.textContent = formatCurrency(investedAmount);
            estimatedReturnsSIP.textContent = formatCurrency(currentCorpus - investedAmount);
            totalValueSIP.textContent = formatCurrency(currentCorpus);
            if (inflationToggle.checked) {
              const realReturnRate = ((1 + annualReturnRate) / (1 + annualInflationRate)) - 1;
              const periodicRealReturnRate = realReturnRate / frequency;
              let realCorpus = 0, realSipAmount = sipAmount;
              for (let year = 1; year <= investmentPeriodYears; year++) {
                for (let i = 0; i < frequency; i++) { realCorpus = realCorpus * (1 + periodicRealReturnRate) + realSipAmount; }
                realSipAmount *= (1 + annualIncreaseRate);
              }
              realTotalValueSIP.textContent = formatCurrency(realCorpus);
              realValueSectionSIP.classList.remove('hidden');
            } else { realValueSectionSIP.classList.add('hidden'); }
            updateDoughnutChart([investedAmount, currentCorpus - investedAmount], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
            generateGrowthTable(yearlyGrowthData);
          
          } else if (currentMode === 'lumpsum') {
            isFormValid = isFormValid && validateSlider(lumpsumAmountSlider, errorMessages.lumpsumAmount);
            if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);
            const investedAmount = parseFloat(lumpsumAmountSlider.value);
            const totalValue = investedAmount * Math.pow(1 + annualReturnRate, investmentPeriodYears);
            const estimatedReturns = totalValue - investedAmount;
            investedAmountLumpsum.textContent = formatCurrency(investedAmount);
            estimatedReturnsLumpsum.textContent = formatCurrency(estimatedReturns);
            totalValueLumpsum.textContent = formatCurrency(totalValue);
            if (inflationToggle.checked) {
              const realReturnRate = ((1 + annualReturnRate) / (1 + annualInflationRate)) - 1;
              const realTotalValue = investedAmount * Math.pow(1 + realReturnRate, investmentPeriodYears);
              realTotalValueLumpsum.textContent = formatCurrency(realTotalValue);
              realValueSectionLumpsum.classList.remove('hidden');
            } else { realValueSectionLumpsum.classList.add('hidden'); }
            updateDoughnutChart([investedAmount, estimatedReturns], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
            let currentCorpus = investedAmount;
            for (let year = 1; year <= investmentPeriodYears; year++) { currentCorpus *= (1 + annualReturnRate); yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus }); }
            generateGrowthTable(yearlyGrowthData);

          } else if (currentMode === 'rd') {
            isFormValid = isFormValid && validateSlider(rdAmountSlider, errorMessages.rdAmount);
            if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);
            const rdAmount = parseFloat(rdAmountSlider.value);
            const annualIncreaseRate = parseFloat(rdIncreaseRateSlider.value) / 100;
            const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2 }[rdFrequencySelect.value];
            const periodicReturnRate = annualReturnRate / frequency;
            let currentRdAmount = rdAmount, investedAmount = 0, currentCorpus = 0;
            for (let year = 1; year <= investmentPeriodYears; year++) {
              let yearInvested = 0;
              for (let i = 0; i < frequency; i++) { yearInvested += currentRdAmount; currentCorpus = currentCorpus * (1 + periodicReturnRate) + currentRdAmount; }
              investedAmount += yearInvested;
              currentRdAmount *= (1 + annualIncreaseRate);
              yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus });
            }
            investedAmountRD.textContent = formatCurrency(investedAmount);
            estimatedReturnsRD.textContent = formatCurrency(currentCorpus - investedAmount);
            totalValueRD.textContent = formatCurrency(currentCorpus);
            if (inflationToggle.checked) {
              const realReturnRate = ((1 + annualReturnRate) / (1 + annualInflationRate)) - 1;
              const periodicRealReturnRate = realReturnRate / frequency;
              let realCorpus = 0, realRdAmount = rdAmount;
              for (let year = 1; year <= investmentPeriodYears; year++) {
                for (let i = 0; i < frequency; i++) { realCorpus = realCorpus * (1 + periodicRealReturnRate) + realRdAmount; }
                realRdAmount *= (1 + annualIncreaseRate);
              }
              realTotalValueRD.textContent = formatCurrency(realCorpus);
              realValueSectionRD.classList.remove('hidden');
            } else { realValueSectionRD.classList.add('hidden'); }
            updateDoughnutChart([investedAmount, currentCorpus - investedAmount], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
            generateGrowthTable(yearlyGrowthData);

          } else if (currentMode === 'fd') {
            isFormValid = isFormValid && validateSlider(fdAmountSlider, errorMessages.fdAmount);
            if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);
            const investedAmount = parseFloat(fdAmountSlider.value);
            const totalValue = investedAmount * Math.pow(1 + annualReturnRate, investmentPeriodYears);
            const estimatedReturns = totalValue - investedAmount;
            investedAmountFD.textContent = formatCurrency(investedAmount);
            estimatedReturnsFD.textContent = formatCurrency(estimatedReturns);
            totalValueFD.textContent = formatCurrency(totalValue);
            if (inflationToggle.checked) {
              const realReturnRate = ((1 + annualReturnRate) / (1 + annualInflationRate)) - 1;
              const realTotalValue = investedAmount * Math.pow(1 + realReturnRate, investmentPeriodYears);
              realTotalValueFD.textContent = formatCurrency(realTotalValue);
              realValueSectionFD.classList.remove('hidden');
            } else { realValueSectionFD.classList.add('hidden'); }
            updateDoughnutChart([investedAmount, estimatedReturns], ['Invested', 'Returns'], ['#3B82F6', '#22C55E']);
            let currentCorpus = investedAmount;
            for (let year = 1; year <= investmentPeriodYears; year++) { currentCorpus *= (1 + annualReturnRate); yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus }); }
            generateGrowthTable(yearlyGrowthData);

          } else if (currentMode === 'swp') {
            isFormValid = isFormValid && validateSlider(initialCorpusSlider, errorMessages.initialCorpus) && validateSlider(withdrawalAmountSlider, errorMessages.withdrawalAmount);
            if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);
            let corpus = parseFloat(initialCorpusSlider.value);
            const initialCorpus = corpus;
            const withdrawalAmount = parseFloat(withdrawalAmountSlider.value);
            const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2, yearly: 1 }[withdrawalFrequencySelect.value];
            const numWithdrawals = investmentPeriodYears * frequency;
            const periodicReturnRate = annualReturnRate / frequency;
            let totalWithdrawn = 0, totalInterest = 0, exhaustionPeriodYears = 0;
            for (let i = 1; i <= numWithdrawals; i++) {
              if (corpus <= 0) { exhaustionPeriodYears = (i - 1) / frequency; corpus = 0; break; }
              const interestEarned = corpus * periodicReturnRate;
              totalInterest += interestEarned;
              corpus += interestEarned;
              const withdrawal = Math.min(corpus, withdrawalAmount);
              corpus -= withdrawal;
              totalWithdrawn += withdrawal;
            }
            initialCorpusSWP.textContent = formatCurrency(initialCorpus);
            totalWithdrawnSWP.textContent = formatCurrency(totalWithdrawn);
            totalInterestSWP.textContent = formatCurrency(totalInterest);
            remainingCorpusSWP.textContent = formatCurrency(corpus);
            corpusExhaustedInfo.classList.toggle('hidden', !(exhaustionPeriodYears > 0));
            if (exhaustionPeriodYears > 0) exhaustionPeriodSWP.textContent = `${exhaustionPeriodYears.toFixed(1)} Yrs`;
            if (inflationToggle.checked) {
              realRemainingCorpusSWP.textContent = formatCurrency(corpus / Math.pow(1 + annualInflationRate, investmentPeriodYears));
              realValueSectionSWP.classList.remove('hidden');
            } else { realValueSectionSWP.classList.add('hidden'); }
            updateDoughnutChart([totalWithdrawn, totalInterest, corpus], ['Withdrawn', 'Interest', 'Remaining'], ['#10B981', '#6366F1', '#EF4444']);

          } else if (currentMode === 'goal') {
            isFormValid = isFormValid && validateSlider(targetAmountSlider, errorMessages.targetAmount) && validateSlider(goalReturnRateSlider, errorMessages.goalReturnRate) && validateSlider(goalPeriodSlider, errorMessages.goalPeriod);
            if (!isFormValid) return updateDoughnutChart([1], ['Invalid'], ['#E5E7EB']);

            let targetAmount = parseFloat(targetAmountSlider.value);
            const annualRate = parseFloat(goalReturnRateSlider.value) / 100;
            const years = parseFloat(goalPeriodSlider.value);
            const months = years * 12;
            const monthlyRate = annualRate / 12;
            let monthlyInvestment;
            
            let inflatedTargetAmount = targetAmount;
            if (inflationToggle.checked) {
                const inflationRate = parseFloat(inflationRateSlider.value) / 100;
                inflatedTargetAmount = targetAmount * Math.pow(1 + inflationRate, years);
            }

            if (monthlyRate === 0) {
                monthlyInvestment = inflatedTargetAmount / months;
            } else {
                monthlyInvestment = (inflatedTargetAmount * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
            }
            
            const totalInvestment = monthlyInvestment * months;
            const expectedReturns = inflatedTargetAmount - totalInvestment;

            targetAmountGoal.textContent = formatCurrency(targetAmount);
            totalInvestmentGoal.textContent = formatCurrency(totalInvestment);
            expectedReturnsGoal.textContent = formatCurrency(expectedReturns);
            monthlyInvestmentGoal.textContent = formatCurrency(monthlyInvestment);
            
            updateDoughnutChart([totalInvestment, expectedReturns], ['Total Investment', 'Expected Returns'], ['#22C55E', '#6366F1']);
          }
        }

        const debouncedUpdate = debounce(updateCalculator, 250);

        function switchMode(newMode) {
          currentMode = newMode;
          [sipSection, lumpsumSection, rdSection, fdSection, swpSection, goalSection, sipSummary, lumpsumSummary, rdSummary, fdSummary, swpSummary, goalSummary].forEach(el => el.classList.add('hidden'));
          const activeClasses = 'bg-blue-600 text-white shadow-md'.split(' ');
          const inactiveClasses = 'bg-gray-200 text-gray-700 hover:bg-gray-300'.split(' ');
          [sipModeBtn, lumpsumModeBtn, rdModeBtn, fdModeBtn, swpModeBtn, goalModeBtn].forEach(btn => { btn.classList.remove(...activeClasses, ...inactiveClasses); btn.classList.add(...(btn.id.startsWith(newMode) ? activeClasses : inactiveClasses)); });
          
          if (newMode === 'sip') { sipSection.classList.remove('hidden'); sipSummary.classList.remove('hidden'); calculatorTitle.textContent = 'SIP Calculator'; calculatorDescription.textContent = 'Calculate the future value of your SIP investments.'; periodLabel.textContent = 'Investment Period (Years)'; } 
          else if (newMode === 'lumpsum') { lumpsumSection.classList.remove('hidden'); lumpsumSummary.classList.remove('hidden'); calculatorTitle.textContent = 'Lumpsum Calculator'; calculatorDescription.textContent = 'Calculate the future value of your one-time lumpsum investment.'; periodLabel.textContent = 'Investment Period (Years)'; } 
          else if (newMode === 'rd') { rdSection.classList.remove('hidden'); rdSummary.classList.remove('hidden'); calculatorTitle.textContent = 'RD Calculator'; calculatorDescription.textContent = 'Calculate the maturity amount of your recurring deposits.'; periodLabel.textContent = 'Investment Period (Years)'; } 
          else if (newMode === 'fd') { fdSection.classList.remove('hidden'); fdSummary.classList.remove('hidden'); calculatorTitle.textContent = 'FD Calculator'; calculatorDescription.textContent = 'Calculate the maturity amount of your fixed deposit.'; periodLabel.textContent = 'Investment Period (Years)'; } 
          else if (newMode === 'swp') { swpSection.classList.remove('hidden'); swpSummary.classList.remove('hidden'); calculatorTitle.textContent = 'SWP Calculator'; calculatorDescription.textContent = 'Calculate your Systematic Withdrawal Plan returns and remaining corpus.'; periodLabel.textContent = 'Withdrawal Period (Years)'; }
          else if (newMode === 'goal') { goalSection.classList.remove('hidden'); goalSummary.classList.remove('hidden'); calculatorTitle.textContent = 'Goal Planner'; calculatorDescription.textContent = 'Calculate the monthly investment needed to reach your financial goal.'; }

          document.querySelectorAll('.range-slider').forEach(updateSliderFill);
          updateCalculator();
        }

        const handleShare = () => {
            const params = new URLSearchParams();
            params.set('mode', currentMode);

            if (currentMode === 'sip') {
                params.set('amount', sipAmountSlider.value);
                params.set('increase', sipIncreaseRateSlider.value);
                params.set('rate', returnRateSlider.value);
                params.set('period', investmentPeriodSlider.value);
            } else if (currentMode === 'lumpsum') {
                params.set('amount', lumpsumAmountSlider.value);
                params.set('rate', returnRateSlider.value);
                params.set('period', investmentPeriodSlider.value);
            } else if (currentMode === 'goal') {
                params.set('target', targetAmountSlider.value);
                params.set('rate', goalReturnRateSlider.value);
                params.set('period', goalPeriodSlider.value);
            }
            
            if (inflationToggle.checked) {
                params.set('inflation', inflationRateSlider.value);
            }

            const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

            if (navigator.share) {
                navigator.share({
                    title: 'Financial Calculator Plan',
                    text: 'Check out my investment plan!',
                    url: shareUrl,
                }).catch(err => {
                    console.error("Share failed:", err.message);
                });
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = shareUrl;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    showNotification('Link copied to clipboard!');
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                    showNotification('Could not copy link.');
                }
                document.body.removeChild(textArea);
            }
        };

        const loadFromUrl = () => {
            const params = new URLSearchParams(window.location.search);
            const mode = params.get('mode');

            if (mode) {
                switchMode(mode);

                if (mode === 'sip') {
                    sipAmountSlider.value = params.get('amount') || 10000;
                    sipIncreaseRateSlider.value = params.get('increase') || 0;
                    returnRateSlider.value = params.get('rate') || 12;
                    investmentPeriodSlider.value = params.get('period') || 10;
                } else if (mode === 'lumpsum') {
                    lumpsumAmountSlider.value = params.get('amount') || 500000;
                    returnRateSlider.value = params.get('rate') || 10;
                    investmentPeriodSlider.value = params.get('period') || 10;
                } else if (mode === 'goal') {
                    targetAmountSlider.value = params.get('target') || 5000000;
                    goalReturnRateSlider.value = params.get('rate') || 12;
                    goalPeriodSlider.value = params.get('period') || 10;
                }

                if (params.has('inflation')) {
                    inflationToggle.checked = true;
                    inflationRateSlider.value = params.get('inflation');
                    inflationInputGroup.classList.remove('hidden');
                }
                
                document.querySelectorAll('input[type="range"]').forEach(slider => {
                    const input = getElem(slider.id.replace('Slider', 'Input'));
                    if (input) input.value = slider.value;
                });

                updateCalculator();
            }
        };

        function setupEventListeners() {
          const inputs = [ 
           { slider: sipAmountSlider, input: sipAmountInput }, { slider: lumpsumAmountSlider, input: lumpsumAmountInput }, 
           { slider: rdAmountSlider, input: rdAmountInput }, { slider: fdAmountSlider, input: fdAmountInput }, 
           { slider: initialCorpusSlider, input: initialCorpusInput }, { slider: withdrawalAmountSlider, input: withdrawalAmountInput }, 
           { slider: returnRateSlider, input: returnRateInput }, { slider: investmentPeriodSlider, input: investmentPeriodInput }, 
           { slider: inflationRateSlider, input: inflationRateInput }, { slider: sipIncreaseRateSlider, input: sipIncreaseRateInput }, 
           { slider: rdIncreaseRateSlider, input: rdIncreaseRateInput }, { slider: targetAmountSlider, input: targetAmountInput }, 
           { slider: goalReturnRateSlider, input: goalReturnRateInput }, { slider: goalPeriodSlider, input: goalPeriodInput }
         ];
          
          inputs.forEach(({ slider, input }) => { 
            if (slider && input) { 
              slider.addEventListener('input', () => { input.value = slider.value; updateSliderFill(slider); debouncedUpdate(); }); 
              input.addEventListener('input', () => { slider.value = input.value; updateSliderFill(slider); debouncedUpdate(); }); 
            } 
          });
          
          [sipFrequencySelect, rdFrequencySelect, withdrawalFrequencySelect, inflationToggle].forEach(el => { 
            if (el) { 
              el.addEventListener('change', () => { 
                if (el.id === 'inflationToggle') { inflationInputGroup.classList.toggle('hidden', !inflationToggle.checked); }
                updateCalculator(); 
              }); 
            } 
          });
          
          sipModeBtn.addEventListener('click', () => switchMode('sip'));
          lumpsumModeBtn.addEventListener('click', () => switchMode('lumpsum'));
          rdModeBtn.addEventListener('click', () => switchMode('rd'));
          fdModeBtn.addEventListener('click', () => switchMode('fd'));
          swpModeBtn.addEventListener('click', () => switchMode('swp'));
          goalModeBtn.addEventListener('click', () => switchMode('goal'));

            document.querySelectorAll('.goal-template-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const goal = e.target.dataset.goal;
                    document.querySelectorAll('.goal-template-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');

                    if (goal === 'retirement') {
                        targetAmountSlider.value = 10000000;
                        goalPeriodSlider.value = 25;
                        goalReturnRateSlider.value = 12;
                    } else if (goal === 'education') {
                        targetAmountSlider.value = 2500000;
                        goalPeriodSlider.value = 15;
                        goalReturnRateSlider.value = 11;
                    } else if (goal === 'car') {
                        targetAmountSlider.value = 1000000;
                        goalPeriodSlider.value = 5;
                        goalReturnRateSlider.value = 9;
                    }
                    
                    targetAmountInput.value = targetAmountSlider.value;
                    goalPeriodInput.value = goalPeriodSlider.value;
                    goalReturnRateInput.value = goalReturnRateSlider.value;
                    document.querySelectorAll('.range-slider').forEach(updateSliderFill);
                    updateCalculator();
                });
            });

            document.querySelectorAll('.share-btn').forEach(btn => {
                btn.addEventListener('click', handleShare);
            });

          toggleGrowthTableBtn.addEventListener('click', () => { growthTableContainer.classList.toggle('hidden'); toggleGrowthTableBtn.textContent = growthTableContainer.classList.contains('hidden') ? 'Show Yearly Growth' : 'Hide Yearly Growth'; });
          window.addEventListener('resize', debounce(() => { if(investmentDoughnutChart) investmentDoughnutChart.resize(); }, 250));
        }

        setupEventListeners();
        loadFromUrl();
        document.querySelectorAll('.range-slider').forEach(updateSliderFill);
        if (!window.location.search) {
             switchMode('sip');
        }
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
