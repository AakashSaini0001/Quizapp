// --- DOM Elements ---
const setupContainer = document.getElementById('setup-container');
const quizContainer = document.getElementById('quiz-container');
const startBtn = document.getElementById('start-btn');
const categorySelect = document.getElementById('category');
const numQuestionsInput = document.getElementById('num-questions');
const errorMessage = document.getElementById('error-message');

const questionCounter = document.getElementById('question-counter');
const questionEl = document.getElementById('question');
const optionsListEl = document.getElementById('options-list');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');

// --- State ---
let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];

// --- Functions ---

/**
 * Fetches quiz data from the API based on user settings.
 */
async function fetchQuizData() {
    const category = categorySelect.value;
    const amount = numQuestionsInput.value;
    const API_URL = `https://opentdb.com/api.php?amount=${amount}&category=${category}&type=multiple`;

    startBtn.disabled = true;
    startBtn.innerText = "Loading...";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Network response was not ok.");
        
        const data = await response.json();
        if (data.results.length === 0) {
            throw new Error("Not enough questions in this category. Try reducing the number.");
        }
        
        quizData = data.results;
        userAnswers = new Array(quizData.length).fill(null);
        
        // Switch views
        setupContainer.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        
        loadQuiz();
    } catch (error) {
        errorMessage.innerText = `Error: ${error.message}`;
        errorMessage.classList.remove('hidden');
        startBtn.disabled = false;
        startBtn.innerText = "Start Quiz";
    }
}

/**
 * Loads the current question and its options into the DOM.
 */
function loadQuiz() {
    // Clear previous options
    optionsListEl.innerHTML = '';
    
    const currentQuestion = quizData[currentQuestionIndex];
    const questionText = decodeHtml(currentQuestion.question);
    
    questionCounter.innerText = `Question ${currentQuestionIndex + 1} / ${quizData.length}`;
    questionEl.innerText = questionText;
    
    const options = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
    shuffleArray(options);

    options.forEach(optionText => {
        const option = document.createElement('li');
        const decodedOptionText = decodeHtml(optionText);

        option.innerHTML = `
            <input type="radio" id="${decodedOptionText}" name="option" value="${decodedOptionText}">
            <label for="${decodedOptionText}">${decodedOptionText}</label>
        `;

        // Check if this option was previously selected
        if (userAnswers[currentQuestionIndex] === decodedOptionText) {
            option.classList.add('selected');
            option.querySelector('input').checked = true;
        }

        option.addEventListener('click', () => handleOptionSelect(option, decodedOptionText));
        optionsListEl.appendChild(option);
    });

    updateNavigationButtons();
}

/**
 * Handles the logic when a user clicks on an answer option.
 */
function handleOptionSelect(selectedLi, selectedValue) {
    // Remove 'selected' from siblings and check the right radio
    document.querySelectorAll('#options-list li').forEach(li => li.classList.remove('selected'));
    selectedLi.classList.add('selected');
    selectedLi.querySelector('input').checked = true;

    // Store the answer
    userAnswers[currentQuestionIndex] = selectedValue;
}

/**
 * Updates the visibility and state of navigation buttons.
 */
function updateNavigationButtons() {
    prevBtn.classList.toggle('hidden', currentQuestionIndex === 0);
    nextBtn.classList.toggle('hidden', currentQuestionIndex === quizData.length - 1);
    finishBtn.classList.toggle('hidden', currentQuestionIndex !== quizData.length - 1);
}

/**
 * Calculates the final score and displays the results.
 */
function showResults() {
    let score = 0;
    quizData.forEach((question, index) => {
        if (userAnswers[index] === decodeHtml(question.correct_answer)) {
            score++;
        }
    });

    quizContainer.innerHTML = `
        <h2>Quiz Complete!</h2>
        <p style="text-align: center; font-size: 1.2rem;">
            Your final score is ${score} out of ${quizData.length}.
        </p>
        <button onclick="location.reload()">Play Again</button>
    `;
}

// --- Helper Functions ---
function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- Event Listeners ---
startBtn.addEventListener('click', fetchQuizData);

prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuiz();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        loadQuiz();
    }
});

finishBtn.addEventListener('click', showResults);