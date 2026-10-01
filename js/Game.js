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


        this.maxAttempts = 6;

        this.wordLength = 5;


        this.hintUsed = false;


        this.setupModalButtons();

    }


    // ========================================
    // START GAME
    // ========================================

    startGame() {

        this.currentRow = 0;

        this.currentGuess = "";

        this.gameOver = false;

        this.hintUsed = false;


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

    }


    // ========================================
    // HANDLE KEY
    // ========================================

    handleKey(key) {

        if (this.gameOver) {

            return;

        }


        key = key.toUpperCase();


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

    }


    // ========================================
    // SUBMIT GUESS
    // ========================================

    submitGuess() {

        if (this.gameOver) {

            return;

        }


        if (
            this.currentGuess.length !== 5
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


        if (

            this.currentGuess ===
            this.wordManager.secretWord

        ) {

            this.gameWon();

            return;

        }


        this.currentRow++;

        this.currentGuess = "";


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

        this.gameOver = true;


        const score =
            this.calculateScore();


        const attempt =
            this.currentRow + 1;


        await this.player.addWin(
            score
        );


        console.log(
            `WORDRUSH SCORE: +${score}`
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


        title.textContent =
            "YOU WON!";


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

        this.gameOver = true;


        await this.player.addLoss();


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


        title.textContent =
            "GAME OVER";


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