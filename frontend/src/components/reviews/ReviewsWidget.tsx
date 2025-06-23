import { useEffect, useState } from 'react';
import { Star, ExternalLink, MessageCircle } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  platform: 'google' | 'tripadvisor';
  url?: string;
}

interface ReviewsWidgetProps {
  businessId?: string;
  className?: string;
}

export const ReviewsWidget = ({ businessId, className = '' }: ReviewsWidgetProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [businessId]);

  const fetchReviews = async () => {
    try {
      // Simulate API calls - In production, replace with actual API calls
      setIsLoading(true);
      
      // Mock data - replace with actual API integration
      const mockReviews: Review[] = [
        {
          id: '1',
          author: 'Sarah Johnson',
          rating: 5,
          text: 'Absolutely incredible experience! The heritage tour was well-organized and our guide was extremely knowledgeable. Luxé TimeTravel exceeded all expectations.',
          date: '2024-01-15',
          platform: 'google',
          url: 'https://g.page/r/example'
        },
        {
          id: '2',
          author: 'Michael Chen',
          rating: 5,
          text: 'Professional service, luxury vehicles, and authentic experiences. The culinary tour was a highlight of our India trip. Highly recommended!',
          date: '2024-01-10',
          platform: 'tripadvisor',
          url: 'https://tripadvisor.com/example'
        },
        {
          id: '3',
          author: 'Emma Thompson',
          rating: 4,
          text: 'Great attention to detail and personalized service. The Rajasthan tour was beautifully curated. Minor delays but overall excellent experience.',
          date: '2024-01-05',
          platform: 'google'
        },
        {
          id: '4',
          author: 'David Kumar',
          rating: 5,
          text: 'Outstanding! From booking to the actual tour, everything was seamless. The Delhi heritage walk was informative and engaging.',
          date: '2023-12-28',
          platform: 'tripadvisor'
        }
      ];

      // Calculate statistics
      const avgRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;
      
      setReviews(mockReviews);
      setAverageRating(avgRating);
      setTotalReviews(mockReviews.length);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getPlatformIcon = (platform: 'google' | 'tripadvisor') => {
    switch (platform) {
      case 'google':
        return '🔍';
      case 'tripadvisor':
        return '🦉';
      default:
        return '⭐';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
          <div className="flex items-center mt-1">
            {renderStars(Math.round(averageRating))}
            <span className="ml-2 text-sm text-gray-600">
              {averageRating.toFixed(1)} out of 5 ({totalReviews} reviews)
            </span>
          </div>
        </div>
        <MessageCircle className="h-6 w-6 text-[#ff914d]" />
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <span className="text-lg mr-2">{getPlatformIcon(review.platform)}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{review.author}</h4>
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {review.url && (
                <a
                  href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff914d] hover:text-[#e8823d] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-gray-700 text-sm">{review.text}</p>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="mt-6 text-center">
        <button className="text-[#ff914d] hover:text-[#e8823d] font-medium text-sm transition-colors">
          View All Reviews
        </button>
      </div>

      {/* Platform Links */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-center space-x-4 text-sm">
          <a
            href="https://g.page/r/your-google-business-id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-600 hover:text-[#ff914d] transition-colors"
          >
            <span className="mr-1">🔍</span>
            Google Reviews
          </a>
          <a
            href="https://www.tripadvisor.com/your-business-url"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-600 hover:text-[#ff914d] transition-colors"
          >
            <span className="mr-1">🦉</span>
            TripAdvisor
          </a>
        </div>
      </div>
    </div>
  );
};

// Hook for fetching Google Reviews (implement with actual API)
export const useGoogleReviews = (placeId: string) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGoogleReviews = async () => {
    setLoading(true);
    try {
      // Implement Google Places API integration
      const response = await fetch(`/api/reviews/google?placeId=${placeId}`);
      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (placeId) {
      fetchGoogleReviews();
    }
  }, [placeId]);

  return { reviews, loading, refetch: fetchGoogleReviews };
};

// Hook for fetching TripAdvisor Reviews (implement with actual API)
export const useTripAdvisorReviews = (businessId: string) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTripAdvisorReviews = async () => {
    setLoading(true);
    try {
      // Implement TripAdvisor API integration
      const response = await fetch(`/api/reviews/tripadvisor?businessId=${businessId}`);
      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error('Error fetching TripAdvisor reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchTripAdvisorReviews();
    }
  }, [businessId]);

  return { reviews, loading, refetch: fetchTripAdvisorReviews };
};