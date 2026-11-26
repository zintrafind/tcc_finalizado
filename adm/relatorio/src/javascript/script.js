(() => {

    "use strict";


    const LOGIN_URL =
        "../autenticação/index.html";


    const token =
        localStorage.getItem(
            "adminToken"
        ) ||
        sessionStorage.getItem(
            "adminToken"
        );


    if (!token) {

        window.location.href =
            LOGIN_URL;

        return;

    }


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const toggle =
        document.getElementById(
            "sidebarToggle"
        );


    const icon =
        document.getElementById(
            "sidebarToggleIcon"
        );


    function atualizar() {

        if (
            !sidebar ||
            !toggle ||
            !icon
        ) {
            return;
        }


        const recolhida =
            sidebar.classList.contains(
                "active"
            );


        icon.className =
            recolhida
                ? "fa-solid fa-chevron-right"
                : "fa-solid fa-chevron-left";


        toggle.setAttribute(
            "aria-expanded",
            String(!recolhida)
        );

    }


    if (
        sidebar &&
        toggle
    ) {

        if (
            localStorage.getItem(
                "sidebarState"
            ) === "collapsed"
        ) {

            sidebar.classList.add(
                "active"
            );

        }


        atualizar();


        toggle.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "active"
                );


                localStorage.setItem(
                    "sidebarState",
                    sidebar.classList.contains(
                        "active"
                    )
                        ? "collapsed"
                        : "expanded"
                );


                atualizar();

            }
        );

    }

})();