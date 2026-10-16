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
