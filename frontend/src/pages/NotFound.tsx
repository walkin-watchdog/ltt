import { Link } from 'react-router-dom';
import { Home, ChevronLeft, Search } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <SEOHead
        title="Page Not Found - Luxé TimeTravel"
        description="We couldn't find the page you're looking for. Please check the URL or navigate back to our homepage."
      />
      
      <div className="max-w-md w-full px-4 py-8 text-center">
        <div className="mb-6">
          <span className="text-[#ff914d] text-9xl font-bold">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8">
          We couldn't find the page you're looking for. The page might have been moved, 
          deleted, or the URL might be incorrect.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center bg-[#104c57] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0d3d47] transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center border-2 border-[#104c57] text-[#104c57] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Looking for something specific?
          </h2>
          <div className="flex max-w-sm mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search our site..."
                className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              />
            </div>
            <button className="bg-[#ff914d] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#e8823d] ml-2">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};