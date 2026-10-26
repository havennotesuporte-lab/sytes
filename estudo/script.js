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

  // =========================================
  // CAIXA FLUTUANTE DE TEXTOS BÍBLICOS
  // =========================================
  const modalOverlay = document.getElementById('modal-biblia');
  const modalTitulo = document.getElementById('modal-biblia-titulo');
  const modalCorpo = document.getElementById('modal-biblia-corpo');
  const modalLink = document.getElementById('modal-biblia-link');
  const modalFechar = document.getElementById('modal-biblia-fechar');
  const linksBiblia = document.querySelectorAll('.link-biblia');

  function abrirModalBiblia(alvo) {
    if (!modalOverlay || !window.TEXTOS_BIBLICOS) return;

    const dados = window.TEXTOS_BIBLICOS[alvo];
    if (!dados) {
      console.warn('Texto bíblico não encontrado no mapeamento:', alvo);
      return;
    }

    modalTitulo.textContent = dados.titulo;
    modalCorpo.textContent = dados.texto;
    if (modalLink) {
      modalLink.href = dados.link || 'https://www.jw.org/pt/biblioteca/biblia/';
    }

    modalOverlay.classList.add('ativo');
    modalOverlay.setAttribute('aria-hidden', 'false');
    if (modalCorpo) modalCorpo.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function fecharModalBiblia() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('ativo');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Cliques nos links de versículo nos parágrafos
  linksBiblia.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const alvo = link.getAttribute('data-targetverses');
      if (alvo) {
        abrirModalBiblia(alvo);
      }
    });
  });

  // Fechar no botão X
  if (modalFechar) {
    modalFechar.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fecharModalBiblia();
    });
  }

  // Fechar apenas ao clicar fora do cartão (no backdrop)
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        fecharModalBiblia();
      }
    });
  }

  // Fechar com tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('ativo')) {
      fecharModalBiblia();
    }
  });
});
