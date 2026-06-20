import React from 'react';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({ models = [], onAddToCart, onSelectModel }) => {
  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-margin-mobile text-center gap-4">
        <span className="material-symbols-outlined text-[64px] text-outline opacity-60" data-icon="search_off">search_off</span>
        <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">No se encontraron productos</h3>
        <p className="text-body-md font-body-md text-on-surface-variant max-w-[320px]">
          Probá buscando con otros términos o seleccionando otra categoría.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-xs md:gap-sm px-margin-mobile lg:px-margin-desktop md:w-[80%] md:mx-auto">
      {models.map(model => (
        <ProductCard
          key={model.model_id}
          model={model}
          onAddToCart={onAddToCart}
          onSelect={onSelectModel}
        />
      ))}
    </div>
  );
};
