/**
 * Simulação de pagamento por referência Multicaixa — reutilizável em
 * qualquer página (perfil.html, confirmacao.html, etc.).
 *
 * Não existe processador de pagamentos real ligado ao site. Isto gera uma
 * referência Entidade/Referência/Valor no formato usado por qualquer app
 * bancária ou ATM angolano, e ao "confirmar" chama o callback onConfirm
 * fornecido — quem chamou é que decide o que esse "pagamento" simulado
 * representa (carregar saldo, pagar uma viagem, etc.). O modal deixa
 * sempre claro, em texto, que é uma simulação.
 *
 * Uso:
 *   VaiBemMulticaixa.open({
 *       title: "Pagar viagem por referência Multicaixa",
 *       note: "Referência gerada para esta viagem.",
 *       amount: 800,                     // valor fixo, sem escolha
 *       // ou, para deixar a pessoa escolher:
 *       amounts: [2000, 5000, 10000],
 *       onConfirm: function (amount) { ... }
 *   });
 */
(function (global) {
    "use strict";

    let overlay = null;
    let refs = null;
    let state = { amounts: null, selectedAmount: 0, onConfirm: null };

    function formatKz(value) {
        return `${Number(value).toLocaleString("pt-PT")} Kz`;
    }

    function randomDigits(length) {
        let digits = "";
        for (let i = 0; i < length; i++) digits += Math.floor(Math.random() * 10);
        return digits;
    }

    function generateReference() {
        const raw = randomDigits(9);
        refs.reference.textContent = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6, 9)}`;
    }

    function selectAmount(amount) {
        state.selectedAmount = amount;
        refs.amountLabel.textContent = formatKz(amount);
        if (state.amounts) {
            refs.amounts.querySelectorAll(".mcx-amount").forEach(btn => {
                btn.classList.toggle("is-selected", Number(btn.dataset.amount) === amount);
            });
        }
        generateReference();
    }

    function build() {
        overlay = document.createElement("div");
        overlay.className = "mcx-overlay";
        overlay.setAttribute("aria-hidden", "true");
        overlay.innerHTML = `
            <section class="mcx-modal" role="dialog" aria-modal="true" aria-labelledby="mcxTitle">
                <button type="button" class="mcx-close" aria-label="Fechar">&times;</button>
                <img src="assets/icons/Mcx express.svg" alt="" class="mcx-modal-icon">
                <h2 id="mcxTitle"></h2>
                <p class="mcx-modal-note"></p>
                <div class="mcx-amounts" hidden></div>
                <div class="mcx-ref-card">
                    <div class="mcx-ref-row"><span>Entidade</span><strong>00188</strong></div>
                    <div class="mcx-ref-row"><span>Referência</span><strong class="mcx-reference">000 000 000</strong></div>
                    <div class="mcx-ref-row"><span>Valor</span><strong class="mcx-amount-label">0 Kz</strong></div>
                </div>
                <p class="mcx-modal-hint">Paga esta referência num ATM, no Multicaixa Express ou na app do teu banco. Válida por 24 horas.</p>
                <button type="button" class="mcx-confirm">Já paguei — simular confirmação</button>
                <p class="mcx-modal-disclaimer">Isto é uma simulação para demonstração. O pagamento real ainda não está ligado a um processador de pagamentos.</p>
            </section>
        `;
        document.body.appendChild(overlay);

        refs = {
            title: overlay.querySelector("#mcxTitle"),
            note: overlay.querySelector(".mcx-modal-note"),
            amounts: overlay.querySelector(".mcx-amounts"),
            reference: overlay.querySelector(".mcx-reference"),
            amountLabel: overlay.querySelector(".mcx-amount-label"),
            confirm: overlay.querySelector(".mcx-confirm"),
            close: overlay.querySelector(".mcx-close")
        };

        refs.close.addEventListener("click", close);
        overlay.addEventListener("click", event => {
            if (event.target === overlay) close();
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && overlay.classList.contains("is-open")) close();
        });
        refs.confirm.addEventListener("click", () => {
            const amount = state.selectedAmount;
            close();
            if (typeof state.onConfirm === "function") state.onConfirm(amount);
        });
    }

    function close() {
        if (!overlay) return;
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function open(options) {
        options = options || {};
        if (!overlay) build();

        state.amounts = Array.isArray(options.amounts) && options.amounts.length ? options.amounts : null;
        state.onConfirm = options.onConfirm || null;

        refs.title.textContent = options.title || "Pagar por referência Multicaixa";
        refs.note.textContent = options.note || "Referência gerada para este pagamento.";

        if (state.amounts) {
            refs.amounts.hidden = false;
            refs.amounts.innerHTML = state.amounts
                .map(value => `<button type="button" class="mcx-amount" data-amount="${value}">${formatKz(value)}</button>`)
                .join("");
            refs.amounts.querySelectorAll(".mcx-amount").forEach(btn => {
                btn.addEventListener("click", () => selectAmount(Number(btn.dataset.amount)));
            });
            selectAmount(state.amounts[0]);
        } else {
            refs.amounts.hidden = true;
            selectAmount(Number(options.amount) || 0);
        }

        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    global.VaiBemMulticaixa = { open, close };
})(window);
