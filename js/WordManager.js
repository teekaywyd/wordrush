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

        return this.words.includes(word);
    }


    checkGuess(guess) {

        const result = [];

        for (let i = 0; i < 5; i++) {

            if (guess[i] === this.secretWord[i]) {

                result.push("correct");

            } else if (this.secretWord.includes(guess[i])) {

                result.push("present");

            } else {

                result.push("incorrect");
            }
        }

        return result;
    }
}