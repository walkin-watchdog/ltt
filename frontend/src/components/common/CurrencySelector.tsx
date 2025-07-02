import { useState, useEffect, useRef } from 'react';
import { ChevronDown, DollarSign } from 'lucide-react';

interface CurrencySelectorProps {
  className?: string;
}

export const CurrencySelector = ({ className = '' }: CurrencySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState(
    localStorage.getItem('preferredCurrency') || 'INR'
  );
  const [isLoading, setIsLoading] = useState(true);

  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/currency/currencies`);
        
        if (response.ok) {
          const data = await response.json();
          setCurrencies(data.currencies);
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
        setCurrencies(['INR', 'USD', 'EUR', 'GBP', 'AUD']);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrencies();
  }, []);
  
  useEffect(() => {
    // 2) Listen once, and only close when the click is outside wrapperRef
    const handleClickOutside = (e: MouseEvent) => {
      // if dropdown is open AND click is outside the wrapper, close it
      if (
        isOpen &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    localStorage.setItem('preferredCurrency', currency);
    setIsOpen(false);
    
    // Dispatch an event so other components can react to the currency change
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: currency }));
  };
  
  const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      case 'AUD': return 'A$';
      case 'CAD': return 'C$';
      case 'JPY': return '¥';
      case 'SGD': return 'S$';
      case 'AED': return 'د.إ';
      case 'CNY': return '¥';
      default: return currency;
    }
  };
  
  return (
    <div ref={wrapperRef} className={`relative inline-block text-left ${className}`}>
      <div className={`relative inline-block text-left ${className}`}>
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="flex items-center space-x-1 text-gray-700 hover:text-[#ff914d] transition-colors font-medium"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          
          <span>{getCurrencySymbol(selectedCurrency)}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        
        {isOpen && (
          <div 
            className="origin-top-right absolute right-0 mt-5 w-40 shadow-lg bg-white z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {isLoading ? (
                <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
              ) : (
                currencies.map((currency) => (
                  <button
                    key={currency}
                    onClick={() => handleCurrencyChange(currency)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedCurrency === currency 
                        ? 'text-[#ff914d] font-bold' 
                        : 'text-gray-700 hover:font-bold hover:text-[#ff914d]'
                    }`}
                    role="menuitem"
                  >
                    {getCurrencySymbol(currency)} {currency}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};