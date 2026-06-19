import React from 'react';

export const Header = ({ searchQuery, onSearchChange, totalItems = 0, onCartOpen }) => {
  return (
    <header className="bg-surface docked top-0 sticky z-50 border-b border-outline-variant shadow-sm flex flex-col px-margin-mobile py-sm gap-sm">
      <div className="flex justify-between items-center w-[90%] md:w-[70%] mx-auto">
        <div className="text-headline-md font-headline-md font-black tracking-tighter text-primary">CatalogOnline</div>
        <div className="flex gap-sm items-center">
          <button aria-label="Perfil" className="text-on-surface-variant hover:text-primary transition-colors duration-200">
            <span className="material-symbols-outlined" data-icon="person">person</span>
          </button>
          <button 
            onClick={onCartOpen}
            aria-label="Carrito" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-200 relative cursor-pointer"
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
      <div className="relative w-[95%] md:w-[70%] mx-auto">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" data-icon="search">search</span>
        <input 
          className="w-full bg-surface-container-highest border border-outline-variant rounded-full py-2 pl-10 pr-4 text-body-md font-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none placeholder:text-on-surface-variant transition-all" 
          placeholder="Buscar por modelo, SKU..." 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </header>
  );
};
