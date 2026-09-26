export class Board {

    constructor() {

        this.rows = 6;

        this.columns = 5;
    }


    createBoard() {

        const board =
            document.getElementById("board");

        board.innerHTML = "";

        for (let row = 0; row < this.rows; row++) {

            for (let column = 0; column < this.columns; column++) {

                const tile =
                    document.createElement("div");

                tile.classList.add("tile");

                tile.id =
                    `tile-${row}-${column}`;

                board.appendChild(tile);
            }
        }
    }


    displayLetter(row, column, letter) {

        const tile =
            document.getElementById(
                `tile-${row}-${column}`
            );

        tile.textContent = letter;

        // Small pop animation when a letter is entered
        tile.classList.remove("pop");

        void tile.offsetWidth;

        tile.classList.add("pop");

        setTimeout(() => {

            tile.classList.remove("pop");

        }, 100);
    }


    removeLetter(row, column) {

        const tile =
            document.getElementById(
                `tile-${row}-${column}`
            );

        tile.textContent = "";
    }


    showResult(row, result) {

        for (
            let column = 0;
            column < result.length;
            column++
        ) {

            const tile =
                document.getElementById(
                    `tile-${row}-${column}`
                );


            setTimeout(() => {

                tile.classList.add("flip");


                setTimeout(() => {

                    tile.classList.add(
                        result[column]
                    );

                }, 300);


                setTimeout(() => {

                    tile.classList.remove("flip");

                }, 600);

            }, column * 250);
        }
    }


    shakeRow(row) {

        for (
            let column = 0;
            column < this.columns;
            column++
        ) {

            const tile =
                document.getElementById(
                    `tile-${row}-${column}`
                );


            tile.classList.add("shake");


            setTimeout(() => {

                tile.classList.remove("shake");

            }, 500);
        }
    }

    celebrateRow(row) {

    for (
        let column = 0;
        column < this.columns;
        column++
    ) {

        const tile =
            document.getElementById(
                `tile-${row}-${column}`
            );


        setTimeout(() => {

            tile.classList.add(
                "celebrate"
            );


            setTimeout(() => {

                tile.classList.remove(
                    "celebrate"
                );

            }, 500);

        }, column * 100);
    }
}
}