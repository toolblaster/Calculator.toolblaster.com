/**
 * global-elements.js
 * This file contains centralized logic for reusable components across the site,
 * primarily for affiliate links now. Social share logic moved to script.js.
 * Notification function remains here for potential use by quizzes/other scripts.
 */

// --- CONSTANTS ---
const AFFILIATE_URLS = {
    '5paisa': 'https://www.5paisa.com/demat-account?ReferralCode=54285431&ReturnUrl=invest-open-account',
    'upstox': 'https://upstox.onelink.me/0H1s/2JAL6D'
};

// --- GLOBAL UTILITY FUNCTIONS ---

// Keep showNotification here as other scripts might use it independently
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


// --- REMOVED initializeShareButtons function ---


/**
 * Initializes all affiliate links on a page.
 * It finds links with a `data-affiliate` attribute and sets the correct URL.
 */
function initializeAffiliateLinks() {
    console.log("[Global] Initializing affiliate links..."); // Debug log
    document.querySelectorAll('[data-affiliate]').forEach(link => {
        const affiliateName = link.dataset.affiliate;
        if (AFFILIATE_URLS[affiliateName]) {
            link.href = AFFILIATE_URLS[affiliateName];
            link.target = '_blank';
            link.rel = 'noopener sponsored noreferrer';
            // console.log(`[Global] Set affiliate link for: ${affiliateName}`); // Debug log
        } else {
            // console.warn(`[Global] Affiliate key not found: ${affiliateName}`); // Debug log
        }
    });
}

// --- Expose ONLY the affiliate initializer ---
window.initializeGlobalAffiliateLinks = initializeAffiliateLinks;

// --- REMOVED DOMContentLoaded listener ---
console.log("[Global] global-elements.js loaded (Share logic moved). Affiliate initializer exposed."); // Debug log
