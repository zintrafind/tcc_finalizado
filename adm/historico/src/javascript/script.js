/* ============================================================
   HISTÓRICO — SCRIPT BASE
   Sessão + Sidebar
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
       VERIFICAR LOGIN
       ======================================================== */

    if (
        !obterToken()
    ) {

        window.location.href =
            LOGIN_URL;


        return;

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
            "aria-expanded",
            String(
                !recolhida
            )
        );


        sidebarToggle.setAttribute(
            "aria-label",
            recolhida
                ? "Expandir menu lateral"
                : "Recolher menu lateral"
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
            function () {

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

})();