/* ============================================================
   CONFIGURAÇÕES DO PAINEL
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const pagina =
            document.getElementById(
                "config-page"
            );


        const formulario =
            document.getElementById(
                "config-form"
            );


        if (
            !pagina ||
            !formulario
        ) {
            return;
        }


        const contraste =
            document.getElementById(
                "config-contraste"
            );


        const movimento =
            document.getElementById(
                "config-movimento"
            );


        const status =
            document.getElementById(
                "config-status"
            );


        const cancelar =
            document.getElementById(
                "config-cancelar"
            );


        const temaMenu =
            document.getElementById(
                "tema-admin"
            );


        const botaoSair =
            document.getElementById(
                "config-sair"
            );


        const modalSair =
            document.getElementById(
                "config-logout-dialog"
            );


        const cancelarSaida =
            document.getElementById(
                "config-logout-cancelar"
            );


        const confirmarSaida =
            document.getElementById(
                "config-logout-confirmar"
            );


        const statusSaida =
            document.getElementById(
                "config-logout-status"
            );


        const API_URL =
            "http://127.0.0.1:8000/api";


        const LOGIN_URL =
            "../autenticação/index.html";


        const chaves = {
            tema:
                "adminTema",

            texto:
                "adminTexto",

            contraste:
                "adminContraste",

            movimento:
                "adminReduzirAnimacoes"
        };


        let saindo =
            false;


        /* ====================================================
           LER PREFERÊNCIAS
           ==================================================== */

        function lerPreferencias() {

            try {

                return {
                    tema:
                        localStorage.getItem(
                            chaves.tema
                        ) === "escuro"
                            ? "escuro"
                            : "claro",

                    texto:
                        localStorage.getItem(
                            chaves.texto
                        ) === "ampliado"
                            ? "ampliado"
                            : "padrao",

                    contraste:
                        localStorage.getItem(
                            chaves.contraste
                        ) === "true",

                    movimento:
                        localStorage.getItem(
                            chaves.movimento
                        ) === "true"
                };

            }

            catch {

                return {
                    tema:
                        "claro",

                    texto:
                        "padrao",

                    contraste:
                        false,

                    movimento:
                        false
                };

            }

        }


        let preferenciasSalvas =
            lerPreferencias();


        /* ====================================================
           PREENCHER FORMULÁRIO
           ==================================================== */

        function preencherFormulario(
            preferencias
        ) {

            formulario
                .querySelectorAll(
                    '[name="config-tema"]'
                )
                .forEach(
                    input => {

                        input.checked =
                            input.value ===
                            preferencias.tema;

                    }
                );


            formulario
                .querySelectorAll(
                    '[name="config-texto"]'
                )
                .forEach(
                    input => {

                        input.checked =
                            input.value ===
                            preferencias.texto;

                    }
                );


            if (
                contraste
            ) {

                contraste.checked =
                    preferencias.contraste;

            }


            if (
                movimento
            ) {

                movimento.checked =
                    preferencias.movimento;

            }

        }


        /* ====================================================
           PEGAR PREFERÊNCIAS
           ==================================================== */

        function obterPreferencias() {

            return {
                tema:
                    formulario.querySelector(
                        '[name="config-tema"]:checked'
                    )?.value ||
                    "claro",

                texto:
                    formulario.querySelector(
                        '[name="config-texto"]:checked'
                    )?.value ||
                    "padrao",

                contraste:
                    Boolean(
                        contraste?.checked
                    ),

                movimento:
                    Boolean(
                        movimento?.checked
                    )
            };

        }


        /* ====================================================
           APLICAR PREFERÊNCIAS
           ==================================================== */

       function aplicarPreferencias(preferencias) {

    // Aplicar preferências globalmente em todas as páginas.
    document.documentElement.dataset.tema =
        preferencias.tema;

    document.documentElement.dataset.texto =
        preferencias.texto;

    document.documentElement.dataset.contraste =
        String(preferencias.contraste);

    document.documentElement.dataset.movimento =
        String(preferencias.movimento);


    // Atualizar o seletor de tema do menu superior.
    if (temaMenu) {

        temaMenu.value =
            preferencias.tema;

    }

}


        /* ====================================================
           STATUS
           ==================================================== */

        function informar(
            mensagem,
            erro = false
        ) {

            if (
                !status
            ) {
                return;
            }

            /* ====================================================
   CARD DE CONFIRMAÇÃO
   ==================================================== */

function mostrarCardSalvo() {

    // Evitar cards duplicados.
    document.querySelector(".card-alteracoes-salvas")?.remove();

    const card = document.createElement("div");

    card.className = "card-alteracoes-salvas";

    card.innerHTML = `
        <span class="card-salvo-icone">✓</span>

        <div class="card-salvo-conteudo">
            <strong>Alterações salvas!</strong>
            <span>Suas preferências foram atualizadas com sucesso.</span>
        </div>

        <button
            type="button"
            class="card-salvo-fechar"
            aria-label="Fechar notificação"
        >
            &times;
        </button>
    `;

    document.body.appendChild(card);

    requestAnimationFrame(() => {
        card.classList.add("mostrar");
    });

    const fechar = card.querySelector(".card-salvo-fechar");

    function removerCard() {

        card.classList.remove("mostrar");

        setTimeout(() => {
            card.remove();
        }, 300);

    }

    fechar.addEventListener("click", removerCard);

    setTimeout(removerCard, 4000);

}


            status.textContent =
                mensagem;


            status.classList.toggle(
                "error",
                erro
            );

        }


        preencherFormulario(
            preferenciasSalvas
        );


        aplicarPreferencias(
            preferenciasSalvas
        );


        /* ====================================================
           PRÉVIA
           ==================================================== */

        formulario.addEventListener(
            "change",
            () => {

                aplicarPreferencias(
                    obterPreferencias()
                );


                informar(
                    "Prévia aplicada. Clique em Salvar alterações para guardar."
                );

            }
        );


        /* ====================================================
           SALVAR
           ==================================================== */

        formulario.addEventListener(
            "submit",
            evento => {

                evento.preventDefault();


                const preferencias =
                    obterPreferencias();


                const nomes =
                    Object.keys(
                        chaves
                    );


                let anteriores =
                    null;


                try {

                    anteriores =
                        nomes.map(
                            nome =>
                                localStorage.getItem(
                                    chaves[nome]
                                )
                        );


                    nomes.forEach(
                        nome => {

                            localStorage.setItem(
                                chaves[nome],
                                String(
                                    preferencias[nome]
                                )
                            );

                        }
                    );

                }

                catch {

                    if (
                        anteriores
                    ) {

                        nomes.forEach(
                            (
                                nome,
                                indice
                            ) => {

                                try {

                                    if (
                                        anteriores[indice] ===
                                        null
                                    ) {

                                        localStorage.removeItem(
                                            chaves[nome]
                                        );

                                    }

                                    else {

                                        localStorage.setItem(
                                            chaves[nome],
                                            anteriores[indice]
                                        );

                                    }

                                }

                                catch {
                                    // Sem ação.
                                }

                            }
                        );

                    }


                    informar(
                        "Não foi possível salvar as preferências neste navegador.",
                        true
                    );


                    return;

                }


                preferenciasSalvas = {
                    ...preferencias
                };


                aplicarPreferencias(
                    preferenciasSalvas
                );


                informar(
    "Preferências salvas neste navegador."
);

mostrarCardSalvo();

            }
        );


        /* ====================================================
           CANCELAR
           ==================================================== */

        cancelar?.addEventListener(
            "click",
            () => {

                preencherFormulario(
                    preferenciasSalvas
                );


                aplicarPreferencias(
                    preferenciasSalvas
                );


                informar(
                    "Alterações não salvas foram desfeitas."
                );

            }
        );


        /* ====================================================
           TEMA ALTERADO PELO MENU SUPERIOR
           ==================================================== */

        temaMenu?.addEventListener(
            "change",
            () => {

                const tema =
                    temaMenu.value ===
                    "escuro"
                        ? "escuro"
                        : "claro";


                preferenciasSalvas.tema =
                    tema;


                localStorage.setItem(
                    chaves.tema,
                    tema
                );


                formulario
                    .querySelectorAll(
                        '[name="config-tema"]'
                    )
                    .forEach(
                        input => {

                            input.checked =
                                input.value ===
                                tema;

                        }
                    );


                aplicarPreferencias({
                    ...obterPreferencias(),
                    tema
                });

            }
        );


        /* ====================================================
           ALTERAÇÃO EM OUTRA ABA
           ==================================================== */

        window.addEventListener(
            "storage",
            evento => {

                if (
                    evento.key !== null &&
                    !Object.values(
                        chaves
                    ).includes(
                        evento.key
                    )
                ) {

                    return;

                }


                preferenciasSalvas =
                    lerPreferencias();


                preencherFormulario(
                    preferenciasSalvas
                );


                aplicarPreferencias(
                    preferenciasSalvas
                );


                informar(
                    "Preferências atualizadas."
                );

            }
        );


        /* ====================================================
           ABRIR MODAL SAIR
           ==================================================== */

        botaoSair?.addEventListener(
            "click",
            () => {

                if (
                    !modalSair
                ) {
                    return;
                }


                if (
                    statusSaida
                ) {

                    statusSaida.textContent =
                        "";


                    statusSaida.classList.remove(
                        "error"
                    );

                }


                modalSair.showModal();

            }
        );


        /* ====================================================
           FECHAR MODAL
           ==================================================== */

        function fecharModal() {

            if (
                saindo ||
                !modalSair
            ) {
                return;
            }


            modalSair.close();


            botaoSair?.focus();

        }


        cancelarSaida?.addEventListener(
            "click",
            fecharModal
        );


        modalSair?.addEventListener(
            "cancel",
            evento => {

                evento.preventDefault();


                fecharModal();

            }
        );


        /* ====================================================
           CONFIRMAR SAÍDA
           ==================================================== */

        confirmarSaida?.addEventListener(
            "click",
            async () => {

                if (
                    saindo
                ) {
                    return;
                }


                saindo =
                    true;


                confirmarSaida.disabled =
                    true;


                if (
                    cancelarSaida
                ) {

                    cancelarSaida.disabled =
                        true;

                }


                if (
                    statusSaida
                ) {

                    statusSaida.classList.remove(
                        "error"
                    );


                    statusSaida.textContent =
                        "Encerrando sessão...";

                }


                const controller =
                    new AbortController();


                const timeout =
                    setTimeout(
                        () =>
                            controller.abort(),
                        15000
                    );


                try {

                    const token =
                        localStorage.getItem(
                            "adminToken"
                        ) ||
                        sessionStorage.getItem(
                            "adminToken"
                        );


                    if (
                        token
                    ) {

                        const resposta =
                            await fetch(
                                `${API_URL}/logout`,
                                {
                                    method:
                                        "POST",

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
                            !resposta.ok &&
                            resposta.status !== 401
                        ) {

                            throw new Error(
                                "Não foi possível encerrar a sessão."
                            );

                        }

                    }


                    localStorage.removeItem(
                        "adminToken"
                    );

                    sessionStorage.removeItem(
                        "adminToken"
                    );


                    localStorage.removeItem(
                        "adminId"
                    );

                    sessionStorage.removeItem(
                        "adminId"
                    );


                    localStorage.removeItem(
                        "adminNome"
                    );

                    sessionStorage.removeItem(
                        "adminNome"
                    );


                    window.location.href =
                        LOGIN_URL;

                }

                catch (erro) {

                    console.error(
                        "Erro ao sair:",
                        erro
                    );


                    if (
                        statusSaida
                    ) {

                        statusSaida.classList.add(
                            "error"
                        );


                        statusSaida.textContent =
                            "Não foi possível sair. Verifique a conexão e tente novamente.";

                    }


                    saindo =
                        false;


                    confirmarSaida.disabled =
                        false;


                    if (
                        cancelarSaida
                    ) {

                        cancelarSaida.disabled =
                            false;

                    }

                }

                finally {

                    clearTimeout(
                        timeout
                    );

                }

            }
        );

    }
);