# Wizard de Selección de Secciones — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir la pantalla de bienvenida en un wizard de 3 pasos: (1) elegir secciones, (2) datos del cliente, (3) confirmación antes de iniciar el assessment.

**Architecture:** Se agrega `welcomeStep: 1` al objeto `App` en `js/app.js`. La función `renderWelcome` despacha a tres funciones específicas (`renderWelcomeStep1/2/3`) según el valor de `welcomeStep`. Se agrega un helper `_wizardIndicator(step)` que genera el indicador visual numerado. Se añaden estilos CSS mínimos para el nuevo indicador.

**Tech Stack:** Vanilla JavaScript (ES6), HTML, CSS custom properties. Sin frameworks ni bundler.

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `js/app.js` | Agregar `welcomeStep`; refactorizar `renderWelcome` en 3 funciones; agregar helper `_wizardIndicator` |
| `css/styles.css` | Agregar estilos para `.wizard-steps`, `.wizard-step`, `.wizard-step-circle`, `.wizard-step-connector`, `.wizard-step-label` |

---

## Task 1: Agregar `welcomeStep` al estado de `App` y resetear en `showView`

**Files:**
- Modify: `js/app.js:1-9` (objeto App y método init)
- Modify: `js/app.js:29-39` (método showView)

- [ ] **Step 1: Abrir el archivo y verificar el estado actual**

Abrí `js/app.js`. Las primeras líneas deben verse así:
```js
const App = {
  currentView: 'welcome',

  async init() {
```

Y `showView` en línea ~29:
```js
showView(view) {
    this.currentView = view;
    const container = document.getElementById('view-container');
```

- [ ] **Step 2: Agregar `welcomeStep: 1` al objeto App**

Reemplazá:
```js
const App = {
  currentView: 'welcome',
```
Por:
```js
const App = {
  currentView: 'welcome',
  welcomeStep: 1,
```

- [ ] **Step 3: Resetear `welcomeStep` en `showView` cuando se vuelve a welcome**

Reemplazá:
```js
  showView(view) {
    this.currentView = view;
    const container = document.getElementById('view-container');
    if (!container) return;
```
Por:
```js
  showView(view) {
    this.currentView = view;
    if (view === 'welcome') this.welcomeStep = 1;
    const container = document.getElementById('view-container');
    if (!container) return;
```

- [ ] **Step 4: Verificar en el navegador**

Abrí `index.html` en el navegador. La pantalla de bienvenida debe verse exactamente igual que antes (aún no cambiamos el render). Abrí la consola del navegador y ejecutá `App.welcomeStep` — debe devolver `1`. Luego ejecutá `App.showView('welcome')` — sigue siendo `1`.

- [ ] **Step 5: Commit**

```bash
git add js/app.js
git commit -m "feat: agregar welcomeStep al estado de App"
```

---

## Task 2: Agregar estilos CSS para el indicador de wizard

**Files:**
- Modify: `css/styles.css` (al final del archivo, antes del `@media`)

- [ ] **Step 1: Ubicar el lugar de inserción en styles.css**

Buscá la línea que contiene `/* Steps indicator */` (alrededor de línea 632). Los estilos nuevos van **antes** del bloque `@media (max-width: 640px)`.

- [ ] **Step 2: Agregar los estilos del wizard**

Insertá antes del bloque `@media (max-width: 640px) {`:

```css
/* Wizard steps indicator */
.wizard-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.wizard-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.wizard-step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--gray-400);
  background: var(--white);
  transition: var(--transition);
}

.wizard-step.active .wizard-step-circle {
  border-color: var(--accent);
  color: var(--accent);
}

.wizard-step.completed .wizard-step-circle {
  border-color: var(--success);
  background: var(--success);
  color: white;
}

.wizard-step-label {
  font-size: 0.75rem;
  color: var(--gray-400);
  white-space: nowrap;
}

.wizard-step.active .wizard-step-label {
  color: var(--accent);
  font-weight: 600;
}

.wizard-step.completed .wizard-step-label {
  color: var(--success);
}

.wizard-step-connector {
  width: 48px;
  height: 2px;
  background: var(--gray-200);
  margin-bottom: 22px;
  flex-shrink: 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: agregar estilos CSS para wizard de bienvenida"
```

---

## Task 3: Refactorizar `renderWelcome` y agregar helper `_wizardIndicator`

**Files:**
- Modify: `js/app.js` — método `renderWelcome` y nuevo método `_wizardIndicator`

- [ ] **Step 1: Agregar el helper `_wizardIndicator` después de `renderWelcome`**

El helper genera el HTML del indicador de 3 pasos. Agregalo como nuevo método del objeto `App`, justo después del método `renderWelcome` (que vas a reemplazar en el siguiente paso):

```js
  _wizardIndicator(currentStep) {
    const labels = ['Secciones', 'Cliente', 'Confirmar'];
    return `
      <div class="wizard-steps">
        ${[1, 2, 3].map((n, i) => `
          <div class="wizard-step ${n === currentStep ? 'active' : n < currentStep ? 'completed' : ''}">
            <div class="wizard-step-circle">${n < currentStep ? '✓' : n}</div>
            <div class="wizard-step-label">${labels[i]}</div>
          </div>
          ${n < 3 ? '<div class="wizard-step-connector"></div>' : ''}
        `).join('')}
      </div>
    `;
  },
```

- [ ] **Step 2: Reemplazar el cuerpo de `renderWelcome` para que despache a los sub-pasos**

Reemplazá el método `renderWelcome(container) { ... }` completo (incluyendo toda la lógica de toggles, form y eventos) por:

```js
  renderWelcome(container) {
    switch (this.welcomeStep) {
      case 1: this.renderWelcomeStep1(container); break;
      case 2: this.renderWelcomeStep2(container); break;
      case 3: this.renderWelcomeStep3(container); break;
    }
  },
```

- [ ] **Step 3: Verificar en el navegador**

Recargá el navegador. Debe aparecer una pantalla en blanco dentro del card (porque `renderWelcomeStep1` aún no existe). Abrí la consola — no debe haber errores de sintaxis JS. Si hay un error "renderWelcomeStep1 is not a function", es esperado — continuamos.

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: refactorizar renderWelcome para despachar a sub-pasos"
```

---

## Task 4: Implementar Paso 1 — Selección de secciones

**Files:**
- Modify: `js/app.js` — agregar método `renderWelcomeStep1`

- [ ] **Step 1: Agregar `renderWelcomeStep1` después de `renderWelcome`**

```js
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
```

- [ ] **Step 2: Verificar en el navegador**

Recargá el navegador. Debe aparecer:
- El indicador de 3 pasos con el "1" resaltado (color acento), "2" y "3" en gris
- El título "¿Qué áreas querés evaluar?"
- Los toggles de secciones (todos seleccionados por defecto)
- El contador "X área(s) seleccionada(s)"
- El botón "Siguiente →" habilitado

Probá deseleccionar todas las áreas → el botón "Siguiente →" se deshabilita. Volvé a seleccionar una → se habilita. Hacé click en "Siguiente →" → la pantalla debe quedar en blanco (paso 2 aún no implementado).

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: implementar paso 1 del wizard — selección de secciones"
```

---

## Task 5: Implementar Paso 2 — Datos del cliente

**Files:**
- Modify: `js/app.js` — agregar método `renderWelcomeStep2`

- [ ] **Step 1: Agregar `renderWelcomeStep2` después de `renderWelcomeStep1`**

```js
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
```

- [ ] **Step 2: Verificar en el navegador**

Recargá el navegador y avanzá al paso 2 (click en "Siguiente →" del paso 1). Debe aparecer:
- El indicador con el paso "1" en verde (completado ✓), el "2" resaltado (activo), el "3" en gris
- Los campos Razón Social y Fecha con los valores actuales
- Botones "← Anterior" y "Siguiente →"

Probá:
- Escribir un nombre en Razón Social → volver al paso 1 con "← Anterior" → volver al paso 2 → el nombre sigue ahí
- Click en "Siguiente →" → pantalla en blanco (paso 3 aún no implementado)

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: implementar paso 2 del wizard — datos del cliente"
```

---

## Task 6: Implementar Paso 3 — Confirmación

**Files:**
- Modify: `js/app.js` — agregar método `renderWelcomeStep3`

- [ ] **Step 1: Agregar `renderWelcomeStep3` después de `renderWelcomeStep2`**

```js
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
```

- [ ] **Step 2: Verificar en el navegador — flujo completo**

Recargá el navegador y recorré el flujo completo:

1. **Paso 1:** El indicador muestra "1" activo. Deseleccioná un área → "Siguiente" se deshabilita. Volvé a seleccionarla → click en "Siguiente →"
2. **Paso 2:** El indicador muestra "1" completado (✓), "2" activo. Ingresá un nombre de cliente → click en "Siguiente →"
3. **Paso 3:** El indicador muestra "1" y "2" completados, "3" activo. Verificá que aparezcan el nombre del cliente, la fecha, la lista de secciones con iconos y el total de preguntas.
4. Click en "← Anterior" → volvés al paso 2 con los datos del cliente intactos.
5. Avanzá nuevamente al paso 3 → click en "Comenzar Assessment →" → comienza la sección 1.
6. Completá el assessment y al hacer "Nuevo Assessment" → volvés al **paso 1** (no al formulario viejo).

- [ ] **Step 3: Verificar que el keydown de Enter funciona**

En el paso 1, presioná Enter → debe activar el botón "Siguiente →" (si está habilitado). En el paso 3, Enter → debe activar "Comenzar Assessment →". Esto ya funciona porque `bindEvents` busca `.btn-primary.btn-lg` o `#btn-next`.

- [ ] **Step 4: Commit final**

```bash
git add js/app.js
git commit -m "feat: implementar paso 3 del wizard — confirmación e inicio del assessment"
```

---

## Verificación final

- [ ] Flujo completo sin errores en consola
- [ ] `welcomeStep` se resetea a 1 al hacer "Nuevo Assessment"
- [ ] Con 0 secciones seleccionadas el botón "Siguiente" del paso 1 está deshabilitado
- [ ] Los datos del cliente persisten al navegar hacia atrás entre pasos
- [ ] El resumen del paso 3 refleja correctamente las secciones y datos ingresados
