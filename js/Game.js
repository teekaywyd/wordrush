export class Game {

    constructor(
        wordManager,
        board,
        player
    ) {

        this.wordManager =
            wordManager;

        this.board =
            board;

        this.player =
            player;


        this.currentRow = 0;

        this.currentGuess = "";

        this.gameOver = false;

        this.statsSaved = false;


        this.maxAttempts = 6;

        this.wordLength = 5;


        this.hintUsed = false;


        // ========================================
        // DAILY MODE
        // ========================================

        this.gameMode = "practice";

        this.dailyWordDate = null;

        this.dailyGuesses = [];

        this.practiceGuesses = [];

        this.dailyStorageKey = null;


        this.setupModalButtons();

    }


    // ========================================
    // START NORMAL GAME
    // ========================================

    startGame() {

        this.gameMode = "practice";

        this.dailyWordDate = null;

        this.dailyStorageKey = null;

        this.dailyGuesses = [];

        this.practiceGuesses = [];


        this.currentRow = 0;

        this.currentGuess = "";

        this.gameOver = false;

        this.hintUsed = false;

        this.statsSaved = false;


        this.wordManager.newWord();


        this.board.createBoard();


        this.showMessage("");


        document.getElementById(
            "hintButton"
        ).disabled = false;


        document.getElementById(
            "gameOverModal"
        ).style.display = "none";


        document.getElementById(
            "gameOverModal"
        ).classList.remove(
            "game-lost"
        );


        // ========================================
        // BUTTON STATE
        // ========================================

        const newGameButton =
            document.getElementById(
                "newGameButton"
            );


        if (newGameButton) {

            newGameButton.textContent =
                "NEW GAME";

        }


        window.dispatchEvent(
            new Event(
                "wordrush-game-state-changed"
            )
        );

    }


    getPracticeProgress() {

        if (
            this.gameMode !== "practice" ||
            this.gameOver
        ) {
            return null;
        }


        return {
            secretWord: this.wordManager.secretWord,
            guesses: [...this.practiceGuesses],
            currentGuess: this.currentGuess,
            hintUsed: this.hintUsed
        };

    }


    restorePracticeProgress(progress) {

        if (
            !progress ||
            !this.wordManager.words.includes(progress.secretWord) ||
            !Array.isArray(progress.guesses) ||
            progress.guesses.length >= this.maxAttempts ||
            progress.guesses.some(
                guess => !this.wordManager.isValidWord(guess)
            )
        ) {
            return false;
        }


        this.gameMode = "practice";
        this.dailyWordDate = null;
        this.dailyStorageKey = null;
        this.dailyGuesses = [];
        this.practiceGuesses = [...progress.guesses];
        this.wordManager.secretWord = progress.secretWord;
        this.currentRow = this.practiceGuesses.length;
        this.currentGuess = progress.currentGuess || "";
        this.gameOver = false;
        this.statsSaved = false;
        this.hintUsed = Boolean(progress.hintUsed);


        this.board.createBoard();


        for (
            let row = 0;
            row < this.practiceGuesses.length;
            row++
        ) {
            const guess = this.practiceGuesses[row];

            for (
                let column = 0;
                column < guess.length;
                column++
            ) {
                this.board.displayLetter(row, column, guess[column]);
            }

            this.board.showResult(
                row,
                this.wordManager.checkGuess(guess)
            );
        }


        if (this.currentGuess.length <= this.wordLength) {
            for (
                let column = 0;
                column < this.currentGuess.length;
                column++
            ) {
                this.board.displayLetter(
                    this.currentRow,
                    column,
                    this.currentGuess[column]
                );
            }
        } else {
            this.currentGuess = "";
        }


        document.getElementById("hintButton").disabled =
            this.hintUsed;
        document.getElementById("gameOverModal").style.display = "none";
        this.showMessage("");

        window.dispatchEvent(
            new Event("wordrush-game-state-changed")
        );

        return true;

    }


    // ========================================
    // START DAILY GAME
    // ========================================

    startDailyGame(
        dailyWord,
        wordDate
    ) {

        this.gameMode = "daily";

        this.dailyWordDate =
            wordDate;


        this.dailyStorageKey =
            `wordrush-daily-${wordDate}`;


        this.dailyGuesses = [];

        this.practiceGuesses = [];


        this.currentRow = 0;

        this.currentGuess = "";

        this.gameOver = false;

        this.hintUsed = false;

        this.statsSaved = false;


        this.wordManager.secretWord =
            dailyWord.toUpperCase();


        this.board.createBoard();


        // ========================================
        // LOAD SAVED DAILY PROGRESS
        // ========================================

        this.loadDailyProgress();


        // ========================================
        // RESTORE SAVED GUESSES
        // ========================================

        for (
            let i = 0;
            i < this.dailyGuesses.length;
            i++
        ) {

            const guess =
                this.dailyGuesses[i];


            for (
                let j = 0;
                j < guess.length;
                j++
            ) {

                this.board.displayLetter(
                    i,
                    j,
                    guess[j]
                );

            }


            const result =
                this.wordManager.checkGuess(
                    guess
                );


            this.board.showResult(
                i,
                result
            );

        }


        this.currentRow =
            this.dailyGuesses.length;


        // ========================================
        // RESTORE CURRENT GUESS
        // ========================================

        const savedState =
            this.getSavedDailyProgress();


        if (
            savedState &&
            savedState.currentGuess
        ) {

            this.currentGuess =
                savedState.currentGuess;


            for (
                let i = 0;
                i < this.currentGuess.length;
                i++
            ) {

                this.board.displayLetter(
                    this.currentRow,
                    i,
                    this.currentGuess[i]
                );

            }

        }


        this.showMessage(
            "📅 DAILY PUZZLE"
        );


        document.getElementById(
            "hintButton"
        ).disabled = false;


        document.getElementById(
            "gameOverModal"
        ).style.display = "none";


        document.getElementById(
            "gameOverModal"
        ).classList.remove(
            "game-lost"
        );


        // ========================================
        // BUTTON STATE
        // ========================================

        const newGameButton =
            document.getElementById(
                "newGameButton"
            );


        if (newGameButton) {

            newGameButton.textContent =
                "EXIT DAILY";

        }


        window.dispatchEvent(
            new Event(
                "wordrush-game-state-changed"
            )
        );

    }


    // ========================================
    // GET SAVED DAILY PROGRESS
    // ========================================

    getSavedDailyProgress() {

        if (
            !this.dailyStorageKey
        ) {

            return null;

        }


        try {

            const saved =
                localStorage.getItem(
                    this.dailyStorageKey
                );


            if (!saved) {

                return null;

            }


            const parsed =
                JSON.parse(saved);


            if (
                !parsed ||
                parsed.word !==
                this.wordManager.secretWord
            ) {

                localStorage.removeItem(
                    this.dailyStorageKey
                );


                return null;

            }


            return parsed;

        } catch (error) {

            console.error(
                "DAILY PROGRESS LOAD ERROR:",
                error
            );


            return null;

        }

    }


    // ========================================
    // LOAD DAILY PROGRESS
    // ========================================

    loadDailyProgress() {

        const saved =
            this.getSavedDailyProgress();


        if (!saved) {

            this.dailyGuesses = [];

            this.currentGuess = "";

            this.currentRow = 0;

            return;

        }


        if (
            Array.isArray(
                saved.guesses
            )
        ) {

            this.dailyGuesses =
                saved.guesses;

        }


        this.currentGuess =
            saved.currentGuess || "";


        this.currentRow =
            this.dailyGuesses.length;

    }


    // ========================================
    // SAVE DAILY PROGRESS
    // ========================================

    saveDailyProgress() {

        if (
            this.gameMode !== "daily"
        ) {

            return;

        }


        if (
            !this.dailyStorageKey
        ) {

            return;

        }


        try {

            localStorage.setItem(

                this.dailyStorageKey,

                JSON.stringify({

                    word:
                        this.wordManager.secretWord,

                    wordDate:
                        this.dailyWordDate,

                    guesses:
                        this.dailyGuesses,

                    currentGuess:
                        this.currentGuess

                })

            );

        } catch (error) {

            console.error(
                "DAILY PROGRESS SAVE ERROR:",
                error
            );

        }

    }


    // ========================================
    // CLEAR DAILY PROGRESS
    // ========================================

    clearDailyProgress() {

        if (
            !this.dailyStorageKey
        ) {

            return;

        }


        try {

            localStorage.removeItem(
                this.dailyStorageKey
            );

        } catch (error) {

            console.error(
                "DAILY PROGRESS DELETE ERROR:",
                error
            );

        }

    }


    // ========================================
    // HANDLE KEY
    // ========================================

    handleKey(key) {

        if (this.gameOver) {

            return;

        }


        key =
            key.toUpperCase();


        if (key === "ENTER") {

            this.submitGuess();

            return;

        }


        if (
            key === "BACKSPACE"
        ) {

            this.removeLetter();

            return;

        }


        if (
            /^[A-Z]$/.test(key)
        ) {

            this.addLetter(key);

        }

    }


    // ========================================
    // ADD LETTER
    // ========================================

    addLetter(letter) {

        if (this.gameOver) {

            return;

        }


        if (
            this.currentGuess.length >=
            this.wordLength
        ) {

            return;

        }


        this.currentGuess +=
            letter;


        this.board.displayLetter(

            this.currentRow,

            this.currentGuess.length - 1,

            letter

        );


        // ========================================
        // SAVE DAILY PROGRESS
        // ========================================

        this.saveDailyProgress();

    }


    // ========================================
    // REMOVE LETTER
    // ========================================

    removeLetter() {

        if (this.gameOver) {

            return;

        }


        if (
            this.currentGuess.length === 0
        ) {

            return;

        }


        this.currentGuess =
            this.currentGuess.slice(
                0,
                -1
            );


        this.board.removeLetter(

            this.currentRow,

            this.currentGuess.length

        );


        // ========================================
        // SAVE DAILY PROGRESS
        // ========================================

        this.saveDailyProgress();

    }


    // ========================================
    // SUBMIT GUESS
    // ========================================

    submitGuess() {

        if (this.gameOver) {

            return;

        }


        if (
            this.currentGuess.length !==
            this.wordLength
        ) {

            this.showMessage(
                "ENTER A 5 LETTER WORD"
            );


            this.board.shakeRow(
                this.currentRow
            );


            this.clearMessageAfter(
                1500
            );


            return;

        }


        if (
            !this.wordManager.isValidWord(
                this.currentGuess
            )
        ) {

            this.showMessage(
                "WORD NOT FOUND"
            );


            this.board.shakeRow(
                this.currentRow
            );


            this.clearMessageAfter(
                1500
            );


            return;

        }


        const result =
            this.wordManager.checkGuess(
                this.currentGuess
            );


        this.board.showResult(

            this.currentRow,

            result

        );


        // ========================================
        // SAVE VALID GUESS
        // ========================================

        if (this.gameMode === "daily") {
            this.dailyGuesses.push(
                this.currentGuess
            );
        } else {
            this.practiceGuesses.push(
                this.currentGuess
            );
        }


        if (

            this.currentGuess ===
            this.wordManager.secretWord

        ) {

            this.gameWon();

            return;

        }


        this.currentRow++;

        this.currentGuess = "";


        // ========================================
        // SAVE DAILY PROGRESS
        // ========================================

        this.saveDailyProgress();


        if (
            this.currentRow >=
            this.maxAttempts
        ) {

            this.gameLost();

        }

    }


    // ========================================
    // CALCULATE SCORE
    // ========================================

    calculateScore() {

        const attempt =
            this.currentRow + 1;


        if (attempt === 1) {

            return 500;

        }


        if (attempt === 2) {

            return 400;

        }


        if (attempt === 3) {

            return 300;

        }


        if (attempt === 4) {

            return 200;

        }


        if (attempt === 5) {

            return 150;

        }


        if (attempt === 6) {

            return 100;

        }


        return 0;

    }


    // ========================================
    // GAME WON
    // ========================================

    async gameWon() {

        if (this.statsSaved) {

            return;

        }


        this.gameOver = true;

        this.statsSaved = true;


        const score =
            this.calculateScore();


        const attempt =
            this.currentRow + 1;


        // ========================================
        // DAILY GAME
        // ========================================

        if (
            this.gameMode === "daily"
        ) {

            await this.player.saveDailyResult(

                this.dailyWordDate,

                score,

                attempt,

                true

            );


            await this.player.loadDailyStats();


            // Daily is now permanently complete.

            this.clearDailyProgress();

        }


        // ========================================
        // NORMAL GAME
        // ========================================

        else {

            await this.player.addWin(
                score
            );

        }


        console.log(
            `WORDRUSH SCORE: +${score}`
        );


        window.dispatchEvent(
            new Event(
                "wordrush-game-state-changed"
            )
        );


        setTimeout(() => {

            this.board.celebrateRow(
                this.currentRow
            );


            setTimeout(() => {

                this.showWinModal(
                    score,
                    attempt
                );

            }, 700);

        }, 1600);

    }


    // ========================================
    // SHOW WIN MODAL
    // ========================================

    showWinModal(
        score,
        attempt
    ) {

        const modal =
            document.getElementById(
                "gameOverModal"
            );


        const title =
            document.getElementById(
                "modalTitle"
            );


        const answer =
            document.getElementById(
                "answerWord"
            );


        const icon =
            document.getElementById(
                "modalIcon"
            );


        const winScore =
            document.getElementById(
                "winScore"
            );


        const winScoreLabel =
            document.getElementById(
                "winScoreLabel"
            );


        const attemptResult =
            document.getElementById(
                "attemptResult"
            );


        icon.textContent =
            "🎉";


        if (
            this.gameMode === "daily"
        ) {

            title.textContent =
                "DAILY COMPLETE!";

        } else {

            title.textContent =
                "YOU WON!";

        }


        winScore.textContent =
            `+${score}`;


        winScoreLabel.textContent =
            "POINTS";


        attemptResult.textContent =
            `SOLVED IN ${attempt}/6 ATTEMPTS`;


        answer.textContent =
            this.wordManager.secretWord;


        modal.style.display =
            "flex";


        this.createConfetti();

    }


    // ========================================
    // GAME LOST
    // ========================================

    async gameLost() {

        if (this.statsSaved) {

            return;

        }


        this.gameOver = true;

        this.statsSaved = true;


        // ========================================
        // DAILY GAME
        // ========================================

        if (
            this.gameMode === "daily"
        ) {

            await this.player.saveDailyResult(

                this.dailyWordDate,

                0,

                this.maxAttempts,

                false

            );


            await this.player.loadDailyStats();


            // Daily is now permanently complete.

            this.clearDailyProgress();

        }


        // ========================================
        // NORMAL GAME
        // ========================================

        else {

            await this.player.addLoss();

        }


        const winScore =
            document.getElementById(
                "winScore"
            );


        const winScoreLabel =
            document.getElementById(
                "winScoreLabel"
            );


        const attemptResult =
            document.getElementById(
                "attemptResult"
            );


        winScore.textContent =
            "";


        winScoreLabel.textContent =
            "";


        attemptResult.textContent =
            "";


        window.dispatchEvent(
            new Event(
                "wordrush-game-state-changed"
            )
        );


        setTimeout(() => {

            this.showGameOverModal();

        }, 1500);

    }


    // ========================================
    // SHOW GAME OVER MODAL
    // ========================================

    showGameOverModal() {

        const modal =
            document.getElementById(
                "gameOverModal"
            );


        const answer =
            document.getElementById(
                "answerWord"
            );


        const title =
            document.getElementById(
                "modalTitle"
            );


        const icon =
            document.getElementById(
                "modalIcon"
            );


        modal.classList.remove(
            "game-lost"
        );


        modal.classList.add(
            "game-lost"
        );


        icon.textContent =
            "😔";


        if (
            this.gameMode === "daily"
        ) {

            title.textContent =
                "DAILY COMPLETE";

        } else {

            title.textContent =
                "GAME OVER";

        }


        answer.textContent =
            this.wordManager.secretWord;


        modal.style.display =
            "flex";

    }


    // ========================================
    // MODAL BUTTONS
    // ========================================

    setupModalButtons() {

        document.getElementById(
            "modalNewGame"
        ).addEventListener(
            "click",
            () => {

                if (
                    this.gameMode === "daily"
                ) {

                    this.showMessage(
                        "DAILY WORD ALREADY COMPLETE"
                    );


                    document.getElementById(
                        "gameOverModal"
                    ).style.display =
                        "none";


                    return;

                }


                this.startGame();

            }
        );


        document.getElementById(
            "modalExit"
        ).addEventListener(
            "click",
            () => {

                document.getElementById(
                    "gameOverModal"
                ).style.display =
                    "none";


                this.showMessage(
                    "GAME EXITED"
                );

            }
        );

    }


    // ========================================
    // HINT
    // ========================================

    useHint() {

        if (this.gameOver) {

            return;

        }


        if (this.hintUsed) {

            this.showMessage(
                "💡 HINT ALREADY USED"
            );

            return;

        }


        const word =
            this.wordManager.secretWord;


        const vowels = [

            "A",
            "E",
            "I",
            "O",
            "U"

        ];


        let vowel = "";

        let consonant = "";


        for (
            let letter of word
        ) {

            if (

                vowels.includes(letter) &&
                vowel === ""

            ) {

                vowel = letter;

            }


            if (

                !vowels.includes(letter) &&
                consonant === ""

            ) {

                consonant = letter;

            }


            if (

                vowel !== "" &&
                consonant !== ""

            ) {

                break;

            }

        }


        this.showMessage(

            `💡 HINT  •  VOWEL: ${vowel}  •  CONSONANT: ${consonant}`

        );


        this.hintUsed = true;


        document.getElementById(
            "hintButton"
        ).disabled = true;

    }


    // ========================================
    // CLEAR MESSAGE
    // ========================================

    clearMessageAfter(time) {

        setTimeout(() => {

            this.showMessage("");

        }, time);

    }


    // ========================================
    // SHOW MESSAGE
    // ========================================

    showMessage(message) {

        const messageElement =
            document.getElementById(
                "message"
            );


        messageElement.textContent =
            message;

    }


    // ========================================
    // CONFETTI
    // ========================================

    createConfetti() {

        const confetti =
            document.getElementById(
                "confetti"
            );


        confetti.innerHTML = "";


        for (
            let i = 0;
            i < 40;
            i++
        ) {

            const piece =
                document.createElement(
                    "div"
                );


            piece.classList.add(
                "confetti-piece"
            );


            const x =
                (Math.random() - 0.5) *
                500;


            const y =
                (Math.random() - 0.5) *
                500;


            piece.style.setProperty(
                "--x",
                `${x}px`
            );


            piece.style.setProperty(
                "--y",
                `${y}px`
            );


            piece.style.transform =
                `rotate(${Math.random() * 360}deg)`;


            confetti.appendChild(
                piece
            );

        }


        setTimeout(() => {

            confetti.innerHTML = "";

        }, 1200);

    }

}
