/*!
 * Estudo de a Sentinela - Gerenciador de Temas de Leitura
 * Version: 1.0.0
 */
// Gerenciador de temas de leitura (Claro, Sépia, Escuro)
document.addEventListener('DOMContentLoaded', () => {
  const CHAVE_TEMA = 'sentinela_tema_leitura';
  const botoesTema = document.querySelectorAll('.btn-tema');

  function aplicarTema(nomeTema) {
    // Aplica o data-theme no body
    document.body.setAttribute('data-theme', nomeTema);

    // Atualiza estado visual e aria-pressed dos botões
    botoesTema.forEach(btn => {
      const ativo = btn.getAttribute('data-theme') === nomeTema;
      btn.classList.toggle('active', ativo);
      btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });

    // Salva a preferência
    try {
      localStorage.setItem(CHAVE_TEMA, nomeTema);
    } catch (e) {
      // localStorage pode estar desabilitado em modo anônimo estrito
    }
  }

  // Carrega tema salvo ou usa 'claro' por padrão
  let temaInicial = 'claro';
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA);
    if (salvo && ['claro', 'sepia', 'escuro'].includes(salvo)) {
      temaInicial = salvo;
    }
  } catch (e) {}

  aplicarTema(temaInicial);

  // Event listener para cada botão de tema
  botoesTema.forEach(btn => {
    btn.addEventListener('click', () => {
      const temaEscolhido = btn.getAttribute('data-theme');
      if (temaEscolhido) {
        aplicarTema(temaEscolhido);
      }
    });
  });
});
