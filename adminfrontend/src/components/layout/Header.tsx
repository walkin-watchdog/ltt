import { LogOut, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Section */}
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search destinations, bookings, users..."
              className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff914d]/20 focus:border-[#ff914d] focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* User Profile Section */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            
            {/* Profile Avatar */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#ff914d] to-[#e8823d] rounded-full h-10 w-10 flex items-center justify-center shadow-lg ring-2 ring-white">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-white bg-gray-50 hover:bg-[#ff914d] rounded-lg transition-all duration-200 font-medium group"
            >
              <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};