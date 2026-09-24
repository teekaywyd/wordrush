export class Player {

    constructor() {

        this.gamesPlayed = 0;

        this.gamesWon = 0;

        this.currentStreak = 0;

        this.bestStreak = 0;
    }


    addWin() {

        this.gamesPlayed++;

        this.gamesWon++;

        this.currentStreak++;


        if (this.currentStreak > this.bestStreak) {

            this.bestStreak =
                this.currentStreak;
        }
    }


    addLoss() {

        this.gamesPlayed++;

        this.currentStreak = 0;
    }


    getWinPercentage() {

        if (this.gamesPlayed === 0) {

            return 0;
        }

        return Math.round(
            (this.gamesWon / this.gamesPlayed) * 100
        );
    }
}