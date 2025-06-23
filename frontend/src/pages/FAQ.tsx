import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';

export const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      category: 'Booking & Reservations',
      questions: [
        {
          question: 'How do I book a tour or experience?',
          answer: 'You can book directly through our website by selecting your preferred tour, choosing dates, and completing the secure online payment process. Alternatively, you can call us at +91 98765 43210 or email info@luxetimetravel.com for assistance.'
        },
        {
          question: 'Can I modify or cancel my booking?',
          answer: 'Yes, you can modify or cancel your booking up to 24 hours before the scheduled tour time for a full refund. Cancellations made within 24 hours may be subject to cancellation fees as per our cancellation policy.'
        },
        {
          question: 'How far in advance should I book?',
          answer: 'We recommend booking at least 1-2 weeks in advance to ensure availability, especially during peak tourist seasons (October to March). However, we do accept last-minute bookings subject to availability.'
        },
        {
          question: 'Do you accept group bookings?',
          answer: 'Absolutely! We offer special group rates for 10 or more people. Contact us directly for customized group packages and special pricing.'
        }
      ]
    },
    {
      category: 'Payment & Pricing',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept major credit cards (Visa, MasterCard, American Express), debit cards, UPI, net banking, and digital wallets through our secure Razorpay payment gateway.'
        },
        {
          question: 'Are there any hidden fees?',
          answer: 'No, we believe in transparent pricing. All costs including taxes, guide fees, and entrance tickets (where mentioned) are included in the displayed price. Any additional costs will be clearly mentioned in the tour description.'
        },
        {
          question: 'Do you offer partial payment options?',
          answer: 'Yes, for tours above ₹10,000, you can pay 50% at the time of booking and the remaining amount 48 hours before the tour date.'
        },
        {
          question: 'What is your refund policy?',
          answer: 'Full refunds are provided for cancellations made 24+ hours before the tour. Cancellations within 24 hours receive a 50% refund, and no refunds for no-shows. Weather-related cancellations receive full refunds.'
        }
      ]
    },
    {
      category: 'Tour Details',
      questions: [
        {
          question: 'What is included in the tour price?',
          answer: 'Tour prices typically include professional guide services, transportation (as mentioned), entrance fees to monuments/attractions (where specified), and refreshments (if mentioned). Specific inclusions are listed on each tour page.'
        },
        {
          question: 'What should I bring on the tour?',
          answer: 'We recommend comfortable walking shoes, weather-appropriate clothing, sunscreen, a hat, and a water bottle. For specific tours, additional items may be recommended in your booking confirmation email.'
        },
        {
          question: 'Are your tours suitable for children?',
          answer: 'Most of our tours are family-friendly and suitable for children above 5 years. We offer special rates for children (50% discount for ages 5-12). Please check individual tour descriptions for age recommendations.'
        },
        {
          question: 'Do you provide pick-up and drop-off services?',
          answer: 'Yes, we offer pick-up and drop-off services for most tours within the city limits. Exact pick-up points and times will be confirmed in your booking voucher.'
        }
      ]
    },
    {
      category: 'Health & Safety',
      questions: [
        {
          question: 'What safety measures do you have in place?',
          answer: 'We maintain high safety standards including regular vehicle maintenance, trained and licensed guides, first aid kits, emergency contacts, and comprehensive insurance coverage. All tours follow local safety guidelines.'
        },
        {
          question: 'Are there any health restrictions for tours?',
          answer: 'Some tours may have physical requirements such as walking long distances or climbing stairs. Specific health restrictions and fitness levels are mentioned in tour descriptions. Please consult your doctor if you have any medical concerns.'
        },
        {
          question: 'What happens in case of bad weather?',
          answer: 'Tours may be modified or rescheduled due to severe weather conditions for safety reasons. In such cases, we offer full refunds or alternative tour dates at no extra cost.'
        },
        {
          question: 'Do you have insurance coverage?',
          answer: 'Yes, all our tours are covered by comprehensive travel insurance. However, we recommend that travelers also have their own travel insurance for additional coverage.'
        }
      ]
    },
    {
      category: 'Customization & Special Requests',
      questions: [
        {
          question: 'Can you customize tours according to my preferences?',
          answer: 'Absolutely! We specialize in creating personalized experiences. Contact us with your preferences, interests, and requirements, and our team will design a custom itinerary just for you.'
        },
        {
          question: 'Do you accommodate dietary restrictions?',
          answer: 'Yes, we can accommodate various dietary requirements including vegetarian, vegan, gluten-free, and other special dietary needs. Please inform us at the time of booking.'
        },
        {
          question: 'Can you arrange accommodation?',
          answer: 'Yes, we can help arrange accommodation ranging from heritage hotels to luxury resorts. Contact us for personalized accommodation recommendations and bookings.'
        },
        {
          question: 'Do you offer multi-day tour packages?',
          answer: 'Yes, we offer comprehensive multi-day packages covering multiple destinations. These include accommodation, meals, transportation, and guided tours. Check our destinations page or contact us for custom packages.'
        }
      ]
    }
  ];

  const allQuestions = faqCategories.flatMap((category, categoryIndex) =>
    category.questions.map((q, qIndex) => ({
      ...q,
      category: category.category,
      globalIndex: categoryIndex * 100 + qIndex
    }))
  );

  const filteredQuestions = searchTerm
    ? allQuestions.filter(
        item =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Frequently Asked Questions - Luxé TimeTravel"
        description="Find answers to common questions about booking tours, payments, cancellations, and travel with Luxé TimeTravel. Get help with your luxury travel experience."
        keywords="faq, frequently asked questions, tour booking help, travel questions, luxe timetravel support"
      />

      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-200">
              Find answers to common questions about our services
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for answers..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            />
          </div>
        </div>

        {searchTerm ? (
          /* Search Results */
          <div>
            <h2 className="text-2xl font-bold text-[#104c57] mb-6">
              Search Results ({filteredQuestions.length})
            </h2>
            {filteredQuestions.length > 0 ? (
              <div className="space-y-4">
                {filteredQuestions.map((item) => (
                  <div key={item.globalIndex} className="bg-white rounded-lg shadow-sm">
                    <button
                      onClick={() => toggleItem(item.globalIndex)}
                      className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:ring-inset"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-[#ff914d] font-medium uppercase tracking-wide">
                            {item.category}
                          </span>
                          <h3 className="text-lg font-medium text-gray-900 mt-1">
                            {item.question}
                          </h3>
                        </div>
                        {openItems.includes(item.globalIndex) ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </button>
                    {openItems.includes(item.globalIndex) && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try searching with different keywords or browse the categories below.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Categories */
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-[#104c57] text-white px-6 py-4">
                  <h2 className="text-xl font-bold">{category.category}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {category.questions.map((item, qIndex) => {
                    const globalIndex = categoryIndex * 100 + qIndex;
                    return (
                      <div key={qIndex}>
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full text-left p-6 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:ring-inset transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                              {item.question}
                            </h3>
                            {openItems.includes(globalIndex) ? (
                              <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                            )}
                          </div>
                        </button>
                        {openItems.includes(globalIndex) && (
                          <div className="px-6 pb-6">
                            <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-[#104c57] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-lg mb-6">
            Our travel experts are here to help you plan the perfect journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-[#ff914d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors"
            >
              Contact Us
            </a>
            <a
              href="tel:+919876543210"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#104c57] transition-colors"
            >
              Call +91 98765 43210
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};