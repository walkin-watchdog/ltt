import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Tag, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Suggestion {
  type: 'destination' | 'category' | 'product';
  value: string;
  label: string;
  productType?: string;
}

export const SearchBar = ({ className = '' }: { className?: string }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{
    destinations: Suggestion[];
    categories: Suggestion[];
    products: Suggestion[];
  }>({ destinations: [], categories: [], products: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions({ destinations: [], categories: [], products: [] });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/search/suggestions?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.value}`);
    } else if (suggestion.type === 'destination') {
      navigate(`/search?location=${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === 'category') {
      navigate(`/search?category=${encodeURIComponent(suggestion.value)}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'destination':
        return <MapPin className="h-4 w-4 text-[#ff914d]" />;
      case 'category':
        return <Tag className="h-4 w-4 text-[#104c57]" />;
      case 'product':
        return <Package className="h-4 w-4 text-gray-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const hasSuggestions = suggestions.destinations.length > 0 || 
                        suggestions.categories.length > 0 || 
                        suggestions.products.length > 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder="Search destinations, tours, experiences..."
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
        />
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff914d] mx-auto"></div>
            </div>
          ) : hasSuggestions ? (
            <div className="py-2">
              {suggestions.destinations.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Destinations
                  </div>
                  {suggestions.destinations.map((suggestion, index) => (
                    <button
                      key={`destination-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex items-center"
                    >
                      {getIcon(suggestion.type)}
                      <span className="ml-3">{suggestion.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {suggestions.categories.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Categories
                  </div>
                  {suggestions.categories.map((suggestion, index) => (
                    <button
                      key={`category-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex items-center"
                    >
                      {getIcon(suggestion.type)}
                      <span className="ml-3">{suggestion.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {suggestions.products.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tours & Experiences
                  </div>
                  {suggestions.products.map((suggestion, index) => (
                    <button
                      key={`product-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex items-center"
                    >
                      {getIcon(suggestion.type)}
                      <div className="ml-3">
                        <div className="font-medium">{suggestion.label}</div>
                        <div className="text-sm text-gray-500">{suggestion.productType}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};