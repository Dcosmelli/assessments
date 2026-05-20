#!/usr/bin/env python3
"""
Prepara el template DOCX con tags para docxtemplater.
Convierte el template original en una version con marcadores {tag}
que docxtemplater puede reemplazar.

Uso: python3 scripts/prepare_template.py
"""

import zipfile
import os
import shutil
from xml.etree import ElementTree as ET
import re

TEMPLATE_SRC = 'templates/ModeloDocumentoPortada.docx'
TEMPLATE_DST = 'templates/ModeloDocumentoPortada_tagged.docx'

REPLACEMENTS = {
    'TITULO': '{titulo}',
    'Subtitulo': '{subtitulo}',
}

def main():
    if not os.path.exists(TEMPLATE_SRC):
        print(f'Template no encontrado: {TEMPLATE_SRC}')
        return

    shutil.copy2(TEMPLATE_SRC, TEMPLATE_DST)

    NS = {
        'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    }

    with zipfile.ZipFile(TEMPLATE_DST, 'r') as zin:
        data = zin.read('word/document.xml')
        root = ET.fromstring(data)
        texts = root.findall('.//w:t', NS)
        for t in texts:
            if t.text and t.text.strip() in REPLACEMENTS:
                old = t.text.strip()
                t.text = REPLACEMENTS[old]
                print(f'  Reemplazado: "{old}" -> "{REPLACEMENTS[old]}"')

        modified = ET.tostring(root, encoding='unicode')

    with zipfile.ZipFile(TEMPLATE_DST, 'r') as zin:
        temp_path = TEMPLATE_DST + '.tmp'
        with zipfile.ZipFile(temp_path, 'w', zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename == 'word/document.xml':
                    zout.writestr(item, modified)
                else:
                    zout.writestr(item, zin.read(item.filename))

    os.replace(temp_path, TEMPLATE_DST)
    print(f'\nTemplate preparado: {TEMPLATE_DST}')
    print('\nTags disponibles:')
    for tag in REPLACEMENTS.values():
        print(f'  {tag}')

if __name__ == '__main__':
    main()
