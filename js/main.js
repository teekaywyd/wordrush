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
// PHYSICAL KEYBOARD
// ================================

document.addEventListener("keydown", function(event) {

    const key = event.key.toUpperCase();


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

});


// ================================
// TOP NEW GAME BUTTON
// ================================

document
    .getElementById("newGameButton")
    .addEventListener("click", function() {

        game.startGame();

    });


// ================================
// HINT BUTTON
// ================================

document
    .getElementById("hintButton")
    .addEventListener("click", function() {

        game.useHint();

    });


// ================================
// POPUP NEW GAME BUTTON
// ================================

document
    .getElementById("modalNewGame")
    .addEventListener("click", function() {

        game.startGame();

    });


// ================================
// POPUP EXIT BUTTON
// ================================

document
    .getElementById("modalExit")
    .addEventListener("click", function() {

        document.getElementById(
            "gameOverModal"
        ).style.display = "none";


        game.showMessage("GAME ENDED");

    });