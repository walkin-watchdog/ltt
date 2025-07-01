import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { debounce } from '../lib/utils';

interface AbandonedCartData {
  productId: string;
  packageId: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  adults: number;
  children: number;
  selectedDate: string;
  selectedTimeSlot: string;
  totalAmount: number;
  updatedAt?: string | number;
  status?: 'open' | 'closed';
}

export const useAbandonedCart = (productId?: string) => {
  const [cart, setCart] = useState<AbandonedCartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { email } = useSelector((state: RootState) => state.auth);

  const latestPayload = useRef<AbandonedCartData | null>(null);

  useEffect(() => {
    if (productId && email) {
      void checkForAbandonedCart();
    }
  }, [productId, email]);

  const postToServer = async (data: AbandonedCartData) => {
    if (!data.productId || !data.customerEmail) return;
    try {
      const body = {
        email       : data.customerEmail,
        productId   : data.productId,
        packageId   : data.packageId,
        slotId      : data.slotId,
        customerData: {
          customerName : data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          adults       : data.adults,
          children     : data.children,
          selectedDate : data.selectedDate,
          totalAmount  : data.totalAmount,
          selectedTimeSlot: data.selectedTimeSlot,
        },
        updatedAt: new Date().toISOString()
      };
      await fetch(`${import.meta.env.VITE_API_URL}/abandoned-carts`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify(body)
      });
    } catch (err) {
      console.error('Error saving abandoned cart:', err);
    }
  };

  const debouncedPost = useRef(debounce(postToServer, 3000)).current;
  const debouncedBroadcast = useRef(
    debounce((key: string, data: AbandonedCartData | null) => {
      window.dispatchEvent(
        new CustomEvent('abandonedCartUpdated', { detail: { key, cartData: data } })
      );
    }, 5_000)
  ).current;

  const hasCleared    = useRef(false);
  const lastHash      = useRef<string | undefined>(undefined);

  useEffect(() => {
    hasCleared.current = false;
  }, [productId]);

  const checkForAbandonedCart = async () => {
    setIsLoading(true);
    try {
      const key = `abandoned_cart_${productId}_${email}`;
      const local = localStorage.getItem(key);

      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/abandoned-carts/status?email=${email}&productId=${productId}`
      );
      const server: AbandonedCartData | null = resp.ok ? await resp.json() : null;

      let merged: AbandonedCartData | null = null;
      const localTs = local ? Number(JSON.parse(local).updatedAt ?? 0) : 0;
      if (
        server &&
        server.status === 'open' &&
        new Date(server.updatedAt!).getTime() > localTs
      ) {
        merged = server;
        localStorage.setItem(key, JSON.stringify(server));
      } else if (local) {
        merged = JSON.parse(local);
      }

      setCart(merged && merged.status === 'open' ? merged : null);
    } catch (error) {
      console.error('Error checking for abandoned cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAbandonedCart = (cartData: AbandonedCartData) => {
    if (hasCleared.current) return;
    const nextHash = JSON.stringify(cartData);
    if (nextHash === lastHash.current) return;
    lastHash.current   = nextHash;
    latestPayload.current = cartData;

    const key = `abandoned_cart_${cartData.productId}_${cartData.customerEmail}`;
    localStorage.setItem(key, JSON.stringify({ ...cartData, updatedAt: Date.now() }));
    debouncedBroadcast(key, cartData);
    debouncedPost(cartData);
  };

  const clearAbandonedCart = (customerEmail: string) => {
    if (!productId || !customerEmail) return;

    const key = `abandoned_cart_${productId}_${customerEmail}`;
    localStorage.removeItem(key);

    debouncedBroadcast(key, null);
    debouncedPost.cancel?.();
    latestPayload.current = null;
    hasCleared.current    = true;
    setCart(null);
  };

  useEffect(() => {
    const flush = () => {
      if (!latestPayload.current) return;
      const url = `${import.meta.env.VITE_API_URL}/abandoned-carts`;
      const body = {
        email       : latestPayload.current.customerEmail,
        productId   : latestPayload.current.productId,
        packageId   : latestPayload.current.packageId,
        customerData: {
          customerName : latestPayload.current.customerName,
          customerEmail: latestPayload.current.customerEmail,
          customerPhone: latestPayload.current.customerPhone,
          adults       : latestPayload.current.adults,
          children     : latestPayload.current.children,
          selectedDate : latestPayload.current.selectedDate,
          selectedTimeSlot: latestPayload.current.selectedTimeSlot,
          totalAmount  : latestPayload.current.totalAmount,
        },
        updatedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });

      if (!(navigator.sendBeacon && navigator.sendBeacon(url, blob))) {
        void fetch(url, { method: 'POST', body: blob, headers: { 'Content-Type': 'application/json' }, keepalive: true })
          .catch(() => {});
      }
    };
    window.addEventListener('beforeunload', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('beforeunload', flush);
      window.removeEventListener('pagehide', flush);
    };
  }, []);
  return {
    abandonedCart: cart,
    isLoading,
    saveAbandonedCart,
    clearAbandonedCart
  };
};