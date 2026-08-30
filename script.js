document.addEventListener('DOMContentLoaded', () => {
  const contentSection = document.getElementById('tab-content');
  const tabButtons = document.querySelectorAll('.tab-btn');

  // Dataset estruturado do Congresso Felicidade Terrena 2026 - Departamento de Limpeza
  const scheduleData = {
    sexta: {
      dayName: "Sexta-feira",
      columns: [
        {
          title: "Banheiro Masculino",
          type: "masculino",
          slots: [
            { time: "13:00 às 14:30", volunteers: ["George", "Gentil"] },
            { time: "14:30 às 15:30", volunteers: ["Fábio", "Raimundo"] }
          ]
        },
        {
          title: "Banheiro Feminino",
          type: "feminino",
          slots: [
            { time: "13:00 às 14:30", volunteers: ["Eliane", "Adriele"] },
            { time: "14:30 às 15:30", volunteers: ["Elizabeth", "Dácia"] }
          ]
        }
      ]
    },
    sabado: {
      dayName: "Sábado",
      columns: [
        {
          title: "Banheiro Masculino",
          type: "masculino",
          slots: [
            { time: "13:00 às 16:30", volunteers: ["Leonardo", "Brian"] }
          ]
        },
        {
          title: "Banheiro Feminino",
          type: "feminino",
          slots: [
            { time: "13:00 às 15:00", volunteers: ["Tereza", "Evelin"] },
            { time: "15:00 às 16:30", volunteers: ["Aristélia", "Ana Júlia"] }
          ]
        }
      ]
    },
    domingo: {
      dayName: "Domingo",
      columns: [
        {
          title: "Banheiro Masculino",
          type: "masculino",
          slots: [
            { time: "13:00 às 15:45", volunteers: ["João Batista", "Raimundo"] }
          ]
        },
        {
          title: "Banheiro Feminino",
          type: "feminino",
          slots: [
            { time: "13:00 às 14:30", volunteers: ["Sulamita", "Julie"] },
            { time: "14:30 às 15:45", volunteers: ["Dirani", "Cléia"] }
          ]
        }
      ]
    }
  };

  // Renderiza o template HTML da escala do dia selecionado
  function generateScheduleHTML(dayData) {
    return `
      <div class="schedule-header">
        <span class="schedule-badge">Escala de Limpeza</span>
        <h2 class="schedule-day-title">${dayData.dayName}</h2>
      </div>

      <div class="columns-grid">
        ${dayData.columns.map(col => `
          <div class="column-card column-${col.type}">
            <div class="column-card-header">
              <div class="column-indicator"></div>
              <h3 class="column-title">${col.title}</h3>
            </div>
            
            <div class="slot-list">
              ${col.slots.map(slot => `
                <div class="slot-item">
                  <div class="slot-time-badge">
                    <svg class="icon-clock" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${slot.time}</span>
                  </div>

                  <div class="slot-volunteers">
                    <div class="volunteers-label">Designados:</div>
                    <div class="volunteers-list">
                      ${slot.volunteers.map(name => `
                        <span class="volunteer-pill">
                          <svg class="icon-user" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          ${name}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Função para renderizar o conteúdo com animação
  function renderTab(tabKey) {
    if (!contentSection || !scheduleData[tabKey]) return;

    contentSection.innerHTML = generateScheduleHTML(scheduleData[tabKey]);

    // Reinicia animação
    contentSection.classList.remove('fade-in');
    void contentSection.offsetWidth;
    contentSection.classList.add('fade-in');
  }

  // Eventos de clique nas abas
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabKey = button.getAttribute('data-tab');

      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });

      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      renderTab(tabKey);
    });
  });

  // Render inicial
  renderTab('sexta');
});
