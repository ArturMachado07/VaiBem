/* ===================================================================
   LOGIN COM GOOGLE (Google Identity Services)
   Autenticação real do Google feita inteiramente no browser: o VaiBem
   ainda não tem backend/base de dados, por isso não criamos uma conta
   num servidor. Em vez disso, validamos a identidade real da pessoa
   através do Google e guardamos o essencial (nome, email, foto) no
   localStorage do próprio dispositivo, para personalizar o site.
=================================================================== */
(function () {

    const GOOGLE_CLIENT_ID = "879022731866-t16a93kle7sets0491dj6d6rjn6uo57i.apps.googleusercontent.com";
    const USER_KEY = "vaibem:user";

    /**
     * Depois de entrar, volta para a página que pediu o login (ex.:
     * confirmacao.html?redirect=confirmacao.html ao tentar pagar sem
     * sessão), em vez de mandar sempre para index.html. Só aceita nomes de
     * página internos e simples (sem protocolo, domínio ou "//"), para não
     * abrir a porta a um redirecionamento para fora do site.
     */
    function getRedirectTarget() {
        try {
            const target = new URLSearchParams(window.location.search).get("redirect");
            if (target && /^[a-zA-Z0-9_-]+\.html$/.test(target)) return target;
        } catch (e) {
            // Ignora e usa o destino por omissão.
        }
        // Sem "redirect" explícito na URL (ex.: chegou aqui a pagar em
        // confirmacao.html), o destino segue o separador Particular/Empresa
        // escolhido no ecrã de login — ver initLoginModeToggle().
        if (document.body.dataset.loginMode === "empresa") return "empresas-funcionarios.html";
        return "index.html";
    }

    /**
     * Separador "Particular"/"Empresa" no topo dos painéis de login. Não
     * existe uma conta "empresa" real no servidor — continua a ser o mesmo
     * login Google — só muda para onde a pessoa é enviada depois de entrar
     * (ver getRedirectTarget acima).
     */
    function initLoginModeToggle() {
        const toggles = document.querySelectorAll(".login-mode-toggle");
        if (!toggles.length) return;

        toggles.forEach(toggle => {
            toggle.addEventListener("click", event => {
                const button = event.target.closest("[data-login-mode]");
                if (!button) return;

                document.querySelectorAll(".login-mode-toggle [data-login-mode]").forEach(btn => {
                    btn.classList.remove("is-active");
                    btn.setAttribute("aria-selected", "false");
                });

                document.querySelectorAll(`.login-mode-toggle [data-login-mode="${button.dataset.loginMode}"]`).forEach(btn => {
                    btn.classList.add("is-active");
                    btn.setAttribute("aria-selected", "true");
                });

                document.body.dataset.loginMode = button.dataset.loginMode;
            });
        });
    }

    function decodeJwt(token) {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const json = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    }

    function handleCredentialResponse(response) {
        const payload = decodeJwt(response.credential);

        if (!payload || !payload.email) {
            if (window.VaiBemForms) {
                window.VaiBemForms.showFormStatus(
                    "loginStatus",
                    "Não foi possível validar a sessão do Google. Tenta novamente.",
                    "error"
                );
            }
            return;
        }

        const user = {
            id: payload.sub,
            name: payload.name || payload.email,
            email: payload.email,
            picture: payload.picture || "",
            provider: "google",
            signedInAt: new Date().toISOString()
        };

        try {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {
            // localStorage indisponível (ex.: modo privado) — segue em frente sem persistir.
        }

        window.location.href = getRedirectTarget();
    }

    function init() {
        if (!window.google || !window.google.accounts || !window.google.accounts.id) return;

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false
        });

        // Pode existir mais do que um botão na página (ex.: painel de
        // Entrar e painel de Criar conta no login.html deslizante).
        ["googleSignInBtn", "googleSignInBtnSignup"].forEach(id => {
            const container = document.getElementById(id);
            if (!container) return;
            google.accounts.id.renderButton(container, {
                type: "standard",
                theme: "outline",
                size: "large",
                shape: "pill",
                text: "continue_with",
                logo_alignment: "left",
                width: 320
            });
        });
    }

    if (document.readyState === "complete") {
        init();
    } else {
        window.addEventListener("load", init);
    }

    initLoginModeToggle();
})();
