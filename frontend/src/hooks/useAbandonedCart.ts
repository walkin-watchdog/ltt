import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface AbandonedCartData {
  productId: string;
  packageId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  adults: number;
  children: number;
  selectedDate: string;
  totalAmount: number;
}

export const useAbandonedCart = (productId?: string) => {
  const [cart, setCart] = useState<AbandonedCartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { email } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (productId && email) {
      checkForAbandonedCart();
    }
  }, [productId, email]);

  const checkForAbandonedCart = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, we'd fetch from the backend
      // For demonstration, using localStorage
      const key = `abandoned_cart_${productId}_${email}`;
      const savedCart = localStorage.getItem(key);
      
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error checking for abandoned cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAbandonedCart = async (cartData: AbandonedCartData) => {
    if (!cartData.productId || !cartData.customerEmail) return;
    
    try {
      // Save to backend
      await fetch(`${import.meta.env.VITE_API_URL}/abandoned-carts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cartData.customerEmail,
          productId: cartData.productId,
          packageId: cartData.packageId,
          customerData: cartData
        }),
      });
      
      // Also save to localStorage for demo purposes
      const key = `abandoned_cart_${cartData.productId}_${cartData.customerEmail}`;
      localStorage.setItem(key, JSON.stringify(cartData));
      
    } catch (error) {
      console.error('Error saving abandoned cart:', error);
    }
  };

  const clearAbandonedCart = () => {
    if (!productId || !email) return;
    
    const key = `abandoned_cart_${productId}_${email}`;
    localStorage.removeItem(key);
    setCart(null);
  };

  return {
    abandonedCart: cart,
    isLoading,
    saveAbandonedCart,
    clearAbandonedCart
  };
};