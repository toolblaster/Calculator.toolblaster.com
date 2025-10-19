/**
 * This script handles all GLOBALLY required functionalities for the Calculator.toolblaster website.
 * It loads common components like the header and footer, and handles site-wide features
 * like mobile navigation. 
 * * NOTE: Specific logic for share buttons and notifications has been moved to /assets/js/global-elements.js
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- SECTION 1: DYNAMIC COMPONENT LOADING ---
    const loadComponent = (componentPath, placeholderId) => {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            return Promise.resolve();
        }

        // Determine the correct path prefix based on the current page's depth
        const pathPrefix = window.location.pathname.includes('/calculators/') || window.location.pathname.includes('/guides/') || window.location.pathname.includes('/legal/') || window.location.pathname.includes('/quizzes/') ? '../' : '';
        
        // Adjust for deeper paths like /calculators/emi-calculator/
        const deeperPathPrefix = window.location.pathname.split('/').length > 3 ? '../../' : pathPrefix;

        const finalPath = `${deeperPathPrefix}${componentPath}`;

        return fetch(finalPath)
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                throw new Error(`Component ${finalPath} not found.`);
            })
            .then(html => {
                if (placeholder.parentNode) {
                    placeholder.insertAdjacentHTML('beforebegin', html);
                    placeholder.parentNode.removeChild(placeholder);
                }
            })
            .catch(error => {
                console.error(`Error loading component ${componentPath}:`, error);
                if (placeholder) {
                    placeholder.innerHTML = `<p class="text-center text-red-500">Error: Could not load component.</p>`;
                }
            });
    };
    
    const setActiveNavLink = () => {
        const currentPath = window.location.pathname.replace(/\/$/, "").replace(/\/index\.html$/, "");
        setTimeout(() => {
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                if (link.classList.contains('btn-nav')) {
                    return;
                }
                const linkUrl = new URL(link.href, window.location.origin);
                const linkPath = linkUrl.pathname.replace(/\/$/, "").replace(/\/index\.html$/, "");

                if ((linkPath === '' || linkPath === '/') && (currentPath === '' || currentPath === '/')) {
                    link.classList.add('active');
                } else if (linkPath !== '' && linkPath !== '/' && currentPath.startsWith(linkPath)) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }, 300);
    };
    
    const setFavicon = () => {
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23E34037' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='16' height='20' x='4' y='2' rx='2'/%3E%3Cpath d='M8 6h8'/%3E%3Cpath d='M8 10h8'/%3E%3Cpath d='M8 14h8'/%3E%3Cpath d='M15 18h1'/%3E%3C/svg%3E";
        document.head.appendChild(faviconLink);
    };

    const initializePage = () => {
        setFavicon(); 
        
        const loadPromises = [
            loadComponent('assets/components/header.html', 'header-placeholder'),
            loadComponent('assets/components/footer.html', 'footer-placeholder')
        ];

        Promise.all(loadPromises).then(() => {
            setupMobileMenu();
            setActiveNavLink();
            // initializeShareButtons() is now in global-elements.js
        });
    };

    const setupMobileMenu = () => {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const navOverlay = document.querySelector('.nav-overlay');

        if (hamburger && navLinks && navOverlay) {
            hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });

            navOverlay.addEventListener('click', () => {
                toggleMenu();
            });
        }
        
        function toggleMenu() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            navOverlay.classList.toggle('active');
        }
    };
    
    initializePage();
});
