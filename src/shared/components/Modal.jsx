import React, { useEffect } from 'react';

/**
 * Modal — Componente modal genérico y reutilizable.
 *
 * Características:
 *   - Backdrop difuminado y semi-transparente.
 *   - Manejo de cierre al hacer clic afuera (backdrop) o presionar Escape.
 *   - Ancho personalizable (ej. maxWidth="max-w-[512px]"). Evita bugs de Tailwind v4.
 *
 * Props:
 *   - isOpen: boolean - Controla la visibilidad.
 *   - onClose: function - Callback para cerrar.
 *   - title: string - Título en el header.
 *   - children: ReactNode - Contenido del modal.
 *   - maxWidthClass: string (opcional) - Clase de ancho máximo (ej. "max-w-[448px]", "max-w-[512px]").
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-[512px]',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Bloquear scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-margin-mobile bg-black/40 backdrop-blur-sm transition-all duration-300 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-surface-container-lowest border border-outline-variant rounded-lg shadow-2xl w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto flex flex-col animate-scale-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-lg pt-lg pb-sm border-b border-outline-variant">
          <h2 id="modal-title" className="text-headline-sm font-headline-sm text-on-surface font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full p-1 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[24px]" data-icon="close">
              close
            </span>
          </button>
        </div>

        {/* Body / Content */}
        <div className="p-lg flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
