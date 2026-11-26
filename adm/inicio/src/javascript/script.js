/* ============================================================
   CONFIGURAÇÕES
   ============================================================ */

const API =
    "http://127.0.0.1:8000/api";


/* ============================================================
   SIDEBAR
   ============================================================ */

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


    if (recolhida) {

        sidebarToggleIcon.className =
            "fa-solid fa-chevron-right";


        sidebarToggle.setAttribute(
            "aria-label",
            "Expandir menu lateral"
        );


        sidebarToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    } else {

        sidebarToggleIcon.className =
            "fa-solid fa-chevron-left";


        sidebarToggle.setAttribute(
            "aria-label",
            "Recolher menu lateral"
        );


        sidebarToggle.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


if (
    sidebar &&
    sidebarToggle
) {

    const sidebarState =
        localStorage.getItem(
            "sidebarState"
        );


    if (
        sidebarState ===
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


/* ============================================================
   TOKEN
   ============================================================ */

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


/* ============================================================
   NOME DO ADMINISTRADOR
   ============================================================ */

function carregarNomeAdministrador() {

    const nome =
        localStorage.getItem(
            "adminNome"
        ) ||
        "Administrador";


    const nomeBanner =
        document.getElementById(
            "nome-admin"
        );


    const nomeTopo =
        document.getElementById(
            "nome-admin-topo"
        );


    if (nomeBanner) {

        nomeBanner.textContent =
            nome;

    }


    if (nomeTopo) {

        nomeTopo.textContent =
            nome;

    }

}


/* ============================================================
   CARREGAMENTO
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        carregarNomeAdministrador();


        const token =
            obterToken();


        console.log(
            "Token encontrado:",
            token
                ? "SIM"
                : "NÃO"
        );


        if (!token) {

            window.location.href =
                "../autenticação/index.html";

            return;

        }


        await carregarDashboard(
            token
        );

    }
);


/* ============================================================
   CARREGAR DADOS
   ============================================================ */

async function carregarDashboard(
    token
) {

    try {

        /* ====================================================
           USUÁRIOS
           ==================================================== */

        const respostaUsuarios =
            await fetch(
                `${API}/admin/users`,
                {
                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    },

                    cache:
                        "no-store"
                }
            );


        console.log(
            "Status API usuários:",
            respostaUsuarios.status
        );


        if (
            respostaUsuarios.status ===
            401
        ) {

            limparSessao();


            window.location.href =
                "../autenticação/index.html";


            return;

        }


        if (
            !respostaUsuarios.ok
        ) {

            const erro =
                await respostaUsuarios.text();


            console.error(
                "Erro retornado pela API de usuários:",
                erro
            );


            throw new Error(
                "Não foi possível carregar os usuários."
            );

        }


        const retornoUsuarios =
            await respostaUsuarios.json();


        console.log(
            "Usuários recebidos:",
            retornoUsuarios
        );


        /* ====================================================
           ANÚNCIOS
           ==================================================== */

        const respostaAnuncios =
            await fetch(
                `${API}/admin/products`,
                {
                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    },

                    cache:
                        "no-store"
                }
            );


        console.log(
            "Status API anúncios:",
            respostaAnuncios.status
        );


        if (
            respostaAnuncios.status ===
            401
        ) {

            limparSessao();


            window.location.href =
                "../autenticação/index.html";


            return;

        }


        if (
            !respostaAnuncios.ok
        ) {

            const erro =
                await respostaAnuncios.text();


            console.error(
                "Erro retornado pela API de anúncios:",
                erro
            );


            throw new Error(
                "Não foi possível carregar os anúncios."
            );

        }


        const retornoAnuncios =
            await respostaAnuncios.json();


        console.log(
            "Anúncios recebidos:",
            retornoAnuncios
        );


        /* ====================================================
           NORMALIZAR DADOS
           ==================================================== */

        const usuarios =
            Array.isArray(
                retornoUsuarios
            )
                ? retornoUsuarios
                : (
                    retornoUsuarios.usuarios ||
                    retornoUsuarios.data ||
                    []
                );


        const anuncios =
            Array.isArray(
                retornoAnuncios
            )
                ? retornoAnuncios
                : (
                    retornoAnuncios.produtos ||
                    retornoAnuncios.anuncios ||
                    retornoAnuncios.data ||
                    []
                );


        /* ====================================================
           CÁLCULOS
           ==================================================== */

        const totalUsuarios =
            usuarios.length;


        const totalAnuncios =
            anuncios.length;


        const usuariosAtivos =
            usuarios.filter(
                usuario =>
                    usuario.st_usuario ===
                    "A"
            ).length;


        const anunciosDisponiveis =
            anuncios.filter(
                anuncio => {

                    const status =
                        anuncio.st_status ??
                        anuncio.st_produto;


                    return (
                        status === "A"
                    );

                }
            ).length;


        console.log(
            "Total de usuários:",
            totalUsuarios
        );


        console.log(
            "Total de anúncios:",
            totalAnuncios
        );


        console.log(
            "Usuários ativos:",
            usuariosAtivos
        );


        console.log(
            "Anúncios disponíveis:",
            anunciosDisponiveis
        );


        /* ====================================================
           CARDS
           ==================================================== */

        atualizarCard(
            "totalUsuarios",
            totalUsuarios
        );


        atualizarCard(
            "totalAnuncios",
            totalAnuncios
        );


        atualizarCard(
            "usuariosAtivos",
            usuariosAtivos
        );


        atualizarCard(
            "anunciosDisponiveis",
            anunciosDisponiveis
        );


    } catch (error) {

        console.error(
            "ERRO COMPLETO DA PÁGINA INICIAL:",
            error
        );


        [
            "totalUsuarios",
            "totalAnuncios",
            "usuariosAtivos",
            "anunciosDisponiveis"
        ].forEach(
            id => {

                atualizarCard(
                    id,
                    "-"
                );

            }
        );

    }

}


/* ============================================================
   ATUALIZAR CARD
   ============================================================ */

function atualizarCard(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {
        return;
    }


    elemento.textContent =
        valor;

}


/* ============================================================
   LIMPAR SESSÃO
   ============================================================ */

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


    localStorage.removeItem(
        "adminNome"
    );

}