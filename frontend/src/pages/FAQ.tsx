import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [faqCategories, setFaqCategories] = useState<{category: string; questions: FAQ[]}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  useEffect(() => {
    const fetchFAQs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/faqs`);
        if (response.ok) {
          const data: FAQ[] = await response.json();
          
          // Group FAQs by category
          const groupedFAQs = data.reduce((acc: {category: string; questions: FAQ[]}[], faq) => {
            const existingCategory = acc.find(c => c.category === faq.category);
            
            if (existingCategory) {
              existingCategory.questions.push(faq);
            } else {
              acc.push({
                category: faq.category,
                questions: [faq]
              });
            }
            
            return acc;
          }, []);
          
          setFaqCategories(groupedFAQs);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFAQs();
  }, []);

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
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
              </div>
            ) : 
              faqCategories.map((category, categoryIndex) => (
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
              ))
            }
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
              href="tel:+917821001995"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#104c57] transition-colors"
            >
              Call +91 78210 01995
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};