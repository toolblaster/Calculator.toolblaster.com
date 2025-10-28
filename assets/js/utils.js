/**
 * utils.js
 * This new file centralizes reusable utility functions for all calculators and potentially other parts of the site.
 * This avoids code duplication and makes maintenance much easier.
 * UPDATED: Added logic for increment/decrement buttons to syncSliderAndInput.
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
 * Synchronizes a range slider and a number input, with live validation,
 * ARIA attribute updates, and optional stepper buttons.
 * @param {object} options - The options for synchronization.
 * @param {string} options.sliderId - The ID of the range slider.
 * @param {string} options.inputId - The ID of the number input.
 * @param {string} [options.decrementId] - Optional ID of the decrement button.
 * @param {string} [options.incrementId] - Optional ID of the increment button.
 * @param {Function} [options.updateCallback] - An optional callback function to run on valid updates.
 */
export function syncSliderAndInput({ sliderId, inputId, decrementId, incrementId, updateCallback }) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    const decrementBtn = decrementId ? document.getElementById(decrementId) : null;
    const incrementBtn = incrementId ? document.getElementById(incrementId) : null;
    const errorElement = document.getElementById(inputId.replace('Input', 'Error'));

    const debouncedUpdate = updateCallback ? debounce(updateCallback, 250) : () => {};

    if (!slider || !input) {
        console.warn(`Slider or Input not found for IDs: ${sliderId}, ${inputId}`);
        return;
    }

    const updateAriaValueText = () => {
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
            const isCurrency = inputId.toLowerCase().includes('amount') || inputId.toLowerCase().includes('salary') || inputId.toLowerCase().includes('corpus') || inputId.toLowerCase().includes('savings') || inputId.toLowerCase().includes('investment') || inputId.toLowerCase().includes('withdrawal') || (parseFloat(input.step) >= 100);
            const formattedValue = isCurrency ? formatCurrency(value) : value.toString();
            slider.setAttribute('aria-valuetext', formattedValue);
        }
    };

    const validate = () => {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const isValid = !isNaN(value) && value >= min && value <= max && input.value.trim() !== '';

        input.classList.toggle('input-error', !isValid);
        if (errorElement) {
            errorElement.classList.toggle('hidden', isValid);
        }
        // Disable/enable stepper buttons based on value
        if (decrementBtn) decrementBtn.disabled = isNaN(value) || value <= min;
        if (incrementBtn) incrementBtn.disabled = isNaN(value) || value >= max;

        return isValid;
    };

    // Shared update logic for slider, input, and buttons
    const updateValue = (newValue) => {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const step = parseFloat(slider.step) || 1;

        // Clamp value within min/max
        let clampedValue = Math.max(min, Math.min(max, newValue));

        // Adjust to the nearest step and format decimals correctly
        const correctedValue = step < 1
            ? parseFloat(clampedValue).toFixed(String(step).split('.')[1]?.length || 1)
            : Math.round(clampedValue / step) * step;

        // Ensure the corrected value is still within bounds after step correction
        clampedValue = Math.max(min, Math.min(max, parseFloat(correctedValue)));

        input.value = clampedValue;
        slider.value = clampedValue;
        updateSliderFill(slider);
        updateAriaValueText();
        if (validate()) {
            if (updateCallback) updateCallback(); // Use immediate callback for button clicks
        }
    };

    // Sync from slider to input
    slider.addEventListener('input', () => {
        const newValue = parseFloat(slider.value);
        if (!isNaN(newValue)) {
            input.value = newValue; // Update input first
            updateSliderFill(slider);
            updateAriaValueText();
            if (validate()) { // Then validate
                debouncedUpdate(); // Use debounce for slider drag
            }
        }
    });


    // Sync from input to slider with live validation
    input.addEventListener('input', () => {
        if (validate()) { // Only sync slider if input is valid
            slider.value = input.value;
            updateSliderFill(slider);
            updateAriaValueText();
            debouncedUpdate(); // Use debounce for typing
        }
    });

    // Final validation and correction on blur
    input.addEventListener('blur', () => {
        let value = parseFloat(input.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const step = parseFloat(slider.step) || 1;

        if (isNaN(value) || value < min || input.value.trim() === '') {
            value = min;
        } else if (value > max) {
            value = max;
        }

        const correctedValue = step < 1
            ? parseFloat(value).toFixed(String(step).split('.')[1]?.length || 1)
            : Math.round(value / step) * step;

        // Ensure value is clamped *after* step correction
        value = Math.max(min, Math.min(max, parseFloat(correctedValue)));

        input.value = value; // Use the finally corrected value
        slider.value = value;

        updateSliderFill(slider);
        updateAriaValueText();
        validate(); // Remove error styles and update button states
        if (updateCallback) updateCallback(); // Immediate update on blur
    });

    // Stepper Button Logic
    if (decrementBtn) {
        decrementBtn.addEventListener('click', () => {
            const currentValue = parseFloat(input.value);
            const step = parseFloat(slider.step) || 1;
            if (!isNaN(currentValue)) {
                updateValue(currentValue - step);
            }
        });
    }

    if (incrementBtn) {
        incrementBtn.addEventListener('click', () => {
            const currentValue = parseFloat(input.value);
            const step = parseFloat(slider.step) || 1;
            if (!isNaN(currentValue)) {
                updateValue(currentValue + step);
            }
        });
    }

    // Initial validation and state setting
    validate();
    updateSliderFill(slider);
    updateAriaValueText();
}
