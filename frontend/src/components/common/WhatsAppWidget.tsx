import { MessageCircle } from 'lucide-react';

export const WhatsAppWidget = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '+919876543210'; // Replace with actual WhatsApp number
    const message = 'Hello! I would like to inquire about your travel packages.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20BA5A] transition-colors z-50 animate-bounce"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
};