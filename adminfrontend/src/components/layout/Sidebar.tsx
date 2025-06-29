import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  Home, 
  Package, 
  MapPin,
  Tag,
  Mail,
  Calendar, 
  BookOpen, 
  MessageSquare,
  ShoppingCart,
  LogOut,
  Menu,
  X
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
  { name: 'Newsletter', href: '/newsletter', icon: Mail },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`bg-[#104c57] text-white flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header with Toggle Button */}
      <div className="p-6 border-b border-[#0d3d47] flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <div className="text-2xl font-bold">
              <span className="text-[#ff914d]">Luxé</span>
              <span className="text-white ml-1">TimeTravel</span>
            </div>
            <p className="text-sm text-gray-300 mt-1">Admin Dashboard</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className=" mt-6 p-2 rounded-lg hover:bg-[#0d3d47] transition-colors"
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </button>
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
                  className={`flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-[#ff914d] text-white'
                      : 'text-gray-300 hover:bg-[#0d3d47] hover:text-white'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} ${isCollapsed ? 'flex-shrink-0' : ''}`} />
                  {!isCollapsed && (
                    <span className="transition-opacity duration-300">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-[#0d3d47] bg-[#104c57]">
        {!isCollapsed ? (
          <>
            <div className="flex items-center mb-4 bg-[#0d3d47] rounded-lg p-3">
              <div className="bg-[#ff914d] rounded-full h-10 w-10 flex items-center justify-center shadow">
                <span className="text-white font-semibold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-gray-300">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-white bg-[#0d3d47] hover:bg-[#ff914d] hover:text-white rounded-lg transition-colors font-medium"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-[#ff914d] rounded-full h-10 w-10 flex items-center justify-center shadow">
              <span className="text-white font-semibold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-white bg-[#0d3d47] hover:bg-[#ff914d] hover:text-white rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};