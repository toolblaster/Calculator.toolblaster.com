/**
 * head.js
 * This script centralizes the management of common <head> elements like the favicon,
 * fonts, and main stylesheet for the entire website.
 * To update any of these elements across all pages, you only need to edit this file.
 */
(function() {
    // --- Configuration ---
    // This is the single source of truth for your common head elements.
    // The script automatically calculates the correct relative path to assets.
    const path = window.location.pathname;
    const depth = path.split('/').filter(Boolean).length - 1;
    const pathPrefix = depth > 0 ? '../'.repeat(depth) : './';

    // Define all common head elements here
    const elements = `
        <!-- Favicon (Centrally Managed) -->
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23E34037' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='16' height='20' x='4' y='2' rx='2'/%3E%3Cpath d='M8 6h8'/%3E%3Cpath d='M8 10h8'/%3E%3Cpath d='M8 14h8'/%3E%3Cpath d='M15 18h1'/%3E%3C/svg%3E">

        <!-- Google Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        
        <!-- Main Stylesheet -->
        <link rel="stylesheet" href="${pathPrefix}assets/css/style.css">
    `;

    // Inject the elements into the <head> of the document
    // Using document.write ensures this happens synchronously as the page loads,
    // making it visible to search engine crawlers.
    document.write(elements);
}());
