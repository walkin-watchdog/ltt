import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { CurrencySelector } from '../common/CurrencySelector';
import { Helmet } from 'react-helmet-async';
import { TranslatedText } from '../common/TranslatedText';
import { LanguageSelector } from '../common/LanguageSelector';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [experienceCategories, setExperienceCategories] = useState<any[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const getDestinationPath = (slug: string) => `/destinations/${slug}`;
  const getExperiencePath = (slug: string) => `/experiences/${slug}`;

  useEffect(() => {
    const fetchData = async () => {
      setDestinationsLoading(true);
      setCategoriesLoading(true);

      try {
        const [destResponse, catResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/destinations`),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/experience-categories`)
        ]);

        if (destResponse.ok && catResponse.ok) {
          const destData = await destResponse.json();
          const catData = await catResponse.json();
          setDestinations(destData);
          setExperienceCategories(catData);
        }
      } catch (error) {
        console.error('Error fetching destinations or categories:', error);
      } finally {
        setDestinationsLoading(false);
        setCategoriesLoading(false);
      }
    };

    fetchData();
  }, []);

  const destinationsToShow = destinationsLoading ? [] : destinations.slice(0, 5);
  const categoriesToShow = categoriesLoading ? [] : experienceCategories.slice(0, 5);

  const adminUrl = import.meta.env.DEV
    ? 'http://localhost:5173/login'
    : 'https://admin.luxetimetravel.com';

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <Helmet>
        <link rel="preload" href="https://fonts.cdnfonts.com/css/steelfish" as="style" />
        <link href="https://fonts.cdnfonts.com/css/steelfish" rel="stylesheet" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-[calc(100vh-80vh)]">
          <Link to="/" className="flex items-center">
            <div className="text-2xl logo-text steelfish">
              <span className="text-[#104c57] ml-18.5" style={{ fontSize: '18pt' }}>Luxé<br /></span>
              <span className="text-[#ff914d]" style={{ fontSize: '33pt' }}>TimeTravel</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">

            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown('destinations')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link to="/destinations">
                <button className="flex items-center text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
                  <TranslatedText text="Destinations" />
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </Link>
              {activeDropdown === 'destinations' && (
                <div className="absolute top-full left-0 pt-2 w-48 bg-white shadow-lg py-2 z-50">
                  {destinationsLoading ? (
                    <p className="px-4 py-2 text-gray-400"><TranslatedText text="Loading..." /></p>
                  ) : destinationsToShow.length > 0 ? (
                    <>
                      {destinationsToShow.map((dest) => (
                        <Link
                          key={dest.id}
                          to={getDestinationPath(dest.slug)}
                          className="block px-4 py-2 text-gray-700 font-bold hover:text-[#ff914d]"
                        >
                          {dest.name}
                        </Link>
                      ))}
                      {destinations.length > 5 && (
                        <Link
                          to="/destinations"
                          className="block px-4 py-2 text-blue-600 font-bold hover:text-blue-700 border-t border-gray-100 mt-1 pt-1"
                        >
                          <TranslatedText text="View All Destinations" />
                        </Link>
                      )}
                    </>
                  ) : (
                    <p className="px-4 py-2 text-gray-400"><TranslatedText text="No destinations" /></p>
                  )}
                </div>
              )}
            </div>

            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown('experiences')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link to="/experiences">
                <button className="flex items-center text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
                  <TranslatedText text="Luxé" /><br/>
                  <TranslatedText text="Experiences" />
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </Link>
              {activeDropdown === 'experiences' && (
                <div className="absolute top-full left-0 pt-2 w-48 bg-white shadow-lg py-2 z-50">
                  {categoriesLoading ? (
                    <p className="px-4 py-2 text-gray-400"><TranslatedText text="Loading..." /></p>
                  ) : categoriesToShow.length > 0 ? (
                    <>
                      {categoriesToShow.map((cat) => (
                        <Link
                          key={cat.id}
                          to={getExperiencePath(cat.slug)}
                          className="block px-4 py-2 text-gray-700 font-bold hover:text-[#ff914d]"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      {experienceCategories.length > 5 && (
                        <Link
                          to="/experiences"
                          className="block px-4 py-2 text-blue-600 font-bold hover:text-blue-700 border-t border-gray-100 mt-1 pt-1"
                        >
                          <TranslatedText text="View All Experiences" />
                        </Link>
                      )}
                    </>
                  ) : (
                    <p className="px-4 py-2 text-gray-400"><TranslatedText text="No experiences" /></p>
                  )}
                </div>
              )}
            </div>

            <Link to="/offers" className="flex items-center text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
              <TranslatedText text="Special" /><br/>
              <TranslatedText text="Offers" />
            </Link>
            <Link to="/contact" className="flex items-center text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
              <TranslatedText text="Contact" />
            </Link>
            <Link to="/about" className="text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
              <TranslatedText text="About" />
            </Link>
            <Link to="/blog" className="text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
              <TranslatedText text="Blog" />
            </Link>
            <Link to="https://quaintspaces.in/" className="flex items-center text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
              Luxé<br /> Stays
            </Link>

            <Link
              to="/plan-your-trip"
              className="bg-[#104c57] text-white font-bold px-6 py-2 hover:bg-[#e8823d] transition-colors"
            >
              <TranslatedText text="Plan My Trip" />
            </Link>
          </div>

          <div className="md:hidden flex">
            <div className="flex items-center justify-between px-3 py-2">
              <LanguageSelector />
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <CurrencySelector />
            </div>
            <Link to="/plan-your-trip" className="bg-[#104c57] text-white font-bold pt-3 pb-3 px-6 py-2 mr-3 hover:bg-[#e8823d] transition-colors"><TranslatedText text="Plan My Trip" /></Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-[#ff914d] transition-colors"
            >
              {isOpen ? <X className="h-10 w-10 mb-4 pt-3" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3">
              <Link to="/destinations" className="block px-3 py-2 text-gray-700"><TranslatedText text="Destinations" /></Link>
              {destinationsToShow.length > 0 ? destinationsToShow.map((dest) => (
                <Link
                  key={dest.id}
                  to={getDestinationPath(dest.slug)}
                  className="block px-4 py-2 text-gray-700 font-bold hover:text-[#ff914d]"
                >
                  {dest.name}
                </Link>
              )) : (
                <p className="block px-4 py-2 text-gray-400"><TranslatedText text="Loading destinations..." /></p>
              )}
              {destinations.length > 5 && (
                <Link
                  to="/destinations"
                  className="block px-4 py-2 text-blue-600 font-bold hover:text-blue-700 border-t border-gray-100 mt-1 pt-1"
                >
                  <TranslatedText text="View All Destinations" />
                </Link>
              )}

              <Link to="/experiences" className="block px-3 py-2 text-gray-700"><TranslatedText text="Luxé Experiences" /></Link>
              {categoriesToShow.length > 0 ? categoriesToShow.map((cat) => (
                <Link
                  key={cat.id}
                  to={getExperiencePath(cat.slug)}
                  className="block px-4 py-2 text-gray-700 font-bold hover:text-[#ff914d]"
                >
                  {cat.name}
                </Link>
              )) : (
                <p className="block px-4 py-2 text-gray-400"><TranslatedText text="Loading categories..." /></p>
              )}

              <Link to="/offers" className="block px-3 py-2 text-gray-700"><TranslatedText text="Special Offers" /></Link>
              <Link to="/about" className="block px-3 py-2 text-gray-700"><TranslatedText text="About" /></Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-700"><TranslatedText text="Contact Us" /></Link>
              <Link to="/blog" className="block px-3 py-2 text-gray-700"><TranslatedText text="Blog" /></Link>
              <Link to="https://quaintspaces.in/" className="block px-3 py-2 text-gray-700">"Luxé Stays"</Link>
              <a href={adminUrl} className="block px-3 py-2 text-[#ff914d] font-medium"><TranslatedText text="Admin" /></a>
            </div>
          </div>
        )}
      </div>
      <div className="hidden md:flex justify-end max-w-7xl ml-10 pb-3 mx-auto -mt-9">
        <CurrencySelector />
        <LanguageSelector />

        <div className="relative group ml-4">
          <a href={adminUrl} className="hover:text-[#e8823d] transition-colors">
            <User className="h-6 w-6 text-[#104c57]" />
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <TranslatedText text="Login" />
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
};