import React, { useState, useEffect, useCallback } from 'react';
import { Toast } from '../../../shared/components/Toast';
import { Modal } from '../../../shared/components/Modal';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../../services/productApi';
import { uploadImageToCloudinary } from '../../../services/imageUpload';

const EMPTY_FORM = { title: '', category: '', price: '', originalPrice: '', image: '', isNew: false, badge: '' };

// ── Helpers de precio ──
const parsePriceNum = (str) => {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[$,]/g, '')) || 0;
};

const formatPrice = (num) => {
  if (isNaN(num) || num <= 0) return '';
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getComputedPrices = (basePriceStr, discountStr) => {
  const base = parsePriceNum(basePriceStr);
  const d = parseFloat(discountStr) || 0;
  if (base <= 0) return { originalPrice: '', price: '' };
  if (d > 0) {
    const final = base * (1 - Math.min(d, 100) / 100);
    return { originalPrice: formatPrice(base), price: formatPrice(final) };
  }
  return { originalPrice: '', price: formatPrice(base) };
};

/**
 * AdminDashboard — Panel de administración de productos.
 *
 * - Muestra tabla con todos los productos desde Google Sheets.
 * - Modal para crear/editar. Botón de eliminar con confirmación.
 * - Toast de feedback. Auto-refresh post-operación.
 */
export const AdminDashboard = ({ onLogout }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = creating
  const [form, setForm] = useState(EMPTY_FORM);
  const [basePriceInput, setBasePriceInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [saving, setSaving] = useState(false);

  // Confirm delete
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Image upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  // Toast
  const [toast, setToast] = useState(null);

  // ── Cargar productos ──
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ── Toast helper ──
  const showToast = (message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  };

  // ── Modal: abrir para crear ──
  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setBasePriceInput('');
    setDiscountPercent('');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // ── Modal: abrir para editar ──
  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      title: product.title || '',
      category: product.category || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      image: product.image || '',
      isNew: product.isNew === true || String(product.isNew).toLowerCase() === 'true',
      badge: product.badge || '',
    });

    // Precargar precio base y descuento desde los valores guardados
    if (product.originalPrice) {
      const base = parsePriceNum(product.originalPrice);
      const final = parsePriceNum(product.price);
      const computedDiscount = base > 0 ? Math.round((1 - final / base) * 100) : 0;
      setBasePriceInput(product.originalPrice);
      setDiscountPercent(String(computedDiscount));
    } else {
      setBasePriceInput(product.price || '');
      setDiscountPercent('');
    }

    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // ── Modal: cerrar ──
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setBasePriceInput('');
    setDiscountPercent('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Guardar (create o update) ──
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = form.image;

      // Si hay un archivo nuevo seleccionado, subirlo primero a Cloudinary
      if (selectedFile) {
        setIsUploading(true);
        imageUrl = await uploadImageToCloudinary(selectedFile);
        setIsUploading(false);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

      const computedPrices = getComputedPrices(basePriceInput, discountPercent);
      const productData = {
        ...form,
        originalPrice: computedPrices.originalPrice,
        price: computedPrices.price,
        image: imageUrl,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        showToast('Producto actualizado correctamente');
      } else {
        await createProduct(productData);
        showToast('Producto creado correctamente');
      }
      closeModal();
      await loadProducts();
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
      setIsUploading(false);
    }
  };

  // ── Eliminar (Confirmado) ──
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      showToast('Producto eliminado correctamente');
      setProductToDelete(null);
      await loadProducts();
    } catch (err) {
      showToast(err.message || 'Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Precios calculados ──
  const computedPrices = getComputedPrices(basePriceInput, discountPercent);

  // ── Render ──

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[40px] text-outline animate-spin" data-icon="sync">sync</span>
          <p className="text-body-md font-body-md text-on-surface-variant">Cargando productos...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
        <div className="max-w-[384px] text-center flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] text-error" data-icon="cloud_off">cloud_off</span>
          <h2 className="text-headline-sm font-headline-sm text-on-surface">Error de conexión</h2>
          <p className="text-body-md font-body-md text-on-surface-variant">{error}</p>
          <button
            onClick={loadProducts}
            className="bg-primary text-on-primary rounded-DEFAULT py-2 px-6 font-label-lg text-label-lg hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-surface border-b border-outline-variant px-margin-mobile py-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-headline-md font-headline-md text-on-surface">Productos</h1>
              <p className="text-body-sm font-body-md text-on-surface-variant">
                {products.length} producto{products.length !== 1 ? 's' : ''} cargado{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-sm">
              <button
                onClick={openCreateModal}
                className="bg-primary text-on-primary rounded-DEFAULT py-2 px-4 font-label-lg text-label-lg flex items-center gap-1 hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
                Nuevo Producto
              </button>
              <button
                onClick={onLogout}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-2 cursor-pointer"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <span className="material-symbols-outlined text-[22px]" data-icon="logout">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tabla */}
        <div className="max-w-6xl mx-auto px-margin-mobile py-md">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <span className="material-symbols-outlined text-[64px] text-outline opacity-60" data-icon="inventory_2">inventory_2</span>
              <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">No hay productos</h3>
              <p className="text-body-md font-body-md text-on-surface-variant max-w-[320px]">
                Agregá tu primer producto usando el botón "Nuevo Producto".
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-outline-variant rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container">
                    <th className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider px-3 py-2.5 border-b border-outline-variant w-[60px]">ID</th>
                    <th className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider px-3 py-2.5 border-b border-outline-variant">Producto</th>
                    <th className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider px-3 py-2.5 border-b border-outline-variant hidden md:table-cell">Categoría</th>
                    <th className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider px-3 py-2.5 border-b border-outline-variant hidden sm:table-cell">Etiqueta</th>
                    <th className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider px-3 py-2.5 border-b border-outline-variant">Precio</th>
                    <th className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider px-3 py-2.5 border-b border-outline-variant w-[100px]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-3 py-2.5 text-body-sm font-body-md text-on-surface-variant">{product.id}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {product.image && (
                            <img
                              src={product.image}
                              alt=""
                              className="w-8 h-8 object-cover rounded-sm bg-surface-container-high"
                            />
                          )}
                          <span className="text-body-sm font-body-md text-on-surface line-clamp-1">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-body-sm font-body-md text-on-surface-variant hidden md:table-cell">
                        <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-DEFAULT text-[10px] font-label-sm uppercase">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        {product.isNew || product.badge ? (
                          <span className={`px-2 py-0.5 rounded-DEFAULT text-[10px] font-label-sm uppercase ${
                            product.isNew
                              ? 'bg-error text-on-error'
                              : 'bg-surface-variant text-on-surface-variant border border-outline-variant'
                          }`}>
                            {product.isNew ? 'Nuevo' : product.badge}
                          </span>
                        ) : (
                          <span className="text-[10px] text-on-surface-variant opacity-40">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col">
                          <span className="text-body-sm font-body-md text-on-surface font-semibold">{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-on-surface-variant line-through">{product.originalPrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-surface-container-highest rounded-DEFAULT transition-colors cursor-pointer"
                            aria-label={`Editar ${product.title}`}
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-DEFAULT transition-colors cursor-pointer"
                            aria-label={`Eliminar ${product.title}`}
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-[18px]" data-icon="delete">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Modal: Crear / Editar ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        maxWidthClass="max-w-[512px] md:max-w-[800px]"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-md">
          {/* Contenedor Grid Responsivo: 1 col en mobile, 2 col en desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            
            {/* Columna Izquierda: Datos del Producto */}
            <div className="flex flex-col gap-md">
              <div>
                <label htmlFor="prod-title" className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                  Título *
                </label>
                <input
                  id="prod-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-DEFAULT py-2 px-3 text-body-md font-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none placeholder:text-on-surface-variant"
                  placeholder="Ej: Auricular Bluetooth Pro"
                />
              </div>

              <div>
                <label htmlFor="prod-category" className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                  Categoría *
                </label>
                <input
                  id="prod-category"
                  type="text"
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-DEFAULT py-2 px-3 text-body-md font-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none placeholder:text-on-surface-variant"
                  placeholder="Ej: Auriculares, Cables, Fundas..."
                />
              </div>

              <div>
                <label htmlFor="prod-base-price" className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                  Precio Original *
                </label>
                <input
                  id="prod-base-price"
                  type="text"
                  required
                  value={basePriceInput}
                  onChange={(e) => setBasePriceInput(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-DEFAULT py-2 px-3 text-body-md font-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none placeholder:text-on-surface-variant"
                  placeholder="Ej: 12500"
                />
                <p className="text-body-sm font-body-md text-on-surface-variant mt-1">
                  Precio de lista antes del descuento. Ingresá solo números (ej: 12500).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label htmlFor="prod-discount" className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                    Descuento %
                  </label>
                  <input
                    id="prod-discount"
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-DEFAULT py-2 px-3 text-body-md font-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none placeholder:text-on-surface-variant"
                    placeholder="Ej: 20"
                  />
                </div>
                <div>
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                    Precio Final
                  </label>
                  <div className="w-full bg-surface-container-high border border-outline-variant rounded-DEFAULT py-2 px-3 text-body-md font-body-md min-h-[40px] flex items-center">
                    {computedPrices.price ? (
                      <>
                        <span className="font-semibold text-on-surface">{computedPrices.price}</span>
                        {computedPrices.originalPrice && (
                          <span className="ml-2 text-sm text-on-surface-variant line-through">{computedPrices.originalPrice}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-on-surface-variant">Automático</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label htmlFor="prod-is-new" className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                    Marcar como Nuevo
                  </label>
                  <label className="flex items-center gap-2 bg-surface-container-highest border border-outline-variant rounded-DEFAULT py-2.5 px-3 cursor-pointer hover:bg-surface-container-high transition-colors select-none">
                    <input
                      id="prod-is-new"
                      type="checkbox"
                      checked={form.isNew}
                      onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                      className="w-4 h-4 rounded-sm border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
                    />
                    <span className="text-body-md font-body-md text-on-surface">Producto Nuevo</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="prod-badge" className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                    Badge / Etiqueta
                  </label>
                  <input
                    id="prod-badge"
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-DEFAULT py-2.5 px-3 text-body-md font-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none placeholder:text-on-surface-variant"
                    placeholder="Ej: Pack x10, Oferta..."
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha: Carga de Imagen y Vista Previa */}
            <div className="flex flex-col gap-md justify-start">
              <div>
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                  Imagen
                </label>

                {/* Preview */}
                {(selectedFile || form.image) && (
                  <div className="mb-3 relative w-full aspect-video bg-surface-container-high rounded-lg overflow-hidden border border-outline-variant flex items-center justify-center">
                    <img
                      src={selectedFile ? URL.createObjectURL(selectedFile) : form.image}
                      alt="Preview"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 bg-error text-on-error rounded-full w-7 h-7 flex items-center justify-center hover:bg-error/90 transition-colors cursor-pointer shadow-md"
                        aria-label="Quitar imagen"
                        title="Quitar imagen"
                      >
                        <span className="material-symbols-outlined text-[16px]" data-icon="close">close</span>
                      </button>
                    )}
                  </div>
                )}

                {/* File input */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    id="prod-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                      }
                    }}
                    className="w-full text-body-md font-body-md text-on-surface file:mr-3 file:py-2 file:px-4 file:rounded-DEFAULT file:border-0 file:text-label-lg file:font-label-lg file:bg-surface-container file:text-on-surface-variant hover:file:bg-surface-container-high file:cursor-pointer file:transition-colors cursor-pointer bg-surface-container-highest border border-outline-variant rounded-DEFAULT py-1.5 px-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  />
                </div>

                {!selectedFile && form.image && editingProduct && (
                  <p className="text-body-sm font-body-md text-on-surface-variant mt-2">
                    Dejá este campo vacío para conservar la imagen actual.
                  </p>
                )}
                {selectedFile && (
                  <p className="text-body-sm font-body-md text-on-surface-variant mt-2">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Botones de Acción (siempre al final del formulario) */}
          <div className="flex items-center justify-end gap-sm pt-sm border-t border-outline-variant mt-sm">
            <button
              type="button"
              onClick={closeModal}
              className="bg-surface-container text-on-surface rounded-DEFAULT py-2 px-6 font-label-lg text-label-lg hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-on-primary rounded-DEFAULT py-2 px-6 font-label-lg text-label-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              {isUploading && <span className="material-symbols-outlined text-[18px] animate-spin" data-icon="sync">sync</span>}
              {isUploading ? (
                'Subiendo imagen...'
              ) : saving ? (
                'Guardando...'
              ) : editingProduct ? (
                'Guardar Cambios'
              ) : (
                'Crear Producto'
              )}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* ── Modal: Confirmación de Eliminación ── */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Confirmar Eliminación"
        maxWidthClass="max-w-[448px]"
      >
        <div className="flex flex-col gap-md">
          <p className="text-body-md font-body-md text-on-surface-variant">
            ¿Estás seguro de que querés eliminar el producto <strong>{productToDelete?.title}</strong>? Esta acción no se puede deshacer y afectará directamente al Google Sheet.
          </p>
          <div className="flex items-center justify-end gap-sm pt-sm border-t border-outline-variant mt-sm">
            <button
              onClick={() => setProductToDelete(null)}
              className="bg-surface-container text-on-surface rounded-DEFAULT py-2 px-6 font-label-lg text-label-lg hover:bg-surface-container-high transition-colors cursor-pointer"
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-error text-on-error rounded-DEFAULT py-2 px-6 font-label-lg text-label-lg hover:bg-error/95 transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              {deleting && <span className="material-symbols-outlined text-[18px] animate-spin" data-icon="sync">sync</span>}
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Toast ── */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};
