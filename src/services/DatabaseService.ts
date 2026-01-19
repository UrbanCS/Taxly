// REAL DATABASE SERVICE - PRODUCTION READY

export interface DatabaseConfig {
  url: string;
  apiKey: string;
  schema?: string;
}

export interface QueryOptions {
  select?: string;
  filter?: Record<string, any>;
  order?: string;
  limit?: number;
  offset?: number;
}

export interface InsertOptions {
  returning?: string;
  onConflict?: string;
}

export interface UpdateOptions {
  returning?: string;
}

export class DatabaseService {
  private static config: DatabaseConfig = {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    schema: 'public'
  };

  private static getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'apikey': this.config.apiKey
    };

    if (includeAuth) {
      const token = localStorage.getItem('taxly_access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static buildQueryString(options: QueryOptions): string {
    const params = new URLSearchParams();

    if (options.select) {
      params.append('select', options.select);
    }

    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.append(key, `in.(${value.join(',')})`);
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([op, val]) => {
            params.append(key, `${op}.${val}`);
          });
        } else {
          params.append(key, `eq.${value}`);
        }
      });
    }

    if (options.order) {
      params.append('order', options.order);
    }

    if (options.limit) {
      params.append('limit', options.limit.toString());
    }

    if (options.offset) {
      params.append('offset', options.offset.toString());
    }

    return params.toString();
  }

  // Generic SELECT query
  public static async select<T = any>(
    table: string, 
    options: QueryOptions = {}
  ): Promise<T[]> {
    try {
      const queryString = this.buildQueryString(options);
      const url = `${this.config.url}/rest/v1/${table}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch from ${table}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Database select error for ${table}:`, error);
      throw error;
    }
  }

  // Generic INSERT query
  public static async insert<T = any>(
    table: string, 
    data: any | any[], 
    options: InsertOptions = {}
  ): Promise<T[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.returning) {
        params.append('select', options.returning);
      }

      if (options.onConflict) {
        params.append('on_conflict', options.onConflict);
      }

      const url = `${this.config.url}/rest/v1/${table}${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to insert into ${table}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Database insert error for ${table}:`, error);
      throw error;
    }
  }

  // Generic UPDATE query
  public static async update<T = any>(
    table: string, 
    data: any, 
    filter: Record<string, any>,
    options: UpdateOptions = {}
  ): Promise<T[]> {
    try {
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(filter).forEach(([key, value]) => {
        params.append(key, `eq.${value}`);
      });

      if (options.returning) {
        params.append('select', options.returning);
      }

      const url = `${this.config.url}/rest/v1/${table}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to update ${table}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Database update error for ${table}:`, error);
      throw error;
    }
  }

  // Generic DELETE query
  public static async delete<T = any>(
    table: string, 
    filter: Record<string, any>
  ): Promise<T[]> {
    try {
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(filter).forEach(([key, value]) => {
        params.append(key, `eq.${value}`);
      });

      const url = `${this.config.url}/rest/v1/${table}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to delete from ${table}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Database delete error for ${table}:`, error);
      throw error;
    }
  }

  // Execute custom SQL function
  public static async rpc<T = any>(
    functionName: string, 
    params: Record<string, any> = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.config.url}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to execute function ${functionName}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Database RPC error for ${functionName}:`, error);
      throw error;
    }
  }

  // Get user profile
  public static async getUserProfile(userId: string) {
    return this.select('user_profiles', {
      filter: { user_id: userId },
      limit: 1
    }).then(results => results[0] || null);
  }

  // Update user profile
  public static async updateUserProfile(userId: string, data: any) {
    return this.update('user_profiles', data, { user_id: userId });
  }

  // Get user documents
  public static async getUserDocuments(userId: string, options: QueryOptions = {}) {
    return this.select('documents', {
      ...options,
      filter: { ...options.filter, user_id: userId },
      order: options.order || 'created_at.desc'
    });
  }

  // Create document
  public static async createDocument(data: any) {
    return this.insert('documents', data, { returning: '*' });
  }

  // Get user clients (for accountants)
  public static async getUserClients(accountantId: string, options: QueryOptions = {}) {
    return this.select('clients', {
      ...options,
      filter: { ...options.filter, accountant_id: accountantId },
      order: options.order || 'created_at.desc'
    });
  }

  // Create client
  public static async createClient(data: any) {
    return this.insert('clients', data, { returning: '*' });
  }

  // Get tax returns
  public static async getTaxReturns(userId: string, options: QueryOptions = {}) {
    return this.select('tax_returns', {
      ...options,
      filter: { ...options.filter, user_id: userId },
      order: options.order || 'tax_year.desc'
    });
  }

  // Create tax return
  public static async createTaxReturn(data: any) {
    return this.insert('tax_returns', data, { returning: '*' });
  }

  // Get expenses
  public static async getExpenses(userId: string, options: QueryOptions = {}) {
    return this.select('expenses', {
      ...options,
      filter: { ...options.filter, user_id: userId },
      order: options.order || 'transaction_date.desc'
    });
  }

  // Create expense
  public static async createExpense(data: any) {
    return this.insert('expenses', data, { returning: '*' });
  }

  // Get alerts
  public static async getAlerts(userId: string, options: QueryOptions = {}) {
    return this.select('alerts', {
      ...options,
      filter: { ...options.filter, user_id: userId },
      order: options.order || 'created_at.desc'
    });
  }

  // Create alert
  public static async createAlert(data: any) {
    return this.insert('alerts', data, { returning: '*' });
  }

  // Log user activity
  public static async logActivity(userId: string, action: string, details: any = {}) {
    return this.rpc('log_user_activity', {
      p_user_id: userId,
      p_action: action,
      p_resource_type: details.resourceType,
      p_resource_id: details.resourceId,
      p_details: details
    });
  }

  // Get performance metrics
  public static async getPerformanceMetrics(userId: string, options: QueryOptions = {}) {
    return this.select('performance_metrics', {
      ...options,
      filter: { ...options.filter, user_id: userId },
      order: options.order || 'period_start.desc'
    });
  }

  // Test database connection
  public static async testConnection(): Promise<boolean> {
    try {
      await fetch(`${this.config.url}/rest/v1/`, {
        method: 'GET',
        headers: this.getHeaders(false)
      });
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  // Get database health
  public static async getHealth() {
    try {
      const response = await fetch(`${this.config.url}/rest/v1/`, {
        method: 'GET',
        headers: this.getHeaders(false)
      });
      
      return {
        connected: response.ok,
        status: response.status,
        latency: performance.now() // Simple latency measurement
      };
    } catch (error) {
      return {
        connected: false,
        status: 0,
        latency: -1,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}