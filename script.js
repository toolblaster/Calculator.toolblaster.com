/**
 * This script handles all GLOBALLY required functionalities for the Calculator.toolblaster website.
 * It loads common components like the header and footer, handles site-wide features
 * like mobile navigation, and now ALSO includes the logic for initializing social share buttons.
 * Affiliate link initialization remains in global-elements.js.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Script] DOM loaded."); // Debug log

    // --- Utility Functions (Moved from global-elements.js) ---

    /**
     * Shows a temporary notification toast message at the bottom center of the screen.
     * @param {string} message - The message to display.
     */
    function showNotification(message) {
        // Check if a toast container exists, if not, create one.
        let toast = document.getElementById('notification-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'notification-toast';
            // Add basic styles if style.css might not cover it immediately
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = '#2d3748'; // gray-800
            toast.style.color = 'white';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '8px';
            toast.style.zIndex = '1000';
            toast.style.opacity = '0';
            toast.style.visibility = 'hidden';
            toast.style.transition = 'opacity 0.3s, visibility 0.3s';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        // Ensure 'show' class applies opacity/visibility
        toast.style.opacity = '1';
        toast.style.visibility = 'visible';
        setTimeout(() => {
            toast.classList.remove('show');
            toast.style.opacity = '0';
            toast.style.visibility = 'hidden';
        }, 3000);
    }

    /**
     * Initializes all social share buttons on a page (including footer).
     * It finds buttons with specific IDs and attaches the correct share URLs.
     */
    function initializeShareButtons() {
        console.log("[Script] Attempting to initialize share buttons..."); // Debug log

        // Check both potential containers
        const shareContainerGuide = document.querySelector('.share-buttons-container:not(.site-footer *)'); // Original guide location (exclude footer)
        const shareContainerFooter = document.querySelector('.site-footer .share-buttons-container'); // New footer location

        if (!shareContainerGuide && !shareContainerFooter) {
            console.log("[Script] No share button container found on this page."); // Debug log
            return; // Exit if neither exists
        } else {
            console.log("[Script] Share button container found. Proceeding..."); // Debug log
        }


        const pageUrl = window.location.href;
        const pageTitle = document.title;
        const encodedUrl = encodeURIComponent(pageUrl);
        const encodedTitle = encodeURIComponent(pageTitle);

        console.log("[Script] Current Page URL:", pageUrl); // Debug log
        console.log("[Script] Current Page Title:", pageTitle); // Debug log

        const shareLinks = {
            whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`
        };

        // Function to set link href if element exists
        const setShareLink = (id, platform) => {
            const btn = document.getElementById(id);
            if (btn && shareLinks[platform]) { // Check if platform exists in shareLinks
                 btn.href = shareLinks[platform];
                 btn.target = '_blank'; // Ensure links open in a new tab
                 btn.rel = 'noopener noreferrer'; // Security best practice
                 console.log(`[Script] Successfully set href for ${id}`); // Debug log
            } else if (btn) {
                console.warn(`[Script] Platform ${platform} not found for button ID ${id}`); // Debug log
            } else {
                 // Only log if the footer container exists, as guide containers might not always be present
                 if (shareContainerFooter) {
                    console.warn(`[Script] Button with ID ${id} not found.`); // Debug log
                 }
            }
        };

        // Set links for original buttons (if they exist)
        setShareLink('share-whatsapp', 'whatsapp');
        setShareLink('share-facebook', 'facebook');
        setShareLink('share-twitter', 'twitter');
        setShareLink('share-linkedin', 'linkedin');

        // Set links for NEW footer buttons
        setShareLink('share-whatsapp-footer', 'whatsapp');
        setShareLink('share-facebook-footer', 'facebook');
        setShareLink('share-twitter-footer', 'twitter');
        setShareLink('share-linkedin-footer', 'linkedin');

        // Handle Copy Link functionality (check both buttons)
        const setupCopyButton = (id) => {
            const copyBtn = document.getElementById(id);
            if (copyBtn) {
                 console.log(`[Script] Setting up copy button for ID: ${id}`); // Debug log
                // Remove existing listener to prevent duplicates if called multiple times
                copyBtn.removeEventListener('click', handleCopyClick);
                copyBtn.addEventListener('click', handleCopyClick);
            } else {
                 // Only log if the footer container exists
                 if (shareContainerFooter) {
                    console.warn(`[Script] Copy button with ID ${id} not found.`); // Debug log
                 }
            }
        };

        // Named function for the event listener
        function handleCopyClick(e) {
            e.preventDefault();
            const buttonId = e.currentTarget.id; // Get the ID of the clicked button
            console.log(`[Script] Copy button ${buttonId} clicked.`); // Debug log
            // Use execCommand for broader compatibility within potential iframe restrictions
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href; // Use current page URL
            textArea.style.position = "fixed"; // Prevent scrolling to bottom
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showNotification('Link copied to clipboard!');
                     console.log(`[Script] Copied via execCommand for ${buttonId}`); // Debug log
                } else {
                     throw new Error('execCommand failed');
                }
            } catch (err) {
                console.error('[Script] execCommand failed for copy: ', err);
                // Fallback using navigator.clipboard.writeText ONLY if execCommand fails
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        showNotification('Link copied to clipboard!');
                         console.log(`[Script] Copied via Clipboard API for ${buttonId}`); // Debug log
                    }).catch(fallbackErr => {
                        console.error('[Script] Clipboard API fallback failed: ', fallbackErr);
                         showNotification('Failed to copy link.');
                    });
                } else {
                    showNotification('Failed to copy link. Please copy manually.');
                    console.error('[Script] Clipboard API not available as fallback.');
                }
            }
            document.body.removeChild(textArea);
        }

        setupCopyButton('copy-link-btn'); // Original button ID
        setupCopyButton('copy-link-btn-footer'); // New footer button ID
    }


    // --- SECTION 1: DYNAMIC COMPONENT LOADING ---
    const loadComponent = (componentPath, placeholderId) => {
        // ... (loadComponent function remains the same as previous version) ...
         console.log(`[Script] Attempting to load component: ${componentPath} into #${placeholderId}`); // Debug log
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            console.warn(`[Script] Placeholder #${placeholderId} not found.`); // Debug log
            // Return a resolved promise even if placeholder is missing, so Promise.all doesn't fail
            return Promise.resolve();
        }

        // Determine the correct path prefix based on the current page's depth
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        let basePath = '/'; // Default for root
        let pathPrefix = '';

        if (pathSegments.length > 0) {
            // Adjust depth based on how many directory levels deep the current page is
            // Example: /calculators/emi-calculator/ -> ../../
            // Example: /guides/ -> ../
            pathPrefix = '../'.repeat(pathSegments.length);
        }
        // Adjust specifically for root index.html if needed
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
             pathPrefix = ''; // No prefix needed if already at root
        }

        const finalPath = `${pathPrefix}assets/components/${componentPath}`; // Adjusted path construction
        console.log(`[Script] Calculated component path: ${finalPath}`); // Debug log

        return fetch(finalPath)
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                // Log detailed error for non-OK response
                console.error(`[Script] Failed to fetch component ${finalPath}. Status: ${response.status} ${response.statusText}`);
                throw new Error(`Component ${finalPath} not found or fetch failed.`);
            })
            .then(html => {
                if (placeholder.parentNode) {
                    console.log(`[Script] Inserting HTML for ${componentPath} into DOM.`); // Debug log
                    placeholder.insertAdjacentHTML('beforebegin', html);
                    placeholder.parentNode.removeChild(placeholder);
                     console.log(`[Script] Component ${componentPath} loaded successfully.`); // Debug log
                     // Return the ID of the loaded component for specific actions
                     return placeholderId;
                } else {
                     console.warn(`[Script] Parent node for placeholder #${placeholderId} not found during insertion.`); // Debug log
                }
            })
            .catch(error => {
                console.error(`[Script] Error loading component ${componentPath}:`, error);
                if (placeholder) {
                    placeholder.innerHTML = `<p class="text-center text-red-500">Error: Could not load ${componentPath}.</p>`;
                }
                 // Return the ID even on error, maybe useful for debugging
                 return placeholderId;
            });
    };

    const setActiveNavLink = () => {
        // ... (setActiveNavLink function remains the same as previous version) ...
        const currentPath = window.location.pathname.replace(/\/$/, "").replace(/\/index\.html$/, "");
         console.log(`[Script] Setting active nav link for path: ${currentPath}`); // Debug log
        // Add a slight delay to ensure header is fully rendered
        setTimeout(() => {
            const navLinks = document.querySelectorAll('.nav-links a');
             console.log(`[Script] Found ${navLinks.length} nav links to check.`); // Debug log
            navLinks.forEach(link => {
                if (link.classList.contains('btn-nav')) {
                    // console.log("[Script] Skipping button link:", link.href); // Debug log
                    return;
                }
                try {
                    const linkUrl = new URL(link.href, window.location.origin);
                    const linkPath = linkUrl.pathname.replace(/\/$/, "").replace(/\/index\.html$/, "");
                    // console.log(`[Script] Checking link: ${link.href} -> Path: ${linkPath}`); // Debug log

                    // Special handling for the root path
                    if ((linkPath === '' || linkPath === '/') && (currentPath === '' || currentPath === '/')) {
                        link.classList.add('active');
                        // console.log(`[Script] Activated ROOT link: ${link.href}`); // Debug log
                    }
                    // Handle other paths - ensure it's not the root path again
                    else if (linkPath !== '' && linkPath !== '/' && currentPath.startsWith(linkPath)) {
                        link.classList.add('active');
                         // console.log(`[Script] Activated link: ${link.href}`); // Debug log
                    } else {
                        link.classList.remove('active');
                    }
                } catch (e) {
                    console.error(`[Script] Error processing link ${link.href}:`, e);
                }
            });
        }, 150); // Small delay
    };

    const setFavicon = () => {
        // ... (setFavicon function remains the same as previous version) ...
         console.log("[Script] Setting favicon..."); // Debug log
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23E34037' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='16' height='20' x='4' y='2' rx='2'/%3E%3Cpath d='M8 6h8'/%3E%3Cpath d='M8 10h8'/%3E%3Cpath d='M8 14h8'/%3E%3Cpath d='M15 18h1'/%3E%3C/svg%3E";
        document.head.appendChild(faviconLink);
    };

    const initializePage = () => {
        setFavicon();

        const loadPromises = [
            loadComponent('header.html', 'header-placeholder'),
            loadComponent('footer.html', 'footer-placeholder')
        ];

        Promise.all(loadPromises).then((results) => {
            console.log("[Script] Header and Footer loading promises resolved. Results:", results); // Debug log
            const headerLoaded = results.includes('header-placeholder');
            const footerLoaded = results.includes('footer-placeholder');

            if (headerLoaded) {
                 console.log("[Script] Header loaded, setting up mobile menu and active nav link..."); // Debug log
                setupMobileMenu();
                setActiveNavLink();
            } else {
                 console.warn("[Script] Header placeholder processed, but maybe not loaded correctly."); // Debug log
            }

            // **CRITICAL CHANGE**: Initialize elements AFTER footer is loaded
            if (footerLoaded) {
                 console.log("[Script] Footer loaded. Now initializing share buttons and affiliate links..."); // Debug log
                // Call the LOCAL initializeShareButtons function defined within this script
                initializeShareButtons();

                // Call the affiliate link initializer (still potentially from global-elements.js if needed there too)
                if (typeof window.initializeGlobalAffiliateLinks === 'function') {
                    window.initializeGlobalAffiliateLinks();
                } else {
                    // If affiliate logic is ONLY needed in the footer, move that function here too.
                    console.warn("[Script] initializeGlobalAffiliateLinks function not found on window object! Consider moving it to script.js if only used here.");
                }
            } else {
                 console.warn("[Script] Footer placeholder processed, but maybe not loaded correctly. Skipping share/affiliate initialization."); // Debug log
            }
        }).catch(error => {
             console.error("[Script] Error during Promise.all for component loading:", error); // Debug log
        });
    };

    const setupMobileMenu = () => {
        // ... (setupMobileMenu function remains the same as previous version) ...
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const navOverlay = document.querySelector('.nav-overlay');
        const dropdownParent = document.querySelector('.dropdown');
        const dropdownLink = document.querySelector('.dropdown > a');
        
        if (hamburger && navLinks && navOverlay) {
             console.log("[Script] Setting up mobile menu listeners."); // Debug log
            
            hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });

            navOverlay.addEventListener('click', () => {
                toggleMenu();
            });
            
            // NEW: Handle clicks on ANY link within the active menu to close the menu
            // This includes top-level links and sub-menu links
            navLinks.addEventListener('click', (e) => {
                 if (e.target.tagName === 'A' && navLinks.classList.contains('active')) {
                     // We only want to close the menu if the link is NOT the dropdown toggle
                     // If it is the dropdown link, the dropdownLink listener will handle the toggle
                     if (!e.target.closest('.dropdown > a')) {
                         // A slight delay ensures navigation starts before closing the menu
                         setTimeout(toggleMenu, 50); 
                     }
                 }
            });
            
            // Handle clicks on top-level menu item without closing (desktop dropdown behavior)
             navLinks.querySelectorAll('li:not(.dropdown) > a').forEach(link => {
                link.addEventListener('click', (e) => {
                    // If the menu is not active (i.e., on desktop), navigation happens normally.
                    if (navLinks.classList.contains('active')) {
                        // On mobile, the click will also be caught by the general navLinks listener above
                        // which ensures toggleMenu() runs after navigation starts.
                    }
                });
            });
            
            // Handle mobile dropdown toggle
            if (dropdownLink && dropdownParent) {
                dropdownLink.addEventListener('click', (e) => {
                    // Only apply this behavior on mobile/when the menu is active
                    if (navLinks.classList.contains('active') || window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        dropdownParent.classList.toggle('open');
                        console.log("[Script] Mobile dropdown toggled.");
                    }
                });
            }

        } else {
             console.warn("[Script] Hamburger, navLinks, or navOverlay not found. Cannot set up mobile menu."); // Debug log
        }

        function toggleMenu() {
            if (hamburger && navLinks && navOverlay) {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
                navOverlay.classList.toggle('active');
                 console.log("[Script] Mobile menu toggled."); // Debug log
                 
                 // If closing, ensure dropdown is closed too
                 if (!navLinks.classList.contains('active') && dropdownParent) {
                     dropdownParent.classList.remove('open');
                 }
            }
        }
    };

    initializePage();
});
