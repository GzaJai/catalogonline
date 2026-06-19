/**
 * KROM — Product API Service
 * ===========================
 * Encapsula las peticiones al Google Apps Script que gestiona el Google Sheet.
 *
 * Configuración (desde .env):
 *   VITE_GSHEET_API_URL  → URL del Web App de Google Apps Script
 *   VITE_GSHEET_API_KEY  → API Key que valida el backend
 *
 * NOTA: Google Apps Script NO soporta CORS preflight (OPTIONS).
 * Por eso los POST usan Content-Type: text/plain en lugar de application/json.
 * El body igual se envía como JSON string, pero el content-type evita el preflight.
 */

const API_URL = import.meta.env.VITE_GSHEET_API_URL || '';
const API_KEY = import.meta.env.VITE_GSHEET_API_KEY || '';

console.log('[productApi] Inicializado:', {
  API_URL: API_URL || '(VACÍA — revisá el .env)',
  API_KEY: API_KEY ? '✓ definida' : '✗ VACÍA — revisá el .env',
});

/**
 * Obtiene todos los productos desde el Google Sheet (vía doGet).
 */
export async function fetchProducts() {
  let urlString = API_URL;

  // Agregar API Key como query param
  try {
    const url = new URL(API_URL);
    url.searchParams.set('x-api-key', API_KEY);
    urlString = url.toString();
  } catch (urlError) {
    console.warn('[productApi] URL inválida, usando string directo:', urlError);
    // Si la URL no se puede parsear, agregamos el param manualmente
    const separator = API_URL.includes('?') ? '&' : '?';
    urlString = `${API_URL}${separator}x-api-key=${encodeURIComponent(API_KEY)}`;
  }

  console.log('[productApi] GET →', urlString);

  let response;
  try {
    response = await fetch(urlString, {
      method: 'GET',
      redirect: 'follow', // Apps Script a veces redirige con gsr=
    });
  } catch (networkError) {
    console.error('[productApi] ERROR de red en GET:', networkError);
    throw new Error(`Error de conexión: ${networkError.message}. Verificá que VITE_GSHEET_API_URL sea correcta y que el CORS esté habilitado.`);
  }

  console.log('[productApi] GET response status:', response.status, response.statusText);
  console.log('[productApi] GET final URL:', response.url);

  // Intentar parsear como texto primero por si la respuesta no es JSON
  const text = await response.text();
  console.log('[productApi] GET response body (primeros 500 chars):', text.substring(0, 500));

  // Google Apps Script a veces devuelve HTML cuando hay error
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    console.error('[productApi] ERROR: La respuesta es HTML, no JSON. Posible error de autenticación o deploy.');
    console.error('[productApi] HTML (primeros 300 chars):', text.substring(0, 300));
    throw new Error(`La API devolvió HTML en lugar de JSON. Probablemente el Script no está desplegado como Web App con acceso "Anyone". Revisá el deploy.`);
  }

  let result;
  try {
    result = JSON.parse(text);
  } catch (parseError) {
    console.error('[productApi] ERROR: La respuesta no es JSON válido:', parseError);
    console.error('[productApi] Respuesta raw (primeros 500 chars):', text.substring(0, 500));
    throw new Error(`La API respondió con formato inesperado. Status: ${response.status}. Revisá que la URL del Script sea correcta.`);
  }

  if (result.status !== 'success') {
    console.error('[productApi] ERROR en respuesta:', result);
    throw new Error(result.message || 'Error al obtener productos');
  }

  console.log('[productApi] GET éxito —', result.data?.length || 0, 'productos');
  return result.data;
}

/**
 * Helper interno para POST requests (usa text/plain para evitar CORS preflight).
 *
 * IMPORTANTE: Google Apps Script NO expone HTTP headers en doPost(e).
 * Por eso la API Key se envía TAMBIÉN como query param en la URL (e.parameter)
 * y ADEMÁS en el body (por si el backend la lee desde ahí).
 */
async function postAction(payload) {
  const bodyStr = JSON.stringify(payload);

  // Pasar API Key como query param porque doPost(e).parameter los captura
  const url = new URL(API_URL);
  url.searchParams.set('x-api-key', API_KEY);

  console.log('[productApi] POST →', url.toString());
  console.log('[productApi] POST payload:', payload);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',  // ← EVITA CORS PREFLIGHT. Google Apps Script NO responde OPTIONS.
    },
    body: bodyStr,
  });

  console.log('[productApi] POST response status:', response.status, response.statusText);
  console.log('[productApi] POST response headers:', Object.fromEntries(response.headers.entries()));

  const text = await response.text();
  console.log('[productApi] POST response body (raw):', text.substring(0, 500));

  let result;
  try {
    result = JSON.parse(text);
  } catch (parseError) {
    console.error('[productApi] ERROR: Respuesta POST no es JSON:', parseError);
    console.error('[productApi] Body raw:', text.substring(0, 500));
    throw new Error(`La API respondió con formato inesperado. Status: ${response.status}.`);
  }

  if (result.status !== 'success') {
    console.error('[productApi] ERROR en respuesta POST:', result);
    throw new Error(result.message || 'Error en la operación');
  }

  console.log('[productApi] POST éxito —', result.message);
  return result;
}

/**
 * Crea un nuevo producto en el Google Sheet.
 * @param {Object} product - { title, category, price, image }
 */
export async function createProduct(product) {
  console.log('[productApi] createProduct:', product);
  const result = await postAction({
    action: 'create',
    product,
  });
  return result.data;
}

/**
 * Actualiza un producto existente en el Google Sheet.
 * @param {number|string} id - ID del producto a actualizar
 * @param {Object} product - Campos a actualizar
 */
export async function updateProduct(id, product) {
  console.log('[productApi] updateProduct:', { id, product });
  const result = await postAction({
    action: 'update',
    id,
    product,
  });
  return result;
}

/**
 * Elimina un producto del Google Sheet.
 * @param {number|string} id - ID del producto a eliminar
 */
export async function deleteProduct(id) {
  console.log('[productApi] deleteProduct:', { id });
  const result = await postAction({
    action: 'delete',
    id,
  });
  return result;
}
