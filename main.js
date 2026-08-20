const header = document.getElementById("header");
const logo = document.getElementById("logo");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

window.addEventListener("scroll", () => {

    if(window.scrollY > 80){

        header.classList.add("sticky");

        logo.src = "assets/logo-white.svg";

    }else{

        header.classList.remove("sticky");

        logo.src = "assets/logo.svg";

    }

});

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
document.querySelectorAll(".faq-question, .como-faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item, .como-faq-item");
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
