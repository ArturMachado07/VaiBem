/**
 * Camada de serviços (Fase 15 — preparação para backend).
 *
 * Cada função aqui representa a chamada que, no futuro, irá substituir o
 * mock por uma chamada real de API (fetch/axios). Por agora resolvem
 * localmente a partir de js/data/routes.js e js/storage.js, mas o resto do
 * código já chama sempre através de VaiBemAPI — quando existir backend,
 * só este ficheiro precisa de mudar.
 *
 * Nada aqui finge autenticação real: login() e registerCompany() deixam
 * explícito que ainda não há backend, em vez de simular sucesso.
 */
(function (global) {
    "use strict";

    function delay(value, ms) {
        return new Promise(resolve => setTimeout(() => resolve(value), ms));
    }

    const VaiBemAPI = {
        // TODO: substituir por fetch("/api/routes")
        getRoutes() {
            return delay(global.VaiBemData.routes, 150);
        },

        // TODO: substituir por fetch(`/api/routes/${routeId}/schedules`)
        getSchedules(routeId) {
            return delay(global.VaiBemData.schedules, 150);
        },

        // TODO: substituir por fetch("/api/bookings", { method: "POST", body: JSON.stringify(payload) })
        createBooking(payload) {
            const booking = Object.assign({}, payload, {
                id: `local-${Date.now()}`,
                status: "pending_confirmation",
                createdAt: new Date().toISOString()
            });
            return delay(booking, 150);
        },

        // TODO: substituir por fetch("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) })
        // Ainda não existe backend de autenticação — resolve sempre como
        // "não implementado" para que a UI mostre isso claramente ao
        // utilizador em vez de simular um login com sucesso.
        login(credentials) {
            return Promise.reject({
                code: "NOT_IMPLEMENTED",
                message: "O login ainda não está disponível — a integração com o servidor está em preparação."
            });
        },

        // TODO: substituir por fetch("/api/companies", { method: "POST", body: JSON.stringify(payload) })
        // Sem backend disponível ainda: usamos um "mailto" como integração
        // provisória para que o pedido chegue mesmo assim a alguém, em vez
        // de o formulário simplesmente recarregar a página sem fazer nada.
        registerCompany(payload) {
            const subject = encodeURIComponent(`Pedido de orçamento — Vai Bem Empresas (${payload.empresa || "empresa"})`);
            const body = encodeURIComponent(
                `Empresa: ${payload.empresa}\n` +
                `Nome: ${payload.nome}\n` +
                `Email: ${payload.email}\n` +
                `Nº de colaboradores: ${payload.colaboradores || "não indicado"}\n`
            );
            const mailtoUrl = `mailto:empresas@vaibem.co.ao?subject=${subject}&body=${body}`;
            return delay({ mailtoUrl }, 150);
        }
    };

    global.VaiBemAPI = VaiBemAPI;
})(window);
