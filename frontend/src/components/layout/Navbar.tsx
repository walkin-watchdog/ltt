import { useState } from 'react';
import { Link} from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

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

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold">
              <span className="text-[#ff914d]" style={{ fontSize: '24px' }}>Luxé</span>
              <span className="text-[#104c57] ml-1" style={{ fontSize: '24px' }}>TimeTravel</span>
            </div>
          </Link>
          
          <Link to="/blog" className="text-gray-700 hover:text-[#ff914d] transition-colors">
            Blog
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-[#ff914d] transition-colors">
              Home
            </Link>
            
            {/* Destinations Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('destinations')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center text-gray-700 hover:text-[#ff914d] transition-colors">
                Destinations
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === 'destinations' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50">
                  <Link to="/destinations" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    All Destinations
                  </Link>
                  {destinations.map((dest) => (
                    <Link
                      key={dest.name}
                      to={dest.path}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
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
              <button className="flex items-center text-gray-700 hover:text-[#ff914d] transition-colors">
                Luxe Experiences
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === 'experiences' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50">
                  <Link to="/experiences" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    All Experiences
                  </Link>
                  {experiences.map((exp) => (
                    <Link
                      key={exp.name}
                      to={exp.path}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      {exp.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/offers" className="text-gray-700 hover:text-[#ff914d] transition-colors">
              Special Offers
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-[#ff914d] transition-colors">
              Contact Us
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-[#ff914d] transition-colors">
              About Us
            </Link>
            
            {/* Plan Your Trip CTA */}
            <Link
              to="/plan-your-trip"
              className="bg-[#ff914d] text-white px-6 py-2 rounded-full hover:bg-[#e8823d] transition-colors"
            >
              Plan Your Trip
            </Link>

            {/* Admin Login */}
            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('admin')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center text-[#104c57] hover:text-[#ff914d] transition-colors text-sm">
                Admin
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === 'admin' && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50">
                  <a
                    href="http://localhost:5173"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Admin Dashboard
                  </a>
                  <Link
                    to="/admin-login"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Admin Login
                  </Link>
                </div>
              )}
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
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 text-gray-700">Home</Link>
              <Link to="/blog" className="block px-3 py-2 text-gray-700">Blog</Link>
              <Link to="/destinations" className="block px-3 py-2 text-gray-700">Destinations</Link>
              <Link to="/experiences" className="block px-3 py-2 text-gray-700">Luxe Experiences</Link>
              <Link to="/offers" className="block px-3 py-2 text-gray-700">Special Offers</Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-700">Contact Us</Link>
              <Link to="/about" className="block px-3 py-2 text-gray-700">About Us</Link>
              <Link to="/plan-your-trip" className="block px-3 py-2 text-[#ff914d] font-medium">Plan Your Trip</Link>
              <Link to="/admin-login" className="block px-3 py-2 text-[#104c57] text-sm">Admin Login</Link>
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-[#104c57] text-sm"
              >
                Admin Dashboard
              </a>
              <Link to="/admin-login" className="block px-3 py-2 text-[#104c57] text-sm">Admin</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};