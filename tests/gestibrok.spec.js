import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Admin Usuario/ }).click();
  await expect(page.getByRole('heading', { name: 'Hoy', exact: true }).first()).toBeVisible();
}

async function quickTask(page, title) {
  await page.getByRole('button', { name: 'Añadir tarea', exact: true }).click();
  await page.getByPlaceholder('Nombre de la tarea').fill(title);
  await page.getByRole('button', { name: 'Añadir tarea', exact: true }).last().click();
  await page.getByRole('button', { name: /Asignado a mí/ }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
}

test('carga estilos locales y accede con un perfil de demo sin peticiones externas', async ({ page }) => {
  const errors = [];
  const external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', req => { if (!req.url().startsWith('http://127.0.0.1:5173') && !req.url().startsWith('data:')) external.push(req.url()); });
  await page.goto('/');
  await expect(page.getByText('Sin autenticación real', { exact: false })).toBeVisible();
  const profile = page.getByRole('button', { name: /Admin Usuario/ });
  await expect(profile).toHaveCSS('border-radius', '16px');
  await profile.click();
  await expect(page.getByRole('heading', { name: 'Hoy', exact: true }).first()).toBeVisible();
  await expect(page.getByText('Tu día está despejado')).toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('crea y edita un trámite con subtareas y conserva los cambios al recargar', async ({ page }) => {
  await login(page);
  await quickTask(page, 'Renovar póliza de flota');
  await page.reload();
  await page.getByRole('button', { name: /Asignado a mí/ }).click();
  await page.getByText('Renovar póliza de flota', { exact: true }).click();
  await page.getByPlaceholder('Título del trámite...').fill('Renovación de flota revisada');
  await page.getByPlaceholder('Añadir una descripción detallada...').fill('Comparar garantías antes de renovar.');
  await page.getByPlaceholder('Añadir paso...').fill('Solicitar documentación');
  await page.getByPlaceholder('Añadir paso...').press('Enter');
  await page.getByRole('combobox', { name: 'Estado del trámite' }).selectOption('En curso');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.getByRole('button', { name: 'Descartar tiempo y Cerrar', exact: true }).click();
  await expect(page.getByText('Renovación de flota revisada', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /Asignado a mí/ }).click();
  await page.getByText('Renovación de flota revisada', { exact: true }).click();
  await expect(page.getByPlaceholder('Añadir una descripción detallada...')).toHaveValue('Comparar garantías antes de renovar.');
  await expect(page.getByText('Solicitar documentación', { exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Estado del trámite' })).toHaveValue('En curso');
});

test('completa y elimina un trámite con confirmación', async ({ page }) => {
  await login(page);
  await quickTask(page, 'Trámite para completar');
  const row = page.getByRole('row').filter({ hasText: 'Trámite para completar' });
  await row.getByRole('checkbox').click();
  await expect(row).toHaveCount(0);
  await page.getByPlaceholder('Buscar...').fill('Trámite para completar');
  await expect(row.getByRole('checkbox')).toBeChecked();
  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: 'Eliminar Trámite para completar' }).click();
  await expect(row).toHaveCount(0);
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gestibrok_mock_v11')))).toEqual([]);
});

test('permite consultar inicio, clientes, seguros, tablero y calendario', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Inicio', exact: true }).click();
  await expect(page.getByRole('banner').getByRole('heading', { name: 'Inicio', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clientes 360°', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cartera de Clientes' })).toBeVisible();
  await expect(page.getByPlaceholder('Buscar cliente...')).toBeVisible();
  await page.getByRole('button', { name: 'Panel de seguros', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Asignado a mí/ }).click();
  await page.getByRole('button', { name: 'Vista', exact: true }).click();
  await page.getByRole('button', { name: 'Panel', exact: true }).click();
  await expect(page.getByText('Por hacer', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Vista', exact: true }).click();
  await page.getByRole('button', { name: 'Calendario', exact: true }).click();
  await expect(page.locator('main')).toContainText(/Lun|lun|LUN/);
});

test('descarga un paquete ZIP real', async ({ page }) => {
  await login(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Descargar ZIP', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('gestibrok_portable.zip');
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const data = Buffer.concat(chunks);
  expect(data.subarray(0, 2).toString()).toBe('PK');
  expect(data.length).toBeGreaterThan(10000);
});

test('en móvil abre navegación y permite crear una tarea', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('button', { name: 'Añadir tarea', exact: true }).click();
  await page.getByPlaceholder('Nombre de la tarea').fill('Llamada desde móvil');
  await page.getByRole('button', { name: 'Fecha límite', exact: true }).click();
  await page.getByRole('dialog', { name: 'Elegir fecha límite' }).getByRole('button', { name: /^Hoy/ }).click();
  await page.getByRole('combobox', { name: 'Contexto', exact: true }).selectOption('Comercial');
  await page.getByRole('button', { name: 'Añadir tarea', exact: true }).last().click();
  await page.getByRole('button', { name: /Asignado a mí/ }).click();
  await expect(page.getByText('Llamada desde móvil', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByText('Llamada desde móvil', { exact: true }).click();
  await expect(page.getByPlaceholder('Título del trámite...')).toBeInViewport();
  await page.getByPlaceholder('Título del trámite...').fill('Llamada móvil revisada');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.getByRole('button', { name: 'Descartar tiempo y Cerrar', exact: true }).click();
  await expect(page.getByText('Llamada móvil revisada', { exact: true })).toBeVisible();
});

test('añade fecha, contexto y recordatorio y avisa con la aplicación abierta', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-06-10T09:00:00') });
  await login(page);
  await page.getByRole('button', { name: 'Añadir tarea', exact: true }).click();
  await page.getByPlaceholder('Nombre de la tarea').fill('Renovación con aviso');
  await page.getByRole('button', { name: 'Fecha límite', exact: true }).click();
  await page.getByRole('button', { name: 'Mañana', exact: false }).click();
  await page.getByRole('combobox', { name: 'Contexto', exact: true }).selectOption('Contratación');
  await page.getByRole('button', { name: 'Recordatorios', exact: true }).click();
  await page.getByLabel('Fecha y hora del recordatorio').fill('2030-06-10T09:02');
  await page.getByRole('dialog', { name: 'Añadir tarea' }).getByRole('button', { name: 'Añadir tarea', exact: true }).click();
  await page.getByRole('button', { name: /Contratación/ }).click();
  await expect(page.getByText('Renovación con aviso', { exact: true })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('gestibrok_mock_v11'))[0]);
  expect(saved).toMatchObject({ dueDate: '2030-06-11', module: 'Contratación', reminderDate: '2030-06-10T09:02' });
  await expect(page.getByRole('region', { name: 'Recordatorios pendientes' })).toHaveCount(0);
  await page.clock.fastForward(180000);
  await page.getByRole('button', { name: 'Abrir recordatorio: Renovación con aviso' }).click();
  await expect(page.getByPlaceholder('Título del trámite...')).toHaveValue('Renovación con aviso');
  await page.getByRole('tab', { name: 'Planificación', exact: true }).click();
  await expect(page.getByLabel('Recordatorio', { exact: true })).toHaveValue('2030-06-10T09:02');
  await page.getByRole('button', { name: 'Cerrar trámite', exact: true }).click();
  await page.getByRole('button', { name: 'Descartar recordatorio: Renovación con aviso' }).click();
  await page.reload();
  await expect(page.getByRole('region', { name: 'Recordatorios pendientes' })).toHaveCount(0);
});

test('guardar y cerrar permite reabrir, seguir trabajando y conservar tiempo y borrador de email', async ({ page }) => {
  await login(page);
  await quickTask(page, 'Trámite de seguimiento');
  await page.getByText('Trámite de seguimiento', { exact: true }).click();
  await page.getByRole('button', { name: 'Email', exact: true }).click();
  await page.getByLabel('Destinatario del email').fill('cliente@example.com');
  await page.getByLabel('Asunto del email').fill('Documentación de su póliza');
  await page.getByLabel('Mensaje del email').fill('¿Puede revisar el documento?');
  const mailto = new URL(await page.getByRole('link', { name: 'Abrir en mi correo' }).getAttribute('href'));
  expect(mailto.protocol).toBe('mailto:');
  expect(decodeURIComponent(mailto.pathname)).toBe('cliente@example.com');
  expect(mailto.searchParams.get('subject')).toBe('Documentación de su póliza');
  expect(mailto.searchParams.get('body')).toBe('¿Puede revisar el documento?');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.locator('input[type="number"]').fill('5');
  await page.getByRole('button', { name: 'Guardar y Cerrar', exact: true }).click();
  await page.getByText('Trámite de seguimiento', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Guardar y Cerrar', exact: true })).toHaveCount(0);
  await page.getByPlaceholder('Título del trámite...').fill('Seguimiento actualizado');
  await page.getByPlaceholder('Añadir paso...').fill('Revisar documento recibido');
  await page.getByPlaceholder('Añadir paso...').press('Enter');
  await page.getByRole('button', { name: 'Email', exact: true }).click();
  await expect(page.getByLabel('Mensaje del email')).toHaveValue('¿Puede revisar el documento?');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.getByRole('button', { name: 'Descartar tiempo y Cerrar', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: /Asignado a mí/ }).click();
  await page.getByText('Seguimiento actualizado', { exact: true }).click();
  await expect(page.getByText('Revisar documento recibido', { exact: true })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('gestibrok_mock_v11'))[0]);
  expect(saved.totalTimeSpent).toBe(5);
  expect(saved.emailDraft.to).toBe('cliente@example.com');
});


test('organiza los campos de la tarea sin scroll lateral y conserva los cambios entre pestañas', async ({ page }) => {
  await login(page);
  await quickTask(page, 'Organización compacta');
  await page.getByText('Organización compacta', { exact: true }).click();
  const sidebar = page.getByRole('complementary', { name: 'Organización de la tarea' });
  for (const height of [620, 768, 1000]) {
    await page.setViewportSize({ width: 1366, height });
    for (const section of ['Esencial', 'Planificación', 'Detalles']) {
      await sidebar.getByRole('tab', { name: section, exact: true }).click();
      const panel = sidebar.getByRole('tabpanel');
      await expect(panel).toBeVisible();
      const size = await panel.evaluate(element => ({ client: element.clientHeight, scroll: element.scrollHeight }));
      expect(size.scroll, `${section}, pantalla de ${height}px`).toBeLessThanOrEqual(size.client + 1);
    }
  }
  await sidebar.getByRole('tab', { name: 'Esencial', exact: true }).click();
  await sidebar.getByLabel('Contexto', { exact: true }).selectOption('Siniestros');
  await sidebar.getByLabel('Tipo de trámite').selectOption('Apertura');
  await sidebar.getByLabel('Prioridad', { exact: true }).selectOption('Alta');
  await sidebar.getByLabel('Supervisor', { exact: true }).selectOption('u2');
  await sidebar.getByRole('button', { name: 'Asignar a Ana García', exact: true }).click();
  await sidebar.getByRole('tab', { name: 'Detalles', exact: true }).click();
  await sidebar.getByLabel('Nueva etiqueta').fill('Revisar documentación');
  await sidebar.getByRole('button', { name: 'Añadir etiqueta', exact: true }).click();
  await sidebar.getByLabel('Dirección o lugar').fill('Oficina principal');
  await sidebar.getByRole('tab', { name: 'Planificación', exact: true }).click();
  await sidebar.getByLabel('Recordatorio', { exact: true }).fill('2030-07-01T10:00');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.getByRole('button', { name: 'Descartar tiempo y Cerrar', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: /Asignado a mí/ }).click();
  await page.getByText('Organización compacta', { exact: true }).click();
  await expect(sidebar.getByLabel('Contexto', { exact: true })).toHaveValue('Siniestros');
  await expect(sidebar.getByLabel('Tipo de trámite')).toHaveValue('Apertura');
  await expect(sidebar.getByLabel('Supervisor', { exact: true })).toHaveValue('u2');
  await expect(sidebar.getByRole('button', { name: 'Asignar a Ana García', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await sidebar.getByRole('tab', { name: 'Detalles', exact: true }).click();
  await expect(sidebar.getByText('Revisar documentación', { exact: true })).toBeVisible();
  await expect(sidebar.getByLabel('Dirección o lugar')).toHaveValue('Oficina principal');
  await sidebar.getByRole('tab', { name: 'Planificación', exact: true }).click();
  await expect(sidebar.getByLabel('Recordatorio', { exact: true })).toHaveValue('2030-07-01T10:00');
});

test('en móvil accede directamente a Organización sin recorrer la tarea', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await quickTask(page, 'Organización desde móvil');
  await page.getByText('Organización desde móvil', { exact: true }).click();
  await page.getByRole('button', { name: 'Organización', exact: true }).click();
  const sidebar = page.getByRole('complementary', { name: 'Organización de la tarea' });
  await expect(sidebar.getByLabel('Contexto', { exact: true })).toBeInViewport();
  await sidebar.getByLabel('Contexto', { exact: true }).selectOption('Comercial');
  await sidebar.getByRole('tab', { name: 'Planificación', exact: true }).click();
  await expect(sidebar.getByLabel('Recordatorio', { exact: true })).toBeInViewport();
  await page.getByRole('button', { name: 'Volver a la tarea', exact: true }).click();
  await expect(page.getByPlaceholder('Título del trámite...')).toBeInViewport();
});

test('prepara WhatsApp, valida el teléfono y conserva el borrador sin enviar mensajes', async ({ page }) => {
  await login(page);
  await quickTask(page, 'Seguimiento por WhatsApp');
  await page.getByText('Seguimiento por WhatsApp', { exact: true }).click();
  await page.getByRole('button', { name: 'WhatsApp', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Preparar mensaje de WhatsApp' });
  await expect(panel.getByText('Sin sincronización', { exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Continuar en WhatsApp', exact: true })).toBeDisabled();
  await panel.getByLabel('Teléfono de WhatsApp').fill('abc');
  await expect(panel.getByText(/Revisa el número/)).toBeVisible();
  await panel.getByLabel('Teléfono de WhatsApp').fill('+34 600 123 456');
  await panel.getByRole('button', { name: 'Documentación', exact: true }).click();
  await expect(panel.getByLabel('Mensaje de WhatsApp')).toHaveValue(/documentación pendiente/);
  await panel.getByLabel('Mensaje de WhatsApp').fill('Hola, ¿puedes revisar la póliza?');
  const destination = new URL(await panel.getByRole('link', { name: 'Continuar en WhatsApp' }).getAttribute('href'));
  expect(destination.origin).toBe('https://wa.me');
  expect(destination.pathname).toBe('/34600123456');
  expect(destination.searchParams.get('text')).toBe('Hola, ¿puedes revisar la póliza?');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.getByRole('button', { name: 'Descartar tiempo y Cerrar', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: /Asignado a mí/ }).click();
  await page.getByText('Seguimiento por WhatsApp', { exact: true }).click();
  await page.getByRole('button', { name: 'WhatsApp', exact: true }).click();
  await expect(panel.getByLabel('Teléfono de WhatsApp')).toHaveValue('+34 600 123 456');
  await expect(panel.getByLabel('Mensaje de WhatsApp')).toHaveValue('Hola, ¿puedes revisar la póliza?');
});
