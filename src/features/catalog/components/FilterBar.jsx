import React from 'react';

export const FilterBar = ({ totalProducts = 0 }) => {
  return (
    <div className="flex justify-between items-center px-margin-mobile lg:px-margin-desktop py-sm md:w-[80%] md:mx-auto">
      <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
        Mostrando {totalProducts} productos
      </span>
      <button className="flex items-center gap-1 text-primary text-label-lg font-label-lg hover:underline">
        <span className="material-symbols-outlined text-[18px]" data-icon="swap_vert">swap_vert</span>
        Ordenar
      </button>
    </div>
  );
};
