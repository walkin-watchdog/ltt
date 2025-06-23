import { Leaf, Heart, Users, Globe, Recycle, Sun } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';

export const SustainableTravel = () => {
  const initiatives = [
    {
      icon: Leaf,
      title: 'Environmental Conservation',
      description: 'We partner with eco-friendly accommodations and promote low-impact tourism practices to preserve natural habitats.',
      actions: [
        'Carbon offset programs for all tours',
        'Plastic-free initiatives',
        'Supporting reforestation projects',
        'Wildlife conservation partnerships'
      ]
    },
    {
      icon: Heart,
      title: 'Community Support',
      description: 'We work directly with local communities to ensure tourism benefits reach the people who need it most.',
      actions: [
        'Direct employment of local guides',
        'Supporting local artisans and crafters',
        'Community development projects',
        'Education and skill development programs'
      ]
    },
    {
      icon: Users,
      title: 'Cultural Preservation',
      description: 'We help preserve traditional arts, crafts, and cultural practices through responsible tourism experiences.',
      actions: [
        'Traditional craft workshops',
        'Cultural exchange programs',
        'Heritage site conservation',
        'Language preservation initiatives'
      ]
    },
    {
      icon: Globe,
      title: 'Responsible Tourism',
      description: 'We promote ethical travel practices that respect local customs and minimize negative impacts.',
      actions: [
        'Small group sizes',
        'Respect for local customs',
        'Fair wage practices',
        'Sustainable transportation options'
      ]
    }
  ];

  const certifications = [
    {
      name: 'Responsible Tourism Certified',
      description: 'Certified by the Global Sustainable Tourism Council',
      year: '2023'
    },
    {
      name: 'Carbon Neutral Operations',
      description: 'All our operations are carbon neutral through verified offset programs',
      year: '2022'
    },
    {
      name: 'Community Tourism Award',
      description: 'Recognized for outstanding community development initiatives',
      year: '2023'
    }
  ];

  const impactStats = [
    { number: '500+', label: 'Local Families Supported' },
    { number: '25+', label: 'Conservation Projects' },
    { number: '₹50L+', label: 'Direct Community Investment' },
    { number: '100%', label: 'Carbon Offset Coverage' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Sustainable Travel & Responsible Tourism - Luxé TimeTravel"
        description="Learn about our commitment to sustainable tourism, environmental conservation, and community support. Travel responsibly with Luxé TimeTravel."
        keywords="sustainable travel, responsible tourism, eco tourism, community support, environmental conservation"
      />

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-green-600 to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sustainable Travel
            </h1>
            <p className="text-xl text-gray-200">
              Traveling responsibly to preserve our planet and support local communities
            </p>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Our Commitment to Sustainable Tourism
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              At Luxé TimeTravel, we believe that luxury and sustainability go hand in hand. 
              We are committed to creating extraordinary travel experiences that benefit 
              local communities, preserve cultural heritage, and protect the environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {initiatives.map((initiative, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <initiative.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{initiative.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{initiative.description}</p>
                <ul className="space-y-2">
                  {initiative.actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-[#ff914d] rounded-full mr-3"></div>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-[#104c57] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-lg text-gray-200">
              Measuring our positive contribution to communities and environment
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#ff914d] mb-2">{stat.number}</div>
                <div className="text-lg text-gray-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Do It */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              How We Practice Sustainable Tourism
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Waste Reduction</h3>
              <p className="text-gray-600">
                We minimize waste through digital vouchers, reusable water bottles, 
                and partnerships with zero-waste accommodations.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Clean Energy</h3>
              <p className="text-gray-600">
                We prioritize accommodations and transport services that use 
                renewable energy and sustainable practices.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Local Employment</h3>
              <p className="text-gray-600">
                We employ local guides, drivers, and service providers, 
                ensuring tourism revenue stays within communities.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cultural Respect</h3>
              <p className="text-gray-600">
                We educate travelers about local customs and ensure our 
                tours respect traditional ways of life.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Conservation Support</h3>
              <p className="text-gray-600">
                A portion of every booking supports wildlife conservation 
                and environmental protection initiatives.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Carbon Offsetting</h3>
              <p className="text-gray-600">
                All our tours are carbon neutral through verified offset 
                programs and reforestation projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Our Certifications & Recognition
            </h2>
            <p className="text-lg text-gray-600">
              Recognized by leading organizations for our commitment to sustainable tourism
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">{cert.year}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
                <p className="text-gray-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traveler Guidelines */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Guidelines for Responsible Travelers
            </h2>
            <p className="text-lg text-gray-600">
              How you can contribute to sustainable tourism during your journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Before You Travel</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Research local customs and cultural norms
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Pack reusable items to minimize waste
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Choose eco-friendly travel gear
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Learn basic phrases in the local language
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">During Your Trip</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Respect local traditions and customs
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Support local businesses and artisans
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Use water and energy resources responsibly
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Follow wildlife viewing guidelines
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#104c57] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Join Us in Sustainable Travel
          </h2>
          <p className="text-xl mb-8">
            Choose responsible tourism that makes a positive impact on the world
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/destinations"
              className="bg-[#ff914d] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors"
            >
              Book Sustainable Tours
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#104c57] transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};