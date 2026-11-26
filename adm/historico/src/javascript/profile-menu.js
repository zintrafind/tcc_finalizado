/* ============================================================
   MENU DO PERFIL + LOGOUT
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";


        const API =
            "http://127.0.0.1:8000/api";


        const LOGIN_URL =
            "../autenticação/index.html";


        /* ====================================================
           ELEMENTOS
           ==================================================== */

        const container =
            document.querySelector(
                ".profile-menu-container"
            );


        const botaoPerfil =
            document.getElementById(
                "btn-menu-perfil"
            );


        const menuPerfil =
            document.getElementById(
                "menu-perfil"
            );


        const botaoAparencia =
            document.getElementById(
                "btn-aparencia"
            );


        const opcoesAparencia =
            document.getElementById(
                "opcoes-aparencia"
            );


        const temaAdmin =
            document.getElementById(
                "tema-admin"
            );


        const nomeAdmin =
            document.getElementById(
                "nome-admin-topo"
            );


        const botaoSairSidebar =
            document.getElementById(
                "btn-sair-sidebar"
            );


        const botaoSairPerfil =
            document.getElementById(
                "btn-sair-perfil"
            );


        const modalLogout =
            document.getElementById(
                "logout-modal"
            );


        const botaoFechar =
            document.getElementById(
                "logout-fechar"
            );


        const botaoCancelar =
            document.getElementById(
                "logout-cancelar"
            );


        const botaoConfirmar =
            document.getElementById(
                "logout-confirmar"
            );


        const statusLogout =
            document.getElementById(
                "logout-status"
            );


        let saindo =
            false;


        let botaoAnterior =
            null;


        /* ====================================================
           NOME
           ==================================================== */

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


        /* ====================================================
           PERFIL
           ==================================================== */

        function fecharMenuPerfil(
            devolverFoco = false
        ) {

            if (
                !menuPerfil ||
                !botaoPerfil
            ) {

                return;

            }


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


        botaoPerfil?.addEventListener(
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
                    container &&
                    !container.contains(
                        evento.target
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
                    evento.key === "Escape"
                ) {

                    if (
                        modalLogout &&
                        !modalLogout.hidden
                    ) {

                        fecharModalLogout();


                        return;

                    }


                    fecharMenuPerfil();

                }

            }
        );


        /* ====================================================
           APARÊNCIA
           ==================================================== */

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
                temaAdmin
            ) {

                temaAdmin.value =
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


        temaAdmin?.addEventListener(
            "change",
            function () {

                const tema =
                    temaAdmin.value ===
                    "escuro"
                        ? "escuro"
                        : "claro";


                localStorage.setItem(
                    "adminTema",
                    tema
                );


                aplicarTema(
                    tema
                );

            }
        );


        /* ====================================================
           MODAL DE SAÍDA
           ==================================================== */

        function abrirModalLogout(
            origem
        ) {

            if (
                !modalLogout ||
                saindo
            ) {

                return;

            }


            botaoAnterior =
                origem;


            fecharMenuPerfil();


            statusLogout.textContent =
                "";


            modalLogout.hidden =
                false;


            document.body.classList.add(
                "modal-open"
            );


            botaoCancelar?.focus();

        }


        function fecharModalLogout() {

            if (
                !modalLogout ||
                saindo
            ) {

                return;

            }


            modalLogout.hidden =
                true;


            document.body.classList.remove(
                "modal-open"
            );


            if (
                botaoAnterior
            ) {

                botaoAnterior.focus();

            }


            botaoAnterior =
                null;

        }


        botaoSairSidebar?.addEventListener(
            "click",
            function () {

                abrirModalLogout(
                    botaoSairSidebar
                );

            }
        );


        botaoSairPerfil?.addEventListener(
            "click",
            function () {

                abrirModalLogout(
                    botaoSairPerfil
                );

            }
        );


        botaoCancelar?.addEventListener(
            "click",
            fecharModalLogout
        );


        botaoFechar?.addEventListener(
            "click",
            fecharModalLogout
        );


        modalLogout?.addEventListener(
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


        /* ====================================================
           LIMPAR SESSÃO
           ==================================================== */

        function limparSessao() {

            [
                "adminToken",
                "adminId",
                "adminNome"
            ].forEach(
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


        /* ====================================================
           CONFIRMAR SAÍDA
           ==================================================== */

        botaoConfirmar?.addEventListener(
            "click",
            async function () {

                if (
                    saindo
                ) {

                    return;

                }


                saindo =
                    true;


                botaoConfirmar.disabled =
                    true;


                botaoCancelar.disabled =
                    true;


                botaoFechar.disabled =
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


                const controller =
                    new AbortController();


                const timeout =
                    setTimeout(
                        function () {

                            controller.abort();

                        },
                        5000
                    );


                try {

                    if (
                        token
                    ) {

                        await fetch(
                            `${API}/logout`,
                            {
                                method:
                                    "POST",

                                headers: {

                                    Accept:
                                        "application/json",

                                    Authorization:
                                        `Bearer ${token}`

                                },

                                signal:
                                    controller.signal
                            }
                        );

                    }

                }

                catch (erro) {

                    console.warn(
                        "Não foi possível comunicar o logout com a API:",
                        erro
                    );

                }

                finally {

                    clearTimeout(
                        timeout
                    );


                    limparSessao();


                    window.location.href =
                        LOGIN_URL;

                }

            }
        );

    }
);