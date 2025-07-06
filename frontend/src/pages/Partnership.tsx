import { Handshake, Users, Globe, TrendingUp, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';

export const Partnership = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    partnershipType: '',
    description: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const partnershipTypes = [
    {
      title: 'Hotels & Accommodations',
      description: 'Partner with us to showcase your property to luxury travelers',
      icon: '🏨',
      benefits: [
        'Increased bookings from premium travelers',
        'Professional photography and content creation',
        'Marketing support and promotion',
        'Direct booking integration'
      ]
    },
    {
      title: 'Tour Guide',
      description: 'Partner with us to design and promote immersive guided tours',
      icon: '🧭',
      benefits: [
        'Access to luxury traveler network',
        'Co-branded marketing campaigns',
        'Operational support and best-practice training',
        'Seamless booking integration'
      ]
    },
    {
      title: 'Local Tour Operators',
      description: 'Collaborate to offer unique and authentic experiences',
      icon: '🚌',
      benefits: [
        'Access to curated traveler base',
        'Joint marketing opportunities',
        'Operational support and training',
        'Technology platform access'
      ]
    },
    {
      title: 'Experience Providers',
      description: 'Showcase your unique experiences to discerning travelers',
      icon: '🎭',
      benefits: [
        'Premium traveler exposure',
        'Professional experience curation',
        'Quality assurance support',
        'Revenue optimization'
      ]
    },
    {
      title: 'Transportation Services',
      description: 'Join our network of premium transportation providers',
      icon: '🚗',
      benefits: [
        'Regular booking opportunities',
        'Premium service standards',
        'Fleet management support',
        'Driver training programs'
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Partnership Opportunities - Luxé TimeTravel"
        description="Partner with Luxé TimeTravel to offer premium travel experiences. Join our network of hotels, tour operators, and experience providers."
        keywords="travel partnership, tourism collaboration, hotel partnership, tour operator partnership"
      />

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Partnership Opportunities
            </h1>
            <p className="text-xl text-gray-200">
              Join us in creating extraordinary travel experiences
            </p>
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Why Partner with Luxé TimeTravel?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're committed to building long-term partnerships that benefit both our 
              partners and our discerning travelers seeking authentic luxury experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Premium Travelers</h3>
              <p className="text-gray-600">
                Access to high-value customers seeking luxury and authentic experiences
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Global Reach</h3>
              <p className="text-gray-600">
                Expand your market reach through our international network and platform
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Revenue Growth</h3>
              <p className="text-gray-600">
                Increase your revenue through strategic partnerships and marketing support
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Support & Training</h3>
              <p className="text-gray-600">
                Comprehensive support, training, and resources to ensure mutual success
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Partnership Types
            </h2>
            <p className="text-lg text-gray-600">
              Various ways to collaborate and grow together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {partnershipTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{type.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{type.title}</h3>
                    <p className="text-gray-600">{type.description}</p>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">Benefits:</h4>
                <ul className="space-y-2">
                  {type.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-[#ff914d] rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Partnership Process
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to start our partnership journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-[#ff914d] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply</h3>
              <p className="text-gray-600">
                Submit your partnership application with details about your business
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#ff914d] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review</h3>
              <p className="text-gray-600">
                Our team reviews your application and conducts quality assessment
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#ff914d] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Onboard</h3>
              <p className="text-gray-600">
                Complete onboarding process including training and platform setup
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#ff914d] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Launch</h3>
              <p className="text-gray-600">
                Start receiving bookings and grow your business with our support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Become a Partner
              </h2>
              <p className="text-gray-600">
                Fill out the form below and we'll get in touch within 48 hours
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="bg-green-100 text-green-800 p-6 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Application Submitted Successfully!</h3>
                  <p>Thank you for your interest in partnering with us. Our partnership team will review your application and contact you within 48 hours.</p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[#ff914d] hover:underline"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partnership Type *
                    </label>
                    <select
                      name="partnershipType"
                      value={formData.partnershipType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    >
                      <option value="">Select partnership type</option>
                      <option value="hotel">Hotels & Accommodations</option>
                      <option value="tour-operator">Local Tour Operator</option>
                      <option value="experience">Experience Provider</option>
                      <option value="transport">Transportation Service</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us about your business *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    placeholder="Describe your business, services, location, target audience, and why you'd like to partner with us..."
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#ff914d] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Partnership Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-[#104c57] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Questions About Partnership?
          </h2>
          <p className="text-xl mb-8">
            Our partnership team is here to help you get started
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="mailto:partnerships@luxetimetravel.com"
              className="flex items-center bg-white text-[#104c57] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              partnerships@luxetimetravel.com
            </a>
            <a
              href="tel:+919876543210"
              className="flex items-center border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#104c57] transition-colors"
            >
              <Phone className="h-5 w-5 mr-2" />
              +91 98765 43210
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};