/**
 * Área do cliente (perfil.html).
 *
 * Não existe conta em servidor: os dados apresentados vêm inteiramente do
 * que já está guardado localmente neste dispositivo — a sessão Google
 * (vaibem:user), a reserva em curso (VaiBemStorage.getBooking) e o
 * histórico de viagens confirmadas (VaiBemStorage.getHistory). Sempre que
 * não houver dado real para mostrar, a página assume um estado vazio
 * honesto em vez de inventar números.
 */
(function () {
    "use strict";

    const USER_KEY = "vaibem:user";

    function getUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    const user = getUser();

    // Sem sessão Google guardada, não há área de cliente para mostrar.
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

    function formatMonthYear(isoDate) {
        const d = isoDate ? new Date(isoDate) : null;
        if (!d || isNaN(d.getTime())) return "";
        return `${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
    }

    // Cabeçalho do perfil
    const firstName = (user.name || user.email || "Cliente").trim().split(" ")[0];
    const initial = firstName.charAt(0).toUpperCase();
    const avatarEl = document.getElementById("profileAvatar");
    if (user.picture) {
        avatarEl.innerHTML = `<img src="${user.picture}" alt="" referrerpolicy="no-referrer">`;
    } else {
        avatarEl.textContent = initial;
    }

    document.getElementById("profileName").textContent = `Olá, ${firstName}`;
    const since = formatMonthYear(user.signedInAt);
    document.getElementById("profileSince").textContent = since
        ? `Cliente desde ${since}`
        : (user.email || "");

    // Próxima viagem (reserva em curso, se existir)
    const booking = window.VaiBemStorage ? window.VaiBemStorage.getBooking() : null;
    const hasTrip = booking && booking.route && booking.schedule;

    if (hasTrip) {
        document.getElementById("nextTripEmpty").hidden = true;
        const content = document.getElementById("nextTripContent");
        content.hidden = false;
        document.getElementById("tripOrigin").textContent = booking.route.origin || "";
        document.getElementById("tripDestination").textContent = booking.route.destination || "";
        const dateTimeParts = [booking.date, booking.schedule.time].filter(Boolean).join(" · ");
        document.getElementById("tripDateTimeText").textContent = dateTimeParts;
        const seat = booking.booking && booking.booking.seat ? `Assento ${booking.booking.seat}` : "Assento por atribuir";
        document.getElementById("tripSeatText").textContent = seat;
    }

    // Histórico de viagens confirmadas
    const history = window.VaiBemStorage ? window.VaiBemStorage.getHistory() : [];

    if (history.length) {
        document.getElementById("historyEmpty").hidden = true;
        const list = document.getElementById("historyList");
        list.hidden = false;

        history.forEach(trip => {
            const li = document.createElement("li");
            li.className = "profile-history-item";

            const routeLabel = trip.route
                ? `${trip.route.origin} <img class="route-arrow" src="assets/icons/arrow-right-long.svg" alt="para"> ${trip.route.destination}`
                : "Viagem Vai Bem";
            const priceLabel = typeof trip.price === "number" ? `${trip.price.toLocaleString("pt-PT")} Kz` : "";

            li.innerHTML = `
                <span class="profile-history-route"><span class="profile-history-icon profile-card-icon-mask profile-card-icon-bus" aria-hidden="true"></span>${routeLabel}</span>
                <span class="profile-history-date">${trip.date || ""}</span>
                <span class="profile-history-price">${priceLabel}</span>
            `;
            list.appendChild(li);
        });
    }

    // Terminar sessão (mesma lógica do user-chip em main.js)
    document.getElementById("profileLogout").addEventListener("click", () => {
        try { localStorage.removeItem(USER_KEY); } catch (e) {}
        if (window.google && window.google.accounts && window.google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
        window.location.href = "index.html";
    });

    /* ===================================================================
       CARTÃO MULTIVIAGEM — saldo e simulação de referência Multicaixa
       Não há processador de pagamentos real ligado ao site. Para "Carregar
       saldo" ter algum efeito (em vez de só abrir um formulário de contacto
       como em cartao-multiviagem.html), simulamos uma referência Multicaixa
       — Entidade/Referência/Valor, o formato que qualquer app bancária ou
       ATM angolano usa — e, ao "confirmar", somamos o valor ao saldo
       guardado neste dispositivo (VaiBemStorage.getCardBalance). O modal
       deixa claro que é uma simulação, não um pagamento real.
    =================================================================== */
    function formatKz(value) {
        return `${Number(value).toLocaleString("pt-PT")} Kz`;
    }

    function renderBalance() {
        const balanceEl = document.getElementById("mcBalanceLabel");
        if (!balanceEl || !window.VaiBemStorage) return;
        balanceEl.textContent = `Saldo: ${formatKz(window.VaiBemStorage.getCardBalance())}`;
    }

    renderBalance();

    (function initMulticaixaSimulation() {
        const topUpBtn = document.getElementById("mcTopUpBtn");
        const overlay = document.getElementById("mcxOverlay");
        if (!topUpBtn || !overlay) return;

        const closeBtn = document.getElementById("mcxClose");
        const confirmBtn = document.getElementById("mcxConfirm");
        const amountButtons = overlay.querySelectorAll(".mcx-amount");
        const referenceEl = document.getElementById("mcxReference");
        const amountLabelEl = document.getElementById("mcxAmountLabel");

        let selectedAmount = 5000;

        function randomDigits(length) {
            let digits = "";
            for (let i = 0; i < length; i++) digits += Math.floor(Math.random() * 10);
            return digits;
        }

        function generateReference() {
            const raw = randomDigits(9);
            referenceEl.textContent = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6, 9)}`;
        }

        function selectAmount(amount) {
            selectedAmount = amount;
            amountLabelEl.textContent = formatKz(amount);
            amountButtons.forEach(btn => {
                btn.classList.toggle("is-selected", Number(btn.dataset.amount) === amount);
            });
            generateReference();
        }

        function openModal() {
            selectAmount(selectedAmount);
            overlay.classList.add("is-open");
            overlay.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }

        function closeModal() {
            overlay.classList.remove("is-open");
            overlay.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }

        topUpBtn.addEventListener("click", openModal);
        closeBtn.addEventListener("click", closeModal);
        overlay.addEventListener("click", event => {
            if (event.target === overlay) closeModal();
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
        });

        amountButtons.forEach(btn => {
            btn.addEventListener("click", () => selectAmount(Number(btn.dataset.amount)));
        });

        confirmBtn.addEventListener("click", () => {
            if (window.VaiBemStorage) window.VaiBemStorage.addCardBalance(selectedAmount);
            renderBalance();
            closeModal();
        });
    })();
})();
