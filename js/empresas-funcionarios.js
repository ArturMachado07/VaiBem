/**
 * Portal da Empresa — Gestão de funcionários (empresas-funcionarios.html)
 *
 * Sem conta em servidor: os funcionários geridos aqui ficam guardados no
 * localStorage deste dispositivo (vaibem:companyEmployees). Na primeira
 * visita a lista vem com 4 funcionários de exemplo, para o admin perceber
 * o ecrã antes de introduzir a sua própria equipa — pode editar ou remover
 * cada um livremente. O nome/email do admin vêm da sessão Google real.
 */
(function () {
    "use strict";

    const USER_KEY = "vaibem:user";
    const EMPLOYEES_KEY = "vaibem:companyEmployees";

    function getUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    const user = getUser();

    if (!user) {
        window.location.href = "login.html?redirect=empresas-funcionarios.html";
        return;
    }

    const DEFAULT_EMPLOYEES = [
        { id: 1, name: "Marta Kiala", email: "marta.kiala@example.co.ao", department: "Engenharia", routeId: 1, status: "ativo", monthlyCost: 3200 },
        { id: 2, name: "Paulo Sacramento", email: "paulo.s@example.co.ao", department: "Financeiro", routeId: 2, status: "ativo", monthlyCost: 3600 },
        { id: 3, name: "Isabel Neto", email: "isabel.neto@example.co.ao", department: "Recursos Humanos", routeId: null, status: "pendente", monthlyCost: 0 },
        { id: 4, name: "Domingos Fortes", email: "d.fortes@example.co.ao", department: "Logística", routeId: 3, status: "inativo", monthlyCost: 0 }
    ];

    function loadEmployees() {
        try {
            const raw = localStorage.getItem(EMPLOYEES_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            // localStorage indisponível — segue com a lista de exemplo em memória.
        }
        persistEmployees(DEFAULT_EMPLOYEES);
        return DEFAULT_EMPLOYEES.slice();
    }

    function persistEmployees(list) {
        try {
            localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(list));
        } catch (e) {
            // Sem persistência disponível (ex.: modo privado) — a sessão atual continua a funcionar em memória.
        }
    }

    let employees = loadEmployees();
    let searchTerm = "";
    let editingId = null;

    const STATUS_LABELS = { ativo: "Ativo", pendente: "Pendente", inativo: "Inativo" };

    function formatKz(value) {
        return `${Number(value || 0).toLocaleString("pt-PT")} Kz`;
    }

    function initials(name) {
        return (name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("") || "?";
    }

    // Cabeçalho do portal — nome/email vêm da sessão Google real do admin.
    const adminLabelEl = document.getElementById("companyAdminLabel");
    if (adminLabelEl) {
        adminLabelEl.textContent = `Gerido por ${user.name || user.email || "ti"}`;
    }

    // Opções de rota vêm da mesma fonte de dados usada em rotas.html/horarios.html.
    const routeSelect = document.getElementById("empRoute");
    if (routeSelect && window.VaiBemData) {
        window.VaiBemData.routes.forEach(route => {
            const option = document.createElement("option");
            option.value = String(route.id);
            option.textContent = window.VaiBemData.formatRouteLabel(route);
            routeSelect.appendChild(option);
        });
    }

    function getRouteLabel(routeId) {
        if (!routeId || !window.VaiBemData) return "— sem rota —";
        const route = window.VaiBemData.getRouteById(routeId);
        return route ? window.VaiBemData.formatRouteLabel(route) : "— sem rota —";
    }

    function renderStats(list) {
        const total = list.length;
        const active = list.filter(emp => emp.status === "ativo").length;
        const routesInUse = new Set(list.filter(emp => emp.routeId).map(emp => emp.routeId)).size;
        const spend = list.reduce((sum, emp) => sum + (Number(emp.monthlyCost) || 0), 0);

        document.getElementById("statTotal").textContent = total;
        document.getElementById("statActive").textContent = active;
        document.getElementById("statRoutes").textContent = routesInUse;
        document.getElementById("statSpend").textContent = formatKz(spend);
    }

    function matchesSearch(emp, term) {
        if (!term) return true;
        const haystack = `${emp.name} ${emp.email} ${emp.department}`.toLowerCase();
        return haystack.includes(term);
    }

    function renderTable() {
        const tbody = document.getElementById("employeeTableBody");
        const emptyState = document.getElementById("employeeEmpty");
        const term = searchTerm.trim().toLowerCase();
        const visible = employees.filter(emp => matchesSearch(emp, term));

        tbody.innerHTML = "";

        visible.forEach(emp => {
            const tr = document.createElement("tr");

            const tdEmp = document.createElement("td");
            tdEmp.className = "cp-cell-emp";
            tdEmp.innerHTML = `
                <div class="cp-emp">
                    <span class="cp-emp-avatar" aria-hidden="true">${initials(emp.name)}</span>
                    <div>
                        <p class="cp-emp-name">${emp.name}</p>
                        <p class="cp-emp-email">${emp.email}</p>
                    </div>
                </div>
            `;

            const tdDept = document.createElement("td");
            tdDept.setAttribute("data-label", "Departamento");
            tdDept.textContent = emp.department || "—";

            const tdRoute = document.createElement("td");
            tdRoute.setAttribute("data-label", "Rota");
            tdRoute.textContent = getRouteLabel(emp.routeId);

            const tdStatus = document.createElement("td");
            tdStatus.setAttribute("data-label", "Estado");
            tdStatus.innerHTML = `<span class="cp-status cp-status-${emp.status}">${STATUS_LABELS[emp.status] || emp.status}</span>`;

            const tdActions = document.createElement("td");
            tdActions.className = "cp-col-actions";
            tdActions.setAttribute("data-label", "Ações");
            tdActions.innerHTML = `
                <div class="cp-row-actions">
                    <button type="button" class="cp-icon-btn" data-edit="${emp.id}" aria-label="Editar ${emp.name}"><i aria-hidden="true">✎</i></button>
                    <button type="button" class="cp-icon-btn" data-remove="${emp.id}" aria-label="Remover ${emp.name}"><i aria-hidden="true">✕</i></button>
                </div>
            `;

            tr.appendChild(tdEmp);
            tr.appendChild(tdDept);
            tr.appendChild(tdRoute);
            tr.appendChild(tdStatus);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });

        emptyState.hidden = visible.length !== 0;
        renderStats(employees);
    }

    document.getElementById("employeeSearch").addEventListener("input", event => {
        searchTerm = event.target.value;
        renderTable();
    });

    document.getElementById("employeeTableBody").addEventListener("click", event => {
        const editBtn = event.target.closest("[data-edit]");
        const removeBtn = event.target.closest("[data-remove]");

        if (editBtn) {
            openModal(Number(editBtn.getAttribute("data-edit")));
        } else if (removeBtn) {
            const id = Number(removeBtn.getAttribute("data-remove"));
            const emp = employees.find(item => item.id === id);
            if (emp && window.confirm(`Remover ${emp.name} da lista de funcionários?`)) {
                employees = employees.filter(item => item.id !== id);
                persistEmployees(employees);
                renderTable();
            }
        }
    });

    // Modal de adicionar/editar

    const overlay = document.getElementById("employeeModalOverlay");
    const modalTitle = document.getElementById("employeeModalTitle");
    const form = document.getElementById("employeeForm");
    const formError = document.getElementById("employeeFormError");
    const deleteBtn = document.getElementById("employeeDeleteBtn");

    function openModal(id) {
        editingId = id || null;
        formError.hidden = true;
        formError.textContent = "";

        if (editingId) {
            const emp = employees.find(item => item.id === editingId);
            if (!emp) return;
            modalTitle.textContent = "Editar funcionário";
            document.getElementById("empName").value = emp.name;
            document.getElementById("empEmail").value = emp.email;
            document.getElementById("empDepartment").value = emp.department;
            document.getElementById("empRoute").value = emp.routeId ? String(emp.routeId) : "";
            document.getElementById("empStatus").value = emp.status;
            deleteBtn.hidden = false;
        } else {
            modalTitle.textContent = "Adicionar funcionário";
            form.reset();
            deleteBtn.hidden = true;
        }

        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        editingId = null;
    }

    document.getElementById("addEmployeeBtn").addEventListener("click", () => openModal(null));
    document.getElementById("employeeModalClose").addEventListener("click", closeModal);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
    });

    deleteBtn.addEventListener("click", () => {
        if (!editingId) return;
        const emp = employees.find(item => item.id === editingId);
        if (emp && window.confirm(`Remover ${emp.name} da lista de funcionários?`)) {
            employees = employees.filter(item => item.id !== editingId);
            persistEmployees(employees);
            renderTable();
            closeModal();
        }
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("empName").value.trim();
        const email = document.getElementById("empEmail").value.trim();
        const department = document.getElementById("empDepartment").value.trim();
        const routeId = document.getElementById("empRoute").value ? Number(document.getElementById("empRoute").value) : null;
        const status = document.getElementById("empStatus").value;

        if (!name || !email || !department) {
            formError.textContent = "Preenche nome, email e departamento antes de guardar.";
            formError.hidden = false;
            return;
        }

        if (editingId) {
            const emp = employees.find(item => item.id === editingId);
            if (emp) {
                emp.name = name;
                emp.email = email;
                emp.department = department;
                emp.routeId = routeId;
                emp.status = status;
            }
        } else {
            const nextId = employees.reduce((max, item) => Math.max(max, item.id), 0) + 1;
            employees.push({ id: nextId, name, email, department, routeId, status, monthlyCost: 0 });
        }

        persistEmployees(employees);
        renderTable();
        closeModal();
    });

    renderTable();
})();
