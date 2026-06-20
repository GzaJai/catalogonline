import React, { useState } from 'react';

export const FilterBar = ({
  totalProducts = 0,
  variants = [],
  storageFilter = [],
  onStorageFilterChange = () => {},
  batteryMin = 0,
  onBatteryMinChange = () => {},
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Extraer opciones únicas de almacenamiento desde las variantes
  const storageOptions = [...new Set(
    variants
      .map(v => v.storage)
      .filter(Boolean)
  )].sort((a, b) => {
    // Ordenar numéricamente: 128GB, 256GB, 512GB, etc.
    const numA = parseInt(a, 10) || 0;
    const numB = parseInt(b, 10) || 0;
    return numA - numB;
  });

  const hasSmartFilters = storageOptions.length > 0;
  const hasActiveFilters = storageFilter.length > 0 || batteryMin > 0;

  const toggleStorage = (option) => {
    if (storageFilter.includes(option)) {
      onStorageFilterChange(storageFilter.filter(s => s !== option));
    } else {
      onStorageFilterChange([...storageFilter, option]);
    }
  };

  const clearFilters = () => {
    onStorageFilterChange([]);
    onBatteryMinChange(0);
  };

  return (
    <div className="flex flex-col px-margin-mobile lg:px-margin-desktop py-sm md:w-[80%] md:mx-auto">
      {/* Barra superior */}
      <div className="flex justify-between items-center">
        <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
          Mostrando {totalProducts} modelo{totalProducts !== 1 ? 's' : ''}
        </span>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-label-sm font-label-sm text-error hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Limpiar
            </button>
          )}

          {hasSmartFilters && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 text-label-lg font-label-lg transition-colors cursor-pointer ${
                hasActiveFilters ? 'text-secondary font-bold' : 'text-primary hover:underline'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" data-icon="filter_list">
                filter_list
              </span>
              Filtros
              {hasActiveFilters && (
                <span className="bg-secondary text-on-secondary text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
                  {(storageFilter.length > 0 ? 1 : 0) + (batteryMin > 0 ? 1 : 0)}
                </span>
              )}
            </button>
          )}

          <button className="flex items-center gap-1 text-primary text-label-lg font-label-lg hover:underline cursor-pointer">
            <span className="material-symbols-outlined text-[18px]" data-icon="swap_vert">swap_vert</span>
            Ordenar
          </button>
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && hasSmartFilters && (
        <div className="mt-sm p-md bg-surface-container-lowest border border-outline-variant rounded-DEFAULT flex flex-col sm:flex-row gap-lg">
          {/* Filtro por almacenamiento */}
          {storageOptions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                Capacidad
              </span>
              <div className="flex flex-wrap gap-2">
                {storageOptions.map(option => (
                  <label
                    key={option}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-DEFAULT text-label-sm font-label-sm cursor-pointer transition-colors select-none border ${
                      storageFilter.includes(option)
                        ? 'bg-secondary-container text-on-secondary-container border-secondary-container'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={storageFilter.includes(option)}
                      onChange={() => toggleStorage(option)}
                      className="hidden"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filtro por batería */}
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
              Batería mínima: {batteryMin > 0 ? `≥ ${batteryMin}%` : 'Sin filtro'}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-label-sm font-label-sm text-on-surface-variant">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={batteryMin}
                onChange={(e) => onBatteryMinChange(parseInt(e.target.value, 10))}
                className="flex-grow accent-secondary h-1.5 cursor-pointer"
              />
              <span className="text-label-sm font-label-sm text-on-surface-variant">100%</span>
            </div>
            {batteryMin > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-body-md text-secondary font-semibold">
                  ≥ {batteryMin}%
                </span>
                <button
                  onClick={() => onBatteryMinChange(0)}
                  className="text-[10px] text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
