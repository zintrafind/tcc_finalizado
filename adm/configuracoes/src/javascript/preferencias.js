/* ============================================================
   PREFERÊNCIAS GLOBAIS DO PAINEL ADMINISTRATIVO
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const chaves = {
        tema: "adminTema",
        texto: "adminTexto",
        contraste: "adminContraste",
        movimento: "adminReduzirAnimacoes"
    };


    /* ========================================================
       LER PREFERÊNCIAS SALVAS
       ======================================================== */

    function lerPreferencias() {

        try {

            return {
                tema:
                    localStorage.getItem(chaves.tema) === "escuro"
                        ? "escuro"
                        : "claro",

                texto:
                    localStorage.getItem(chaves.texto) === "ampliado"
                        ? "ampliado"
                        : "padrao",

                contraste:
                    localStorage.getItem(chaves.contraste) === "true",

                movimento:
                    localStorage.getItem(chaves.movimento) === "true"
            };

        } catch (erro) {

            return {
                tema: "claro",
                texto: "padrao",
                contraste: false,
                movimento: false
            };

        }

    }


    /* ========================================================
       APLICAR PREFERÊNCIAS EM TODO O PAINEL
       ======================================================== */

    function aplicarPreferencias(preferencias) {

        document.documentElement.dataset.tema =
            preferencias.tema;

        document.documentElement.dataset.texto =
            preferencias.texto;

        document.documentElement.dataset.contraste =
            String(preferencias.contraste);

        document.documentElement.dataset.movimento =
            String(preferencias.movimento);


        const temaMenu =
            document.getElementById("tema-admin");

        if (temaMenu) {

            temaMenu.value = preferencias.tema;

        }

    }


    /* ========================================================
       APLICAÇÃO INICIAL
       ======================================================== */

    aplicarPreferencias(lerPreferencias());


    /* ========================================================
       ALTERAÇÃO PELO MENU SUPERIOR
       ======================================================== */

    const temaMenu =
        document.getElementById("tema-admin");

    temaMenu?.addEventListener("change", () => {

        const tema =
            temaMenu.value === "escuro"
                ? "escuro"
                : "claro";

        try {

            localStorage.setItem(
                chaves.tema,
                tema
            );

        } catch (erro) {

            console.error(
                "Não foi possível salvar o tema:",
                erro
            );

        }

        aplicarPreferencias(lerPreferencias());

    });


    /* ========================================================
       SINCRONIZAR OUTRAS ABAS
       ======================================================== */

    window.addEventListener("storage", evento => {

        if (
            evento.key !== null &&
            !Object.values(chaves).includes(evento.key)
        ) {
            return;
        }

        aplicarPreferencias(lerPreferencias());

    });

});