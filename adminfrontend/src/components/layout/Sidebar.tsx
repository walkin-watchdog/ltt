import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  MapPin,
  Tag,
  Calendar, 
  BookOpen, 
  MessageSquare,
  ShoppingCart,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Destinations', href: '/destinations-admin', icon: MapPin },
  { name: 'Experience Categories', href: '/experience-categories', icon: Tag },
  { name: 'Availability', href: '/availability', icon: Calendar },
  { name: 'Bookings', href: '/bookings', icon: BookOpen },
  { name: 'Requests', href: '/requests', icon: MessageSquare },
  { name: 'Abandoned Carts', href: '/abandoned-carts', icon: ShoppingCart },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="bg-[#104c57] text-white w-64 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#0d3d47]">
        <div className="text-2xl font-bold">
          <span className="text-[#ff914d]">Luxé</span>
          <span className="text-white ml-1">TimeTravel</span>
        </div>
        <p className="text-sm text-gray-300 mt-1">Admin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#ff914d] text-white'
                      : 'text-gray-300 hover:bg-[#0d3d47] hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-[#0d3d47]">
        <div className="flex items-center mb-4">
          <div className="bg-[#ff914d] rounded-full h-10 w-10 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-300">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#0d3d47] hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
};