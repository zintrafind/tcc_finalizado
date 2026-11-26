document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";


        const $ =
            id =>
                document.getElementById(
                    id
                );


        if (!$("rel-registros")) {
            return;
        }


        const API =
            "http://127.0.0.1:8000/api";


        const CONFIG = {

            usuarios: {

                titulo:
                    "Relatório de usuários",

                colunas: [

                    [
                        "id_usuario",
                        "ID"
                    ],

                    [
                        "nm_usuario",
                        "Nome"
                    ],

                    [
                        "email",
                        "E-mail"
                    ],

                    [
                        "st_usuario",
                        "Status"
                    ],

                    [
                        "created_at",
                        "Cadastro"
                    ]

                ],

                campoStatus:
                    "st_usuario",

                status: {

                    A:
                        "Ativo",

                    I:
                        "Inativo",

                    B:
                        "Bloqueado"

                }

            },


            anuncios: {

                titulo:
                    "Relatório de anúncios",

                colunas: [

                    [
                        "id_produto",
                        "ID"
                    ],

                    [
                        "nm_produto",
                        "Produto"
                    ],

                    [
                        "dono_anuncio",
                        "Anunciante"
                    ],

                    [
                        "nome_categoria",
                        "Categoria"
                    ],

                    [
                        "st_status",
                        "Status"
                    ],

                    [
                        "created_at",
                        "Cadastro"
                    ]

                ],

                campoStatus:
                    "st_status",

                status: {

                    A:
                        "Disponível",

                    N:
                        "Em negociação",

                    T:
                        "Trocado",

                    S:
                        "Suspenso",

                    E:
                        "Excluído"

                }

            }

        };


        let dados = {

            usuarios: [],

            anuncios: []

        };


        let resultados =
            [];


        let pagina =
            1;


        let carregado =
            false;


        let carregando =
            false;


        const porPagina =
            10;


        /* ====================================================
           MENSAGEM
           ==================================================== */

        function mensagem(
            texto
        ) {

            $("rel-mensagem").textContent =
                texto;

        }


        /* ====================================================
           DATA
           ==================================================== */

        function obterData(
            valor
        ) {

            const data =
                String(
                    valor ?? ""
                ).slice(
                    0,
                    10
                );


            return /^\d{4}-\d{2}-\d{2}$/
                .test(data)

                    ? data

                    : "";

        }


        function formatarData(
            data
        ) {

            return data
                ? data
                    .split("-")
                    .reverse()
                    .join("/")

                : "";

        }


        /* ====================================================
           FORMATAÇÃO
           ==================================================== */

        function formatarValor(
            registro,
            campo,
            tipo
        ) {

            const valor =
                registro[campo];


            if (
                valor === null ||
                valor === undefined ||
                valor === ""
            ) {

                return "—";

            }


            if (
                campo ===
                CONFIG[tipo].campoStatus
            ) {

                return (
                    CONFIG[tipo]
                        .status[valor] ||
                    String(valor)
                );

            }


            if (
                campo ===
                "created_at"
            ) {

                const data =
                    obterData(
                        valor
                    );


                return data
                    ? formatarData(
                        data
                    )
                    : String(valor);

            }


            return String(
                valor
            );

        }


        /* ====================================================
           STATUS
           ==================================================== */

        function preencherStatus() {

            const tipo =
                $("rel-tipo").value;


            const seletor =
                $("rel-status");


            seletor.replaceChildren(
                new Option(
                    "Todos",
                    ""
                )
            );


            Object.entries(
                CONFIG[tipo].status
            ).forEach(
                ([valor, texto]) => {

                    seletor.add(
                        new Option(
                            texto,
                            valor
                        )
                    );

                }
            );

        }


        /* ====================================================
           RENDERIZAR
           ==================================================== */

        function renderizar() {

            const tipo =
                $("rel-tipo").value;


            const config =
                CONFIG[tipo];


            const busca =
                $("rel-busca")
                    .value
                    .trim()
                    .toLowerCase();


            const status =
                $("rel-status").value;


            const inicio =
                $("rel-inicio").value;


            const fim =
                $("rel-fim").value;


            const periodoInvalido =
                Boolean(
                    inicio &&
                    fim &&
                    inicio > fim
                );


            $("rel-fim")
                .setCustomValidity(

                    periodoInvalido

                        ? "A data final deve ser igual ou posterior à inicial."

                        : ""

                );


            resultados =
                periodoInvalido

                    ? []

                    : dados[tipo]
                        .filter(
                            registro => {

                                const data =
                                    obterData(
                                        registro.created_at
                                    );


                                const okStatus =
                                    !status ||
                                    String(
                                        registro[
                                            config.campoStatus
                                        ]
                                    ) ===
                                    status;


                                const okInicio =
                                    !inicio ||
                                    (
                                        data &&
                                        data >= inicio
                                    );


                                const okFim =
                                    !fim ||
                                    (
                                        data &&
                                        data <= fim
                                    );


                                const okBusca =
                                    !busca ||
                                    config.colunas.some(
                                        ([campo]) =>

                                            formatarValor(
                                                registro,
                                                campo,
                                                tipo
                                            )
                                                .toLowerCase()
                                                .includes(
                                                    busca
                                                )

                                    );


                                return (
                                    okStatus &&
                                    okInicio &&
                                    okFim &&
                                    okBusca
                                );

                            }
                        );


            const totalPaginas =
                Math.max(
                    1,

                    Math.ceil(
                        resultados.length /
                        porPagina
                    )
                );


            pagina =
                Math.max(
                    1,

                    Math.min(
                        pagina,
                        totalPaginas
                    )
                );


            /* TÍTULO */

            $("rel-titulo-tabela")
                .textContent =
                    config.titulo;


            /* CABEÇALHO */

            const cabecalho =
                $("rel-colunas");


            cabecalho.replaceChildren();


            config.colunas.forEach(
                ([, titulo]) => {

                    const th =
                        document.createElement(
                            "th"
                        );


                    th.textContent =
                        titulo;


                    cabecalho.appendChild(
                        th
                    );

                }
            );


            /* CORPO */

            const corpo =
                $("rel-registros");


            corpo.replaceChildren();


            const registrosPagina =
                resultados.slice(

                    (
                        pagina -
                        1
                    ) *
                    porPagina,

                    pagina *
                    porPagina

                );


            registrosPagina.forEach(
                registro => {

                    const tr =
                        document.createElement(
                            "tr"
                        );


                    config.colunas.forEach(
                        ([campo]) => {

                            const td =
                                document.createElement(
                                    "td"
                                );


                            td.textContent =
                                formatarValor(
                                    registro,
                                    campo,
                                    tipo
                                );


                            tr.appendChild(
                                td
                            );

                        }
                    );


                    corpo.appendChild(
                        tr
                    );

                }
            );


            if (
                !registrosPagina.length
            ) {

                const tr =
                    document.createElement(
                        "tr"
                    );


                const td =
                    document.createElement(
                        "td"
                    );


                td.colSpan =
                    config.colunas.length;


                td.className =
                    "relatorios-vazio";


                td.textContent =
                    periodoInvalido

                        ? "A data inicial não pode ser maior que a data final."

                        : carregando

                            ? "Carregando dados..."

                            : carregado

                                ? "Nenhum registro encontrado."

                                : "Os dados ainda não foram carregados.";


                tr.appendChild(
                    td
                );


                corpo.appendChild(
                    tr
                );

            }


            $("rel-total-usuarios")
                .textContent =
                    carregado
                        ? dados.usuarios.length
                        : "—";


            $("rel-total-anuncios")
                .textContent =
                    carregado
                        ? dados.anuncios.length
                        : "—";


            $("rel-total-filtrados")
                .textContent =
                    carregado
                        ? resultados.length
                        : "—";


            $("rel-pagina")
                .textContent =
                    `Página ${pagina} de ${totalPaginas}`;


            $("rel-anterior").disabled =
                pagina <= 1;


            $("rel-proxima").disabled =
                pagina >= totalPaginas;


            $("rel-exportar").disabled =
                carregando ||
                resultados.length === 0;

        }


        /* ====================================================
           API
           ==================================================== */

        async function carregar() {

            if (carregando) {
                return;
            }


            const token =
                localStorage.getItem(
                    "adminToken"
                ) ||
                sessionStorage.getItem(
                    "adminToken"
                );


            if (!token) {

                mensagem(
                    "Faça login novamente."
                );

                return;

            }


            carregando =
                true;


            $("rel-atualizar").disabled =
                true;


            mensagem(
                "Carregando relatórios..."
            );


            renderizar();


            const controller =
                new AbortController();


            const timeout =
                setTimeout(
                    () =>
                        controller.abort(),
                    20000
                );


            try {

                const resposta =
                    await fetch(
                        `${API}/admin/relatorios`,
                        {

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
                    resposta.status ===
                    401
                ) {

                    throw new Error(
                        "Sua sessão expirou."
                    );

                }


                if (
                    resposta.status ===
                    403
                ) {

                    throw new Error(
                        "Somente administradores podem acessar os relatórios."
                    );

                }


                if (!resposta.ok) {

                    throw new Error(
                        `Erro HTTP ${resposta.status}.`
                    );

                }


                const retorno =
                    await resposta.json();


                if (
                    !Array.isArray(
                        retorno.usuarios
                    ) ||
                    !Array.isArray(
                        retorno.anuncios
                    )
                ) {

                    throw new Error(
                        "A API retornou um formato diferente do esperado."
                    );

                }


                dados = {

                    usuarios:
                        retorno.usuarios,

                    anuncios:
                        retorno.anuncios

                };


                carregado =
                    true;


                pagina =
                    1;


                mensagem(
                    "Dados atualizados em " +
                    new Date()
                        .toLocaleString(
                            "pt-BR"
                        ) +
                    "."
                );

            }

            catch (erro) {

                console.error(
                    "Erro nos relatórios:",
                    erro
                );


                mensagem(
                    erro.name ===
                    "AbortError"

                        ? "O servidor demorou para responder."

                        : erro instanceof
                          TypeError

                            ? "Não foi possível conectar à API."

                            : erro.message
                );

            }

            finally {

                clearTimeout(
                    timeout
                );


                carregando =
                    false;


                $("rel-atualizar").disabled =
                    false;


                renderizar();

            }

        }


        /* ====================================================
           PDF
           ==================================================== */

        function exportarPDF() {

            if (
                !resultados.length
            ) {
                return;
            }


            const tipo =
                $("rel-tipo").value;


            const config =
                CONFIG[tipo];


            const janela =
                window.open(
                    "",
                    "_blank"
                );


            if (!janela) {

                mensagem(
                    "Permita pop-ups para gerar o PDF."
                );

                return;

            }


            const inicio =
                $("rel-inicio").value;


            const fim =
                $("rel-fim").value;


            const statusTexto =
                $("rel-status")
                    .selectedOptions[0]
                    ?.textContent ||
                "Todos";


            const busca =
                $("rel-busca")
                    .value
                    .trim();


            janela.document.write(`
                <!DOCTYPE html>

                <html lang="pt-BR">

                <head>

                    <meta charset="UTF-8">

                    <title>
                        ${config.titulo}
                    </title>

                    <style>

                        body {
                            font-family: Arial, sans-serif;
                            color: #243746;
                            padding: 30px;
                        }

                        h1 {
                            color: #005386;
                        }

                        p {
                            font-size: 12px;
                        }

                        table {
                            width: 100%;
                            margin-top: 20px;
                            border-collapse: collapse;
                        }

                        th,
                        td {
                            padding: 9px;
                            border: 1px solid #cbd5e1;
                            font-size: 10px;
                            text-align: left;
                        }

                        th {
                            background: #eaf3fa;
                            color: #005386;
                        }

                        .acoes {
                            margin-bottom: 20px;
                        }

                        button {
                            padding: 10px 16px;
                            border: 0;
                            border-radius: 7px;
                            background: #005386;
                            color: white;
                        }

                        @media print {

                            .acoes {
                                display: none;
                            }

                        }

                    </style>

                </head>

                <body>

                    <div class="acoes">

                        <button onclick="window.print()">
                            Imprimir / Salvar PDF
                        </button>

                    </div>

                    <h1>
                        ${config.titulo}
                    </h1>

                    <p>
                        Peça por Peça — Administração
                    </p>

                    <p>
                        Período:
                        ${
                            inicio
                                ? formatarData(inicio)
                                : "sem data inicial"
                        }
                        até
                        ${
                            fim
                                ? formatarData(fim)
                                : "sem data final"
                        }
                    </p>

                    <p>
                        Status: ${statusTexto}
                    </p>

                    <p>
                        Pesquisa:
                        ${busca || "nenhuma"}
                    </p>

                    <p>
                        Total:
                        ${resultados.length}
                    </p>

                    <table>

                        <thead>

                            <tr>

                                ${
                                    config.colunas
                                        .map(
                                            ([, titulo]) =>
                                                `<th>${titulo}</th>`
                                        )
                                        .join("")
                                }

                            </tr>

                        </thead>

                        <tbody>

                            ${
                                resultados
                                    .map(
                                        registro => `

                                            <tr>

                                                ${
                                                    config.colunas
                                                        .map(
                                                            ([campo]) => `

                                                                <td>
                                                                    ${
                                                                        formatarValor(
                                                                            registro,
                                                                            campo,
                                                                            tipo
                                                                        )
                                                                    }
                                                                </td>

                                                            `
                                                        )
                                                        .join("")
                                                }

                                            </tr>

                                        `
                                    )
                                    .join("")
                            }

                        </tbody>

                    </table>

                </body>

                </html>
            `);


            janela.document.close();

        }


        /* ====================================================
           EVENTOS
           ==================================================== */

        $("rel-filtros")
            .addEventListener(
                "submit",
                evento =>
                    evento.preventDefault()
            );


        $("rel-tipo")
            .addEventListener(
                "change",
                function () {

                    pagina =
                        1;


                    preencherStatus();


                    renderizar();

                }
            );


        [
            "rel-status",
            "rel-inicio",
            "rel-fim",
            "rel-busca"

        ].forEach(
            id => {

                $(id)
                    .addEventListener(
                        "input",
                        function () {

                            pagina =
                                1;


                            renderizar();

                        }
                    );

            }
        );


        $("rel-limpar")
            .addEventListener(
                "click",
                function () {

                    $("rel-status").value =
                        "";

                    $("rel-inicio").value =
                        "";

                    $("rel-fim").value =
                        "";

                    $("rel-busca").value =
                        "";


                    pagina =
                        1;


                    renderizar();

                }
            );


        $("rel-anterior")
            .addEventListener(
                "click",
                function () {

                    if (
                        pagina >
                        1
                    ) {

                        pagina--;

                        renderizar();

                    }

                }
            );


        $("rel-proxima")
            .addEventListener(
                "click",
                function () {

                    if (
                        pagina *
                        porPagina <
                        resultados.length
                    ) {

                        pagina++;

                        renderizar();

                    }

                }
            );


        $("rel-atualizar")
            .addEventListener(
                "click",
                carregar
            );


        $("rel-exportar")
            .addEventListener(
                "click",
                exportarPDF
            );


        /* ====================================================
           INICIAR
           ==================================================== */

        preencherStatus();

        renderizar();

        carregar();

    }
);