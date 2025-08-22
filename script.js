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
