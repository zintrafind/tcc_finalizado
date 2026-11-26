/* ============================================================
   MENU DO PERFIL
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const container =
            document.querySelector(
                ".profile-menu-container"
            );


        const botao =
            document.getElementById(
                "btn-menu-perfil"
            );


        const menu =
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


        const seletorTema =
            document.getElementById(
                "tema-admin"
            );


        const botaoSair =
            document.getElementById(
                "btn-sair-perfil"
            );


        const status =
            document.getElementById(
                "perfil-menu-status"
            );


        const nomeAdminTopo =
            document.getElementById(
                "nome-admin-topo"
            );


        if (
            !container ||
            !botao ||
            !menu
        ) {
            return;
        }


        /* ====================================================
           NOME
           ==================================================== */

        const nomeAdmin =
            localStorage.getItem(
                "adminNome"
            ) ||
            sessionStorage.getItem(
                "adminNome"
            ) ||
            "Administrador";


        if (
            nomeAdminTopo
        ) {

            nomeAdminTopo.textContent =
                nomeAdmin;

        }


        /* ====================================================
           MENU
           ==================================================== */

        function fecharMenu(
            devolverFoco = false
        ) {

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


        botao.addEventListener(
            "click",
            () => {

                const abrir =
                    menu.hidden;


                menu.hidden =
                    !abrir;


                botao.setAttribute(
                    "aria-expanded",
                    String(abrir)
                );

            }
        );


        document.addEventListener(
            "click",
            evento => {

                if (
                    !container.contains(
                        evento.target
                    )
                ) {

                    fecharMenu();

                }

            }
        );


        document.addEventListener(
            "keydown",
            evento => {

                if (
                    evento.key ===
                        "Escape" &&
                    !menu.hidden
                ) {

                    fecharMenu(
                        true
                    );

                }

            }
        );


        container.addEventListener(
            "focusout",
            evento => {

                if (
                    !container.contains(
                        evento.relatedTarget
                    )
                ) {

                    fecharMenu();

                }

            }
        );


        /* ====================================================
           TEMA
           ==================================================== */

        function aplicarTema(
            tema
        ) {

            const temaValido =
                tema === "escuro"
                    ? "escuro"
                    : "claro";


            document.documentElement.dataset.tema =
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
                () => {

                    const abrir =
                        opcoesAparencia.hidden;


                    opcoesAparencia.hidden =
                        !abrir;


                    botaoAparencia.setAttribute(
                        "aria-expanded",
                        String(abrir)
                    );

                }
            );

        }


        seletorTema?.addEventListener(
            "change",
            () => {

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


        /* ====================================================
           SAIR
           ==================================================== */

        botaoSair?.addEventListener(
            "click",
            async () => {

                if (
                    botaoSair.disabled
                ) {
                    return;
                }


                const token =
                    localStorage.getItem(
                        "adminToken"
                    ) ||
                    sessionStorage.getItem(
                        "adminToken"
                    );


                botaoSair.disabled =
                    true;


                if (
                    status
                ) {

                    status.textContent =
                        "Encerrando sessão...";

                }


                const controller =
                    new AbortController();


                const timeout =
                    setTimeout(
                        () =>
                            controller.abort(),
                        15000
                    );


                try {

                    if (
                        token
                    ) {

                        const resposta =
                            await fetch(
                                "http://127.0.0.1:8000/api/logout",
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


                        if (
                            !resposta.ok &&
                            resposta.status !== 401
                        ) {

                            throw new Error(
                                "Não foi possível encerrar a sessão."
                            );

                        }

                    }


                    localStorage.removeItem(
                        "adminToken"
                    );

                    sessionStorage.removeItem(
                        "adminToken"
                    );


                    localStorage.removeItem(
                        "adminId"
                    );

                    sessionStorage.removeItem(
                        "adminId"
                    );


                    localStorage.removeItem(
                        "adminNome"
                    );

                    sessionStorage.removeItem(
                        "adminNome"
                    );


                    window.location.href =
                        "../autenticação/index.html";

                }

                catch (erro) {

                    console.error(
                        "Erro ao sair:",
                        erro
                    );


                    if (
                        status
                    ) {

                        status.textContent =
                            "Não foi possível sair. Verifique a conexão e tente novamente.";

                    }


                    botaoSair.disabled =
                        false;

                }

                finally {

                    clearTimeout(
                        timeout
                    );

                }

            }
        );

    }
);