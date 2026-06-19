/**
 * KROM — Image Upload Service (Cloudinary)
 * ==========================================
 * Sube imágenes a Cloudinary desde el frontend usando un Upload Preset unsigned.
 *
 * Configuración (desde .env):
 *   VITE_CLOUDINARY_CLOUD_NAME   → tu_cloud_name
 *   VITE_CLOUDINARY_UPLOAD_PRESET → unsigned upload preset
 *
 * Transformaciones aplicadas:
 *   w_500,c_fill,q_auto,f_auto
 *   - w_500:    ancho 500px (liviano para catálogo)
 *   - c_fill:   recorta para llenar el tamaño (mantiene aspecto)
 *   - q_auto:   calidad óptima automática
 *   - f_auto:   formato óptimo automático (WebP/AVIF si el browser lo soporta)
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

console.log('[imageUpload] Inicializado:', {
  CLOUD_NAME: CLOUD_NAME || '(VACÍA — revisá el .env)',
  UPLOAD_PRESET: UPLOAD_PRESET ? '✓ definido' : '✗ VACÍA — revisá el .env',
});

/**
 * Sube un archivo de imagen a Cloudinary y devuelve la URL segura
 * con transformaciones de optimización incluidas.
 *
 * @param {File} file - Archivo de imagen seleccionado por el usuario
 * @returns {Promise<string>} secure_url con transformaciones
 */
export async function uploadImageToCloudinary(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary no está configurado. Revisá VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en el .env'
    );
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Formato no soportado: ${file.type}. Usá JPG, PNG, WebP, GIF o AVIF.`
    );
  }

  // Validar tamaño (máx 10MB)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(
      `La imagen es demasiado grande (${mb}MB). El máximo es 10MB.`
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  console.log('[imageUpload] Subiendo:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

  let response;
  try {
    response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });
  } catch (networkError) {
    console.error('[imageUpload] Error de red:', networkError);
    throw new Error(`Error de conexión con Cloudinary: ${networkError.message}`);
  }

  const data = await response.json();

  if (!response.ok || data.error) {
    console.error('[imageUpload] Error de Cloudinary:', data);
    const msg = data.error?.message || `HTTP ${response.status}`;
    throw new Error(`Error al subir imagen a Cloudinary: ${msg}`);
  }

  // Las transformaciones no se pueden pasar como parámetro en uploads unsigned.
  // Las inyectamos directamente en la URL devuelta.
  // Formato Cloudinary:
  //   Antes:  /image/upload/v1234/public_id.jpg
  //   Después: /image/upload/w_500,c_fill,q_auto,f_auto/v1234/public_id.jpg
  const TRANSFORMATIONS = 'w_500,c_fill,q_auto,f_auto';
  const optimizedUrl = data.secure_url.replace(
    /\/image\/upload\//,
    `/image/upload/${TRANSFORMATIONS}/`
  );

  console.log('[imageUpload] Subida exitosa:', optimizedUrl);
  return optimizedUrl;
}
