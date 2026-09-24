checkGuess(guess) {

    const result = [];
    const remainingLetters = this.secretWord.split("");

    // First check for correct letters
    for (let i = 0; i < 5; i++) {

        if (guess[i] === this.secretWord[i]) {

            result[i] = "correct";

            // Remove the matched letter
            remainingLetters[i] = null;
        }
    }

    // Then check for letters in the wrong position
    for (let i = 0; i < 5; i++) {

        // Skip letters already marked correct
        if (result[i] === "correct") {
            continue;
        }

        const letterIndex =
            remainingLetters.indexOf(guess[i]);

        if (letterIndex !== -1) {

            result[i] = "present";

            // Remove the letter so it cannot be used again
            remainingLetters[letterIndex] = null;

        } else {

            result[i] = "incorrect";
        }
    }

    return result;
}