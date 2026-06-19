import React, { useState } from 'react';

/**
 * AdminLogin — Pantalla de ingreso con contraseña.
 *
 * Valida contra VITE_ADMIN_PASSWORD del .env.
 * Si es correcto, llama a onSuccess(); si no, muestra error.
 */
export const AdminLogin = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

  console.log('[AdminLogin] VITE_ADMIN_PASSWORD definida:', !!ADMIN_PASSWORD);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!ADMIN_PASSWORD) {
      console.error('[AdminLogin] ERROR: VITE_ADMIN_PASSWORD no está definida en .env');
      setError('Error de configuración: VITE_ADMIN_PASSWORD no está definida.');
      return;
    }

    if (password === ADMIN_PASSWORD) {
      console.log('[AdminLogin] Contraseña correcta, redirigiendo al panel...');
      onSuccess();
    } else {
      console.warn('[AdminLogin] Contraseña incorrecta');
      setError('Contraseña incorrecta.');
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[448px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-xl">
        {/* Icono */}
        <div className="flex justify-center mb-lg">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <span
              className="material-symbols-outlined text-on-primary text-[40px]"
              data-icon="lock"
            >
              lock
            </span>
          </div>
        </div>

        <h1 className="text-headline-lg font-headline-lg text-on-surface text-center mb-2">
          Admin Panel
        </h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant text-center mb-xl max-w-[320px] mx-auto">
          Ingresá la contraseña de administrador para gestionar los productos
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div>
            <label
              htmlFor="admin-password"
              className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-3 px-4 text-body-lg font-body-md text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none placeholder:text-on-surface-variant transition-all"
            />
          </div>

          {error && (
            <p className="text-body-md font-body-md text-error flex items-center gap-1.5 bg-error-container rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-[18px]" data-icon="error">error</span>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-on-primary rounded-lg py-3 font-label-lg text-label-lg hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Ingresar
          </button>
        </form>

        <p className="text-body-sm font-body-md text-on-surface-variant text-center mt-lg">
          KROM — Panel de Administración
        </p>
      </div>
    </main>
  );
};
