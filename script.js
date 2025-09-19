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

        // Use absolute paths starting from the root to avoid relative path issues.
        const absolutePath = `/${componentPath}`;

        return fetch(absolutePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${absolutePath}: ${response.statusText}`);
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
                console.error(`Error loading component ${absolutePath}:`, error);
                if(placeholder) {
                    placeholder.innerHTML = `<p class="text-center text-red-500">Error: Could not load component.</p>`;
                }
            });
    };

    const setActiveNavLink = () => {
        const currentPath = window.location.pathname.replace(/\/$/, ""); // Normalize path
        setTimeout(() => {
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                const linkUrl = new URL(link.href, window.location.origin);
                const linkPath = linkUrl.pathname.replace(/\/$/, ""); 

                if ((currentPath === '' || currentPath.endsWith('/index.html')) && (linkPath === '' || linkPath.endsWith('/index.html'))) {
                    link.classList.add('active');
                } else if (linkPath !== '' && currentPath.startsWith(linkPath)) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }, 200); 
    };
    
    // --- NEW: DYNAMIC FAVICON LOADER ---
    const setFavicon = () => {
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23E34037' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='16' height='20' x='4' y='2' rx='2'/%3E%3Cpath d='M8 6h8'/%3E%3Cpath d='M8 10h8'/%3E%3Cpath d='M8 14h8'/%3E%3Cpath d='M15 18h1'/%3E%3C/svg%3E";
        document.head.appendChild(faviconLink);
    };

    // --- SECTION 2: PAGE INITIALIZATION ---
    const initializePage = () => {
        setFavicon(); 
        const path = window.location.pathname;
        
        const loadPromises = [
            loadComponent('assets/components/header.html', 'header-placeholder'),
            loadComponent('assets/components/footer.html', 'footer-placeholder')
        ];

        // NEW FIX: Only load general content on the homepage
        if (path === '/' || path.endsWith('/index.html') || path === '') {
            const contentArea = document.getElementById('dynamic-content-area');
            if(contentArea) {
                loadPromises.push(loadComponent('assets/components/content.html', 'dynamic-content-area'));
            }
        }


        Promise.all(loadPromises).then(() => {
            setupMobileMenu();
            setActiveNavLink();
            initializeShareButtons();
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
