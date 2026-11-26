document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";


        const API =
            "http://127.0.0.1:8000/api";


        const LOGIN_URL =
            "../autenticação/index.html";


        const container =
            document.querySelector(
                ".profile-menu-container"
            );


        const botaoPerfil =
            document.getElementById(
                "btn-menu-perfil"
            );


        const menu =
            document.getElementById(
                "menu-perfil"
            );


        const aparencia =
            document.getElementById(
                "btn-aparencia"
            );


        const opcoes =
            document.getElementById(
                "opcoes-aparencia"
            );


        const tema =
            document.getElementById(
                "tema-admin"
            );


        const nome =
            document.getElementById(
                "nome-admin-topo"
            );


        const sairSidebar =
            document.getElementById(
                "btn-sair-sidebar"
            );


        const sairPerfil =
            document.getElementById(
                "btn-sair-perfil"
            );


        const modal =
            document.getElementById(
                "logout-modal"
            );


        const fechar =
            document.getElementById(
                "logout-fechar"
            );


        const cancelar =
            document.getElementById(
                "logout-cancelar"
            );


        const confirmar =
            document.getElementById(
                "logout-confirmar"
            );


        const status =
            document.getElementById(
                "logout-status"
            );


        const nomeSalvo =
            localStorage.getItem(
                "adminNome"
            ) ||
            sessionStorage.getItem(
                "adminNome"
            ) ||
            "Administrador";


        if (nome) {

            nome.textContent =
                nomeSalvo;

        }


        function fecharMenu() {

            if (!menu) {
                return;
            }


            menu.hidden =
                true;


            botaoPerfil?.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        botaoPerfil?.addEventListener(
            "click",
            function () {

                const abrir =
                    menu.hidden;


                menu.hidden =
                    !abrir;


                botaoPerfil.setAttribute(
                    "aria-expanded",
                    String(abrir)
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

                    fecharMenu();

                }

            }
        );


        function aplicarTema(
            valor
        ) {

            const escolhido =
                valor === "escuro"
                    ? "escuro"
                    : "claro";


            document.documentElement.dataset.tema =
                escolhido;


            if (tema) {

                tema.value =
                    escolhido;

            }

        }


        aplicarTema(
            localStorage.getItem(
                "adminTema"
            )
        );


        aparencia?.addEventListener(
            "click",
            function () {

                const abrir =
                    opcoes.hidden;


                opcoes.hidden =
                    !abrir;


                aparencia.setAttribute(
                    "aria-expanded",
                    String(abrir)
                );

            }
        );


        tema?.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "adminTema",
                    tema.value
                );


                aplicarTema(
                    tema.value
                );

            }
        );


        function abrirLogout() {

            fecharMenu();


            if (status) {

                status.textContent =
                    "";

            }


            modal.hidden =
                false;


            document.body.classList.add(
                "modal-open"
            );

        }


        function fecharLogout() {

            modal.hidden =
                true;


            document.body.classList.remove(
                "modal-open"
            );

        }


        sairSidebar?.addEventListener(
            "click",
            abrirLogout
        );


        sairPerfil?.addEventListener(
            "click",
            abrirLogout
        );


        fechar?.addEventListener(
            "click",
            fecharLogout
        );


        cancelar?.addEventListener(
            "click",
            fecharLogout
        );


        modal?.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target ===
                    modal
                ) {

                    fecharLogout();

                }

            }
        );


        confirmar?.addEventListener(
            "click",
            async function () {

                confirmar.disabled =
                    true;


                cancelar.disabled =
                    true;


                status.textContent =
                    "Encerrando sessão...";


                const token =
                    localStorage.getItem(
                        "adminToken"
                    ) ||
                    sessionStorage.getItem(
                        "adminToken"
                    );


                try {

                    if (token) {

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

                                }
                            }
                        );

                    }

                }

                catch (erro) {

                    console.warn(
                        "Erro ao sair:",
                        erro
                    );

                }

                finally {

                    [
                        "adminToken",
                        "adminId",
                        "adminNome"
                    ].forEach(
                        chave => {

                            localStorage.removeItem(
                                chave
                            );

                            sessionStorage.removeItem(
                                chave
                            );

                        }
                    );


                    window.location.href =
                        LOGIN_URL;

                }

            }
        );

    }
);