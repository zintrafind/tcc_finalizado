(function () {
  const KEY = 'pp_admin_settings';
  const DEFAULTS = { tema: 'escuro', texto: 'padrao', contraste: false, reduzirAnimacoes: false };

  function load() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }; }
    catch { return { ...DEFAULTS }; }
  }

  function apply(s) {
    const r = document.documentElement;
    r.dataset.tema = s.tema;                          // "claro" | "escuro"
    r.dataset.texto = s.texto;                        // "padrao" | "ampliado"
    r.dataset.contraste = s.contraste ? 'alto' : 'normal';
    r.dataset.animacoes = s.reduzirAnimacoes ? 'reduzidas' : 'normais';
  }

  function save(s) {
    localStorage.setItem(KEY, JSON.stringify(s));
    apply(s);
  }

  window.PPSettings = { load, save, apply, DEFAULTS };
  apply(load()); // aplica imediatamente em toda página
})();