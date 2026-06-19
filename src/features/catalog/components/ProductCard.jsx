import React from 'react';

export const ProductCard = ({ product, onAddToCart, onSelect }) => {
  const { id, title, category, price, originalPrice, image, isNew, badge } = product;

  return (
    <article 
      onClick={() => onSelect && onSelect(product)}
      className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT flex flex-col overflow-hidden relative group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Badge / Tag */}
      {isNew && (
        <span className="absolute top-2 left-2 bg-error text-on-error px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm z-10">
          Nuevo
        </span>
      )}
      {!isNew && badge && (
        <span className="absolute top-2 left-2 bg-surface-variant text-on-surface-variant px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm z-10 border border-outline-variant">
          {badge}
        </span>
      )}

      {/* Image */}
      <div className="aspect-square bg-surface-container-high w-full relative p-2 overflow-hidden">
        <img 
          alt={title} 
          className="w-full h-full object-cover object-center mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
          src={image} 
        />
      </div>

      {/* Content */}
      <div className="p-xs flex flex-col flex-grow justify-between gap-1">
        <div>
          <span className="text-[10px] font-label-sm text-on-surface-variant uppercase tracking-wider block mb-0.5">
            {category}
          </span>
          <h3 className="text-body-sm font-body-md text-on-surface leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
            {title}
          </h3>
        </div>
        
        <div className="mt-1">
          {originalPrice && (
            <p className="text-label-sm font-label-sm text-on-surface-variant line-through text-[10px]">
              {originalPrice}
            </p>
          )}
          <p className="text-headline-sm font-headline-sm text-primary font-bold">
            {price}
          </p>
        </div>
      </div>

      <div className="p-xs pt-0">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full bg-surface-container text-primary border border-outline-variant py-1.5 rounded-DEFAULT text-label-sm font-label-sm flex items-center justify-center gap-1 mt-1 hover:border-secondary transition-colors group-hover:bg-secondary group-hover:text-on-secondary group-hover:border-transparent cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]" data-icon="add_shopping_cart">add_shopping_cart</span>
          Agregar
        </button>
      </div>
    </article>
  );
};
