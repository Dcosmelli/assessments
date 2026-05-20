const DocGenerator = {
  async generate(config, answers, observaciones, clientData, scores, recomendaciones, resumen) {
    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel,
      AlignmentType, Table, TableRow, TableCell, WidthType,
      BorderStyle, Header, Footer, PageNumber, ImageRun,
      PageBreak
    } = docx;

    let logoArrayBuffer = null;
    try {
      const resp = await fetch('templates/logo.png');
      if (resp.ok) {
        const blob = await resp.blob();
        logoArrayBuffer = await blob.arrayBuffer();
      }
    } catch (e) { /* no logo available */ }

    const PRIMARY = '172b4d';
    const GRAY = '666666';
    const ACCENT = '00a3bf';
    const WHITE = 'FFFFFF';
    const LIGHT_BG = 'f0f2f5';

    const font = { font: 'Arial' };

    const headingStyle = (size, color, bold, spacing) => ({
      run: { size, font: 'Arial', color, bold },
      spacing: { after: spacing || 200 }
    });
    const normalStyle = { font: 'Arial', size: 22, color: '333333' };

    const coverChildren = [];

    coverChildren.push(
      new Paragraph({ spacing: { before: 3000 }, children: [] })
    );

    if (logoArrayBuffer) {
      coverChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: logoArrayBuffer,
              transformation: { width: 200, height: 80, type: 'png' }
            })
          ]
        })
      );
      coverChildren.push(new Paragraph({ spacing: { after: 600 }, children: [] }));
    } else {
      coverChildren.push(new Paragraph({ spacing: { after: 3600 }, children: [] }));
    }

    coverChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 },
        children: [
          new TextRun({ text: config.titulo, ...headingStyle(52, PRIMARY, true, 0).run })
        ]
      })
    );

    coverChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: config.subtitulo, ...headingStyle(30, GRAY, false, 0).run })
        ]
      })
    );

    coverChildren.push(new Paragraph({ spacing: { after: 600 }, children: [] }));

    if (clientData.razon_social) {
      coverChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
          children: [
            new TextRun({ text: 'Cliente:', ...headingStyle(24, PRIMARY, true, 0).run }),
            new TextRun({ text: `  ${clientData.razon_social}`, ...headingStyle(24, GRAY, false, 0).run })
          ]
        })
      );
    }

    coverChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 },
        children: [
          new TextRun({ text: 'Fecha:', ...headingStyle(24, PRIMARY, true, 0).run }),
          new TextRun({ text: `  ${clientData.fecha}`, ...headingStyle(24, GRAY, false, 0).run })
        ]
      })
    );

    const contentChildren = [];

    function addHeading(text, level, pageBreak) {
      const h = level === 1
        ? new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: pageBreak ? 0 : 400, after: 200 },
            children: [
              new TextRun({ text, ...headingStyle(40, PRIMARY, true, 0).run })
            ]
          })
        : new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 360, after: 120 },
            children: [
              new TextRun({ text, ...headingStyle(32, PRIMARY, true, 0).run })
            ]
          });
      if (pageBreak) {
        return [new Paragraph({ children: [new PageBreak()] }), h];
      }
      return [h];
    }

    function addPara(text, opts = {}) {
      const size = opts.size || 22;
      const color = opts.color || '333333';
      const bold = opts.bold || false;
      const spacing = opts.spacing || 120;
      return new Paragraph({
        spacing: { after: spacing },
        alignment: opts.align || AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text, ...headingStyle(size, color, bold, 0).run })
        ]
      });
    }

    function addBullet(text) {
      return new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 60 },
        children: [
          new TextRun({ text, ...normalStyle })
        ]
      });
    }

    function makeTableCell(text, opts = {}) {
      const width = opts.width || 2000;
      const shading = opts.shading ? { fill: opts.shading } : undefined;
      const bold = opts.bold || false;
      const color = opts.color || '333333';
      const size = opts.size || 20;
      const alignment = opts.alignment || AlignmentType.LEFT;
      return new TableCell({
        width: { size: width, type: WidthType.DXA },
        shading,
        children: [
          new Paragraph({
            alignment,
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text, ...headingStyle(size, color, bold, 0).run })
            ]
          })
        ]
      });
    }

    const tableBorder = {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' }
    };

    // ---- TITLE PAGE BREAK ----
    contentChildren.push(new Paragraph({ children: [new PageBreak()], spacing: { before: 0 } }));

    // ---- TABLE OF CONTENTS ----
    contentChildren.push(...addHeading('Contenido', 1));
    const tocItems = [
      'Resumen Ejecutivo',
      'Detalle por Área',
      'Priorización',
      'Recomendaciones',
      'Observaciones Generales'
    ];
    tocItems.forEach((item, i) => {
      contentChildren.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${i + 1}. ${item}`, ...headingStyle(22, PRIMARY, true, 0).run }),
            new TextRun({ text: `  .........  ${i + 3}`, ...normalStyle })
          ]
        })
      );
    });

    // ---- RESULT SECTION: EXECUTIVE SUMMARY ----
    contentChildren.push(...addHeading('Resumen Ejecutivo', 1, true));

    contentChildren.push(
      addPara(`El presente Assessment de Procesos fue realizado para ${clientData.razon_social || 'el cliente'} con el objetivo de detectar problemas operativos que puedan ser solucionados mediante implementaciones tecnológicas. Se evaluaron ${config.areas.length} áreas de negocio, obteniendo los siguientes resultados:`)
    );

    contentChildren.push(addPara(''));
    contentChildren.push(addPara(`Puntaje promedio general: ${(resumen.promedio * 2).toFixed(1)} / 10`, { bold: true, color: PRIMARY, size: 24 }));
    contentChildren.push(addPara(`Áreas en nivel Crítico: ${resumen.criticos}`, { color: 'ff5630', bold: true }));
    contentChildren.push(addPara(`Áreas en nivel de Atención: ${resumen.atencion}`, { color: 'ffab00', bold: true }));
    contentChildren.push(addPara(`Áreas en nivel Saludable: ${resumen.saludables}`, { color: '36b37e', bold: true }));
    contentChildren.push(addPara(''));

    // Summary table
    const summaryRows = [
      new TableRow({
        tableHeader: true,
        children: [
          makeTableCell('Área', { width: 2800, bold: true, shading: PRIMARY, color: WHITE }),
          makeTableCell('Puntaje', { width: 1200, bold: true, shading: PRIMARY, color: WHITE, alignment: AlignmentType.CENTER }),
          makeTableCell('Nivel', { width: 1500, bold: true, shading: PRIMARY, color: WHITE, alignment: AlignmentType.CENTER }),
          makeTableCell('Estado', { width: 1000, bold: true, shading: PRIMARY, color: WHITE, alignment: AlignmentType.CENTER })
        ]
      })
    ];

    scores.forEach(s => {
      summaryRows.push(
        new TableRow({
          children: [
            makeTableCell(`${s.icono} ${s.nombre}`, { width: 2800 }),
            makeTableCell(s.score.toFixed(1), { width: 1200, alignment: AlignmentType.CENTER, bold: true }),
            makeTableCell(s.nivel, { width: 1500, alignment: AlignmentType.CENTER, color: s.color, bold: true }),
            makeTableCell(s.nivelIcono, { width: 1000, alignment: AlignmentType.CENTER })
          ]
        })
      );
    });

    contentChildren.push(
      new Table({
        rows: summaryRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorder
      })
    );

    // ---- DETAIL BY AREA ----
    contentChildren.push(...addHeading('Detalle por Área', 1, true));

    scores.forEach((s, idx) => {
      contentChildren.push(...addHeading(`${s.icono} ${s.nombre} — ${s.nivelIcono} ${s.nivel} (${s.score.toFixed(1)}/5)`, 2));

      const detailRows = [
        new TableRow({
          tableHeader: true,
          children: [
            makeTableCell('#', { width: 400, bold: true, shading: PRIMARY, color: WHITE, alignment: AlignmentType.CENTER }),
            makeTableCell('Pregunta', { width: 3800, bold: true, shading: PRIMARY, color: WHITE }),
            makeTableCell('Respuesta', { width: 1200, bold: true, shading: PRIMARY, color: WHITE, alignment: AlignmentType.CENTER }),
            makeTableCell('Peso', { width: 600, bold: true, shading: PRIMARY, color: WHITE, alignment: AlignmentType.CENTER })
          ]
        })
      ];

      const areaConfig = config.areas.find(a => a.id === s.id);
      s.detalles.forEach((d, i) => {
        const respText = d.respuesta !== null
          ? ['1', '2', '3', '4', '5'][d.respuesta - 1] || `${d.respuesta}`
          : '—';
        const bgColor = i % 2 === 0 ? LIGHT_BG : WHITE;
        detailRows.push(
          new TableRow({
            children: [
              makeTableCell(`${i + 1}`, { width: 400, alignment: AlignmentType.CENTER, shading: bgColor }),
              makeTableCell(d.pregunta, { width: 3800, shading: bgColor, size: 18 }),
              makeTableCell(respText, { width: 1200, alignment: AlignmentType.CENTER, shading: bgColor, bold: true }),
              makeTableCell(`${d.peso}`, { width: 600, alignment: AlignmentType.CENTER, shading: bgColor })
            ]
          })
        );
      });

      contentChildren.push(
        new Table({
          rows: detailRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorder
        })
      );

      contentChildren.push(addPara(''));

      const areaObs = Object.entries(observaciones)
        .filter(([qId]) => {
          const q = areaConfig ? areaConfig.preguntas.find(p => p.id === qId) : null;
          return q !== null;
        })
        .map(([, text]) => text)
        .filter(t => t.trim());

      if (areaObs.length > 0) {
        contentChildren.push(addPara('Observaciones:', { bold: true, color: PRIMARY }));
        areaObs.forEach(obs => {
          contentChildren.push(addBullet(obs));
        });
      }
    });

    // ---- PRIORITIZATION ----
    contentChildren.push(...addHeading('Priorización', 1, true));
    contentChildren.push(
      addPara('A continuación se presenta el ranking de áreas ordenadas por nivel de criticidad, priorizando aquellas con menor puntaje:')
    );

    const prioRows = [
      new TableRow({
        tableHeader: true,
        children: [
          makeTableCell('Prioridad', { width: 900, bold: true, shading: PRIMARY, color: WHITE, alignment: AlignmentType.CENTER }),
          makeTableCell('Área', { width: 2600, bold: true, shading: PRIMARY, color: WHITE }),
          makeTableCell('Puntaje', { width: 1000, bold: true, shading: PRIMARY, color: WHITE, alignment: AlignmentType.CENTER }),
          makeTableCell('Nivel', { width: 1200, bold: true, shading: PRIMARY, color: WHITE, alignment: AlignmentType.CENTER }),
          makeTableCell('Acción Recomendada', { width: 2800, bold: true, shading: PRIMARY, color: WHITE })
        ]
      })
    ];

    scores.forEach((s, i) => {
      const rec = recomendaciones.find(r => r.area === s.nombre);
      const bgColor = i % 2 === 0 ? LIGHT_BG : WHITE;
      prioRows.push(
        new TableRow({
          children: [
            makeTableCell(`${i + 1}`, { width: 900, alignment: AlignmentType.CENTER, shading: bgColor, bold: true }),
            makeTableCell(`${s.icono} ${s.nombre}`, { width: 2600, shading: bgColor, size: 18 }),
            makeTableCell(s.score.toFixed(1), { width: 1000, alignment: AlignmentType.CENTER, shading: bgColor, bold: true }),
            makeTableCell(s.nivel, { width: 1200, alignment: AlignmentType.CENTER, shading: bgColor, color: s.color, bold: true }),
            makeTableCell(rec ? rec.titulo : '—', { width: 2800, shading: bgColor, size: 18 })
          ]
        })
      );
    });

    contentChildren.push(
      new Table({
        rows: prioRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorder
      })
    );

    // ---- RECOMMENDATIONS ----
    contentChildren.push(...addHeading('Recomendaciones', 1, true));
    contentChildren.push(
      addPara('En función de los resultados obtenidos, se presentan las siguientes recomendaciones tecnológicas para cada área evaluada:')
    );

    recomendaciones.forEach((rec, i) => {
      contentChildren.push(
        new Paragraph({
          spacing: { before: 300, after: 60 },
          children: [
            new TextRun({ text: `${rec.areaIcono} ${rec.area}`, ...headingStyle(24, PRIMARY, true, 0).run })
          ]
        })
      );

      const prioColors = { Crítica: 'ff5630', Media: 'ffab00', Baja: '36b37e' };
      contentChildren.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `[${rec.prioridad}] `, ...headingStyle(20, prioColors[rec.prioridad] || PRIMARY, true, 0).run }),
            new TextRun({ text: rec.titulo, ...headingStyle(22, PRIMARY, true, 0).run })
          ]
        })
      );

      contentChildren.push(
        new Paragraph({
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({ text: rec.texto, ...normalStyle })
          ]
        })
      );
    });

    // ---- GENERAL OBSERVATIONS ----
    contentChildren.push(...addHeading('Observaciones Generales', 1, true));
    contentChildren.push(
      addPara('El siguiente análisis busca ser una guía para la toma de decisiones estratégicas en materia de transformación digital. Se recomienda abordar las áreas críticas de forma prioritaria y establecer un plan de acción con hitos medibles.')
    );

    contentChildren.push(addPara(''));
    contentChildren.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({ text: '🚨  Riesgos identificados:', ...headingStyle(24, 'ff5630', true, 0).run })
        ]
      })
    );

    const riesgos = recomendaciones.filter(r => r.prioridad === 'Crítica');
    if (riesgos.length > 0) {
      riesgos.forEach(r => {
        contentChildren.push(addBullet(`${r.area}: ${r.titulo}`));
      });
    } else {
      contentChildren.push(addPara('No se identificaron riesgos críticos en esta evaluación.'));
    }

    contentChildren.push(addPara(''));
    contentChildren.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({ text: '💡  Oportunidades de innovación:', ...headingStyle(24, '00a3bf', true, 0).run })
        ]
      })
    );

    const innovaciones = recomendaciones.filter(r => r.prioridad === 'Baja');
    if (innovaciones.length > 0) {
      innovaciones.forEach(r => {
        contentChildren.push(addBullet(`${r.area}: ${r.titulo}`));
      });
    } else {
      contentChildren.push(addPara('Todas las áreas requieren mejoras sustanciales antes de considerar innovaciones.'));
    }

    // ---- BUILD DOCUMENT ----
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: 'Arial', size: 22, color: '333333' }
          }
        }
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: 11909, height: 16834 },
              margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
            }
          },
          headers: {
            default: logoArrayBuffer
              ? new Header({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new ImageRun({
                          data: logoArrayBuffer,
                          transformation: { width: 100, height: 40, type: 'png' }
                        })
                      ]
                    })
                  ]
                })
              : undefined
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Assessment de Procesos — Retail Tecnológico', size: 16, color: GRAY, font: 'Arial' }),
                    new TextRun({ text: '  |  Página ', size: 16, color: GRAY, font: 'Arial' }),
                    new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY, font: 'Arial' })
                  ]
                })
              ]
            })
          },
          children: [...coverChildren, ...contentChildren]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const filename = `Assessment_${(clientData.razon_social || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    saveAs(blob, filename);
  }
};
