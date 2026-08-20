/**
 * Fonte única de dados das rotas fixas (Fase 14 — dados mockados centralizados).
 *
 * Antes desta refatoração, os mesmos dados de rotas existiam duplicados em
 * js/routes.js, js/horarios.js e js/confirmacao.js, cada um com um subconjunto
 * diferente de campos. Isto é a única fonte de verdade usada por essas páginas.
 *
 * A homepage (index.html) mostra estas mesmas 6 rotas em HTML estático por
 * razões de SEO/first paint — os valores abaixo devem espelhar os cartões
 * de "Rotas fixas mais populares" no index.html.
 *
 * TODO: Substituir por dados vindos de uma API quando existir backend:
 *   fetch("/api/routes").then(res => res.json())
 */
(function (global) {
    "use strict";

    const VAIBEM_ROUTES = [
        { id: 1, origin: "Talatona", destination: "Maianga", via: "Via Marginal", durationMinutes: 45, stops: 7, price: 800, popular: true },
        { id: 2, origin: "Viana", destination: "Mutamba", via: "Via Samba", durationMinutes: 60, stops: 9, price: 900, popular: false },
        { id: 3, origin: "Kilamba", destination: "Luanda", via: "Via Hoji-Ya-Henda", durationMinutes: 50, stops: 8, price: 800, popular: true },
        { id: 4, origin: "Zango 4", destination: "Kinaxixi", via: "Via Samba", durationMinutes: 55, stops: 10, price: 900, popular: false },
        { id: 5, origin: "Camama", destination: "Cidade", via: "Via Kilamba", durationMinutes: 48, stops: 8, price: 850, popular: true },
        { id: 6, origin: "Benfica", destination: "Kinaxixi", via: "Via Mutamba", durationMinutes: 52, stops: 9, price: 850, popular: false }
    ];

    // Horários mock partilhados por todas as rotas (protótipo). Numa integração
    // real, cada rota teria os seus próprios horários vindos do backend.
    const VAIBEM_SCHEDULES = [
        { time: "05:30", seats: 10, price: 800 },
        { time: "06:00", seats: 8, price: 800 },
        { time: "06:25", seats: 7, price: 900 },
        { time: "06:45", seats: 6, price: 800 },
        { time: "07:30", seats: 3, price: 800 },
        { time: "17:00", seats: 9, price: 800 },
        { time: "17:45", seats: 0, price: 800 },
        { time: "18:00", seats: 0, price: 800 },
        { time: "18:30", seats: 0, price: 800 }
    ];

    function formatPrice(value) {
        return `${value} Kz`;
    }

    function formatRouteLabel(route) {
        return `${route.origin} → ${route.destination}`;
    }

    function getRouteById(id) {
        const numericId = Number(id);
        return VAIBEM_ROUTES.find(route => route.id === numericId) || null;
    }

    function getRouteByLabel(label) {
        return VAIBEM_ROUTES.find(route => formatRouteLabel(route) === label) || null;
    }

    global.VaiBemData = {
        routes: VAIBEM_ROUTES,
        schedules: VAIBEM_SCHEDULES,
        formatPrice,
        formatRouteLabel,
        getRouteById,
        getRouteByLabel
    };
})(window);
