/* ============================================================
   PREFERÊNCIAS GLOBAIS DO PAINEL ADMINISTRATIVO
   Carregar no <head> de TODAS as páginas, antes do CSS.
   Lê o que a página "Configurações" salva e aplica no <html>.
   ============================================================ */
(function () {
    "use strict";

    var CHAVES = {
        tema: "adminTema",
        texto: "adminTexto",
        contraste: "adminContraste",
        movimento: "adminReduzirAnimacoes"
    };

    function ler(chave) {
        try { return localStorage.getItem(chave); }
        catch (erro) { return null; }
    }

    function aplicar() {
        var raiz = document.documentElement;

        raiz.dataset.tema = ler(CHAVES.tema) === "escuro" ? "escuro" : "claro";
        raiz.dataset.texto = ler(CHAVES.texto) === "ampliado" ? "ampliado" : "padrao";
        raiz.dataset.contraste = String(ler(CHAVES.contraste) === "true");
        raiz.dataset.movimento = String(ler(CHAVES.movimento) === "true");

        var seletorTema = document.getElementById("tema-admin");
        if (seletorTema) seletorTema.value = raiz.dataset.tema;
    }

    // Aplica imediatamente (antes da página ser desenhada)
    aplicar();

    // Atualiza o seletor de tema quando o menu já existir
    document.addEventListener("DOMContentLoaded", aplicar);

    // Sincroniza com outras abas/páginas abertas
    window.addEventListener("storage", function (evento) {
        if (evento.key === null || Object.keys(CHAVES).some(function (k) { return CHAVES[k] === evento.key; })) {
            aplicar();
        }
    });

    // Volta de cache (botão "voltar" do navegador)
    window.addEventListener("pageshow", function (evento) {
        if (evento.persisted) aplicar();
    });

    window.PreferenciasAdmin = { aplicar: aplicar, chaves: CHAVES };
})();
