import { useEffect, useState } from 'react';
import { Star, ExternalLink, MessageCircle } from 'lucide-react';

interface ReviewSource {
  name: string;
  url: string;
  icon: string;
  apiEndpoint: string;
}

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
  googlePlaceId?: string;
  tripadvisorBusinessId?: string;
  className?: string;
}

const reviewSources: Record<string, ReviewSource> = {
  google: {
    name: 'Google Reviews',
    url: 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id=',
    icon: '🔍',
    apiEndpoint: '/reviews/google'
  },
  tripadvisor: {
    name: 'TripAdvisor',
    url: 'https://www.tripadvisor.com/ShowUserReviews-g',
    icon: '🦉',
    apiEndpoint: '/reviews/tripadvisor'
  }
};

export const ReviewsWidget = ({ googlePlaceId, tripadvisorBusinessId, className = '' }: ReviewsWidgetProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(4.8); // Default fallback
  const [totalReviews, setTotalReviews] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (googlePlaceId || tripadvisorBusinessId) {
      fetchReviews();
    } else {
      // Fall back to mock data if no IDs are provided
      setIsLoading(false);
    }
  }, [googlePlaceId, tripadvisorBusinessId]);

  const fetchReviews = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/reviews/combined`;
      let queryParams = [];
      
      if (googlePlaceId) {
        queryParams.push(`placeId=${googlePlaceId}`);
      }
      
      if (tripadvisorBusinessId) {
        queryParams.push(`businessId=${tripadvisorBusinessId}`);
      }
      
      const response = await fetch(`${apiUrl}?${queryParams.join('&')}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      
      if (data && data.reviews) {
        setReviews(data.reviews.map((review: any) => ({
          id: review.id,
          author: review.user?.username || review.author_name || 'Anonymous',
          rating: review.rating,
          text: review.text || review.comment,
          date: review.published_date || review.time || new Date().toISOString(),
          platform: review.platform,
          url: review.url
        })));
        
        setAverageRating(data.overall_rating || 4.8);
        setTotalReviews(data.total_reviews || data.reviews.length);
      }
    } catch (error) {
      console.error('Error fetching reviews, falling back to local data:', error);
      setError('Unable to load reviews. Showing stored testimonials instead.');
      
      // Fallback to mock data if API fails
      const fallbackReviews: Review[] = [
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
      
      setReviews(fallbackReviews);
      setAverageRating(fallbackReviews.reduce((sum, review) => sum + review.rating, 0) / fallbackReviews.length);
      setTotalReviews(fallbackReviews.length);
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
          {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
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
                  <h4 className="font-medium text-gray-900 break-words">{review.author}</h4>
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
            <p className="text-gray-700 text-sm break-words">{review.text}</p>
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
          {googlePlaceId && (
            <a
              href={`${reviewSources.google.url}${googlePlaceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-[#ff914d] transition-colors"
            >
              <span className="mr-1">{reviewSources.google.icon}</span>
              {reviewSources.google.name}
            </a>
          )}
          {tripadvisorBusinessId && (
            <a
              href={`${reviewSources.tripadvisor.url}${tripadvisorBusinessId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-[#ff914d] transition-colors"
            >
              <span className="mr-1">{reviewSources.tripadvisor.icon}</span>
              {reviewSources.tripadvisor.name}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for fetching Google Reviews (implement with actual API)
export const useGoogleReviews = (placeId: string) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoogleReviews = async () => {
    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/reviews/google?placeId=${placeId}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Google reviews');
      }
      
      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
      setError(error instanceof Error ? error.message : 'Error fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (placeId) {
      fetchGoogleReviews();
    }
  }, [placeId]);

  return { reviews, loading, error, refetch: fetchGoogleReviews };
};

// Hook for fetching TripAdvisor Reviews (implement with actual API)
export const useTripAdvisorReviews = (businessId: string) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTripAdvisorReviews = async () => {
    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/reviews/tripadvisor?businessId=${businessId}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch TripAdvisor reviews');
      }
      
      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error('Error fetching TripAdvisor reviews:', error);
      setError(error instanceof Error ? error.message : 'Error fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchTripAdvisorReviews();
    }
  }, [businessId]);

  return { reviews, loading, error, refetch: fetchTripAdvisorReviews };
};