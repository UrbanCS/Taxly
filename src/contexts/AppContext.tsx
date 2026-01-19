import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { SeedService } from '../services/SeedService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userRole: 'individual' | 'accountant' | 'admin';
  businessName?: string;
  phone?: string;
  isEmailVerified: boolean;
  subscriptionTier: 'free' | 'basic' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'trialing';
  createdAt: string;
  lastLoginAt?: string;
}

interface AppContextType {
  // Demo mode
  isTestMode: boolean;
  setTestMode: (mode: boolean) => void;
  
  // Authentication
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  
  // API and connectivity
  apiConnected: boolean;
  setApiConnected: (connected: boolean) => void;
  
  // Database connection
  dbConnected: boolean;
  setDbConnected: (connected: boolean) => void;
  
  // User preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  updatePreferences: (prefs: Partial<typeof preferences>) => void;
  
  // Session management
  sessionId: string | null;
  lastActivity: Date | null;
  updateActivity: () => void;
  
  // Error handling
  errors: string[];
  addError: (error: string) => void;
  clearErrors: () => void;
  
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Feature flags
  features: {
    aiAssistant: boolean;
    advancedAnalytics: boolean;
    multiUserAccess: boolean;
    apiAccess: boolean;
    customReports: boolean;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export { AppContext };

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo and testing
  const [isTestMode, setTestMode] = useState(false);
  
  // Authentication state
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Connectivity
  const [apiConnected, setApiConnected] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  
  // User preferences
  const [preferences, setPreferences] = useState({
    theme: 'light' as const,
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });
  
  // Session management
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  
  // Error handling
  const [errors, setErrors] = useState<string[]>([]);
  
  // Loading states
  const [isLoading, setLoading] = useState(false);
  
  // Feature flags based on user subscription
  const [features, setFeatures] = useState({
    aiAssistant: true,
    advancedAnalytics: true,
    multiUserAccess: false,
    apiAccess: false,
    customReports: false
  });

  // Check for admin/demo access on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' || urlParams.get('demo') === 'true') {
      setTestMode(true);
    }
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    // Check for existing Supabase session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.user_metadata?.firstName || '',
          lastName: session.user.user_metadata?.lastName || '',
          userRole: session.user.user_metadata?.userRole || 'individual',
          businessName: session.user.user_metadata?.businessName || '',
          phone: session.user.user_metadata?.phone || '',
          isEmailVerified: session.user.email_confirmed_at !== null,
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
          createdAt: session.user.created_at,
          lastLoginAt: new Date().toISOString()
        };

        setUser(userData);
        setAuthenticated(true);
        updateFeaturesForUser(userData);

        // Store in localStorage for persistence
        localStorage.setItem('taxly_user', JSON.stringify(userData));

        // Check if user has data, if not seed sample data
        const { hasData } = await SeedService.checkDataExists(session.user.id);
        if (!hasData) {
          console.log('No data found for user, seeding sample data...');
          await SeedService.seedSampleData(session.user.id);
        }
      } else {
        // No session found, ensure we're logged out
        setUser(null);
        setAuthenticated(false);
        localStorage.removeItem('taxly_user');
        localStorage.removeItem('taxly_session');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          if (event === 'SIGNED_IN' && session) {
            const userData = {
              id: session.user.id,
              email: session.user.email,
              firstName: session.user.user_metadata?.firstName || '',
              lastName: session.user.user_metadata?.lastName || '',
              userRole: session.user.user_metadata?.userRole || 'individual',
              businessName: session.user.user_metadata?.businessName || '',
              phone: session.user.user_metadata?.phone || '',
              isEmailVerified: session.user.email_confirmed_at !== null,
              subscriptionTier: 'free',
              subscriptionStatus: 'active',
              createdAt: session.user.created_at,
              lastLoginAt: new Date().toISOString()
            };

            setUser(userData);
            setAuthenticated(true);
            updateFeaturesForUser(userData);
            localStorage.setItem('taxly_user', JSON.stringify(userData));

            // Check if user has data, if not seed sample data
            const { hasData } = await SeedService.checkDataExists(session.user.id);
            if (!hasData) {
              console.log('No data found for user, seeding sample data...');
              await SeedService.seedSampleData(session.user.id);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setAuthenticated(false);
            localStorage.removeItem('taxly_user');
            localStorage.removeItem('taxly_session');
            sessionStorage.clear();
          }
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Save user data when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('taxly_user', JSON.stringify(user));
      updateFeaturesForUser(user);
    } else {
      localStorage.removeItem('taxly_user');
      localStorage.removeItem('taxly_session');
    }
  }, [user]);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('taxly_preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Update features based on user subscription
  const updateFeaturesForUser = (userData: User) => {
    const tier = userData.subscriptionTier;
    setFeatures({
      aiAssistant: true, // Available to all users
      advancedAnalytics: tier !== 'free',
      multiUserAccess: tier === 'professional' || tier === 'enterprise',
      apiAccess: tier === 'professional' || tier === 'enterprise',
      customReports: tier === 'enterprise'
    });
  };

  // Session management
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      updateActivity();
      
      // Save session data
      const sessionData = {
        id: newSessionId,
        userId: user.id,
        lastActivity: new Date().toISOString()
      };
      localStorage.setItem('taxly_session', JSON.stringify(sessionData));
    }
  }, [isAuthenticated, user]);

  // Activity tracking
  const updateActivity = () => {
    const now = new Date();
    setLastActivity(now);
    
    if (sessionId) {
      const sessionData = {
        id: sessionId,
        userId: user?.id,
        lastActivity: now.toISOString()
      };
      localStorage.setItem('taxly_session', JSON.stringify(sessionData));
    }
  };

  // Preferences management
  const updatePreferences = (newPrefs: Partial<typeof preferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  // Error management
  const addError = (error: string) => {
    setErrors(prev => [...prev, error]);
    // Auto-clear errors after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e !== error));
    }, 5000);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  // Auto-update activity on user interaction
  useEffect(() => {
    const handleUserActivity = () => {
      if (isAuthenticated) {
        updateActivity();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [isAuthenticated]);

  // Simulate API connectivity checks
  useEffect(() => {
    const checkConnectivity = () => {
      // Simulate occasional connectivity issues in demo mode
      if (isTestMode && Math.random() < 0.1) {
        setApiConnected(false);
        setTimeout(() => setApiConnected(true), 2000);
      }
    };

    const interval = setInterval(checkConnectivity, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isTestMode]);

  const value: AppContextType = {
    // Demo mode
    isTestMode,
    setTestMode,
    
    // Authentication
    isAuthenticated,
    setAuthenticated,
    user,
    setUser,
    
    // Connectivity
    apiConnected,
    setApiConnected,
    dbConnected,
    setDbConnected,
    
    // Preferences
    preferences,
    updatePreferences,
    
    // Session
    sessionId,
    lastActivity,
    updateActivity,
    
    // Errors
    errors,
    addError,
    clearErrors,
    
    // Loading
    isLoading,
    setLoading,
    
    // Features
    features
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Hook for checking feature access
export const useFeature = (featureName: keyof AppContextType['features']) => {
  const { features, user } = useApp();
  return {
    hasAccess: features[featureName],
    requiresUpgrade: !features[featureName] && user?.subscriptionTier === 'free'
  };
};

// Hook for user permissions
export const usePermissions = () => {
  const { user } = useApp();
  
  return {
    canManageClients: user?.userRole === 'accountant' || user?.userRole === 'admin',
    canAccessAnalytics: user?.subscriptionTier !== 'free',
    canUseAPI: user?.subscriptionTier === 'professional' || user?.subscriptionTier === 'enterprise',
    isAdmin: user?.userRole === 'admin',
    isAccountant: user?.userRole === 'accountant',
    isIndividual: user?.userRole === 'individual'
  };
};