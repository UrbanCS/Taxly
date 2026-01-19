import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import toast from 'react-hot-toast';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Eye,
  Edit,
  Download,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  Target,
  Award,
  Zap,
  Brain,
  BarChart3,
  RefreshCw,
  Bell,
  Settings,
  User,
  Building,
  Calculator,
  Lightbulb,
  Flag,
  CheckSquare,
  XCircle,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Star,
  ThumbsUp,
  ThumbsDown,
  Archive,
  Send,
  Plus,
  Minus
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'active' | 'pending' | 'review' | 'completed';
  riskLevel: 'low' | 'medium' | 'high';
  documentsCount: number;
  lastActivity: string;
  taxYear: number;
  estimatedRefund: number;
  completionPercentage: number;
  assignedAccountant: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  flags: string[];
  avatar?: string;
}

interface ReviewItem {
  id: string;
  clientId: string;
  clientName: string;
  type: 'document' | 'calculation' | 'deduction' | 'compliance';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedDate: string;
  dueDate: string;
  amount?: number;
  confidence?: number;
  flags: string[];
  assignedTo: string;
  notes: string[];
}

interface ComplianceAlert {
  id: string;
  type: 'deadline' | 'regulation' | 'audit' | 'error';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affectedClients: number;
  dueDate?: string;
  actionRequired: boolean;
  resolved: boolean;
}

const AccountantDashboard = () => {
  const { isTestMode } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientsData();
  }, []);

  const loadClientsData = async () => {
    setIsLoading(true);
    try {
      // Get all users with their document counts
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      if (profiles && profiles.length > 0) {
        // Get document counts for each user
        const clientsWithDocs = await Promise.all(
          profiles.map(async (profile) => {
            const { data: docs, error: docsError } = await supabase
              .from('documents')
              .select('id, status, amount, confidence, created_at')
              .eq('user_id', profile.id);

            if (docsError) {
              console.error('Error loading documents for user:', docsError);
              return null;
            }

            const documentsCount = docs?.length || 0;
            const completedDocs = docs?.filter(d => d.status === 'completed').length || 0;
            const totalAmount = docs?.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) || 0;
            const avgConfidence = docs?.length > 0
              ? docs.reduce((sum, d) => sum + (d.confidence || 0), 0) / docs.length
              : 0;
            const lastDoc = docs?.[0];

            return {
              id: profile.id,
              name: `${profile.first_name || 'User'} ${profile.last_name || ''}`.trim() || 'Unknown User',
              email: `user_${profile.id.substring(0, 8)}@example.com`,
              phone: '(555) 123-4567',
              company: profile.first_name ? `${profile.first_name}'s Business` : 'Business',
              status: (completedDocs === documentsCount && documentsCount > 0 ? 'completed' : documentsCount > 0 ? 'active' : 'pending') as 'active' | 'pending' | 'review' | 'completed',
              riskLevel: (avgConfidence < 85 ? 'high' : avgConfidence < 95 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
              documentsCount,
              lastActivity: lastDoc?.created_at || new Date().toISOString(),
              taxYear: 2024,
              estimatedRefund: Math.round(totalAmount * 0.25),
              completionPercentage: documentsCount > 0 ? Math.round((completedDocs / documentsCount) * 100) : 0,
              assignedAccountant: 'You',
              priority: (documentsCount > 20 ? 'high' : documentsCount > 10 ? 'medium' : 'low') as 'low' | 'medium' | 'high' | 'urgent',
              flags: avgConfidence < 85 ? ['Low confidence'] : [],
              avatar: `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`
            };
          })
        );

        setClients(clientsWithDocs.filter(c => c !== null && c.documentsCount > 0) as Client[]);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load client data');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };


  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);

  useEffect(() => {
    loadReviewItems();
  }, [clients]);

  const loadReviewItems = async () => {
    if (clients.length === 0) return;

    try {
      // Load documents that need review (low confidence or review_needed status)
      const { data: reviewDocs, error } = await supabase
        .from('documents')
        .select('*')
        .in('user_id', clients.map(c => c.id))
        .or('status.eq.review_needed,confidence.lt.90')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const items: ReviewItem[] = reviewDocs?.map(doc => {
        const client = clients.find(c => c.id === doc.user_id);
        return {
          id: doc.id,
          clientId: doc.user_id,
          clientName: client?.name || 'Unknown Client',
          type: 'document' as const,
          title: `Review: ${doc.filename}`,
          description: `AI extracted data with ${doc.confidence || 0}% confidence. ${doc.vendor ? `Vendor: ${doc.vendor}` : ''} ${doc.amount ? `Amount: $${doc.amount}` : ''}`,
          status: (doc.status === 'review_needed' ? 'pending' : 'needs_info') as 'pending' | 'approved' | 'rejected' | 'needs_info',
          priority: (doc.confidence && doc.confidence < 80 ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'urgent',
          submittedDate: doc.created_at,
          dueDate: new Date(new Date(doc.created_at).getTime() + 7 * 86400000).toISOString(),
          amount: doc.amount ? parseFloat(doc.amount) : undefined,
          confidence: doc.confidence || undefined,
          flags: doc.confidence && doc.confidence < 85 ? ['Low confidence', 'Verification needed'] : [],
          assignedTo: 'You',
          notes: []
        };
      }) || [];

      setReviewItems(items);
    } catch (error) {
      console.error('Error loading review items:', error);
      setReviewItems([]);
    }
  };

  const _placeholderReviewItems = [
    {
      id: '1',
      clientId: '1',
      clientName: 'Sarah Johnson',
      type: 'deduction',
      title: 'Home Office Deduction Verification',
      description: 'Client claims $4,200 home office deduction. Requires verification of exclusive business use.',
      status: 'pending',
      priority: 'high',
      submittedDate: '2025-01-15T10:30:00Z',
      dueDate: '2025-01-17T17:00:00Z',
      amount: 4200,
      confidence: 87,
      flags: ['High amount', 'Documentation needed'],
      assignedTo: 'John Smith',
      notes: ['Client provided floor plan', 'Need utility bills for verification']
    },
    {
      id: '2',
      clientId: '2',
      clientName: 'Michael Chen',
      type: 'document',
      title: 'Receipt OCR Verification',
      description: 'AI extracted $1,247 from business meal receipt. Confidence: 94%',
      status: 'approved',
      priority: 'medium',
      submittedDate: '2025-01-15T09:15:00Z',
      dueDate: '2025-01-16T17:00:00Z',
      amount: 1247,
      confidence: 94,
      flags: [],
      assignedTo: 'Jane Doe',
      notes: ['Receipt clear and legible', 'Business purpose documented']
    },
    {
      id: '3',
      clientId: '3',
      clientName: 'Emily Rodriguez',
      type: 'compliance',
      title: 'International Income Reporting',
      description: 'Complex international income structure requires additional forms and compliance review.',
      status: 'needs_info',
      priority: 'urgent',
      submittedDate: '2025-01-14T16:45:00Z',
      dueDate: '2025-01-16T12:00:00Z',
      flags: ['FBAR required', 'Form 8938', 'Tax treaty considerations'],
      assignedTo: 'John Smith',
      notes: ['Requested additional documentation', 'Consulting with international tax specialist']
    }
  ];

  // Remove placeholder

  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);

  useEffect(() => {
    loadComplianceAlerts();
  }, []);

  const loadComplianceAlerts = async () => {
    const alerts: ComplianceAlert[] = [
      {
        id: '1',
        type: 'deadline',
        severity: 'critical',
        title: 'Q4 Estimated Tax Deadline',
        description: 'Q4 estimated tax payments due in 3 days. 12 clients still pending.',
        affectedClients: 12,
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        actionRequired: true,
        resolved: false
      },
      {
        id: '2',
        type: 'regulation',
        severity: 'warning',
        title: 'New IRS Regulation Update',
        description: 'Updated business meal deduction rules effective for 2024 tax year.',
        affectedClients: 45,
        actionRequired: true,
        resolved: false
      },
      {
        id: '3',
        type: 'audit',
        severity: 'info',
        title: 'Audit Risk Assessment',
        description: '3 clients flagged for potential audit risk based on deduction patterns.',
        affectedClients: 3,
        actionRequired: false,
        resolved: false
      }
    ];
    setComplianceAlerts(alerts);
  };

  const _placeholderComplianceAlerts = [
    {
      id: '1',
      type: 'deadline',
      severity: 'critical',
      title: 'Q4 Estimated Tax Deadline',
      description: 'Q4 estimated tax payments due in 3 days. 12 clients still pending.',
      affectedClients: 12,
      dueDate: '2025-01-15T23:59:59Z',
      actionRequired: true,
      resolved: false
    },
    {
      id: '2',
      type: 'regulation',
      severity: 'warning',
      title: 'New IRS Regulation Update',
      description: 'Updated business meal deduction rules effective for 2024 tax year.',
      affectedClients: 45,
      actionRequired: true,
      resolved: false
    },
    {
      id: '3',
      type: 'audit',
      severity: 'info',
      title: 'Audit Risk Assessment',
      description: '3 clients flagged for potential audit risk based on deduction patterns.',
      affectedClients: 3,
      actionRequired: false,
      resolved: false
    }
  ];

  // Remove placeholder

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadClientsData(), loadComplianceAlerts()]);
    setRefreshing(false);
  };

  const approveReviewItem = (itemId: string) => {
    // In production, this would call API
    console.log('Approving review item:', itemId);
  };

  const rejectReviewItem = (itemId: string) => {
    // In production, this would call API
    console.log('Rejecting review item:', itemId);
  };

  const requestMoreInfo = (itemId: string) => {
    // In production, this would call API
    console.log('Requesting more info for:', itemId);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalClients: clients.length,
    activeReviews: reviewItems.filter(item => item.status === 'pending').length,
    completedToday: 8,
    criticalAlerts: complianceAlerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length,
    avgCompletionRate: Math.round(clients.reduce((sum, client) => sum + client.completionPercentage, 0) / clients.length),
    totalRefunds: clients.reduce((sum, client) => sum + client.estimatedRefund, 0)
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'clients', name: 'Client Management', icon: Users },
    { id: 'reviews', name: 'Review Queue', icon: CheckSquare },
    { id: 'compliance', name: 'Compliance', icon: Shield },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {isTestMode ? '🧪 ' : ''}Accountant Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                {isTestMode 
                  ? 'Demo mode - Complete client verification and compliance management system'
                  : 'Professional tax verification and client management platform'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              {isTestMode && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-orange-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Demo Mode Active</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-3xl font-black text-gray-900">{stats.totalClients}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Reviews</p>
                    <p className="text-3xl font-black text-orange-600">{stats.activeReviews}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Today</p>
                    <p className="text-3xl font-black text-green-600">{stats.completedToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                    <p className="text-3xl font-black text-red-600">{stats.criticalAlerts}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                    <p className="text-3xl font-black text-purple-600">{stats.avgCompletionRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                    <p className="text-2xl font-black text-green-600">${stats.totalRefunds.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Priority Review Queue */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Priority Review Queue</h3>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
                </div>
                <div className="space-y-4">
                  {reviewItems.filter(item => item.priority === 'urgent' || item.priority === 'high').slice(0, 3).map((item) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.clientName}</p>
                          <p className="text-sm text-gray-700">{item.description}</p>
                          {item.amount && (
                            <p className="text-sm font-medium text-green-600 mt-2">${item.amount.toLocaleString()}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => approveReviewItem(item.id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => rejectReviewItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Alerts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Compliance Alerts</h3>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Manage All</button>
                </div>
                <div className="space-y-4">
                  {complianceAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-400' :
                      alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                            {alert.actionRequired && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                ACTION REQUIRED
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{alert.affectedClients} clients affected</span>
                            {alert.dueDate && (
                              <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Client Management Tab */}
        {activeTab === 'clients' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Client Management</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Client</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Filter className="w-4 h-4" />
                      <span>More Filters</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Client List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-bold text-gray-900">{client.name}</h4>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              client.status === 'active' ? 'bg-green-100 text-green-800' :
                              client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              client.status === 'review' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {client.status.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              client.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              client.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              client.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {client.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{client.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{client.phone}</span>
                            </div>
                            {client.company && (
                              <div className="flex items-center space-x-1">
                                <Building className="w-4 h-4" />
                                <span>{client.company}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">{client.documentsCount} documents</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">${client.estimatedRefund.toLocaleString()} estimated refund</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium">{client.completionPercentage}% complete</span>
                            </div>
                          </div>
                          {client.flags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {client.flags.map((flag, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                  <Flag className="w-3 h-3 inline mr-1" />
                                  {flag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${client.completionPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Last activity: {new Date(client.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Review Queue Tab */}
        {activeTab === 'reviews' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Review Queue</h3>
                <p className="text-gray-600">Items requiring accountant verification and approval</p>
              </div>
              <div className="divide-y divide-gray-200">
                {reviewItems.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.type === 'document' ? 'bg-blue-100' :
                            item.type === 'calculation' ? 'bg-green-100' :
                            item.type === 'deduction' ? 'bg-purple-100' :
                            'bg-orange-100'
                          }`}>
                            {item.type === 'document' && <FileText className="w-5 h-5 text-blue-600" />}
                            {item.type === 'calculation' && <Calculator className="w-5 h-5 text-green-600" />}
                            {item.type === 'deduction' && <DollarSign className="w-5 h-5 text-purple-600" />}
                            {item.type === 'compliance' && <Shield className="w-5 h-5 text-orange-600" />}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.clientName}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.priority.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'approved' ? 'bg-green-100 text-green-800' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {item.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{item.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {item.amount && (
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-green-600">Amount</p>
                              <p className="text-lg font-bold text-green-900">${item.amount.toLocaleString()}</p>
                            </div>
                          )}
                          {item.confidence && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-600">AI Confidence</p>
                              <p className="text-lg font-bold text-blue-900">{item.confidence}%</p>
                            </div>
                          )}
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">Due Date</p>
                            <p className="text-lg font-bold text-gray-900">
                              {new Date(item.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {item.flags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.flags.map((flag, index) => (
                              <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                <Flag className="w-3 h-3 inline mr-1" />
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {item.notes.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Notes:</h5>
                            <ul className="space-y-1">
                              {item.notes.map((note, index) => (
                                <li key={index} className="text-sm text-gray-600">• {note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-6">
                        <button 
                          onClick={() => approveReviewItem(item.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => rejectReviewItem(item.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                        <button 
                          onClick={() => requestMoreInfo(item.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Request Info</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Compliance Alerts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Compliance Alerts</h3>
                <div className="space-y-4">
                  {complianceAlerts.map((alert) => (
                    <div key={alert.id} className={`p-6 rounded-xl border-l-4 ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-400' :
                      alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              alert.type === 'deadline' ? 'bg-red-100' :
                              alert.type === 'regulation' ? 'bg-yellow-100' :
                              alert.type === 'audit' ? 'bg-purple-100' :
                              'bg-gray-100'
                            }`}>
                              {alert.type === 'deadline' && <Calendar className="w-4 h-4 text-red-600" />}
                              {alert.type === 'regulation' && <Shield className="w-4 h-4 text-yellow-600" />}
                              {alert.type === 'audit' && <Eye className="w-4 h-4 text-purple-600" />}
                              {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-gray-600" />}
                            </div>
                            <h4 className="font-bold text-gray-900">{alert.title}</h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{alert.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{alert.affectedClients} clients affected</span>
                            {alert.dueDate && (
                              <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {alert.actionRequired && (
                            <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                              Take Action
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Compliance Checklist</h3>
                <div className="space-y-4">
                  {[
                    { task: 'Q4 Estimated Tax Payments', completed: false, urgent: true },
                    { task: 'Client Document Collection', completed: true, urgent: false },
                    { task: 'IRS Regulation Updates Review', completed: false, urgent: false },
                    { task: 'Audit Risk Assessment', completed: true, urgent: false },
                    { task: 'Form 1099 Preparation', completed: false, urgent: true },
                    { task: 'Client Communication Updates', completed: true, urgent: false }
                  ].map((item, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      item.completed ? 'border-green-200 bg-green-50' : 
                      item.urgent ? 'border-red-200 bg-red-50' : 
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          item.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`font-medium ${
                          item.completed ? 'text-green-900' : 
                          item.urgent ? 'text-red-900' : 
                          'text-gray-900'
                        }`}>
                          {item.task}
                        </span>
                        {item.urgent && !item.completed && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            URGENT
                          </span>
                        )}
                      </div>
                      {!item.completed && (
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Complete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Metrics */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-3xl font-black text-blue-600 mb-2">94%</div>
                      <div className="text-sm text-blue-700">Client Satisfaction</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-3xl font-black text-green-600 mb-2">2.3</div>
                      <div className="text-sm text-green-700">Avg Review Time (hrs)</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <div className="text-3xl font-black text-purple-600 mb-2">87%</div>
                      <div className="text-sm text-purple-700">First-Pass Accuracy</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                      <div className="text-3xl font-black text-orange-600 mb-2">156</div>
                      <div className="text-sm text-orange-700">Returns Completed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Analytics */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Revenue Analytics</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                      <div className="text-2xl font-black mb-1">$47,250</div>
                      <div className="text-green-100">Total Revenue (YTD)</div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                      <div className="text-2xl font-black mb-1">$312</div>
                      <div className="text-blue-100">Avg Revenue per Client</div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
                      <div className="text-2xl font-black mb-1">+23%</div>
                      <div className="text-orange-100">Growth vs Last Year</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountantDashboard;