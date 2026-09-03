/**
 * Painel deslizante Entrar / Criar conta (login.html) e validação do
 * formulário de registo.
 *
 * O registo por email ainda não tem backend, por isso segue o mesmo
 * princípio honesto do login.js: valida no cliente, mostra loading, e
 * comunica claramente que a criação de conta ainda não está disponível
 * em vez de simular sucesso (ver VaiBemAPI.register em js/api.js).
 */
(function () {
    "use strict";

    const authContainer = document.getElementById("authContainer");
    if (!authContainer) return;

    /* ---------- Alternar entre painel de Entrar e Criar conta ---------- */

    function showSignUp() {
        authContainer.classList.add("right-panel-active");
    }

    function showSignIn() {
        authContainer.classList.remove("right-panel-active");
    }

    document.getElementById("switchToSignUp")?.addEventListener("click", showSignUp);
    document.getElementById("overlayToSignUp")?.addEventListener("click", showSignUp);
    document.getElementById("switchToSignIn")?.addEventListener("click", showSignIn);
    document.getElementById("overlayToSignIn")?.addEventListener("click", showSignIn);

    /* ---------- Mostrar/ocultar palavra-passe (painel de registo) ---------- */

    const signupPasswordInput = document.getElementById("signupPassword");
    document.getElementById("togglePasswordSignup")?.addEventListener("click", function () {
        if (!signupPasswordInput) return;
        const type = signupPasswordInput.getAttribute("type") === "password" ? "text" : "password";
        signupPasswordInput.setAttribute("type", type);
        this.setAttribute("aria-label", type === "password" ? "Mostrar palavra-passe" : "Ocultar palavra-passe");
    });

    /* ---------- Formulário de registo ---------- */

    const form = document.getElementById("signupForm");
    if (!form || !window.VaiBemForms) return;

    const { isValidEmail, isValidPassword, setFieldError, clearFieldError, setButtonLoading, showFormStatus } = window.VaiBemForms;

    const nameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    const nameField = document.getElementById("signupNameField");
    const emailField = document.getElementById("signupEmailField");
    const passwordField = document.getElementById("signupPasswordField");
    const submitBtn = document.getElementById("signupSubmit");
    const statusEl = document.getElementById("signupStatus");

    function validate() {
        let valid = true;

        if (!nameInput.value.trim()) {
            setFieldError(nameField, "Introduz o teu nome.");
            valid = false;
        } else {
            clearFieldError(nameField);
        }

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

    [nameInput, emailInput, passwordInput].forEach(input => {
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

        window.VaiBemAPI.register({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value
        })
            .then(() => {
                // Este ramo só será alcançado quando existir backend real.
                showFormStatus(statusEl, "success", "Conta criada. A redirecionar...");
            })
            .catch(error => {
                showFormStatus(
                    statusEl,
                    "error",
                    (error && error.message) || "Não foi possível criar a conta. Tenta novamente mais tarde."
                );
            })
            .finally(() => {
                setButtonLoading(submitBtn, false);
            });
    });
})();
