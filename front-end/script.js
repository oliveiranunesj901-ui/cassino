/* =====================================================
   PONTOPLAY FORTUNE
   FRONT-END
===================================================== */


/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const SYMBOLS = [
    "💰",
    "💲",
    "🔝",
    "🎲",
    "💣",
    "🔞",
    "💸"
];

const SPIN_COST = 10;
const JACKPOT_REWARD = 100;
const DOUBLE_REWARD = 30;


/*
    IMPORTANTE:

    Estes dados estão aqui somente para protótipo.

    Em uma aplicação real, a autenticação administrativa
    deve acontecer no Python/backend e nunca no JavaScript.
*/

const ADMIN_EMAIL = "admin@pontoplay.com";
const ADMIN_PASSWORD = "123456";


/* =====================================================
   ESTADO
===================================================== */

let currentUser = null;

let credits = 100;

let isSpinning = false;


/* =====================================================
   ELEMENTOS HTML
===================================================== */

const loginScreen =
    document.getElementById("loginScreen");

const gameScreen =
    document.getElementById("gameScreen");

const loginForm =
    document.getElementById("loginForm");

const nameInput =
    document.getElementById("name");

const phoneInput =
    document.getElementById("phone");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const currentUserElement =
    document.getElementById("currentUser");

const creditsElement =
    document.getElementById("credits");

const spinButton =
    document.getElementById("spinButton");

const logoutButton =
    document.getElementById("logoutButton");

const slotElements = [
    document.getElementById("slot1"),
    document.getElementById("slot2"),
    document.getElementById("slot3")
];

const slotBoxes =
    document.querySelectorAll(".slot");

const gameStatus =
    document.getElementById("gameStatus");

const adminModal =
    document.getElementById("adminModal");

const closeAdmin =
    document.getElementById("closeAdmin");

const exportUsers =
    document.getElementById("exportUsers");

const toast =
    document.getElementById("toast");


/* =====================================================
   BANCO LOCAL DO FRONT-END
===================================================== */

function getUsers() {

    return JSON.parse(
        localStorage.getItem("pontoplay_users") || "[]"
    );

}


function saveUsers(users) {

    localStorage.setItem(
        "pontoplay_users",
        JSON.stringify(users)
    );

}


function getStats() {

    return JSON.parse(
        localStorage.getItem("pontoplay_stats") ||
        JSON.stringify({
            acessos: 0,
            partidas: 0,
            jackpots: 0,
            arrecadado: 0
        })
    );

}


function saveStats(stats) {

    localStorage.setItem(
        "pontoplay_stats",
        JSON.stringify(stats)
    );

}


/* =====================================================
   NOTIFICAÇÃO
===================================================== */

function showToast(message, type = "success") {

    toast.textContent = message;

    toast.style.borderLeftColor =
        type === "error"
            ? "#ff3b3b"
            : "#00ff99";

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =====================================================
   CRÉDITOS
===================================================== */

function updateCredits() {

    creditsElement.textContent = credits;

}


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        nameInput.value.trim();

    const phone =
        phoneInput.value.trim();

    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;


    /* VALIDAÇÃO */

    if (
        !name ||
        !phone ||
        !email ||
        !password
    ) {

        showToast(
            "Preencha todos os campos!",
            "error"
        );

        return;
    }


    /* ADMIN */

    if (
        email === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
    ) {

        openAdminPanel();

        return;
    }


    /* CADASTRO */

    const users = getUsers();

    const existingUser =
        users.find(user => user.email === email);


    if (existingUser) {

        currentUser = existingUser;

        credits = 100;

    } else {

        const newUser = {

            id: Date.now(),

            nome: name,

            telefone: phone,

            email: email,

            senha: password

        };

        users.push(newUser);

        saveUsers(users);

        currentUser = newUser;

        credits = 100;

    }


    /* ESTATÍSTICAS */

    const stats = getStats();

    stats.acessos++;

    saveStats(stats);


    enterGame();

});


/* =====================================================
   ENTRAR NO JOGO
===================================================== */

function enterGame() {

    loginScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    currentUserElement.textContent =
        currentUser.nome;

    updateCredits();

    gameStatus.textContent =
        "🔥 Boa sorte!";

    gameStatus.className =
        "game-status";

    showToast(
        `Bem-vindo, ${currentUser.nome}!`
    );

}


/* =====================================================
   SENHA
===================================================== */

togglePassword.addEventListener(
    "click",
    function() {

        const isPassword =
            passwordInput.type === "password";


        passwordInput.type =
            isPassword
                ? "text"
                : "password";


        togglePassword.textContent =
            isPassword
                ? "🙈"
                : "👁️";

    }
);


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
    "click",
    function() {

        currentUser = null;

        credits = 100;

        gameScreen.classList.add("hidden");

        loginScreen.classList.remove("hidden");

        loginForm.reset();

        slotElements.forEach(
            element => element.textContent = "❔"
        );

        gameStatus.textContent =
            "🔥 Boa sorte!";

        gameStatus.className =
            "game-status";

    }
);


/* =====================================================
   SÍMBOLO ALEATÓRIO
===================================================== */

function randomSymbol() {

    const index =
        Math.floor(
            Math.random() * SYMBOLS.length
        );

    return SYMBOLS[index];

}


/* =====================================================
   ANIMAÇÃO DA MÁQUINA
===================================================== */

function startSlotAnimation() {

    slotBoxes.forEach(slot => {

        slot.classList.add("spinning");

    });


    const animation =
        setInterval(() => {

            slotElements.forEach(
                element => {

                    element.textContent =
                        randomSymbol();

                }
            );

        }, 80);


    return animation;

}


function stopSlotAnimation(animation) {

    clearInterval(animation);

    slotBoxes.forEach(slot => {

        slot.classList.remove("spinning");

    });

}


/* =====================================================
   RESULTADO
===================================================== */

function generateResult() {

    return [
        randomSymbol(),
        randomSymbol(),
        randomSymbol()
    ];

}


/* =====================================================
   GIRAR
===================================================== */

spinButton.addEventListener(
    "click",
    spin
);


async function spin() {

    if (isSpinning) {
        return;
    }


    /* VERIFICA CRÉDITOS */

    if (credits < SPIN_COST) {

        gameStatus.textContent =
            "❌ Sem créditos!";

        gameStatus.className =
            "game-status status-loss";

        showToast(
            "Você não possui créditos suficientes.",
            "error"
        );

        return;
    }


    isSpinning = true;

    spinButton.disabled = true;


    /* PAGA A RODADA */

    credits -= SPIN_COST;

    updateCredits();


    /* ESTATÍSTICAS */

    const stats = getStats();

    stats.partidas++;

    stats.arrecadado += SPIN_COST;

    saveStats(stats);


    /* ANIMAÇÃO */

    const animation =
        startSlotAnimation();


    /*
        Mantemos a animação por aproximadamente
        1.5 segundos.
    */

    await new Promise(resolve => {

        setTimeout(resolve, 1500);

    });


    /* PARA ANIMAÇÃO */

    stopSlotAnimation(animation);


    /* GERA RESULTADO */

    const result =
        generateResult();


    slotElements[0].textContent =
        result[0];

    slotElements[1].textContent =
        result[1];

    slotElements[2].textContent =
        result[2];


    /* PROCESSA RESULTADO */

    processResult(result);


    isSpinning = false;

    spinButton.disabled = false;

}


/* =====================================================
   PROCESSAR RESULTADO
===================================================== */

function processResult(result) {

    const [
        first,
        second,
        third
    ] = result;


    /* =========================
       JACKPOT
    ========================== */

    if (
        first === second &&
        second === third
    ) {

        credits += JACKPOT_REWARD;


        const stats = getStats();

        stats.jackpots++;

        saveStats(stats);


        gameStatus.textContent =
            "🎉 JACKPOT +100!";

        gameStatus.className =
            "game-status status-jackpot";


        showToast(
            "🎉 JACKPOT! Você ganhou 100 créditos!"
        );


    }


    /* =========================
       DOIS IGUAIS
    ========================== */

    else if (
        first === second ||
        first === third ||
        second === third
    ) {

        credits += DOUBLE_REWARD;


        gameStatus.textContent =
            "🔥 DOIS IGUAIS +30";

        gameStatus.className =
            "game-status status-win";


        showToast(
            "🔥 Dois símbolos iguais! +30 créditos."
        );

    }


    /* =========================
       DERROTA
    ========================== */

    else {

        gameStatus.textContent =
            "❌ VOCÊ PERDEU";

        gameStatus.className =
            "game-status status-loss";

    }


    updateCredits();

}


/* =====================================================
   PAINEL ADMIN
===================================================== */

function openAdminPanel() {

    updateAdminStats();

    adminModal.classList.remove("hidden");

}


function updateAdminStats() {

    const users =
        getUsers();

    const stats =
        getStats();


    document.getElementById(
        "totalUsers"
    ).textContent = users.length;


    document.getElementById(
        "totalAccess"
    ).textContent = stats.acessos;


    document.getElementById(
        "totalGames"
    ).textContent = stats.partidas;


    document.getElementById(
        "totalJackpots"
    ).textContent = stats.jackpots;


    document.getElementById(
        "totalMoney"
    ).textContent =
        `${stats.arrecadado} créditos`;

}


/* FECHAR */

closeAdmin.addEventListener(
    "click",
    function() {

        adminModal.classList.add("hidden");

    }
);


/* CLICAR FORA */

adminModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === adminModal
        ) {

            adminModal.classList.add(
                "hidden"
            );

        }

    }
);


/* =====================================================
   EXPORTAR USUÁRIOS
===================================================== */

exportUsers.addEventListener(
    "click",
    exportUserData
);


function exportUserData() {

    const users =
        getUsers();


    if (users.length === 0) {

        showToast(
            "Nenhum usuário cadastrado.",
            "error"
        );

        return;
    }


    let csv =
        "Nome,Telefone,Email\n";


    users.forEach(user => {

        csv +=
            `"${user.nome}","${user.telefone}","${user.email}"\n`;

    });


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "usuarios_pontoplay.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);


    showToast(
        "Usuários exportados com sucesso!"
    );

}


/* =====================================================
   TECLADO
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        /*
            Espaço também pode girar a máquina.
        */

        if (
            event.code === "Space" &&
            !gameScreen.classList.contains("hidden")
        ) {

            event.preventDefault();

            spin();

        }

    }
);


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

updateCredits();