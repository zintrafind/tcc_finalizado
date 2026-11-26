/* ============================================================
   NOTIFICAÇÕES DO ADMINISTRADOR — DENÚNCIAS
   Compatível com o index.html atual da página de Denúncias
   ============================================================ */

(() => {
    "use strict";

    function iniciarNotificacoes() {

        const obter = id => document.getElementById(id);

        const elementos = {
            container: obter("notificacoes-container"),
            botao: obter("btn-notificacoes"),
            painel: obter("painel-notificacoes"),
            contador: obter("notificacoes-contador"),
            lista: obter("notificacoes-lista"),
            status: obter("notificacoes-status"),
            fechar: obter("btn-fechar-notificacoes"),
            atualizar: obter("btn-atualizar-notificacoes"),

            // Modal que realmente existe no index.html
            modal: obter("detailsDialog"),
            titulo: obter("detailsTitle"),
            dados: obter("detailsData"),
            descricao: obter("reportDescription"),
            imagensStatus: obter("imagesStatus"),
            imagens: obter("evidenceGrid"),
            ampliacao: obter("imagePreview"),
            imagemAmpliada: obter("previewImage"),
            fecharAmpliacao: obter("closePreview"),
            statusModal: obter("detailsStatus"),
            leitura: obter("readNotice"),
            marcarLida: obter("markReadButton")
        };

        const obrigatorios = [
            "container",
            "botao",
            "painel",
            "contador",
            "lista",
            "status",
            "fechar",
            "atualizar",
            "modal",
            "titulo",
            "dados",
            "descricao",
            "imagensStatus",
            "imagens",
            "ampliacao",
            "imagemAmpliada",
            "fecharAmpliacao",
            "statusModal",
            "leitura",
            "marcarLida"
        ];

        const ausentes = obrigatorios.filter(
            chave => !elementos[chave]
        );

        if (ausentes.length) {
            console.error(
                "Notificações: elementos ausentes:",
                ausentes
            );
            return;
        }

        if (
            elementos.container.dataset.inicializado === "true"
        ) {
            return;
        }

        elementos.container.dataset.inicializado = "true";

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
           FUNÇÕES AUXILIARES
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

            elementos.status.textContent = texto;
            elementos.status.hidden = !texto;
            elementos.status.dataset.erro = String(erro);
        }

        function mostrarStatusModal(texto, erro = false) {

            elementos.statusModal.textContent = texto;
            elementos.statusModal.dataset.erro = String(erro);
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

                    sessaoInvalida = true;

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

            elementos.contador.textContent =
                quantidade > 99
                    ? "99+"
                    : String(quantidade);

            elementos.contador.hidden = quantidade === 0;

            elementos.botao.setAttribute(
                "aria-label",
                quantidade
                    ? `Notificações: ${quantidade} não lidas`
                    : "Notificações: nenhuma não lida"
            );
        }

        function atualizarBotoes() {

            elementos.atualizar.disabled =
                carregando || salvando || sessaoInvalida;

            elementos.lista.setAttribute(
                "aria-busy",
                String(carregando || salvando)
            );

            elementos.lista.querySelectorAll(
                ".notificacao-marcar-lida"
            ).forEach(botao => {
                botao.disabled =
                    carregando || salvando || sessaoInvalida;
            });

            elementos.marcarLida.disabled =
                salvando ||
                carregando ||
                sessaoInvalida ||
                !denunciaAtual ||
                denunciaAtual.lida === true;

            elementos.marcarLida.textContent =
                salvando
                    ? "Salvando..."
                    : "Marcar como lida";
        }

        /* ====================================================
           ABRIR E FECHAR O PAINEL
           ==================================================== */

        function fecharPainel(devolverFoco = false) {

            elementos.painel.hidden = true;

            elementos.botao.setAttribute(
                "aria-expanded",
                "false"
            );

            if (devolverFoco) {
                elementos.botao.focus();
            }
        }

        elementos.botao.addEventListener("click", () => {

            const abrir = elementos.painel.hidden;

            elementos.painel.hidden = !abrir;

            elementos.botao.setAttribute(
                "aria-expanded",
                String(abrir)
            );

            if (abrir) {
                carregarNotificacoes(true);
            }
        });

        elementos.fechar.addEventListener("click", () => {
            fecharPainel(true);
        });

        document.addEventListener("click", evento => {

            if (
                !elementos.container.contains(evento.target)
            ) {
                fecharPainel();
            }
        });

        document.addEventListener("keydown", evento => {

            if (
                evento.key === "Escape" &&
                !elementos.modal.open &&
                !elementos.painel.hidden
            ) {
                fecharPainel(true);
            }
        });

        /* ====================================================
           RENDERIZAR NOTIFICAÇÕES
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

            elementos.lista.replaceChildren(fragmento);

            atualizarBotoes();
        }

        /* ====================================================
           BUSCAR NOTIFICAÇÕES
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
                    elementos.modal.open ||
                    elementos.lista.contains(
                        document.activeElement
                    )
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

                mostrarStatus(
                    mensagemErro(erro),
                    true
                );

            } finally {

                carregando = false;
                atualizarBotoes();
            }
        }

        /* ====================================================
           MODAL DE DETALHES
           ==================================================== */

        function adicionarDado(rotulo, valor) {

    const card = criar("div");

    card.append(
        criar("dt", "", rotulo),
        criar("dd", "", valor || "Não informado")
    );

    elementos.dados.append(card);
}
        function limparModal() {

            elementos.dados.replaceChildren();

            elementos.descricao.textContent = "";

            elementos.imagens.replaceChildren();

            elementos.imagensStatus.textContent = "";

            elementos.ampliacao.hidden = true;

            elementos.imagemAmpliada.removeAttribute("src");

            elementos.leitura.textContent = "";

            elementos.marcarLida.hidden = false;

            urlsImagens.forEach(url => {
                URL.revokeObjectURL(url);
            });

            urlsImagens.clear();

            origemAmpliacao = null;
        }

        async function abrirDenuncia(id, origem) {

            fecharPainel();

            origemModal = origem;

            controllerModal?.abort();

            controllerModal = new AbortController();

            const controller = controllerModal;

            const versao = ++versaoModal;

            denunciaAtual = null;

            limparModal();

            elementos.titulo.textContent =
                "Detalhes da denúncia";

            mostrarStatusModal(
                "Carregando detalhes da denúncia..."
            );

            if (!elementos.modal.open) {
                elementos.modal.showModal();
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
                    !elementos.modal.open
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

                adicionarDado(
                    "Número",
                    `#${dados.id}`
                );

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

                adicionarDado(
                    "Motivo",
                    dados.motivo
                );

                elementos.descricao.textContent =
                    dados.descricao ||
                    "Nenhuma descrição informada.";

                elementos.leitura.textContent =
                    dados.lida === true
                        ? "Notificação lida."
                        : "Esta notificação ainda não foi lida.";

                elementos.marcarLida.hidden =
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
                    !elementos.modal.open
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
           IMAGENS DA DENÚNCIA
           ==================================================== */

        async function carregarImagens(
            denuncia,
            versao,
            signal
        ) {

            if (!denuncia.imagens.length) {

                elementos.imagensStatus.textContent =
                    "Nenhuma imagem foi anexada.";

                return;
            }

            elementos.imagensStatus.textContent =
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
                        !elementos.modal.open
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

                        elementos.imagemAmpliada.src = url;

                        elementos.imagemAmpliada.alt =
                            `Evidência ${ordem} ampliada`;

                        elementos.ampliacao.hidden = false;

                        elementos.fecharAmpliacao.focus();
                    });

                    elementos.imagens.append(botao);

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

            elementos.imagensStatus.textContent =
                falhas
                    ? `${carregadas} imagem(ns) carregada(s). Não foi possível carregar todos os anexos.`
                    : "Clique em uma imagem para ampliar.";
        }

        /* ====================================================
           AMPLIAÇÃO
           ==================================================== */

        function fecharImagemAmpliada() {

            elementos.ampliacao.hidden = true;

            elementos.imagemAmpliada.removeAttribute("src");

            if (origemAmpliacao?.isConnected) {
                origemAmpliacao.focus();
            }

            origemAmpliacao = null;
        }

        elementos.fecharAmpliacao.addEventListener(
            "click",
            fecharImagemAmpliada
        );

        elementos.modal.addEventListener("cancel", evento => {

            if (!elementos.ampliacao.hidden) {

                evento.preventDefault();

                fecharImagemAmpliada();
            }
        });

        /* ====================================================
           FECHAR MODAL
           ==================================================== */

        elementos.modal.querySelectorAll(
            '[data-close="detailsDialog"]'
        ).forEach(botao => {

            botao.addEventListener("click", () => {
                elementos.modal.close();
            });
        });

        elementos.modal.addEventListener("close", () => {

            versaoModal++;

            controllerModal?.abort();

            limparModal();

            denunciaAtual = null;

            if (origemModal?.isConnected) {
                origemModal.focus();
            } else {
                elementos.botao.focus();
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

                    elementos.leitura.textContent =
                        "Esta notificação já foi lida.";

                    elementos.marcarLida.hidden = true;
                }

            } catch (erro) {

                console.error(
                    "Erro ao marcar denúncia como lida:",
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

        elementos.marcarLida.addEventListener("click", () => {

            if (denunciaAtual) {
                marcarComoLida(denunciaAtual.id);
            }
        });

        /* ====================================================
           ATUALIZAÇÃO
           ==================================================== */

        elementos.atualizar.addEventListener("click", () => {
            carregarNotificacoes(true);
        });

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

        /* ====================================================
           INICIALIZAÇÃO
           ==================================================== */

        carregarNotificacoes();
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