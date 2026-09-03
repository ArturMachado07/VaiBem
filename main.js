const header = document.getElementById("header");
const logo = document.getElementById("logo");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

if(header && logo){
    window.addEventListener("scroll", () => {

        if(window.scrollY > 80){

            header.classList.add("sticky");

            logo.src = "assets/logo-white.svg";

        }else{

            header.classList.remove("sticky");

            logo.src = "assets/logo.svg";

        }

    });
}

if(menuToggle && primaryNav){
    menuToggle.addEventListener("click", () => {
        const isOpen = primaryNav.classList.toggle("open");
        menuToggle.classList.toggle("active", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });

    primaryNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            primaryNav.classList.remove("open");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menu");
        });
    });
}

document.querySelectorAll(".route-card[data-route-id]").forEach(card => {
    card.addEventListener("click", () => {
        const id = card.dataset.routeId;
        if (window.VaiBemStorage) {
            const route = window.VaiBemData ? window.VaiBemData.getRouteById(id) : null;
            window.VaiBemStorage.updateBooking({ route: route || { id: Number(id) } });
        } else {
            // Compatibilidade: guarda o id sozinho se storage.js não estiver carregado nesta página.
            localStorage.setItem("selectedRoute", id);
        }
    });
});

/* FAQ INTERATIVO */
document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        if (!item) return;
        const isActive = item.classList.contains("active");
        item.classList.toggle("active", !isActive);
    });
});

/* ===================================================================
   MODAL "EM BREVE" (Fase 8 e Fase 18)
   Qualquer elemento com data-coming-soon="Título::Mensagem" abre este
   modal em vez de apontar para um link falso ou não fazer nada.
   Usado por: botões "Baixar App", Google Play / App Store, QR code de
   download e ícones de redes sociais enquanto não existirem destinos reais.
=================================================================== */
(function initComingSoonModal() {

    const triggers = document.querySelectorAll("[data-coming-soon]");
    if (!triggers.length) return;

    const overlay = document.createElement("div");
    overlay.className = "cs-modal-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <div class="cs-modal" role="dialog" aria-modal="true" aria-labelledby="csModalTitle">
            <button type="button" class="cs-modal-close" aria-label="Fechar">&times;</button>
            <div class="cs-modal-icon" aria-hidden="true">!</div>
            <h2 id="csModalTitle">Em breve</h2>
            <p id="csModalMessage">Esta funcionalidade ainda não está disponível.</p>
            <div class="cs-modal-actions">
                <button type="button" class="cs-modal-ok">Entendi</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const titleEl = overlay.querySelector("#csModalTitle");
    const messageEl = overlay.querySelector("#csModalMessage");
    let lastFocused = null;

    function openModal(title, message) {
        titleEl.textContent = title || "Em breve";
        messageEl.textContent = message || "Esta funcionalidade ainda não está disponível.";
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        lastFocused = document.activeElement;
        overlay.querySelector(".cs-modal-close").focus();
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    triggers.forEach(trigger => {
        trigger.addEventListener("click", event => {
            event.preventDefault();
            const [title, message] = trigger.dataset.comingSoon.split("::");
            openModal(title, message);
        });
    });

    overlay.querySelector(".cs-modal-close").addEventListener("click", closeModal);
    overlay.querySelector(".cs-modal-ok").addEventListener("click", closeModal);
    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeModal();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
    });
})();

/* ===================================================================
   SESSÃO DO UTILIZADOR (Login com Google)
   Em todas as páginas: se existir uma sessão Google guardada em
   localStorage (criada em login.html via js/google-auth.js), troca o
   botão "Entrar" do cabeçalho por um chip com o nome/foto da pessoa e
   uma opção de sair. Não há conta em servidor — é só a sessão local
   do próprio dispositivo.
=================================================================== */
(function initAuthUI() {

    const USER_KEY = "vaibem:user";
    const loginBtn = document.getElementById("navLoginBtn");
    if (!loginBtn) return;

    function getUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function signOut() {
        try { localStorage.removeItem(USER_KEY); } catch (e) {}
        if (window.google && window.google.accounts && window.google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
        window.location.href = "index.html";
    }

    const user = getUser();
    if (!user) return;

    const firstName = (user.name || user.email || "Conta").trim().split(" ")[0];
    const initial = firstName.charAt(0).toUpperCase();

    const wrapper = document.createElement("div");
    wrapper.className = "user-chip";
    wrapper.innerHTML = `
        <button type="button" class="user-chip-btn" aria-haspopup="true" aria-expanded="false">
            ${user.picture
                ? `<img src="${user.picture}" alt="" class="user-chip-avatar" referrerpolicy="no-referrer">`
                : `<span class="user-chip-avatar user-chip-avatar-fallback">${initial}</span>`}
            <span class="user-chip-name">${firstName}</span>
        </button>
        <div class="user-chip-menu" role="menu">
            <span class="user-chip-email">${user.email || ""}</span>
            <a href="perfil.html" class="user-chip-account" role="menuitem">A minha conta</a>
            <button type="button" class="user-chip-logout" role="menuitem">Sair</button>
        </div>
    `;

    loginBtn.replaceWith(wrapper);

    const toggleBtn = wrapper.querySelector(".user-chip-btn");
    toggleBtn.addEventListener("click", () => {
        const isOpen = wrapper.classList.toggle("is-open");
        toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", event => {
        if (!wrapper.contains(event.target)) {
            wrapper.classList.remove("is-open");
            toggleBtn.setAttribute("aria-expanded", "false");
        }
    });

    wrapper.querySelector(".user-chip-logout").addEventListener("click", signOut);
})();
