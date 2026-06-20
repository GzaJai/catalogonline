import React from 'react';

/** Extrae precio numérico desde string "$X,XXX.XX" */
const parsePriceNum = (str) => {
  if (!str) return Infinity;
  return parseFloat(String(str).replace(/[$,]/g, '')) || Infinity;
};

/** Obtiene el precio mínimo entre variantes disponibles */
const getMinPrice = (variants) => {
  const available = variants.filter(v => v.status === 'Disponible' || !v.status);
  if (available.length === 0) return null;
  const min = Math.min(...available.map(v => parsePriceNum(v.price)));
  return available.find(v => parsePriceNum(v.price) === min)?.price || null;
};

export const ProductCard = ({ model, onAddToCart, onSelect }) => {
  const { title, category, image, variants = [] } = model;
  const isVariantModel = variants.length > 0;
  const hasSingleVariant = variants.length === 1;

  // Primer variant como representante para cards legacy
  const firstVariant = variants[0] || {};

  // Precio "Desde" para modelos multi-variante
  const minPrice = isVariantModel ? getMinPrice(variants) : firstVariant.price;
  const hasPrice = minPrice && minPrice !== Infinity;

  // Contar disponibles
  const availableCount = variants.filter(v => v.status === 'Disponible' || !v.status).length;

  // Badge del modelo si todas las variantes son "Nuevo"
  const allNew = variants.length > 0 && variants.every(v => v.isNew === true || String(v.isNew).toLowerCase() === 'true');
  const anyBadge = variants.find(v => v.badge);

  return (
    <article
      onClick={() => onSelect && onSelect(model)}
      className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT flex flex-col overflow-hidden relative group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Badge */}
      {allNew && (
        <span className="absolute top-2 left-2 bg-error text-on-error px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm z-10">
          Nuevo
        </span>
      )}
      {!allNew && anyBadge && (
        <span className="absolute top-2 left-2 bg-surface-variant text-on-surface-variant px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm z-10 border border-outline-variant">
          {anyBadge.badge}
        </span>
      )}

      {/* Image */}
      <div className="aspect-square bg-surface-container-high w-full relative p-2 overflow-hidden">
        <img
          alt={title}
          className="w-full h-full object-cover object-center mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          src={image || firstVariant.image}
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
          {isVariantModel && !hasSingleVariant ? (
            <>
              {hasPrice && (
                <p className="text-headline-sm font-headline-sm text-primary font-bold">
                  Desde {minPrice}
                </p>
              )}
              <p className="text-[10px] font-label-sm text-on-surface-variant mt-0.5">
                {availableCount} variant{availableCount !== 1 ? 'es' : ''} disponible{availableCount !== 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <>
              {hasPrice && (
                <p className="text-headline-sm font-headline-sm text-primary font-bold">
                  {minPrice}
                </p>
              )}
              {/* Para variante única, mostrar condición si existe */}
              {firstVariant.condition && (
                <p className="text-[10px] font-label-sm text-on-surface-variant mt-0.5">
                  {firstVariant.condition}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="p-xs pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Si es variante única, agregar directo; si no, abrir detalle
            if (hasSingleVariant) {
              onAddToCart(firstVariant);
            } else {
              onSelect && onSelect(model);
            }
          }}
          className="w-full bg-surface-container text-primary border border-outline-variant py-1.5 rounded-DEFAULT text-label-sm font-label-sm flex items-center justify-center gap-1 mt-1 hover:border-secondary transition-colors group-hover:bg-secondary group-hover:text-on-secondary group-hover:border-transparent cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]" data-icon={hasSingleVariant ? "add_shopping_cart" : "visibility"}>
            {hasSingleVariant ? "add_shopping_cart" : "visibility"}
          </span>
          {hasSingleVariant ? 'Agregar' : 'Ver variantes'}
        </button>
      </div>
    </article>
  );
};
