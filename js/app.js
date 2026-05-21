const App = {
  currentView: 'welcome',
  welcomeStep: 1,

  async init() {
    await Questionnaire.loadConfig();
    Questionnaire.loadState();
    this.render();
    this.bindEvents();
  },

  render() {
    const { config } = Questionnaire;
    if (!config) return;

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>📋 Assessment de Procesos</h1>
        </header>

        <div id="view-container"></div>
      </div>
    `;

    this.showView('welcome');
  },

  showView(view) {
    this.currentView = view;
    if (view === 'welcome') this.welcomeStep = 1;
    const container = document.getElementById('view-container');
    if (!container) return;

    switch (view) {
      case 'welcome': this.renderWelcome(container); break;
      case 'section': this.renderSection(container); break;
      case 'results': this.renderResults(container); break;
    }
  },

  renderWelcome(container) {
    switch (this.welcomeStep) {
      case 1: this.renderWelcomeStep1(container); break;
      case 2: this.renderWelcomeStep2(container); break;
      case 3: this.renderWelcomeStep3(container); break;
    }
  },

  _wizardIndicator(currentStep) {
    const labels = ['Secciones', 'Cliente', 'Confirmar'];
    return `
      <div class="wizard-steps">
        ${[1, 2, 3].map((n, i) => `
          <div class="wizard-step ${n === currentStep ? 'active' : n < currentStep ? 'completed' : ''}">
            <div class="wizard-step-circle">${n < currentStep ? '✓' : n}</div>
            <div class="wizard-step-label">${labels[i]}</div>
          </div>
          ${n < 3 ? `<div class="wizard-step-connector ${n < currentStep ? 'completed' : ''}"></div>` : ''}
        `).join('')}
      </div>
    `;
  },

  renderWelcomeStep1(container) {
    const { allSections, enabledSections } = Questionnaire;
    container.innerHTML = `
      <div class="card welcome-section">
        ${this._wizardIndicator(1)}
        <h2>¿Qué áreas querés evaluar?</h2>
        <p><span id="area-count">${enabledSections.length}</span> área(s) seleccionada(s)</p>
        <div class="section-toggles">
          ${allSections.map(a => `
            <label class="section-toggle ${enabledSections.includes(a.id) ? 'checked' : ''}" data-id="${a.id}">
              <input type="checkbox" ${enabledSections.includes(a.id) ? 'checked' : ''}>
              <span class="toggle-icon">${a.icono}</span>
              <span class="toggle-content">
                <span class="toggle-name">${a.nombre}</span>
                <span class="toggle-desc">${a.descripcion}</span>
              </span>
              <span class="toggle-check">✓</span>
            </label>
          `).join('')}
        </div>
        <div class="nav-buttons" style="justify-content:flex-end">
          <button class="btn btn-primary" id="btn-next-step" ${enabledSections.length === 0 ? 'disabled' : ''}>
            Siguiente →
          </button>
        </div>
      </div>
    `;

    document.querySelectorAll('.section-toggle').forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        if (e.target.tagName === 'INPUT') return;
        const id = this.dataset.id;
        Questionnaire.toggleSection(id);
        this.classList.toggle('checked');
        const cb = this.querySelector('input[type="checkbox"]');
        cb.checked = !cb.checked;
        const count = Questionnaire.enabledSections.length;
        document.getElementById('area-count').textContent = count;
        document.getElementById('btn-next-step').disabled = count === 0;
      });
    });

    document.getElementById('btn-next-step')?.addEventListener('click', () => {
      this.welcomeStep = 2;
      this.renderWelcome(document.getElementById('view-container'));
    });
  },

  renderWelcomeStep2(container) {
    const { config, clientData } = Questionnaire;
    container.innerHTML = `
      <div class="card welcome-section">
        ${this._wizardIndicator(2)}
        <h2>Datos del cliente</h2>
        <div class="client-form">
          <div class="form-group">
            <label for="cliente">${config.cliente.etiqueta_razon_social}</label>
            <input type="text" id="cliente" value="${clientData.razon_social}" placeholder="Ingrese la razón social">
          </div>
          <div class="form-group">
            <label for="fecha">${config.cliente.etiqueta_fecha}</label>
            <input type="text" id="fecha" value="${clientData.fecha}">
          </div>
        </div>
        <div class="nav-buttons">
          <button class="btn btn-secondary" id="btn-prev-step">← Anterior</button>
          <button class="btn btn-primary" id="btn-next-step">Siguiente →</button>
        </div>
      </div>
    `;

    document.getElementById('cliente')?.addEventListener('input', e => {
      Questionnaire.setClientData('razon_social', e.target.value);
    });
    document.getElementById('fecha')?.addEventListener('input', e => {
      Questionnaire.setClientData('fecha', e.target.value);
    });
    document.getElementById('btn-prev-step')?.addEventListener('click', () => {
      this.welcomeStep = 1;
      this.renderWelcome(document.getElementById('view-container'));
    });
    document.getElementById('btn-next-step')?.addEventListener('click', () => {
      this.welcomeStep = 3;
      this.renderWelcome(document.getElementById('view-container'));
    });
  },

  renderWelcomeStep3(container) {
    const { clientData, sections, totalQuestions } = Questionnaire;
    container.innerHTML = `
      <div class="card welcome-section">
        ${this._wizardIndicator(3)}
        <h2>Resumen del assessment</h2>
        <div style="text-align:left;margin:24px 0;line-height:1.8;">
          <p><strong>Cliente:</strong> ${clientData.razon_social || '<em>Sin especificar</em>'}</p>
          <p><strong>Fecha:</strong> ${clientData.fecha}</p>
          <p style="margin-top:12px;"><strong>Áreas a evaluar (${sections.length}):</strong></p>
          <ul style="list-style:none;padding:0;margin:8px 0 0;">
            ${sections.map(s => `<li style="padding:4px 0;">${s.icono} ${s.nombre}</li>`).join('')}
          </ul>
          <p style="margin-top:12px;color:var(--gray-600);font-size:0.9rem;">Total de preguntas: <strong>${totalQuestions}</strong></p>
        </div>
        <div class="nav-buttons">
          <button class="btn btn-secondary" id="btn-prev-step">← Anterior</button>
          <button class="btn btn-primary btn-lg" id="btn-start">Comenzar Assessment →</button>
        </div>
      </div>
    `;

    document.getElementById('btn-prev-step')?.addEventListener('click', () => {
      this.welcomeStep = 2;
      this.renderWelcome(document.getElementById('view-container'));
    });
    document.getElementById('btn-start')?.addEventListener('click', () => {
      Questionnaire.currentSectionIndex = 0;
      this.showView('section');
    });
  },

  renderSection(container) {
    const section = Questionnaire.currentSection;
    if (!section) {
      this.showView('results');
      return;
    }

    const idx = Questionnaire.currentSectionIndex;
    const total = Questionnaire.totalSections;
    const progress = Questionnaire.progress;

    container.innerHTML = `
      <div class="steps-indicator">
        ${Array.from({ length: total }, (_, i) => {
          let cls = 'step-dot';
          if (i === idx) cls += ' active';
          else if (i < idx) cls += ' completed';
          return `<div class="${cls}"></div>`;
        }).join('')}
      </div>

      <div class="progress-container">
        <div class="progress-header">
          <span>Sección ${idx + 1} de ${total}</span>
          <span>${Math.round(progress * 100)}% completado</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${progress * 100}%"></div>
        </div>
      </div>

      <div class="card">
        <div class="section-header">
          <div class="section-icon">${section.icono}</div>
          <div>
            <div class="section-title">${section.nombre}</div>
            <div class="section-desc">${section.descripcion}</div>
          </div>
        </div>

        <div id="questions-container">
          ${section.preguntas.map((q, qi) => {
            const selected = Questionnaire.getAnswer(q.id);
            return `
              <div class="question-item" data-qid="${q.id}">
                <div class="question-text">${qi + 1}. ${q.texto}</div>
                <div class="question-options" data-qid="${q.id}">
                  <button class="option-btn no-btn ${selected === 0 ? 'selected' : ''}" data-value="0">
                    No
                    <span class="option-label">No existe</span>
                  </button>
                  ${[1, 2, 3, 4, 5].map(v => `
                    <button class="option-btn ${selected === v ? 'selected' : ''}" data-value="${v}">
                      ${v}
                      <span class="option-label">${['Muy deficiente', 'Deficiente', 'Regular', 'Bueno', 'Excelente'][v - 1]}</span>
                    </button>
                  `).join('')}
                </div>
                <input type="text" class="observaciones-input" placeholder="Observaciones (opcional)"
                  value="${Questionnaire.getObservacion(q.id)}">
              </div>
            `;
          }).join('')}
        </div>

        <div class="nav-buttons">
          <button class="btn btn-secondary" id="btn-prev" ${idx === 0 ? 'disabled' : ''}>
            ← Anterior
          </button>
          <button class="btn btn-primary" id="btn-next">
            ${idx < total - 1 ? 'Siguiente →' : 'Ver Resultados →'}
          </button>
        </div>
      </div>
    `;

    this.bindQuestionEvents();
  },

  bindQuestionEvents() {
    document.querySelectorAll('.question-options').forEach(group => {
      group.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          const qid = this.closest('.question-options').dataset.qid;
          const value = parseInt(this.dataset.value);
          group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
          this.classList.add('selected');
          Questionnaire.setAnswer(qid, value);
        });
      });
    });

    document.querySelectorAll('.observaciones-input').forEach(input => {
      input.addEventListener('input', function () {
        const qid = this.closest('.question-item').dataset.qid;
        Questionnaire.setObservacion(qid, this.value);
      });
    });

    document.getElementById('btn-prev')?.addEventListener('click', () => {
      if (Questionnaire.currentSectionIndex > 0) {
        Questionnaire.currentSectionIndex--;
        this.showView('section');
      }
    });

    document.getElementById('btn-next')?.addEventListener('click', () => {
      const section = Questionnaire.currentSection;
      const allAnswered = section.preguntas.every(q => Questionnaire.getAnswer(q.id) !== undefined);
      if (!allAnswered) {
        alert('Por favor respondé todas las preguntas antes de continuar.');
        return;
      }
      if (Questionnaire.currentSectionIndex < Questionnaire.totalSections - 1) {
        Questionnaire.currentSectionIndex++;
        this.showView('section');
      } else {
        this.showView('results');
      }
      Questionnaire.saveState();
    });
  },

  renderResults(container) {
    const { config, answers, observaciones, clientData, sections } = Questionnaire;
    const scores = Scoring.calculate(config, answers, sections);
    const recomendaciones = Scoring.getRecomendaciones(config, scores);
    const resumen = Scoring.getResumen(scores);

    const btnClass = (nivel) => {
      if (nivel === 'Crítico') return 'critical';
      if (nivel === 'Atención') return 'warning';
      return 'healthy';
    };

    container.innerHTML = `
      <div class="results-container">
        <div class="card">
          <div class="results-header">
            <h2>📊 Resultados del Assessment</h2>
            <p>${clientData.razon_social ? `Cliente: ${clientData.razon_social} — ` : ''}Fecha: ${clientData.fecha}</p>
          </div>

          <div class="rec-section">
            <h3>Resumen General</h3>
            <p style="margin-bottom:16px;color:#6b778c;">
              Puntaje promedio: <strong>${(resumen.promedio * 2).toFixed(1)} / 10</strong> —
              ${resumen.criticos} crítica(s), ${resumen.atencion} en atención, ${resumen.saludables} saludable(s)
            </p>
          </div>

          <div class="rec-section">
            <h3>Puntaje por Área</h3>
            ${scores.map(s => `
              <div class="score-card ${btnClass(s.nivel)}">
                <div class="score-icon">${s.nivelIcono}</div>
                <div class="score-info">
                  <h4>${s.icono} ${s.nombre}</h4>
                  <p>${s.nivel}</p>
                  <div class="score-bar">
                    <div class="score-bar-fill" style="width: ${(s.score / 5) * 100}%;background:${s.color}"></div>
                  </div>
                </div>
                <div class="score-value ${btnClass(s.nivel)}">${s.score.toFixed(1)}</div>
              </div>
            `).join('')}
          </div>

          <div class="rec-section">
            <h3>Recomendaciones Priorizadas</h3>
            ${recomendaciones.map(r => `
              <div class="rec-card">
                <h4>${r.areaIcono} ${r.area}</h4>
                <span class="rec-priority ${r.prioridad.toLowerCase()}">${r.prioridad}</span>
                <p><strong>${r.titulo}</strong></p>
                <p>${r.texto}</p>
              </div>
            `).join('')}
          </div>

          <div class="actions-bar">
            <button class="btn btn-accent btn-lg" id="btn-download">
              ⬇ Descargar Informe (DOCX)
            </button>
            <button class="btn btn-secondary" id="btn-restart">
              ↻ Nuevo Assessment
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-download')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-download');
      btn.disabled = true;
      btn.textContent = '⏳ Generando informe...';
      try {
        await DocGenerator.generate(config, answers, observaciones, clientData, scores, recomendaciones, resumen, sections);
      } catch (e) {
        alert('Error al generar el documento: ' + e.message);
        console.error(e);
      }
      btn.disabled = false;
      btn.textContent = '⬇ Descargar Informe (DOCX)';
    });

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      if (confirm('¿Estás seguro? Se perderán todas las respuestas actuales.')) {
        Questionnaire.clearState();
        this.showView('welcome');
      }
    });
  },

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const btn = document.querySelector('.btn-primary.btn-lg') || document.getElementById('btn-next');
        if (btn && !btn.disabled) btn.click();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
