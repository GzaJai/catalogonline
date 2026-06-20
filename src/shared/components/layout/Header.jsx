import React, { useState, useRef, useEffect } from 'react';

export const Header = ({ searchQuery, onSearchChange, totalItems = 0, onCartOpen }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleOpenSearch = () => setIsSearchOpen(true);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    onSearchChange('');
  };

  return (
    <header className="bg-surface sticky z-50 border-b border-outline-variant shadow-sm flex flex-col px-margin-mobile py-3 md:py-sm gap-1 md:gap-sm">
      <div className="flex justify-between items-center w-[90%] md:w-[70%] mx-auto">
        <div className="text-xl md:text-headline-md font-headline-md font-black tracking-tighter text-primary">CatalogOnline</div>
        <div className="flex gap-sm items-center justify-center">
          {/* Lupa — mobile only, se oculta cuando la búsqueda está abierta */}
          {!isSearchOpen && (
            <button
              onClick={handleOpenSearch}
              aria-label="Buscar"
              className="flex md:hidden text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              <span className="material-symbols-outlined" data-icon="search">search</span>
            </button>
          )}

          {/* Input de búsqueda inline — mobile only, cuando está abierto */}
          {isSearchOpen && (
            <div className="md:hidden relative flex-1 min-w-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" data-icon="search">search</span>
              <input
                ref={inputRef}
                className="w-full bg-surface-container-highest border border-outline-variant rounded-full py-1.5 pl-10 pr-4 text-body-sm font-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none placeholder:text-on-surface-variant transition-all"
                placeholder="Buscar por modelo, SKU..."
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}

          {/* Botón cerrar búsqueda — mobile only, solo cuando está abierto */}
          {isSearchOpen && (
            <button
              onClick={handleCloseSearch}
              aria-label="Cerrar búsqueda"
              className="md:hidden text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              <span className="material-symbols-outlined" data-icon="close">close</span>
            </button>
          )}

          <button
            onClick={onCartOpen}
            aria-label="Carrito"
            className="flex text-on-surface-variant hover:text-primary transition-colors duration-200 relative cursor-pointer"
          >
            <span className="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-error text-on-error text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Barra de búsqueda — desktop siempre visible, mobile oculta */}
      <div className="relative w-[95%] md:w-[70%] mx-auto hidden md:block">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] md:text-[20px]" data-icon="search">search</span>
        <input
          className="w-full bg-surface-container-highest border border-outline-variant rounded-full py-1.5 md:py-2 pl-10 pr-4 text-body-sm md:text-body-md font-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none placeholder:text-on-surface-variant transition-all"
          placeholder="Buscar por modelo, SKU..."
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </header>
  );
};
