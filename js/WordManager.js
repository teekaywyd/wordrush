import { commonWordsLen5 } from "@skedwards88/word_lists";

export class WordManager {

    constructor() {

        this.words = commonWordsLen5.map(
            word => word.toUpperCase()
        );

        this.secretWord = this.getRandomWord();
    }


    getRandomWord() {

        const randomIndex =
            Math.floor(Math.random() * this.words.length);

        return this.words[randomIndex];
    }


    newWord() {

        this.secretWord = this.getRandomWord();
    }


    isValidWord(word) {

        return this.words.includes(
            word.toUpperCase()
        );
    }


    checkGuess(guess) {

        const result = [];

        const remainingLetters =
            this.secretWord.split("");


        // FIRST PASS: correct letters

        for (let i = 0; i < 5; i++) {

            if (guess[i] === this.secretWord[i]) {

                result[i] = "correct";

                remainingLetters[i] = null;
            }
        }


        // SECOND PASS: letters in wrong position

        for (let i = 0; i < 5; i++) {

            if (result[i] === "correct") {
                continue;
            }


            const letterIndex =
                remainingLetters.indexOf(guess[i]);


            if (letterIndex !== -1) {

                result[i] = "present";

                remainingLetters[letterIndex] = null;

            } else {

                result[i] = "incorrect";
            }
        }


        return result;
    }
}