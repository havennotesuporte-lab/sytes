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

  // 1. Carrega dados diretamente do script local (funciona em file:/// e sem CORS)
  if (window.DADOS_DESIGNACOES) {
    dadosGlobal = window.DADOS_DESIGNACOES;
    renderizarDesignacoes(dadosGlobal, '');
  } else {
    // 2. Fallback via fetch (para servidores HTTP/HTTPS)
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
  }

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
            <div class="dirigente-card-inner">
              <div class="avatar-icon avatar-dirigente">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="dirigente-info">
                <span class="dirigente-cargo">Dirigente do Estudo:</span>
                <strong class="dirigente-nome">${estudo.dirigente || 'João Batista'}</strong>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    // Barra de Legenda Visual (para diferenciar de imediato cada tipo)
    if (!filtrando) {
      html += `
        <div class="legenda-container">
          <span class="legenda-titulo">Identificação visual:</span>
          <div class="legenda-chips">
            <span class="legenda-chip chip-comentario">
              <span class="chip-indicador"></span>
              Comentário da Pergunta
            </span>
            <span class="legenda-chip chip-leitura">
              <span class="chip-indicador"></span>
              Leitura de Texto Bíblico
            </span>
            <span class="legenda-chip chip-imagem">
              <span class="chip-indicador"></span>
              Comentário de Imagem
            </span>
            <span class="legenda-chip chip-recap">
              <span class="chip-indicador"></span>
              Recapitulação Final
            </span>
          </div>
        </div>
      `;
    }

    // 2. Lista Sequencial de Parágrafos
    if (paragrafosFiltrados.length > 0) {
      html += `
        <section class="paragrafos-secao">
          <h3 class="secao-titulo">
            ${filtrando ? 'Parágrafos com sua Designação' : 'Designações Sequenciais por Parágrafo'}
          </h3>
          <div class="paragrafos-lista">
      `;

      paragrafosFiltrados.forEach(p => {
        html += `
          <article class="paragrafo-card">
            <div class="paragrafo-topo">
              <div class="paragrafo-badge-row">
                <span class="paragrafo-badge">Parágrafo ${p.numero}</span>
              </div>
              <h4 class="paragrafo-pergunta">${p.pergunta || ''}</h4>
            </div>

            <div class="designacao-blocos">
              <!-- Bloco 1: Comentário do Parágrafo -->
              <div class="bloco-designacao bloco-comentario ${p.comBate ? 'item-destaque' : ''}">
                <div class="bloco-header">
                  <span class="tipo-badge badge-comentario">
                    <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Comentário da Pergunta
                  </span>
                </div>
                <div class="bloco-corpo">
                  <div class="designado-box">
                    <div class="avatar-icon avatar-comentario">
                      <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div class="designado-info">
                      <span class="designado-cargo">Designado(a) para responder:</span>
                      <strong class="designado-nome nome-comentario">${p.comentario || 'A definir'}</strong>
                    </div>
                  </div>
                </div>
              </div>
        `;

        // Se tiver leitura bíblica no parágrafo
        if (p.leitura_texto) {
          html += `
              <!-- Bloco 2: Leitura Bíblica -->
              <div class="bloco-designacao bloco-leitura ${p.leiBate ? 'item-destaque' : ''}">
                <div class="bloco-header">
                  <span class="tipo-badge badge-leitura">
                    <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    Leitura de Texto Bíblico
                  </span>
                  <span class="referencia-badge">${p.leitura_texto.texto}</span>
                </div>
                <div class="bloco-corpo">
                  <div class="designado-box">
                    <div class="avatar-icon avatar-leitura">
                      <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                    </div>
                    <div class="designado-info">
                      <span class="designado-cargo">Designado(a) para ler o texto bíblico:</span>
                      <strong class="designado-nome nome-leitura">${p.leitura_texto.leitor || 'A definir'}</strong>
                    </div>
                  </div>
                </div>
              </div>
          `;
        }

        // Se tiver imagem no parágrafo
        if (p.tem_imagem) {
          const imgSrc = p.imagem_src || (p.numero === '1' ? '../estudo/2026601_univ_cnt_1_lg.jpg' : (p.numero === '9-10' ? '../estudo/2026601_univ_cnt_2_lg.jpg' : '../estudo/2026601_univ_cnt_3_lg.jpg'));
          html += `
              <!-- Bloco 3: Comentário da Imagem -->
              <div class="bloco-designacao bloco-imagem ${p.imgBate ? 'item-destaque' : ''}">
                <div class="bloco-header">
                  <span class="tipo-badge badge-imagem">
                    <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                      <circle cx="9" cy="9" r="2"></circle>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                    Comentário da Imagem / Gravura
                  </span>
                </div>

                <!-- Imagem do Parágrafo Organizada -->
                <div class="bloco-imagem-figura">
                  <img src="${imgSrc}" alt="${p.imagem_desc || 'Imagem do Estudo'}" class="bloco-imagem-img" loading="lazy">
                </div>

                ${p.imagem_desc ? `
                  <div class="imagem-legenda-box">
                    <span class="imagem-legenda-icon">🖼️</span>
                    <span class="imagem-legenda-texto">“${p.imagem_desc}”</span>
                  </div>
                ` : ''}

                <div class="bloco-corpo">
                  <div class="designado-box">
                    <div class="avatar-icon avatar-imagem">
                      <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div class="designado-info">
                      <span class="designado-cargo">Designado(a) para comentar a imagem:</span>
                      <strong class="designado-nome nome-imagem">${p.comentario_imagem || 'A definir'}</strong>
                    </div>
                  </div>
                </div>
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
          <h3 class="secao-titulo">
            COMO RESPONDERIA? • Recapitulação Final
          </h3>
          <div class="recapitulacao-lista">
      `;

      recapFiltrados.forEach(r => {
        html += `
          <article class="recap-card ${r.bate ? 'item-destaque' : ''}">
            <div class="bloco-header">
              <span class="tipo-badge badge-recap">
                <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                Recapitulação • Pergunta ${r.numero}
              </span>
            </div>
            <p class="recap-pergunta-texto">${r.pergunta}</p>
            <div class="bloco-corpo">
              <div class="designado-box">
                <div class="avatar-icon avatar-recap">
                  <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div class="designado-info">
                  <span class="designado-cargo">Designado(a) para responder:</span>
                  <strong class="designado-nome nome-recap">${r.designado || 'A definir'}</strong>
                </div>
              </div>
            </div>
          </article>
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
