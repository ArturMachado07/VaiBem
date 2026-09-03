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

        window.location.href = "index.html";
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
})();
