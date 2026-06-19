import React, { useState, useEffect } from 'react';
import { Header } from './shared/components/layout/Header';
import { Footer } from './shared/components/layout/Footer';
import { CategoryFilter, FilterBar, ProductGrid, ProductDetail } from './features/catalog';
import { CartDrawer, useCart } from './features/cart';
import { AdminLogin, AdminDashboard } from './features/admin';
import { useHash } from './shared/hooks/useHash';
import { fetchProducts } from './services/productApi';
import fallbackProducts from './data/products.json';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [hash, navigate] = useHash();

  // ── Catálogo dinámico desde Google Sheet ──
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsCatalogLoading(true);
      setCatalogError(null);
      try {
        const data = await fetchProducts();
        if (!cancelled) {
          setCatalogProducts(Array.isArray(data) ? data : fallbackProducts);
        }
      } catch (err) {
        console.warn('[App] Error al obtener productos del Sheet, usando fallback local:', err.message);
        if (!cancelled) {
          setCatalogProducts(fallbackProducts);
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

  // Resolve selected product dynamically from Hash URL (e.g. #/product/5)
  const productRouteMatch = hash.match(/^#\/product\/(\d+)$/);
  const selectedProductId = productRouteMatch ? parseInt(productRouteMatch[1], 10) : null;
  const selectedProduct = selectedProductId
    ? catalogProducts.find(p => p.id === selectedProductId)
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

  // Extract unique categories dynamically
  const categories = ['Todos', ...new Set(catalogProducts.map(p => p.category))];

  // Filter products based on selected category and search query
  const filteredProducts = catalogProducts.filter(product => {
    const matchesCategory = selectedCategory === 'Todos' || product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    setIsCartOpen(true); // Open cart automatically when adding a product
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (hash.startsWith('#/product/')) {
      navigate('#/'); // Go back to catalog if user starts searching from detail view
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
          
          {selectedProduct ? (
            <main className="flex-grow pb-xl bg-surface-container-low">
              <ProductDetail 
                product={selectedProduct} 
                onBack={() => navigate('#/')} 
                onAddToCart={addToCart}
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
                <FilterBar totalProducts={filteredProducts.length} />
                <ProductGrid 
                  products={filteredProducts} 
                  onAddToCart={handleAddToCart} 
                  onSelectProduct={(product) => navigate(`#/product/${product.id}`)}
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
