/* ============================================================
   HISTÓRICO — FUNCIONALIDADE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";


        /* ====================================================
           CONFIGURAÇÕES
           ==================================================== */

        const API =
            "http://127.0.0.1:8000/api/admin/historico";


        const LOGIN_URL =
            "../autenticação/index.html";


        /* ====================================================
           ELEMENTOS
           ==================================================== */

        const formulario =
            document.getElementById(
                "historico-filtros"
            );


        const elementos = {

            busca:
                document.getElementById(
                    "historico-busca"
                ),

            tipo:
                document.getElementById(
                    "historico-tipo"
                ),

            inicio:
                document.getElementById(
                    "historico-inicio"
                ),

            fim:
                document.getElementById(
                    "historico-fim"
                ),

            lista:
                document.getElementById(
                    "historico-lista"
                ),

            status:
                document.getElementById(
                    "historico-status"
                ),

            total:
                document.getElementById(
                    "historico-total"
                ),

            pagina:
                document.getElementById(
                    "historico-pagina"
                ),

            anterior:
                document.getElementById(
                    "historico-anterior"
                ),

            proxima:
                document.getElementById(
                    "historico-proxima"
                ),

            atualizar:
                document.getElementById(
                    "historico-atualizar"
                ),

            limpar:
                document.getElementById(
                    "historico-limpar"
                )

        };


        const icones = {

            usuario:
                "fa-user-plus",

            anuncio:
                "fa-box-open",

            troca:
                "fa-right-left",

            interacao:
                "fa-clock-rotate-left"

        };


        let paginaAtual =
            1;


        let ultimaPagina =
            1;


        let carregando =
            false;


        let controlador =
            null;


        let filtrosAplicados =
            {};


        /* ====================================================
           TOKEN
           ==================================================== */

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
           STATUS
           ==================================================== */

        function mostrarStatus(
            mensagem,
            erro = false
        ) {

            elementos.status.textContent =
                mensagem;


            elementos.status.hidden =
                !mensagem;


            elementos.status.dataset.erro =
                String(
                    erro
                );

        }


        /* ====================================================
           BOTÕES
           ==================================================== */

        function atualizarBotoes() {

            elementos.anterior.disabled =
                carregando ||
                paginaAtual <= 1;


            elementos.proxima.disabled =
                carregando ||
                paginaAtual >=
                    ultimaPagina;


            elementos.atualizar.disabled =
                carregando;


            elementos.lista.setAttribute(
                "aria-busy",
                String(
                    carregando
                )
            );

        }


        /* ====================================================
           DATA
           ==================================================== */

        function formatarData(
            valor
        ) {

            if (
                !valor
            ) {

                return "Data não informada";

            }


            const data =
                new Date(
                    String(
                        valor
                    ).replace(
                        " ",
                        "T"
                    )
                );


            if (
                Number.isNaN(
                    data.getTime()
                )
            ) {

                return "Data não informada";

            }


            return data.toLocaleString(
                "pt-BR",
                {

                    day:
                        "2-digit",

                    month:
                        "2-digit",

                    year:
                        "numeric",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit"

                }
            );

        }


        /* ====================================================
           RENDERIZAR
           ==================================================== */

        function renderizar(
            eventos
        ) {

            const fragmento =
                document.createDocumentFragment();


            eventos.forEach(
                function (evento) {

                    const item =
                        document.createElement(
                            "article"
                        );


                    item.className =
                        "historico-item";


                    item.dataset.tipo =
                        String(
                            evento.tipo ||
                            "interacao"
                        );


                    /* ÍCONE */

                    const iconeContainer =
                        document.createElement(
                            "div"
                        );


                    iconeContainer.className =
                        "historico-icone";


                    const icone =
                        document.createElement(
                            "i"
                        );


                    icone.className =
                        `fa-solid ${
                            icones[
                                evento.tipo
                            ] ||
                            "fa-clock-rotate-left"
                        }`;


                    icone.setAttribute(
                        "aria-hidden",
                        "true"
                    );


                    iconeContainer.append(
                        icone
                    );


                    /* CORPO */

                    const corpo =
                        document.createElement(
                            "div"
                        );


                    corpo.className =
                        "historico-item-corpo";


                    const topo =
                        document.createElement(
                            "div"
                        );


                    topo.className =
                        "historico-item-topo";


                    const titulo =
                        document.createElement(
                            "h3"
                        );


                    titulo.textContent =
                        evento.titulo ||
                        "Atividade registrada";


                    const horario =
                        document.createElement(
                            "time"
                        );


                    horario.textContent =
                        formatarData(
                            evento.data
                        );


                    if (
                        evento.data
                    ) {

                        horario.setAttribute(
                            "datetime",
                            String(
                                evento.data
                            ).replace(
                                " ",
                                "T"
                            )
                        );

                    }


                    topo.append(
                        titulo,
                        horario
                    );


                    /* USUÁRIO */

                    const usuario =
                        document.createElement(
                            "p"
                        );


                    usuario.textContent =
                        evento.usuario ||
                        "Usuário indisponível";


                    /* DESCRIÇÃO */

                    const descricao =
                        document.createElement(
                            "p"
                        );


                    descricao.className =
                        "historico-descricao";


                    descricao.textContent =
                        evento.descricao ||
                        "";


                    corpo.append(
                        topo,
                        usuario,
                        descricao
                    );


                    item.append(
                        iconeContainer,
                        corpo
                    );


                    fragmento.append(
                        item
                    );

                }
            );


            elementos.lista.replaceChildren(
                fragmento
            );

        }


        /* ====================================================
           CARREGAR HISTÓRICO
           ==================================================== */

        async function carregarHistorico(
            pagina = 1
        ) {

            const token =
                obterToken();


            if (
                !token
            ) {

                limparSessao();


                window.location.href =
                    LOGIN_URL;


                return;

            }


            controlador?.abort();


            const requisicao =
                new AbortController();


            controlador =
                requisicao;


            const timeout =
                setTimeout(
                    function () {

                        requisicao.abort();

                    },
                    20000
                );


            carregando =
                true;


            atualizarBotoes();


            elementos.lista.replaceChildren();


            elementos.total.textContent =
                "";


            mostrarStatus(
                "Carregando histórico..."
            );


            try {

                const parametros =
                    new URLSearchParams(
                        {
                            page:
                                String(
                                    pagina
                                )
                        }
                    );


                Object.entries(
                    filtrosAplicados
                ).forEach(
                    function (
                        [chave, valor]
                    ) {

                        if (
                            valor
                        ) {

                            parametros.set(
                                chave,
                                valor
                            );

                        }

                    }
                );


                const resposta =
                    await fetch(
                        `${API}?${parametros.toString()}`,
                        {

                            headers: {

                                Accept:
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            cache:
                                "no-store",

                            signal:
                                requisicao.signal

                        }
                    );


                /* NÃO AUTORIZADO */

                if (
                    resposta.status ===
                    401
                ) {

                    limparSessao();


                    window.location.href =
                        LOGIN_URL;


                    return;

                }


                const dados =
                    await resposta
                        .json()
                        .catch(
                            function () {

                                return null;

                            }
                        );


                /* ERROS */

                if (
                    !resposta.ok
                ) {

                    const errosValidacao =
                        dados?.errors

                            ? Object.values(
                                dados.errors
                            )
                                .flat()
                                .join(
                                    " "
                                )

                            : "";


                    const mensagem =

                        resposta.status ===
                        403

                            ? "Seu usuário não tem permissão para acessar o histórico."

                        : resposta.status ===
                          422

                            ? errosValidacao ||
                              "Confira os filtros informados."

                        : resposta.status ===
                          404

                            ? "A rota /api/admin/historico não foi encontrada na API."

                        : dados?.message ||
                          "Não foi possível carregar o histórico.";


                    throw new Error(
                        mensagem
                    );

                }


                /* FORMATO */

                if (
                    !Array.isArray(
                        dados?.data
                    )
                ) {

                    throw new Error(
                        "A API retornou um formato de histórico inesperado."
                    );

                }


                if (
                    controlador !==
                    requisicao
                ) {

                    return;

                }


                paginaAtual =
                    Number(
                        dados.current_page
                    ) ||
                    1;


                ultimaPagina =
                    Math.max(
                        1,
                        Number(
                            dados.last_page
                        ) ||
                        1
                    );


                renderizar(
                    dados.data
                );


                const total =
                    Number(
                        dados.total
                    );


                elementos.total.textContent =
                    Number.isFinite(
                        total
                    )

                        ? `${total.toLocaleString("pt-BR")} registro(s) encontrado(s)`

                        : `${dados.data.length} registro(s) nesta página`;


                elementos.pagina.textContent =
                    `Página ${paginaAtual} de ${ultimaPagina}`;


                mostrarStatus(
                    dados.data.length

                        ? ""

                        : "Nenhuma atividade encontrada para os filtros selecionados."
                );

            }

            catch (erro) {

                if (
                    controlador !==
                    requisicao
                ) {

                    return;

                }


                paginaAtual =
                    1;


                ultimaPagina =
                    1;


                elementos.pagina.textContent =
                    "Página 1";


                mostrarStatus(

                    erro.name ===
                    "AbortError"

                        ? "A consulta demorou demais. Clique em Atualizar para tentar novamente."

                    : erro instanceof
                      TypeError

                        ? "Não foi possível conectar à API. Verifique se o Laravel está em execução."

                    : erro.message,

                    true

                );

            }

            finally {

                clearTimeout(
                    timeout
                );


                if (
                    controlador ===
                    requisicao
                ) {

                    carregando =
                        false;


                    atualizarBotoes();

                }

            }

        }


        /* ====================================================
           FILTRAR
           ==================================================== */

        formulario.addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();


                const inicio =
                    elementos.inicio.value;


                const fim =
                    elementos.fim.value;


                if (
                    inicio &&
                    fim &&
                    inicio > fim
                ) {

                    elementos.fim
                        .setCustomValidity(
                            "A data final deve ser igual ou posterior à data inicial."
                        );


                    elementos.fim
                        .reportValidity();


                    return;

                }


                elementos.fim
                    .setCustomValidity(
                        ""
                    );


                filtrosAplicados = {

                    busca:
                        elementos.busca
                            .value
                            .trim(),

                    tipo:
                        elementos.tipo.value,

                    inicio:
                        inicio,

                    fim:
                        fim

                };


                carregarHistorico(
                    1
                );

            }
        );


        /* ====================================================
           DATAS
           ==================================================== */

        [
            elementos.inicio,
            elementos.fim

        ].forEach(
            function (campo) {

                campo.addEventListener(
                    "input",
                    function () {

                        elementos.fim
                            .setCustomValidity(
                                ""
                            );

                    }
                );

            }
        );


        /* ====================================================
           LIMPAR
           ==================================================== */

        elementos.limpar
            .addEventListener(
                "click",
                function () {

                    formulario.reset();


                    elementos.fim
                        .setCustomValidity(
                            ""
                        );


                    filtrosAplicados =
                        {};


                    carregarHistorico(
                        1
                    );

                }
            );


        /* ====================================================
           ATUALIZAR
           ==================================================== */

        elementos.atualizar
            .addEventListener(
                "click",
                function () {

                    carregarHistorico(
                        paginaAtual
                    );

                }
            );


        /* ====================================================
           PAGINAÇÃO
           ==================================================== */

        elementos.anterior
            .addEventListener(
                "click",
                function () {

                    if (
                        !carregando &&
                        paginaAtual > 1
                    ) {

                        carregarHistorico(
                            paginaAtual - 1
                        );

                    }

                }
            );


        elementos.proxima
            .addEventListener(
                "click",
                function () {

                    if (
                        !carregando &&
                        paginaAtual <
                        ultimaPagina
                    ) {

                        carregarHistorico(
                            paginaAtual + 1
                        );

                    }

                }
            );


        /* ====================================================
           INICIALIZAÇÃO
           ==================================================== */

        carregarHistorico();

    }
);