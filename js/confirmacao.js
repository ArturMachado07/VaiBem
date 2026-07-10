const route = localStorage.getItem("route") || "Talatona → Maianga";
const date = localStorage.getItem("date") || "20 MAI 2026";
const time = localStorage.getItem("time") || "07:30";
const confirmationModal = document.querySelector(".confirmation-modal");
const [origin = "Talatona", destination = "Maianga"] = route.split(" → ");
const routeVias = {
    "Talatona → Maianga": "Via Marginal",
    "Viana → Mutamba": "Via Samba",
    "Kilamba → Luanda": "Via Hoji-Ya-Henda",
    "Zango 4 → Kinaxixi": "Via Samba",
    "Camama → Cidade": "Via Kilamba",
    "Benfica → Kinaxixi": "Via Mutamba"
};

document.getElementById("routeOrigin").textContent = origin;
document.getElementById("routeDestination").textContent = destination;
document.getElementById("routeVia").textContent = routeVias[route] || "Via Marginal";
document.getElementById("date").textContent = date;
document.getElementById("time").textContent = time;

document.documentElement.classList.add("confirmation-open");
document.body.classList.add("confirmation-open");

function preventBackgroundScroll(event) {
    if (!confirmationModal.contains(event.target)) event.preventDefault();
}

document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
document.addEventListener("wheel", preventBackgroundScroll, { passive: false });

function closeConfirmation() {
    window.location.href = "index.html";
}

document.getElementById("closeConfirmation").addEventListener("click", closeConfirmation);
document.getElementById("doneConfirmation").addEventListener("click", closeConfirmation);
