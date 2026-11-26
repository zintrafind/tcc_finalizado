/* ============================================================
   USUÁRIOS CADASTRADOS — SCRIPT COMPLETO
   ============================================================ */

(() => {
    "use strict";

    const API = "http://127.0.0.1:8000/api";
    const STORAGE = "http://127.0.0.1:8000/storage";

    const $ = id => document.getElementById(id);

    const token =
        localStorage.getItem("adminToken") ||
        sessionStorage.getItem("adminToken");

    if (!token) {
        location.href = "../autenticação/index.html";
        return;
    }

    let users = [];
    let loading = false;
    let actionBusy = false;
    let saving = false;

    let pendingConfirmation = null;

    const dialogs = [
        ...document.querySelectorAll("dialog")
    ];

    const escapeHTML = value =>
        String(value ?? "").replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character])
        );

    const userType = value =>
        value === "A" ? "Administrador" : "Cliente";

    const userStatus = value =>
        ({
            A: "Ativo",
            B: "Bloqueado"
        }[value] || value || "Não informado");

    /* ========================================================
       SESSÃO
       ======================================================== */

    function clearSession() {
        for (const storage of [
            localStorage,
            sessionStorage
        ]) {
            for (const key of [
                "adminToken",
                "adminNome",
                "adminId"
            ]) {
                storage.removeItem(key);
            }
        }
    }

    /* ========================================================
       COMUNICAÇÃO COM A API
       ======================================================== */

    async function request(path, options = {}) {
        const controller = new AbortController();

        const timeout = setTimeout(
            () => controller.abort(),
            20000
        );

        try {
            const response = await fetch(
                `${API}${path}`,
                {
                    ...options,

                    signal: controller.signal,

                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                        ...options.headers
                    }
                }
            );

            if (response.status === 401) {
                clearSession();

                location.href =
                    "../autenticação/index.html";

                throw new Error(
                    "Sua sessão expirou. Entre novamente."
                );
            }

            const data = await response.json()
                .catch(() => ({}));

            if (!response.ok) {
                const message =
                    response.status === 422 && data.errors
                        ? Object.values(data.errors)
                            .flat()
                            .join("\n")
                        : data.message ||
                          `Não foi possível concluir a operação (HTTP ${response.status}).`;

                throw new Error(message);
            }

            return data;

        } catch (error) {
            if (error.name === "AbortError") {
                throw new Error(
                    "A API demorou para responder. Tente novamente."
                );
            }

            if (error instanceof TypeError) {
                throw new Error(
                    "Não foi possível acessar a API. Confira se o Laravel está iniciado e permite o acesso desta página."
                );
            }

            throw error;

        } finally {
            clearTimeout(timeout);
        }
    }

    /* ========================================================
       SIDEBAR
       ======================================================== */

    const sidebar = $("sidebar");

    function updateSidebar() {
        const collapsed =
            sidebar.classList.contains("collapsed");

        $("sidebarToggleIcon").className = collapsed
            ? "fa-solid fa-chevron-right"
            : "fa-solid fa-chevron-left";

        $("sidebarToggle").setAttribute(
            "aria-expanded",
            String(!collapsed)
        );

        $("sidebarToggle").setAttribute(
            "aria-label",
            collapsed
                ? "Expandir menu lateral"
                : "Recolher menu lateral"
        );
    }

    sidebar.classList.toggle(
        "collapsed",
        localStorage.getItem("sidebarState") ===
            "collapsed"
    );

    updateSidebar();

    $("sidebarToggle").addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");

        localStorage.setItem(
            "sidebarState",
            sidebar.classList.contains("collapsed")
                ? "collapsed"
                : "expanded"
        );

        updateSidebar();
    });

    /* ========================================================
       PERFIL
       ======================================================== */

    $("adminName").textContent =
        localStorage.getItem("adminNome") ||
        "Administrador";

    function closeProfile(focus = false) {
        $("profileMenu").hidden = true;

        $("profileButton").setAttribute(
            "aria-expanded",
            "false"
        );

        if (focus) {
            $("profileButton").focus();
        }
    }

    $("profileButton").addEventListener("click", () => {
        const open = $("profileMenu").hidden;

        $("profileMenu").hidden = !open;

        $("profileButton").setAttribute(
            "aria-expanded",
            String(open)
        );
    });

    document.addEventListener("click", event => {
        if (
            !$("profileContainer").contains(event.target)
        ) {
            closeProfile();
        }
    });

    $("profileContainer").addEventListener(
        "focusout",
        event => {
            if (
                !$("profileContainer").contains(
                    event.relatedTarget
                )
            ) {
                closeProfile();
            }
        }
    );

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            !$("profileMenu").hidden
        ) {
            closeProfile(true);
        }
    });

    /* ========================================================
       TEMA
       ======================================================== */

    $("themeSelect").value =
        document.documentElement.dataset.tema === "escuro"
            ? "escuro"
            : "claro";

    $("themeSelect").addEventListener("change", event => {
        const theme =
            event.target.value === "escuro"
                ? "escuro"
                : "claro";

        document.documentElement.dataset.tema = theme;

        localStorage.setItem("adminTema", theme);
    });

    /* ========================================================
       MODAIS
       ======================================================== */

    function syncScroll() {
        document.body.classList.toggle(
            "modal-open",
            dialogs.some(dialog => dialog.open)
        );
    }

    function openDialog(id) {
        if (!$(id).open) {
            $(id).showModal();
        }

        syncScroll();
    }

    dialogs.forEach(dialog => {
        dialog.addEventListener(
            "close",
            syncScroll
        );

        dialog.addEventListener("cancel", event => {
            if (
                (
                    dialog.id === "editDialog" &&
                    saving
                ) ||
                (
                    dialog.id === "logoutDialog" &&
                    actionBusy
                )
            ) {
                event.preventDefault();
            }
        });
    });

    document.querySelectorAll("[data-close]")
        .forEach(button => {
            button.addEventListener("click", () => {
                if (
                    button.dataset.close === "editDialog" &&
                    saving
                ) {
                    return;
                }

                if (
                    button.dataset.close === "logoutDialog" &&
                    actionBusy
                ) {
                    return;
                }

                $(button.dataset.close).close();
            });
        });

    function confirmAction(title, text, label) {
        $("confirmTitle").textContent = title;
        $("confirmText").textContent = text;
        $("confirmAccept").textContent = label;

        return new Promise(resolve => {
            pendingConfirmation = resolve;

            openDialog("confirmDialog");

            $("confirmCancel").focus();
        });
    }

    function resolveConfirmation(value) {
        const resolve = pendingConfirmation;

        pendingConfirmation = null;

        $("confirmDialog").close();

        if (resolve) {
            resolve(value);
        }
    }

    $("confirmAccept").addEventListener("click", () => {
        resolveConfirmation(true);
    });

    $("confirmCancel").addEventListener("click", () => {
        resolveConfirmation(false);
    });

    $("confirmDialog").addEventListener("close", () => {
        if (pendingConfirmation) {
            const resolve = pendingConfirmation;

            pendingConfirmation = null;

            resolve(false);
        }
    });

    /* ========================================================
       FOTOS
       ======================================================== */

    function setPhoto(image, user) {
        const fallback =
            user.tp_usuario === "A"
                ? "src/images/avatar1.png"
                : "src/images/avatar2.png";

        const path = String(
            user.ds_foto_perfil || ""
        ).trim().replace(/^\/+/, "");

        image.onerror = () => {
            image.onerror = null;
            image.src = fallback;
        };

        if (!path) {
            image.src = fallback;

        } else if (/^https?:\/\//i.test(path)) {
            image.src = path;

        } else if (path.startsWith("storage/")) {
            image.src =
                `http://127.0.0.1:8000/${path}`;

        } else {
            image.src = `${STORAGE}/${path}`;
        }
    }

    /* ========================================================
       DATAS
       ======================================================== */

    function formatDate(value) {
        if (!value) {
            return "Não informado";
        }

        const date = new Date(
            String(value).replace(" ", "T")
        );

        if (Number.isNaN(date.getTime())) {
            return "Não informado";
        }

        return date.toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });
    }

    /* ========================================================
       ESTADOS DA LISTAGEM
       ======================================================== */

    function listState(
        message,
        icon = "fa-users-slash",
        error = false
    ) {
        $("usersList").innerHTML = `
            <div class="list-state ${error ? "error" : ""}">

                <i
                    class="fa-solid ${icon}"
                    aria-hidden="true"
                ></i>

                <p>${escapeHTML(message)}</p>

            </div>
        `;
    }

    /* ========================================================
       RENDERIZAR E PESQUISAR
       ======================================================== */

    function render() {
        const term = $("searchInput").value
            .trim()
            .toLocaleLowerCase("pt-BR");

        const filtered = users.filter(user =>
            [
                user.id_usuario,
                user.nm_usuario,
                user.email,
                userType(user.tp_usuario),
                userStatus(user.st_usuario)
            ].some(value =>
                String(value ?? "")
                    .toLocaleLowerCase("pt-BR")
                    .includes(term)
            )
        );

        $("pageStatus").textContent =
            `${filtered.length.toLocaleString("pt-BR")} usuário(s) ` +
            `${term ? "encontrado(s)" : "carregado(s)"}.`;

        $("usersList").replaceChildren();

        if (!filtered.length) {
            listState("Nenhum usuário encontrado.");
            return;
        }

        filtered.forEach(user => {
            const blocked = user.st_usuario === "B";
            const id = escapeHTML(user.id_usuario);

            const card = document.createElement("article");

            card.className =
                `user-card${blocked ? " blocked" : ""}`;

            const badge = blocked
                ? "badge-blocked"
                : user.st_usuario === "A"
                    ? "badge-active"
                    : "badge-other";

            card.innerHTML = `
                <div class="user-avatar-wrap">

                    <img
                        class="user-avatar"
                        alt="Foto de ${escapeHTML(
                            user.nm_usuario || "Usuário"
                        )}"
                    >

                    <span class="user-badge ${badge}">
                        ${escapeHTML(
                            userStatus(user.st_usuario)
                        )}
                    </span>

                </div>

                <h3 class="user-name">

                    <i
                        class="fa-solid fa-user"
                        aria-hidden="true"
                    ></i>

                    ${escapeHTML(
                        user.nm_usuario || "Usuário"
                    )}

                </h3>

                <p class="user-meta">

                    <i
                        class="fa-solid fa-envelope"
                        aria-hidden="true"
                    ></i>

                    ${escapeHTML(
                        user.email || "Sem e-mail"
                    )}

                </p>

                <p class="user-meta">

                    <i
                        class="fa-solid fa-shield"
                        aria-hidden="true"
                    ></i>

                    ${userType(user.tp_usuario)}

                </p>

                <div class="user-actions">

                    <button
                        type="button"
                        class="user-action action-view"
                        data-action="view"
                        data-id="${id}"
                    >
                        <i
                            class="fa-solid fa-eye"
                            aria-hidden="true"
                        ></i>

                        Visualizar
                    </button>

                    <button
                        type="button"
                        class="user-action action-edit"
                        data-action="edit"
                        data-id="${id}"
                    >
                        <i
                            class="fa-solid fa-pen"
                            aria-hidden="true"
                        ></i>

                        Editar
                    </button>

                    <button
                        type="button"
                        class="user-action ${
                            blocked
                                ? "action-unblock"
                                : "action-block"
                        }"
                        data-action="status"
                        data-id="${id}"
                        data-blocked="${blocked}"
                    >
                        <i
                            class="fa-solid ${
                                blocked
                                    ? "fa-lock-open"
                                    : "fa-ban"
                            }"
                            aria-hidden="true"
                        ></i>

                        ${blocked ? "Desbloquear" : "Bloquear"}
                    </button>

                    <button
                        type="button"
                        class="user-action action-delete"
                        data-action="delete"
                        data-id="${id}"
                    >
                        <i
                            class="fa-solid fa-trash"
                            aria-hidden="true"
                        ></i>

                        Excluir
                    </button>

                </div>
            `;

            setPhoto(
                card.querySelector("img"),
                user
            );

            $("usersList").append(card);
        });
    }

    /* ========================================================
       CARREGAR USUÁRIOS
       ======================================================== */

    async function loadUsers() {
        if (loading) return;

        loading = true;

        $("refreshButton").disabled = true;

        $("usersList").setAttribute(
            "aria-busy",
            "true"
        );

        $("pageStatus").textContent =
            "Carregando usuários...";

        listState(
            "Carregando usuários...",
            "fa-spinner fa-spin"
        );

        try {
            const data = await request(
                "/admin/users",
                {
                    cache: "no-store"
                }
            );

            const records = Array.isArray(data)
                ? data
                : data.usuarios ?? data.data;

            if (!Array.isArray(records)) {
                throw new Error(
                    "A API retornou uma lista em formato inesperado."
                );
            }

            users = records;

            render();

        } catch (error) {
            users = [];

            listState(
                "Não foi possível carregar os usuários. Clique em Atualizar para tentar novamente.",
                "fa-triangle-exclamation",
                true
            );

            $("pageStatus").textContent = error.message;

        } finally {
            loading = false;

            $("refreshButton").disabled = actionBusy;

            $("usersList").setAttribute(
                "aria-busy",
                "false"
            );
        }
    }

    $("searchInput").addEventListener("input", () => {
        if (!loading) {
            render();
        }
    });

    $("searchForm").addEventListener("submit", event => {
        event.preventDefault();

        if (!loading) {
            render();
        }
    });

    $("refreshButton").addEventListener("click", () => {
        if (!actionBusy) {
            loadUsers();
        }
    });

    /* ========================================================
       VISUALIZAR DETALHES
       ======================================================== */

    async function viewUser(id) {
        const user = await request(
            `/admin/users/${encodeURIComponent(id)}/detalhes`
        );

        setPhoto($("detailsPhoto"), user);

        const verified = [
            "S",
            "1",
            1,
            true
        ].includes(user.st_email_verificado)
            ? "Sim"
            : "Não";

        const fields = [
            ["ID", user.id_usuario],
            ["Nome", user.nm_usuario],
            ["E-mail", user.email],
            ["Tipo", userType(user.tp_usuario)],
            ["Status", userStatus(user.st_usuario)],
            ["E-mail verificado", verified],

            [
                "Descrição",
                user.ds_usuario ||
                    "Nenhuma descrição cadastrada.",
                true
            ],

            ["Anúncios", user.total_anuncios ?? 0],
            ["Trocas / propostas", user.total_trocas ?? 0],

            [
                "Cadastrado em",
                formatDate(user.created_at),
                true
            ]
        ];

        $("detailsData").replaceChildren();

        fields.forEach(([label, value, full]) => {
            const item = document.createElement("div");

            if (full) {
                item.className = "full";
            }

            const dt = document.createElement("dt");
            const dd = document.createElement("dd");

            dt.textContent = label;

            dd.textContent =
                value ?? "Não informado";

            item.append(dt, dd);

            $("detailsData").append(item);
        });

        openDialog("detailsDialog");
    }

    /* ========================================================
       ABRIR EDIÇÃO
       ======================================================== */

    async function editUser(id) {
        const user = await request(
            `/admin/users/${encodeURIComponent(id)}/detalhes`
        );

        $("editId").value = user.id_usuario;
        $("editName").value = user.nm_usuario || "";
        $("editEmail").value = user.email || "";
        $("editType").value = user.tp_usuario || "C";

        $("editDescription").value =
            user.ds_usuario || "";

        $("editStatus").textContent = "";

        openDialog("editDialog");

        $("editName").focus();
    }

    /* ========================================================
       SALVAR EDIÇÃO
       ======================================================== */

    $("editForm").addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            if (saving || actionBusy) return;

            const name = $("editName").value.trim();
            const email = $("editEmail").value.trim();

            if (!name || !email) {
                $("editStatus").textContent =
                    "Preencha o nome e o e-mail.";

                return;
            }

            saving = true;
            actionBusy = true;

            $("saveButton").disabled = true;
            $("refreshButton").disabled = true;

            $("editStatus").textContent =
                "Salvando alterações...";

            try {
                const data = await request(
                    `/admin/users/${encodeURIComponent(
                        $("editId").value
                    )}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            nm_usuario: name,
                            email,

                            tp_usuario:
                                $("editType").value,

                            ds_usuario:
                                $("editDescription").value
                                    .trim() || null
                        })
                    }
                );

                $("editDialog").close();

                await loadUsers();

                $("pageStatus").textContent =
                    data.message ||
                    "Usuário atualizado com sucesso!";

            } catch (error) {
                $("editStatus").textContent =
                    error.message;

            } finally {
                saving = false;
                actionBusy = false;

                $("saveButton").disabled = false;
                $("refreshButton").disabled = false;
            }
        }
    );

    /* ========================================================
       AÇÕES DOS CARDS
       ======================================================== */

    $("usersList").addEventListener(
        "click",
        async event => {
            const button = event.target.closest(
                "button[data-action]"
            );

            if (!button || actionBusy || loading) {
                return;
            }

            actionBusy = true;

            button.disabled = true;
            $("refreshButton").disabled = true;

            try {
                const { id, action } = button.dataset;

                if (action === "view") {
                    await viewUser(id);

                } else if (action === "edit") {
                    await editUser(id);

                } else {
                    const blocked =
                        button.dataset.blocked === "true";

                    const label = action === "delete"
                        ? "Excluir"
                        : blocked
                            ? "Desbloquear"
                            : "Bloquear";

                    const user = users.find(item =>
                        String(item.id_usuario) === String(id)
                    );

                    const text = action === "delete"
                        ? `Deseja excluir ${
                            user?.nm_usuario || "este usuário"
                          }? Esta ação não poderá ser desfeita.`
                        : `Deseja ${
                            label.toLowerCase()
                          } este usuário?`;

                    const confirmed = await confirmAction(
                        `${label} usuário`,
                        text,
                        label
                    );

                    if (!confirmed) return;

                    const data = await request(
                        `/admin/users/${encodeURIComponent(id)}` +
                        `${action === "status" ? "/status" : ""}`,
                        {
                            method: action === "delete"
                                ? "DELETE"
                                : "PUT"
                        }
                    );

                    await loadUsers();

                    $("pageStatus").textContent =
                        data.message ||
                        "Operação concluída com sucesso!";
                }

            } catch (error) {
                $("pageStatus").textContent =
                    error.message;

            } finally {
                actionBusy = false;

                if (button.isConnected) {
                    button.disabled = false;
                }

                $("refreshButton").disabled = loading;
            }
        }
    );

    /* ========================================================
       SAÍDA DA CONTA
       ======================================================== */

    document.querySelectorAll("[data-logout]")
        .forEach(button => {
            button.addEventListener("click", () => {
                if (actionBusy || saving) return;

                closeProfile();

                $("logoutStatus").textContent = "";

                openDialog("logoutDialog");
            });
        });

    $("logoutConfirm").addEventListener(
        "click",
        async () => {
            if (actionBusy) return;

            actionBusy = true;

            $("logoutConfirm").disabled = true;

            $("logoutStatus").textContent =
                "Encerrando sessão...";

            try {
                await request(
                    "/logout",
                    {
                        method: "POST"
                    }
                );

                clearSession();

                location.href =
                    "../autenticação/index.html";

            } catch (error) {
                $("logoutStatus").textContent =
                    error.message;

            } finally {
                actionBusy = false;

                $("logoutConfirm").disabled = false;
            }
        }
    );

    /* ========================================================
       INICIALIZAÇÃO
       ======================================================== */

    loadUsers();
})();