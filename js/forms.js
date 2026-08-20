/**
 * Utilitários de validação e feedback de formulários (Fase 7).
 * Usado por login.html e empresas.html; escrito para ser reutilizável em
 * qualquer formulário futuro (registo, checkout, etc.).
 */
(function (global) {
    "use strict";

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
    }

    function isValidPassword(value, minLength) {
        return String(value).trim().length >= (minLength || 6);
    }

    /**
     * @param {HTMLElement} fieldWrapper elemento com a classe .form-group ou .login-field
     * @param {string} message
     */
    function setFieldError(fieldWrapper, message) {
        if (!fieldWrapper) return;
        fieldWrapper.classList.add("is-invalid");
        fieldWrapper.classList.remove("is-valid");

        let errorEl = fieldWrapper.querySelector(".field-error");
        if (!errorEl) {
            errorEl = document.createElement("span");
            errorEl.className = "field-error";
            fieldWrapper.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }

    function clearFieldError(fieldWrapper) {
        if (!fieldWrapper) return;
        fieldWrapper.classList.remove("is-invalid");
        fieldWrapper.classList.add("is-valid");
    }

    function setButtonLoading(button, isLoading) {
        if (!button) return;
        button.classList.toggle("is-loading", isLoading);
        button.disabled = isLoading;
    }

    /**
     * @param {HTMLElement} statusEl elemento com a classe .form-status
     * @param {"success"|"error"} type
     * @param {string} message
     */
    function showFormStatus(statusEl, type, message) {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.classList.remove("is-success", "is-error");
        statusEl.classList.add("is-visible", type === "success" ? "is-success" : "is-error");
        statusEl.setAttribute("role", type === "error" ? "alert" : "status");
    }

    function hideFormStatus(statusEl) {
        if (!statusEl) return;
        statusEl.classList.remove("is-visible", "is-success", "is-error");
    }

    global.VaiBemForms = {
        isValidEmail,
        isValidPassword,
        setFieldError,
        clearFieldError,
        setButtonLoading,
        showFormStatus,
        hideFormStatus
    };
})(window);
