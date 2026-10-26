/*!
 * Designações - Script
 * Version: 1.0.0
 */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('designacoes-conteudo');
  const campoBusca = document.getElementById('campo-busca');
  const btnLimparBusca = document.getElementById('btn-limpar-busca');
  const buscaFeedback = document.getElementById('busca-feedback');
  if (!container) return;

  let dadosGlobal = null;

  function normalizar(texto) {
    return (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  fetch('designacoes.json?v=' + Date.now())
    .then(res => {
      if (!res.ok) throw new Error('Não foi possível carregar os dados de designações.');
      return res.json();
    })
    .then(dados => {
      dadosGlobal = dados;
      renderizarDesignacoes(dadosGlobal, '');
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `
        <div class="erro-msg">
          <p>Erro ao carregar as designações. Verifique o arquivo designacoes.json.</p>
        </div>
      `;
    });

  // Evento de busca em tempo real
  if (campoBusca) {
    campoBusca.addEventListener('input', () => {
      const termo = campoBusca.value;
      if (btnLimparBusca) {
        btnLimparBusca.style.display = termo ? 'block' : 'none';
      }
      if (dadosGlobal) {
        renderizarDesignacoes(dadosGlobal, termo);
      }
    });
  }

  // Limpar busca
  if (btnLimparBusca) {
    btnLimparBusca.addEventListener('click', () => {
      campoBusca.value = '';
      btnLimparBusca.style.display = 'none';
      if (dadosGlobal) {
        renderizarDesignacoes(dadosGlobal, '');
      }
      campoBusca.focus();
    });
  }

  function renderizarDesignacoes(dados, termoBusca) {
    const termoNorm = normalizar(termoBusca);
    const estudo = dados.estudo || {};
    const paragrafos = dados.paragrafos || [];
    const recapitulacao = dados.designacoes_especiais?.recapitulacao || [];

    let totalEncontrados = 0;
    const filtrando = termoNorm.length > 0;

    // Checa se dirigente bate
    const dirigenteBate = filtrando && normalizar(estudo.dirigente).includes(termoNorm);
    if (dirigenteBate) totalEncontrados++;

    // Filtra e prepara parágrafos
    const paragrafosFiltrados = paragrafos.map(p => {
      const comBate = filtrando && normalizar(p.comentario).includes(termoNorm);
      const imgBate = filtrando && p.tem_imagem && normalizar(p.comentario_imagem).includes(termoNorm);
      const leiBate = filtrando && p.leitura_texto && normalizar(p.leitura_texto.leitor).includes(termoNorm);

      let matchesNoParagrafo = 0;
      if (comBate) matchesNoParagrafo++;
      if (imgBate) matchesNoParagrafo++;
      if (leiBate) matchesNoParagrafo++;

      if (matchesNoParagrafo > 0) {
        totalEncontrados += matchesNoParagrafo;
      }

      return {
        ...p,
        comBate,
        imgBate,
        leiBate,
        incluir: !filtrando || matchesNoParagrafo > 0
      };
    }).filter(p => p.incluir);

    // Filtra recapitulação
    const recapFiltrados = recapitulacao.map(r => {
      const bate = filtrando && normalizar(r.designado).includes(termoNorm);
      if (bate) totalEncontrados++;
      return {
        ...r,
        bate,
        incluir: !filtrando || bate
      };
    }).filter(r => r.incluir);

    // Atualiza feedback de busca
    if (buscaFeedback) {
      if (filtrando) {
        buscaFeedback.style.display = 'inline-flex';
        if (totalEncontrados > 0) {
          buscaFeedback.className = 'busca-feedback';
          buscaFeedback.textContent = `${totalEncontrados} designação(ões) encontrada(s) para "${termoBusca}"`;
        } else {
          buscaFeedback.className = 'busca-feedback sem-resultado';
          buscaFeedback.textContent = `Nenhuma designação encontrada para "${termoBusca}"`;
        }
      } else {
        buscaFeedback.style.display = 'none';
        buscaFeedback.textContent = '';
      }
    }

    // Se estiver filtrando e não encontrou nada
    if (filtrando && totalEncontrados === 0) {
      container.innerHTML = `
        <div class="carregando-msg">
          <p>Nenhuma designação encontrada com o nome <strong>"${termoBusca}"</strong>.</p>
          <p style="font-size: 0.85rem; margin-top: 0.5rem; color: var(--text-muted);">Tente digitar apenas o primeiro nome ou limpe a busca para ver todas.</p>
        </div>
      `;
      return;
    }

    let html = '';

    // 1. Cabeçalho do Estudo com Dirigente (mostra sempre ou destaca se for o dirigente)
    const mostrarMeta = !filtrando || dirigenteBate;
    if (mostrarMeta) {
      html += `
        <section class="estudo-meta-card ${dirigenteBate ? 'item-destaque' : ''}">
          <div class="meta-tag-row">
            <span class="meta-revista">${estudo.revista || 'A Sentinela'}</span>
            <span class="meta-data">${estudo.data_reuniao || ''}</span>
          </div>
          <h2 class="meta-titulo">${estudo.titulo || ''}</h2>
          <div class="meta-dirigente-box">
            <div class="dirigente-badge">
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Dirigente:</span>
              <strong>${estudo.dirigente || 'João Batista'}</strong>
            </div>
          </div>
        </section>
      `;
    }

    // 2. Lista Sequencial de Parágrafos
    if (paragrafosFiltrados.length > 0) {
      html += `
        <section class="paragrafos-secao">
          <h3 class="secao-titulo">
            ${filtrando ? 'Parágrafos com sua Designação' : 'Designações por Parágrafo'}
          </h3>
          <div class="paragrafos-lista">
      `;

      paragrafosFiltrados.forEach(p => {
        html += `
          <article class="paragrafo-card">
            <div class="paragrafo-topo">
              <span class="paragrafo-badge">Parágrafo ${p.numero}</span>
              <p class="paragrafo-pergunta">${p.pergunta || ''}</p>
            </div>

            <div class="designacao-itens">
              <!-- Comentário do Parágrafo -->
              <div class="designacao-item item-comentario ${p.comBate ? 'item-destaque' : ''}">
                <div class="item-rotulo">
                  <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Comentário:</span>
                </div>
                <span class="item-nome">${p.comentario || 'A definir'}</span>
              </div>
        `;

        // Se tiver imagem no parágrafo
        if (p.tem_imagem) {
          html += `
              <div class="designacao-item item-imagem ${p.imgBate ? 'item-destaque' : ''}">
                <div class="item-rotulo">
                  <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                  <span>Comentário da Imagem:</span>
                </div>
                <span class="item-nome">${p.comentario_imagem || 'A definir'}</span>
                ${p.imagem_desc ? `<span class="item-detalhe">“${p.imagem_desc}”</span>` : ''}
              </div>
          `;
        }

        // Se tiver leitura bíblica no parágrafo
        if (p.leitura_texto) {
          html += `
              <div class="designacao-item item-leitura ${p.leiBate ? 'item-destaque' : ''}">
                <div class="item-rotulo">
                  <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  <span>Leitura Bíblica (${p.leitura_texto.texto}):</span>
                </div>
                <span class="item-nome">${p.leitura_texto.leitor || 'A definir'}</span>
              </div>
          `;
        }

        html += `
            </div>
          </article>
        `;
      });

      html += `
          </div>
        </section>
      `;
    }

    // 3. Perguntas de Recapitulação (COMO RESPONDERIA?)
    if (recapFiltrados.length > 0) {
      html += `
        <section class="recapitulacao-secao">
          <h3 class="secao-titulo">COMO RESPONDERIA?</h3>
          <div class="recapitulacao-lista">
      `;

      recapFiltrados.forEach(r => {
        html += `
          <div class="recap-card ${r.bate ? 'item-destaque' : ''}">
            <span class="recap-num">${r.numero}.</span>
            <div class="recap-info">
              <p class="recap-pergunta">${r.pergunta}</p>
              <div class="recap-designado">
                <span class="recap-label">Comentário:</span>
                <strong class="recap-nome">${r.designado || 'A definir'}</strong>
              </div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </section>
      `;
    }

    container.innerHTML = html;
  }
});
