/*!
 * Designações - Script
 * Version: 1.0.0
 */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('designacoes-conteudo');
  if (!container) return;

  fetch('designacoes.json?v=' + Date.now())
    .then(res => {
      if (!res.ok) throw new Error('Não foi possível carregar os dados de designações.');
      return res.json();
    })
    .then(dados => {
      renderizarDesignacoes(dados);
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `
        <div class="erro-msg">
          <p>Erro ao carregar as designações. Verifique o arquivo designacoes.json.</p>
        </div>
      `;
    });

  function renderizarDesignacoes(dados) {
    const estudo = dados.estudo || {};
    const paragrafos = dados.paragrafos || [];
    const recapitulacao = dados.designacoes_especiais?.recapitulacao || [];

    let html = '';

    // 1. Cabeçalho do Estudo com Dirigente (Sem Leitor)
    html += `
      <section class="estudo-meta-card">
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

    // 2. Lista Sequencial de Parágrafos
    html += `
      <section class="paragrafos-secao">
        <h3 class="secao-titulo">Designações por Parágrafo</h3>
        <div class="paragrafos-lista">
    `;

    paragrafos.forEach(p => {
      html += `
        <article class="paragrafo-card">
          <div class="paragrafo-topo">
            <span class="paragrafo-badge">Parágrafo ${p.numero}</span>
            <p class="paragrafo-pergunta">${p.pergunta || ''}</p>
          </div>

          <div class="designacao-itens">
            <!-- Comentário do Parágrafo -->
            <div class="designacao-item item-comentario">
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
            <div class="designacao-item item-imagem">
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
            <div class="designacao-item item-leitura">
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

    // 3. Perguntas de Recapitulação (COMO RESPONDERIA?)
    if (recapitulacao.length > 0) {
      html += `
        <section class="recapitulacao-secao">
          <h3 class="secao-titulo">COMO RESPONDERIA?</h3>
          <div class="recapitulacao-lista">
      `;

      recapitulacao.forEach(r => {
        html += `
          <div class="recap-card">
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
