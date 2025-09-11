document.addEventListener('DOMContentLoaded', () => {
    const quizContent = document.getElementById('quiz-content');
    if (!quizContent || !document.getElementById('health-quiz-form')) return;

    const resultsContent = document.getElementById('results-content');
    const questions = document.querySelectorAll('.question-block');
    const prevButton = document.getElementById('prev-btn');
    const progressBar = document.getElementById('progress-bar');
    const retakeButtons = document.querySelectorAll('.retake-quiz-btn');
    const shareButton = document.getElementById('share-report-btn');
    
    let currentQuestionIndex = 0;
    const userAnswers = {};
    let isTransitioning = false;
    let finalReport = {};

    const pillarMap = {
        'savings': {
            name: "Savings Rate",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>`,
            advice: {
                bad: 'Your savings rate is low. Focusing on this is the fastest way to build wealth. Aim for 15-20% of your income.',
                medium: 'You are on a good path, but increasing your savings rate even a little can dramatically accelerate your goals.',
                good: 'You have a great savings rate. Continue this discipline, and your future is bright.',
            },
            actions: [
                { text: 'Start an SIP', link: '../index.html?mode=sip', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>` },
                { text: 'Plan a Budget', link: 'financial-habits-assessment-quiz.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>` }
            ]
        },
        'emergency': {
            name: "Emergency Fund",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
            advice: {
                bad: 'Without a proper emergency fund, any unexpected event can force you into debt. This is your top priority.',
                medium: 'You have some savings, but aim to build a dedicated fund covering 3-6 months of expenses for full peace of mind.',
                good: 'Your emergency fund is strong. This provides a solid foundation for all other financial goals.',
            },
            actions: [
                { text: 'Read the Guide', link: 'emergency-fund-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>` },
                { text: 'Use RD Calculator', link: '../index.html?mode=rd', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 6v6l4 2"></path></svg>` }
            ]
        },
        'debt': {
            name: "Debt Management",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
            advice: {
                bad: 'High-interest debt is actively working against your wealth. Prioritize clearing this before anything else. It is a guaranteed return on investment.',
                medium: 'Your debt is manageable, but keep an eye on it. Use a strategy like the debt avalanche or snowball to clear it faster.',
                good: 'Your debt is well under control. This frees up your cash flow for savings and investments.',
            },
            actions: [
                { text: 'Read the Guide', link: 'financial-health-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>` },
                { text: 'Check Credit Score', link: 'complete-credit-score-guide-in-india.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>` }
            ]
        },
        'insurance': {
            name: "Insurance Coverage",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
            advice: {
                bad: 'Inadequate insurance can be a huge risk. A major medical event or an unforeseen tragedy could wipe out your savings and put your family in jeopardy.',
                medium: 'You have some coverage, but it might not be enough. Review your policies and consider a holistic approach to protection.',
                good: 'You are well-protected. This is a crucial step towards financial security for you and your loved ones.',
            },
            actions: [
                { text: 'Read the Guide', link: 'financial-health-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>` }
            ]
        },
        'goal': {
            name: "Goal Planning",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
            advice: {
                bad: 'Setting specific, measurable goals is the first step to investing successfully. Without a clear goal, you risk aimless saving and under-preparation.',
                medium: 'You have a goal in mind, but turning it into a concrete, actionable plan is key to staying on track.',
                good: 'You have a clear goal and a plan to achieve it. This focus will keep you motivated and disciplined.',
            },
            actions: [
                { text: 'Use the Goal Planner', link: '../index.html?mode=goal', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>` },
                { text: 'Read the Guide', link: 'goal-based-investing.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>` }
            ]
        },
        'tax': {
            name: "Tax Planning",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
            advice: {
                bad: 'Last-minute tax planning can lead to poor decisions. A well-thought-out plan not only saves tax but also helps build wealth.',
                medium: 'You are planning your taxes, which is great. Automating your investments throughout the year is the next step to maximize benefits.',
                good: 'You have a disciplined tax planning strategy. This ensures you save tax and build wealth efficiently.',
            },
            actions: [
                { text: 'Read the Guide', link: 'tax-saving-guide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>` }
            ]
        },
        'investing': {
            name: "Investment Mindset",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m18 9-6 6-4-4-3 3"/></svg>`,
            advice: {
                bad: 'Your investment mindset is currently very conservative. While safety is good, it is important to invest in growth assets to beat inflation and create wealth over the long term.',
                medium: 'You have a good balance of risk and reward. As you gain knowledge, you may find more opportunities to optimize your portfolio.',
                good: 'You are a confident, informed investor. You understand that risk and patience are part of the journey to building significant wealth.',
            },
            actions: [
                { text: 'Read the Guide', link: 'mfguide.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>` }
            ]
        }
    };

    function showQuestion(index) {
        questions.forEach((question, i) => {
            question.classList.toggle('active', i === index);
        });
        currentQuestionIndex = index;
        prevButton.disabled = index === 0;
        updateProgressBar();
    }

    function updateProgressBar() {
        const progress = (currentQuestionIndex / (questions.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function calculateAndShowResults() {
        // Calculate scores for each pillar
        const scores = {
            savings: parseInt(userAnswers.q1),
            emergency: parseInt(userAnswers.q2),
            debt: parseInt(userAnswers.q3),
            insurance: parseInt(userAnswers.q4),
            goal: parseInt(userAnswers.q_goal_started),
            tax: parseInt(userAnswers.q_tax),
            investing: (parseInt(userAnswers.q5) + parseInt(userAnswers.q6) + parseInt(userAnswers.q7) + parseInt(userAnswers.q8) + parseInt(userAnswers.q9)) / 5
        };

        const totalScore = Math.round(
            (
                (scores.savings / 4 * 100) +
                (scores.emergency / 3 * 100) +
                (scores.debt / 3 * 100) +
                (scores.insurance / 4 * 100) +
                (scores.goal / 2 * 100) +
                (scores.tax / 3 * 100) +
                (scores.investing / 3 * 100)
            ) / 7
        );
        
        // Define pillars with their scores and advice ratings
        const pillars = [
            { id: 'savings', score: scores.savings / 4 * 100, rating: scores.savings > 3 ? 'good' : (scores.savings > 1 ? 'medium' : 'bad') },
            { id: 'emergency', score: scores.emergency / 3 * 100, rating: scores.emergency > 2 ? 'good' : (scores.emergency > 1 ? 'medium' : 'bad') },
            { id: 'debt', score: scores.debt / 3 * 100, rating: scores.debt > 2 ? 'good' : (scores.debt > 1 ? 'medium' : 'bad') },
            { id: 'insurance', score: scores.insurance / 4 * 100, rating: scores.insurance > 3 ? 'good' : (scores.insurance > 1 ? 'medium' : 'bad') },
            { id: 'goal', score: scores.goal / 2 * 100, rating: scores.goal > 1 ? 'good' : 'bad' },
            { id: 'tax', score: scores.tax / 3 * 100, rating: scores.tax > 2 ? 'good' : (scores.tax > 1 ? 'medium' : 'bad') },
            { id: 'investing', score: scores.investing / 3 * 100, rating: scores.investing > 2 ? 'good' : (scores.investing > 1 ? 'medium' : 'bad') }
        ];

        // Sort pillars by score to get a prioritized list of areas for improvement
        const sortedPillars = [...pillars].sort((a, b) => a.score - b.score);
        
        // Populate the priority list
        const priorityList = document.getElementById('priority-list');
        priorityList.innerHTML = `
            <li>Focus on improving your <strong>${pillarMap[sortedPillars[0].id].name}</strong>.</li>
            <li>Your next step should be to work on your <strong>${pillarMap[sortedPillars[1].id].name}</strong>.</li>
        `;
        
        // Populate the pillar grid
        const pillarGrid = document.querySelector('.pillar-grid');
        pillarGrid.innerHTML = '';
        pillars.forEach(p => {
            const data = pillarMap[p.id];
            const advice = data.advice[p.rating];
            const ratingText = p.rating.charAt(0).toUpperCase() + p.rating.slice(1);
            const ratingClass = `rating-${p.rating === 'good' ? 'green' : (p.rating === 'medium' ? 'yellow' : 'red')}`;

            const actionButtons = data.actions.map(action => `
                 <a href="${action.link}" class="action-btn">
                    ${action.icon}
                    <span>${action.text}</span>
                 </a>
            `).join('');

            pillarGrid.innerHTML += `
                <div class="pillar-card">
                    <div class="pillar-header">
                        <h4 class="pillar-title">${data.name}</h4>
                        <span class="pillar-rating ${ratingClass}">${ratingText}</span>
                    </div>
                    <p class="pillar-advice">${advice}</p>
                    <div class="action-btn-container">
                        ${actionButtons}
                    </div>
                </div>
            `;
        });
        
        // Show the score
        const scoreCircle = document.getElementById('score-circle');
        scoreCircle.className = 'score-circle'; // Reset classes
        if (totalScore <= 20) scoreCircle.classList.add('score-very-low');
        else if (totalScore <= 40) scoreCircle.classList.add('score-low');
        else if (totalScore <= 60) scoreCircle.classList.add('score-medium');
        else if (totalScore <= 80) scoreCircle.classList.add('score-good');
        else scoreCircle.classList.add('score-excellent');
        
        animateValue(document.getElementById('overall-score'), 0, totalScore, 1000);
        
        finalReport = { score: totalScore, priorities: [pillarMap[sortedPillars[0].id].name, pillarMap[sortedPillars[1].id].name] };
        
        quizContent.style.display = 'none';
        resultsContent.style.display = 'block';
    }

    function handleShareReport() {
        if (!finalReport.score) return;
        const summaryText = `I just took a financial health assessment and got a score of ${finalReport.score} out of 100! My top two priorities are ${finalReport.priorities[0]} and ${finalReport.priorities[1]}. Find out your score here: ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Financial Health Report',
                text: summaryText,
                url: window.location.href,
            }).catch(err => {
                console.error("Share failed:", err.message);
                showNotification('Could not share report.');
            });
        } else {
             const textArea = document.createElement("textarea");
            textArea.value = summaryText;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                showNotification('Report summary copied to clipboard!');
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                showNotification('Could not copy report summary.');
            }
            document.body.removeChild(textArea);
        }
    }

    function resetQuiz() {
        Object.keys(userAnswers).forEach(key => delete userAnswers[key]);
        document.querySelectorAll('.option-label.selected').forEach(l => l.classList.remove('selected'));
        document.getElementById('health-quiz-form').reset();
        
        resultsContent.style.display = 'none';
        quizContent.style.display = 'block';
        progressBar.style.width = '0%';
        showQuestion(0);
    }
    
    questions.forEach((question, index) => {
        const options = question.querySelectorAll('.option-label');
        options.forEach(label => {
            label.addEventListener('click', () => {
                if (isTransitioning) return;
                isTransitioning = true;
                
                const radio = label.querySelector('input[type="radio"]');
                userAnswers[radio.name] = radio.value;

                options.forEach(opt => opt.classList.remove('selected'));
                label.classList.add('selected');
                
                setTimeout(() => {
                    if (index < questions.length - 1) {
                        showQuestion(index + 1);
                    } else {
                        calculateAndShowResults();
                    }
                    isTransitioning = false;
                }, 300);
            });
        });
    });
    
    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    });

    retakeButtons.forEach(b => b.addEventListener('click', resetQuiz));
    if (shareButton) {
        shareButton.addEventListener('click', handleShareReport);
    }
    
    showQuestion(0);
});
