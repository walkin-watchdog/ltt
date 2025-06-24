import { useEffect, useRef } from 'react';

interface PayPalButtonProps {
  amount: number;
  currency: string;
  onSuccess: (details: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
  };
}

declare global {
  interface Window {
    paypal: any;
  }
}

export const PayPalButton = ({
  amount,
  currency = 'USD',
  onSuccess,
  onError,
  onCancel,
  style = {}
}: PayPalButtonProps) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const isRendered = useRef(false);

  useEffect(() => {
    if (isRendered.current || !paypalRef.current) return;

    const loadPayPalScript = () => {
      if (window.paypal) {
        renderPayPalButton();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=${currency}`;
      script.onload = () => renderPayPalButton();
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        onError?.({ message: 'Failed to load PayPal SDK' });
      };
      document.body.appendChild(script);
    };

    const renderPayPalButton = () => {
      if (!window.paypal || !paypalRef.current || isRendered.current) return;

      try {
        window.paypal.Buttons({
          style: {
            layout: style.layout || 'vertical',
            color: style.color || 'gold',
            shape: style.shape || 'rect',
            label: style.label || 'paypal'
          },
          createOrder: (_: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount.toString(),
                  currency_code: currency
                },
                description: 'Luxé TimeTravel Booking'
              }]
            });
          },
          onApprove: async (_: any, actions: any) => {
            try {
              const details = await actions.order.capture();
              onSuccess(details);
            } catch (error) {
              console.error('PayPal capture error:', error);
              onError?.(error);
            }
          },
          onError: (error: any) => {
            console.error('PayPal error:', error);
            onError?.(error);
          },
          onCancel: () => {
            console.log('PayPal payment cancelled');
            onCancel?.();
          }
        }).render(paypalRef.current);

        isRendered.current = true;
      } catch (error) {
        console.error('Error rendering PayPal button:', error);
        onError?.(error);
      }
    };

    loadPayPalScript();

    return () => {
      // Cleanup on unmount
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
      isRendered.current = false;
    };
  }, [amount, currency, onSuccess, onError, onCancel, style]);

  return <div ref={paypalRef} className="paypal-button-container"></div>;
};