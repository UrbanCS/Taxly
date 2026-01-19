import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Calculator,
  Bell,
  Settings,
  LogOut,
  User,
  Search,
  ChevronDown,
  BarChart3,
  Brain,
  Upload,
  MessageCircle,
  Mail,
  Shield,
  Sparkles
} from 'lucide-react';
import AuthModal from './AuthModal';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';

interface HeaderProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated: _isAuthenticated, setIsAuthenticated: _setIsAuthenticated }) => {
  const { isAuthenticated, user: currentUser } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [notifications] = useState(3);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Calculator },
    { name: 'Accountant', href: '/accountant', icon: Shield },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'AI Assistant', href: '/assistant', icon: Brain },
    { name: 'Calculator', href: '/calculator', icon: MessageCircle },
    { name: 'Email', href: '/email', icon: Mail },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Alerts', href: '/alerts', icon: Bell },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleAuthSuccess = (user: any) => {
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setShowUserMenu(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-effect shadow-large border-b border-primary-100' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-medium">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-primary-600">
                  TAXLY
                </span>
                <span className="text-xs text-secondary-500 font-medium -mt-1">
                  AI Tax Assistant
                </span>
              </div>
            </Link>

            {/* Search Bar (Desktop) */}
            {isAuthenticated && (
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search documents, clients, or transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-secondary-50 border-2 border-secondary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-secondary-900 placeholder-secondary-400"
                  />
                </div>
              </div>
            )}

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center space-x-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-2xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'gradient-primary text-white shadow-medium'
                        : 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-semibold">{item.name}</span>
                  </Link>
                ))}
              </nav>
            )}

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <Link
                    to="/alerts"
                    className="relative p-3 text-secondary-400 hover:text-primary-600 transition-colors rounded-xl hover:bg-primary-50"
                  >
                    <Bell className="w-6 h-6" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-medium">
                        {notifications}
                      </span>
                    )}
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-primary-50 transition-colors"
                    >
                      <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-medium">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-secondary-900">
                          {currentUser?.user_metadata?.firstName && currentUser?.user_metadata?.lastName
                            ? `${currentUser.user_metadata.firstName} ${currentUser.user_metadata.lastName}`
                            : currentUser?.email?.split('@')[0] || 'User'}
                          {currentUser?.user_metadata?.userRole === 'accountant' ? ' - Professional' : ' - Premium Plan'}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-secondary-400" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 glass-effect rounded-2xl shadow-large border border-primary-100 py-2 animate-scale-in">
                        <div className="px-4 py-3 border-b border-primary-100">
                          <p className="text-sm font-semibold text-secondary-900">
                            {currentUser?.user_metadata?.firstName && currentUser?.user_metadata?.lastName
                              ? `${currentUser.user_metadata.firstName} ${currentUser.user_metadata.lastName}`
                              : currentUser?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {currentUser?.email}
                          </p>
                        </div>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-3 text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-5 h-5" />
                          <span className="font-medium">Settings</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-secondary-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => openAuthModal('signin')}
                    className="px-6 py-3 text-secondary-600 hover:text-primary-600 transition-colors font-semibold"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="flex items-center space-x-2 px-8 py-3 gradient-primary text-white rounded-2xl hover:shadow-large transition-all duration-200 shadow-medium transform hover:-translate-y-1 font-semibold"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Get Started Free</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-3 rounded-xl hover:bg-primary-50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-secondary-600" />
              ) : (
                <Menu className="w-6 h-6 text-secondary-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-6 border-t border-primary-100 animate-slide-up">
              {/* Mobile Search */}
              {isAuthenticated && (
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-secondary-50 border-2 border-secondary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                {isAuthenticated && navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-4 rounded-2xl transition-colors ${
                      isActive(item.href)
                        ? 'gradient-primary text-white shadow-medium'
                        : 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-semibold">{item.name}</span>
                  </Link>
                ))}
                
                <div className="flex flex-col space-y-3 pt-6 border-t border-primary-100">
                  {!isAuthenticated ? (
                    <>
                      <button 
                        onClick={() => {
                          openAuthModal('signin');
                          setIsMenuOpen(false);
                        }}
                        className="px-4 py-4 text-secondary-600 hover:text-primary-600 transition-colors text-left font-semibold"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          openAuthModal('signup');
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center justify-center space-x-2 px-8 py-4 gradient-primary text-white rounded-2xl shadow-medium font-semibold"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span>Get Started Free</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 bg-primary-50 rounded-2xl">
                        <p className="text-sm font-semibold text-secondary-900">
                          {currentUser?.user_metadata?.firstName && currentUser?.user_metadata?.lastName
                            ? `${currentUser.user_metadata.firstName} ${currentUser.user_metadata.lastName}`
                            : currentUser?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-secondary-500">{currentUser?.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-4 text-secondary-600 hover:text-primary-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-6 h-6" />
                        <span className="font-semibold">Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-4 text-secondary-600 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="w-6 h-6" />
                        <span className="font-semibold">Sign Out</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;