/**
 * This script handles all GLOBALLY required functionalities for the Calculator.toolblaster website.
 * It loads common components like the header and footer, and handles site-wide features
 * like mobile navigation and share buttons. Specific logic for calculators or quizzes
 * is now located in their own dedicated JS files.
 */

// --- GLOBAL UTILITY FUNCTION ---
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
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const componentElement = tempDiv.firstElementChild;
                if (placeholder.parentNode) {
                    placeholder.parentNode.replaceChild(componentElement, placeholder);
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
        // Delay slightly to ensure header is loaded
        setTimeout(() => {
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                const linkUrl = new URL(link.href, window.location.origin);
                const linkPath = linkUrl.pathname.replace(/\/$/, ""); // Remove trailing slash for comparison
                const currentPathClean = currentPath.replace(/\/$/, "");

                if (linkPath === currentPathClean || (currentPathClean.endsWith('index.html') && linkPath === '')) {
                     link.classList.add('active');
                }
            });
        }, 150); 
    };
    
    // --- DYNAMIC GUIDES HUB LOGIC (REFINED AND CONSOLIDATED) ---
    const initializeGuidesHub = () => {
        const guidesContainer = document.getElementById('guides-grid-container');
        if (!guidesContainer) return; // Only run if on the investingguides.html page

        const paginationContainer = document.getElementById('pagination-container');
        const filterContainer = document.getElementById('guides-filter-container');
        const searchInput = document.getElementById('search-input');
        
        const allContent = [
            // --- GUIDES ---
            { id: 'financial-health-guide', url: 'guides/financial-health-guide.html', title: 'Your Guide to Financial Health & Wellness', description: 'Understand the pillars of financial health and get your personalized report card.', type: 'guide' },
            { id: 'emergency-fund-guide', url: 'guides/emergency-fund-guide.html', title: 'Your Step-by-Step Guide to Building an Emergency Fund', description: 'Learn the essential steps to create a robust financial safety net.', type: 'guide' },
            { id: 'goal-based-investing', url: 'guides/goal-based-investing.html', title: 'Goal-Based Investing: A Roadmap to Your Dreams', description: 'Discover how to align your investments with your life goals, big or small.', type: 'guide' },
            { id: 'retirement-planning-guide', url: 'guides/retirement-planning-guide.html', title: 'Your Guide to a Happy and Stress-Free Retirement in India', description: 'An in-depth look at retirement planning for a secure future.', type: 'guide' },
            { id: 'tax-saving-guide', url: 'guides/tax-saving-guide.html', title: 'Your Friendly Guide to Smart Tax-Saving (Section 80C)', description: 'Explore the best tax-saving investments under Section 80C.', type: 'guide' },
            { id: 'sip-vs-lumpsum', url: 'guides/sip-vs-lumpsum.html', title: 'SIP vs. Lumpsum: The Ultimate Investment Showdown', description: 'Understand the pros and cons of SIP and Lumpsum investing to choose the right strategy.', type: 'guide' },
            { id: 'sip-vs-swp', url: 'guides/sip-vs-swp.html', title: 'SIP vs. SWP: Building Your Wealth vs. Creating Your Paycheck', description: 'Learn the difference between accumulating wealth with SIPs and generating income with SWPs.', type: 'guide' },
            { id: 'sip-vs-rd', url: 'guides/sip-vs-rd.html', title: 'SIP vs. RD: Which Investment is Right for You?', description: 'A guide to help you choose between a SIP and a Recurring Deposit for your financial goals.', type: 'guide' },
            { id: 'credit-score-guide', url: 'guides/complete-credit-score-guide-in-india.html', title: 'Your Guide to Understanding & Improving Your Credit Score', description: 'A complete guide to your CIBIL score, why it matters, and how to improve it.', type: 'guide' },
            { id: 'stock-market-guide', url: 'guides/stock-market-guide-in-india.html', title: 'A Complete Beginner\'s Guide to the Stock Market', description: 'Learn the basics of stock market investing, from demat accounts to technical analysis.', type: 'guide' },
            { id: '5paisa-vs-upstox', url: 'guides/5paisa-vs-upstox.html', title: '5paisa vs. Upstox: The Ultimate Broker Showdown', description: 'A deep-dive comparison to help you choose the best trading account in India.', type: 'guide' },
            
            // --- QUIZZES (with corrected paths) ---
            { id: 'risk-profile-quiz', url: 'quizzes/risk-profile-quiz.html', title: 'What\'s Your Investor Profile?', description: 'Take our quick quiz to understand your tolerance for investment risks.', linkText: 'Take the Quiz', type: 'quiz' },
            { id: 'financial-health-assessment', url: 'quizzes/financial-health-assessment.html', title: 'Your Financial Health Assessment', description: 'Answer 15 quick questions to get your personalized financial report card.', linkText: 'Take the Assessment', type: 'quiz' },
            { id: 'financial-habits-assessment-quiz', url: 'quizzes/financial-habits-assessment-quiz.html', title: 'Financial Habits Assessment Quiz', description: 'Discover your money mindset and get a personalized score.', linkText: 'Take the Quiz', type: 'quiz' },
            { id: 'secure-retirement-forecaster-quiz', url: 'quizzes/secure-retirement-forecaster-quiz.html', title: 'Secure Retirement Forecaster Quiz', description: 'Assess your retirement readiness and get a personalized report on your target corpus.', linkText: 'Take the Quiz', type: 'quiz' },
            { id: 'are-you-on-track-to-become-a-millionaire-quiz', url: 'quizzes/are-you-on-track-to-become-a-millionaire-quiz.html', title: 'Are You on Track to Become a Millionaire? Quiz', description: 'Take this quick quiz to see if your financial habits are on track to build significant wealth.', linkText: 'Take the Quiz', type: 'quiz' },
            { id: 'next-financial-move-quiz', url: 'quizzes/next-financial-move-quiz.html', title: 'What\'s Your Next Financial Move?', description: 'Take this advanced quiz to get a primary and secondary action plan for your finances.', linkText: 'Take the Quiz', type: 'quiz' }
        ];

        let currentPage = 1;
        let currentFilter = 'guide';
        let currentSearchQuery = '';
        const itemsPerPage = 12;

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
                    <span class="read-more-link">${linkText} &rarr;</span>
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

        displayContent(1);
    };


    // --- SECTION 2: PAGE INITIALIZATION ---
    const initializePage = () => {
        const path = window.location.pathname;
        const depth = Math.max(0, (path.split('/').length - 2));
        const basePath = depth > 0 ? '../'.repeat(depth) : './';

        const loadPromises = [
            loadComponent(`${basePath}assets/components/header.html`, 'header-placeholder'),
            loadComponent(`${basePath}assets/components/footer.html`, 'footer-placeholder')
        ];

        // NEW FIX: Only load general content on the homepage
        if (path === '/' || path.endsWith('index.html')) {
            const contentArea = document.getElementById('dynamic-content-area');
            if(contentArea) {
                loadPromises.push(loadComponent(`${basePath}assets/components/content.html`, 'dynamic-content-area'));
            }
        }


        Promise.all(loadPromises).then(() => {
            setupMobileMenu();
            setActiveNavLink();
            initializeShareButtons();
            // This function now contains the logic and will only run if it finds the correct elements
            initializeGuidesHub(); 
        });
    };

    // --- SECTION 3: MOBILE NAVIGATION ---
    const setupMobileMenu = () => {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                navLinks.classList.toggle('active');
            });
        }
        
        document.addEventListener('click', (e) => {
            if (navLinks && navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    };
    
    // --- SECTION 4: SHARE BUTTONS LOGIC ---
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

    // Initialize the page
    initializePage();

});
