/**
 * global-elements.js
 * This file contains centralized logic for reusable components across the site,
 * such as notification toasts and social media sharing buttons.
 */

// --- GLOBAL UTILITY FUNCTION ---
function showNotification(message) {
    // Check if a toast container exists, if not, create one.
    let toast = document.getElementById('notification-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'notification-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Initializes all social share buttons on a page.
 * It finds buttons with specific IDs and attaches the correct share URLs.
 */
function initializeShareButtons() {
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
                // Fallback for older browsers
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = pageUrl;
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showNotification('Link copied to clipboard!');
                } catch (fallbackErr) {
                    showNotification('Failed to copy link.');
                }
            });
        });
    }
};

// --- INITIALIZATION ---
// When the DOM is fully loaded, initialize the share buttons.
document.addEventListener('DOMContentLoaded', () => {
    initializeShareButtons();
});