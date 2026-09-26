
import { Game } from "./Game.js";
import { WordManager } from "./WordManager.js";
import { Board } from "./Board.js";
import { Keyboard } from "./Keyboard.js";
import { Player } from "./Player.js";


const wordManager = new WordManager();

const board = new Board();

const player = new Player();

const keyboard = new Keyboard(null);

const game = new Game(
    wordManager,
    board,
    keyboard,
    player
);


// Connect the keyboard to the game
keyboard.game = game;


// Start the game
game.startGame();


// ================================
// MOBILE SYSTEM KEYBOARD
// ================================

const mobileInput =
    document.getElementById("mobileInput");


mobileInput.addEventListener(
    "input",
    function() {

        const value =
            mobileInput.value.toUpperCase();


        if (value.length > 0) {

            const lastLetter =
                value[value.length - 1];


            if (
                lastLetter >= "A" &&
                lastLetter <= "Z"
            ) {

                game.addLetter(lastLetter);

            }
        }


        mobileInput.value = "";
    }
);


mobileInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Backspace") {

            event.preventDefault();

            game.removeLetter();

        }


        if (event.key === "Enter") {

            event.preventDefault();

            game.submitGuess();

            mobileInput.value = "";
        }
    }
);


// Focus the system keyboard when the board is touched
document
    .getElementById("board")
    .addEventListener("click", function() {

        mobileInput.focus();

    });


// ================================
// PHYSICAL KEYBOARD
// ================================

document.addEventListener(
    "keydown",
    function(event) {

        // Ignore this listener when using
        // the mobile input
        if (event.target === mobileInput) {
            return;
        }


        const key =
            event.key.toUpperCase();


        if (key === "ENTER") {

            game.submitGuess();

        } else if (key === "BACKSPACE") {

            game.removeLetter();

        } else if (
            key.length === 1 &&
            key >= "A" &&
            key <= "Z"
        ) {

            game.addLetter(key);

        }

    }
);


// ================================
// TOP NEW GAME BUTTON
// ================================

document
    .getElementById("newGameButton")
    .addEventListener(
        "click",
        function() {

            game.startGame();

        }
    );


// ================================
// HINT BUTTON
// ================================

document
    .getElementById("hintButton")
    .addEventListener(
        "click",
        function() {

            game.useHint();

        }
    );


// ================================
// POPUP NEW GAME BUTTON
// ================================

document
    .getElementById("modalNewGame")
    .addEventListener(
        "click",
        function() {

            game.startGame();

        }
    );


// ================================
// POPUP EXIT BUTTON
// ================================

document
    .getElementById("modalExit")
    .addEventListener(
        "click",
        function() {

            document.getElementById(
                "gameOverModal"
            ).style.display = "none";


            game.showMessage(
                "GAME ENDED"
            );

        }
    );

