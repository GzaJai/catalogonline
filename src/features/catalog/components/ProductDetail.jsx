import { useState } from 'react';

// Número de WhatsApp para consultas (mismo que en CartDrawer)
const WHATSAPP_PHONE = '5492613659768';

/** Genera link de WhatsApp para consultar una variante */
const getWhatsAppLink = (title, color, storage) => {
  const text = `Hola! Vi el ${title} ${color} de ${storage} en su catálogo. ¿Sigue disponible?`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
};

/** Clasifica el porcentaje de batería en rangos */
const getBatteryRange = (batteryStr) => {
  if (!batteryStr) return null;
  const num = parseInt(String(batteryStr).replace('%', ''), 10);
  if (isNaN(num)) return null;
  if (num >= 90) return 'Excelente';
  if (num >= 80) return 'Muy bueno';
  return 'Bueno';
};

// ── Componente Principal ──

export const ProductDetail = ({ model, onBack, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const { variants = [] } = model || {};
  const availableVariants = variants.filter(v => v.status === 'Disponible' || !v.status);
  const firstVariant = availableVariants[0] || variants[0] || {};

  // Estados para selectores de variantes
  const [currentModelId, setCurrentModelId] = useState(model?.model_id);
  const [selectedStorage, setSelectedStorage] = useState(firstVariant.storage || '');
  const [selectedColor, setSelectedColor] = useState(firstVariant.color || '');
  const [selectedBatteryRange, setSelectedBatteryRange] = useState(
    getBatteryRange(firstVariant.battery) || ''
  );

  // ── MODO VARIANTES: Modelo con selectores interactivos ──
  const { title, category, image } = model || {};

  // Reiniciar estado si cambia de modelo
  if (model?.model_id !== currentModelId) {
    setCurrentModelId(model?.model_id);
    const newFirstVariant = availableVariants[0] || variants[0] || {};
    setSelectedStorage(newFirstVariant.storage || '');
    setSelectedColor(newFirstVariant.color || '');
    setSelectedBatteryRange(getBatteryRange(newFirstVariant.battery) || '');
  }

  // Encontrar la variante seleccionada activa
  const selectedVariant = variants.find(v =>
    v.storage === selectedStorage &&
    v.color === selectedColor &&
    getBatteryRange(v.battery) === selectedBatteryRange &&
    (v.status === 'Disponible' || !v.status)
  ) || variants.find(v =>
    v.storage === selectedStorage &&
    v.color === selectedColor &&
    getBatteryRange(v.battery) === selectedBatteryRange
  );

  // Extraer valores únicos para los chips
  const storageOptions = [...new Set(variants.map(v => v.storage).filter(Boolean))].sort((a, b) => {
    const numA = parseInt(a, 10) || 0;
    const numB = parseInt(b, 10) || 0;
    return numA - numB;
  });

  const colorOptions = [...new Set(variants.map(v => v.color).filter(Boolean))];

  const batteryOptions = [...new Set(variants.map(v => getBatteryRange(v.battery)).filter(Boolean))];
  const allBatteryRanges = ['Excelente', 'Muy bueno', 'Bueno'].filter(r => batteryOptions.includes(r));

  const totalAvailable = availableVariants.length;

  // Lógica de cambio inteligente de atributos
  const selectCombination = (storage, color, batteryRange) => {
    // 1. Coincidencia exacta disponible
    let match = variants.find(v =>
      v.storage === storage &&
      v.color === color &&
      getBatteryRange(v.battery) === batteryRange &&
      (v.status === 'Disponible' || !v.status)
    );
    if (match) {
      setSelectedStorage(match.storage);
      setSelectedColor(match.color);
      setSelectedBatteryRange(getBatteryRange(match.battery));
      return;
    }

    // 2. Coincidencia exacta no disponible (reservado/vendido)
    match = variants.find(v =>
      v.storage === storage &&
      v.color === color &&
      getBatteryRange(v.battery) === batteryRange
    );
    if (match) {
      setSelectedStorage(match.storage);
      setSelectedColor(match.color);
      setSelectedBatteryRange(getBatteryRange(match.battery));
      return;
    }

    // 3. Buscar variante con misma storage y color
    const sameStorageColor = variants.filter(v => v.storage === storage && v.color === color);
    if (sameStorageColor.length > 0) {
      const best = sameStorageColor.find(v => v.status === 'Disponible' || !v.status) || sameStorageColor[0];
      setSelectedStorage(best.storage);
      setSelectedColor(best.color);
      setSelectedBatteryRange(getBatteryRange(best.battery));
      return;
    }

    // 4. Buscar por storage sola
    const sameStorage = variants.filter(v => v.storage === storage);
    if (sameStorage.length > 0) {
      const best = sameStorage.find(v => v.status === 'Disponible' || !v.status) || sameStorage[0];
      setSelectedStorage(best.storage);
      setSelectedColor(best.color);
      setSelectedBatteryRange(getBatteryRange(best.battery));
      return;
    }

    // 5. Fallback a la primera variante disponible o cualquiera
    const fallback = availableVariants[0] || variants[0] || {};
    setSelectedStorage(fallback.storage || '');
    setSelectedColor(fallback.color || '');
    setSelectedBatteryRange(getBatteryRange(fallback.battery) || '');
  };

  const handleStorageClick = (s) => selectCombination(s, selectedColor, selectedBatteryRange);
  const handleColorClick = (c) => selectCombination(selectedStorage, c, selectedBatteryRange);
  const handleBatteryRangeClick = (b) => selectCombination(selectedStorage, selectedColor, b);

  return (
    <div className="w-full md:w-[85%] lg:w-[75%] mx-auto pt-xs md:pt-md pb-xl flex flex-col gap-xs md:gap-sm">
      {/* Tarjeta Principal */}
      <div className="relative bg-surface-container-lowest border-y sm:border border-outline-variant sm:rounded-DEFAULT shadow-sm">

        {/* ── HEADER CELESTE: back button + info ── */}
        <div className="bg-surface-container-low -mx-4 md:-mx-8 -mt-4 md:-mt-8 px-4 md:px-8 pt-4 md:pt-8 pb-4 md:pb-6 rounded-t-DEFAULT border-b border-outline-variant/20">
          <div className="flex items-center justify-start px-6 gap-8">
            {/* Izquierda: Botón Volver */}
            {/* <div className="shrink-0 pt-0.5"> */}
              <button
                onClick={onBack}
                className="md:hidden h-10 w-10 rounded-full bg-surface-container-lowest/90 border border-outline-variant flex items-center justify-center text-primary shadow-md hover:bg-surface-container-lowest transition-colors cursor-pointer"
                aria-label="Volver al catálogo"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
            {/* </div> */}

            {/* Derecha: Info del producto */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-label-sm font-label-sm text-secondary uppercase tracking-wider whitespace-nowrap">
                  {category}
                </span>
                {selectedVariant?.isNew && (
                  <span className="bg-error text-on-error px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm whitespace-nowrap">
                    Nuevo
                  </span>
                )}
                {selectedVariant?.badge && (
                  <span className="bg-surface-variant text-on-surface-variant border border-outline-variant px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm whitespace-nowrap">
                    {selectedVariant.badge}
                  </span>
                )}
                {selectedVariant?.status && selectedVariant.status !== 'Disponible' && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm whitespace-nowrap ${
                    selectedVariant.status === 'Reservado' ? 'bg-warning-container text-warning' : 'bg-surface text-on-surface-variant border border-outline'
                  }`}>
                    {selectedVariant.status}
                  </span>
                )}
              </div>
              <h1 className="text-headline-md md:text-headline-lg font-bold text-on-surface leading-tight">
                {title}
              </h1>
              <p className="text-body-sm text-on-surface-variant">
                Reacondicionado · {totalAvailable} disponible{totalAvailable !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* ── Grid Principal ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-sm md:gap-gutter p-4 md:p-8 pt-sm md:pt-6">
          {/* Columna Izquierda: Imagen del modelo */}
          <div className="relative md:col-span-5 flex items-center justify-center mx-auto rounded-sm overflow-hidden p-4 aspect-square max-h-75 md:max-h-none">

            <img
              src={image || selectedVariant?.image}
              alt={title}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Columna Derecha: Información y selectores */}
          <div className="md:col-span-7 flex flex-col gap-sm md:gap-md">


          {/* Precio de la variante seleccionada */}

          <div className="flex flex-col items-end gap-1 mt-sm">
            {selectedVariant ? (
              <>
                {selectedVariant.originalPrice && (
                  <span className="text-body-md text-on-surface-variant line-through">
                    ${selectedVariant.originalPrice}
                  </span>
                )}
                <span className="text-headline-lg font-extrabold text-primary">
                  ${selectedVariant.price}
                </span>
              </>
            ) : (
              <span className="text-body-md text-error font-bold">
                Combinación no disponible
              </span>
            )}
          </div>

          <hr className="border-outline-variant" />

          {/* Selector de Memoria Interna */}
          {storageOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                Memoria interna: <span className="font-medium text-on-surface-variant normal-case">{selectedStorage}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {storageOptions.map(storage => {
                  const isSelected = selectedStorage === storage;
                  const isCompatible = variants.some(v => v.storage === storage && v.color === selectedColor);
                  const isAvailable = variants.some(v => v.storage === storage && (v.status === 'Disponible' || !v.status));

                  let chipStyle;
                  if (isSelected) {
                    chipStyle = "border-2 border-secondary bg-secondary-container/10 text-secondary font-bold";
                  } else if (!isCompatible) {
                    chipStyle = "border border-dashed border-outline-variant opacity-40 hover:opacity-75";
                  } else if (!isAvailable) {
                    chipStyle = "border border-outline-variant opacity-60 bg-surface-container-lowest";
                  } else {
                    chipStyle = "border border-outline-variant hover:border-secondary";
                  }

                  return (
                    <button
                      key={storage}
                      onClick={() => handleStorageClick(storage)}
                      className={`px-4 py-2 rounded-md text-body-md cursor-pointer transition-all select-none ${chipStyle}`}
                    >
                      {storage}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selector de Color */}
          {colorOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                Color: <span className="font-medium text-on-surface-variant normal-case">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => {
                  const isSelected = selectedColor === color;
                  const isCompatible = variants.some(v => v.color === color && v.storage === selectedStorage);
                  const isAvailable = variants.some(v => v.color === color && (v.status === 'Disponible' || !v.status));

                  let chipStyle;
                  if (isSelected) {
                    chipStyle = "border-2 border-secondary bg-secondary-container/10 text-secondary font-bold";
                  } else if (!isCompatible) {
                    chipStyle = "border border-dashed border-outline-variant opacity-40 hover:opacity-75";
                  } else if (!isAvailable) {
                    chipStyle = "border border-outline-variant opacity-60 bg-surface-container-lowest";
                  } else {
                    chipStyle = "border border-outline-variant hover:border-secondary";
                  }

                  return (
                    <button
                      key={color}
                      onClick={() => handleColorClick(color)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-body-md cursor-pointer transition-all select-none ${chipStyle}`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-outline-variant flex-shrink-0"
                        style={{ backgroundColor: color.includes('Negro') ? '#1a1a1a'
                          : color.includes('Azul') ? '#2563eb'
                          : color.includes('Blanco') ? '#f5f5f5'
                          : color.includes('Rojo') ? '#dc2626'
                          : color.includes('Violeta') ? '#8b5cf6'
                          : color.includes('Gris') ? '#9ca3af'
                          : color.includes('Amarillo') ? '#eab308'
                          : color.includes('Natural') || color.includes('Titanio') ? '#a8a29e'
                          : '#e5e7eb'
                        }}
                      />
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selector de Batería */}
          {allBatteryRanges.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                Condición de Batería: <span className="font-medium text-on-surface-variant normal-case">{selectedBatteryRange}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {allBatteryRanges.map(range => {
                  const isSelected = selectedBatteryRange === range;
                  const isCompatible = variants.some(v => getBatteryRange(v.battery) === range && v.storage === selectedStorage && v.color === selectedColor);
                  const isAvailable = variants.some(v => getBatteryRange(v.battery) === range && (v.status === 'Disponible' || !v.status));

                  const refVariant = variants.find(v =>
                    getBatteryRange(v.battery) === range &&
                    v.storage === selectedStorage &&
                    v.color === selectedColor
                  );
                  const rangePriceStr = refVariant ? refVariant.price : '';

                  let chipStyle;
                  if (isSelected) {
                    chipStyle = "border-2 border-secondary bg-secondary-container/10 text-secondary font-bold";
                  } else if (!isCompatible) {
                    chipStyle = "border border-dashed border-outline-variant opacity-40 hover:opacity-75";
                  } else if (!isAvailable) {
                    chipStyle = "border border-outline-variant opacity-60 bg-surface-container-lowest";
                  } else {
                    chipStyle = "border border-outline-variant hover:border-secondary";
                  }

                  return (
                    <button
                      key={range}
                      onClick={() => handleBatteryRangeClick(range)}
                      className={`flex flex-col items-center justify-center min-w-[120px] p-2 rounded-md cursor-pointer transition-all select-none ${chipStyle}`}
                    >
                      <span className="text-body-md font-bold">{range}</span>
                      {rangePriceStr && (
                        <span className="text-[11px] opacity-80 mt-0.5">{rangePriceStr}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Información Detallada del Dispositivo Seleccionado */}
          {selectedVariant && (
            <div className="bg-surface-container-low border border-outline-variant rounded-DEFAULT p-3 flex flex-wrap gap-y-2 gap-x-6 text-body-sm">
              {selectedVariant.battery && (
                <div>
                  <span className="text-on-surface-variant font-medium">Batería real: </span>
                  <span className={`font-semibold ${parseInt(selectedVariant.battery) >= 90 ? 'text-success' : 'text-warning'}`}>
                    {selectedVariant.battery}
                  </span>
                </div>
              )}
              {selectedVariant.condition && (
                <div>
                  <span className="text-on-surface-variant font-medium">Estado físico: </span>
                  <span className="font-semibold text-on-surface">
                    {selectedVariant.condition}
                  </span>
                </div>
              )}
              <div>
                <span className="text-on-surface-variant font-medium">Stock: </span>
                <span className={`font-bold ${
                  !selectedVariant.status || selectedVariant.status === 'Disponible'
                    ? 'text-success'
                    : selectedVariant.status === 'Reservado'
                    ? 'text-warning'
                    : 'text-error'
                }`}>
                  {selectedVariant.status || 'Disponible'}
                </span>
              </div>
            </div>
          )}

          {/* Selector de Cantidad y Botón de WhatsApp / Carrito */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm border-t border-b border-outline-variant py-md mt-sm">
            {selectedVariant && (selectedVariant.status === 'Disponible' || !selectedVariant.status) ? (
              <>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-label-lg font-bold text-on-surface uppercase tracking-wider">Cantidad:</span>
                  <div className="flex items-center border border-outline-variant rounded-DEFAULT bg-surface-container-low">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                      disabled={quantity <= 1}
                      aria-label="Disminuir cantidad"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="text-body-md font-bold w-12 text-center select-none text-on-surface">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                      aria-label="Aumentar cantidad"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>

                <div className="flex-grow flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      for (let i = 0; i < quantity; i++) {
                        onAddToCart(selectedVariant);
                      }
                    }}
                    className="flex-grow bg-surface-container text-primary border border-outline-variant py-3 rounded-DEFAULT text-label-lg font-bold flex items-center justify-center gap-2 hover:border-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                    Agregar al carrito
                  </button>

                  <a
                    href={getWhatsAppLink(
                      title,
                      selectedVariant.color || '',
                      selectedVariant.storage || ''
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow bg-secondary text-on-secondary py-3 rounded-DEFAULT text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary-container hover:text-on-secondary-container transition-colors text-center shadow-md"
                  >
                    <svg fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                    </svg>
                    Consultar por WhatsApp
                  </a>
                </div>
              </>
            ) : (
              <div className="w-full text-center py-4 bg-surface rounded border border-outline-variant">
                <p className="text-body-md font-bold text-on-surface-variant uppercase tracking-wider">
                  {selectedVariant?.status === 'Reservado' ? 'Combinación Reservada' : 'Sin stock disponible para esta combinación'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
