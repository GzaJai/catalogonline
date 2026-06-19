import React, { useState } from 'react';

// Número de WhatsApp al que se enviará el pedido (Placeholder de Mendoza)
const WHATSAPP_PHONE = '5492613659768';

export const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  updateQuantity, 
  removeFromCart, 
  getCartTotal, 
  clearCart 
}) => {
  const [customerName, setCustomerName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Envío a domicilio');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor, ingresá tu nombre para realizar el pedido.');
      return;
    }

    if (deliveryMethod === 'Envío a domicilio' && !address.trim()) {
      alert('Por favor, ingresá tu dirección para el envío.');
      return;
    }

    // Construir mensaje de WhatsApp
    let message = `*Nuevo Pedido - CatalogOnline* 🛒\n\n`;
    message += `*Cliente:* ${customerName.trim()}\n`;
    message += `*Método:* ${deliveryMethod}\n`;
    if (deliveryMethod === 'Envío a domicilio') {
      message += `*Dirección:* ${address.trim()}\n`;
    }
    message += `\n----------------------------------\n\n`;

    cartItems.forEach((item) => {
      message += `• *${item.product.title}*\n`;
      message += `  Cant: ${item.quantity} x ${item.product.price} = `;
      
      // Calcular subtotal de este item
      const cleanedPrice = parseFloat(item.product.price.replace(/,/g, '').replace(/[^\d.]/g, '')) || 0;
      const subtotal = cleanedPrice * item.quantity;
      message += `$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n`;
    });

    message += `----------------------------------\n`;
    message += `*TOTAL A PAGAR: ${getCartTotal()}*\n\n`;
    message += `¡Muchas gracias!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en pestaña nueva
    window.open(whatsappUrl, '_blank');
    
    // Limpiar carrito y cerrar
    clearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-[448px] bg-surface h-full shadow-2xl flex flex-col z-10 animate-slide-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="text-headline-sm font-headline-sm text-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            Tu Carrito
          </h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {cartItems.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center gap-4 py-12">
              <span className="material-symbols-outlined text-[64px] text-outline opacity-40">shopping_cart_off</span>
              <h3 className="text-body-lg font-bold text-on-surface">El carrito está vacío</h3>
              <p className="text-body-sm text-on-surface-variant max-w-[260px]">
                ¡Agregá algunos productos de nuestro catálogo para comenzar tu pedido!
              </p>
              <button 
                onClick={onClose}
                className="mt-2 bg-primary text-on-primary px-6 py-2 rounded-DEFAULT text-label-lg font-label-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Volver a la tienda
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div 
                  key={item.product.id} 
                  className="flex gap-3 bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-3 relative group"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-surface-container rounded-sm overflow-hidden flex-shrink-0 p-1">
                    <img 
                      src={item.product.image} 
                      alt={item.product.title} 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-body-sm font-semibold text-on-surface leading-tight line-clamp-1">
                        {item.product.title}
                      </h4>
                      <p className="text-label-sm font-bold text-primary mt-0.5">
                        {item.product.price}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-1">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 border border-outline-variant flex items-center justify-center rounded-DEFAULT text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">remove</span>
                      </button>
                      <span className="text-body-sm font-semibold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 border border-outline-variant flex items-center justify-center rounded-DEFAULT text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="absolute top-2 right-2 text-outline hover:text-error transition-colors cursor-pointer"
                    aria-label="Eliminar producto"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout Form */}
        {cartItems.length > 0 && (
          <div className="border-t border-outline-variant bg-surface-container-low px-6 py-4 flex flex-col gap-4">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-body-md font-semibold text-on-surface-variant">Total Estimado</span>
              <span className="text-headline-sm font-bold text-primary">{getCartTotal()}</span>
            </div>

            {/* Customer Details Form */}
            <form onSubmit={handleCheckout} className="flex flex-col gap-3">
              <div>
                <label htmlFor="customerName" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT py-2 px-3 text-body-sm font-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="deliveryMethod" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Método de Entrega
                </label>
                <select
                  id="deliveryMethod"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT py-2 px-3 text-body-sm font-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all cursor-pointer"
                >
                  <option value="Envío a domicilio">Envío a domicilio</option>
                  <option value="Retiro por local">Retiro por local</option>
                </select>
              </div>

              {deliveryMethod === 'Envío a domicilio' && (
                <div>
                  <label htmlFor="address" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Dirección de entrega *
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Av. San Martín 1234, Ciudad"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT py-2 px-3 text-body-sm font-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                    required
                  />
                </div>
              )}

              {/* Checkout CTA */}
              <button
                type="submit"
                className="w-full bg-secondary text-on-secondary py-3 rounded-DEFAULT text-label-lg font-label-lg font-bold flex items-center justify-center gap-2 mt-2 hover:bg-secondary-container hover:text-on-secondary-container transition-colors cursor-pointer shadow-md"
              >
                <svg fill="currentColor" height="18" viewBox="0 0 16 16" width="18" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                </svg>
                Enviar Pedido por WhatsApp
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
