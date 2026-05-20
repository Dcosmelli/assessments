const Scoring = {
  calculate(config, answers) {
    const areas = config.areas;
    const scores = [];

    areas.forEach(area => {
      let totalWeighted = 0;
      let maxWeighted = 0;
      const detalles = [];

      area.preguntas.forEach(q => {
        const answer = answers[q.id];
        const weight = q.peso || 1;
        maxWeighted += 5 * weight;

        if (answer !== undefined) {
          totalWeighted += answer * weight;
          detalles.push({ pregunta: q.texto, respuesta: answer, peso: weight });
        } else {
          detalles.push({ pregunta: q.texto, respuesta: null, peso: weight });
        }
      });

      const score = maxWeighted > 0 ? Math.round((totalWeighted / maxWeighted) * 10) / 10 : 0;
      const normalizedScore = score * 5;

      let nivel, color, icono;
      if (normalizedScore < 2.5) {
        nivel = 'Crítico';
        color = '#ff5630';
        icono = '🔴';
      } else if (normalizedScore < 4) {
        nivel = 'Atención';
        color = '#ffab00';
        icono = '🟡';
      } else {
        nivel = 'Saludable';
        color = '#36b37e';
        icono = '🟢';
      }

      scores.push({
        id: area.id,
        nombre: area.nombre,
        icono: area.icono || '',
        score: normalizedScore,
        rawScore: score,
        nivel,
        color,
        nivelIcono: icono,
        detalles,
        totalWeighted,
        maxWeighted
      });
    });

    scores.sort((a, b) => a.score - b.score);
    return scores;
  },

  getRecomendaciones(config, scores) {
    const recs = [];
    scores.forEach(s => {
      const areaRecs = config.recomendaciones_por_area.find(r => r.area === s.id);
      if (!areaRecs) return;

      const nivel = areaRecs.niveles.find(n => {
        if (n.score_min !== undefined && n.score_max !== undefined) {
          return s.score >= n.score_min && s.score <= n.score_max;
        }
        if (n.score_max !== undefined) return s.score <= n.score_max;
        if (n.score_min !== undefined) return s.score >= n.score_min;
        return false;
      });

      if (nivel) {
        recs.push({
          area: s.nombre,
          areaIcono: s.icono,
          score: s.score,
          nivel: s.nivel,
          titulo: nivel.titulo,
          texto: nivel.texto,
          prioridad: nivel.prioridad
        });
      }
    });

    return recs;
  },

  getResumen(scores) {
    const criticos = scores.filter(s => s.nivel === 'Crítico').length;
    const atencion = scores.filter(s => s.nivel === 'Atención').length;
    const saludables = scores.filter(s => s.nivel === 'Saludable').length;
    const promedio = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

    return { criticos, atencion, saludables, promedio };
  }
};
