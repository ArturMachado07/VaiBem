/**
 * Lógica da página de login (Fase 7).
 *
 * Não existe backend de autenticação ainda, por isso este script:
 *  - valida email e palavra-passe no cliente;
 *  - dá feedback claro de erro/sucesso e um estado de loading no botão;
 *  - chama VaiBemAPI.login(), que está preparado para ligar a uma API real
 *    no futuro (ver js/api.js) mas hoje devolve sempre "não implementado" —
 *    para não fingir que o login funciona quando não funciona.
 */
(function () {
    "use strict";

    const form = document.getElementById("loginForm");
    if (!form) return;

    const { isValidEmail, isValidPassword, setFieldError, clearFieldError, setButtonLoading, showFormStatus } = window.VaiBemForms;

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const emailField = document.getElementById("loginEmailField");
    const passwordField = document.getElementById("loginPasswordField");
    const submitBtn = document.getElementById("loginSubmit");
    const statusEl = document.getElementById("loginStatus");

    document.getElementById("togglePassword")?.addEventListener("click", function () {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        this.setAttribute("aria-label", type === "password" ? "Mostrar palavra-passe" : "Ocultar palavra-passe");
    });

    function validate() {
        let valid = true;

        if (!isValidEmail(emailInput.value)) {
            setFieldError(emailField, "Introduz um email válido.");
            valid = false;
        } else {
            clearFieldError(emailField);
        }

        if (!isValidPassword(passwordInput.value, 6)) {
            setFieldError(passwordField, "A palavra-passe deve ter pelo menos 6 caracteres.");
            valid = false;
        } else {
            clearFieldError(passwordField);
        }

        return valid;
    }

    [emailInput, passwordInput].forEach(input => {
        input.addEventListener("blur", validate);
        input.addEventListener("input", () => {
            if (input.closest(".login-field").classList.contains("is-invalid")) validate();
        });
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!validate()) {
            showFormStatus(statusEl, "error", "Corrige os campos assinalados antes de continuares.");
            return;
        }

        setButtonLoading(submitBtn, true);

        window.VaiBemAPI.login({ email: emailInput.value.trim(), password: passwordInput.value })
            .then(() => {
                // Este ramo só será alcançado quando existir backend real.
                showFormStatus(statusEl, "success", "Sessão iniciada. A redirecionar...");
            })
            .catch(error => {
                showFormStatus(
                    statusEl,
                    "error",
                    (error && error.message) || "Não foi possível iniciar sessão. Tenta novamente mais tarde."
                );
            })
            .finally(() => {
                setButtonLoading(submitBtn, false);
            });
    });
})();
