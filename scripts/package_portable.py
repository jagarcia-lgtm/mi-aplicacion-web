"""Package an explicit list of source files; never include credentials or browser data."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
files = [root / name for name in [
    'package.json', 'package-lock.json', 'index.html', 'tsconfig.json',
    'tailwind.config.cjs', 'postcss.config.cjs', 'playwright.config.js',
    '.gitignore', 'README.md', 'public/favicon.svg', 'scripts/package_portable.py', 'docs/firestore_schema.json',
]]
files += sorted((root / 'src').rglob('*.ts'))
files += sorted((root / 'src').rglob('*.tsx'))
files += sorted((root / 'src').rglob('*.css'))
files += sorted((root / 'tests').rglob('*.js'))
destination = root / 'public' / 'gestibrok_portable.zip'
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for file in files:
        archive.write(file, file.relative_to(root))
print(f'Paquete portable generado: {len(files)} archivos de código y configuración.')
