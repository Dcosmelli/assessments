const Questionnaire = {
  config: null,
  answers: {},
  observaciones: {},
  currentSectionIndex: 0,
  enabledSections: [],
  clientData: { razon_social: '', fecha: '' },

  async loadConfig() {
    const res = await fetch('config/preguntas.yaml');
    const text = await res.text();
    this.config = jsyaml.load(text);
    const today = new Date().toLocaleDateString('es-AR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    this.clientData.fecha = today;
    if (this.enabledSections.length === 0) {
      this.enabledSections = this.config.areas.map(a => a.id);
    }
  },

  get allSections() {
    return this.config ? this.config.areas : [];
  },

  get sections() {
    return this.allSections.filter(a => this.enabledSections.includes(a.id));
  },

  get totalSections() {
    return this.sections.length;
  },

  get currentSection() {
    if (this.currentSectionIndex >= this.totalSections) return null;
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

  isSectionEnabled(sectionId) {
    return this.enabledSections.includes(sectionId);
  },

  toggleSection(sectionId) {
    const idx = this.enabledSections.indexOf(sectionId);
    if (idx >= 0) {
      this.enabledSections.splice(idx, 1);
    } else {
      this.enabledSections.push(sectionId);
    }
    this.saveState();
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
        currentSectionIndex: this.currentSectionIndex,
        enabledSections: this.enabledSections
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
        this.enabledSections = state.enabledSections || [];
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
    this.enabledSections = this.config ? this.config.areas.map(a => a.id) : [];
  }
};
