const Questionnaire = {
  config: null,
  answers: {},
  observaciones: {},
  currentSectionIndex: 0,
  clientData: { razon_social: '', fecha: '' },

  async loadConfig() {
    const res = await fetch('config/preguntas.yaml');
    const text = await res.text();
    this.config = jsyaml.load(text);
    const today = new Date().toLocaleDateString('es-AR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    this.clientData.fecha = today;
  },

  get sections() {
    return this.config ? this.config.areas : [];
  },

  get totalSections() {
    return this.sections.length;
  },

  get currentSection() {
    return this.sections[this.currentSectionIndex];
  },

  get progress() {
    const totalQuestions = this.totalQuestions;
    let answered = 0;
    this.sections.forEach(sec => {
      sec.preguntas.forEach(q => {
        if (this.answers[q.id] !== undefined) answered++;
      });
    });
    return totalQuestions > 0 ? answered / totalQuestions : 0;
  },

  get totalQuestions() {
    return this.sections.reduce((sum, s) => sum + s.preguntas.length, 0);
  },

  get isComplete() {
    return this.sections.every(sec =>
      sec.preguntas.every(q => this.answers[q.id] !== undefined)
    );
  },

  setAnswer(questionId, value) {
    this.answers[questionId] = value;
    this.saveState();
  },

  setObservacion(questionId, text) {
    this.observaciones[questionId] = text;
    this.saveState();
  },

  setClientData(field, value) {
    this.clientData[field] = value;
    this.saveState();
  },

  getAnswer(questionId) {
    return this.answers[questionId];
  },

  getObservacion(questionId) {
    return this.observaciones[questionId] || '';
  },

  saveState() {
    try {
      const state = {
        answers: this.answers,
        observaciones: this.observaciones,
        clientData: this.clientData,
        currentSectionIndex: this.currentSectionIndex
      };
      localStorage.setItem('assessment_state', JSON.stringify(state));
    } catch (e) { /* ignore */ }
  },

  loadState() {
    try {
      const saved = localStorage.getItem('assessment_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.answers = state.answers || {};
        this.observaciones = state.observaciones || {};
        this.clientData = state.clientData || this.clientData;
        this.currentSectionIndex = state.currentSectionIndex || 0;
      }
    } catch (e) { /* ignore */ }
  },

  clearState() {
    localStorage.removeItem('assessment_state');
    this.answers = {};
    this.observaciones = {};
    this.currentSectionIndex = 0;
    const today = new Date().toLocaleDateString('es-AR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    this.clientData = { razon_social: '', fecha: today };
  }
};
