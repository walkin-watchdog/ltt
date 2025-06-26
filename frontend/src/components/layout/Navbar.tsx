import { useState } from 'react';
import { Link} from 'react-router-dom';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const destinations = [
    { name: 'Delhi', path: '/destinations/delhi' },
    { name: 'Jaipur', path: '/destinations/jaipur' },
    { name: 'Agra', path: '/destinations/agra' },
  ];

  const experiences = [
    { name: 'Culinary', path: '/experiences/culinary' },
    { name: 'Heritage', path: '/experiences/heritage' },
    { name: 'Adventure & Nature', path: '/experiences/adventure-nature' },
  ];

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
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl logo-text steelfish">
              <span className="text-[#104c57] ml-18.5" style={{ fontSize: '18pt' }}>Luxé<br /></span>
              <span className="text-[#ff914d]" style={{ fontSize: '33pt' }}>TimeTravel</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            
            {/* Destinations Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('destinations')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link to="/destinations">
                <button className="flex items-center text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
                  Destinations
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </Link>
              {activeDropdown === 'destinations' && (
                <div className="absolute top-full left-0 pt-2 w-48 bg-white shadow-lg py-2 z-50">
                  {destinations.map((dest) => (
                    <Link
                      key={dest.name}
                      to={dest.path}
                      className="block px-4 py-2 text-gray-700 font-bold hover:text-[#ff914d]"
                    >
                      {dest.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Luxe Experiences Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('experiences')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link to="/experiences">
                <button className="flex items-center text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
                  Luxé <br /> Experiences
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </Link>
              {activeDropdown === 'experiences' && (
                <div className="absolute top-full left-0 pt-2 w-48 bg-white shadow-lg py-2 z-50">
                  {experiences.map((exp) => (
                    <Link
                      key={exp.name}
                      to={exp.path}
                      className="block px-4 py-2 text-gray-700 font-bold hover:text-[#ff914d]"
                    >
                      {exp.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/offers" className="flex items-center text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
              Special<br /> Offers
            </Link>
            <Link to="/contact" className="flex items-center text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
              Contact
            </Link>
            <Link to="/about" className="text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
              About
            </Link>
            <Link to="/blog" className="text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
              Blog
            </Link>
            <Link to="https://quaintspaces.in/" className="flex items-center text-gray-700 font-bold hover:text-[#ff914d] transition-colors">
              Luxé<br /> Stays
            </Link>
            
            {/* Plan My Trip CTA */}
            <Link
              to="/plan-your-trip"
              className="bg-[#104c57] text-white font-bold px-6 py-2 hover:bg-[#e8823d] transition-colors"
            >
              Plan My Trip
            </Link>

            {/* Login */}
            <div 
              className="relative group"
            >
              <a href={adminUrl} className="hover:text-[#e8823d] transition-colors">
                <User className="h-6 w-6 text-[#104c57]" />
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Login
                </span>
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-[#ff914d] transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3">
              <Link to="/destinations" className="block px-3 py-2 text-gray-700">Destinations</Link>
              <Link to="/experiences" className="block px-3 py-2 text-gray-700">Luxé Experiences</Link>
              <Link to="/offers" className="block px-3 py-2 text-gray-700">Special Offers</Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-700">Contact Us</Link>
              <Link to="/about" className="block px-3 py-2 text-gray-700">About</Link>
              <Link to="/blog" className="block px-3 py-2 text-gray-700">Blog</Link>
              <Link to="https://quaintspaces.in/" className="block px-3 py-2 text-gray-700">Luxé Stays</Link>
              <Link to="/plan-your-trip" className="block px-3 py-2 text-[#104c57] font-medium">Plan My Trip</Link>
              <a href={adminUrl} className="block px-3 py-2 text-[#ff914d] font-medium">Admin</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};