import { useState, useEffect } from 'react';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { MapPin, Users, DollarSign, Send, CheckCircle } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface TripFormData {
  name: string;
  email: string;
  phone: string;
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  budget: string;
  interests: string[];
  accommodation: string;
  transport: string;
  specialRequests: string;
}

export const PlanYourTrip = () => {
  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    email: '',
    phone: '',
    destination: '',
    startDate: '',
    endDate: '',
    adults: 2,
    children: 0,
    budget: '',
    interests: [],
    accommodation: '',
    transport: '',
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const budgetRanges = [
    'Under ₹50,000',
    '₹50,000 - ₹1,00,000',
    '₹1,00,000 - ₹2,00,000',
    '₹2,00,000 - ₹5,00,000',
    'Above ₹5,00,000'
  ];

  const interestOptions = [
    'Heritage & History',
    'Culture & Arts',
    'Culinary Experiences',
    'Adventure Sports',
    'Wildlife & Nature',
    'Photography',
    'Wellness & Spa',
    'Luxury Shopping',
    'Religious Sites',
    'Local Communities'
  ];

  const accommodationTypes = [
    'Heritage Hotels',
    'Luxury Hotels',
    'Luxury Resorts',
    'Boutique Hotels',
    'Palace Hotels',
    'Eco Lodges',
    'Camp & Glamping',
    'Homestays',
    'No Preference'
  ];

  const transportOptions = [
    'Private Car with Driver',
    'Luxury Coach',
    'Train (Luxury)',
    'Flight',
    'Mix of All',
    'Let us decide'
  ];

  const [destinations, setDestinations] = useState<{ name: string; slug: string }[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoadingDestinations(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/destinations`);
        if (res.ok) {
          const data = await res.json();
          setDestinations(data);
        }
      } catch (err) {
        console.error('Destinations fetch failed:', err);
      } finally {
        setLoadingDestinations(false);
      }
    };
    fetchDestinations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: 
        name === 'adults' || name === 'children'
          ? Number(value)
          : value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/trip-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          destination: '',
          startDate: '',
          endDate: '',
          adults: 2,
          children: 0,
          budget: '',
          interests: [],
          accommodation: '',
          transport: '',
          specialRequests: ''
        });
      } else {
        alert('Failed to submit trip request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting trip request:', error);
      alert('Failed to submit trip request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your trip request has been submitted successfully. Our travel experts will contact you within 24 hours to discuss your personalized itinerary.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSubmitted(false)}
              className="w-full bg-[#ff914d] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors"
            >
              Plan Another Trip
            </button>
            <a
              href="/"
              className="block w-full border border-[#104c57] text-[#104c57] py-3 px-6 rounded-lg font-semibold hover:bg-[#104c57] hover:text-white transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Plan Your Custom Trip - Luxé TimeTravel"
        description="Plan your perfect luxury trip to India. Our travel experts will create a personalized itinerary based on your preferences, interests, and budget."
        keywords="custom trip planning, personalized travel, luxury travel planning, bespoke travel india"
      />

      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Plan Your Dream Journey
            </h1>
            <p className="text-xl text-gray-200">
              Let our experts create a personalized itinerary just for you
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tell Us About Your Perfect Trip
            </h2>
            <p className="text-gray-600">
              Share your preferences and we'll craft an extraordinary experience tailored just for you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-[#ff914d]" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <PhoneInput
                      country={'ru'}
                      value={formData.phone}
                      onChange={value => setFormData(prev => ({ ...prev, phone: value || '' }))}
                      inputProps={{
                        required: true,
                        className:
                          'w-full pl-11 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent',
                        placeholder: '912 345-67',
                      }}
                      buttonClass="absolute left-0 top-0 h-full rounded-l-md border border-r-0 border-gray-300 bg-white pl-3"
                      dropdownClass="phone-dropdown z-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-[#ff914d]" />
                Trip Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Destination *
                  </label>
                  <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  >
                    <option value="">Select a destination</option>
                    {loadingDestinations
                      ? <option disabled>Loading…</option>
                      : destinations.map(d => (
                          <option key={d.slug} value={d.slug}>{d.name}</option>
                        ))
                    }
                    <option value="custom">Custom Itinerary</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentative Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentative End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Adults *
                    </label>
                    <select
                      name="adults"
                      value={formData.adults}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} Adult{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Children
                    </label>
                    <select
                      name="children"
                      value={formData.children}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    >
                      {[...Array(6)].map((_, i) => (
                        <option key={i} value={i}>{i} Child{i > 1 ? 'ren' : i === 1 ? '' : 'ren'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-[#ff914d]" />
                Budget Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {budgetRanges.map(range => {
                  const { min, max } = ({
                    'Under ₹50,000':        { min: 0,      max: 50_000 },
                    '₹50,000 - ₹1,00,000':  { min: 50_000, max: 100_000 },
                    '₹1,00,000 - ₹2,00,000':{ min:100_000, max: 200_000 },
                    '₹2,00,000 - ₹5,00,000':{ min:200_000, max: 500_000 },
                    'Above ₹5,00,000':      { min:500_000, max: Infinity },
                  }[range]!);

                  let label;
                  if (max === Infinity) {
                    label = <>Above <PriceDisplay amount={min} currency="INR" /></>;
                  } else if (min === 0) {
                    label = <>Under <PriceDisplay amount={max} currency="INR" /></>;
                  } else {
                    label = (
                      <>
                        <div className="flex">
                          <PriceDisplay amount={min} currency="INR" /> – <PriceDisplay amount={max} currency="INR" />
                        </div>
                      </>
                    );
                  }

                  return (
                    <label key={range} className="flex items-center">
                      <input
                        type="radio"
                        name="budget"
                        value={range}
                        checked={formData.budget === range}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Interests */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Interests (Select all that apply)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map(interest => (
                  <label key={interest} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Travel Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Accommodation
                  </label>
                  <select
                    name="accommodation"
                    value={formData.accommodation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  >
                    <option value="">Select accommodation type</option>
                    {accommodationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Transportation
                  </label>
                  <select
                    name="transport"
                    value={formData.transport}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  >
                    <option value="">Select transportation</option>
                    {transportOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests or Additional Information
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Tell us about any special requirements, dietary restrictions, accessibility needs, or specific experiences you'd like to include..."
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#ff914d] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Trip Request
                  </>
                )}
              </button>
              <p className="text-sm text-gray-600 mt-4">
                Our travel experts will contact you within 24 hours to discuss your personalized itinerary
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};