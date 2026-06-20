import React, { useState, useEffect } from 'react';
import { Header } from './shared/components/layout/Header';
import { Footer } from './shared/components/layout/Footer';
import { CategoryFilter, FilterBar, ProductGrid, ProductDetail } from './features/catalog';
import { CartDrawer, useCart } from './features/cart';
import { AdminLogin, AdminDashboard } from './features/admin';
import { useHash } from './shared/hooks/useHash';
import { fetchProducts, groupByModel } from './services/productApi';
import fallbackProducts from './data/products.json';

// ── Helpers ──

/** Obtiene las variantes disponibles (status = Disponible) */
const getAvailableVariants = (variants) => {
  return variants.filter(v => v.status === 'Disponible' || !v.status);
};

/** Agrupa datos planos en modelos (fallback si la API no lo hace) */
function groupFallback(data) {
  // Si ya vienen agrupados (tienen field "variants"), devolver directo
  if (data.length > 0 && data[0].variants) return data;
  return groupByModel(data);
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [hash, navigate] = useHash();

  // ── Catálogo dinámico desde Google Sheet ──
  const [catalogModels, setCatalogModels] = useState([]);      // agrupado (para público)
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(null);

  // ── Filtros inteligentes ──
  const [storageFilter, setStorageFilter] = useState([]);    // ej: ['128GB', '256GB']
  const [batteryMin, setBatteryMin] = useState(0);           // ej: 90 (% mínimo)

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsCatalogLoading(true);
      setCatalogError(null);
      try {
        const data = await fetchProducts();
        if (!cancelled) {
          setCatalogModels(groupFallback(Array.isArray(data) ? data : fallbackProducts));
        }
      } catch (err) {
        console.warn('[App] Error al obtener productos del Sheet, usando fallback local:', err.message);
        if (!cancelled) {
          setCatalogModels(groupFallback(fallbackProducts));
          setCatalogError(err.message);
        }
      } finally {
        if (!cancelled) {
          setIsCatalogLoading(false);
        }
      }
    }

    loadProducts();
    return () => { cancelled = true; };
  }, []);

  // ── Resolver modelo desde hash ──
  const modelRouteMatch = hash.match(/^#\/model\/(.+)$/);

  const selectedModel = modelRouteMatch
    ? catalogModels.find(m => m.model_id === decodeURIComponent(modelRouteMatch[1]))
    : null;

  const isAdminRoute = hash === '#/admin';

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getTotalItems
  } = useCart();

  // ── Categorías dinámicas ──
  const categories = ['Todos', ...new Set(catalogModels.map(m => m.category))];

  // ── Aplicar filtros ──
  const filteredModels = catalogModels.filter(model => {
    // Filtro por categoría
    const matchesCategory = selectedCategory === 'Todos'
      || model.category.toLowerCase() === selectedCategory.toLowerCase();

    // Filtro por búsqueda
    const matchesSearch = !searchQuery
      || model.title.toLowerCase().includes(searchQuery.toLowerCase())
      || model.category.toLowerCase().includes(searchQuery.toLowerCase())
      || model.variants.some(v =>
          (v.storage || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.color || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Filtros inteligentes (solo para modelos con variantes)
    const availableVariants = getAvailableVariants(model.variants);
    let matchesFilters = true;

    if (storageFilter.length > 0) {
      matchesFilters = availableVariants.some(v =>
        storageFilter.includes(v.storage)
      );
    }

    if (batteryMin > 0 && matchesFilters) {
      matchesFilters = availableVariants.some(v => {
        const batt = parseInt(String(v.battery || '0').replace('%', ''), 10);
        return batt >= batteryMin;
      });
    }

    return matchesCategory && matchesSearch && matchesFilters;
  });

  // ── Handlers ──
  const handleSelectModel = (model) => {
    navigate(`#/model/${encodeURIComponent(model.model_id)}`);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (hash.startsWith('#/model/')) {
      navigate('#/');
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">
      {isAdminRoute ? (
        isAdminAuthenticated ? (
          <AdminDashboard onLogout={() => { setIsAdminAuthenticated(false); navigate('#/'); }} />
        ) : (
          <AdminLogin onSuccess={() => setIsAdminAuthenticated(true)} />
        )
      ) : (
        <>
          <Header
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            totalItems={getTotalItems()}
            onCartOpen={() => setIsCartOpen(true)}
          />

          {/* Vista: Detalle de Modelo */}
          {selectedModel ? (
            <main className="flex-grow pb-xl bg-surface-container-low">
              <ProductDetail
                model={selectedModel}
                onBack={() => navigate('#/')}
                onAddToCart={handleAddToCart}
              />
            </main>
          ) : isCatalogLoading ? (
            <main className="flex-grow pb-xl bg-surface-container-low flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 py-20">
                <span className="material-symbols-outlined text-[40px] text-outline animate-spin" data-icon="sync">sync</span>
                <p className="text-body-md font-body-md text-on-surface-variant">Cargando productos...</p>
              </div>
            </main>
          ) : (
            <>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              <main className="flex-grow pb-xl bg-surface-container-low">
                <FilterBar
                  totalProducts={filteredModels.length}
                  variants={catalogModels.flatMap(m => m.variants)}
                  storageFilter={storageFilter}
                  onStorageFilterChange={setStorageFilter}
                  batteryMin={batteryMin}
                  onBatteryMinChange={setBatteryMin}
                />
                <ProductGrid
                  models={filteredModels}
                  onAddToCart={handleAddToCart}
                  onSelectModel={handleSelectModel}
                />
                {catalogError && (
                  <p className="text-body-sm font-body-md text-on-surface-variant text-center mt-md px-margin-mobile">
                    Usando datos locales — {catalogError}
                  </p>
                )}
              </main>
            </>
          )}
          <Footer />

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            getCartTotal={getCartTotal}
            clearCart={clearCart}
          />
        </>
      )}
    </div>
  );
}

export default App;
