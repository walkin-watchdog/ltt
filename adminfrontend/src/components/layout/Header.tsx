import { LogOut, Lock, X, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useContext } from 'react';
import { PasswordChangeForm } from '../auth/PasswordChangeForm';
import { Menu } from 'lucide-react';
import { MobileMenuContext } from '../../contexts/MobileMenuContext';

export const Header = () => {
  const { user, logout } = useAuth();
  const { setMobileOpen } = useContext(MobileMenuContext);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = () => {
    setShowUserDropdown(false);
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          className="md:hidden p-2 mr-4 text-gray-600 hover:bg-gray-100 rounded"
          aria-label="Open sidebar"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Right Section */}
        <div className="flex items-center space-x-4 ml-auto">
          <div className="flex items-center">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            
            {/* Profile Avatar */}
            <div 
            className="relative ml-3 cursor-pointer flex items-center" 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <div className="bg-gradient-to-br from-[#ff914d] to-[#e8823d] rounded-full h-10 w-10 flex items-center justify-center shadow-lg ring-2 ring-white">
              <User className="text-white font-semibold text-sm" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>

            {showUserDropdown && (
              <div className="absolute right-0 top-12 z-10 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="py-1">
                  <div className="px-4 py-2 border-b text-xs font-medium text-gray-500">
                    ACCOUNT
                  </div>
                  <div
                    onClick={(e) => { e.stopPropagation(); setShowPasswordModal(true); }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Lock className="h-4 w-4 mr-3 text-gray-500" />
                    Change Password
                  </div>
                  <div
                    onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                    Logout
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <PasswordChangeForm onClose={() => setShowPasswordModal(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};