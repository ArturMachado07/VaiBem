/**
 * Página do Cartão Multiviagem (cartao-multiviagem.html).
 *
 * Popula o select de rotas a partir da fonte única de dados
 * (js/data/routes.js) e valida/submete o formulário de adesão.
 *
 * Sem backend de emissão de cartões ainda: o pedido é enviado por mailto
 * (VaiBemAPI.requestMultiCard, ver js/api.js), não finge que o cartão foi
 * emitido na hora.
 */
(function () {
    "use strict";

    /* ---------- Cartão 3D animado (hero) ---------- */

    (function initCard3D() {
        const card = document.getElementById("mcCard");
        const viewport = document.getElementById("mcCardViewport");
        if (!card || !viewport) return;

        let isFlipped = false;
        let isAnimating = false;

        function setFlipped(flipped) {
            if (isAnimating || flipped === isFlipped) return;
            isFlipped = flipped;
            isAnimating = true;

            card.classList.toggle("is-flipped", isFlipped);
            viewport.classList.add("is-animating");
            card.setAttribute("aria-pressed", String(isFlipped));
            card.setAttribute(
                "aria-label",
                isFlipped
                    ? "Cartão Multiviagem virado. Mostra o verso. Clique para voltar à frente."
                    : "Cartão Multiviagem. Clique para virar e ver o verso."
            );
        }

        function toggle() {
            setFlipped(!isFlipped);
        }

        card.addEventListener("click", toggle);

        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
                event.preventDefault();
                toggle();
            }
        });

        card.addEventListener("transitionend", event => {
            if (event.propertyName === "transform") {
                isAnimating = false;
                viewport.classList.remove("is-animating");
            }
        });

        // Vira sozinho em loop (frente/verso/frente/...) pouco depois de
        // carregar a página; o clique/Enter continuam disponíveis para virar
        // manualmente a qualquer momento, sem parar o loop. Respeita
        // "reduzir animação" do sistema, não iniciando o loop automático.
        window.addEventListener("load", () => {
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (prefersReducedMotion) return;

            setTimeout(() => {
                setFlipped(true);
                setInterval(toggle, 3000);
            }, 900);
        });
    })();

    /* ---------- Popular rotas no select ---------- */

    const rotaSelect = document.getElementById("mcRota");
    if (rotaSelect && window.VaiBemData) {
        window.VaiBemData.routes.forEach(route => {
            const option = document.createElement("option");
            option.value = window.VaiBemData.formatRouteLabel(route);
            option.textContent = window.VaiBemData.formatRouteLabel(route);
            rotaSelect.appendChild(option);
        });
    }

    /* ---------- Atalhos "Pedir com este saldo" (secção de pacotes) ---------- */

    document.querySelectorAll(".btn-mc-package[data-saldo]").forEach(btn => {
        btn.addEventListener("click", () => {
            const saldoSelect = document.getElementById("mcSaldo");
            if (saldoSelect) saldoSelect.value = btn.dataset.saldo;
        });
    });

    /* ---------- Formulário de adesão ---------- */

    const form = document.getElementById("mcForm");
    if (!form || !window.VaiBemForms) return;

    const { isValidEmail, setFieldError, clearFieldError, setButtonLoading, showFormStatus } = window.VaiBemForms;

    const nomeInput = document.getElementById("mcNome");
    const emailInput = document.getElementById("mcEmail");
    const telefoneInput = document.getElementById("mcTelefone");
    const saldoSelect = document.getElementById("mcSaldo");

    const nomeField = document.getElementById("mcNomeField");
    const emailField = document.getElementById("mcEmailField");
    const telefoneField = document.getElementById("mcTelefoneField");

    const submitBtn = document.getElementById("mcSubmit");
    const statusEl = document.getElementById("mcStatus");

    function isValidPhone(value) {
        // Aceita números angolanos com ou sem +244, espaços ou hífens.
        return /^(\+244)?[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{3}$/.test(String(value).trim());
    }

    function validate() {
        let valid = true;

        if (!nomeInput.value.trim()) {
            setFieldError(nomeField, "Indica o teu nome completo.");
            valid = false;
        } else {
            clearFieldError(nomeField);
        }

        if (!isValidEmail(emailInput.value)) {
            setFieldError(emailField, "Introduz um email válido.");
            valid = false;
        } else {
            clearFieldError(emailField);
        }

        if (!isValidPhone(telefoneInput.value)) {
            setFieldError(telefoneField, "Introduz um número de telemóvel angolano válido (ex.: 9XX XXX XXX).");
            valid = false;
        } else {
            clearFieldError(telefoneField);
        }

        return valid;
    }

    [nomeInput, emailInput, telefoneInput].forEach(input => {
        input.addEventListener("blur", validate);
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!validate()) {
            showFormStatus(statusEl, "error", "Corrige os campos assinalados antes de continuares.");
            return;
        }

        setButtonLoading(submitBtn, true);

        window.VaiBemAPI.requestMultiCard({
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            telefone: telefoneInput.value.trim(),
            rota: rotaSelect ? rotaSelect.value : "",
            saldo: saldoSelect ? saldoSelect.value : ""
        }).then(result => {
            showFormStatus(statusEl, "success", "Obrigado! Vamos abrir o teu email para enviares o pedido — a nossa equipa responde em até 24 horas úteis.");
            window.location.href = result.mailtoUrl;
            form.reset();
        }).finally(() => {
            setButtonLoading(submitBtn, false);
        });
    });
})();
