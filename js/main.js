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

const newGameButton =
    document.getElementById("newGameButton");

const hintButton =
    document.getElementById("hintButton");

const dailyStreak =
    document.getElementById("dailyStreak");

const dailyBestStreak =
    document.getElementById("dailyBestStreak");

const headerStreak =
    document.getElementById("headerStreak");


// ========================================
// GAME OVER MODAL
// ========================================

const gameOverModal =
    document.getElementById("gameOverModal");


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

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

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


    try {

        const completed =
            await player.hasCompletedDailyWord(
                todayDate
            );


        if (completed) {

            dailyButton.textContent =
                "✓ DAILY COMPLETE";


            dailyButton.classList.add(
                "daily-complete"
            );


            return;

        }


        dailyButton.classList.remove(
            "daily-complete"
        );


        if (
            hasDailyProgress()
        ) {

            dailyButton.textContent =
                "📅 CONTINUE DAILY";

        } else {

            dailyButton.textContent =
                "📅 DAILY";

        }

    } catch (error) {

        console.error(
            "DAILY BUTTON ERROR:",
            error
        );


        dailyButton.textContent =
            "📅 DAILY";

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
        `DAILY STREAK: ${player.dailyCurrentStreak || 0} 🔥`;

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

async function loadLeaderboard() {

    leaderboardList.innerHTML =
        "<p>LOADING...</p>";


    try {

        const {
            data,
            error
        } =
            await supabase.rpc(
                "get_leaderboard"
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
                "<p>NO PLAYERS YET.</p>";


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


                score.textContent =
                    playerData.total_score ||
                    0;


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

        const todayDate =
            getTodayDate();


        // ========================================
        // CHECK IF ALREADY COMPLETED
        // ========================================

        const alreadyCompleted =
            await player.hasCompletedDailyWord(
                todayDate
            );


        if (alreadyCompleted) {

            game.showMessage(
                "✓ YOU ALREADY COMPLETED TODAY'S DAILY WORD"
            );


            await updateDailyButton();


            return;

        }


        // ========================================
        // GET TODAY'S DAILY WORD
        // ========================================

        const {
            data,
            error
        } =
            await supabase
                .from("daily_words")
                .select(
                    "word"
                )
                .eq(
                    "word_date",
                    todayDate
                )
                .single();


        if (error) {

            console.error(
                "DAILY WORD ERROR:",
                error
            );


            game.showMessage(
                "DAILY WORD IS NOT AVAILABLE YET."
            );


            return;

        }


        if (
            !data ||
            !data.word
        ) {

            game.showMessage(
                "DAILY WORD IS NOT AVAILABLE YET."
            );


            return;

        }


        // ========================================
        // START / RESUME DAILY GAME
        // ========================================

        game.startDailyGame(

            data.word,

            todayDate

        );


        await updateDailyButton();


    } catch (error) {

        console.error(
            "DAILY WORD ERROR:",
            error
        );


        game.showMessage(
            "COULD NOT LOAD DAILY WORD."
        );

    }

}


// ========================================
// DAILY BUTTON
// ========================================

dailyButton.addEventListener(
    "click",
    async function() {

        await startDailyWord();

    }
);


// ========================================
// NEW GAME / EXIT DAILY
// ========================================

newGameButton.addEventListener(
    "click",
    function() {

        // ========================================
        // EXIT DAILY PUZZLE
        // ========================================

        if (
            game.gameMode === "daily" &&
            !game.gameOver
        ) {

            game.startGame();


            game.showMessage(
                "📅 DAILY PROGRESS SAVED"
            );


            updateDailyButton();


            return;

        }


        // ========================================
        // START NORMAL GAME
        // ========================================

        game.startGame();


        updateDailyButton();

    }
);


// ========================================
// HINT
// ========================================

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


// ========================================
// MOBILE KEYBOARD FOCUS
// ========================================

document.addEventListener(
    "click",
    function() {

        if (
            authModal.style.display ===
            "flex"
        ) {

            return;

        }


        if (
            profileModal.style.display ===
            "flex" ||
            leaderboardModal.style.display ===
            "flex" ||
            themeModal.style.display ===
            "flex" ||
            gameOverModal.style.display ===
            "flex"
        ) {

            return;

        }


        if (
            window.innerWidth <= 600
        ) {

            mobileInput.focus();

        }

    }
);


// ========================================
// PHYSICAL KEYBOARD
// ========================================

document.addEventListener(
    "keydown",
    function(event) {

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


            game.startGame();


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
                password
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


        // ========================================
        // CREATE PROFILE
        // ========================================

        const {
            error: profileError
        } =
            await supabase
                .from("profiles")
                .insert({
                    id: data.user.id,
                    username: username,
                    games_played: 0,
                    wins: 0,
                    losses: 0,
                    current_streak: 0,
                    best_streak: 0,
                    total_score: 0
                });


        if (profileError) {

            console.error(
                "PROFILE CREATION ERROR:",
                profileError
            );


            authMessage.textContent =
                profileError.message
                    .toUpperCase();


            authSubmit.disabled =
                false;


            return;

        }


        authMessage.textContent =
            "ACCOUNT CREATED. CHECK YOUR EMAIL.";


        authSubmit.disabled =
            false;

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


        game.startGame();


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