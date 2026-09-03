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
            price: booking.schedule ? booking.schedule.price : (route ? route.price : null)
        });

        // A reserva deste protótipo termina aqui — limpa o estado para que
        // a próxima visita comece uma reserva nova em vez de reaproveitar
        // dados antigos.
        window.VaiBemStorage.clearBooking();
        window.location.href = "index.html";
    }

    document.getElementById("closeConfirmation").addEventListener("click", closeConfirmation);
    document.getElementById("doneConfirmation").addEventListener("click", closeConfirmation);
})();
