/**
 * Camada de persistência da reserva (Fase 2 — preservar e melhorar o fluxo
 * Rotas -> Horários -> Confirmação).
 *
 * Antes: cada página escrevia/lia chaves soltas e desconectadas no
 * localStorage ("selectedRoute", "route", "date", "time"). Agora existe uma
 * única chave com um objeto estruturado, acedido só através destas funções.
 *
 * Estrutura guardada:
 * {
 *   route:      { id, origin, destination, via, durationMinutes, stops, price },
 *   date:       "20 AGO 2026",   // texto já formatado para apresentação
 *   schedule:   { time: "07:30", price: 800 },
 *   passengers: 1,
 *   booking:    { seat: "12A", createdAt: "<ISO date>" }
 * }
 *
 * Carregado em todas as páginas para que qualquer fluxo futuro (ex. widget
 * "última reserva", checkout, painel administrativo) tenha uma única fonte
 * de verdade no browser enquanto não existir sessão de servidor.
 */
(function (global) {
    "use strict";

    const STORAGE_KEY = "vaibem:booking";
    const LEGACY_KEYS = ["selectedRoute", "route", "date", "time"];

    function readRaw() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn("VaiBemStorage: não foi possível ler a reserva guardada.", error);
            return null;
        }
    }

    function writeRaw(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn("VaiBemStorage: não foi possível guardar a reserva.", error);
        }
    }

    /**
     * Migra as chaves antigas (se existirem e a nova estrutura ainda não
     * tiver sido criada) para não perder o progresso de utilizadores que
     * tinham uma reserva em curso antes desta atualização.
     */
    function migrateLegacyKeys() {
        if (readRaw()) return;

        const legacyRouteId = localStorage.getItem("selectedRoute");
        const legacyRouteLabel = localStorage.getItem("route");
        const legacyDate = localStorage.getItem("date");
        const legacyTime = localStorage.getItem("time");

        if (!legacyRouteId && !legacyRouteLabel && !legacyDate && !legacyTime) return;

        const route = global.VaiBemData
            ? (legacyRouteId ? global.VaiBemData.getRouteById(legacyRouteId) : null) ||
              (legacyRouteLabel ? global.VaiBemData.getRouteByLabel(legacyRouteLabel) : null)
            : null;

        writeRaw({
            route: route || null,
            date: legacyDate || "",
            schedule: legacyTime ? { time: legacyTime, price: route ? route.price : null } : null,
            passengers: 1,
            booking: null
        });

        LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
    }

    function getBooking() {
        migrateLegacyKeys();
        return readRaw() || {
            route: null,
            date: "",
            schedule: null,
            passengers: 1,
            booking: null
        };
    }

    function saveBooking(data) {
        writeRaw(Object.assign({
            route: null,
            date: "",
            schedule: null,
            passengers: 1,
            booking: null
        }, data));
    }

    /** Atualiza apenas os campos indicados, preservando o resto da reserva. */
    function updateBooking(partial) {
        const current = getBooking();
        const next = Object.assign({}, current, partial);
        writeRaw(next);
        return next;
    }

    function clearBooking() {
        localStorage.removeItem(STORAGE_KEY);
        LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
    }

    global.VaiBemStorage = {
        getBooking,
        saveBooking,
        updateBooking,
        clearBooking
    };
})(window);
