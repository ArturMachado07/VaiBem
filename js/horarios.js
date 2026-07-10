const routes = {
    1: { route: "Talatona → Maianga", via: "Via Marginal", duration: "45 min", stops: "7 paragens" },
    2: { route: "Viana → Mutamba", via: "Via Samba", duration: "60 min", stops: "9 paragens" },
    3: { route: "Kilamba → Luanda", via: "Via Hoji-Ya-Henda", duration: "50 min", stops: "8 paragens" },
    4: { route: "Zango 4 → Kinaxixi", via: "Via Samba", duration: "55 min", stops: "10 paragens" },
    5: { route: "Camama → Cidade", via: "Via Kilamba", duration: "48 min", stops: "8 paragens" },
    6: { route: "Benfica → Kinaxixi", via: "Via Mutamba", duration: "52 min", stops: "9 paragens" }
};

const selectedRoute = localStorage.getItem("selectedRoute") || "1";
const route = routes[selectedRoute] || routes[1];
const [origin, destination] = route.route.split(" → ");

document.getElementById("routeStart").textContent = origin;
document.getElementById("routeEnd").textContent = destination;
document.getElementById("routeName").textContent = route.via;
document.getElementById("routeDuration").textContent = route.duration;
document.getElementById("routeStops").textContent = route.stops;
document.getElementById("summaryRoute").textContent = route.route;
document.getElementById("summaryVia").textContent = route.via;

const schedules = [
    { time: "05:30", seats: 10, price: "800 Kz" },
    { time: "06:00", seats: 8, price: "800 Kz" },
    { time: "06:25", seats: 7, price: "900 Kz" },
    { time: "06:45", seats: 6, price: "800 Kz" },
    { time: "07:30", seats: 3, price: "800 Kz" },
    { time: "17:00", seats: 9, price: "800 Kz" },
    { time: "17:45", seats: 0, price: "800 Kz" },
    { time: "18:00", seats: 0, price: "800 Kz" },
    { time: "18:30", seats: 0, price: "800 Kz" }
];

const grid = document.getElementById("scheduleGrid");

function schedulePeriod(time) {
    const hour = Number(time.split(":")[0]);
    return hour < 12
        ? { icon: "assets/icons/dia-icone.svg", label: "Manhã", alt: "Dia", type: "day" }
        : { icon: "assets/icons/noite-icone.svg", label: hour < 18 ? "Tarde" : "Noite", alt: "Noite", type: "night" };
}

function renderSchedules() {
    grid.innerHTML = schedules.map(schedule => {
        const period = schedulePeriod(schedule.time);
        const availability = schedule.seats ? `${schedule.seats} lugares disponíveis` : "Esgotado";

        return `
            <button class="schedule-card" type="button" data-time="${schedule.time}" data-price="${schedule.price}">
                <span class="schedule-period"><img class="schedule-period-${period.type}" src="${period.icon}" alt="${period.alt}"></span>
                <strong class="schedule-time">${schedule.time}</strong>
                <span class="schedule-select" aria-hidden="true"></span>
                <span class="schedule-period-name">${period.label}</span>
                <span class="schedule-info">${availability}</span>
                <strong class="schedule-price">${schedule.price}</strong>
            </button>`;
    }).join("");
}

renderSchedules();

document.getElementById("summaryTime").textContent = "--";
document.getElementById("summaryPrice").textContent = "--";

const cards = document.querySelectorAll(".schedule-card");
const reservationCard = document.querySelector(".reservation-card");
const reservationOverlay = document.getElementById("reservationOverlay");
const closeReservation = document.getElementById("closeReservation");
const mobileReservation = window.matchMedia("(max-width: 650px)");

function preventBackgroundScroll(event) {
    if (document.body.classList.contains("reservation-open") && !reservationCard.contains(event.target)) {
        event.preventDefault();
    }
}

document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
document.addEventListener("wheel", preventBackgroundScroll, { passive: false });

function setReservationOpen(isOpen) {
    if (!mobileReservation.matches) {
        if (!document.body.classList.contains("reservation-open")) return;
        isOpen = false;
    }

    reservationCard.classList.toggle("is-open", isOpen);
    reservationOverlay.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("reservation-open", isOpen);
    document.documentElement.classList.toggle("reservation-open", isOpen);
    reservationOverlay.setAttribute("aria-hidden", String(!isOpen));
}

cards.forEach(card => {
    card.addEventListener("click", () => {
        cards.forEach(item => item.classList.remove("active"));
        card.classList.add("active");
        document.getElementById("summaryTime").textContent = card.dataset.time;
        document.getElementById("summaryPrice").textContent = card.dataset.price;
        setReservationOpen(true);
    });
});

closeReservation.addEventListener("click", () => setReservationOpen(false));
reservationOverlay.addEventListener("click", () => setReservationOpen(false));
mobileReservation.addEventListener("change", () => setReservationOpen(false));

const calendarDays = document.getElementById("calendarDays");
const previousDays = document.getElementById("previousDays");
const nextDays = document.getElementById("nextDays");
const visibleDays = 5;
let calendarOffset = 0;

function angolaToday() {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Luanda",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());

    const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return new Date(Date.UTC(value.year, Number(value.month) - 1, value.day));
}

const bookingStart = angolaToday();
const bookingEnd = new Date(bookingStart);
bookingEnd.setUTCMonth(bookingEnd.getUTCMonth() + 1);
let selectedDate = new Date(bookingStart);

function formatBookingDate(date) {
    const parts = new Intl.DateTimeFormat("pt-AO", {
        timeZone: "Africa/Luanda",
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).formatToParts(date);
    const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${value.day} ${value.month.replace(".", "").toUpperCase()} ${value.year}`;
}

function isSameDate(first, second) {
    return first.getTime() === second.getTime();
}

function renderCalendar() {
    const dates = [];

    for (let date = new Date(bookingStart); date <= bookingEnd; date.setUTCDate(date.getUTCDate() + 1)) {
        dates.push(new Date(date));
    }

    const pageStart = new Date(bookingStart);
    pageStart.setUTCDate(pageStart.getUTCDate() + calendarOffset);
    const visibleDates = Array.from({ length: visibleDays }, (_, index) => {
        const date = new Date(pageStart);
        date.setUTCDate(date.getUTCDate() + index);
        return date;
    });

    calendarDays.innerHTML = visibleDates.map(date => {
        const available = date <= bookingEnd;
        const weekday = new Intl.DateTimeFormat("pt-AO", {
            timeZone: "Africa/Luanda",
            weekday: "long"
        }).format(date);
        const day = new Intl.DateTimeFormat("pt-AO", {
            timeZone: "Africa/Luanda",
            day: "2-digit"
        }).format(date);
        const month = new Intl.DateTimeFormat("pt-AO", {
            timeZone: "Africa/Luanda",
            month: "short"
        }).format(date).replace(".", "").toUpperCase();

        return `<button class="day${available && isSameDate(date, selectedDate) ? " active" : ""}${available ? "" : " inactive"}" type="button" data-date="${date.toISOString()}"${available ? "" : " disabled"}>
            <span>${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}</span>
            <strong>${day}</strong>
            <small>${month}</small>
        </button>`;
    }).join("");

    previousDays.disabled = calendarOffset === 0;
    nextDays.disabled = calendarOffset + visibleDays >= dates.length;

    calendarDays.querySelectorAll(".day").forEach(day => {
        day.addEventListener("click", () => {
            selectedDate = new Date(day.dataset.date);
            document.getElementById("summaryDate").textContent = formatBookingDate(selectedDate);
            renderCalendar();
        });
    });
}

previousDays.addEventListener("click", () => {
    calendarOffset = Math.max(0, calendarOffset - visibleDays);
    renderCalendar();
});

nextDays.addEventListener("click", () => {
    calendarOffset += visibleDays;
    renderCalendar();
});

document.getElementById("summaryDate").textContent = formatBookingDate(selectedDate);
renderCalendar();

document.getElementById("confirmBtn").addEventListener("click", () => {
    const time = document.getElementById("summaryTime").textContent.trim();

    if (!time || time === "--") {
        alert("Selecione um horário antes de continuar.");
        return;
    }

    localStorage.setItem("route", document.getElementById("summaryRoute").textContent.trim());
    localStorage.setItem("date", document.getElementById("summaryDate").textContent.trim());
    localStorage.setItem("time", time);
    window.location.href = "confirmacao.html";
});
