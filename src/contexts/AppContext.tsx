import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { SeedService } from '../services/SeedService';

type UserRole = 'individual' | 'accountant' | 'admin';
type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';
type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

type Preferences = {
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

type FeatureFlags = {
  aiAssistant: boolean;
  advancedAnalytics: boolean;
  multiUserAccess: boolean;
  apiAccess: boolean;
  customReports: boolean;
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userRole: UserRole;
  businessName?: string;
  phone?: string;
  isEmailVerified: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  lastLoginAt?: string;
}

interface AppContextType {
  isTestMode: boolean;
  setTestMode: (mode: boolean) => void;

  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;

  apiConnected: boolean;
  setApiConnected: (connected: boolean) => void;

  dbConnected: boolean;
  setDbConnected: (connected: boolean) => void;

  preferences: Preferences;
  updatePreferences: (prefs: Partial<Preferences>) => void;

  sessionId: string | null;
  lastActivity: Date | null;
  updateActivity: () => void;

  errors: string[];
  addError: (error: string) => void;
  clearErrors: () => void;

  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  features: FeatureFlags;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export { AppContext };

const DEFAULT_PREFERENCES: Preferences = {
  theme: 'light',
  language: 'en',
  timezone: 'America/New_York',
  currency: 'USD',
  notifications: {
    email: true,
    push: true,
    sms: false
  }
};

const DEFAULT_FEATURES: FeatureFlags = {
  aiAssistant: true,
  advancedAnalytics: true,
  multiUserAccess: false,
  apiAccess: false,
  customReports: false
};

const AUTO_SEED_ENABLED = import.meta.env.VITE_ENABLE_SAMPLE_SEEDING === 'true';

const toUserRole = (value: unknown): UserRole => {
  if (value === 'accountant' || value === 'admin') return value;
  return 'individual';
};

const buildUserFromSession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']): User | null => {
  if (!session) return null;

  const metadata = session.user.user_metadata || {};

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    firstName: metadata.firstName ?? metadata.first_name ?? '',
    lastName: metadata.lastName ?? metadata.last_name ?? '',
    userRole: toUserRole(metadata.userRole ?? metadata.user_role),
    businessName: metadata.businessName ?? metadata.business_name ?? '',
    phone: metadata.phone ?? '',
    isEmailVerified: session.user.email_confirmed_at !== null,
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    createdAt: session.user.created_at,
    lastLoginAt: new Date().toISOString()
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTestMode, setTestMode] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [apiConnected, setApiConnected] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);

  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [features, setFeatures] = useState<FeatureFlags>(DEFAULT_FEATURES);

  const updateFeaturesForUser = useCallback((userData: User) => {
    const tier = userData.subscriptionTier;
    setFeatures({
      aiAssistant: true,
      advancedAnalytics: tier !== 'free',
      multiUserAccess: tier === 'professional' || tier === 'enterprise',
      apiAccess: tier === 'professional' || tier === 'enterprise',
      customReports: tier === 'enterprise'
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem('taxly_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const maybeSeedSampleData = useCallback(async (userId: string) => {
    if (!AUTO_SEED_ENABLED && !isTestMode) {
      return;
    }

    const { hasData } = await SeedService.checkDataExists(userId);
    if (!hasData) {
      await SeedService.seedSampleData(userId);
    }
  }, [isTestMode]);

  const applySession = useCallback(async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
    const userData = buildUserFromSession(session);

    if (!userData) {
      setUser(null);
      setAuthenticated(false);
      localStorage.removeItem('taxly_user');
      localStorage.removeItem('taxly_session');
      return;
    }

    setUser(userData);
    setAuthenticated(true);
    updateFeaturesForUser(userData);
    localStorage.setItem('taxly_user', JSON.stringify(userData));
    await maybeSeedSampleData(userData.id);
  }, [maybeSeedSampleData, updateFeaturesForUser]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' || urlParams.get('demo') === 'true') {
      setTestMode(true);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session).catch(err => {
        console.error('Initial session load failed:', err);
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setAuthenticated(false);
        localStorage.removeItem('taxly_user');
        localStorage.removeItem('taxly_session');
        sessionStorage.clear();
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        applySession(session).catch(err => {
          console.error('Auth state update failed:', err);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('taxly_user', JSON.stringify(user));
      updateFeaturesForUser(user);
    } else {
      localStorage.removeItem('taxly_user');
      localStorage.removeItem('taxly_session');
    }
  }, [user, updateFeaturesForUser]);

  useEffect(() => {
    localStorage.setItem('taxly_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updateActivity = useCallback(() => {
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
  }, [sessionId, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      setSessionId(newSessionId);
      updateActivity();

      const sessionData = {
        id: newSessionId,
        userId: user.id,
        lastActivity: new Date().toISOString()
      };
      localStorage.setItem('taxly_session', JSON.stringify(sessionData));
    }
  }, [isAuthenticated, user, updateActivity]);

  const updatePreferences = useCallback((newPrefs: Partial<Preferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  }, []);

  const addError = useCallback((error: string) => {
    setErrors(prev => [...prev, error]);
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e !== error));
    }, 5000);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

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
  }, [isAuthenticated, updateActivity]);

  useEffect(() => {
    const checkConnectivity = async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        setApiConnected(false);
        setDbConnected(false);
        return;
      }

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            apikey: supabaseAnonKey
          }
        });

        const healthy = response.status === 200 || response.status === 401;
        setApiConnected(healthy);
        setDbConnected(healthy);
      } catch {
        setApiConnected(false);
        setDbConnected(false);
      }
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const value: AppContextType = {
    isTestMode,
    setTestMode,

    isAuthenticated,
    setAuthenticated,
    user,
    setUser,
    updateUser,

    apiConnected,
    setApiConnected,
    dbConnected,
    setDbConnected,

    preferences,
    updatePreferences,

    sessionId,
    lastActivity,
    updateActivity,

    errors,
    addError,
    clearErrors,

    isLoading,
    setLoading,

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

export const useFeature = (featureName: keyof AppContextType['features']) => {
  const { features, user } = useApp();
  return {
    hasAccess: features[featureName],
    requiresUpgrade: !features[featureName] && user?.subscriptionTier === 'free'
  };
};

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
