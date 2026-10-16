# GestiBrok · Gestión para corredurías

Aplicación incorporada a partir de `gestibrok_portable.zip`, proporcionado por el usuario. La interfaz y los componentes originales de GestiBrok sustituyen al prototipo Nexo; no se ha regenerado la aplicación a partir del documento de instrucciones incluido en el ZIP.

## Desarrollo

Requisitos: Node.js >=22.12, npm y Python 3 para crear el paquete portable. Entorno validado con Node 24.19.0, npm 11.9.0 y Python 3.12.14.

```bash
cd /workspace/mi-aplicacion-web
npm ci --cache /workspace/.npm-cache
npm run package:portable
npm run dev -- --port 5173 --strictPort
```

No se requieren claves, variables ni servicios externos para la demo. React 19, TypeScript, Vite y Tailwind CSS se instalan desde el lockfile. Los estilos se compilan localmente; no dependen del CDN de Tailwind ni de fuentes externas.

## Qué se ha incorporado

- Selección de perfiles de demostración e inicio configurable.
- Vista Hoy, resumen de Inicio, buzón y filtros por contexto, aseguradora, prioridad y responsable.
- Creación rápida con calendario de fecha límite, contexto seleccionable y recordatorios; edición de trámites, subtareas, notas, estados y registro de tiempo.
- Recordatorios dentro de GestiBrok mientras la aplicación esté abierta; no hay notificaciones con la aplicación cerrada.
- Borradores de email guardados con cada tarea y apertura en el programa de correo mediante mailto, sin envío automático.
- Lista, tablero Kanban y calendario.
- Organización de la tarea en pestañas compactas: Esencial (cliente, póliza, contexto, prioridad y equipo), Planificación (fechas y recordatorio) y Detalles (etiquetas y ubicación). En móvil se abre desde el botón Organización, sin recorrer el formulario.
- Pantalla de WhatsApp con teléfono internacional editable, plantillas, borrador persistente y enlace externo para revisar y enviar el mensaje en WhatsApp.
- Vistas de Clientes 360° y Panel de seguros. Sus contenidos dependen de los datos locales; la copia portable no trae una cartera de clientes ni pólizas.
- Etiquetas, configuración y descarga del código portable.

## Límites de la versión portable

Los perfiles no son autenticación real y los permisos no se aplican en un servidor. Se usan las claves originales `gestibrok_mock_v11`, `my_task_manager_auth_user`, `gestibrok_clients_v1` y otras en `localStorage`. Los datos se guardan por navegador y origen; no hay sincronización entre dispositivos.

Firebase no está conectado. Las solicitudes de firma siguen siendo simulaciones. WhatsApp permite preparar un borrador y abrir una conversación externa; no sincroniza mensajes ni confirma envíos o lecturas. El email permite preparar un borrador y abrirlo en el programa de correo del usuario; no hay envío integrado ni recepción/sincronización de mensajes. Los enlaces de WhatsApp abren la aplicación externa de WhatsApp; no envían mensajes automáticamente. Los adjuntos no tienen almacenamiento de archivos real. El asistente IA muestra que no está conectado; no se incrustan claves API en JavaScript. Conectar estos servicios requiere un trabajo posterior de backend y autenticación.

Los datos anteriores de Nexo usan otra clave (`nexo.tasks.v1`) y no se borran ni se migran automáticamente. Se conservó el prototipo previo fuera del checkout en `/workspace/shared/backups/nexo-before-gestibrok.tar.gz`. El ZIP original se conserva como adjunto; no se ejecutaron sus scripts de restauración.

## Comprobaciones

```bash
npm run typecheck
npm test
npm run build:demo
```

Playwright usa Chromium en `/usr/bin/chromium` (o la ruta establecida en `CHROMIUM_PATH`) y arranca el servidor si no hay uno en el puerto 5173. Las once pruebas cubren acceso y estilos sin peticiones externas, creación/edición/persistencia/subtareas, finalización/eliminación, vistas principales, descarga ZIP, creación/edición móvil, fecha/contexto/recordatorios y reapertura tras guardar con tiempo y borrador de email, organización sin scroll lateral a distintas alturas, acceso móvil a los datos y preparación/persistencia de WhatsApp sin envío. Cada prueba utiliza un navegador aislado.

## Compilación y publicación

`npm run build:demo` genera un paquete portable de código y compila en `dist/` con rutas relativas, compatible con la subruta de GitHub Pages. El paquete portable incluye únicamente rutas explícitas de código y configuración; excluye credenciales, `.env`, dependencias instaladas, datos del navegador y archivos del entorno.

La publicación usa la rama `gh-pages`; el código fuente de esta integración se conserva en una rama separada `gestibrok`. `main` permanece intacta y no se requiere una PR. Para GitHub Pages: `Settings → Pages → Deploy from a branch → gh-pages → / (root)`.

La ruta esperada es `https://jagarcia-lgtm.github.io/mi-aplicacion-web/`. El despliegue y su disponibilidad pública deben comprobarse después de subir la compilación; una compilación local o un push por sí solos no garantizan que la web esté publicada.
