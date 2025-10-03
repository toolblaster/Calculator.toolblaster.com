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

        const potentialPaths = [
            `${componentPath}`,       // For root page (e.g., index.html)
            `../${componentPath}`,      // For pages one level deep (e.g., /guides/)
            `../../${componentPath}`,   // For pages two levels deep (e.g., /calculators/emi/)
            `../../../${componentPath}` // For pages three levels deep
        ];

        function tryFetch(paths) {
            if (paths.length === 0) {
                return Promise.reject(new Error(`Component ${componentPath} not found in any path.`));
            }
            const path = paths.shift();
            return fetch(path)
                .then(response => {
                    if (response.ok) {
                        return response.text().then(html => ({ html, path }));
                    } else {
                        return tryFetch(paths);
                    }
                });
        }

        return tryFetch([...potentialPaths])
            .then(({ html, path }) => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const componentElement = tempDiv.firstElementChild;
                if (placeholder.parentNode) {
                    placeholder.parentNode.replaceChild(componentElement, placeholder);
                    // The adjustNavLinks function is no longer needed as header uses absolute paths
                }
            })
            .catch(error => {
                console.error(`Error loading component ${componentPath}:`, error);
                if (placeholder) {
                    placeholder.innerHTML = `<p class="text-center text-red-500">Error: Could not load component.</p>`;
                }
            });
    };

    const adjustNavLinks = (headerElement, componentPath) => {
        let prefix = '';
        if (componentPath.startsWith('../')) {
            prefix = componentPath.substring(0, componentPath.indexOf('assets/'));
        }

        const links = headerElement.querySelectorAll('.nav-links a, .logo');
        links.forEach(link => {
            const originalHref = link.getAttribute('href');
            if (originalHref && originalHref.startsWith('/') && !originalHref.startsWith('//')) {
                // This is an absolute path, so we don't need to do anything.
                return;
            }
            if (originalHref && !originalHref.startsWith('http') && !originalHref.startsWith('#')) {
                 link.setAttribute('href', prefix + originalHref);
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
            initializeShareButtons();
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
