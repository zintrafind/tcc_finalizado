/* ==================== NOTIFICAÇÕES DO ADMIN ==================== */

(() => {
    "use strict";

    function iniciarNotificacoes() {
        const obter = id => document.getElementById(id);

        const container = obter("notificacoes-container");

        if (!container) return;
        if (container.dataset.inicializado === "true") return;

        
const API = "http://127.0.0.1:8000/api";
const BASE = "/admin/notificacoes";

/* ==================== MODAL AUXILIAR ==================== */

// A página de denúncias possui seu próprio modal.
// Nas demais páginas, criamos o modal necessário
// para exibir os detalhes acessados pelo sininho.

if (!obter("modal-denuncia")) {

    const modal = document.createElement("dialog");

    modal.id = "modal-denuncia";
    modal.className = "report-dialog";

    modal.innerHTML = `
        <div class="dialog-header">
            <h2>Detalhes da denúncia</h2>

            <button
                type="button"
                id="btn-fechar-denuncia"
                aria-label="Fechar"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="dialog-body">

            <p id="modal-denuncia-status"></p>

            <div id="modal-denuncia-conteudo" hidden>

                <p><strong>Número:</strong> <span id="denuncia-numero"></span></p>

                <p><strong>Usuário:</strong> <span id="denuncia-usuario"></span></p>

                <p><strong>Data:</strong> <span id="denuncia-data"></span></p>

                <p><strong>Status:</strong> <span id="denuncia-status"></span></p>

                <p><strong>Motivo:</strong> <span id="denuncia-motivo"></span></p>

                <p><strong>Descrição:</strong></p>
                <p id="denuncia-descricao"></p>

                <h3>Evidências</h3>

                <p id="denuncia-imagens-status"></p>

                <div id="denuncia-imagens"></div>

                <div id="denuncia-ampliacao" hidden>
                    <button
                        type="button"
                        id="btn-fechar-ampliacao"
                    >
                        Fechar ampliação
                    </button>

                    <img
                        id="denuncia-imagem-ampliada"
                        alt="Evidência ampliada"
                        style="max-width:100%"
                    >
                </div>

                <p id="denuncia-leitura"></p>

                <button
                    type="button"
                    id="btn-denuncia-marcar-lida"
                >
                    Marcar como lida
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}




        const elementos = {
            botao: obter("btn-notificacoes"),
            painel: obter("painel-notificacoes"),
            contador: obter("notificacoes-contador"),
            lista: obter("notificacoes-lista"),
            status: obter("notificacoes-status"),
            fechar: obter("btn-fechar-notificacoes"),
            atualizar: obter("btn-atualizar-notificacoes"),

            modal: obter("modal-denuncia"),
            fecharModal: obter("btn-fechar-denuncia"),
            statusModal: obter("modal-denuncia-status"),
            conteudoModal: obter("modal-denuncia-conteudo"),

            numero: obter("denuncia-numero"),
            usuario: obter("denuncia-usuario"),
            data: obter("denuncia-data"),
            statusDenuncia: obter("denuncia-status"),
            motivo: obter("denuncia-motivo"),
            descricao: obter("denuncia-descricao"),

            imagensStatus: obter("denuncia-imagens-status"),
            imagens: obter("denuncia-imagens"),

            ampliacao: obter("denuncia-ampliacao"),
            imagemAmpliada: obter("denuncia-imagem-ampliada"),
            fecharAmpliacao: obter("btn-fechar-ampliacao"),

            leitura: obter("denuncia-leitura"),
            marcarLida: obter("btn-denuncia-marcar-lida")
        };

        const idsObrigatorios = [
    "btn-notificacoes",
    "painel-notificacoes",
    "notificacoes-contador",
    "notificacoes-lista",
    "notificacoes-status",
    "btn-fechar-notificacoes",
    "btn-atualizar-notificacoes",
    "modal-denuncia",
    "btn-fechar-denuncia",
    "modal-denuncia-status",
    "modal-denuncia-conteudo",
    "denuncia-numero",
    "denuncia-usuario",
    "denuncia-data",
    "denuncia-status",
    "denuncia-motivo",
    "denuncia-descricao",
    "denuncia-imagens-status",
    "denuncia-imagens",
    "denuncia-ampliacao",
    "denuncia-imagem-ampliada",
    "btn-fechar-ampliacao",
    "denuncia-leitura",
    "btn-denuncia-marcar-lida"
];

const idsAusentes = idsObrigatorios.filter(id => !obter(id));

if (idsAusentes.length > 0) {
    console.error(
        "IDs ausentes no painel de notificações:",
        idsAusentes
    );
    return;
}

        container.dataset.inicializado = "true";

        let carregandoLista = false;
        let salvandoLeitura = false;
        let sessaoInvalida = false;
        let temDados = false;

        let notificacoes = [];
        let denunciaAtual = null;
        let origemModal = null;
        let origemAmpliacao = null;

        let versaoModal = 0;
        let controllerModal = null;

        const urlsImagens = new Set();

        /* ==================== ELEMENTOS E MENSAGENS ==================== */

        function criar(tag, classe, texto) {
            const elemento = document.createElement(tag);

            if (classe) elemento.className = classe;

            if (texto !== undefined) {
                elemento.textContent = texto ?? "";
            }

            return elemento;
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

        function formatarData(valor) {
            if (!valor) return "Data não informada";

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
                return "A consulta demorou para responder. Tente novamente.";
            }

            if (erro instanceof TypeError) {
                return "Não foi possível conectar à API. Confira se o Laravel está funcionando.";
            }

            return erro.message ||
                "Não foi possível concluir a operação.";
        }

        /* ==================== CONTADOR ==================== */

        function atualizarContador(valor) {
            const numero = Number(valor);

            const quantidade =
                Number.isFinite(numero) && numero > 0
                    ? Math.floor(numero)
                    : 0;

            elementos.contador.textContent =
                quantidade > 99 ? "99+" : String(quantidade);

            elementos.contador.hidden = quantidade === 0;

            elementos.botao.setAttribute(
                "aria-label",
                quantidade > 0
                    ? `Notificações: ${quantidade} não lidas`
                    : "Notificações: nenhuma não lida"
            );
        }

        function atualizarBotoes() {
            elementos.atualizar.disabled =
                carregandoLista ||
                salvandoLeitura ||
                sessaoInvalida;

            elementos.lista.setAttribute(
                "aria-busy",
                String(carregandoLista || salvandoLeitura)
            );

            elementos.lista.querySelectorAll(
                ".notificacao-marcar-lida"
            ).forEach(botao => {
                botao.disabled =
                    carregandoLista ||
                    salvandoLeitura ||
                    sessaoInvalida;
            });

            elementos.marcarLida.disabled =
                carregandoLista ||
                salvandoLeitura ||
                sessaoInvalida ||
                !denunciaAtual;

            elementos.marcarLida.textContent =
                salvandoLeitura
                    ? "Salvando..."
                    : "Marcar como lida";
        }

        /* ==================== REQUISIÇÕES AUTENTICADAS ==================== */

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
                        "Somente administradores ativos podem acessar essas informações."
                    );
                }

                if (!resposta.ok) {
                    const retorno = await resposta.json()
                        .catch(() => null);

                    throw new Error(
                        retorno?.message ||
                        `Não foi possível concluir a consulta. HTTP ${resposta.status}.`
                    );
                }

                if (imagem) {
                    const arquivo = await resposta.blob();

                    const tiposPermitidos = [
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                    ];

                    const tipo = arquivo.type
                        .split(";")[0]
                        .toLowerCase();

                    if (!tiposPermitidos.includes(tipo)) {
                        throw new Error(
                            "O servidor retornou um formato de imagem inválido."
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

        /* ==================== PAINEL DO SININHO ==================== */

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
            if (!container.contains(evento.target)) {
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

        container.addEventListener("focusout", evento => {
            if (
                evento.relatedTarget &&
                !container.contains(evento.relatedTarget)
            ) {
                fecharPainel();
            }
        });

        /* ==================== LISTA DE NOTIFICAÇÕES ==================== */

        function renderizarLista() {
            const fragmento = document.createDocumentFragment();

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

                icone.setAttribute("aria-hidden", "true");

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

                const resumo = descricao.length > 120
                    ? `${descricao.slice(0, 120)}…`
                    : descricao;

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
                        resumo
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

                detalhes.setAttribute(
                    "aria-label",
                    `Ver detalhes da denúncia #${notificacao.id}`
                );

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

        async function carregarNotificacoes(manual = false) {
            if (
                carregandoLista ||
                salvandoLeitura ||
                sessaoInvalida
            ) return;

            // Não substitui controles que estão sendo utilizados.
            if (
                !manual &&
                (
                    elementos.modal.open ||
                    elementos.lista.contains(
                        document.activeElement
                    )
                )
            ) return;

            carregandoLista = true;
            atualizarBotoes();

            if (manual || !temDados) {
                mostrarStatus("Carregando notificações...");
            }

            try {
                const dados = await requisitar(BASE);

                if (
                    !Array.isArray(dados?.notificacoes) ||
                    !Number.isInteger(Number(dados.nao_lidas)) ||
                    Number(dados.nao_lidas) < 0
                ) {
                    throw new Error(
                        "A API retornou notificações em formato inesperado."
                    );
                }

                notificacoes = dados.notificacoes;
                temDados = true;

                atualizarContador(dados.nao_lidas);
                renderizarLista();

                mostrarStatus(
                    notificacoes.length
                        ? ""
                        : "Nenhuma notificação encontrada."
                );

            } catch (erro) {
                console.error("Erro nas notificações:", erro);

                mostrarStatus(
                    mensagemErro(erro) +
                    (temDados
                        ? " Os dados exibidos podem estar desatualizados."
                        : ""),
                    true
                );

            } finally {
                carregandoLista = false;
                atualizarBotoes();
            }
        }

        /* ==================== LIMPEZA DAS IMAGENS ==================== */

        function limparImagens() {
            elementos.imagemAmpliada.removeAttribute("src");
            elementos.ampliacao.hidden = true;
            elementos.imagens.replaceChildren();

            urlsImagens.forEach(url => {
                URL.revokeObjectURL(url);
            });

            urlsImagens.clear();
            origemAmpliacao = null;
        }

        function fecharImagemAmpliada() {
            elementos.ampliacao.hidden = true;
            elementos.imagemAmpliada.removeAttribute("src");

            if (origemAmpliacao?.isConnected) {
                origemAmpliacao.focus();
            }
        }

        elementos.fecharAmpliacao.addEventListener(
            "click",
            fecharImagemAmpliada
        );

        /* ==================== CARREGAR ANEXOS PRIVADOS ==================== */

        async function carregarImagens(
            denuncia,
            versao,
            signal
        ) {
            const imagens = denuncia.imagens;

            if (!imagens.length) {
                elementos.imagensStatus.textContent =
                    "Nenhuma imagem foi anexada.";
                return;
            }

            elementos.imagensStatus.textContent =
                "Carregando imagens...";

            let carregadas = 0;
            let falhas = 0;

            // Carrega na ordem enviada pela API.
            for (const imagem of imagens) {
                if (
                    signal.aborted ||
                    versao !== versaoModal
                ) return;

                try {
                    const ordem = Number(imagem.ordem);

                    if (
                        !Number.isInteger(ordem) ||
                        ordem < 1
                    ) {
                        throw new Error(
                            "Ordem da imagem inválida."
                        );
                    }

                    // Monta o endereço localmente para manter o token
                    // restrito à API configurada.
                    const caminho =
                        `${BASE}/${encodeURIComponent(denuncia.id)}` +
                        `/imagens/${ordem}`;

                    const arquivo = await requisitar(
                        caminho,
                        {
                            imagem: true,
                            signal
                        }
                    );

                    if (
                        signal.aborted ||
                        versao !== versaoModal ||
                        !elementos.modal.open
                    ) return;

                    const url = URL.createObjectURL(arquivo);
                    urlsImagens.add(url);

                    const botaoImagem = criar(
                        "button",
                        "denuncia-imagem-botao"
                    );

                    botaoImagem.type = "button";

                    botaoImagem.setAttribute(
                        "aria-label",
                        `Ampliar imagem ${ordem} da denúncia`
                    );

                    const miniatura = criar("img");

                    miniatura.src = url;
                    miniatura.alt =
                        `Evidência ${ordem} da denúncia`;

                    botaoImagem.append(
                        miniatura,
                        criar(
                            "span",
                            "",
                            `Imagem ${ordem} · Ampliar`
                        )
                    );

                    botaoImagem.addEventListener("click", () => {
                        origemAmpliacao = botaoImagem;

                        elementos.imagemAmpliada.src = url;
                        elementos.imagemAmpliada.alt =
                            `Evidência ${ordem} ampliada`;

                        elementos.ampliacao.hidden = false;

                        elementos.fecharAmpliacao.focus();

                        elementos.ampliacao.scrollIntoView({
                            block: "nearest"
                        });
                    });

                    elementos.imagens.append(botaoImagem);
                    carregadas++;

                } catch (erro) {
                    if (
                        signal.aborted ||
                        versao !== versaoModal
                    ) return;

                    falhas++;

                    console.error(
                        "Erro ao carregar evidência:",
                        erro
                    );

                    if (sessaoInvalida) break;
                }
            }

            if (
                versao !== versaoModal ||
                signal.aborted
            ) return;

            elementos.imagensStatus.textContent = falhas
                ? `${carregadas} imagem(ns) carregada(s). Não foi possível carregar todos os anexos. Feche e abra os detalhes para tentar novamente.`
                : "Clique em uma imagem para ampliar.";
        }

        /* ==================== ABRIR DETALHES ==================== */

        function atualizarLeituraModal() {
            if (!denunciaAtual) {
                elementos.marcarLida.hidden = true;
                elementos.leitura.textContent = "";
                return;
            }

            elementos.marcarLida.hidden =
                denunciaAtual.lida === true;

            elementos.leitura.textContent =
                denunciaAtual.lida === true
                    ? "Notificação lida."
                    : "Notificação não lida.";

            atualizarBotoes();
        }

        async function abrirDenuncia(id, origem) {
            fecharPainel();

            origemModal = origem;

            controllerModal?.abort();
            controllerModal = new AbortController();

            const controllerAtual = controllerModal;
            const versao = ++versaoModal;

            denunciaAtual = null;

            limparImagens();

            elementos.conteudoModal.hidden = true;
            elementos.imagensStatus.textContent = "";

            atualizarLeituraModal();

            mostrarStatusModal(
                "Carregando detalhes da denúncia..."
            );

            if (!elementos.modal.open) {
                elementos.modal.showModal();
            }

            elementos.fecharModal.focus();

            try {
                const dados = await requisitar(
                    `${BASE}/${encodeURIComponent(id)}`,
                    {
                        signal: controllerAtual.signal
                    }
                );

                if (
                    versao !== versaoModal ||
                    !elementos.modal.open
                ) return;

                if (
                    String(dados?.id) !== String(id) ||
                    !Array.isArray(dados.imagens)
                ) {
                    throw new Error(
                        "A API retornou detalhes em formato inesperado."
                    );
                }

                denunciaAtual = dados;

                elementos.numero.textContent = `#${dados.id}`;

                elementos.usuario.textContent =
                    dados.usuario_denunciado ||
                    "Usuário indisponível";

                elementos.data.textContent =
                    formatarData(dados.data);

                // P é o status confirmado no seu DenunciaController.
                elementos.statusDenuncia.textContent =
                    dados.status_denuncia === "P"
                        ? "Pendente"
                        : dados.status_denuncia ||
                            "Não informado";

                elementos.motivo.textContent =
                    dados.motivo || "Não informado";

                elementos.descricao.textContent =
                    dados.descricao ||
                    "Nenhuma descrição informada.";

                elementos.conteudoModal.hidden = false;

                mostrarStatusModal("");
                atualizarLeituraModal();

                await carregarImagens(
                    dados,
                    versao,
                    controllerAtual.signal
                );

            } catch (erro) {
                if (
                    versao !== versaoModal ||
                    !elementos.modal.open
                ) return;

                console.error(
                    "Erro nos detalhes da denúncia:",
                    erro
                );

                mostrarStatusModal(
                    mensagemErro(erro),
                    true
                );
            }
        }

        /* ==================== FECHAR MODAL ==================== */

        elementos.fecharModal.addEventListener("click", () => {
            elementos.modal.close();
        });

        // Escape fecha primeiro a imagem ampliada.
        elementos.modal.addEventListener("cancel", evento => {
            if (!elementos.ampliacao.hidden) {
                evento.preventDefault();
                fecharImagemAmpliada();
            }
        });

        elementos.modal.addEventListener("close", () => {
            versaoModal++;
            controllerModal?.abort();

            limparImagens();
            denunciaAtual = null;

            elementos.conteudoModal.hidden = true;
            elementos.marcarLida.hidden = true;

            // Retorna ao sininho quando o painel estiver fechado.
            if (
                origemModal?.isConnected &&
                !elementos.painel.hidden
            ) {
                origemModal.focus();
            } else {
                elementos.botao.focus();
            }

            origemModal = null;
        });

        /* ==================== MARCAR COMO LIDA ==================== */

        async function marcarComoLida(id) {
            if (
                salvandoLeitura ||
                carregandoLista ||
                sessaoInvalida
            ) return;

            salvandoLeitura = true;
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
                    !Number.isInteger(Number(retorno.nao_lidas)) ||
                    Number(retorno.nao_lidas) < 0
                ) {
                    throw new Error(
                        "A API não confirmou a leitura. Atualize para conferir."
                    );
                }

                atualizarContador(retorno.nao_lidas);

                notificacoes = notificacoes.map(item => (
                    String(item.id) === idAtual
                        ? { ...item, lida: true }
                        : item
                ));

                if (
                    elementos.lista.contains(
                        document.activeElement
                    )
                ) {
                    elementos.botao.focus();
                }

                renderizarLista();

                mostrarStatus(
                    "Notificação marcada como lida."
                );

                if (
                    denunciaAtual &&
                    String(denunciaAtual.id) === idAtual
                ) {
                    denunciaAtual.lida = true;

                    if (
                        document.activeElement ===
                        elementos.marcarLida
                    ) {
                        elementos.fecharModal.focus();
                    }

                    atualizarLeituraModal();
                    mostrarStatusModal("");
                }

            } catch (erro) {
                console.error(
                    "Erro ao registrar leitura:",
                    erro
                );

                if (
                    elementos.modal.open &&
                    String(denunciaAtual?.id) === idAtual
                ) {
                    mostrarStatusModal(
                        mensagemErro(erro),
                        true
                    );
                } else {
                    mostrarStatus(
                        mensagemErro(erro),
                        true
                    );
                }

            } finally {
                salvandoLeitura = false;
                atualizarBotoes();
            }
        }

        elementos.marcarLida.addEventListener("click", () => {
            if (denunciaAtual) {
                marcarComoLida(denunciaAtual.id);
            }
        });

        /* ==================== ATUALIZAÇÃO AUTOMÁTICA ==================== */

        elementos.atualizar.addEventListener("click", () => {
            carregarNotificacoes(true);
        });

        setInterval(() => {
            if (!document.hidden) {
                carregarNotificacoes();
            }
        }, 30000);

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                carregarNotificacoes();
            }
        });

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