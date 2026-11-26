/* ==================== DASHBOARD ==================== */

(() => {
    "use strict";

    const API = "http://127.0.0.1:8000/api";

    const contadores = [
        "totalUsuarios",
        "totalAnuncios",
        "usuariosAtivos",
        "anunciosDisponiveis"
    ];

    const legendas = [
        "legendaUsuarios",
        "legendaCategorias",
        "legendaStatus"
    ];

    /* ==================== CORES ==================== */

    const cores = [
        "#005386",
        "#0099FF",
        "#E4F8FF",
        "#77ADFF",
        "#17c8c2",
        "#3d94d7",
        "#0099FF",
        "#1cccdc",
        "#36949d"
    ];

    const nomesStatus = {
        A: "Disponível",
        N: "Em negociação",
        T: "Trocado",
        S: "Suspenso"
    };

    const coresStatus = {
        A: "#005386",
        N: "#0099FF",
        T: "#E4F8FF",
        S: "#77ADFF"
    };

    const graficos = {};
    let carregando = false;

    /* ==================== ELEMENTOS ==================== */

    function criarElemento(tag, classe, texto) {
        const elemento = document.createElement(tag);

        if (classe) {
            elemento.className = classe;
        }

        if (texto !== undefined) {
            elemento.textContent = texto ?? "";
        }

        return elemento;
    }

    function mostrarMensagem(id, texto) {
        const elemento = document.getElementById(id);

        if (!elemento) return;

        elemento.replaceChildren(
            criarElemento(
                "p",
                "dashboard-chart-message",
                texto
            )
        );
    }

    /* ==================== DATAS ==================== */

    function converterData(valor) {
        if (!valor) return null;

        const data = new Date(
            String(valor).replace(" ", "T")
        );

        return Number.isNaN(data.getTime())
            ? null
            : data;
    }

    function formatarData(valor) {
        const data = converterData(valor);

        if (!data) return "Data não informada";

        return data.toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });
    }

    function formatarSomenteData(valor) {
        const data = converterData(valor);

        if (!data) return "Não informada";

        return data.toLocaleDateString("pt-BR");
    }

    function formatarDataAtividade(valor) {
        const data = converterData(valor);

        if (!data) return "Data não informada";

        const hoje = new Date();

        const mesmoDia =
            data.getFullYear() === hoje.getFullYear() &&
            data.getMonth() === hoje.getMonth() &&
            data.getDate() === hoje.getDate();

        const hora = data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        if (mesmoDia) {
            return `Hoje, ${hora}`;
        }

        return formatarData(valor);
    }

    /* ==================== ATIVIDADES RECENTES ==================== */

    function preencherAtividades(atividades) {
        const painel = document.getElementById(
            "atividadesRecentes"
        );

        if (!painel) return;

        if (!atividades.length) {
            mostrarMensagem(
                "atividadesRecentes",
                "Nenhuma atividade encontrada."
            );
            return;
        }

        const lista = criarElemento(
            "ul",
            "atividades-lista"
        );

        atividades.forEach(atividade => {
            let icone = "fa-solid fa-clock";
            let classe = "atividade-azul";

            if (
                atividade.titulo ===
                "Novo usuário cadastrado"
            ) {
                icone = "fa-solid fa-user-plus";
                classe = "atividade-azul";

            } else if (
                atividade.titulo ===
                "Novo anúncio publicado"
            ) {
                icone = "fa-solid fa-box-open";
                classe = "atividade-verde";

            } else if (
                atividade.titulo ===
                "Nova denúncia recebida"
            ) {
                icone = "fa-solid fa-flag";
                classe = "atividade-vermelha";
            }

            const item = criarElemento(
                "li",
                "atividade-item"
            );

            const simbolo = criarElemento(
                "span",
                `atividade-icone ${classe}`
            );

            simbolo.setAttribute("aria-hidden", "true");
            simbolo.append(criarElemento("i", icone));

            const conteudo = criarElemento(
                "div",
                "atividade-conteudo"
            );

            conteudo.append(
                criarElemento(
                    "strong",
                    "",
                    atividade.titulo
                ),
                criarElemento(
                    "p",
                    "",
                    atividade.descricao
                )
            );

            const horario = criarElemento(
                "time",
                "atividade-data",
                formatarDataAtividade(
                    atividade.created_at
                )
            );

            horario.title = formatarData(
                atividade.created_at
            );

            item.append(simbolo, conteudo, horario);
            lista.append(item);
        });

        painel.replaceChildren(lista);
    }

    /* ==================== DENÚNCIAS RECENTES ==================== */

    function preencherDenuncias(denuncias) {
        const painel = document.getElementById(
            "denunciasRecentes"
        );

        if (!painel) return;

        if (!denuncias.length) {
            mostrarMensagem(
                "denunciasRecentes",
                "Nenhuma denúncia encontrada."
            );
            return;
        }

        const area = criarElemento(
            "div",
            "denuncias-tabela-area"
        );

        const tabela = criarElemento(
            "table",
            "denuncias-tabela"
        );

        tabela.setAttribute(
            "aria-label",
            "Denúncias recentes"
        );

        const cabecalho = document.createElement("thead");
        const linhaCabecalho = document.createElement("tr");

        ["ID", "Conteúdo", "Tipo", "Data"].forEach(titulo => {
            const coluna = criarElemento("th", "", titulo);

            coluna.scope = "col";
            linhaCabecalho.append(coluna);
        });

        cabecalho.append(linhaCabecalho);

        const corpo = document.createElement("tbody");

        denuncias.forEach(denuncia => {
            const linha = document.createElement("tr");

            // A API precisa retornar id_produto para identificar o tipo.
            const tipoInformado =
                Object.prototype.hasOwnProperty.call(
                    denuncia,
                    "id_produto"
                );

            const anuncio =
                denuncia.id_produto != null ||
                Boolean(denuncia.nm_produto);

            let tipo = "Não informado";
            let classeTipo = "denuncia-tipo";
            let conteudo =
                denuncia.ds_motivo ||
                "Denúncia recebida";

            if (anuncio) {
                tipo = "Anúncio";
                classeTipo += " tipo-anuncio";

                conteudo =
                    `Anúncio "${denuncia.nm_produto || "indisponível"}"`;

            } else if (tipoInformado) {
                tipo = "Usuário";
                classeTipo += " tipo-usuario";

                conteudo =
                    denuncia.ds_motivo ||
                    "Denúncia de usuário";
            }

            const colunaConteudo = criarElemento(
                "td",
                "denuncia-conteudo",
                conteudo
            );

            colunaConteudo.title = [
                denuncia.ds_motivo,
                denuncia.ds_denuncia
            ].filter(Boolean).join(" — ") || conteudo;

            const colunaTipo = document.createElement("td");

            colunaTipo.append(
                criarElemento(
                    "span",
                    classeTipo,
                    tipo
                )
            );

            linha.append(
                criarElemento(
                    "td",
                    "denuncia-id",
                    `#${denuncia.id_denuncia}`
                ),
                colunaConteudo,
                colunaTipo,
                criarElemento(
                    "td",
                    "denuncia-data",
                    formatarSomenteData(
                        denuncia.created_at
                    )
                )
            );

            corpo.append(linha);
        });

        tabela.append(cabecalho, corpo);
        area.append(tabela);

        painel.replaceChildren(area);
    }

    /* ==================== LEGENDAS ==================== */

    function preencherLegenda(id, itens) {
        const legenda = document.getElementById(id);

        if (!legenda) return;

        legenda.replaceChildren();

        itens.forEach(item => {
            const linha = criarElemento(
                "div",
                "dashboard-legend-item"
            );

            const cor = criarElemento(
                "span",
                "dashboard-legend-color"
            );

            cor.style.backgroundColor = item.cor;
            cor.setAttribute("aria-hidden", "true");

            linha.append(
                cor,
                criarElemento(
                    "span",
                    "dashboard-legend-label",
                    item.nome
                ),
                criarElemento(
                    "span",
                    "dashboard-legend-value",
                    Number(item.total)
                        .toLocaleString("pt-BR")
                )
            );

            legenda.append(linha);
        });
    }

    /* ==================== GRÁFICOS ==================== */

    function limparGraficos() {
        Object.keys(graficos).forEach(id => {
            graficos[id].destroy();
            delete graficos[id];
        });
    }

    function desenharGrafico(
        canvasId,
        legendaId,
        tipo,
        itens
    ) {
        const canvas = document.getElementById(canvasId);

        if (!canvas) return;

        if (!itens.length) {
            mostrarMensagem(
                legendaId,
                "Nenhum dado disponível."
            );
            return;
        }

        const valores = itens.map(
            item => Number(item.total)
        );

        const total = valores.reduce(
            (soma, valor) => soma + valor,
            0
        );

        if (tipo === "doughnut" && total === 0) {
            mostrarMensagem(
                legendaId,
                "Nenhum anúncio cadastrado."
            );
            return;
        }

        const corTexto = getComputedStyle(canvas)
            .getPropertyValue("color")
            .trim() || "#334155";

        const opcoes = {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label(contexto) {
                            const quantidade =
                                valores[contexto.dataIndex];

                            const nome =
                                itens[contexto.dataIndex].nome;

                            if (tipo === "bar") {
                                return `${nome}: ${quantidade} cadastros`;
                            }

                            const percentual =
                                total > 0
                                    ? quantidade / total * 100
                                    : 0;

                            const percentualFormatado =
                                percentual.toLocaleString(
                                    "pt-BR",
                                    {
                                        maximumFractionDigits: 1
                                    }
                                );

                            return (
                                `${nome}: ${quantidade} anúncios ` +
                                `(${percentualFormatado}%)`
                            );
                        }
                    }
                }
            }
        };

        if (tipo === "bar") {
            opcoes.scales = {
                x: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        color: corTexto
                    }
                },

                y: {
                    beginAtZero: true,

                    suggestedMax: Math.max(
                        1,
                        ...valores
                    ),

                    ticks: {
                        precision: 0,
                        color: corTexto
                    },

                    grid: {
                        color: "rgba(148, 163, 184, 0.18)"
                    }
                }
            };
        } else {
            opcoes.cutout = "65%";
        }

        const dataset = {
            label: tipo === "bar"
                ? "Usuários cadastrados"
                : "Anúncios",

            data: valores,
            backgroundColor: itens.map(item => item.cor),
            borderWidth: 0
        };

        if (tipo === "bar") {
            dataset.borderRadius = 6;
            dataset.maxBarThickness = 45;
        }

        graficos[canvasId] = new Chart(canvas, {
            type: tipo,

            data: {
                labels: itens.map(item => item.nome),
                datasets: [dataset]
            },

            options: opcoes
        });

        canvas.setAttribute(
            "aria-label",
            itens
                .map(item => `${item.nome}: ${item.total}`)
                .join("; ")
        );

        // O gráfico de usuários permanece sem legenda.
        if (canvasId === "graficoUsuarios") {
            document.getElementById(legendaId)
                ?.replaceChildren();
        } else {
            preencherLegenda(legendaId, itens);
        }
    }

    function preencherGraficos(dados) {
        limparGraficos();

        if (typeof Chart === "undefined") {
            legendas.forEach(id => {
                mostrarMensagem(
                    id,
                    "A biblioteca dos gráficos não carregou. Confira a conexão e a linha do Chart.js no HTML."
                );
            });
            return;
        }

        /* USUÁRIOS POR MÊS */

        if (Array.isArray(dados.usuariosPorMes)) {
            desenharGrafico(
                "graficoUsuarios",
                "legendaUsuarios",
                "bar",

                dados.usuariosPorMes.map((mes, indice) => ({
                    nome: mes.nome,
                    total: mes.total,
                    cor: cores[indice % cores.length]
                }))
            );
        } else {
            mostrarMensagem(
                "legendaUsuarios",
                "Atualize o DashboardController.php com o campo usuariosPorMes."
            );
        }

        /* ANÚNCIOS POR CATEGORIA */

        desenharGrafico(
            "graficoCategorias",
            "legendaCategorias",
            "doughnut",

            dados.categorias.map(categoria => {
                const id = Number(categoria.id_categoria);

                const indice =
                    Number.isInteger(id) && id > 0
                        ? (id - 1) % cores.length
                        : -1;

                return {
                    nome: categoria.nm_categoria,
                    total: categoria.total,
                    cor: indice >= 0
                        ? cores[indice]
                        : "#A16207"
                };
            })
        );

        /* STATUS DOS ANÚNCIOS */

        const ordemStatus = ["A", "N", "T", "S"];

        const statusOrdenados = [...dados.status].sort(
            (a, b) => {
                const posicaoA =
                    ordemStatus.indexOf(a.st_status);

                const posicaoB =
                    ordemStatus.indexOf(b.st_status);

                return (
                    (posicaoA < 0 ? 99 : posicaoA) -
                    (posicaoB < 0 ? 99 : posicaoB)
                );
            }
        );

        desenharGrafico(
            "graficoStatus",
            "legendaStatus",
            "doughnut",

            statusOrdenados.map(item => ({
                nome:
                    nomesStatus[item.st_status] ||
                    `Outro (${item.st_status ?? "sem status"})`,

                total: item.total,

                cor:
                    coresStatus[item.st_status] ||
                    "#64748B"
            }))
        );
    }

    /* ==================== BUSCAR DADOS ==================== */

    async function carregarDashboard() {
        if (carregando) return;

        const token =
            localStorage.getItem("adminToken") ||
            sessionStorage.getItem("adminToken");

        if (!token) {
            window.location.href =
                "../autenticação/index.html";
            return;
        }

        carregando = true;

        const botao = document.getElementById(
            "atualizarDashboard"
        );

        const aviso = document.getElementById(
            "dashboardStatus"
        );

        if (botao) botao.disabled = true;

        if (aviso) {
            aviso.textContent = "Carregando dados...";
        }

        limparGraficos();

        [
            "atividadesRecentes",
            "denunciasRecentes",
            ...legendas
        ].forEach(id => {
            mostrarMensagem(id, "Carregando...");
        });

        contadores.forEach(id => {
            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.textContent = "...";
            }
        });

        const controller = new AbortController();

        const timeout = setTimeout(
            () => controller.abort(),
            20000
        );

        try {
            const resposta = await fetch(
                `${API}/admin/dashboard`,
                {
                    method: "GET",

                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    signal: controller.signal,
                    cache: "no-store"
                }
            );

            if (resposta.status === 401) {
                localStorage.removeItem("adminToken");
                sessionStorage.removeItem("adminToken");

                window.location.href =
                    "../autenticação/index.html";
                return;
            }

            if (!resposta.ok) {
                if (resposta.status === 403) {
                    throw new Error(
                        "Esta conta não possui acesso de administrador."
                    );
                }

                if (resposta.status === 404) {
                    throw new Error(
                        "A rota /api/admin/dashboard não foi encontrada."
                    );
                }

                throw new Error(
                    `Erro ao carregar dados (HTTP ${resposta.status}).`
                );
            }

            const dados = await resposta.json();

            const formatoValido =
                dados &&
                dados.resumo &&
                [
                    "atividades",
                    "denuncias",
                    "categorias",
                    "status"
                ].every(chave => Array.isArray(dados[chave]));

            if (!formatoValido) {
                throw new Error(
                    "A API retornou dados em formato inesperado."
                );
            }

            /* CONTADORES */

            contadores.forEach(id => {
                const elemento = document.getElementById(id);

                if (elemento) {
                    elemento.textContent = Number(
                        dados.resumo[id]
                    ).toLocaleString("pt-BR");
                }
            });

            /* ATIVIDADES COM ÍCONES */

            preencherAtividades(dados.atividades);

            /* DENÚNCIAS EM TABELA */

            preencherDenuncias(dados.denuncias);

            /* GRÁFICOS */

            let falhaGraficos = false;

            try {
                preencherGraficos(dados);

            } catch (erroGrafico) {
                falhaGraficos = true;

                console.error(
                    "Erro nos gráficos:",
                    erroGrafico
                );

                limparGraficos();

                legendas.forEach(id => {
                    mostrarMensagem(
                        id,
                        "Não foi possível desenhar o gráfico. Confira o console do navegador."
                    );
                });
            }

            if (aviso) {
                const horario =
                    new Date().toLocaleString("pt-BR");

                aviso.textContent = falhaGraficos
                    ? `Dados atualizados em ${horario}. Falha ao desenhar os gráficos.`
                    : `Dados atualizados em ${horario}`;
            }

        } catch (erro) {
            console.error("Erro no dashboard:", erro);

            let mensagem = erro.message;

            if (erro.name === "AbortError") {
                mensagem =
                    "A API demorou para responder. Tente novamente.";

            } else if (erro instanceof TypeError) {
                mensagem =
                    "Não foi possível acessar a API. Confira se ela está iniciada e se o CORS permite o endereço do Admin.";
            }

            if (aviso) {
                aviso.textContent = mensagem;
            }

            contadores.forEach(id => {
                const elemento = document.getElementById(id);

                if (elemento) {
                    elemento.textContent = "—";
                }
            });

            [
                "atividadesRecentes",
                "denunciasRecentes",
                ...legendas
            ].forEach(id => {
                mostrarMensagem(
                    id,
                    "Dados indisponíveis. Clique em Atualizar dados para tentar novamente."
                );
            });

        } finally {
            clearTimeout(timeout);
            carregando = false;

            if (botao) {
                botao.disabled = false;
            }
        }
    }

    /* ==================== SIDEBAR E INICIALIZAÇÃO ==================== */

    function iniciar() {
        const sidebar = document.getElementById("sidebar");

        const sidebarToggle = document.getElementById(
            "sidebarToggle"
        );

        const sidebarToggleIcon = document.getElementById(
            "sidebarToggleIcon"
        );

        function atualizarSidebar() {
            if (!sidebar || !sidebarToggle) return;

            const recolhida = sidebar.classList.contains(
                "active"
            );

            if (sidebarToggleIcon) {
                sidebarToggleIcon.className = recolhida
                    ? "fa-solid fa-chevron-right"
                    : "fa-solid fa-chevron-left";
            }

            sidebarToggle.setAttribute(
                "aria-expanded",
                String(!recolhida)
            );

            sidebarToggle.setAttribute(
                "aria-label",
                recolhida
                    ? "Expandir menu lateral"
                    : "Recolher menu lateral"
            );
        }

        if (sidebar && sidebarToggle) {
            sidebar.classList.toggle(
                "active",
                localStorage.getItem("sidebarState") ===
                    "collapsed"
            );

            atualizarSidebar();

            sidebarToggle.addEventListener("click", () => {
                sidebar.classList.toggle("active");

                localStorage.setItem(
                    "sidebarState",
                    sidebar.classList.contains("active")
                        ? "collapsed"
                        : "expanded"
                );

                atualizarSidebar();
            });
        }

        /* NOME DO ADMINISTRADOR */

        const nome =
            localStorage.getItem("adminNome") ||
            "Administrador";

        ["nome-admin", "nome-admin-topo"].forEach(id => {
            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.textContent = nome;
            }
        });

        /* ATUALIZAR GRÁFICOS AO TROCAR O TEMA */

        const observadorTema = new MutationObserver(() => {
            Object.values(graficos).forEach(grafico => {
                const cor = getComputedStyle(
                    grafico.canvas
                ).color;

                if (grafico.options.scales?.x) {
                    grafico.options.scales.x.ticks.color =
                        cor;

                    grafico.options.scales.y.ticks.color =
                        cor;
                }

                grafico.update("none");
            });
        });

        observadorTema.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-tema"]
        });

        /* FONTE DOS GRÁFICOS */

        if (typeof Chart !== "undefined") {
            Chart.defaults.font.family =
                "Poppins, sans-serif";
        }

        /* CARREGAMENTO DO DASHBOARD */

        if (!document.getElementById("totalUsuarios")) {
            return;
        }

        document.getElementById("atualizarDashboard")
            ?.addEventListener("click", carregarDashboard);

        carregarDashboard();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciar
        );
    } else {
        iniciar();
    }
})();