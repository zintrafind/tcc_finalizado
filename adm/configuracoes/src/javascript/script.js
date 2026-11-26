/* ============================================================
   CONFIGURAÇÕES — SCRIPT BASE
   Sidebar + sessão
   ============================================================ */

(() => {
    "use strict";

    const LOGIN_URL =
        "../autenticação/index.html";


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const sidebarToggle =
        document.getElementById(
            "sidebarToggle"
        );


    const sidebarToggleIcon =
        document.getElementById(
            "sidebarToggleIcon"
        );


    const botaoSairSidebar =
        document.getElementById(
            "btn-sair-sidebar"
        );


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
       LIMPAR SESSÃO
       ======================================================== */

    function limparSessao() {

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

    }


    /* ========================================================
       SIDEBAR
       ======================================================== */

    function atualizarSidebar() {

        if (
            !sidebar ||
            !sidebarToggle ||
            !sidebarToggleIcon
        ) {
            return;
        }


        const recolhida =
            sidebar.classList.contains(
                "active"
            );


        sidebarToggleIcon.className =
            recolhida
                ? "fa-solid fa-chevron-right"
                : "fa-solid fa-chevron-left";


        sidebarToggle.setAttribute(
            "aria-label",
            recolhida
                ? "Expandir menu lateral"
                : "Recolher menu lateral"
        );


        sidebarToggle.setAttribute(
            "aria-expanded",
            String(!recolhida)
        );

    }


    if (
        sidebar &&
        sidebarToggle
    ) {

        const estadoSalvo =
            localStorage.getItem(
                "sidebarState"
            );


        if (
            estadoSalvo ===
            "collapsed"
        ) {

            sidebar.classList.add(
                "active"
            );

        }


        atualizarSidebar();


        sidebarToggle.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "active"
                );


                const recolhida =
                    sidebar.classList.contains(
                        "active"
                    );


                localStorage.setItem(
                    "sidebarState",
                    recolhida
                        ? "collapsed"
                        : "expanded"
                );


                atualizarSidebar();

            }
        );

    }


    /* ========================================================
       SAIR PELA SIDEBAR
       ======================================================== */

    async function sairPelaSidebar() {

        if (
            botaoSairSidebar?.disabled
        ) {
            return;
        }


        const token =
            obterToken();


        if (
            botaoSairSidebar
        ) {

            botaoSairSidebar.disabled =
                true;

        }


        try {

            if (
                token
            ) {

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
                        }
                    }
                );

            }

        }

        catch (erro) {

            console.error(
                "Erro ao comunicar logout com a API:",
                erro
            );

        }

        finally {

            limparSessao();


            window.location.href =
                LOGIN_URL;

        }

    }


    botaoSairSidebar?.addEventListener(
        "click",
        sairPelaSidebar
    );


    /* ========================================================
       VERIFICA LOGIN
       ======================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            if (
                !obterToken()
            ) {

                window.location.href =
                    LOGIN_URL;

            }

        }
    );

})();