document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('habits-quiz-form');
    if (!quizForm) return; // Exit if not on this page

    // Element selection...
    let currentQuestionIndex = 0;
    const userAnswers = {};
    
    function showQuestion(index) { /* ... */ }
    function calculateResults() { /* ... */ }
    // ... all other functions for this specific quiz
    
    // Event listeners for this quiz
    // ...
    showQuestion(0);
});
