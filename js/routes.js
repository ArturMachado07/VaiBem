/**
 * Página Rotas Fixas — lista, pesquisa e filtros.
 * Os dados vêm agora de VaiBemAPI.getRoutes() (js/api.js), que por sua vez
 * lê js/data/routes.js — a mesma fonte usada em horários e confirmação.
 */
(function () {
    "use strict";

    const grid = document.getElementById("routeGrid");
    const filters = document.querySelectorAll(".filter");
    const searchRoute = document.getElementById("searchRoute");
    let activeFilter = "all";
    let allRoutes = [];

    function formatRouteLabel(route) {
        return `${route.origin} <img class="route-arrow" src="assets/icons/arrow-right-long.svg" alt="para"> ${route.destination}`;
    }

    function renderRoutes(data) {
        grid.innerHTML = "";

        if (!data.length) {
            grid.innerHTML = '<p class="routes-empty">Não encontrámos rotas com estes critérios.</p>';
            return;
        }

        data.forEach(route => {
            grid.innerHTML += `
                <a href="horarios.html" class="route-card" data-route-id="${route.id}" aria-label="Ver horários ${route.origin} para ${route.destination}">
                    <div class="route-icon">
                        <img src="assets/icons/autocarro.svg" alt="Autocarro">
                    </div>
                    <div class="route-info">
                        <h3>${formatRouteLabel(route)}</h3>
                        <span>${route.via}</span>
                        <div class="route-meta">
                            <small><img src="assets/icons/tempo.svg" alt=""> ${route.durationMinutes} min</small> •
                            <small><img src="assets/icons/paragem.svg" alt=""> ${route.stops} paragens</small>
                        </div>
                    </div>
                    <div class="route-price">
                        <small>A partir de</small>
                        <strong>${window.VaiBemData.formatPrice(route.price)}</strong>
                    </div>
                </a>
            `;
        });

        // Grava a rota escolhida antes de navegar (a navegação do <a> segue
        // normalmente logo a seguir, sem preventDefault — assim continua a
        // funcionar com clique do meio, "abrir em novo separador", etc.).
        grid.querySelectorAll(".route-card[data-route-id]").forEach(card => {
            card.addEventListener("click", () => {
                const route = window.VaiBemData.getRouteById(card.dataset.routeId);
                window.VaiBemStorage.updateBooking({ route, schedule: null });
            });
        });
    }

    function priceValue(route) {
        return route.price;
    }

    function durationValue(route) {
        return route.durationMinutes;
    }

    function updateRoutes() {
        const term = (searchRoute.value || "").trim().toLowerCase();
        let data = allRoutes.filter(route =>
            `${route.origin} ${route.destination} ${route.via}`.toLowerCase().includes(term)
        );

        if (activeFilter === "popular") {
            data = data.filter(route => route.popular);
        }

        if (activeFilter === "cheap") {
            const lowestPrice = Math.min(...allRoutes.map(priceValue));
            data = data.filter(route => priceValue(route) === lowestPrice);
        }

        if (activeFilter === "fast") {
            data = data.filter(route => durationValue(route) <= 48);
        }

        renderRoutes(data);
    }

    filters.forEach(filter => {
        filter.addEventListener("click", () => {
            activeFilter = filter.dataset.filter;
            filters.forEach(item => item.classList.toggle("active", item === filter));
            updateRoutes();
        });
    });

    searchRoute.addEventListener("input", updateRoutes);

    window.VaiBemAPI.getRoutes().then(routes => {
        allRoutes = routes;
        renderRoutes(allRoutes);
    });
})();
