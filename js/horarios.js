/**
 * Página de horários / reserva. Lê a rota escolhida a partir de
 * VaiBemStorage (em vez da antiga chave solta "selectedRoute") e os
 * horários a partir de VaiBemAPI.getSchedules().
 */
(function () {
    "use strict";

    const booking = window.VaiBemStorage.getBooking();
    const route = booking.route || window.VaiBemData.getRouteById(1);

    document.getElementById("routeStart").textContent = route.origin;
    document.getElementById("routeEnd").textContent = route.destination;
    document.getElementById("routeName").textContent = route.via;
    document.getElementById("routeDuration").textContent = `${route.durationMinutes} min`;
    document.getElementById("routeStops").textContent = `${route.stops} paragens`;
    document.getElementById("summaryRoute").textContent = window.VaiBemData.formatRouteLabel(route);
    document.getElementById("summaryVia").textContent = route.via;

    const grid = document.getElementById("scheduleGrid");
    let schedules = [];

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
            const priceLabel = window.VaiBemData.formatPrice(schedule.price);

            return `
                <button class="schedule-card" type="button" data-time="${schedule.time}" data-price="${schedule.price}" ${schedule.seats ? "" : "disabled aria-disabled=\"true\""}>
                    <span class="schedule-period"><img class="schedule-period-${period.type}" src="${period.icon}" alt="${period.alt}"></span>
                    <strong class="schedule-time">${schedule.time}</strong>
                    <span class="schedule-select" aria-hidden="true"></span>
                    <span class="schedule-period-name">${period.label}</span>
                    <span class="schedule-info">${availability}</span>
                    <strong class="schedule-price">${priceLabel}</strong>
                </button>`;
        }).join("");

        grid.querySelectorAll(".schedule-card:not([disabled])").forEach(card => {
            card.addEventListener("click", () => {
                grid.querySelectorAll(".schedule-card").forEach(item => item.classList.remove("active"));
                card.classList.add("active");
                document.getElementById("summaryTime").textContent = card.dataset.time;
                document.getElementById("summaryPrice").textContent = window.VaiBemData.formatPrice(Number(card.dataset.price));
                window.VaiBemStorage.updateBooking({
                    route,
                    schedule: { time: card.dataset.time, price: Number(card.dataset.price) }
                });
                setReservationOpen(true);
            });
        });
    }

    document.getElementById("summaryTime").textContent = "--";
    document.getElementById("summaryPrice").textContent = "--";

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
                const dateLabel = formatBookingDate(selectedDate);
                document.getElementById("summaryDate").textContent = dateLabel;
                window.VaiBemStorage.updateBooking({ route, date: dateLabel });
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

    const initialDateLabel = formatBookingDate(selectedDate);
    document.getElementById("summaryDate").textContent = initialDateLabel;
    window.VaiBemStorage.updateBooking({ route, date: initialDateLabel });
    renderCalendar();

    document.getElementById("confirmBtn").addEventListener("click", () => {
        const time = document.getElementById("summaryTime").textContent.trim();

        if (!time || time === "--") {
            alert("Selecione um horário antes de continuar.");
            return;
        }

        window.VaiBemStorage.updateBooking({
            route,
            date: document.getElementById("summaryDate").textContent.trim(),
            schedule: { time, price: Number(document.querySelector(".schedule-card.active")?.dataset.price) || route.price }
        });

        window.location.href = "confirmacao.html";
    });

    window.VaiBemAPI.getSchedules(route.id).then(data => {
        schedules = data;
        renderSchedules();
    });
})();
