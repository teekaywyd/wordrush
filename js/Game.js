export class Game {

    constructor(wordManager, board, keyboard, player) {

        this.wordManager = wordManager;
        this.board = board;
        this.keyboard = keyboard;
        this.player = player;

        this.currentRow = 0;
        this.currentGuess = "";
        this.gameOver = false;

        this.maxAttempts = 6;
        this.wordLength = 5;

        this.hintUsed = false;

        this.setupModalButtons();
    }


    // ================================
    // START GAME
    // ================================

    startGame() {

        this.currentRow = 0;
        this.currentGuess = "";
        this.gameOver = false;
        this.hintUsed = false;

        this.wordManager.newWord();

        this.board.createBoard();

        this.keyboard.createKeyboard();

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


    // ================================
    // ADD LETTER
    // ================================

    addLetter(letter) {

        if (this.gameOver) {
            return;
        }

        if (this.currentGuess.length >= this.wordLength) {
            return;
        }

        this.currentGuess += letter;

        this.board.displayLetter(
            this.currentRow,
            this.currentGuess.length - 1,
            letter
        );
    }


    // ================================
    // REMOVE LETTER
    // ================================

    removeLetter() {

        if (this.gameOver) {
            return;
        }

        if (this.currentGuess.length === 0) {
            return;
        }

        this.currentGuess =
            this.currentGuess.slice(0, -1);

        this.board.removeLetter(
            this.currentRow,
            this.currentGuess.length
        );
    }


    // ================================
    // SUBMIT GUESS
    // ================================

    submitGuess() {

        if (this.gameOver) {
            return;
        }


        // =========================
        // NOT ENOUGH LETTERS
        // =========================

        if (this.currentGuess.length !== 5) {

            this.showMessage(
                "ENTER A 5 LETTER WORD"
            );

            this.board.shakeRow(
                this.currentRow
            );

            this.clearMessageAfter(1500);

            return;
        }


        // =========================
        // WORD NOT FOUND
        // =========================

        if (!this.wordManager.isValidWord(
            this.currentGuess
        )) {

            this.showMessage(
                "WORD NOT FOUND"
            );

            this.board.shakeRow(
                this.currentRow
            );

            this.clearMessageAfter(1500);

            return;
        }


        // =========================
        // CHECK WORD
        // =========================

        const result =
            this.wordManager.checkGuess(
                this.currentGuess
            );


        this.board.showResult(
            this.currentRow,
            result
        );


        // =========================
        // WIN
        // =========================

        if (
            this.currentGuess ===
            this.wordManager.secretWord
        ) {

            this.gameWon();

            return;
        }


        // =========================
        // NEXT ROW
        // =========================

        this.currentRow++;

        this.currentGuess = "";


        // =========================
        // GAME LOST
        // =========================

        if (
            this.currentRow >=
            this.maxAttempts
        ) {

            this.gameLost();
        }
    }


    // ================================
    // GAME WON
    // ================================

    gameWon() {

        this.gameOver = true;

        this.player.addWin();


        // Wait for the tiles to finish flipping

        setTimeout(() => {

            this.board.celebrateRow(
                this.currentRow
            );


            // Show the popup after celebration

            setTimeout(() => {

                this.showWinModal();

            }, 700);

        }, 1600);
    }


    // ================================
    // WIN MODAL
    // ================================

    showWinModal() {

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


    icon.textContent = "🎉";

    title.textContent =
        "YOU WON!";

    answer.textContent =
        this.wordManager.secretWord;

    modal.style.display = "flex";

    this.createConfetti();
}

createConfetti() {

    const confetti =
        document.getElementById(
            "confetti"
        );


    confetti.innerHTML = "";


    for (let i = 0; i < 40; i++) {

        const piece =
            document.createElement("div");

        piece.classList.add(
            "confetti-piece"
        );


        const x =
            (Math.random() - 0.5) * 500;

        const y =
            (Math.random() - 0.5) * 500;


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


        confetti.appendChild(piece);
    }


    setTimeout(() => {

        confetti.innerHTML = "";

    }, 1200);
}


    // ================================
    // GAME LOST
    // ================================

    gameLost() {

        this.gameOver = true;

        this.player.addLoss();


        setTimeout(() => {

            this.showGameOverModal();

        }, 1500);
    }


    // ================================
    // GAME OVER MODAL
    // ================================

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


    // Remove win styling

    modal.classList.remove(
        "game-lost"
    );


    // Add game-over styling

    modal.classList.add(
        "game-lost"
    );


    icon.textContent = "😔";

    title.textContent =
        "GAME OVER";

    answer.textContent =
        this.wordManager.secretWord;


    modal.style.display = "flex";
}


    // ================================
    // MODAL BUTTONS
    // ================================

    setupModalButtons() {

        document.getElementById(
            "modalNewGame"
        ).addEventListener("click", () => {

            this.startGame();

        });


        document.getElementById(
            "modalExit"
        ).addEventListener("click", () => {

            document.getElementById(
                "gameOverModal"
            ).style.display = "none";

            this.showMessage(
                "GAME EXITED"
            );

        });
    }


    // ================================
    // HINT
    // ================================

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


        for (let letter of word) {

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


    // ================================
    // CLEAR MESSAGE
    // ================================

    clearMessageAfter(time) {

        setTimeout(() => {

            this.showMessage("");

        }, time);
    }


    // ================================
    // SHOW MESSAGE
    // ================================

    showMessage(message) {

        const messageElement =
            document.getElementById(
                "message"
            );

        messageElement.textContent =
            message;
    }

    
}