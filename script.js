document.addEventListener('DOMContentLoaded', () => {
    // Definitive list of all vocabulary items for Hobbies
    const allVocabulary = [
        { word: "active", image: "assets/images/active.png", audio: "assets/audio/active.mp3" },
        { word: "american", image: "assets/images/american.png", audio: "assets/audio/american.mp3" },
        { word: "australian", image: "assets/images/australian.png", audio: "assets/audio/australian.mp3" },
        { word: "chinese", image: "assets/images/chinese.png", audio: "assets/audio/chinese.mp3" },
        { word: "clever", image: "assets/images/clever.png", audio: "assets/audio/clever.mp3" },
        { word: "foreign", image: "assets/images/foreigny.png", audio: "assets/audio/foreign.mp3" },
        { word: "friendly", image: "assets/images/friendly.png", audio: "assets/audio/friendly.mp3" },
	{ word: "fun", image: "assets/images/fun.png", audio: "assets/audio/fun.mp3" },
	{ word: "helpful", image: "assets/images/helpful.png", audio: "assets/audio/helpful.mp3" },
	{ word: "indian", image: "assets/images/indian.png", audio: "assets/audio/indian.mp3" },
	{ word: "japanese", image: "assets/images/japanese.png", audio: "assets/audio/japanese.mp3" },
	{ word: "lake", image: "assets/images/lake.png", audio: "assets/audio/lake.mp3" },
	{ word: "land", image: "assets/images/land.png", audio: "assets/audio/land.mp3" },
	{ word: "malaysian", image: "assets/images/malaysian.png", audio: "assets/audio/malaysian.mp3" },
	{ word: "nationality", image: "assets/images/nationality.png", audio: "assets/audio/nationality.mp3" },
    ];

    // Get references to HTML elements
    const startScreen = document.getElementById('start-screen');
    const startGameBtn = document.getElementById('start-game-btn');
    const mainGameScreen = document.getElementById('main-game-screen');

    const questionImage = document.getElementById('question-image');
    const answerButtons = [
        document.getElementById('choice-A'),
        document.getElementById('choice-B'),
        document.getElementById('choice-C'),
        document.getElementById('choice-D')
    ];
    const submitBtn = document.getElementById('submit-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const replayBtn = document.getElementById('replay-btn');
    const nextBtn = document.getElementById('next-btn');
    const playAudioBtn = document.getElementById('play-audio-btn');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer'); // Timer display element

    const correctAudio = document.getElementById('correct-audio');
    const tryAgainAudio = document.getElementById('try-again-audio');
    const wordAudio = document.getElementById('word-audio');
    const congratsMusic = document.getElementById('congrats-music');

    const congratsPopup = document.getElementById('congrats-popup');
    const closeCongratsBtn = document.getElementById('close-congrats-btn');
    const finalTotalTimeCongrats = document.getElementById('final-total-time'); // Total time in congrats popup
    
    const tryAgainPopup = document.getElementById('try-again-popup');
    const restartGameBtn = document.getElementById('restart-game-btn');
    const finalTryAgainTime = document.getElementById('final-try-again-time'); // Total time in try again popup

    // Game state variables
    let gameQuestions = [];
    let currentQuestionIndex = 0;
    let correctAnswersInRound = 0;
    let selectedAnswer = null;
    let timerInterval; // Variable to hold the timer interval
    let startTime; // To store the start time of the current question
    let totalTimeElapsed = 0; // To accumulate total time for the round

    // Helper function to shuffle an array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Function to handle audio playback with browser autoplay policies in mind
    async function playMedia(mediaElement) {
        if (!mediaElement) {
            console.error("Attempted to play a null media element. Check if element ID is correct or if asset is loaded.");
            return;
        }
        try {
            if (mediaElement.tagName === 'AUDIO' || mediaElement.tagName === 'VIDEO') { 
                mediaElement.currentTime = 0;
            }
            await mediaElement.play();
        } catch (error) {
            console.warn('Media playback prevented or failed:', error.message, 'Element ID:', mediaElement.id || 'N/A');
        }
    }

    // --- capitalizeFirstLetter function ---
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

   // Timer functions

    function startTimer() {

        stopTimer(); // Clear any existing timer

        startTime = Date.now();

        timerInterval = setInterval(updateTimerDisplay, 1000); // Update every second

    }



    function stopTimer() {

        clearInterval(timerInterval);

    }



    function resetTimer() {

        stopTimer();

        timerDisplay.textContent = '00:00';

    }



    function updateTimerDisplay() {

        const elapsedTime = Date.now() - startTime;

        const seconds = Math.floor(elapsedTime / 1000);

        const minutes = Math.floor(seconds / 60);

        const remainingSeconds = seconds % 60;



        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

        timerDisplay.textContent = formattedTime;
    }

    // Manages showing the start screen and hiding game elements
    function showStartScreen() {
        startScreen.style.display = 'flex';
        mainGameScreen.style.display = 'none';
        congratsPopup.style.display = 'none';
        tryAgainPopup.style.display = 'none';
        playMedia(congratsMusic).catch(() => {}); // Attempt to stop congrats music if it's playing
        congratsMusic.pause();
        congratsMusic.currentTime = 0;

        submitBtn.disabled = true;
        tryAgainBtn.classList.add('hidden'); // Hide Try again on start screen
        replayBtn.disabled = true;
        nextBtn.disabled = true;
        playAudioBtn.disabled = true;
        resetTimer(); // Reset timer on start screen
    }

    // Manages showing the main game screen and hiding the start screen
    function showGameScreen() {
        startScreen.style.display = 'none';
        mainGameScreen.style.display = 'flex';
    }

    // Initializes a new round of 5 questions
    function startNewRound() {
        correctAnswersInRound = 0;
        currentQuestionIndex = 0;
        totalTimeElapsed = 0; // Reset total time for the new round
        scoreDisplay.textContent = correctAnswersInRound;

        if (allVocabulary.length < 5) {
            console.error("Not enough vocabulary words to create a 5-question round!");
            alert("Không đủ từ vựng để tạo 5 câu hỏi. Vui lòng thêm từ!");
            return;
        }

        shuffleArray(allVocabulary);
        gameQuestions = allVocabulary.slice(0, 5);

        generateQuestion();
    }

    // Generates and displays a new question
    function generateQuestion() {
        // Check if all 5 questions in the round have been answered
        if (currentQuestionIndex >= gameQuestions.length) {
            endRound(); // End the current round
            return;
        }

        selectedAnswer = null;
        answerButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.style.backgroundColor = '#ffd700';
            btn.disabled = false;
        });

        // Set initial button states for a fresh question
        submitBtn.disabled = false;
        tryAgainBtn.classList.add('hidden'); // Hide Try again by default
        replayBtn.disabled = false;
        nextBtn.disabled = true;
        playAudioBtn.disabled = false;

        const currentCorrectAnswerData = gameQuestions[currentQuestionIndex];

        questionImage.src = currentCorrectAnswerData.image;
        wordAudio.src = currentCorrectAnswerData.audio;

        const answerChoices = [currentCorrectAnswerData.word];
        
        const otherWords = allVocabulary.filter(item => item.word !== currentCorrectAnswerData.word);
        shuffleArray(otherWords);

        for (let i = 0; i < 3 && i < otherWords.length; i++) {
            answerChoices.push(otherWords[i].word);
        }
        shuffleArray(answerChoices);

        answerButtons.forEach((btn, index) => {
            btn.textContent = `${String.fromCharCode(65 + index)}. ${capitalizeFirstLetter(answerChoices[index])}`;
            btn.dataset.word = answerChoices[index].toLowerCase();
        });

        playMedia(wordAudio);
        startTimer(); // Start the timer for the new question
    }

    // Handles user clicking an answer button
    function handleAnswerClick(event) {
        if (!submitBtn.disabled) { 
            answerButtons.forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
            selectedAnswer = event.target;
        }
    }

    // Handles user clicking the Submit button
    function handleSubmit() {
        if (!selectedAnswer) {
            alert('Vui lòng chọn một đáp án!');
            return;
        }

        stopTimer(); // Stop the timer when submitted
        totalTimeElapsed += (Date.now() - startTime); // Add elapsed time to total

        answerButtons.forEach(btn => btn.disabled = true);
        submitBtn.disabled = true;
        
        const correctWord = gameQuestions[currentQuestionIndex].word;

        if (selectedAnswer.dataset.word === correctWord) {
            playMedia(correctAudio);
            selectedAnswer.style.backgroundColor = '#90ee90';
            correctAnswersInRound++;
            scoreDisplay.textContent = correctAnswersInRound;
        } else {
            playMedia(tryAgainAudio);
            selectedAnswer.style.backgroundColor = '#ff6347';
            // Highlight the correct answer in green
            answerButtons.forEach(btn => {
                if (btn.dataset.word === correctWord) {
                    btn.style.backgroundColor = '#90ee90';
                }
            });
            tryAgainBtn.classList.remove('hidden');
        }
        
        if (currentQuestionIndex === gameQuestions.length - 1) {
            setTimeout(endRound, 1000);
        } else {
            nextBtn.disabled = false;
        }
    }

    // Handles user clicking the Next button
    function handleNext() {
        currentQuestionIndex++;
        generateQuestion();
    }

    // Handles user clicking the Try Again button (for current question)
    function handleTryAgain() {
        selectedAnswer = null;
        answerButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.style.backgroundColor = '#ffd700';
            btn.disabled = false;
        });
        submitBtn.disabled = false;
        tryAgainBtn.classList.add('hidden');
        nextBtn.disabled = true;
        playMedia(wordAudio);
        startTimer(); // Restart timer for re-attempt
    }

    // Handles actions at the end of a 5-question round
    function endRound() {
        stopTimer(); // Ensure timer is stopped at the end of the round
        const finalMinutes = Math.floor(totalTimeElapsed / 60000);
        const finalSeconds = Math.floor((totalTimeElapsed % 60000) / 1000);
        const formattedTotalTime = `${String(finalMinutes).padStart(2, '0')}:${String(finalSeconds).padStart(2, '0')}`;

        if (correctAnswersInRound === 5) {
            finalTotalTimeCongrats.textContent = formattedTotalTime;
            showCongrats();
        } else {
            finalTryAgainTime.textContent = formattedTotalTime;
            showTryAgainPopup();
        }
    }

    // Displays the congratulations popup (text-based)
    function showCongrats() {
        congratsPopup.style.display = 'flex';
        playMedia(congratsMusic);
    }

    // Closes the congratulations popup
    function closeCongrats() {
        congratsPopup.style.display = 'none';
        congratsMusic.pause();
        congratsMusic.currentTime = 0;
        showStartScreen();
    }

    // Displays the "Try Again" popup (for round failure)
    function showTryAgainPopup() {
        tryAgainPopup.style.display = 'flex';
    }

    // Closes the "Try Again" popup and restarts the game from the start screen
    function closeTryAgainPopupAndRestart() {
        tryAgainPopup.style.display = 'none';
        showStartScreen();
    }

    // --- Event Listeners ---

    // Listener for the "Start" button on the start screen
    startGameBtn.addEventListener('click', () => {
        showGameScreen();
        startNewRound();
    });

    // Listeners for answer choice buttons
    answerButtons.forEach(btn => btn.addEventListener('click', handleAnswerClick));
    
    // Listener for the "Submit" button
    submitBtn.addEventListener('click', handleSubmit);
    
    // Listener for the "Try again" button (new for re-attempting current question)
    tryAgainBtn.addEventListener('click', handleTryAgain);

    // Listener for the "Replay" button (now resets the game to start screen)
    replayBtn.addEventListener('click', () => {
        if (confirm("Bạn có chắc muốn chơi lại từ đầu không?")) {
            showStartScreen();
        }
    });

    // Listener for the "Next" button
    nextBtn.addEventListener('click', handleNext);
    
    // Listener for the "Play Audio" button (plays the current word's audio)
    playAudioBtn.addEventListener('click', () => playMedia(wordAudio));
    
    // Listener for closing the congratulations popup
    closeCongratsBtn.addEventListener('click', closeCongrats);
    
    // Listener for the "Chơi lại" button on the "Try Again" popup (for round failure)
    restartGameBtn.addEventListener('click', closeTryAgainPopupAndRestart);


    // Initial state when the page loads: show the start screen
    showStartScreen();
});