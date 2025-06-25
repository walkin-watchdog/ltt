import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#104c57] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold mb-4">
              <span className="text-[#ff914d]" style={{ fontSize: '20px' }}>Luxé</span>
              <span className="text-white ml-1" style={{ fontSize: '20px' }}>TimeTravel</span>
            </div>
            <p className="text-gray-300 mb-4">
              Discover the Extraordinary with our curated luxury travel experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-[#ff914d] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#ff914d] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#ff914d] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#ff914d] transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-[#ff914d] transition-colors">Home</Link></li>
              <li><Link to="/destinations" className="text-gray-300 hover:text-[#ff914d] transition-colors">Destinations</Link></li>
              <li><Link to="/experiences" className="text-gray-300 hover:text-[#ff914d] transition-colors">Luxé Experiences</Link></li>
              <li><Link to="/offers" className="text-gray-300 hover:text-[#ff914d] transition-colors">Special Offers</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-[#ff914d] transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-300 hover:text-[#ff914d] transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-[#ff914d] transition-colors">FAQ</Link></li>
              <li><Link to="/policies" className="text-gray-300 hover:text-[#ff914d] transition-colors">Privacy & Terms</Link></li>
              <li><Link to="/sustainable-travel" className="text-gray-300 hover:text-[#ff914d] transition-colors">Sustainable Travel</Link></li>
              <li><Link to="/partnership" className="text-gray-300 hover:text-[#ff914d] transition-colors">Partnership</Link></li>
              <li><Link to="/careers" className="text-gray-300 hover:text-[#ff914d] transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-[#ff914d]" />
                <span className="text-gray-300">info@luxetimetravel.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-[#ff914d]" />
                <span className="text-gray-300">+91 98765 43210</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 text-[#ff914d] mt-1" />
                <span className="text-gray-300">123 Travel Street, New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2025 Luxé TimeTravel. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a 
                href="/blog" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#ff914d] transition-colors text-sm"
              >
                The Luxé Journal
              </a>
              <a 
                href="https://quaintspaces.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#ff914d] transition-colors text-sm"
              >
                Luxé Stays
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};