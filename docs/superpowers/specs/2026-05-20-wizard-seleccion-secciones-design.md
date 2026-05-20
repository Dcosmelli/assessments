# Diseño: Wizard de selección de secciones al inicio

**Fecha:** 2026-05-20  
**Alcance:** `js/app.js` únicamente — sin cambios en `questionnaire.js`, `scoring.js`, ni el YAML de configuración.

---

## Problema

La pantalla de bienvenida actual combina en una sola vista: la selección de secciones, los datos del cliente y el botón de inicio. El usuario quiere un flujo más guiado donde cada paso tenga un propósito claro y un indicador de progreso visible.

---

## Solución

Convertir la vista `welcome` en un wizard de 3 pasos numerados, manteniendo toda la lógica dentro de `renderWelcome` en `app.js`. El estado del paso activo se guarda en `App.welcomeStep`.

---

## Flujo de pantallas

```
[Paso 1: Secciones] → [Paso 2: Datos del cliente] → [Paso 3: Confirmación] → [Sección 1] → ... → [Resultados]
```

---

## Estado nuevo

Se agrega `welcomeStep: 1` al objeto `App`:

```js
const App = {
  currentView: 'welcome',
  welcomeStep: 1,
  // ...
};
```

Se resetea a `1` cada vez que se llama a `showView('welcome')` (al reiniciar el assessment).

---

## Paso 1 — Elegir secciones

- Título: "¿Qué áreas querés evaluar?"
- Indicador: "Paso 1 de 3"
- Contenido: los toggles de secciones actuales (sin cambios de lógica)
- Contador dinámico: "X área(s) seleccionada(s)"
- Botón "Siguiente →": deshabilitado si `enabledSections.length === 0`
- Sin botón "Anterior" (es el primer paso)

---

## Paso 2 — Datos del cliente

- Título: "Datos del cliente"
- Indicador: "Paso 2 de 3"
- Contenido: campos Razón Social y Fecha (igual que hoy)
- La Razón Social puede quedar vacía (no bloquea el avance)
- Botones: "← Anterior" y "Siguiente →"

---

## Paso 3 — Confirmación

- Título: "Resumen del assessment"
- Indicador: "Paso 3 de 3"
- Contenido:
  - Nombre del cliente (o "Sin especificar" si está vacío)
  - Fecha
  - Lista de secciones seleccionadas con icono y nombre
  - Cantidad total de preguntas a responder
- Botones: "← Anterior" y "Comenzar Assessment →"
- Al hacer click en "Comenzar": `Questionnaire.currentSectionIndex = 0` → `showView('section')`

---

## Indicador visual de wizard

Un componente de 3 pasos numerados en la parte superior de cada pantalla del wizard, similar al `steps-indicator` que ya existe para las secciones del assessment. El paso activo se muestra resaltado.

```
[1] → [2] → [3]
```

Reutiliza las clases CSS existentes `step-dot`, `active` y `completed` del `.steps-indicator`.

---

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/app.js` | Agregar `welcomeStep: 1`; refactorizar `renderWelcome` con switch de 3 pasos; resetear `welcomeStep` en `showView('welcome')` |
| `js/questionnaire.js` | Sin cambios |
| `css/styles.css` | Sin cambios (reutiliza estilos existentes) |
| `config/preguntas.yaml` | Sin cambios |

---

## Criterios de éxito

- El usuario no puede avanzar del paso 1 sin seleccionar al menos una sección.
- El paso 3 muestra correctamente las secciones elegidas y los datos del cliente.
- Al reiniciar el assessment (`showView('welcome')`), el wizard vuelve al paso 1.
- El estado de `enabledSections` y `clientData` se preserva si el usuario navega hacia atrás entre pasos.
