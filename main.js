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
        localStorage.setItem("selectedRoute", card.dataset.routeId);
    });
});