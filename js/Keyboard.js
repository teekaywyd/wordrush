export class Keyboard {

    constructor(game) {

        this.game = game;

        this.keys = [

            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],

            ["A", "S", "D", "F", "G", "H", "J", "K", "L"],

            ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
        ];
    }


    createKeyboard() {

        const keyboard =
            document.getElementById("keyboard");

        keyboard.innerHTML = "";

        for (let row of this.keys) {

            const keyboardRow =
                document.createElement("div");

            keyboardRow.classList.add(
                "keyboard-row"
            );


            for (let key of row) {

                const button =
                    document.createElement("button");

                button.textContent = key;

                button.classList.add("key");


                button.addEventListener(
                    "click",
                    () => {

                        if (key === "ENTER") {

                            this.game.submitGuess();

                        } else if (key === "BACK") {

                            this.game.removeLetter();

                        } else {

                            this.game.addLetter(key);
                        }
                    }
                );


                keyboardRow.appendChild(button);
            }


            keyboard.appendChild(keyboardRow);
        }
    }
}