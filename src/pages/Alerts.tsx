import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';
import toast from 'react-hot-toast';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Calendar, 
  Clock,
  Filter,
  Settings,
  X,
  Eye
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'deadline' | 'compliance' | 'error' | 'info' | 'success';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionRequired: boolean;
}

const Alerts = () => {
  const { user } = useApp();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const transformed = data.map(alert => ({
          id: alert.id,
          type: alert.alert_type as 'deadline' | 'compliance' | 'error' | 'info' | 'success',
          priority: alert.priority as 'high' | 'medium' | 'low',
          title: alert.title,
          message: alert.message,
          date: alert.created_at,
          read: alert.resolved,
          actionRequired: alert.action_required || false
        }));
        setAlerts(transformed);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load alerts');
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };


  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'actionRequired'>('all');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return Calendar;
      case 'compliance':
        return AlertTriangle;
      case 'error':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const getAlertColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    switch (type) {
      case 'deadline':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'compliance':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'text-red-600';
    }
    switch (type) {
      case 'deadline':
        return 'text-orange-600';
      case 'compliance':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'success':
        return 'text-green-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.read;
      case 'high':
        return alert.priority === 'high';
      case 'actionRequired':
        return alert.actionRequired;
      default:
        return true;
    }
  });

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ resolved: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
      toast.success('Alert marked as read');
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast.error('Failed to update alert');
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Alert dismissed');
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast.error('Failed to dismiss alert');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;
  const highPriorityCount = alerts.filter(alert => alert.priority === 'high').length;
  const actionRequiredCount = alerts.filter(alert => alert.actionRequired).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alerts & Notifications</h1>
          <p className="text-gray-600">Stay informed about deadlines, compliance issues, and system updates.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{highPriorityCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-purple-600">{actionRequiredCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filter Alerts</h3>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'unread' 
                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'high' 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                High Priority ({highPriorityCount})
              </button>
              <button
                onClick={() => setFilter('actionRequired')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'actionRequired' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Action Required ({actionRequiredCount})
              </button>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? 'All Alerts' : 
               filter === 'unread' ? 'Unread Alerts' :
               filter === 'high' ? 'High Priority Alerts' :
               'Action Required Alerts'}
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading alerts...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {alerts.length === 0 ? 'No alerts yet. Check back later.' : 'No alerts match your current filter.'}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.type);
                return (
                  <div
                    key={alert.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !alert.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getAlertColor(alert.type, alert.priority)}`}>
                          <AlertIcon className={`w-5 h-5 ${getIconColor(alert.type, alert.priority)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                            {!alert.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                              alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {alert.priority.toUpperCase()}
                            </span>
                            {alert.actionRequired && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                ACTION REQUIRED
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{alert.message}</p>
                          <p className="text-sm text-gray-500">{formatDate(alert.date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!alert.read && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Mark as read"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Dismiss alert"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;