import { supabase } from './supabaseClient';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userRole: 'individual' | 'accountant';
  businessName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
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

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export class AuthService {
  public static async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            user_role: data.userRole,
            business_name: data.businessName
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user || !authData.session) throw new Error('Failed to create account');

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: data.firstName,
        lastName: data.lastName,
        userRole: data.userRole,
        businessName: data.businessName,
        phone: data.phone,
        isEmailVerified: authData.user.email_confirmed_at !== null,
        subscriptionTier: 'free',
        subscriptionStatus: 'trialing',
        createdAt: authData.user.created_at,
        lastLoginAt: new Date().toISOString()
      };

      return {
        user,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at || 0
        }
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  public static async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) throw authError;
      if (!authData.user || !authData.session) throw new Error('Invalid email or password');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        userRole: profile?.user_role || 'individual',
        businessName: profile?.business_name,
        phone: profile?.phone,
        isEmailVerified: authData.user.email_confirmed_at !== null,
        subscriptionTier: profile?.subscription_tier || 'free',
        subscriptionStatus: profile?.subscription_status || 'trialing',
        createdAt: authData.user.created_at,
        lastLoginAt: new Date().toISOString()
      };

      return {
        user,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at || 0
        }
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  public static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('taxly_user');
      localStorage.removeItem('taxly_session');
      localStorage.removeItem('taxly_access_token');
      localStorage.removeItem('taxly_refresh_token');
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('taxly_user');
      localStorage.removeItem('taxly_session');
      localStorage.removeItem('taxly_access_token');
      localStorage.removeItem('taxly_refresh_token');
    }
  }

  public static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) return null;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      return {
        id: authUser.id,
        email: authUser.email!,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        userRole: profile?.user_role || 'individual',
        businessName: profile?.business_name,
        phone: profile?.phone,
        isEmailVerified: authUser.email_confirmed_at !== null,
        subscriptionTier: profile?.subscription_tier || 'free',
        subscriptionStatus: profile?.subscription_status || 'trialing',
        createdAt: authUser.created_at,
        lastLoginAt: profile?.last_login_at
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  public static async refreshToken(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) return null;

      if (data.session) {
        localStorage.setItem('taxly_access_token', data.session.access_token);
        localStorage.setItem('taxly_refresh_token', data.session.refresh_token);
        return data.session.access_token;
      }

      return null;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }

  public static async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const user = JSON.parse(localStorage.getItem('taxly_user') || '{}');

      if (!user.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone: updates.phone,
          business_name: updates.businessName,
          user_role: updates.userRole,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedUser: User = {
        ...user,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        businessName: data.business_name,
        userRole: data.user_role
      };

      localStorage.setItem('taxly_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  public static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  public static async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  public static async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });
      if (error) throw error;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  public static isAuthenticated(): boolean {
    const token = localStorage.getItem('taxly_access_token');
    const user = localStorage.getItem('taxly_user');
    return !!(token && user);
  }

  // Get stored access token
  public static getAccessToken(): string | null {
    return localStorage.getItem('taxly_access_token');
  }
}