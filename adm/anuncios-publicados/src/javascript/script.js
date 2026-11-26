/* ============================================================
   ANÚNCIOS PUBLICADOS — SCRIPT COMPLETO
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

    let products = [];
    let loading = false;
    let actionBusy = false;

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
       API
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


/* ============================================================
   SIDEBAR — PADRÃO COMPARTILHADO
   ============================================================ */

const sidebar = $("sidebar");
const sidebarToggle = $("sidebarToggle");
const sidebarToggleIcon = $("sidebarToggleIcon");

function atualizarSidebar() {
    if (!sidebar || !sidebarToggle || !sidebarToggleIcon) {
        return;
    }

    const recolhida =
        sidebar.classList.contains("active") ||
        sidebar.classList.contains("collapsed");

    sidebarToggleIcon.className = recolhida
        ? "fa-solid fa-chevron-right"
        : "fa-solid fa-chevron-left";

    sidebarToggle.setAttribute(
        "aria-expanded",
        String(!recolhida)
    );

    sidebarToggle.setAttribute(
        "aria-label",
        recolhida
            ? "Expandir menu lateral"
            : "Recolher menu lateral"
    );
}

if (sidebar && sidebarToggle && sidebarToggleIcon) {
    const recolhidaInicial =
        localStorage.getItem("sidebarState") === "collapsed";

    /* Mantém compatibilidade com os dois nomes antigos. */
    sidebar.classList.toggle("active", recolhidaInicial);
    sidebar.classList.toggle("collapsed", recolhidaInicial);

    atualizarSidebar();

    sidebarToggle.addEventListener("click", () => {
        const recolhidaAgora =
            sidebar.classList.contains("active") ||
            sidebar.classList.contains("collapsed");

        const recolher = !recolhidaAgora;

        sidebar.classList.toggle("active", recolher);
        sidebar.classList.toggle("collapsed", recolher);

        localStorage.setItem(
            "sidebarState",
            recolher ? "collapsed" : "expanded"
        );

        atualizarSidebar();
    });
}

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
                dialog.id === "logoutDialog" &&
                actionBusy
            ) {
                event.preventDefault();
            }
        });
    });

    document.querySelectorAll("[data-close]")
        .forEach(button => {
            button.addEventListener("click", () => {
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
       CATEGORIAS, STATUS E CONDIÇÕES
       ======================================================== */

    const categories = {
        1: "Hardware",
        2: "Computador e notebook",
        3: "Celular e tablet",
        4: "Memórias e pen drives",
        5: "Fontes e carregadores",
        6: "Impressoras e adaptadores",
        7: "Consoles e videogames",
        8: "Câmeras",
        9: "Outros"
    };

    const statuses = {
        A: "Disponível",
        N: "Em negociação",
        T: "Trocado",
        S: "Suspenso",
        E: "Excluído"
    };

    const conditions = {
        N: "Novo",
        S: "Seminovo",
        U: "Usado",
        Q: "Quebrado"
    };

    const productId = product =>
        product.id_produto ?? product.id;

    const productName = product =>
        product.nm_produto ||
        product.nm_anuncio ||
        product.titulo ||
        product.name ||
        "Produto sem nome";

    const ownerName = product =>
        product.dono_anuncio ||
        product.usuario?.nm_usuario ||
        product.user?.nm_usuario ||
        `Usuário ID: ${product.id_usuario ?? "não informado"}`;

    const categoryName = product =>
        product.nome_categoria ||
        product.categoria?.nm_categoria ||
        categories[product.id_categoria] ||
        "Categoria não informada";

    const statusName = product =>
        statuses[product.st_status] ||
        product.st_status ||
        "Não informado";

    /* ========================================================
       IMAGENS
       ======================================================== */

    function imageURL(value) {
        if (
            typeof value !== "string" ||
            !value.trim()
        ) {
            return "";
        }

        const path = value.trim();

        if (/^https?:\/\//i.test(path)) {
            return path;
        }

        const clean = path.replace(/^\/+/, "");

        return clean.startsWith("storage/")
            ? `http://127.0.0.1:8000/${clean}`
            : `${STORAGE}/${clean}`;
    }

    function productImages(product) {
        const gallery =
            product.imagens ||
            product.images ||
            [];

        const candidates = [
            product.ds_imagem ||
            product.imagem ||
            product.ds_foto ||
            product.foto ||
            product.url_imagem ||
            product.caminho_imagem,

            ...(
                Array.isArray(gallery)
                    ? gallery.map(item =>
                        typeof item === "string"
                            ? item
                            : item.ds_imagem ||
                              item.url_imagem ||
                              item.url ||
                              item.caminho_imagem
                    )
                    : []
            )
        ];

        return [
            ...new Set(
                candidates
                    .map(imageURL)
                    .filter(Boolean)
            )
        ];
    }

    function setImage(container, url) {
        const image = container.querySelector("img");

        const placeholder = container.querySelector(
            ".image-placeholder"
        );

        image.hidden = !url;
        placeholder.hidden = Boolean(url);

        image.onerror = () => {
            image.hidden = true;
            placeholder.hidden = false;
        };

        if (url) {
            image.src = url;

        } else {
            image.removeAttribute("src");
        }
    }

    /* ========================================================
       DATAS
       ======================================================== */

    function formatDate(value) {
        if (!value) {
            return "Não informada";
        }

        const date = new Date(
            String(value).replace(" ", "T")
        );

        if (Number.isNaN(date.getTime())) {
            return "Não informada";
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
        icon = "fa-box-open",
        error = false
    ) {
        $("productsList").innerHTML = `
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
       RENDERIZAR ANÚNCIOS
       ======================================================== */

    function render() {
        const term = $("searchInput").value
            .trim()
            .toLocaleLowerCase("pt-BR");

        const filtered = products.filter(product =>
            [
                productId(product),
                productName(product),
                ownerName(product),
                categoryName(product),
                statusName(product),
                conditions[product.st_condicao]
            ].some(value =>
                String(value ?? "")
                    .toLocaleLowerCase("pt-BR")
                    .includes(term)
            )
        );

        $("pageStatus").textContent =
            `${filtered.length.toLocaleString("pt-BR")} anúncio(s) ` +
            `${term ? "encontrado(s)" : "carregado(s)"}.`;

        $("productsList").replaceChildren();

        if (!filtered.length) {
            listState("Nenhum anúncio encontrado.");
            return;
        }

        filtered.forEach(product => {
            const suspended =
                product.st_status === "S";

            const id = escapeHTML(
                productId(product)
            );

            const badge = Object.hasOwn(
                statuses,
                product.st_status
            )
                ? `status-${product.st_status}`
                : "status-other";

            const card = document.createElement("article");

            card.className =
                `product-card${suspended ? " suspended" : ""}`;

            card.innerHTML = `
                <div class="product-image">

                    <img
                        alt="${escapeHTML(
                            productName(product)
                        )}"
                        hidden
                    >

                    <span class="image-placeholder">

                        <i
                            class="fa-solid fa-box-open"
                            aria-hidden="true"
                        ></i>

                        Sem imagem

                    </span>

                </div>

                <div class="product-content">

                    <div class="product-heading">

                        <h3 class="product-name">
                            ${escapeHTML(
                                productName(product)
                            )}
                        </h3>

                        <span class="product-badge ${badge}">
                            ${escapeHTML(
                                statusName(product)
                            )}
                        </span>

                    </div>

                    <p class="product-meta">

                        <i
                            class="fa-solid fa-user"
                            aria-hidden="true"
                        ></i>

                        ${escapeHTML(
                            ownerName(product)
                        )}

                    </p>

                    <p class="product-meta">

                        <i
                            class="fa-solid fa-layer-group"
                            aria-hidden="true"
                        ></i>

                        ${escapeHTML(
                            categoryName(product)
                        )}

                    </p>

                    <p class="product-meta">

                        <i
                            class="fa-solid fa-circle-info"
                            aria-hidden="true"
                        ></i>

                        ${escapeHTML(
                            conditions[product.st_condicao] ||
                            product.st_condicao ||
                            "Condição não informada"
                        )}

                    </p>

                    <div class="product-actions">

                        <button
                            type="button"
                            class="product-action action-view"
                            data-action="view"
                            data-id="${id}"
                        >
                            <i
                                class="fa-solid fa-eye"
                                aria-hidden="true"
                            ></i>

                            Visualizar detalhes
                        </button>

                        <button
                            type="button"
                            class="product-action ${
                                suspended
                                    ? "action-restore"
                                    : "action-status"
                            }"
                            data-action="status"
                            data-id="${id}"
                            data-status="${escapeHTML(
                                product.st_status
                            )}"
                            ${
                                product.st_status === "E"
                                    ? "disabled"
                                    : ""
                            }
                        >
                            <i
                                class="fa-solid ${
                                    suspended
                                        ? "fa-play"
                                        : "fa-circle-pause"
                                }"
                                aria-hidden="true"
                            ></i>

                            ${suspended ? "Reativar" : "Suspender"}
                        </button>

                        <button
                            type="button"
                            class="product-action action-delete"
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

                </div>
            `;

            setImage(
                card.querySelector(".product-image"),
                productImages(product)[0]
            );

            $("productsList").append(card);
        });
    }

    /* ========================================================
       CARREGAR ANÚNCIOS
       ======================================================== */

    async function loadProducts() {
        if (loading) return false;

        loading = true;

        $("refreshButton").disabled = true;

        $("productsList").setAttribute(
            "aria-busy",
            "true"
        );

        $("pageStatus").textContent =
            "Carregando anúncios...";

        listState(
            "Carregando anúncios...",
            "fa-spinner fa-spin"
        );

        try {
            const data = await request(
                "/admin/products",
                {
                    cache: "no-store"
                }
            );

            const records = Array.isArray(data)
                ? data
                : data.produtos ??
                  data.anuncios ??
                  data.data;

            if (!Array.isArray(records)) {
                throw new Error(
                    "A API retornou uma lista de anúncios em formato inesperado."
                );
            }

            products = records;

            render();

            return true;

        } catch (error) {
            products = [];

            listState(
                "Não foi possível carregar os anúncios. Clique em Atualizar para tentar novamente.",
                "fa-triangle-exclamation",
                true
            );

            $("pageStatus").textContent =
                error.message;

            return false;

        } finally {
            loading = false;

            $("refreshButton").disabled =
                actionBusy;

            $("productsList").setAttribute(
                "aria-busy",
                "false"
            );
        }
    }

    /* ========================================================
       PESQUISA E ATUALIZAÇÃO
       ======================================================== */

    $("searchInput").addEventListener("input", () => {
        if (!loading && !actionBusy) {
            render();
        }
    });

    $("searchForm").addEventListener("submit", event => {
        event.preventDefault();

        if (!loading && !actionBusy) {
            render();
        }
    });

    $("refreshButton").addEventListener("click", () => {
        if (!actionBusy) {
            loadProducts();
        }
    });

    /* ========================================================
       DETALHES E GALERIA
       ======================================================== */

    async function viewProduct(id) {
        const product = await request(
            `/admin/products/${encodeURIComponent(id)}/detalhes`
        );

        const fields = [
            ["ID", productId(product)],
            ["Nome da peça", productName(product)],
            ["Anunciante", ownerName(product)],

            [
                "E-mail",
                product.email_usuario ||
                product.usuario?.email ||
                product.user?.email ||
                "Não informado"
            ],

            ["Categoria", categoryName(product)],

            [
                "Condição",
                conditions[product.st_condicao] ||
                product.st_condicao ||
                "Não informada"
            ],

            ["Status", statusName(product)],

            [
                "Publicado em",
                formatDate(product.created_at)
            ],

            [
                "Descrição",
                product.ds_produto ||
                product.descricao ||
                "Sem descrição cadastrada.",
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
            dd.textContent = value ?? "Não informado";

            item.append(dt, dd);

            $("detailsData").append(item);
        });

        const images = productImages(product);

        const container =
            $("detailsPhoto").parentElement;

        setImage(container, images[0]);

        $("detailsGallery").replaceChildren();

        if (images.length > 1) {
            images.forEach((url, index) => {
                const button =
                    document.createElement("button");

                button.type = "button";
                button.className = "gallery-button";

                button.setAttribute(
                    "aria-label",
                    `Visualizar imagem ${index + 1}`
                );

                button.setAttribute(
                    "aria-pressed",
                    String(index === 0)
                );

                const image =
                    document.createElement("img");

                image.src = url;
                image.alt = "";

                button.append(image);

                button.addEventListener("click", () => {
                    setImage(container, url);

                    $("detailsGallery")
                        .querySelectorAll("button")
                        .forEach(item => {
                            item.setAttribute(
                                "aria-pressed",
                                String(item === button)
                            );
                        });
                });

                $("detailsGallery").append(button);
            });
        }

        openDialog("detailsDialog");
    }

    /* ========================================================
       SUSPENDER, REATIVAR E EXCLUIR
       ======================================================== */

    $("productsList").addEventListener(
        "click",
        async event => {
            const button = event.target.closest(
                "button[data-action]"
            );

            if (
                !button ||
                button.disabled ||
                loading ||
                actionBusy
            ) {
                return;
            }

            actionBusy = true;

            button.disabled = true;
            $("refreshButton").disabled = true;

            try {
                const {
                    id,
                    action,
                    status
                } = button.dataset;

                if (action === "view") {
                    await viewProduct(id);
                    return;
                }

                const restore = status === "S";

                const label = action === "delete"
                    ? "Excluir"
                    : restore
                        ? "Reativar"
                        : "Suspender";

                const product = products.find(item =>
                    String(productId(item)) === String(id)
                );

                const name = product
                    ? productName(product)
                    : "este anúncio";

                const message = action === "delete"
                    ? `Deseja excluir "${name}"? Esta ação não poderá ser desfeita.`
                    : restore
                        ? `Deseja disponibilizar "${name}" novamente?`
                        : `Deseja suspender "${name}"? O anúncio ficará indisponível para os usuários.`;

                const confirmed = await confirmAction(
                    `${label} anúncio`,
                    message,
                    label
                );

                if (!confirmed) return;

                const options = action === "delete"
                    ? {
                        method: "DELETE"
                    }
                    : {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            st_status: restore ? "A" : "S"
                        })
                    };

                const data = await request(
                    `/admin/products/${encodeURIComponent(id)}` +
                    `${action === "status" ? "/status" : ""}`,
                    options
                );

                const refreshed =
                    await loadProducts();

                if (refreshed) {
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

                $("refreshButton").disabled =
                    loading;
            }
        }
    );

    /* ========================================================
       SAÍDA DA CONTA
       ======================================================== */

    document.querySelectorAll("[data-logout]")
        .forEach(button => {
            button.addEventListener("click", () => {
                if (actionBusy) return;

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

    loadProducts();
})();