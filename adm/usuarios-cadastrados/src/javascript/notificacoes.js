
/* ============================================================
   NOTIFICAÇÕES DO ADMINISTRADOR
   Compatível com Usuários, Dashboard e Denúncias
   ============================================================ */

(() => {
    "use strict";

    function iniciarNotificacoes() {

        const $ = id => document.getElementById(id);

        const el = {
            container: $("notificacoes-container"),
            botao: $("btn-notificacoes"),
            painel: $("painel-notificacoes"),
            contador: $("notificacoes-contador"),
            lista: $("notificacoes-lista"),
            status: $("notificacoes-status"),
            fechar: $("btn-fechar-notificacoes"),
            atualizar: $("btn-atualizar-notificacoes"),

            modal: $("notificationDetailsDialog"),
            titulo: $("notificationDetailsTitle"),
            dados: $("notificationDetailsData"),
            descricao: $("reportDescription"),
            imagensStatus: $("imagesStatus"),
            imagens: $("evidenceGrid"),
            ampliacao: $("imagePreview"),
            imagemAmpliada: $("previewImage"),
            fecharAmpliacao: $("closePreview"),
            statusModal: $("detailsStatus"),
            leitura: $("readNotice"),
            marcarLida: $("markReadButton"),
            fecharModal: $("closeNotificationDetails")
        };

        const obrigatorios = Object.keys(el);

        const ausentes = obrigatorios.filter(
            chave => !el[chave]
        );

        if (ausentes.length) {
            console.error(
                "Notificações: elementos ausentes:",
                ausentes
            );
            return;
        }

        if (el.container.dataset.inicializado === "true") {
            return;
        }

        el.container.dataset.inicializado = "true";

        const API = "http://127.0.0.1:8000/api";
        const BASE = "/admin/notificacoes";

        let notificacoes = [];
        let denunciaAtual = null;
        let carregando = false;
        let salvando = false;
        let sessaoInvalida = false;

        let versaoModal = 0;
        let controllerModal = null;
        let origemModal = null;
        let origemAmpliacao = null;

        const urlsImagens = new Set();

        /* ====================================================
           AUXILIARES
           ==================================================== */

        function criar(tag, classe, texto) {
            const elemento = document.createElement(tag);

            if (classe) {
                elemento.className = classe;
            }

            if (texto !== undefined) {
                elemento.textContent = texto ?? "";
            }

            return elemento;
        }

        function formatarData(valor) {
            if (!valor) {
                return "Data não informada";
            }

            const data = new Date(
                String(valor).replace(" ", "T")
            );

            if (Number.isNaN(data.getTime())) {
                return "Data não informada";
            }

            return data.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        }

        function mensagemErro(erro) {
            if (erro.name === "AbortError") {
                return "A consulta demorou para responder.";
            }

            if (erro instanceof TypeError) {
                return "Não foi possível conectar à API. Verifique se o Laravel está funcionando.";
            }

            return erro.message ||
                "Não foi possível concluir a operação.";
        }

        function mostrarStatus(texto, erro = false) {
            el.status.textContent = texto;
            el.status.hidden = !texto;
            el.status.dataset.erro = String(erro);
        }

        function mostrarStatusModal(texto, erro = false) {
            el.statusModal.textContent = texto;
            el.statusModal.hidden = !texto;
            el.statusModal.dataset.erro = String(erro);
        }

        /* ====================================================
           REQUISIÇÕES
           ==================================================== */

        async function requisitar(
            caminho,
            {
                method = "GET",
                imagem = false,
                signal = null
            } = {}
        ) {
            const token =
                localStorage.getItem("adminToken") ||
                sessionStorage.getItem("adminToken");

            if (!token) {
                sessaoInvalida = true;

                throw new Error(
                    "Faça login novamente para acessar as notificações."
                );
            }

            const controller = new AbortController();

            const cancelar = () => controller.abort();

            if (signal) {
                if (signal.aborted) {
                    controller.abort();
                } else {
                    signal.addEventListener(
                        "abort",
                        cancelar,
                        { once: true }
                    );
                }
            }

            const timeout = setTimeout(
                () => controller.abort(),
                20000
            );

            try {
                const resposta = await fetch(
                    `${API}${caminho}`,
                    {
                        method,

                        headers: {
                            Accept: imagem
                                ? "image/jpeg,image/png,image/webp,application/json"
                                : "application/json",

                            Authorization: `Bearer ${token}`
                        },

                        cache: "no-store",
                        signal: controller.signal
                    }
                );

                if (resposta.status === 401) {
                    sessaoInvalida = true;

                    throw new Error(
                        "Sua sessão expirou. Faça login novamente."
                    );
                }

                if (resposta.status === 403) {
                    throw new Error(
                        "Você não possui autorização para acessar essas informações."
                    );
                }

                if (!resposta.ok) {
                    const retorno = await resposta.json()
                        .catch(() => null);

                    throw new Error(
                        retorno?.message ||
                        `Erro HTTP ${resposta.status}.`
                    );
                }

                if (imagem) {
                    const arquivo = await resposta.blob();

                    const permitidos = [
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                    ];

                    const tipo = arquivo.type
                        .split(";")[0]
                        .toLowerCase();

                    if (!permitidos.includes(tipo)) {
                        throw new Error(
                            "Formato de imagem inválido."
                        );
                    }

                    return arquivo;
                }

                return await resposta.json();

            } finally {
                clearTimeout(timeout);

                signal?.removeEventListener(
                    "abort",
                    cancelar
                );
            }
        }

        /* ====================================================
           CONTADOR
           ==================================================== */

        function atualizarContador(valor) {
            const quantidade = Math.max(
                0,
                Math.floor(Number(valor) || 0)
            );

            el.contador.textContent =
                quantidade > 99
                    ? "99+"
                    : String(quantidade);

            el.contador.hidden = quantidade === 0;

            el.botao.setAttribute(
                "aria-label",
                quantidade
                    ? `Notificações: ${quantidade} não lidas`
                    : "Notificações: nenhuma não lida"
            );
        }

        function atualizarBotoes() {
            el.atualizar.disabled =
                carregando || salvando || sessaoInvalida;

            el.lista.setAttribute(
                "aria-busy",
                String(carregando || salvando)
            );

            el.lista.querySelectorAll(
                ".notificacao-marcar-lida"
            ).forEach(botao => {
                botao.disabled =
                    carregando || salvando || sessaoInvalida;
            });

            el.marcarLida.disabled =
                salvando ||
                carregando ||
                sessaoInvalida ||
                !denunciaAtual ||
                denunciaAtual.lida === true;
        }

        /* ====================================================
           PAINEL
           ==================================================== */

        function fecharPainel(devolverFoco = false) {
            el.painel.hidden = true;

            el.botao.setAttribute(
                "aria-expanded",
                "false"
            );

            if (devolverFoco) {
                el.botao.focus();
            }
        }

        el.botao.addEventListener("click", () => {
            const abrir = el.painel.hidden;

            el.painel.hidden = !abrir;

            el.botao.setAttribute(
                "aria-expanded",
                String(abrir)
            );

            if (abrir) {
                carregarNotificacoes(true);
            }
        });

        el.fechar.addEventListener("click", () => {
            fecharPainel(true);
        });

        document.addEventListener("click", evento => {
            if (!el.container.contains(evento.target)) {
                fecharPainel();
            }
        });

        document.addEventListener("keydown", evento => {
            if (
                evento.key === "Escape" &&
                !el.modal.open &&
                !el.painel.hidden
            ) {
                fecharPainel(true);
            }
        });

        /* ====================================================
           RENDERIZAR LISTA
           ==================================================== */

        function renderizarLista() {
            const fragmento =
                document.createDocumentFragment();

            notificacoes.forEach(notificacao => {
                const lida = notificacao.lida === true;

                const item = criar(
                    "article",
                    lida
                        ? "notificacao-item"
                        : "notificacao-item nao-lida"
                );

                const icone = criar(
                    "div",
                    "notificacao-icone"
                );

                icone.append(
                    criar("i", "fa-solid fa-flag")
                );

                const conteudo = criar(
                    "div",
                    "notificacao-conteudo"
                );

                const descricao = String(
                    notificacao.descricao || ""
                );

                conteudo.append(
                    criar(
                        "strong",
                        "notificacao-titulo",
                        notificacao.titulo ||
                            "Nova denúncia de usuário"
                    ),

                    criar(
                        "p",
                        "notificacao-usuario",
                        `Usuário: ${
                            notificacao.usuario_denunciado ||
                            "Indisponível"
                        }`
                    ),

                    criar(
                        "p",
                        "notificacao-motivo",
                        `Motivo: ${
                            notificacao.motivo ||
                            "Não informado"
                        }`
                    ),

                    criar(
                        "p",
                        "notificacao-descricao",
                        descricao.length > 120
                            ? `${descricao.slice(0, 120)}…`
                            : descricao
                    ),

                    criar(
                        "time",
                        "notificacao-data",
                        formatarData(notificacao.data)
                    )
                );

                const detalhes = criar(
                    "button",
                    "notificacao-ver-detalhes",
                    "Ver detalhes"
                );

                detalhes.type = "button";

                detalhes.addEventListener("click", () => {
                    abrirDenuncia(
                        notificacao.id,
                        detalhes
                    );
                });

                conteudo.append(detalhes);

                if (lida) {
                    conteudo.append(
                        criar(
                            "span",
                            "notificacao-lida",
                            "Lida"
                        )
                    );
                } else {
                    const marcar = criar(
                        "button",
                        "notificacao-marcar-lida",
                        "Marcar como lida"
                    );

                    marcar.type = "button";

                    marcar.addEventListener("click", () => {
                        marcarComoLida(notificacao.id);
                    });

                    conteudo.append(marcar);
                }

                item.append(icone, conteudo);
                fragmento.append(item);
            });

            el.lista.replaceChildren(fragmento);

            atualizarBotoes();
        }

        /* ====================================================
           CARREGAR NOTIFICAÇÕES
           ==================================================== */

        async function carregarNotificacoes(manual = false) {
            if (
                carregando ||
                salvando ||
                sessaoInvalida
            ) {
                return;
            }

            if (
                !manual &&
                (
                    el.modal.open ||
                    el.lista.contains(document.activeElement)
                )
            ) {
                return;
            }

            carregando = true;
            atualizarBotoes();

            if (manual || !notificacoes.length) {
                mostrarStatus("Carregando notificações...");
            }

            try {
                const dados = await requisitar(BASE);

                if (
                    !Array.isArray(dados?.notificacoes) ||
                    !Number.isFinite(Number(dados.nao_lidas))
                ) {
                    throw new Error(
                        "A API retornou um formato de notificações inválido."
                    );
                }

                notificacoes = dados.notificacoes;

                atualizarContador(dados.nao_lidas);

                renderizarLista();

                mostrarStatus(
                    notificacoes.length
                        ? ""
                        : "Nenhuma notificação encontrada."
                );

            } catch (erro) {
                console.error(
                    "Erro ao carregar notificações:",
                    erro
                );

                mostrarStatus(mensagemErro(erro), true);

            } finally {
                carregando = false;
                atualizarBotoes();
            }
        }

        /* ====================================================
           DADOS DO MODAL
           ==================================================== */

        function adicionarDado(rotulo, valor) {
            const dt = criar("dt", "", rotulo);
            const dd = criar(
                "dd",
                "",
                valor || "Não informado"
            );

            el.dados.append(dt, dd);
        }

        function limparModal() {
            el.dados.replaceChildren();

            el.descricao.textContent = "";

            el.imagens.replaceChildren();

            el.imagensStatus.textContent = "";

            el.ampliacao.hidden = true;

            el.imagemAmpliada.removeAttribute("src");

            el.leitura.textContent = "";

            el.marcarLida.hidden = false;

            urlsImagens.forEach(url => {
                URL.revokeObjectURL(url);
            });

            urlsImagens.clear();

            origemAmpliacao = null;
        }

        /* ====================================================
           ABRIR DENÚNCIA
           ==================================================== */

        async function abrirDenuncia(id, origem) {
            fecharPainel();

            origemModal = origem;

            controllerModal?.abort();

            controllerModal = new AbortController();

            const controller = controllerModal;
            const versao = ++versaoModal;

            denunciaAtual = null;

            limparModal();

            el.titulo.textContent =
                "Detalhes da denúncia";

            mostrarStatusModal(
                "Carregando detalhes da denúncia..."
            );

            if (!el.modal.open) {
                el.modal.showModal();
            }

            try {
                const dados = await requisitar(
                    `${BASE}/${encodeURIComponent(id)}`,
                    {
                        signal: controller.signal
                    }
                );

                if (
                    versao !== versaoModal ||
                    !el.modal.open
                ) {
                    return;
                }

                if (
                    String(dados?.id) !== String(id) ||
                    !Array.isArray(dados.imagens)
                ) {
                    throw new Error(
                        "Os detalhes retornados pela API estão incompletos."
                    );
                }

                denunciaAtual = dados;

               el.titulo.textContent = "Detalhes da denúncia";

                adicionarDado("Número", `#${dados.id}`);

                adicionarDado(
                    "Usuário denunciado",
                    dados.usuario_denunciado
                );

                adicionarDado(
                    "Data",
                    formatarData(dados.data)
                );

                adicionarDado(
                    "Status",
                    dados.status_denuncia === "P"
                        ? "Pendente"
                        : dados.status_denuncia
                );

                adicionarDado("Motivo", dados.motivo);

                el.descricao.textContent =
                    dados.descricao ||
                    "Nenhuma descrição informada.";

                el.leitura.textContent =
                    dados.lida === true
                        ? "Esta notificação já foi lida."
                        : "Esta notificação ainda não foi lida.";

                el.marcarLida.hidden =
                    dados.lida === true;

                mostrarStatusModal("");

                atualizarBotoes();

                await carregarImagens(
                    dados,
                    versao,
                    controller.signal
                );

            } catch (erro) {
                if (
                    versao !== versaoModal ||
                    !el.modal.open
                ) {
                    return;
                }

                console.error(
                    "Erro ao abrir denúncia:",
                    erro
                );

                mostrarStatusModal(
                    mensagemErro(erro),
                    true
                );
            }
        }

        /* ====================================================
           CARREGAR IMAGENS
           ==================================================== */

        async function carregarImagens(
            denuncia,
            versao,
            signal
        ) {
            if (!denuncia.imagens.length) {
                el.imagensStatus.textContent =
                    "Nenhuma imagem foi anexada.";

                return;
            }

            el.imagensStatus.textContent =
                "Carregando imagens...";

            let carregadas = 0;
            let falhas = 0;

            for (const imagem of denuncia.imagens) {
                if (
                    signal.aborted ||
                    versao !== versaoModal
                ) {
                    return;
                }

                try {
                    const ordem = Number(imagem.ordem);

                    if (
                        !Number.isInteger(ordem) ||
                        ordem < 1
                    ) {
                        throw new Error(
                            "Ordem de imagem inválida."
                        );
                    }

                    const arquivo = await requisitar(
                        `${BASE}/${encodeURIComponent(denuncia.id)}/imagens/${ordem}`,
                        {
                            imagem: true,
                            signal
                        }
                    );

                    if (
                        signal.aborted ||
                        versao !== versaoModal ||
                        !el.modal.open
                    ) {
                        return;
                    }

                    const url = URL.createObjectURL(arquivo);

                    urlsImagens.add(url);

                    const botao = criar(
                        "button",
                        "denuncia-imagem-botao"
                    );

                    botao.type = "button";

                    const miniatura = criar("img");

                    miniatura.src = url;

                    miniatura.alt =
                        `Evidência ${ordem} da denúncia`;

                    botao.append(
                        miniatura,
                        criar(
                            "span",
                            "",
                            `Imagem ${ordem} · Ampliar`
                        )
                    );

                    botao.addEventListener("click", () => {
                        origemAmpliacao = botao;

                        el.imagemAmpliada.src = url;

                        el.imagemAmpliada.alt =
                            `Evidência ${ordem} ampliada`;

                        el.ampliacao.hidden = false;

                        el.fecharAmpliacao.focus();
                    });

                    el.imagens.append(botao);

                    carregadas++;

                } catch (erro) {
                    if (
                        signal.aborted ||
                        versao !== versaoModal
                    ) {
                        return;
                    }

                    console.error(
                        "Erro ao carregar imagem:",
                        erro
                    );

                    falhas++;
                }
            }

            if (
                signal.aborted ||
                versao !== versaoModal
            ) {
                return;
            }

            el.imagensStatus.textContent = falhas
                ? `${carregadas} imagem(ns) carregada(s). Não foi possível carregar todos os anexos.`
                : "Clique em uma imagem para ampliar.";
        }

        /* ====================================================
           AMPLIAÇÃO
           ==================================================== */

        function fecharImagemAmpliada() {
            el.ampliacao.hidden = true;

            el.imagemAmpliada.removeAttribute("src");

            if (origemAmpliacao?.isConnected) {
                origemAmpliacao.focus();
            }

            origemAmpliacao = null;
        }

        el.fecharAmpliacao.addEventListener(
            "click",
            fecharImagemAmpliada
        );

        el.modal.addEventListener("cancel", evento => {
            if (!el.ampliacao.hidden) {
                evento.preventDefault();

                fecharImagemAmpliada();
            }
        });

        /* ====================================================
           FECHAR MODAL
           ==================================================== */

        el.fecharModal.addEventListener("click", () => {
            el.modal.close();
        });

        el.modal.addEventListener("close", () => {
            versaoModal++;

            controllerModal?.abort();

            limparModal();

            denunciaAtual = null;

            if (origemModal?.isConnected) {
                origemModal.focus();
            } else {
                el.botao.focus();
            }

            origemModal = null;
        });

        /* ====================================================
           MARCAR COMO LIDA
           ==================================================== */

        async function marcarComoLida(id) {
            if (
                salvando ||
                carregando ||
                sessaoInvalida
            ) {
                return;
            }

            salvando = true;
            atualizarBotoes();

            const idAtual = String(id);

            try {
                const retorno = await requisitar(
                    `${BASE}/${encodeURIComponent(id)}/lida`,
                    {
                        method: "PUT"
                    }
                );

                if (
                    retorno?.lida !== true ||
                    !Number.isFinite(Number(retorno.nao_lidas))
                ) {
                    throw new Error(
                        "A API não confirmou a leitura da denúncia."
                    );
                }

                atualizarContador(retorno.nao_lidas);

                notificacoes = notificacoes.map(item => {
                    if (String(item.id) === idAtual) {
                        return {
                            ...item,
                            lida: true
                        };
                    }

                    return item;
                });

                renderizarLista();

                mostrarStatus(
                    "Notificação marcada como lida."
                );

                if (
                    denunciaAtual &&
                    String(denunciaAtual.id) === idAtual
                ) {
                    denunciaAtual.lida = true;

                    el.leitura.textContent =
                        "Esta notificação já foi lida.";

                    el.marcarLida.hidden = true;
                }

            } catch (erro) {
                console.error(
                    "Erro ao marcar como lida:",
                    erro
                );

                mostrarStatusModal(
                    mensagemErro(erro),
                    true
                );

            } finally {
                salvando = false;
                atualizarBotoes();
            }
        }

        el.marcarLida.addEventListener("click", () => {
            if (denunciaAtual) {
                marcarComoLida(denunciaAtual.id);
            }
        });

        /* ====================================================
           ATUALIZAÇÃO
           ==================================================== */

        el.atualizar.addEventListener("click", () => {
            carregarNotificacoes(true);
        });

        /* ====================================================
           INICIALIZAÇÃO E ATUALIZAÇÃO AUTOMÁTICA
           ==================================================== */

        carregarNotificacoes();

        setInterval(() => {
            if (!document.hidden) {
                carregarNotificacoes();
            }
        }, 30000);

        document.addEventListener(
            "visibilitychange",
            () => {
                if (!document.hidden) {
                    carregarNotificacoes();
                }
            }
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciarNotificacoes
        );
    } else {
        iniciarNotificacoes();
    }

})();

(() => {
    const dl = document.getElementById("notificationDetailsData");

    if (!dl) return;

    const agruparEmCards = () => {
        const filhos = Array.from(dl.children);

        const temSolto = filhos.some(
            el => el.tagName === "DT" || el.tagName === "DD"
        );

        if (!temSolto) return;

        observer.disconnect();

        dl.replaceChildren();

        for (let i = 0; i < filhos.length; i += 2) {
            const card = document.createElement("div");

            card.append(filhos[i]);

            if (filhos[i + 1]) {
                card.append(filhos[i + 1]);
            }

            dl.append(card);
        }

        observer.observe(dl, { childList: true });
    };

    const observer = new MutationObserver(agruparEmCards);

    observer.observe(dl, { childList: true });
})();

(() => {
    const dl = document.getElementById("notificationDetailsData");

    if (!dl) return;

    const nomes = {
        "Número": "Número da denúncia",
        "Status": "Status da denúncia"
    };

    const renomear = () => {
        dl.querySelectorAll("dt").forEach(dt => {
            const novo = nomes[dt.textContent.trim()];

            if (novo) dt.textContent = novo;
        });
    };

    new MutationObserver(renomear)
        .observe(dl, { childList: true, subtree: true });

    renomear();
})();

(() => {
    const aviso = document.getElementById("readNotice");

    if (!aviso) return;

    const renomear = () => {
        if (aviso.textContent.trim() === "Esta notificação já foi lida.") {
            aviso.textContent = "Notificação lida.";
        }
    };

    new MutationObserver(renomear)
        .observe(aviso, { childList: true, characterData: true, subtree: true });

    renomear();
})();