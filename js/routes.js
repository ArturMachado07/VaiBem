const routes = [

{
id:1,
route:"Talatona → Maianga",
via:"Via Marginal",
duration:"45 min",
stops:"7 paragens",
price:"800 Kz",
popular:true
},

{
id:2,
route:"Viana → Mutamba",
via:"Via Samba",
duration:"60 min",
stops:"9 paragens",
price:"900 Kz",
popular:false
},

{
id:3,
route:"Kilamba → Luanda",
via:"Via Hoji-Ya-Henda",
duration:"50 min",
stops:"8 paragens",
price:"800 Kz",
popular:true
},

{
id:4,
route:"Zango 4 → Kinaxixi",
via:"Via Samba",
duration:"55 min",
stops:"10 paragens",
price:"900 Kz",
popular:false
},

{
id:5,
route:"Camama → Cidade",
via:"Via Kilamba",
duration:"48 min",
stops:"8 paragens",
price:"850 Kz",
popular:true
},

{
id:6,
route:"Benfica → Kinaxixi",
via:"Via Mutamba",
duration:"52 min",
stops:"9 paragens",
price:"850 Kz",
popular:false
}

];

const grid =
document.getElementById("routeGrid");

function formatRoute(route){

const [origin, destination] = route.split(" → ");

return `${origin} <img class="route-arrow" src="assets/icons/arrow-right-long.svg" alt="para"> ${destination}`;

}

function renderRoutes(data){

grid.innerHTML = "";

if (!data.length) {
    grid.innerHTML = '<p class="routes-empty">Não encontrámos rotas com estes critérios.</p>';
    return;
}

data.forEach(route => {

grid.innerHTML += `

<div class="route-card"
onclick="openRoute(${route.id})">

    <div class="route-icon">
        <img src="assets/icons/autocarro.svg" alt="Autocarro">
    </div>

    <div class="route-info">
        <h3>${formatRoute(route.route)}</h3>
        <span>${route.via}</span>

        <div class="route-meta">
            <small><img src="assets/icons/tempo.svg" alt=""> ${route.duration}</small> •
            <small><img src="assets/icons/paragem.svg" alt=""> ${route.stops}</small>
        </div>
    </div>

    <div class="route-price">
        <small>A partir de</small>
        <strong>${route.price}</strong>
    </div>

</div>

`;

});

}

renderRoutes(routes);

const filters = document.querySelectorAll(".filter");
const searchRoute = document.getElementById("searchRoute");
let activeFilter = "all";

function priceValue(route) {
    return Number(route.price.replace(/\D/g, ""));
}

function durationValue(route) {
    return Number(route.duration.replace(/\D/g, ""));
}

function updateRoutes() {
    const term = searchRoute.value.trim().toLowerCase();
    let data = routes.filter(route =>
        `${route.route} ${route.via}`.toLowerCase().includes(term)
    );

    if (activeFilter === "popular") {
        data = data.filter(route => route.popular);
    }

    if (activeFilter === "cheap") {
        const lowestPrice = Math.min(...routes.map(priceValue));
        data = data.filter(route => priceValue(route) === lowestPrice);
    }

    if (activeFilter === "fast") {
        data = data.filter(route => durationValue(route) <= 48);
    }

    renderRoutes(data);
}

filters.forEach(filter => {
    filter.addEventListener("click", () => {
        activeFilter = filter.dataset.filter;
        filters.forEach(item => item.classList.toggle("active", item === filter));
        updateRoutes();
    });
});

function openRoute(id){

localStorage.setItem(
"selectedRoute",
id
);

window.location =
"horarios.html";

}

searchRoute.addEventListener("input", updateRoutes);
