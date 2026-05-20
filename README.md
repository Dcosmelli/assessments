# Assessment de Procesos — Retail Tecnológico

Cuestionario interactivo para detectar problemas de procesos en empresas de retail de productos tecnológicos, con generación automática de informe DOCX.

## 🚀 Deploy en GitHub Pages

1. Crear un repositorio en GitHub (ej: `tu-user/assessments`)
2. Subir todos los archivos:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-user/assessments.git
   git push -u origin main
   ```
3. Ir a **Settings > Pages** del repositorio
4. En "Source" seleccionar `main` y carpeta `/ (root)`
5. Guardar. El sitio queda disponible en `https://tu-user.github.io/assessments/`

## 📋 Uso

1. Abrir la URL del sitio (o `index.html` con un servidor local)
2. Ingresar razón social del cliente y fecha
3. Completar las 7 secciones del cuestionario (31 preguntas en total)
4. Revisar los resultados con scoring automático
5. Descargar el informe en formato DOCX

## 🧩 Estructura del proyecto

```
├── index.html                    # Página principal
├── css/styles.css                # Estilos del cuestionario
├── js/
│   ├── app.js                    # Orquestador principal
│   ├── questionnaire.js          # Motor del cuestionario
│   ├── scoring.js                # Sistema de puntuación
│   └── doc-generator.js          # Generación de DOCX
├── config/
│   └── preguntas.yaml            # Config: áreas, preguntas, recomendaciones
├── templates/
│   ├── ModeloDocumentoPortada.docx          # Template original
│   ├── ModeloDocumentoPortada_tagged.docx   # Template con tags (docxtemplater)
│   └── logo.png                              # Logo para el encabezado del DOCX
├── scripts/
│   └── prepare_template.py       # Script para generar template con tags
└── README.md
```

## ⚙️ Personalización

### Preguntas y áreas
Editar `config/preguntas.yaml`:
- Agregar/quitar áreas en `areas`
- Modificar preguntas, pesos y textos
- Ajustar recomendaciones en `recomendaciones_por_area`

### Logo
Reemplazar `templates/logo.png` con el logo de la empresa (200x80px recomendado).

### Template DOCX
El informe se genera con la librería `docx` (JS) estilizado para coincidir con el template. Para usar `docxtemplater` con el template original:
1. Agregar tags `{tag}` al template DOCX
2. Ejecutar `python3 scripts/prepare_template.py` para generar la versión con tags

## 🛠 Desarrollo local

```bash
# Servir con Python
python3 -m http.server 8080
# Abrir http://localhost:8080
```

## 📦 Dependencias (CDN)

- [js-yaml](https://github.com/nodeca/js-yaml) — parseo de YAML
- [docx](https://github.com/dolanmedia/docx) — generación de DOCX
- [FileSaver](https://github.com/eligrey/FileSaver.js) — descarga de archivos
