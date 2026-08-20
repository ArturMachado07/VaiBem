/**
 * Formulário de contacto da página Vai Bem Empresas (Fase 7 e Fase 16).
 *
 * Sem backend disponível, a integração provisória é abrir o cliente de
 * email do utilizador com o pedido já preenchido (mailto), implementada em
 * VaiBemAPI.registerCompany(). Isto é claramente temporário — ver o TODO em
 * js/api.js para o que deve substituir isto quando existir endpoint real.
 */
(function () {
    "use strict";

    const form = document.getElementById("empresasForm");
    if (!form) return;

    const { isValidEmail, setFieldError, clearFieldError, setButtonLoading, showFormStatus } = window.VaiBemForms;

    const empresaInput = document.getElementById("empresa");
    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const colaboradoresInput = document.getElementById("colaboradores");

    const empresaField = document.getElementById("empresaField");
    const nomeField = document.getElementById("nomeField");
    const emailField = document.getElementById("emailField");

    const submitBtn = document.getElementById("empresasSubmit");
    const statusEl = document.getElementById("empresasStatus");

    function validate() {
        let valid = true;

        if (!empresaInput.value.trim()) {
            setFieldError(empresaField, "Indica o nome da empresa.");
            valid = false;
        } else {
            clearFieldError(empresaField);
        }

        if (!nomeInput.value.trim()) {
            setFieldError(nomeField, "Indica o teu nome completo.");
            valid = false;
        } else {
            clearFieldError(nomeField);
        }

        if (!isValidEmail(emailInput.value)) {
            setFieldError(emailField, "Introduz um email corporativo válido.");
            valid = false;
        } else {
            clearFieldError(emailField);
        }

        return valid;
    }

    [empresaInput, nomeInput, emailInput].forEach(input => {
        input.addEventListener("blur", validate);
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!validate()) {
            showFormStatus(statusEl, "error", "Corrige os campos assinalados antes de continuares.");
            return;
        }

        setButtonLoading(submitBtn, true);

        window.VaiBemAPI.registerCompany({
            empresa: empresaInput.value.trim(),
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            colaboradores: colaboradoresInput.value
        }).then(result => {
            showFormStatus(statusEl, "success", "Obrigado! Vamos abrir o teu email para enviares o pedido — a nossa equipa responde em até 24 horas úteis.");
            window.location.href = result.mailtoUrl;
            form.reset();
        }).finally(() => {
            setButtonLoading(submitBtn, false);
        });
    });
})();
