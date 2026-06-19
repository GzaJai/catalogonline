import React, { useEffect, useState } from 'react';

/**
 * Toast — Componente de notificación temporal.
 *
 * Modos:
 *   - success: check, fondo verde
 *   - error:   close, fondo rojo
 *
 * Uso:
 *   <Toast message="Producto creado" type="success" onClose={handler} />
 */
export const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrada
    requestAnimationFrame(() => setIsVisible(true));

    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
    }, duration - 300); // 300ms de animación de salida

    const closeTimer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const icon = type === 'success' ? 'check_circle' : 'error';
  const borderColor = type === 'success' ? 'border-secondary' : 'border-error';

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[100] max-w-[384px]
        bg-surface-container-lowest border ${borderColor} border-l-4
        rounded-lg shadow-xl
        flex items-center gap-3 px-4 py-3
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      role="alert"
    >
      <span
        className={`material-symbols-outlined text-[20px] ${type === 'success' ? 'text-secondary' : 'text-error'}`}
        data-icon={icon}
      >
        {icon}
      </span>
      <p className="text-body-sm font-body-md text-on-surface flex-1">{message}</p>
      <button
        onClick={() => { setIsLeaving(true); setTimeout(() => onClose?.(), 300); }}
        className="text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
        aria-label="Cerrar notificación"
      >
        <span className="material-symbols-outlined text-[18px]" data-icon="close">close</span>
      </button>
    </div>
  );
};
