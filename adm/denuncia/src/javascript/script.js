/* ============================================================
   DENÚNCIAS — SCRIPT
   ============================================================ */

(() => {

    "use strict";


    /* ========================================================
       CONFIGURAÇÕES
       ======================================================== */

    const API =
        "http://127.0.0.1:8000/api";


    const BASE =
        "/admin/notificacoes";


    const LOGIN_URL =
        "../autenticação/index.html";


    const $ =
        id =>
            document.getElementById(id);


    let reports = [];

    let loading =
        false;


    let actionBusy =
        false;


    let currentReport =
        null;


    let imageController =
        null;


    let detailVersion =
        0;


    const imageURLs =
        new Set();


    /* ========================================================
       TOKEN
       ======================================================== */

    function obterToken() {

        return (
            localStorage.getItem(
                "adminToken"
            ) ||
            sessionStorage.getItem(
                "adminToken"
            )
        );

    }


    /* ========================================================
       SESSÃO
       ======================================================== */

    function limparSessao() {

        for (
            const storage of [
                localStorage,
                sessionStorage
            ]
        ) {

            [
                "adminToken",
                "adminNome",
                "adminId"
            ].forEach(
                chave => {

                    storage.removeItem(
                        chave
                    );

                }
            );

        }

    }


    const token =
        obterToken();


    if (
        !token
    ) {

        window.location.href =
            LOGIN_URL;


        return;

    }


    /* ========================================================
       UTILIDADES
       ======================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        ).replace(
            /[&<>"']/g,
            caractere => {

                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                }[caractere];

            }
        );

    }


    function dateText(
        value
    ) {

        if (
            !value
        ) {

            return "Não informada";

        }


        const data =
            new Date(
                String(value).replace(
                    " ",
                    "T"
                )
            );


        if (
            Number.isNaN(
                data.getTime()
            )
        ) {

            return "Não informada";

        }


        return data.toLocaleString(
            "pt-BR",
            {
                dateStyle:
                    "short",

                timeStyle:
                    "short"
            }
        );

    }


    /* ========================================================
       API
       ======================================================== */

    async function request(
        caminho,
        options = {},
        comoImagem = false
    ) {

        const controller =
            new AbortController();


        const cancelar =
            () =>
                controller.abort();


        if (
            options.signal
        ) {

            if (
                options.signal.aborted
            ) {

                controller.abort();

            }

            else {

                options.signal.addEventListener(
                    "abort",
                    cancelar,
                    {
                        once:
                            true
                    }
                );

            }

        }


        const timeout =
            setTimeout(
                () =>
                    controller.abort(),
                20000
            );


        try {

            const resposta =
                await fetch(
                    `${API}${caminho}`,
                    {
                        ...options,

                        signal:
                            controller.signal,

                        headers: {

                            Accept:
                                comoImagem
                                    ? "image/jpeg,image/png,image/webp,application/json"
                                    : "application/json",

                            Authorization:
                                `Bearer ${obterToken()}`,

                            ...options.headers
                        }
                    }
                );


            if (
                resposta.status === 401
            ) {

                limparSessao();


                window.location.href =
                    LOGIN_URL;


                throw new Error(
                    "Sua sessão expirou."
                );

            }


            if (
                resposta.status === 403
            ) {

                throw new Error(
                    "Somente administradores ativos podem acessar esta área."
                );

            }


            if (
                comoImagem &&
                resposta.ok
            ) {

                return await resposta.blob();

            }


            const dados =
                await resposta
                    .json()
                    .catch(
                        () => ({})
                    );


            if (
                !resposta.ok
            ) {

                const mensagem =
                    resposta.status === 422 &&
                    dados.errors

                        ? Object.values(
                            dados.errors
                        )
                            .flat()
                            .join("\n")

                        : dados.message ||
                          dados.error ||
                          `Não foi possível concluir a operação (HTTP ${resposta.status}).`;


                throw new Error(
                    mensagem
                );

            }


            return dados;

        }

        catch (erro) {

            if (
                erro.name ===
                "AbortError"
            ) {

                throw new Error(
                    "A API demorou para responder. Tente novamente."
                );

            }


            if (
                erro instanceof
                TypeError
            ) {

                throw new Error(
                    "Não foi possível acessar a API. Verifique se o Laravel está iniciado."
                );

            }


            throw erro;

        }

        finally {

            clearTimeout(
                timeout
            );


            options.signal
                ?.removeEventListener(
                    "abort",
                    cancelar
                );

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

    const adminName =
        $("adminName");


    if (
        adminName
    ) {

        adminName.textContent =
            localStorage.getItem(
                "adminNome"
            ) ||
            sessionStorage.getItem(
                "adminNome"
            ) ||
            "Administrador";

    }


    function fecharPerfil(
        devolverFoco = false
    ) {

        const menu =
            $("profileMenu");


        const botao =
            $("profileButton");


        if (
            !menu ||
            !botao
        ) {

            return;

        }


        menu.hidden =
            true;


        botao.setAttribute(
            "aria-expanded",
            "false"
        );


        if (
            devolverFoco
        ) {

            botao.focus();

        }

    }


    $("profileButton")
        ?.addEventListener(
            "click",
            () => {

                const menu =
                    $("profileMenu");


                const abrir =
                    menu.hidden;


                menu.hidden =
                    !abrir;


                $("profileButton")
                    .setAttribute(
                        "aria-expanded",
                        String(abrir)
                    );

            }
        );


    document.addEventListener(
        "click",
        evento => {

            const container =
                $("profileContainer");


            if (
                container &&
                !container.contains(
                    evento.target
                )
            ) {

                fecharPerfil();

            }

        }
    );


    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                    "Escape" &&
                !$("profileMenu")?.hidden
            ) {

                fecharPerfil(
                    true
                );

            }

        }
    );


    /* ========================================================
       TEMA
       ======================================================== */

    const themeSelect =
        $("themeSelect");


    if (
        themeSelect
    ) {

        themeSelect.value =
            document.documentElement
                .dataset.tema ===
                "escuro"

                ? "escuro"

                : "claro";


        themeSelect.addEventListener(
            "change",
            evento => {

                const tema =
                    evento.target.value ===
                    "escuro"

                        ? "escuro"

                        : "claro";


                document.documentElement
                    .dataset.tema =
                        tema;


                localStorage.setItem(
                    "adminTema",
                    tema
                );

            }
        );

    }


    /* ========================================================
       MODAIS
       ======================================================== */

    const dialogs =
        [
            ...document.querySelectorAll(
                "dialog"
            )
        ];


    function sincronizarScroll() {

        document.body.classList.toggle(
            "modal-open",
            dialogs.some(
                dialog =>
                    dialog.open
            )
        );

    }


    function abrirModal(
        id
    ) {

        const modal =
            $(id);


        if (
            modal &&
            !modal.open
        ) {

            modal.showModal();

        }


        sincronizarScroll();

    }


    dialogs.forEach(
        dialog => {

            dialog.addEventListener(
                "close",
                sincronizarScroll
            );


            dialog.addEventListener(
                "cancel",
                evento => {

                    if (
                        dialog.id ===
                            "logoutDialog" &&
                        actionBusy
                    ) {

                        evento.preventDefault();

                    }

                }
            );

        }
    );


    document
        .querySelectorAll(
            "[data-close]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        if (
                            botao.dataset.close ===
                                "logoutDialog" &&
                            actionBusy
                        ) {

                            return;

                        }


                        const modal =
                            $(
                                botao.dataset
                                    .close
                            );


                        if (
                            modal?.open
                        ) {

                            modal.close();

                        }

                    }
                );

            }
        );


    /* ========================================================
       ESTADO DA TABELA
       ======================================================== */

    function estadoTabela(
        mensagem
    ) {

        $("reportsList").innerHTML =
            `
                <tr>
                    <td
                        colspan="6"
                        class="table-state"
                    >
                        ${escapeHTML(mensagem)}
                    </td>
                </tr>
            `;

    }


    /* ========================================================
       RENDERIZAR
       ======================================================== */

    function renderizar() {

        const termo =
            $("searchInput")
                .value
                .trim()
                .toLocaleLowerCase(
                    "pt-BR"
                );


        const filtro =
            $("readFilter")
                .value;


        const naoLidas =
            reports.filter(
                item =>
                    item.lida !== true
            ).length;


        $("countTotal").textContent =
            reports.length
                .toLocaleString(
                    "pt-BR"
                );


        $("countUnread").textContent =
            naoLidas
                .toLocaleString(
                    "pt-BR"
                );


        $("countRead").textContent =
            (
                reports.length -
                naoLidas
            ).toLocaleString(
                "pt-BR"
            );


        const filtradas =
            [...reports]

                .sort(
                    (a, b) =>
                        Number(
                            a.lida === true
                        ) -
                        Number(
                            b.lida === true
                        )
                )

                .filter(
                    item => {

                        const correspondeLeitura =
                            filtro === "all" ||

                            (
                                filtro === "read"

                                    ? item.lida ===
                                      true

                                    : item.lida !==
                                      true
                            );


                        const correspondePesquisa =
                            [
                                item.id,
                                item.usuario_denunciado,
                                item.motivo,
                                item.descricao,
                                item.titulo
                            ].some(
                                valor =>
                                    String(
                                        valor ?? ""
                                    )
                                        .toLocaleLowerCase(
                                            "pt-BR"
                                        )
                                        .includes(
                                            termo
                                        )
                            );


                        return (
                            correspondeLeitura &&
                            correspondePesquisa
                        );

                    }
                );


        $("pageStatus").textContent =
            `${filtradas.length.toLocaleString("pt-BR")} denúncia(s) exibida(s) de ${reports.length.toLocaleString("pt-BR")} carregada(s).`;


        $("reportsList")
            .replaceChildren();


        if (
            !filtradas.length
        ) {

            estadoTabela(
                "Nenhuma denúncia encontrada."
            );


            return;

        }


        filtradas.forEach(
            item => {

                const linha =
                    document.createElement(
                        "tr"
                    );


                if (
                    item.lida !== true
                ) {

                    linha.className =
                        "unread-row";

                }


                const id =
                    escapeHTML(
                        item.id
                    );


                linha.innerHTML =
                    `
                        <td class="report-id">
                            #${id}
                        </td>

                        <td class="report-user">
                            ${escapeHTML(
                                item.usuario_denunciado ||
                                "Usuário indisponível"
                            )}
                        </td>

                        <td class="report-reason">
                            ${escapeHTML(
                                item.motivo ||
                                "Não informado"
                            )}
                        </td>

                        <td class="report-date">
                            ${escapeHTML(
                                dateText(
                                    item.data
                                )
                            )}
                        </td>

                        <td>

                            <span
                                class="read-badge ${
                                    item.lida === true

                                        ? "badge-read"

                                        : "badge-unread"
                                }"
                            >
                                ${
                                    item.lida === true

                                        ? "Lida"

                                        : "Não lida"
                                }
                            </span>

                        </td>

                        <td>

                            <div class="row-actions">

                                <button
                                    type="button"
                                    class="button button-primary"
                                    data-action="view"
                                    data-id="${id}"
                                >
                                    Detalhes
                                </button>

                                ${
                                    item.lida === true

                                        ? ""

                                        : `
                                            <button
                                                type="button"
                                                class="button button-secondary"
                                                data-action="read"
                                                data-id="${id}"
                                            >
                                                Marcar lida
                                            </button>
                                        `
                                }

                            </div>

                        </td>
                    `;


                $("reportsList")
                    .append(
                        linha
                    );

            }
        );

    }


    /* ========================================================
       CARREGAR DENÚNCIAS
       ======================================================== */

    async function carregarDenuncias() {

        if (
            loading ||
            actionBusy
        ) {

            return;

        }


        loading =
            true;


        $("refreshButton").disabled =
            true;


        $("reportsList")
            .setAttribute(
                "aria-busy",
                "true"
            );


        $("pageStatus").textContent =
            "Carregando denúncias...";


        estadoTabela(
            "Carregando denúncias..."
        );


        try {

            const dados =
                await request(
                    BASE,
                    {
                        cache:
                            "no-store"
                    }
                );


            if (
                !Array.isArray(
                    dados.notificacoes
                )
            ) {

                throw new Error(
                    "A API retornou denúncias em formato inesperado."
                );

            }


            reports =
                dados.notificacoes;


            renderizar();

        }

        catch (erro) {

            reports =
                [];


            [
                "countTotal",
                "countUnread",
                "countRead"
            ].forEach(
                id => {

                    $(id).textContent =
                        "—";

                }
            );


            estadoTabela(
                "Não foi possível carregar as denúncias. Clique em Atualizar para tentar novamente."
            );


            $("pageStatus").textContent =
                erro.message;

        }

        finally {

            loading =
                false;


            $("refreshButton").disabled =
                false;


            $("reportsList")
                .setAttribute(
                    "aria-busy",
                    "false"
                );

        }

    }


    /* ========================================================
       FILTROS
       ======================================================== */

    $("searchInput")
        .addEventListener(
            "input",
            () => {

                if (
                    !loading &&
                    !actionBusy
                ) {

                    renderizar();

                }

            }
        );


    $("readFilter")
        .addEventListener(
            "change",
            () => {

                if (
                    !loading &&
                    !actionBusy
                ) {

                    renderizar();

                }

            }
        );


    $("searchForm")
        .addEventListener(
            "submit",
            evento => {

                evento.preventDefault();


                if (
                    !loading &&
                    !actionBusy
                ) {

                    renderizar();

                }

            }
        );


    $("refreshButton")
        .addEventListener(
            "click",
            carregarDenuncias
        );


    /* ========================================================
       EVIDÊNCIAS
       ======================================================== */

    function limparImagens() {

        detailVersion++;


        imageController?.abort();


        imageController =
            null;


        $("previewImage")
            .removeAttribute(
                "src"
            );


        $("imagePreview").hidden =
            true;


        $("evidenceGrid")
            .replaceChildren();


        imageURLs.forEach(
            url => {

                URL.revokeObjectURL(
                    url
                );

            }
        );


        imageURLs.clear();

    }


    $("detailsDialog")
        .addEventListener(
            "close",
            () => {

                limparImagens();


                currentReport =
                    null;

            }
        );


    $("closePreview")
        .addEventListener(
            "click",
            () => {

                $("imagePreview").hidden =
                    true;


                $("previewImage")
                    .removeAttribute(
                        "src"
                    );

            }
        );


    async function carregarImagens(
        report,
        versao,
        signal
    ) {

        if (
            !report.imagens.length
        ) {

            $("imagesStatus").textContent =
                "Nenhuma imagem foi anexada.";


            return;

        }


        $("imagesStatus").textContent =
            "Carregando evidências...";


        let carregadas =
            0;


        let falhas =
            0;


        for (
            const item of report.imagens
        ) {

            if (
                signal.aborted ||
                versao !== detailVersion
            ) {

                return;

            }


            try {

                const ordem =
                    Number(
                        item.ordem
                    );


                if (
                    !Number.isInteger(
                        ordem
                    ) ||
                    ordem < 1
                ) {

                    throw new Error(
                        "Ordem de imagem inválida."
                    );

                }


                const blob =
                    await request(
                        `${BASE}/${encodeURIComponent(report.id)}/imagens/${ordem}`,
                        {
                            signal
                        },
                        true
                    );


                if (
                    signal.aborted ||
                    versao !== detailVersion ||
                    !$("detailsDialog").open
                ) {

                    return;

                }


                const url =
                    URL.createObjectURL(
                        blob
                    );


                imageURLs.add(
                    url
                );


                const botao =
                    document.createElement(
                        "button"
                    );


                botao.type =
                    "button";


                botao.className =
                    "evidence-button";


                const imagem =
                    document.createElement(
                        "img"
                    );


                imagem.src =
                    url;


                imagem.alt =
                    `Evidência ${ordem} da denúncia`;


                const legenda =
                    document.createElement(
                        "span"
                    );


                legenda.textContent =
                    `Imagem ${ordem} · Ampliar`;


                botao.append(
                    imagem,
                    legenda
                );


                botao.addEventListener(
                    "click",
                    () => {

                        $("previewImage").src =
                            url;


                        $("imagePreview").hidden =
                            false;


                        $("closePreview")
                            .focus();


                        $("imagePreview")
                            .scrollIntoView(
                                {
                                    block:
                                        "nearest"
                                }
                            );

                    }
                );


                $("evidenceGrid")
                    .append(
                        botao
                    );


                carregadas++;

            }

            catch (erro) {

                if (
                    signal.aborted ||
                    versao !== detailVersion
                ) {

                    return;

                }


                falhas++;

            }

        }


        if (
            versao ===
                detailVersion &&
            $("detailsDialog").open
        ) {

            $("imagesStatus").textContent =
                falhas

                    ? `${carregadas} evidência(s) carregada(s). ${falhas} arquivo(s) não puderam ser carregados.`

                    : `${carregadas} evidência(s) carregada(s). Clique para ampliar.`;

        }

    }


    /* ========================================================
       BOTÃO DE LEITURA
       ======================================================== */

    function atualizarBotaoLeitura() {

        const lida =
            currentReport?.lida ===
            true;


        $("readNotice").textContent =
            lida

                ? "Leitura registrada."

                : "Denúncia ainda não lida.";


        $("markReadButton").disabled =
            lida ||
            actionBusy ||
            !currentReport;


        $("markReadButton").textContent =
            lida

                ? "Já lida"

                : "Marcar como lida";

    }


    /* ========================================================
       DETALHES
       ======================================================== */

    async function visualizarDenuncia(
        id
    ) {

        $("pageStatus").textContent =
            "Carregando detalhes da denúncia...";


        const report =
            await request(
                `${BASE}/${encodeURIComponent(id)}`
            );


        if (
            report.id == null ||
            !Array.isArray(
                report.imagens
            )
        ) {

            throw new Error(
                "Os detalhes da denúncia vieram em formato inesperado."
            );

        }


        limparImagens();


        currentReport =
            report;


        $("detailsTitle").textContent =
            `Denúncia #${report.id}`;


        const campos =
            [
                [
                    "ID",
                    `#${report.id}`
                ],

                [
                    "Usuário denunciado",
                    report.usuario_denunciado ||
                    "Usuário indisponível"
                ],

                [
                    "Motivo",
                    report.motivo ||
                    "Não informado"
                ],

                [
                    "Data",
                    dateText(
                        report.data
                    )
                ],

                [
                    "Status da denúncia",
                    report.status_denuncia ===
                    "P"

                        ? "Pendente"

                        : report.status_denuncia ||
                          "Não informado"
                ],

                [
                    "Leitura",
                    report.lida === true

                        ? "Lida"

                        : "Não lida"
                ]
            ];


        $("detailsData")
            .replaceChildren();


        campos.forEach(
            ([label, valor]) => {

                const container =
                    document.createElement(
                        "div"
                    );


                const dt =
                    document.createElement(
                        "dt"
                    );


                const dd =
                    document.createElement(
                        "dd"
                    );


                dt.textContent =
                    label;


                dd.textContent =
                    valor;


                container.append(
                    dt,
                    dd
                );


                $("detailsData")
                    .append(
                        container
                    );

            }
        );


        $("reportDescription").textContent =
            report.descricao ||
            "Nenhuma descrição informada.";


        $("detailsStatus").textContent =
            "";


        abrirModal(
            "detailsDialog"
        );


        atualizarBotaoLeitura();


        $("pageStatus").textContent =
            `Detalhes da denúncia #${report.id} carregados.`;


        imageController =
            new AbortController();


        void carregarImagens(
            report,
            detailVersion,
            imageController.signal
        );

    }


    /* ========================================================
       MARCAR COMO LIDA
       ======================================================== */

    async function marcarComoLida(
        id
    ) {

        const resultado =
            await request(
                `${BASE}/${encodeURIComponent(id)}/lida`,
                {
                    method:
                        "PUT"
                }
            );


        if (
            resultado.lida !==
            true
        ) {

            throw new Error(
                "A API não confirmou a leitura. Atualize os dados para conferir."
            );

        }


        reports =
            reports.map(
                item => {

                    return String(
                        item.id
                    ) ===
                    String(id)

                        ? {
                            ...item,
                            lida:
                                true
                        }

                        : item;

                }
            );


        if (
            currentReport &&
            String(
                currentReport.id
            ) ===
            String(id)
        ) {

            currentReport.lida =
                true;


            $("detailsData")
                .querySelectorAll(
                    "div"
                )
                .forEach(
                    item => {

                        const titulo =
                            item.querySelector(
                                "dt"
                            );


                        if (
                            titulo?.textContent ===
                            "Leitura"
                        ) {

                            item.querySelector(
                                "dd"
                            ).textContent =
                                "Lida";

                        }

                    }
                );

        }


        renderizar();


        $("pageStatus").textContent =
            "Denúncia marcada como lida.";

    }


    /* ========================================================
       EVENTOS DA TABELA
       ======================================================== */

    $("reportsList")
        .addEventListener(
            "click",
            async evento => {

                const botao =
                    evento.target.closest(
                        "button[data-action]"
                    );


                if (
                    !botao ||
                    loading ||
                    actionBusy
                ) {

                    return;

                }


                actionBusy =
                    true;


                botao.disabled =
                    true;


                $("refreshButton").disabled =
                    true;


                try {

                    if (
                        botao.dataset.action ===
                        "view"
                    ) {

                        await visualizarDenuncia(
                            botao.dataset.id
                        );

                    }

                    else {

                        await marcarComoLida(
                            botao.dataset.id
                        );

                    }

                }

                catch (erro) {

                    $("pageStatus").textContent =
                        erro.message;

                }

                finally {

                    actionBusy =
                        false;


                    if (
                        botao.isConnected
                    ) {

                        botao.disabled =
                            false;

                    }


                    $("refreshButton").disabled =
                        false;


                    if (
                        currentReport
                    ) {

                        atualizarBotaoLeitura();

                    }

                }

            }
        );


    /* ========================================================
       MARCAR COMO LIDA NO MODAL
       ======================================================== */

    $("markReadButton")
        .addEventListener(
            "click",
            async () => {

                if (
                    !currentReport ||
                    currentReport.lida ===
                        true ||
                    actionBusy
                ) {

                    return;

                }


                actionBusy =
                    true;


                atualizarBotaoLeitura();


                $("detailsStatus").textContent =
                    "Registrando leitura...";


                try {

                    await marcarComoLida(
                        currentReport.id
                    );


                    $("detailsStatus").textContent =
                        "Leitura registrada com sucesso.";

                }

                catch (erro) {

                    $("detailsStatus").textContent =
                        erro.message;

                }

                finally {

                    actionBusy =
                        false;


                    atualizarBotaoLeitura();

                }

            }
        );


    /* ========================================================
       ABRIR MODAL DE SAÍDA
       ======================================================== */

    document
        .querySelectorAll(
            "[data-logout]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        if (
                            actionBusy
                        ) {

                            return;

                        }


                        fecharPerfil();


                        $("logoutStatus").textContent =
                            "";


                        abrirModal(
                            "logoutDialog"
                        );

                    }
                );

            }
        );


    /* ========================================================
       CONFIRMAR SAÍDA
       ======================================================== */

    $("logoutConfirm")
        .addEventListener(
            "click",
            async () => {

                if (
                    actionBusy
                ) {

                    return;

                }


                actionBusy =
                    true;


                $("logoutConfirm").disabled =
                    true;


                $("logoutStatus").textContent =
                    "Encerrando sessão...";


                try {

                    await request(
                        "/logout",
                        {
                            method:
                                "POST"
                        }
                    );


                    limparSessao();


                    window.location.href =
                        LOGIN_URL;

                }

                catch (erro) {

                    $("logoutStatus").textContent =
                        erro.message;

                }

                finally {

                    actionBusy =
                        false;


                    $("logoutConfirm").disabled =
                        false;

                }

            }
        );


    /* ========================================================
       INICIALIZAÇÃO
       ======================================================== */

    carregarDenuncias();

})();