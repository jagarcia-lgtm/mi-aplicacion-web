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
