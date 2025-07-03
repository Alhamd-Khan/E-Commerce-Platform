import React from 'react';
import { X, Filter } from 'lucide-react';
import { Filter as FilterType } from '../../types';
import { useProducts } from '../../contexts/ProductsContext';

interface FilterSidebarProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onClose
}) => {
  const { products } = useProducts();
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean);

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category: category === 'All Categories' ? undefined : category
    });
    // Close mobile filter on selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const currentBrands = filters.brand || [];
    const newBrands = checked
      ? [...currentBrands, brand]
      : currentBrands.filter(b => b !== brand);
    
    onFilterChange({
      ...filters,
      brand: newBrands.length > 0 ? newBrands : undefined
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFilterChange({
      ...filters,
      priceRange: [min, max]
    });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({
      ...filters,
      rating: filters.rating === rating ? undefined : rating
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
    lg:relative lg:translate-x-0 lg:shadow-none lg:bg-gray-50
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white lg:bg-gray-50">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Filters</h2>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full text-left text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>

            {/* Category Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Category</h3>
              <div className="space-y-2">
                {['All Categories', ...categories].map((category) => (
                  <label key={category} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="category"
                      checked={
                        category === 'All Categories' 
                          ? !filters.category 
                          : filters.category === category
                      }
                      onChange={() => handleCategoryChange(category)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 font-medium">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Brand</h3>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.brand?.includes(brand) || false}
                      onChange={(e) => handleBrandChange(brand, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 font-medium">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-2">
                {[
                  { label: 'Under ₹4000', min: 0, max: 4000 },
                  { label: '₹4000 - ₹8000', min: 4000, max: 8000 },
                  { label: '₹8000 - ₹16000', min: 8000, max: 16000 },
                  { label: '₹16000 - ₹40000', min: 16000, max: 40000 },
                  { label: 'Over ₹40000', min: 40000, max: 1000000 }
                ].map((range) => (
                  <label key={range.label} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={
                        filters.priceRange?.[0] === range.min && 
                        filters.priceRange?.[1] === range.max
                      }
                      onChange={() => handlePriceRangeChange(range.min, range.max)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 font-medium">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Minimum Rating</h3>
              <div className="space-y-2">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <label key={rating} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === rating}
                      onChange={() => handleRatingChange(rating)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 font-medium">
                      {rating}+ stars
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Availability</h3>
              <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    inStock: e.target.checked || undefined
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 font-medium">In stock only</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};