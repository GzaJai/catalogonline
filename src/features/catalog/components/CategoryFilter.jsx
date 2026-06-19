import React from 'react';

export const CategoryFilter = ({ categories = [], selectedCategory, onCategoryChange }) => {
  return (
    <nav className="w-full overflow-x-auto no-scrollbar py-sm px-margin-mobile bg-surface border-b border-surface-container-highest md:w-[80%] md:mx-auto">
      <ul className="flex gap-xs whitespace-nowrap">
        {categories.map((category) => (
          <li key={category}>
            <button 
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-1.5 rounded-full text-label-lg font-label-lg transition-colors cursor-pointer ${
                category.toLowerCase() === selectedCategory.toLowerCase()
                  ? 'bg-secondary-container text-on-secondary-container border border-secondary-container' 
                  : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
