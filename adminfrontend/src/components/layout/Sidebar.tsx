import { Link, useLocation } from 'react-router-dom';
import { useState, useContext } from 'react';
import { 
  Home, 
  Package, 
  MapPin,
  FileText,
  Tag, 
  Ticket,
  Mail, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  ShoppingCart,
  UsersIcon,
  Pin,
  PinOff,
  Image,
  X
} from 'lucide-react';
import { MobileMenuContext } from '../../contexts/MobileMenuContext';


const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Destinations', href: '/destinations-admin', icon: MapPin },
  { name: 'Experience Categories', href: '/experience-categories', icon: Tag },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Coupons', href: '/coupons', icon: Ticket },
  { name: 'Availability', href: '/availability', icon: Calendar },
  { name: 'Gallery', href: '/gallery', icon: Image },
  { name: 'User Management', href: '/user-management', icon: UsersIcon },
  { name: 'Bookings', href: '/bookings', icon: BookOpen },
  { name: 'Requests', href: '/requests', icon: MessageSquare },
  { name: 'Abandoned Carts', href: '/abandoned-carts', icon: ShoppingCart },
  { name: 'Newsletter', href: '/newsletter', icon: Mail },
];

export const Sidebar = () => {
  const location = useLocation();
  // const { user, logout } = useAuth();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { mobileOpen, setMobileOpen }  = useContext(MobileMenuContext);
  const isCollapsed = !isPinned && !isHovered && !mobileOpen;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-[#104c57] text-white flex-col min-h-screen overflow-y-auto transition-all duration-300
        ${mobileOpen ? 'flex fixed inset-0 w-full z-50' : 'hidden md:flex'}`}
    >
      {isCollapsed && (
        <div className="">
          <div className="text-2xl w-16 mt-6 ml-4 font-bold flex-col items-center">
            <span className="text-[#ff914d]">L</span>
            <span className="text-white">TT</span>
          </div>
        </div>
      )}
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

          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-[#0d3d47] transition-colors md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Pin toggle for desktop */}
          {!mobileOpen && !isCollapsed && (
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="p-2 rounded-lg hover:bg-[#0d3d47] transition-colors"
            >
              {isPinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
            </button>
          )}
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
                  onClick={() => mobileOpen && setMobileOpen(false)}
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
    </div>
  );
};