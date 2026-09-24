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
    }


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


    submitGuess() {

        if (this.gameOver) {
            return;
        }


        if (this.currentGuess.length !== 5) {

            this.showMessage(
                "ENTER A 5 LETTER WORD"
            );

            return;
        }


        if (!this.wordManager.isValidWord(
            this.currentGuess
        )) {

            this.showMessage(
                "WORD NOT FOUND"
            );

            this.board.shakeRow(
                this.currentRow
            );

            setTimeout(() => {

                this.showMessage("");

            }, 2000);

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


        if (this.currentRow >= this.maxAttempts) {

            this.gameLost();
        }
    }


    gameWon() {

        this.gameOver = true;

        this.player.addWin();

        setTimeout(() => {

            this.showWinModal();

        }, 500);
    }


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

        title.textContent =
            "YOU WON!";

        answer.textContent =
            this.wordManager.secretWord;

        modal.style.display = "flex";
    }


    gameLost() {

        this.gameOver = true;

        this.player.addLoss();

        setTimeout(() => {

            this.showGameOverModal();

        }, 1500);
    }


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

        title.textContent =
            "GAME OVER";

        answer.textContent =
            this.wordManager.secretWord;

        modal.style.display = "flex";
    }


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

            this.showMessage("GAME EXITED");

        });
    }


    useHint() {

        if (this.gameOver) {
            return;
        }

        if (this.hintUsed) {

            this.showMessage(
                "HINT ALREADY USED"
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
            `HINT: VOWEL = ${vowel} | CONSONANT = ${consonant}`
        );


        this.hintUsed = true;


        document.getElementById(
            "hintButton"
        ).disabled = true;
    }


    showMessage(message) {

        const messageElement =
            document.getElementById(
                "message"
            );

        messageElement.textContent =
            message;
    }
}