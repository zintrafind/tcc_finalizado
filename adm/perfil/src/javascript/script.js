/* ============================================================
   PERFIL DO ADMINISTRADOR
   Sidebar + dados + foto + banner
   ============================================================ */

(() => {

    "use strict";


    /* ========================================================
       CONFIGURAÇÕES
       ======================================================== */

    const API =
        "http://127.0.0.1:8000/api";


    const LOGIN_URL =
        "../autenticação/index.html";


    const FOTO_PADRAO =
        "src/images/avatar1.png";


    const STORAGE_FOTO =
        "adminFotoPerfil";


    const STORAGE_BANNER =
        "adminBannerPerfil";


    const MAX_FILE_SIZE =
        5 * 1024 * 1024;


    const $ =
        id =>
            document.getElementById(
                id
            );


    const token =
        localStorage.getItem(
            "adminToken"
        ) ||
        sessionStorage.getItem(
            "adminToken"
        );


    const adminId =
        localStorage.getItem(
            "adminId"
        ) ||
        sessionStorage.getItem(
            "adminId"
        );


    let usuarioOriginal =
        null;


    let salvando =
        false;


    let fotoOriginal =
        localStorage.getItem(
            STORAGE_FOTO
        ) ||
        null;


    let bannerOriginal =
        localStorage.getItem(
            STORAGE_BANNER
        ) ||
        null;


    let fotoTemporaria =
        fotoOriginal;


    let bannerTemporario =
        bannerOriginal;


    let nomeArquivoFoto =
        "";


    let nomeArquivoBanner =
        "";


    /* ========================================================
       SESSÃO
       ======================================================== */

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


    function redirecionarLogin() {

        window.location.href =
            LOGIN_URL;

    }


    if (
        !token
    ) {

        redirecionarLogin();


        return;

    }


    /* ========================================================
       SIDEBAR
       ======================================================== */

    const sidebar =
        $("sidebar");


    const sidebarToggle =
        $("sidebarToggle");


    const sidebarToggleIcon =
        $("sidebarToggleIcon");


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


        sidebarToggleIcon.className =
            recolhida

                ? "fa-solid fa-chevron-right"

                : "fa-solid fa-chevron-left";


        sidebarToggle.setAttribute(
            "aria-expanded",
            String(
                !recolhida
            )
        );


        sidebarToggle.setAttribute(
            "aria-label",
            recolhida

                ? "Expandir menu lateral"

                : "Recolher menu lateral"
        );

    }


    if (
        sidebar &&
        sidebarToggle
    ) {

        const estadoSalvo =
            localStorage.getItem(
                "sidebarState"
            );


        if (
            estadoSalvo ===
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


    /* ========================================================
       ELEMENTOS DO PERFIL
       ======================================================== */

    const pagina =
        document.querySelector(
            ".perfil-page"
        );


    const formulario =
        $("perfil-form");


    const campoNome =
        $("perfil-nome");


    const campoEmail =
        $("perfil-email");


    const campoDescricao =
        $("perfil-descricao");


    const campoTipo =
        $("perfil-tipo");


    const campoStatus =
        $("perfil-status");


    const contador =
        $("perfil-contador");


    const mensagem =
        $("perfil-mensagem");


    const botaoSalvar =
        $("perfil-salvar");


    const botaoCancelar =
        $("perfil-cancelar");


    const resumoNome =
        $("perfil-nome-resumo");


    const resumoEmail =
        $("perfil-email-resumo");


    const resumoId =
        $("perfil-id");


    const resumoStatus =
        $("perfil-status-conta");


    const nomeTopo =
        $("nome-admin-topo");


    /* ========================================================
       ELEMENTOS DAS IMAGENS
       ======================================================== */

    const inputFoto =
        $("perfil-foto-input");


    const inputBanner =
        $("perfil-banner-input");


    const previewFoto =
        $("perfil-foto-preview");


    const previewBanner =
        $("perfil-banner-preview");


    const previewAvatar =
        $("perfil-avatar");


    const previewBannerResumo =
        $("perfil-banner-preview-resumo");


    const bannerPlaceholder =
        $("perfil-banner-placeholder");


    const bannerUploadPlaceholder =
        $("perfil-banner-upload-placeholder");


    const avatarTopo =
        $("avatar-admin-topo");


    const botaoRemoverFoto =
        $("perfil-remover-foto");


    const botaoRemoverBanner =
        $("perfil-remover-banner");


    const nomeFoto =
        $("perfil-foto-nome");


    const nomeBanner =
        $("perfil-banner-nome");


    if (
        !formulario
    ) {

        return;

    }


    /* ========================================================
       MENSAGEM
       ======================================================== */

    function mostrarMensagem(
        texto,
        tipo = ""
    ) {

        mensagem.textContent =
            texto;


        mensagem.classList.remove(
            "sucesso",
            "erro"
        );


        if (
            tipo
        ) {

            mensagem.classList.add(
                tipo
            );

        }

    }


    /* ========================================================
       STATUS DA CONTA
       ======================================================== */

    function traduzirStatus(
        status
    ) {

        const valor =
            String(
                status ||
                ""
            ).toUpperCase();


        const nomes = {

            A:
                "Ativo",

            B:
                "Bloqueado",

            I:
                "Inativo"

        };


        return (
            nomes[valor] ||
            status ||
            "Ativo"
        );

    }


    /* ========================================================
       CONTADOR
       ======================================================== */

    function atualizarContador() {

        contador.textContent =
            `${campoDescricao.value.length}/500`;

    }


    /* ========================================================
       RESUMO
       ======================================================== */

    function atualizarResumo(
        usuario
    ) {

        const nome =
            usuario.nm_usuario ||
            "Administrador";


        const email =
            usuario.email ||
            "E-mail não informado";


        const status =
            traduzirStatus(
                usuario.st_usuario
            );


        resumoNome.textContent =
            nome;


        resumoEmail.textContent =
            email;


        resumoId.textContent =
            usuario.id_usuario ||
            adminId ||
            "-";


        resumoStatus.textContent =
            status;


        campoStatus.value =
            status;


        campoTipo.value =
            usuario.tp_usuario ===
                "A"

                ? "Administrador"

                : "Usuário";


        if (
            nomeTopo
        ) {

            nomeTopo.textContent =
                nome;

        }

    }


    /* ========================================================
       FORMULÁRIO
       ======================================================== */

    function preencherFormulario(
        usuario
    ) {

        campoNome.value =
            usuario.nm_usuario ||
            "";


        campoEmail.value =
            usuario.email ||
            "";


        campoDescricao.value =
            usuario.ds_usuario ||
            "";


        atualizarResumo(
            usuario
        );


        atualizarContador();

    }


    /* ========================================================
       CARREGAMENTO
       ======================================================== */

    function definirCarregando(
        carregando
    ) {

        pagina?.classList.toggle(
            "carregando",
            carregando
        );


        campoNome.disabled =
            carregando;


        campoEmail.disabled =
            carregando;


        campoDescricao.disabled =
            carregando;


        inputFoto.disabled =
            carregando;


        inputBanner.disabled =
            carregando;


        botaoRemoverFoto.disabled =
            carregando;


        botaoRemoverBanner.disabled =
            carregando;


        botaoSalvar.disabled =
            carregando;


        botaoCancelar.disabled =
            carregando;

    }


    /* ========================================================
       VALIDAR E-MAIL
       ======================================================== */

    function emailValido(
        email
    ) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(
                email
            );

    }


    /* ========================================================
       API
       ======================================================== */

    async function requisitar(
        caminho,
        opcoes = {}
    ) {

        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                function () {

                    controller.abort();

                },
                20000
            );


        try {

            const resposta =
                await fetch(
                    `${API}${caminho}`,
                    {

                        ...opcoes,

                        signal:
                            controller.signal,

                        headers: {

                            Accept:
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,

                            ...opcoes.headers

                        }

                    }
                );


            if (
                resposta.status ===
                401
            ) {

                limparSessao();


                redirecionarLogin();


                throw new Error(
                    "Sua sessão expirou. Entre novamente."
                );

            }


            const dados =
                await resposta
                    .json()
                    .catch(
                        function () {

                            return {};

                        }
                    );


            if (
                !resposta.ok
            ) {

                const textoErro =

                    resposta.status ===
                        422 &&
                    dados.errors

                        ? Object.values(
                            dados.errors
                        )
                            .flat()
                            .join(
                                " "
                            )

                        : dados.message ||
                          `Não foi possível concluir a operação (HTTP ${resposta.status}).`;


                throw new Error(
                    textoErro
                );

            }


            return dados;

        }

        catch (erro) {

            if (
                erro.name ===
                "AbortError"
            ) {

                throw new Error(
                    "A API demorou para responder. Tente novamente."
                );

            }


            if (
                erro instanceof
                TypeError
            ) {

                throw new Error(
                    "Não foi possível acessar a API. Confira se o Laravel está iniciado."
                );

            }


            throw erro;

        }

        finally {

            clearTimeout(
                timeout
            );

        }

    }


    /* ========================================================
       IMAGENS — UTILITÁRIOS
       ======================================================== */

    function tipoImagemValido(
        arquivo
    ) {

        return [
            "image/jpeg",
            "image/png",
            "image/webp"
        ].includes(
            arquivo.type
        );

    }


    /* ========================================================
       COMPRIMIR IMAGEM
       ======================================================== */

    function comprimirImagem(
        arquivo,
        larguraMaxima,
        alturaMaxima,
        qualidade = 0.82
    ) {

        return new Promise(
            function (
                resolve,
                reject
            ) {

                const reader =
                    new FileReader();


                reader.onload =
                    function () {

                        const imagem =
                            new Image();


                        imagem.onload =
                            function () {

                                let largura =
                                    imagem.width;


                                let altura =
                                    imagem.height;


                                const proporcao =
                                    Math.min(
                                        larguraMaxima /
                                            largura,

                                        alturaMaxima /
                                            altura,

                                        1
                                    );


                                largura =
                                    Math.round(
                                        largura *
                                        proporcao
                                    );


                                altura =
                                    Math.round(
                                        altura *
                                        proporcao
                                    );


                                const canvas =
                                    document.createElement(
                                        "canvas"
                                    );


                                canvas.width =
                                    largura;


                                canvas.height =
                                    altura;


                                const contexto =
                                    canvas.getContext(
                                        "2d"
                                    );


                                contexto.drawImage(
                                    imagem,
                                    0,
                                    0,
                                    largura,
                                    altura
                                );


                                let resultado;


                                try {

                                    resultado =
                                        canvas.toDataURL(
                                            "image/webp",
                                            qualidade
                                        );

                                }

                                catch {

                                    resultado =
                                        canvas.toDataURL(
                                            "image/jpeg",
                                            qualidade
                                        );

                                }


                                resolve(
                                    resultado
                                );

                            };


                        imagem.onerror =
                            function () {

                                reject(
                                    new Error(
                                        "Não foi possível processar esta imagem."
                                    )
                                );

                            };


                        imagem.src =
                            reader.result;

                    };


                reader.onerror =
                    function () {

                        reject(
                            new Error(
                                "Não foi possível ler o arquivo selecionado."
                            )
                        );

                    };


                reader.readAsDataURL(
                    arquivo
                );

            }
        );

    }


    /* ========================================================
       EXIBIR FOTO
       ======================================================== */

    function exibirFoto(
        imagem
    ) {

        const origem =
            imagem ||
            FOTO_PADRAO;


        previewFoto.src =
            origem;


        previewAvatar.src =
            origem;


        if (
            avatarTopo
        ) {

            avatarTopo.src =
                origem;

        }

    }


    /* ========================================================
       EXIBIR BANNER
       ======================================================== */

    function exibirBanner(
        imagem
    ) {

        const existe =
            Boolean(
                imagem
            );


        if (
            existe
        ) {

            previewBanner.src =
                imagem;


            previewBanner.hidden =
                false;


            bannerUploadPlaceholder.hidden =
                true;


            previewBannerResumo.src =
                imagem;


            previewBannerResumo.hidden =
                false;


            bannerPlaceholder.hidden =
                true;

        }

        else {

            previewBanner.removeAttribute(
                "src"
            );


            previewBanner.hidden =
                true;


            bannerUploadPlaceholder.hidden =
                false;


            previewBannerResumo.removeAttribute(
                "src"
            );


            previewBannerResumo.hidden =
                true;


            bannerPlaceholder.hidden =
                false;

        }

    }


    /* ========================================================
       APLICAR IMAGENS
       ======================================================== */

    function aplicarImagens() {

        exibirFoto(
            fotoTemporaria
        );


        exibirBanner(
            bannerTemporario
        );


        nomeFoto.textContent =

            nomeArquivoFoto

                ? nomeArquivoFoto

                : fotoTemporaria

                    ? "Foto atual"

                    : "Nenhuma nova imagem selecionada";


        nomeBanner.textContent =

            nomeArquivoBanner

                ? nomeArquivoBanner

                : bannerTemporario

                    ? "Banner atual"

                    : "Nenhuma nova imagem selecionada";

    }


    /* ========================================================
       SELECIONAR FOTO
       ======================================================== */

    inputFoto.addEventListener(
        "change",
        async function () {

            const arquivo =
                inputFoto.files?.[0];


            if (
                !arquivo
            ) {

                return;

            }


            if (
                !tipoImagemValido(
                    arquivo
                )
            ) {

                mostrarMensagem(
                    "Escolha uma imagem PNG, JPG ou WEBP para a foto de perfil.",
                    "erro"
                );


                inputFoto.value =
                    "";


                return;

            }


            if (
                arquivo.size >
                MAX_FILE_SIZE
            ) {

                mostrarMensagem(
                    "A foto de perfil deve possuir no máximo 5 MB.",
                    "erro"
                );


                inputFoto.value =
                    "";


                return;

            }


            try {

                mostrarMensagem(
                    "Preparando foto de perfil..."
                );


                fotoTemporaria =
                    await comprimirImagem(
                        arquivo,
                        600,
                        600,
                        0.84
                    );


                nomeArquivoFoto =
                    arquivo.name;


                aplicarImagens();


                mostrarMensagem(
                    "Foto selecionada. Clique em Salvar alterações para confirmar."
                );

            }

            catch (erro) {

                mostrarMensagem(
                    erro.message,
                    "erro"
                );

            }

            finally {

                inputFoto.value =
                    "";

            }

        }
    );


    /* ========================================================
       SELECIONAR BANNER
       ======================================================== */

    inputBanner.addEventListener(
        "change",
        async function () {

            const arquivo =
                inputBanner.files?.[0];


            if (
                !arquivo
            ) {

                return;

            }


            if (
                !tipoImagemValido(
                    arquivo
                )
            ) {

                mostrarMensagem(
                    "Escolha uma imagem PNG, JPG ou WEBP para o banner.",
                    "erro"
                );


                inputBanner.value =
                    "";


                return;

            }


            if (
                arquivo.size >
                MAX_FILE_SIZE
            ) {

                mostrarMensagem(
                    "O banner deve possuir no máximo 5 MB.",
                    "erro"
                );


                inputBanner.value =
                    "";


                return;

            }


            try {

                mostrarMensagem(
                    "Preparando banner..."
                );


                bannerTemporario =
                    await comprimirImagem(
                        arquivo,
                        1400,
                        600,
                        0.82
                    );


                nomeArquivoBanner =
                    arquivo.name;


                aplicarImagens();


                mostrarMensagem(
                    "Banner selecionado. Clique em Salvar alterações para confirmar."
                );

            }

            catch (erro) {

                mostrarMensagem(
                    erro.message,
                    "erro"
                );

            }

            finally {

                inputBanner.value =
                    "";

            }

        }
    );


    /* ========================================================
       REMOVER FOTO
       ======================================================== */

    botaoRemoverFoto.addEventListener(
        "click",
        function () {

            fotoTemporaria =
                null;


            nomeArquivoFoto =
                "";


            aplicarImagens();


            mostrarMensagem(
                "Foto removida da pré-visualização. Clique em Salvar alterações para confirmar."
            );

        }
    );


    /* ========================================================
       REMOVER BANNER
       ======================================================== */

    botaoRemoverBanner.addEventListener(
        "click",
        function () {

            bannerTemporario =
                null;


            nomeArquivoBanner =
                "";


            aplicarImagens();


            mostrarMensagem(
                "Banner removido da pré-visualização. Clique em Salvar alterações para confirmar."
            );

        }
    );


    /* ========================================================
       SALVAR IMAGENS NO NAVEGADOR
       ======================================================== */

    function salvarImagensLocais() {

        try {

            if (
                fotoTemporaria
            ) {

                localStorage.setItem(
                    STORAGE_FOTO,
                    fotoTemporaria
                );

            }

            else {

                localStorage.removeItem(
                    STORAGE_FOTO
                );

            }


            if (
                bannerTemporario
            ) {

                localStorage.setItem(
                    STORAGE_BANNER,
                    bannerTemporario
                );

            }

            else {

                localStorage.removeItem(
                    STORAGE_BANNER
                );

            }


            fotoOriginal =
                fotoTemporaria;


            bannerOriginal =
                bannerTemporario;


            nomeArquivoFoto =
                "";


            nomeArquivoBanner =
                "";


            aplicarImagens();

        }

        catch (erro) {

            console.error(
                "Erro ao salvar imagens no navegador:",
                erro
            );


            throw new Error(
                "Os dados do perfil foram atualizados, mas não foi possível salvar as imagens neste navegador."
            );

        }

    }


    /* ========================================================
       CARREGAR PERFIL
       ======================================================== */

    async function carregarPerfil() {

        aplicarImagens();


        if (
            !adminId
        ) {

            definirCarregando(
                false
            );


            mostrarMensagem(
                "Não encontrei o ID do administrador nesta sessão. Saia e entre novamente para atualizar os dados do perfil.",
                "erro"
            );


            return;

        }


        definirCarregando(
            true
        );


        mostrarMensagem(
            "Carregando dados do perfil..."
        );


        try {

            const retorno =
                await requisitar(
                    `/admin/users/${encodeURIComponent(adminId)}/detalhes`
                );


            const usuario =

                retorno.usuario ||
                retorno.user ||
                retorno;


            if (
                !usuario ||
                !usuario.id_usuario
            ) {

                throw new Error(
                    "A API não retornou os dados do administrador."
                );

            }


            if (
                usuario.tp_usuario &&
                usuario.tp_usuario !==
                    "A"
            ) {

                throw new Error(
                    "A conta autenticada não possui perfil de administrador."
                );

            }


            usuarioOriginal = {
                ...usuario
            };


            preencherFormulario(
                usuarioOriginal
            );


            mostrarMensagem(
                ""
            );

        }

        catch (erro) {

            console.error(
                "Erro ao carregar perfil:",
                erro
            );


            mostrarMensagem(
                erro.message,
                "erro"
            );

        }

        finally {

            definirCarregando(
                false
            );

        }

    }


    /* ========================================================
       SALVAR PERFIL
       ======================================================== */

    formulario.addEventListener(
        "submit",
        async function (
            evento
        ) {

            evento.preventDefault();


            if (
                salvando ||
                !usuarioOriginal
            ) {

                return;

            }


            const nome =
                campoNome.value.trim();


            const email =
                campoEmail.value.trim();


            const descricao =
                campoDescricao.value.trim();


            if (
                !nome
            ) {

                mostrarMensagem(
                    "Informe o nome do administrador.",
                    "erro"
                );


                campoNome.focus();


                return;

            }


            if (
                !email ||
                !emailValido(
                    email
                )
            ) {

                mostrarMensagem(
                    "Informe um e-mail válido.",
                    "erro"
                );


                campoEmail.focus();


                return;

            }


            salvando =
                true;


            definirCarregando(
                true
            );


            botaoSalvar.innerHTML =
                `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Salvando...
                `;


            mostrarMensagem(
                "Salvando alterações..."
            );


            try {

                const retorno =
                    await requisitar(
                        `/admin/users/${encodeURIComponent(adminId)}`,
                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    {

                                        nm_usuario:
                                            nome,

                                        email:
                                            email,

                                        tp_usuario:
                                            "A",

                                        ds_usuario:
                                            descricao ||
                                            null

                                    }
                                )

                        }
                    );


                const usuarioRetornado =

                    retorno.usuario ||
                    retorno.user ||
                    null;


                usuarioOriginal = {

                    ...usuarioOriginal,

                    ...(
                        usuarioRetornado ||
                        {}
                    ),

                    nm_usuario:
                        nome,

                    email:
                        email,

                    tp_usuario:
                        "A",

                    ds_usuario:
                        descricao ||
                        null

                };


                /* ================================================
                   SALVAR NOME
                   ================================================ */

                if (
                    sessionStorage.getItem(
                        "adminToken"
                    )
                ) {

                    sessionStorage.setItem(
                        "adminNome",
                        nome
                    );

                }


                localStorage.setItem(
                    "adminNome",
                    nome
                );


                /* ================================================
                   SALVAR IMAGENS
                   ================================================ */

                salvarImagensLocais();


                /* ================================================
                   ATUALIZAR TELA
                   ================================================ */

                preencherFormulario(
                    usuarioOriginal
                );


                mostrarMensagem(
                    retorno.message ||
                    "Perfil atualizado com sucesso!",
                    "sucesso"
                );

            }

            catch (erro) {

                console.error(
                    "Erro ao atualizar perfil:",
                    erro
                );


                mostrarMensagem(
                    erro.message,
                    "erro"
                );

            }

            finally {

                salvando =
                    false;


                definirCarregando(
                    false
                );


                botaoSalvar.innerHTML =
                    `
                        <i class="fa-regular fa-floppy-disk"></i>
                        Salvar alterações
                    `;

            }

        }
    );


    /* ========================================================
       CANCELAR ALTERAÇÕES
       ======================================================== */

    botaoCancelar.addEventListener(
        "click",
        function () {

            if (
                !usuarioOriginal ||
                salvando
            ) {

                return;

            }


            /* VOLTAR DADOS */

            preencherFormulario(
                usuarioOriginal
            );


            /* VOLTAR FOTO */

            fotoTemporaria =
                fotoOriginal;


            bannerTemporario =
                bannerOriginal;


            nomeArquivoFoto =
                "";


            nomeArquivoBanner =
                "";


            aplicarImagens();


            mostrarMensagem(
                "Alterações não salvas foram desfeitas."
            );

        }
    );


    /* ========================================================
       CONTADOR DA DESCRIÇÃO
       ======================================================== */

    campoDescricao.addEventListener(
        "input",
        atualizarContador
    );


    /* ========================================================
       NOME DO TOPO ENQUANTO CARREGA
       ======================================================== */

    const nomeSalvo =
        localStorage.getItem(
            "adminNome"
        ) ||
        sessionStorage.getItem(
            "adminNome"
        );


    if (
        nomeSalvo &&
        nomeTopo
    ) {

        nomeTopo.textContent =
            nomeSalvo;

    }


    /* ========================================================
       INICIAR
       ======================================================== */

    aplicarImagens();


    carregarPerfil();

})();