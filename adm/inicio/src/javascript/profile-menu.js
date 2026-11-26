/* ============================================================
   MENU DO PERFIL + LOGOUT PADRONIZADO
   Peça por Peça — Administração
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";


        /* ========================================================
           CONFIGURAÇÕES
           ======================================================== */

        const API =
            "http://127.0.0.1:8000/api";


        const LOGIN_URL =
            "../autenticação/index.html";


        /* ========================================================
           ELEMENTOS DO PERFIL
           Compatível com as páginas organizadas
           ======================================================== */

        const container =
            document.querySelector(
                ".profile-menu-container"
            ) ||
            document.getElementById(
                "profileContainer"
            );


        const botaoPerfil =
            document.getElementById(
                "btn-menu-perfil"
            ) ||
            document.getElementById(
                "profileButton"
            );


        const menuPerfil =
            document.getElementById(
                "menu-perfil"
            ) ||
            document.getElementById(
                "profileMenu"
            );


        const botaoAparencia =
            document.getElementById(
                "btn-aparencia"
            );


        const opcoesAparencia =
            document.getElementById(
                "opcoes-aparencia"
            );


        const seletorTema =
            document.getElementById(
                "tema-admin"
            ) ||
            document.getElementById(
                "themeSelect"
            );


        const nomeAdmin =
            document.getElementById(
                "nome-admin-topo"
            ) ||
            document.getElementById(
                "adminName"
            );


        /* ========================================================
           NOME DO ADMINISTRADOR
           ======================================================== */

        const nomeSalvo =
            localStorage.getItem(
                "adminNome"
            ) ||
            sessionStorage.getItem(
                "adminNome"
            ) ||
            "Administrador";


        if (
            nomeAdmin
        ) {

            nomeAdmin.textContent =
                nomeSalvo;

        }


        /* ========================================================
           MENU DO PERFIL

           Início e Dashboard utilizam:
           .profile-menu-container
           #btn-menu-perfil
           #menu-perfil

           A página Denúncias organizada possui a própria lógica
           em script.js. Por isso só configuramos aqui quando
           usamos o padrão principal.
           ======================================================== */

        if (
            container &&
            botaoPerfil &&
            menuPerfil &&
            botaoPerfil.id ===
                "btn-menu-perfil"
        ) {

            function fecharMenuPerfil(
                devolverFoco = false
            ) {

                menuPerfil.hidden =
                    true;


                botaoPerfil.setAttribute(
                    "aria-expanded",
                    "false"
                );


                if (
                    devolverFoco
                ) {

                    botaoPerfil.focus();

                }

            }


            botaoPerfil.addEventListener(
                "click",
                function () {

                    const abrir =
                        menuPerfil.hidden;


                    menuPerfil.hidden =
                        !abrir;


                    botaoPerfil.setAttribute(
                        "aria-expanded",
                        String(
                            abrir
                        )
                    );

                }
            );


            document.addEventListener(
                "click",
                function (evento) {

                    if (
                        !container.contains(
                            evento.target
                        )
                    ) {

                        fecharMenuPerfil();

                    }

                }
            );


            container.addEventListener(
                "focusout",
                function (evento) {

                    if (
                        !container.contains(
                            evento.relatedTarget
                        )
                    ) {

                        fecharMenuPerfil();

                    }

                }
            );


            document.addEventListener(
                "keydown",
                function (evento) {

                    if (
                        evento.key ===
                            "Escape" &&
                        !menuPerfil.hidden
                    ) {

                        fecharMenuPerfil(
                            true
                        );

                    }

                }
            );

        }


        /* ========================================================
           APARÊNCIA
           ======================================================== */

        function aplicarTema(
            tema
        ) {

            const temaValido =
                tema === "escuro"
                    ? "escuro"
                    : "claro";


            document.documentElement
                .dataset.tema =
                    temaValido;


            if (
                seletorTema
            ) {

                seletorTema.value =
                    temaValido;

            }

        }


        aplicarTema(
            localStorage.getItem(
                "adminTema"
            )
        );


        if (
            botaoAparencia &&
            opcoesAparencia
        ) {

            botaoAparencia.addEventListener(
                "click",
                function () {

                    const abrir =
                        opcoesAparencia.hidden;


                    opcoesAparencia.hidden =
                        !abrir;


                    botaoAparencia.setAttribute(
                        "aria-expanded",
                        String(
                            abrir
                        )
                    );

                }
            );

        }


        if (
            seletorTema &&
            seletorTema.id ===
                "tema-admin"
        ) {

            seletorTema.addEventListener(
                "change",
                function () {

                    const tema =
                        seletorTema.value ===
                        "escuro"

                            ? "escuro"

                            : "claro";


                    aplicarTema(
                        tema
                    );


                    localStorage.setItem(
                        "adminTema",
                        tema
                    );

                }
            );

        }


        /* ========================================================
           ESTILO DO MODAL DE LOGOUT
           Criado automaticamente para todas as páginas
           ======================================================== */

        function criarEstiloModalLogout() {

            if (
                document.getElementById(
                    "logout-modal-style"
                )
            ) {

                return;

            }


            const style =
                document.createElement(
                    "style"
                );


            style.id =
                "logout-modal-style";


            style.textContent =
                `
                    body.logout-modal-open {
                        overflow: hidden;
                    }


                    .logout-confirm-modal[hidden] {
                        display: none !important;
                    }


                    .logout-confirm-modal {
                        position: fixed;

                        inset: 0;

                        display: flex;
                        align-items: center;
                        justify-content: center;

                        padding: 20px;

                        background:
                            rgba(7, 22, 33, 0.58);

                        backdrop-filter:
                            blur(3px);

                        z-index: 99999;
                    }


                    .logout-confirm-card {
                        position: relative;

                        width:
                            min(
                                420px,
                                100%
                            );

                        padding:
                            31px
                            28px
                            28px;

                        border:
                            1px solid
                            #e0eaf2;

                        border-radius:
                            18px;

                        background:
                            #ffffff;

                        color:
                            #163b56;

                        text-align:
                            center;

                        box-shadow:
                            0
                            25px
                            70px
                            rgba(
                                0,
                                30,
                                48,
                                0.28
                            );

                        animation:
                            logoutModalEntrada
                            0.18s
                            ease;
                    }


                    @keyframes logoutModalEntrada {

                        from {
                            opacity: 0;

                            transform:
                                translateY(
                                    8px
                                )
                                scale(
                                    0.98
                                );
                        }

                        to {
                            opacity: 1;

                            transform:
                                translateY(
                                    0
                                )
                                scale(
                                    1
                                );
                        }

                    }


                    .logout-confirm-close {
                        position:
                            absolute;

                        top:
                            12px;

                        right:
                            12px;

                        width:
                            34px;

                        height:
                            34px;

                        display:
                            flex;

                        align-items:
                            center;

                        justify-content:
                            center;

                        padding:
                            0;

                        border:
                            none;

                        border-radius:
                            9px;

                        background:
                            transparent;

                        color:
                            #8295a4;

                        font-size:
                            15px;

                        cursor:
                            pointer;
                    }


                    .logout-confirm-close:hover {
                        background:
                            #f1f6fa;

                        color:
                            #163b56;
                    }


                    .logout-confirm-icon {
                        width:
                            60px;

                        height:
                            60px;

                        display:
                            flex;

                        align-items:
                            center;

                        justify-content:
                            center;

                        margin:
                            0
                            auto
                            18px;

                        border-radius:
                            18px;

                        background:
                            #fff1ef;

                        color:
                            #c9564c;

                        font-size:
                            23px;
                    }


                    .logout-confirm-card h2 {
                        margin:
                            0;

                        color:
                            #163b56;

                        font-family:
                            "Poppins",
                            sans-serif;

                        font-size:
                            20px;

                        font-weight:
                            700;
                    }


                    .logout-confirm-description {
                        max-width:
                            320px;

                        margin:
                            10px
                            auto
                            0;

                        color:
                            #71879a;

                        font-family:
                            "Poppins",
                            sans-serif;

                        font-size:
                            12px;

                        line-height:
                            1.7;
                    }


                    .logout-confirm-status {
                        min-height:
                            18px;

                        margin:
                            12px
                            0
                            0;

                        color:
                            #71879a;

                        font-family:
                            "Poppins",
                            sans-serif;

                        font-size:
                            10px;

                        line-height:
                            1.5;
                    }


                    .logout-confirm-actions {
                        display:
                            flex;

                        justify-content:
                            center;

                        gap:
                            10px;

                        margin-top:
                            22px;
                    }


                    .logout-confirm-button {
                        min-width:
                            120px;

                        min-height:
                            42px;

                        display:
                            inline-flex;

                        align-items:
                            center;

                        justify-content:
                            center;

                        gap:
                            8px;

                        padding:
                            10px
                            16px;

                        border-radius:
                            10px;

                        font-family:
                            "Poppins",
                            sans-serif;

                        font-size:
                            11px;

                        font-weight:
                            600;

                        cursor:
                            pointer;

                        transition:
                            background-color
                            0.2s
                            ease,
                            border-color
                            0.2s
                            ease,
                            transform
                            0.2s
                            ease;
                    }


                    .logout-confirm-button:hover:not(:disabled) {
                        transform:
                            translateY(
                                -1px
                            );
                    }


                    .logout-confirm-button:disabled {
                        opacity:
                            0.65;

                        cursor:
                            wait;

                        transform:
                            none;
                    }


                    .logout-confirm-cancel {
                        border:
                            1px solid
                            #dce7ef;

                        background:
                            #ffffff;

                        color:
                            #526b7f;
                    }


                    .logout-confirm-cancel:hover:not(:disabled) {
                        background:
                            #f3f8fb;
                    }


                    .logout-confirm-submit {
                        border:
                            1px solid
                            #c9564c;

                        background:
                            #c9564c;

                        color:
                            #ffffff;
                    }


                    .logout-confirm-submit:hover:not(:disabled) {
                        border-color:
                            #ad4038;

                        background:
                            #ad4038;
                    }


                    html[data-tema="escuro"]
                    .logout-confirm-modal {
                        background:
                            rgba(
                                3,
                                13,
                                21,
                                0.74
                            );
                    }


                    html[data-tema="escuro"]
                    .logout-confirm-card {
                        border-color:
                            #30495e;

                        background:
                            #192d3e;

                        color:
                            #e0efff;

                        box-shadow:
                            0
                            25px
                            70px
                            rgba(
                                0,
                                0,
                                0,
                                0.38
                            );
                    }


                    html[data-tema="escuro"]
                    .logout-confirm-card h2 {
                        color:
                            #e0efff;
                    }


                    html[data-tema="escuro"]
                    .logout-confirm-description,

                    html[data-tema="escuro"]
                    .logout-confirm-status {
                        color:
                            #afc5d8;
                    }


                    html[data-tema="escuro"]
                    .logout-confirm-icon {
                        background:
                            rgba(
                                201,
                                86,
                                76,
                                0.14
                            );

                        color:
                            #ffaaa0;
                    }


                    html[data-tema="escuro"]
                    .logout-confirm-close {
                        color:
                            #9fb4c4;
                    }


                    html[data-tema="escuro"]
                    .logout-confirm-close:hover {
                        background:
                            #243f54;

                        color:
                            #ffffff;
                    }


                    html[data-tema="escuro"]
                    .logout-confirm-cancel {
                        border-color:
                            #405d73;

                        background:
                            #192d3e;

                        color:
                            #d8e8f4;
                    }


                    html[data-tema="escuro"]
                    .logout-confirm-cancel:hover:not(:disabled) {
                        background:
                            #243f54;
                    }


                    @media (
                        max-width:
                        480px
                    ) {

                        .logout-confirm-card {
                            padding:
                                29px
                                20px
                                22px;
                        }


                        .logout-confirm-actions {
                            flex-direction:
                                column-reverse;
                        }


                        .logout-confirm-button {
                            width:
                                100%;
                        }

                    }


                    @media (
                        prefers-reduced-motion:
                        reduce
                    ) {

                        .logout-confirm-card {
                            animation:
                                none;
                        }

                    }
                `;


            document.head.appendChild(
                style
            );

        }


        /* ========================================================
           CRIAR MODAL
           ======================================================== */

        function criarModalLogout() {

            let modal =
                document.getElementById(
                    "logout-confirm-modal"
                );


            if (
                modal
            ) {

                return modal;

            }


            modal =
                document.createElement(
                    "div"
                );


            modal.id =
                "logout-confirm-modal";


            modal.className =
                "logout-confirm-modal";


            modal.hidden =
                true;


            modal.setAttribute(
                "role",
                "dialog"
            );


            modal.setAttribute(
                "aria-modal",
                "true"
            );


            modal.setAttribute(
                "aria-labelledby",
                "logout-confirm-title"
            );


            modal.innerHTML =
                `
                    <div
                        class="logout-confirm-card"
                        role="document"
                    >

                        <button
                            type="button"
                            class="logout-confirm-close"
                            id="logout-confirm-close"
                            aria-label="Fechar"
                        >
                            <i
                                class="fa-solid fa-xmark"
                                aria-hidden="true"
                            ></i>
                        </button>


                        <div
                            class="logout-confirm-icon"
                            aria-hidden="true"
                        >
                            <i
                                class="fa-solid fa-arrow-right-from-bracket"
                            ></i>
                        </div>


                        <h2
                            id="logout-confirm-title"
                        >
                            Deseja sair?
                        </h2>


                        <p
                            class="logout-confirm-description"
                        >
                            Você precisará entrar novamente
                            para acessar o painel administrativo.
                        </p>


                        <p
                            class="logout-confirm-status"
                            id="logout-confirm-status"
                            role="status"
                            aria-live="polite"
                        ></p>


                        <div
                            class="logout-confirm-actions"
                        >

                            <button
                                type="button"
                                class="
                                    logout-confirm-button
                                    logout-confirm-cancel
                                "
                                id="logout-confirm-cancel"
                            >
                                Cancelar
                            </button>


                            <button
                                type="button"
                                class="
                                    logout-confirm-button
                                    logout-confirm-submit
                                "
                                id="logout-confirm-submit"
                            >

                                <i
                                    class="fa-solid fa-arrow-right-from-bracket"
                                    aria-hidden="true"
                                ></i>

                                Sim, sair

                            </button>

                        </div>

                    </div>
                `;


            document.body.appendChild(
                modal
            );


            return modal;

        }


        criarEstiloModalLogout();


        const modalLogout =
            criarModalLogout();


        const fecharLogout =
            document.getElementById(
                "logout-confirm-close"
            );


        const cancelarLogout =
            document.getElementById(
                "logout-confirm-cancel"
            );


        const confirmarLogout =
            document.getElementById(
                "logout-confirm-submit"
            );


        const statusLogout =
            document.getElementById(
                "logout-confirm-status"
            );


        let logoutEmAndamento =
            false;


        let ultimoBotaoLogout =
            null;


        /* ========================================================
           ABRIR MODAL
           ======================================================== */

        function abrirModalLogout(
            botaoOrigem = null
        ) {

            if (
                logoutEmAndamento
            ) {

                return;

            }


            ultimoBotaoLogout =
                botaoOrigem;


            if (
                statusLogout
            ) {

                statusLogout.textContent =
                    "";

            }


            modalLogout.hidden =
                false;


            document.body.classList.add(
                "logout-modal-open"
            );


            requestAnimationFrame(
                function () {

                    cancelarLogout?.focus();

                }
            );

        }


        /* ========================================================
           FECHAR MODAL
           ======================================================== */

        function fecharModalLogout() {

            if (
                logoutEmAndamento
            ) {

                return;

            }


            modalLogout.hidden =
                true;


            document.body.classList.remove(
                "logout-modal-open"
            );


            if (
                ultimoBotaoLogout &&
                document.contains(
                    ultimoBotaoLogout
                )
            ) {

                ultimoBotaoLogout.focus();

            }


            ultimoBotaoLogout =
                null;

        }


        /* ========================================================
           CAPTURAR TODOS OS BOTÕES "SAIR"

           O capture:true é proposital.
           Ele impede que códigos antigos façam logout direto
           antes do modal aparecer.
           ======================================================== */

        document.addEventListener(
            "click",
            function (evento) {

                const botaoLogout =
                    evento.target.closest(
                        `
                            #btn-sair-perfil,
                            #btn-sair-sidebar,
                            [data-logout]
                        `
                    );


                if (
                    !botaoLogout
                ) {

                    return;

                }


                /*
                 * Não interceptar os próprios botões
                 * internos do modal.
                 */

                if (
                    modalLogout.contains(
                        botaoLogout
                    )
                ) {

                    return;

                }


                evento.preventDefault();


                evento.stopPropagation();


                evento.stopImmediatePropagation();


                /*
                 * Fecha o menu do perfil visualmente.
                 */

                if (
                    menuPerfil
                ) {

                    menuPerfil.hidden =
                        true;

                }


                if (
                    botaoPerfil
                ) {

                    botaoPerfil.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }


                abrirModalLogout(
                    botaoLogout
                );

            },
            true
        );


        /* ========================================================
           CANCELAR
           ======================================================== */

        fecharLogout?.addEventListener(
            "click",
            fecharModalLogout
        );


        cancelarLogout?.addEventListener(
            "click",
            fecharModalLogout
        );


        /* ========================================================
           CLICAR FORA
           ======================================================== */

        modalLogout.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target ===
                    modalLogout
                ) {

                    fecharModalLogout();

                }

            }
        );


        /* ========================================================
           ESC
           ======================================================== */

        document.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key ===
                        "Escape" &&
                    !modalLogout.hidden
                ) {

                    fecharModalLogout();

                }

            }
        );


        /* ========================================================
           LIMPAR SESSÃO
           ======================================================== */

        function limparSessao() {

            const chaves =
                [
                    "adminToken",
                    "adminId",
                    "adminNome"
                ];


            chaves.forEach(
                function (chave) {

                    localStorage.removeItem(
                        chave
                    );


                    sessionStorage.removeItem(
                        chave
                    );

                }
            );

        }


        /* ========================================================
           CONFIRMAR LOGOUT
           ======================================================== */

        confirmarLogout?.addEventListener(
            "click",
            function () {

                if (
                    logoutEmAndamento
                ) {

                    return;

                }


                logoutEmAndamento =
                    true;


                confirmarLogout.disabled =
                    true;


                cancelarLogout.disabled =
                    true;


                fecharLogout.disabled =
                    true;


                statusLogout.textContent =
                    "Encerrando sessão...";


                const token =
                    localStorage.getItem(
                        "adminToken"
                    ) ||
                    sessionStorage.getItem(
                        "adminToken"
                    );


                /*
                 * Envia o logout para a API.
                 *
                 * keepalive permite que o navegador
                 * tente concluir a requisição mesmo
                 * depois do redirecionamento.
                 */

                if (
                    token
                ) {

                    fetch(
                        `${API}/logout`,
                        {
                            method:
                                "POST",

                            headers: {

                                "Accept":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            keepalive:
                                true
                        }
                    ).catch(
                        function (erro) {

                            console.warn(
                                "Não foi possível comunicar o logout com a API:",
                                erro
                            );

                        }
                    );

                }


                /*
                 * O usuário deve conseguir sair mesmo
                 * se o Laravel estiver desligado.
                 */

                limparSessao();


                statusLogout.textContent =
                    "Sessão encerrada. Redirecionando...";


                setTimeout(
                    function () {

                        window.location.href =
                            LOGIN_URL;

                    },
                    250
                );

            }
        );

    }
);