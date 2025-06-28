import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface NewsletterSubscriptionProps {
  className?: string;
  darkMode?: boolean;
  compact?: boolean;
}

export const NewsletterSubscription = ({ className = '', darkMode = false, compact = false }: NewsletterSubscriptionProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setStatus('idle');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name: name || undefined }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to subscribe');
      }

      // Success
      setStatus('success');
      setEmail('');
      setName('');
      toast.success('Successfully subscribed to our newsletter!');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe');
      toast.error('Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${className} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {status === 'success' && !compact && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-4 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Thank you for subscribing!</p>
            <p className="text-sm mt-1">You'll now receive our latest offers and travel inspiration.</p>
          </div>
        </div>
      )}

      {status === 'error' && !compact && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Subscription Error</p>
            <p className="text-sm mt-1">{errorMessage || 'Please try again later'}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={compact ? "flex gap-2" : "space-y-4"}>
        {!compact && (
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
              Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] text-gray-900"
            />
          </div>
        )}
        
        <div className={compact ? "flex-1" : ""}>
          {!compact && (
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
              Email Address *
            </label>
          )}
          <div className="relative">
            {!compact && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={compact ? "Enter your email" : "your@email.com"}
              required
              className={`w-full ${!compact && "pl-10"} px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] text-gray-900`}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`${compact ? "" : "w-full"} bg-[#ff914d] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#e8823d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Subscribing...
            </>
          ) : (
            <>Subscribe</>
          )}
        </button>
      </form>
    </div>
  );
};