/**
 * Página de confirmação — lê a reserva estruturada guardada por
 * horarios.js através de VaiBemStorage, em vez das antigas chaves soltas
 * "route" / "date" / "time".
 */
(function () {
    "use strict";

    const booking = window.VaiBemStorage.getBooking();
    const route = booking.route || window.VaiBemData.getRouteById(1);
    const date = booking.date || "";
    const time = booking.schedule ? booking.schedule.time : "";
    const price = booking.schedule ? booking.schedule.price : (route ? route.price : null);

    const confirmationModal = document.querySelector(".confirmation-modal");

    document.getElementById("routeOrigin").textContent = route.origin;
    document.getElementById("routeDestination").textContent = route.destination;
    document.getElementById("routeVia").textContent = route.via;
    document.getElementById("date").textContent = date;
    document.getElementById("time").textContent = time;

    document.documentElement.classList.add("confirmation-open");
    document.body.classList.add("confirmation-open");

    function preventBackgroundScroll(event) {
        if (!confirmationModal.contains(event.target)) event.preventDefault();
    }

    document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
    document.addEventListener("wheel", preventBackgroundScroll, { passive: false });

    function closeConfirmation() {
        // Regista a viagem no histórico do perfil antes de limpar a reserva
        // em curso, para a área "A minha conta" poder mostrar viagens
        // passadas mesmo sem existir ainda uma conta em servidor.
        window.VaiBemStorage.addToHistory({
            route: route,
            date: date,
            time: time,
            seat: booking.booking && booking.booking.seat ? booking.booking.seat : "12A",
            price: price
        });

        // A reserva deste protótipo termina aqui — limpa o estado para que
        // a próxima visita comece uma reserva nova em vez de reaproveitar
        // dados antigos.
        window.VaiBemStorage.clearBooking();
        window.location.href = "index.html";
    }

    document.getElementById("closeConfirmation").addEventListener("click", closeConfirmation);
    document.getElementById("doneConfirmation").addEventListener("click", closeConfirmation);

    /* ===================================================================
       PAGAMENTO — Referência Multicaixa ou Cartão Multiviagem
       Sem processador de pagamentos real: a referência Multicaixa é uma
       simulação (js/multicaixa.js, partilhada com perfil.html) disponível
       para qualquer pessoa, com ou sem sessão — como uma referência real,
       que pode ser paga por qualquer pessoa com o código. Pagar com o
       Cartão Multiviagem exige sessão, porque o saldo simulado só existe
       depois de a pessoa entrar (VaiBemStorage.getCardBalance).
    =================================================================== */
    function formatKz(value) {
        return `${Number(value).toLocaleString("pt-PT")} Kz`;
    }

    function getUser() {
        try {
            const raw = localStorage.getItem("vaibem:user");
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    const payMcx = document.getElementById("payMulticaixa");
    const payMcxStatus = document.getElementById("payMulticaixaStatus");
    const payCard = document.getElementById("payCard");
    const payCardStatus = document.getElementById("payCardStatus");

    let paidVia = null;

    function markPaid(button, statusEl, text) {
        paidVia = button;
        button.classList.add("is-paid");
        statusEl.textContent = text;
        [payMcx, payCard].forEach(btn => {
            if (btn && btn !== button) btn.classList.add("is-locked");
        });
    }

    if (payMcx && payMcxStatus && typeof price === "number" && window.VaiBemMulticaixa) {
        payMcx.addEventListener("click", () => {
            if (paidVia) return;
            window.VaiBemMulticaixa.open({
                title: "Pagar viagem por referência Multicaixa",
                note: `${route.origin} → ${route.destination} · ${formatKz(price)}`,
                amount: price,
                onConfirm: () => {
                    markPaid(payMcx, payMcxStatus, "Pago por referência Multicaixa");
                }
            });
        });
    }

    if (payCard && payCardStatus && typeof price === "number") {
        const user = getUser();
        const discountedPrice = Math.round(price * 0.85);

        if (!user) {
            payCardStatus.textContent = "Inicia sessão para pagares com o teu cartão";
        } else if (window.VaiBemStorage) {
            payCardStatus.textContent = `Saldo disponível: ${formatKz(window.VaiBemStorage.getCardBalance())}`;
        }

        payCard.addEventListener("click", () => {
            if (paidVia) return;

            if (!user) {
                window.location.href = "login.html";
                return;
            }

            const balance = window.VaiBemStorage.getCardBalance();
            if (balance < discountedPrice) {
                payCardStatus.textContent = `Saldo insuficiente (tens ${formatKz(balance)}) — a levar-te para carregares saldo…`;
                setTimeout(() => { window.location.href = "perfil.html"; }, 1200);
                return;
            }

            window.VaiBemStorage.addCardBalance(-discountedPrice);
            markPaid(payCard, payCardStatus, `Pago com o Cartão Multiviagem — poupaste ${formatKz(price - discountedPrice)} (15%)`);
        });
    }
})();
