/**
 * utils.js
 * This new file centralizes reusable utility functions for all calculators and potentially other parts of the site.
 * This avoids code duplication and makes maintenance much easier.
 */

/**
 * Formats a number into a currency string (e.g., ₹1,23,456).
 * @param {number} num The number to format.
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(num) {
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR', 
        maximumFractionDigits: 0 
    }).format(Math.round(num));
}

/**
 * Creates a debounced version of a function that delays invoking the function
 * until after `delay` milliseconds have passed since the last time it was invoked.
 * @param {Function} func The function to debounce.
 * @param {number} delay The number of milliseconds to delay.
 * @returns {Function} The new debounced function.
 */
export function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Updates the background fill of a range slider to reflect its current value.
 * @param {HTMLInputElement} slider The range slider element.
 */
export function updateSliderFill(slider) {
    if (!slider) return;
    const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--fill-percentage', `${percentage}%`);
}

/**
 * Synchronizes a range slider and a number input, with live validation.
 * @param {object} options - The options for synchronization.
 * @param {string} options.sliderId - The ID of the range slider.
 * @param {string} options.inputId - The ID of the number input.
 * @param {Function} [options.updateCallback] - An optional callback function to run on valid updates.
 */
export function syncSliderAndInput({ sliderId, inputId, updateCallback }) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    // Find the error message element by convention (e.g., sipAmountInput -> sipAmountError)
    const errorElement = document.getElementById(inputId.replace('Input', 'Error'));
    
    const debouncedUpdate = updateCallback ? debounce(updateCallback, 250) : () => {};

    if (!slider || !input) {
        // console.warn(`Slider or Input not found for IDs: ${sliderId}, ${inputId}`);
        return;
    }

    const validate = () => {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const isValid = !isNaN(value) && value >= min && value <= max && input.value.trim() !== '';

        input.classList.toggle('input-error', !isValid);
        if (errorElement) {
            errorElement.classList.toggle('hidden', isValid);
        }
        return isValid;
    };

    // Sync from slider to input
    slider.addEventListener('input', () => {
        input.value = slider.value;
        updateSliderFill(slider);
        if (validate()) {
            debouncedUpdate();
        }
    });

    // Sync from input to slider with live validation
    input.addEventListener('input', () => {
        if (validate()) {
            slider.value = input.value;
            updateSliderFill(slider);
            debouncedUpdate();
        }
    });

    // Final validation and correction on blur
    input.addEventListener('blur', () => {
        let value = parseFloat(input.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);

        if (isNaN(value) || value < min || input.value.trim() === '') {
            value = min;
        } else if (value > max) {
            value = max;
        }
        
        const step = parseFloat(slider.step) || 1;
        // Correct the value to the nearest step if needed, and format decimals
        const correctedValue = step < 1 
            ? parseFloat(value).toFixed(String(step).split('.')[1]?.length || 1) 
            : Math.round(value / step) * step;
        
        input.value = correctedValue;
        slider.value = correctedValue;
        
        updateSliderFill(slider);
        validate(); // This will remove error styles
        if (updateCallback) updateCallback(); // Immediate update on blur
    });

    // Initial fill
    updateSliderFill(slider);
}
