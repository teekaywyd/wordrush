import { Game } from "./Game.js";
import { WordManager } from "./WordManager.js";
import { Board } from "./Board.js";
import { Player } from "./Player.js";
import { supabase } from "./supabase.js";


// ========================================
// DOM ELEMENTS
// ========================================

const message =
    document.getElementById("message");

const homeScreen =
    document.getElementById("homeScreen");

const gameScreen =
    document.getElementById("gameScreen");

const casualModeButton =
    document.getElementById("casualModeButton");

const backToMenuButton =
    document.getElementById("backToMenu");

const dailyButton =
    document.getElementById("dailyButton");

const mobileInput =
    document.getElementById("mobileInput");

const profileButton =
    document.getElementById("profileButton");

const leaderboardButton =
    document.getElementById("leaderboardButton");

const themeButton =
    document.getElementById("themeButton");

const hintButton =
    document.getElementById("hintButton");

const dailyStreak =
    document.getElementById("dailyStreak");

const dailyBestStreak =
    document.getElementById("dailyBestStreak");

const headerStreak =
    document.getElementById("headerStreak");

const modeIndicator =
    document.getElementById("modeIndicator");


// ========================================
// GAME OVER MODAL
// ========================================

const gameOverModal =
    document.getElementById("gameOverModal");

const shareWinButton = document.getElementById("shareWinButton");
const shareWinMessage = document.getElementById("shareWinMessage");


// ========================================
// PROFILE MODAL
// ========================================

const profileModal =
    document.getElementById("profileModal");

const closeProfile =
    document.getElementById("closeProfile");

const closeProfileBottom =
    document.getElementById("closeProfileBottom");

const profileUsername =
    document.getElementById("profileUsername");

const gamesPlayed =
    document.getElementById("gamesPlayed");

const wins =
    document.getElementById("wins");

const losses =
    document.getElementById("losses");

const winPercentage =
    document.getElementById("winPercentage");

const currentStreak =
    document.getElementById("currentStreak");

const bestStreak =
    document.getElementById("bestStreak");

const totalScore =
    document.getElementById("totalScore");


// ========================================
// ACCOUNT BUTTONS
// ========================================

const logoutButton =
    document.getElementById("logoutButton");

const deleteAccountButton =
    document.getElementById(
        "deleteAccountButton"
    );

const deleteConfirmation =
    document.getElementById(
        "deleteConfirmation"
    );

const cancelDeleteAccount =
    document.getElementById(
        "cancelDeleteAccount"
    );

const confirmDeleteAccount =
    document.getElementById(
        "confirmDeleteAccount"
    );


// ========================================
// LEADERBOARD MODAL
// ========================================

const leaderboardModal =
    document.getElementById(
        "leaderboardModal"
    );

const closeLeaderboard =
    document.getElementById(
        "closeLeaderboard"
    );

const closeLeaderboardBottom =
    document.getElementById(
        "closeLeaderboardBottom"
    );

const leaderboardList =
    document.getElementById(
        "leaderboardList"
    );

const leaderboardTabs = document.querySelectorAll("[data-leaderboard-mode]");
const leaderboardSubtitle = document.getElementById("leaderboardSubtitle");
let leaderboardMode = "casual";

const myLeaderboardRank =
    document.getElementById(
        "myLeaderboardRank"
    );


// ========================================
// THEME MODAL
// ========================================

const themeModal =
    document.getElementById("themeModal");

const closeTheme =
    document.getElementById("closeTheme");

const closeThemeBottom =
    document.getElementById(
        "closeThemeBottom"
    );

const themeOptions =
    document.querySelectorAll(
        ".theme-option"
    );


// ========================================
// AUTH MODAL
// ========================================

const authModal =
    document.getElementById("authModal");

const authTitle =
    document.getElementById("authTitle");

const emailInput =
    document.getElementById("emailInput");

const passwordInput =
    document.getElementById(
        "passwordInput"
    );

const authUsernameInput =
    document.getElementById(
        "authUsernameInput"
    );

const authMessage =
    document.getElementById(
        "authMessage"
    );

const authSubmit =
    document.getElementById(
        "authSubmit"
    );

const authSwitch =
    document.getElementById(
        "authSwitch"
    );


// ========================================
// GAME OBJECTS
// ========================================

const wordManager =
    new WordManager();

const board =
    new Board();

const player =
    new Player();

const game =
    new Game(
        wordManager,
        board,
        player
    );

shareWinButton.addEventListener("click", shareWinResult);


// ========================================
// AUTH MODE
// ========================================

let isLoginMode = false;


// ========================================
// THEME LIST
// ========================================

const themeClasses = [
    "theme-dark",
    "theme-ocean",
    "theme-forest",
    "theme-sunset",
    "theme-neon",
    "theme-royal"
];


// ========================================
// GET TODAY'S DATE
// ========================================

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);

}


// ========================================
// DAILY STORAGE KEY
// ========================================

function getDailyStorageKey() {

    return `wordrush-daily-${getTodayDate()}`;

}


// ========================================
// CHECK DAILY PROGRESS
// ========================================

function hasDailyProgress() {

    try {

        const saved =
            localStorage.getItem(
                getDailyStorageKey()
            );


        if (!saved) {

            return false;

        }


        const parsed =
            JSON.parse(saved);


        if (
            !parsed ||
            !parsed.word
        ) {

            return false;

        }


        return true;

    } catch (error) {

        console.error(
            "DAILY PROGRESS CHECK ERROR:",
            error
        );


        return false;

    }

}


// ========================================
// UPDATE DAILY BUTTON
// ========================================

async function updateDailyButton() {

    if (!dailyButton) {
        return;
    }


    const todayDate =
        getTodayDate();

    const dailyStatus = dailyButton.querySelector(".daily-mode-status");


    try {

        const completed =
            await player.hasCompletedDailyWord(
                todayDate
            );


        if (completed) {

            dailyStatus.textContent = "Completed today";


            return;

        }


        if (
            hasDailyProgress()
        ) {

            dailyStatus.textContent = "Continue today's puzzle";

        } else {

            dailyStatus.textContent = "Play today's puzzle";

        }

    } catch (error) {

        console.error(
            "DAILY BUTTON ERROR:",
            error
        );


        dailyStatus.textContent = "Play today's puzzle";

    }

}


// ========================================
// UPDATE HEADER STREAK
// ========================================

function updateHeaderStreak() {

    if (!headerStreak) {
        return;
    }


    headerStreak.textContent =
        `Daily streak: ${player.dailyCurrentStreak || 0}`;

}


// ========================================
// THEME LOADING
// ========================================

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem(
            "wordrush-theme"
        );


    if (!savedTheme) {
        return;
    }


    applyTheme(savedTheme);

}


function applyTheme(theme) {

    document.body.classList.remove(
        ...themeClasses
    );


    if (
        theme &&
        theme !== "classic"
    ) {

        document.body.classList.add(
            `theme-${theme}`
        );

    }


    localStorage.setItem(
        "wordrush-theme",
        theme
    );


    themeOptions.forEach(
        function(option) {

            option.classList.remove(
                "active"
            );


            if (
                option.dataset.theme ===
                theme
            ) {

                option.classList.add(
                    "active"
                );

            }

        }
    );

}


// ========================================
// LOAD ONLINE PLAYER
// ========================================

async function loadOnlinePlayer() {

    try {

        await player.loadOnline();

        await player.loadDailyStats();

        updateHeaderStreak();

        await updateDailyButton();


        console.log(
            "ONLINE PLAYER LOADED"
        );


    } catch (error) {

        console.error(
            "PLAYER LOAD ERROR:",
            error
        );

    }

}


// ========================================
// PROFILE
// ========================================

async function loadProfile() {

    try {

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabase.auth.getUser();


        if (
            userError ||
            !user
        ) {

            console.error(
                "NO USER FOUND:",
                userError
            );


            return;

        }


        const {
            data,
            error
        } =
            await supabase
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    user.id
                )
                .single();


        if (error) {

            console.error(
                "PROFILE LOAD ERROR:",
                error
            );


            return;

        }


        if (!data) {
            return;
        }


        await player.loadDailyStats();


        updateHeaderStreak();


        dailyStreak.textContent =
            player.dailyCurrentStreak || 0;


        dailyBestStreak.textContent =
            player.dailyBestStreak || 0;


        profileUsername.textContent =
            data.username || "PLAYER";


        gamesPlayed.textContent =
            data.games_played || 0;


        wins.textContent =
            data.wins || 0;


        losses.textContent =
            data.losses || 0;


        currentStreak.textContent =
            data.current_streak || 0;


        bestStreak.textContent =
            data.best_streak || 0;


        totalScore.textContent =
            data.total_score || 0;


        const played =
            Number(
                data.games_played || 0
            );


        const won =
            Number(
                data.wins || 0
            );


        let percentage = 0;


        if (played > 0) {

            percentage =
                Math.round(
                    (won / played) * 100
                );

        }


        winPercentage.textContent =
            `${percentage}%`;


    } catch (error) {

        console.error(
            "PROFILE ERROR:",
            error
        );

    }

}


// ========================================
// OPEN PROFILE
// ========================================

profileButton.addEventListener(
    "click",
    async function() {

        await loadProfile();


        profileModal.style.display =
            "flex";

    }
);


// ========================================
// CLOSE PROFILE
// ========================================

closeProfile.addEventListener(
    "click",
    function() {

        profileModal.style.display =
            "none";

    }
);


closeProfileBottom.addEventListener(
    "click",
    function() {

        profileModal.style.display =
            "none";

    }
);


// ========================================
// LOG OUT
// ========================================

logoutButton.addEventListener(
    "click",
    async function() {

        logoutButton.disabled =
            true;


        try {

            const {
                error
            } =
                await supabase.auth.signOut();


            if (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );


                logoutButton.disabled =
                    false;


                return;

            }


            profileModal.style.display =
                "none";


            authModal.style.display =
                "flex";


            authTitle.textContent =
                "LOGIN";


            authMessage.textContent =
                "YOU HAVE BEEN LOGGED OUT.";


            emailInput.value =
                "";

            passwordInput.value =
                "";

            authUsernameInput.value =
                "";


            isLoginMode = true;


            authSubmit.textContent =
                "LOGIN";


            authSwitch.textContent =
                "CREATE ACCOUNT";


            authUsernameInput.style.display =
                "none";


        } catch (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );


            logoutButton.disabled =
                false;

        }

    }
);


// ========================================
// DELETE ACCOUNT
// ========================================

deleteAccountButton.addEventListener(
    "click",
    function() {

        deleteConfirmation.classList.add(
            "show"
        );


        setTimeout(
            function() {

                deleteConfirmation.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            },
            100
        );

    }
);


// ========================================
// CANCEL DELETE
// ========================================

function resetDeleteConfirmation() {

    deleteConfirmation.classList.remove(
        "show"
    );


    confirmDeleteAccount.disabled =
        false;


    confirmDeleteAccount.textContent =
        "DELETE ACCOUNT";

}


cancelDeleteAccount.addEventListener(
    "click",
    function() {

        resetDeleteConfirmation();

    }
);


// ========================================
// CONFIRM DELETE ACCOUNT
// ========================================

confirmDeleteAccount.addEventListener(
    "click",
    async function() {

        confirmDeleteAccount.disabled =
            true;


        confirmDeleteAccount.textContent =
            "DELETING...";


        authMessage.textContent =
            "DELETING ACCOUNT...";


        try {

            const {
                data,
                error
            } =
                await supabase.functions.invoke(
                    "delete-account"
                );


            if (error) {

                console.error(
                    "DELETE ACCOUNT ERROR:",
                    error
                );


                confirmDeleteAccount.disabled =
                    false;


                confirmDeleteAccount.textContent =
                    "DELETE ACCOUNT";


                authMessage.textContent =
                    "COULD NOT DELETE ACCOUNT.";


                return;

            }


            if (
                !data ||
                !data.success
            ) {

                console.error(
                    "DELETE ACCOUNT ERROR:",
                    data
                );


                confirmDeleteAccount.disabled =
                    false;


                confirmDeleteAccount.textContent =
                    "DELETE ACCOUNT";


                authMessage.textContent =
                    "COULD NOT DELETE ACCOUNT.";


                return;

            }


            resetDeleteConfirmation();


            profileModal.style.display =
                "none";


            authModal.style.display =
                "flex";


            authTitle.textContent =
                "LOGIN";


            authMessage.textContent =
                "ACCOUNT DELETED.";


            emailInput.value =
                "";

            passwordInput.value =
                "";

            authUsernameInput.value =
                "";


            isLoginMode = true;


            authSubmit.textContent =
                "LOGIN";


            authSwitch.textContent =
                "CREATE ACCOUNT";


            authUsernameInput.style.display =
                "none";


            confirmDeleteAccount.disabled =
                false;


            confirmDeleteAccount.textContent =
                "DELETE ACCOUNT";


        } catch (error) {

            console.error(
                "DELETE ACCOUNT ERROR:",
                error
            );


            confirmDeleteAccount.disabled =
                false;


            confirmDeleteAccount.textContent =
                "DELETE ACCOUNT";


            authMessage.textContent =
                "COULD NOT DELETE ACCOUNT.";

        }

    }
);


// ========================================
// LEADERBOARD
// ========================================

async function shareWinResult() {
    shareWinButton.disabled = true;
    shareWinButton.textContent = "PREPARING IMAGE...";
    shareWinMessage.textContent = "";

    try {
        const isDaily = game.gameMode === "daily";
        const modeLabel = isDaily ? "DAILY MODE" : "CASUAL MODE";
        const guesses = isDaily ? game.dailyGuesses : game.practiceGuesses;
        const url = new URL(window.location.href);
        url.search = "";
        url.hash = "";

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const tileSize = 84;
        const tileGap = 12;
        const rowHeight = tileSize + tileGap;
        canvas.width = 900;
        canvas.height = 480 + guesses.length * rowHeight + 150;

        const styles = getComputedStyle(document.body);
        const background = styles.getPropertyValue("--background").trim() || "#ffffff";
        const foreground = styles.getPropertyValue("--text").trim() || "#111111";
        const secondary = styles.getPropertyValue("--text-secondary").trim() || "#666666";
        const accent = styles.getPropertyValue("--accent").trim() || "#111111";
        const buttonText = styles.getPropertyValue("--button-text").trim() || "#ffffff";
        const pathRoundedRect = (x, y, width, height, radius) => {
            context.beginPath();
            if (context.roundRect) context.roundRect(x, y, width, height, radius);
            else context.rect(x, y, width, height);
        };

        context.fillStyle = background;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.textAlign = "center";
        context.fillStyle = foreground;
        context.font = "500 54px Georgia, serif";
        context.fillText("WordRush", canvas.width / 2, 112);

        const badgeWidth = 390;
        context.fillStyle = accent;
        pathRoundedRect((canvas.width - badgeWidth) / 2, 150, badgeWidth, 72, 18);
        context.fill();
        context.fillStyle = buttonText;
        context.font = "700 32px Arial, sans-serif";
        context.fillText(modeLabel, canvas.width / 2, 197);

        context.fillStyle = foreground;
        context.font = "500 27px Arial, sans-serif";
        context.fillText(`SOLVED IN ${guesses.length}/6 GUESSES`, canvas.width / 2, 284);

        const gridWidth = tileSize * 5 + tileGap * 4;
        const gridLeft = (canvas.width - gridWidth) / 2;
        const gridTop = 330;
        guesses.forEach((guess, row) => {
            for (let column = 0; column < 5; column++) {
                const tile = document.getElementById(`tile-${row}-${column}`);
                const x = gridLeft + column * (tileSize + tileGap);
                const y = gridTop + row * rowHeight;
                const tileStyles = tile ? getComputedStyle(tile) : null;
                context.fillStyle = tileStyles?.backgroundColor || secondary;
                pathRoundedRect(x, y, tileSize, tileSize, 10);
                context.fill();
                context.fillStyle = tileStyles?.color || "#ffffff";
                context.font = "700 44px Arial, sans-serif";
                context.fillText(guess[column] || "", x + tileSize / 2, y + 57);
            }
        });

        context.fillStyle = secondary;
        context.font = "500 20px Arial, sans-serif";
        context.fillText(`Play WordRush: ${url.host}`, canvas.width / 2, canvas.height - 56);

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(image => image ? resolve(image) : reject(new Error("Could not create share image.")), "image/png");
        });
        const imageFile = new File([blob], "wordrush-win.png", { type: "image/png" });
        const shareText = `I solved WordRush in ${guesses.length}/6 guesses in ${modeLabel}. Play here: ${url.href}`;
        const shareData = {
            title: `WordRush ${modeLabel} win`,
            text: shareText,
            url: url.href,
            files: [imageFile]
        };

        if (navigator.share && navigator.canShare?.({ files: [imageFile] })) {
            await navigator.share(shareData);
            shareWinMessage.textContent = "READY TO SHARE.";
        } else {
            const downloadLink = document.createElement("a");
            const imageUrl = URL.createObjectURL(blob);
            downloadLink.href = imageUrl;
            downloadLink.download = imageFile.name;
            downloadLink.click();
            setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);

            if (navigator.share) {
                await navigator.share({ title: shareData.title, text: shareText, url: url.href });
                shareWinMessage.textContent = "IMAGE SAVED. SHARE THE GAME LINK.";
            } else {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(url.href);
                    shareWinMessage.textContent = "IMAGE SAVED. GAME LINK COPIED.";
                } else {
                    shareWinMessage.textContent = `IMAGE SAVED. PLAY AT ${url.host}.`;
                }
            }
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error("WIN SHARE ERROR:", error);
            shareWinMessage.textContent = "COULD NOT SHARE WIN. TRY AGAIN.";
        }
    } finally {
        shareWinButton.disabled = false;
        shareWinButton.textContent = "SHARE WIN";
    }
}

async function loadLeaderboard() {

    leaderboardList.innerHTML =
        "<p>LOADING...</p>";


    try {

        const dailyLeaderboard = leaderboardMode === "daily";
        const {
            data,
            error
        } = await supabase.rpc(
            dailyLeaderboard ? "get_daily_points_leaderboard" : "get_leaderboard"
        );


        if (error) {

            console.error(
                "LEADERBOARD ERROR:",
                error
            );


            leaderboardList.innerHTML =
                "<p>COULD NOT LOAD LEADERBOARD.</p>";


            return;

        }


        leaderboardList.innerHTML =
            "";


        if (
            !data ||
            data.length === 0
        ) {

            leaderboardList.innerHTML =
                dailyLeaderboard
                    ? "<p>NO DAILY SCORES YET.</p>"
                    : "<p>NO PLAYERS YET.</p>";
            myLeaderboardRank.textContent = "NO RANK YET";


            return;

        }


        const {
            data: {
                user
            }
        } =
            await supabase.auth.getUser();


        let myRank = null;


        data.forEach(
            function(playerData, index) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "leaderboard-row";


                if (
                    user &&
                    playerData.id ===
                    user.id
                ) {

                    row.classList.add(
                        "current-player"
                    );


                    myRank =
                        index + 1;

                }


                const rank =
                    document.createElement(
                        "span"
                    );


                rank.className =
                    "leaderboard-rank";


                rank.textContent =
                    `#${index + 1}`;


                const name =
                    document.createElement(
                        "span"
                    );


                name.className =
                    "leaderboard-name";


                name.textContent =
                    playerData.username ||
                    "PLAYER";


                const score =
                    document.createElement(
                        "span"
                    );


                score.className =
                    "leaderboard-score";


                score.textContent = dailyLeaderboard
                    ? playerData.daily_points || 0
                    : playerData.total_score || 0;


                row.appendChild(
                    rank
                );


                row.appendChild(
                    name
                );


                row.appendChild(
                    score
                );


                leaderboardList.appendChild(
                    row
                );

            }
        );


        if (myRank) {

            myLeaderboardRank.textContent =
                `YOUR RANK: #${myRank}`;

        } else {

            myLeaderboardRank.textContent =
                "YOUR RANK: OUTSIDE TOP 10";

        }


    } catch (error) {

        console.error(
            "LEADERBOARD ERROR:",
            error
        );


        leaderboardList.innerHTML =
            "<p>COULD NOT LOAD LEADERBOARD.</p>";

    }

}


// ========================================
// OPEN LEADERBOARD
// ========================================

leaderboardButton.addEventListener(
    "click",
    async function() {

        leaderboardModal.style.display =
            "flex";


        await loadLeaderboard();

    }
);


// ========================================
// CLOSE LEADERBOARD
// ========================================

closeLeaderboard.addEventListener(
    "click",
    function() {

        leaderboardModal.style.display =
            "none";

    }
);


closeLeaderboardBottom.addEventListener(
    "click",
    function() {

        leaderboardModal.style.display =
            "none";

    }
);


// ========================================
// OPEN THEME MODAL
// ========================================

themeButton.addEventListener(
    "click",
    function() {

        themeModal.style.display =
            "flex";

    }
);


// ========================================
// CLOSE THEME MODAL
// ========================================

closeTheme.addEventListener(
    "click",
    function() {

        themeModal.style.display =
            "none";

    }
);


closeThemeBottom.addEventListener(
    "click",
    function() {

        themeModal.style.display =
            "none";

    }
);


// ========================================
// THEME SELECTION
// ========================================

themeOptions.forEach(
    function(option) {

        option.addEventListener(
            "click",
            function() {

                const theme =
                    option.dataset.theme;


                applyTheme(theme);

            }
        );

    }
);


// ========================================
// DAILY WORD
// ========================================

async function startDailyWord() {
    try {
        let state = await player.getDailyGameState();
        const legacyKey = `wordrush-daily-${state.wordDate || getTodayDate()}`;
        try {
            const legacy = JSON.parse(localStorage.getItem(legacyKey) || "null");
            if (legacy?.wordDate === (state.wordDate || getTodayDate()) &&
                Array.isArray(legacy.guesses) && legacy.guesses.length &&
                state.status === "active") {
                for (const guess of legacy.guesses.slice((state.guesses || []).length, 6)) {
                    const migrated = await player.submitDailyGuess(guess);
                    if (!migrated.accepted && migrated.reason !== "completed") {
                        throw new Error("A saved daily guess could not be synced.");
                    }
                    if (migrated.status !== "active") break;
                }
                state = await player.getDailyGameState();
            }
        } catch (migrationError) {
            console.error("Could not sync saved daily progress:", migrationError);
            throw migrationError;
        }
        game.startDailyGame(state.wordDate || getTodayDate(), state);
        await updateDailyButton();
    } catch (error) {
        console.error("DAILY GAME LOAD ERROR:", error);
        game.showMessage("COULD NOT LOAD DAILY PUZZLE. CHECK DATABASE SETUP.");
    }
}


leaderboardTabs.forEach(tab => {
    tab.addEventListener("click", async () => {
        leaderboardMode = tab.dataset.leaderboardMode;
        leaderboardSubtitle.textContent = leaderboardMode === "daily"
            ? "TOP DAILY SCORES"
            : "TOP CASUAL SCORES";
        leaderboardTabs.forEach(option => {
            const selected = option === tab;
            option.classList.toggle("active", selected);
            option.setAttribute("aria-selected", String(selected));
        });
        await loadLeaderboard();
    });
});


// ========================================
// DAILY BUTTON
// ========================================

let casualGameStarted = false;
let casualProgress = null;

dailyButton.addEventListener(
    "click",
    async function() {
        modeIndicator.textContent = "Daily mode";
        hintButton.hidden = true;

        if (
            game.gameMode === "practice" &&
            casualGameStarted
        ) {
            casualProgress = game.getPracticeProgress();
        }

        showGameScreen();
        await startDailyWord();

    }
);


// ========================================
// MODE NAVIGATION
// ========================================

function showGameScreen() {
    homeScreen.hidden = true;
    gameScreen.hidden = false;
}

function showHomeScreen() {
    gameScreen.hidden = true;
    homeScreen.hidden = false;
    mobileInput.blur();
}

casualModeButton.addEventListener(
    "click",
    function() {
        modeIndicator.textContent = "Casual mode";

        if (
            game.gameMode === "daily" &&
            casualProgress &&
            game.restorePracticeProgress(casualProgress)
        ) {
            casualProgress = null;
            casualGameStarted = true;
        } else if (
            !casualGameStarted ||
            game.gameMode !== "practice" ||
            game.gameOver
        ) {
            game.startGame();
            casualGameStarted = true;
        }

        showGameScreen();
    }
);

backToMenuButton.addEventListener(
    "click",
    showHomeScreen
);


hintButton.addEventListener(
    "click",
    function() {

        game.useHint();

    }
);


// ========================================
// GAME STATE CHANGED
// ========================================

window.addEventListener(
    "wordrush-game-state-changed",
    async function() {

        modeIndicator.textContent =
            game.gameMode === "daily" ? "Daily mode" : "Casual mode";
        hintButton.hidden = game.gameMode === "daily";

        updateHeaderStreak();

        await updateDailyButton();

    }
);


// ========================================
// MOBILE INPUT
// ========================================

mobileInput.addEventListener(
    "input",
    function() {

        if (gameScreen.hidden) {
            mobileInput.value = "";
            return;
        }

        const value =
            mobileInput.value;


        if (!value) {
            return;
        }


        const lastCharacter =
            value
                .slice(-1)
                .toUpperCase();


        if (
            /^[A-Z]$/.test(
                lastCharacter
            )
        ) {

            game.handleKey(
                lastCharacter
            );

        }


        mobileInput.value =
            "";

    }
);

document.getElementById("board").addEventListener("click", () => {
    if (window.innerWidth <= 600 && !gameScreen.hidden) {
        mobileInput.focus({ preventScroll: true });
    }
});

// ========================================
// MOBILE KEYBOARD FOCUS
// ========================================

// ========================================
// PHYSICAL KEYBOARD
// ========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (gameScreen.hidden) {
            return;
        }

        const key =
            event.key.toUpperCase();


        if (
            key === "ENTER"
        ) {

            game.handleKey(
                "ENTER"
            );


            return;

        }


        if (
            key === "BACKSPACE"
        ) {

            game.handleKey(
                "BACKSPACE"
            );


            return;

        }


        if (
            document.activeElement ===
            mobileInput
        ) {

            return;

        }


        if (
            /^[A-Z]$/.test(
                key
            )
        ) {

            game.handleKey(
                key
            );

        }

    }
);


// ========================================
// AUTH - SWITCH LOGIN / SIGNUP
// ========================================

authSwitch.addEventListener(
    "click",
    function() {

        isLoginMode =
            !isLoginMode;


        if (isLoginMode) {

            authTitle.textContent =
                "LOGIN";


            authSubmit.textContent =
                "LOGIN";


            authSwitch.textContent =
                "CREATE ACCOUNT";


            authUsernameInput.style.display =
                "none";


        } else {

            authTitle.textContent =
                "CREATE ACCOUNT";


            authSubmit.textContent =
                "SIGN UP";


            authSwitch.textContent =
                "ALREADY HAVE AN ACCOUNT? LOGIN";


            authUsernameInput.style.display =
                "block";

        }


        authMessage.textContent =
            "";

    }
);


// ========================================
// AUTH SUBMIT
// ========================================

authSubmit.addEventListener(
    "click",
    async function() {

        const email =
            emailInput.value.trim();


        const password =
            passwordInput.value;


        const username =
            authUsernameInput.value.trim();


        authMessage.textContent =
            "";


        if (!email) {

            authMessage.textContent =
                "ENTER YOUR EMAIL.";


            return;

        }


        if (!password) {

            authMessage.textContent =
                "ENTER YOUR PASSWORD.";


            return;

        }


        authSubmit.disabled =
            true;


        // ========================================
        // LOGIN
        // ========================================

        if (isLoginMode) {

            const {
                data,
                error
            } =
                await supabase.auth.signInWithPassword({
                    email,
                    password
                });


            if (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                authMessage.textContent =
                    error.message
                        .toUpperCase();


                authSubmit.disabled =
                    false;


                return;

            }


            if (!data.user) {

                authMessage.textContent =
                    "LOGIN FAILED.";


                authSubmit.disabled =
                    false;


                return;

            }


            authMessage.textContent =
                "LOGIN SUCCESSFUL.";


            authModal.style.display =
                "none";


            authSubmit.disabled =
                false;


            await loadOnlinePlayer();


            await updateDailyButton();


            return;

        }


        // ========================================
        // SIGN UP
        // ========================================

        if (!username) {

            authMessage.textContent =
                "ENTER A USERNAME.";


            authSubmit.disabled =
                false;


            return;

        }


        const {
            data,
            error
        } =
            await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username }
                }
            });


        if (error) {

            console.error(
                "SIGN UP ERROR:",
                error
            );


            authMessage.textContent =
                error.message
                    .toUpperCase();


            authSubmit.disabled =
                false;


            return;

        }


        if (!data.user) {

            authMessage.textContent =
                "SIGN UP FAILED.";


            authSubmit.disabled =
                false;


            return;

        }


        if (data.session) {
            authMessage.textContent = "ACCOUNT CREATED.";
            authModal.style.display = "none";
            authSubmit.disabled = false;
            showHomeScreen();
            await loadOnlinePlayer();
            await updateDailyButton();
            return;
        }

        authMessage.textContent = "ACCOUNT CREATED. CHECK YOUR EMAIL TO SIGN IN.";
        authSubmit.disabled = false;

    }
);


// ========================================
// AUTH STATE CHANGES
// ========================================

supabase.auth.onAuthStateChange(
    async function(
        event,
        session
    ) {

        console.log(
            "AUTH EVENT:",
            event
        );


        if (
            event ===
            "SIGNED_IN" &&
            session
        ) {

            await loadOnlinePlayer();

        }


        if (
            event ===
            "SIGNED_OUT"
        ) {

            profileModal.style.display =
                "none";


            leaderboardModal.style.display =
                "none";

        }

    }
);


// ========================================
// INITIAL SETUP
// ========================================

loadSavedTheme();


// ========================================
// CHECK EXISTING SESSION
// ========================================

async function checkSession() {

    try {

        const {
            data: {
                session
            }
        } =
            await supabase.auth.getSession();


        if (!session) {

            authModal.style.display =
                "flex";


            return;

        }


        await loadOnlinePlayer();


        await updateDailyButton();


    } catch (error) {

        console.error(
            "SESSION ERROR:",
            error
        );


        authModal.style.display =
            "flex";

    }

}


checkSession();


// ========================================
// SERVICE WORKER
// ========================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(
                    () => {

                        console.log(
                            "WordRush service worker registered."
                        );

                    }
                )
                .catch(
                    (error) => {

                        console.error(
                            "Service worker registration failed:",
                            error
                        );

                    }
                );

        }
    );

}
