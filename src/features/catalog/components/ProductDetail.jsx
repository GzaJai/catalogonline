import React, { useState } from 'react';

// Generador de especificaciones dinámicas según la categoría para mejorar la experiencia visual y de contenido
const getProductSpecifications = (product) => {
  const { category, title } = product;
  const normalizedCategory = category.toLowerCase();

  const baseSpecs = [
    { label: 'Disponibilidad', value: 'Stock disponible' },
    { label: 'Garantía', value: '6 meses oficial' },
    { label: 'Condición', value: 'Nuevo en caja sellada' }
  ];

  if (normalizedCategory.includes('auricular') || normalizedCategory.includes('audio')) {
    return [
      ...baseSpecs,
      { label: 'Conectividad', value: title.toLowerCase().includes('cable') ? 'Cable Jack 3.5mm' : 'Bluetooth 5.3 + BLE' },
      { label: 'Autonomía', value: title.toLowerCase().includes('gaming') ? 'Hasta 12 horas' : 'Hasta 30 horas con estuche' },
      { label: 'Cancelación de Ruido', value: title.toLowerCase().includes('anc') ? 'Activa híbrida (ANC)' : 'Pasiva de alta densidad' },
      { label: 'Micrófono', value: 'Integrado con reducción de ruido ambiental' }
    ];
  }

  if (normalizedCategory.includes('smartwatch')) {
    return [
      ...baseSpecs,
      { label: 'Pantalla', value: title.toLowerCase().includes('amoled') ? 'AMOLED 1.43" Always-on' : 'IPS color táctil 1.3"' },
      { label: 'Sensores', value: 'Ritmo cardíaco, Oxígeno en sangre (SpO2), Podómetro' },
      { label: 'Batería', value: 'Hasta 7 días de uso continuo' },
      { label: 'Resistencia al Agua', value: 'Certificación IP68 (Sumergible)' }
    ];
  }

  if (normalizedCategory.includes('cable')) {
    return [
      ...baseSpecs,
      { label: 'Material', value: title.toLowerCase().includes('trenzado') ? 'Nylon trenzado reforzado' : 'PVC de alta resistencia' },
      { label: 'Potencia Soportada', value: title.toLowerCase().includes('100w') ? 'Hasta 100W Power Delivery' : 'Carga rápida estándar' },
      { label: 'Longitud', value: title.toLowerCase().includes('2m') ? '2 metros' : title.toLowerCase().includes('3m') ? '3 metros' : '1 metro' },
      { label: 'Velocidad de Datos', value: 'Hasta 480 Mbps (USB 2.0)' }
    ];
  }

  if (normalizedCategory.includes('funda')) {
    return [
      ...baseSpecs,
      { label: 'Protección', value: title.toLowerCase().includes('anti-shock') ? 'Grado militar anticaídas' : 'Protección diaria anti-rayas' },
      { label: 'Compatibilidad MagSafe', value: title.toLowerCase().includes('magsafe') ? 'Sí, imanes alineados incorporados' : 'Compatible con carga inalámbrica' },
      { label: 'Material', value: title.toLowerCase().includes('cuero') ? 'Cuero sintético texturizado' : 'Silicona líquida Soft-Touch' },
      { label: 'Bordes', value: 'Bordes elevados de 1.2mm para proteger pantalla y cámaras' }
    ];
  }

  if (normalizedCategory.includes('cargador')) {
    return [
      ...baseSpecs,
      { label: 'Tecnología', value: title.toLowerCase().includes('gan') ? 'GaN (Nitruro de Galio) de alta eficiencia' : 'Carga rápida inteligente IC' },
      { label: 'Potencia Máxima', value: title.toLowerCase().includes('65w') ? '65 Watts' : title.toLowerCase().includes('35w') ? '35 Watts' : '20 Watts' },
      { label: 'Puertos', value: title.toLowerCase().includes('dual') || title.toLowerCase().includes('2 puertos') ? '1x USB-C + 1x USB-A' : '1x USB-C Power Delivery' },
      { label: 'Sistemas de Seguridad', value: 'Protección contra sobrecargas, cortocircuitos y sobrecalentamiento' }
    ];
  }

  return [
    ...baseSpecs,
    { label: 'Compatibilidad', value: 'Universal' },
    { label: 'Materiales', value: 'Aleación premium y ABS de alta resistencia' }
  ];
};

const getProductDescription = (product) => {
  const { title, category } = product;
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes('auricular') || normalizedCategory.includes('audio')) {
    return `Disfrutá del mejor sonido con el producto "${title}". Diseñado para ofrecer una experiencia acústica inmersiva y un calce sumamente confortable, es el compañero ideal para tus jornadas de trabajo, estudio, entrenamiento o simplemente para desconectarte y escuchar tu música favorita con la máxima definición.`;
  }
  if (normalizedCategory.includes('smartwatch')) {
    return `Llevá tu salud y conectividad al siguiente nivel con tu "${title}". Este reloj inteligente cuenta con sensores avanzados y una pantalla vibrante para visualizar notificaciones, monitorear tu actividad física diaria y tus hábitos de sueño de manera precisa. Un accesorio moderno y elegante para tu día a día.`;
  }
  if (normalizedCategory.includes('cable') || normalizedCategory.includes('cargador')) {
    return `Asegurá una carga veloz y una transferencia de datos ultra segura con tu "${title}". Fabricado bajo los más altos estándares de calidad, este accesorio de carga y conectividad evita el sobrecalentamiento y la sobrecarga, garantizando la salud de la batería de tus dispositivos de uso cotidiano.`;
  }
  if (normalizedCategory.includes('funda')) {
    return `Protegé tu inversión sin perder estilo. La funda "${title}" calza a la perfección, proporcionando un agarre seguro e increíblemente cómodo en la mano. Su diseño inteligente amortigua impactos de caídas accidentales y previene rayones indeseados tanto en la pantalla como en la lente trasera.`;
  }
  return `El producto "${title}" ofrece una excelente combinación de calidad, durabilidad y funcionalidad para tu día a día. Diseñado ergonómicamente con materiales de primera línea para garantizar la mejor experiencia de usuario posible en la categoría de ${category}.`;
};

export const ProductDetail = ({ product, onBack, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const specifications = getProductSpecifications(product);
  const description = getProductDescription(product);

  const handleAddToCartClick = () => {
    // Agregar el producto al carrito con la cantidad seleccionada
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    // Opcional: Podríamos mostrar un banner de éxito o feedback visual
  };

  return (
    <div className="w-[95%] md:w-[70%] mx-auto py-md md:py-lg flex flex-col gap-sm">
      {/* Botón Volver */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer self-start py-2 font-label-lg text-label-lg"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Volver al catálogo
      </button>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-4 md:p-8 shadow-sm">
        {/* Imagen del Producto - Izquierda (5 columnas en desktop) */}
        <div className="md:col-span-5 flex items-center justify-center bg-surface-container rounded-sm overflow-hidden p-6 aspect-square max-h-[400px] md:max-h-none">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-contain mix-blend-multiply max-w-[320px] md:max-w-full"
          />
        </div>

        {/* Información del Producto - Derecha (7 columnas en desktop) */}
        <div className="md:col-span-7 flex flex-col gap-md">
          {/* Categoría e Insignias */}
          <div className="flex items-center gap-2">
            <span className="text-label-sm font-label-sm text-secondary uppercase tracking-wider">
              {product.category}
            </span>
            {product.isNew && (
              <span className="bg-error text-on-error px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm">
                Nuevo
              </span>
            )}
            {product.badge && (
              <span className="bg-surface-variant text-on-surface-variant border border-outline-variant px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm">
                {product.badge}
              </span>
            )}
          </div>

          {/* Título y Precio */}
          <div>
            <h1 className="text-headline-md md:text-headline-lg font-bold text-on-surface leading-tight">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-3 mt-sm">
              <span className="text-headline-lg font-extrabold text-primary">
                {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-body-md text-on-surface-variant line-through">
                  {product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Descripción */}
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            {description}
          </p>

          {/* Selector de Cantidad y Botón de Compra */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm border-t border-b border-outline-variant py-md">
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

            <button 
              onClick={handleAddToCartClick}
              className="flex-grow bg-secondary text-on-secondary py-3 rounded-DEFAULT text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary-container hover:text-on-secondary-container transition-colors cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              Agregar al carrito
            </button>
          </div>

          {/* Ficha Técnica */}
          <div className="flex flex-col gap-xs">
            <h3 className="text-label-lg font-bold text-on-surface uppercase tracking-wider">Especificaciones Técnicas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mt-xs">
              {specifications.map((spec, i) => (
                <div key={i} className="flex flex-col border-b border-outline-variant/40 pb-sm">
                  <span className="text-label-sm font-semibold text-on-surface-variant opacity-80">{spec.label}</span>
                  <span className="text-body-md font-medium text-on-surface mt-0.5">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
