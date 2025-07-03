import React, { useState, useMemo } from 'react';
import { Filter as FilterIcon, SlidersHorizontal } from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';
import { Filter } from '../types';
import { ProductGrid } from '../components/Products/ProductGrid';
import { FilterSidebar } from '../components/Filters/FilterSidebar';

interface HomeProps {
  searchQuery: string;
}

export const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const { products } = useProducts();
  const [filters, setFilters] = useState<Filter>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('featured');

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matches = 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matches) return false;
      }
      // Category filter - this is the main fix
      if (filters.category && filters.category.trim() !== '') {
        if (product.category !== filters.category) {
          return false;
        }
      }
      // Brand filter
      if (filters.brand && filters.brand.length > 0) {
        if (!filters.brand.includes(product.brand)) {
          return false;
        }
      }
      // Price range filter
      if (filters.priceRange && filters.priceRange.length === 2) {
        const [min, max] = filters.priceRange;
        if (product.price < min || product.price > max) {
          return false;
        }
      }
      // Rating filter
      if (filters.rating && product.rating < filters.rating) {
        return false;
      }
      // Stock filter
      if (filters.inStock && !product.inStock) {
        return false;
      }
      return true;
    });
    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
    return filtered;
  }, [searchQuery, filters, sortBy, products]);

  const handleFilterChange = (newFilters: Filter) => {
    setFilters(newFilters);
  };

  const removeFilter = (filterType: keyof Filter, value?: string) => {
    const newFilters = { ...filters };
    
    if (filterType === 'brand' && value) {
      newFilters.brand = newFilters.brand?.filter(b => b !== value);
      if (newFilters.brand?.length === 0) {
        delete newFilters.brand;
      }
    } else {
      delete newFilters[filterType];
    }
    
    setFilters(newFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery ? `Search results for "${searchQuery}"` : 
                 filters.category ? `${filters.category} Products` : 'All Products'}
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                {filters.category && ` in ${filters.category}`}
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FilterIcon className="w-4 h-4" />
                <span>Filters</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.category || filters.brand?.length || filters.priceRange || filters.rating || filters.inStock) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {filters.category}
                  <button
                    onClick={() => removeFilter('category')}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.brand?.map(brand => (
                <span key={brand} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {brand}
                  <button
                    onClick={() => removeFilter('brand', brand)}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}

              {filters.priceRange && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <button
                    onClick={() => removeFilter('priceRange')}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.rating && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {filters.rating}+ stars
                  <button
                    onClick={() => removeFilter('rating')}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.inStock && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  In stock
                  <button
                    onClick={() => removeFilter('inStock')}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Products Grid */}
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  );
};