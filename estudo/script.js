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

  // =========================================
  // SINCRONIZAÇÃO AUTOMÁTICA COM DADOS.JS / JSON
  // =========================================
  function sincronizarDesignacoes(dados) {
    if (!dados) return;

    // 1. Dirigente
    if (dados.estudo && dados.estudo.dirigente) {
      const elDir = document.querySelector('[data-tipo="dirigente"]');
      if (elDir) elDir.textContent = dados.estudo.dirigente;
    }

    // 2. Parágrafos (Comentário, Leitura, Imagem)
    if (Array.isArray(dados.paragrafos)) {
      dados.paragrafos.forEach(p => {
        const item = document.querySelector(`.item-estudo[data-paragrafo="${p.numero}"]`);
        if (!item) return;

        // Comentário da pergunta
        const nomeComentario = item.querySelector('.card-comentario .card-designacao-nome');
        if (nomeComentario && p.comentario) {
          nomeComentario.textContent = p.comentario;
        }

        // Leitura bíblica
        if (p.leitura_texto) {
          const nomeLeitura = item.querySelector('.card-leitura .card-designacao-nome');
          if (nomeLeitura && p.leitura_texto.leitor) {
            nomeLeitura.textContent = p.leitura_texto.leitor;
          }
        }

        // Comentário da imagem
        if (p.tem_imagem) {
          const nomeImagem = item.querySelector('.card-imagem .card-designacao-nome');
          if (nomeImagem && p.comentario_imagem) {
            nomeImagem.textContent = p.comentario_imagem;
          }
        }
      });
    }

    // 3. Perguntas de Recapitulação
    if (dados.designacoes_especiais && Array.isArray(dados.designacoes_especiais.recapitulacao)) {
      dados.designacoes_especiais.recapitulacao.forEach(r => {
        const cardRecap = document.querySelector(`.card-recap[data-recap="${r.numero}"] .card-designacao-nome`);
        if (cardRecap && r.designado) {
          cardRecap.textContent = r.designado;
        }
      });
    }
  }

  // Executa sincronização com window.DADOS_DESIGNACOES ou fallback fetch
  if (window.DADOS_DESIGNACOES) {
    sincronizarDesignacoes(window.DADOS_DESIGNACOES);
  } else {
    fetch('../designacoes/designacoes.json?v=' + Date.now())
      .then(res => res.ok ? res.json() : null)
      .then(dados => {
        if (dados) sincronizarDesignacoes(dados);
      })
      .catch(() => {});
  }
});
