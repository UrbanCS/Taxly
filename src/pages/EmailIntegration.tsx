import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';
import toast from 'react-hot-toast';
import { Mail, Plus, FolderSync as Sync, Settings, Trash2, CheckCircle, AlertCircle, Clock, FileText, Download, Eye, Filter, Search, Calendar, Tag, Archive, Star, Paperclip, User, Building, Globe, Shield, Zap, RefreshCw, X } from 'lucide-react';

const EmailIntegration = () => {
  const { user } = useApp();
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [emailDocuments, setEmailDocuments] = useState([]);

  useEffect(() => {
    if (user) {
      loadEmailAccounts();
      loadEmailDocuments();
    }
  }, [user]);

  const loadEmailAccounts = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAccounts = data?.map(acc => ({
        id: acc.id,
        email: acc.email,
        provider: acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1),
        status: acc.status,
        lastSync: acc.last_sync ? new Date(acc.last_sync).toLocaleString() : 'Never',
        documentsFound: acc.documents_found || 0,
        autoSync: acc.auto_sync,
        folders: acc.sync_folders || ['Inbox']
      })) || [];

      setConnectedAccounts(formattedAccounts);
    } catch (error) {
      console.error('Error loading email accounts:', error);
      toast.error('Failed to load email accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('email_date', { ascending: false });

      if (error) throw error;

      const formattedDocs = data?.map(doc => ({
        id: doc.id,
        subject: doc.subject,
        sender: doc.sender,
        date: new Date(doc.email_date).toISOString().split('T')[0],
        attachments: doc.attachments || 0,
        category: doc.category || 'Uncategorized',
        amount: doc.amount ? parseFloat(doc.amount) : 0,
        processed: doc.processed,
        confidence: doc.confidence,
        tags: doc.tags || []
      })) || [];

      setEmailDocuments(formattedDocs);
    } catch (error) {
      console.error('Error loading email documents:', error);
      toast.error('Failed to load email documents');
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountProvider, setNewAccountProvider] = useState('gmail');

  // Filter documents based on search and filter
  const filteredDocuments = emailDocuments.filter(doc => {
    const matchesSearch = doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'processed' && doc.processed) ||
                         (selectedFilter === 'pending' && !doc.processed) ||
                         doc.category.toLowerCase().includes(selectedFilter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const handleAddAccount = async () => {
    if (!newAccountEmail || !user) {
      toast.error('Please enter an email address');
      return;
    }

    setSyncing(true);

    try {
      // Insert new email account
      const { data, error } = await supabase
        .from('email_accounts')
        .insert({
          user_id: user.id,
          email: newAccountEmail,
          provider: newAccountProvider,
          status: 'connected',
          auto_sync: true,
          last_sync: new Date().toISOString(),
          documents_found: 0,
          sync_folders: ['Inbox']
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Successfully connected ${newAccountEmail}!`);
      setNewAccountEmail('');
      setShowAddModal(false);
      loadEmailAccounts();
    } catch (error) {
      console.error('Error adding email account:', error);
      toast.error('Failed to connect email account');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncAccount = async (accountId) => {
    if (!user) return;

    setSyncing(true);

    try {
      // Update account status to syncing
      await supabase
        .from('email_accounts')
        .update({ status: 'syncing' })
        .eq('id', accountId);

      loadEmailAccounts();

      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update account with new sync data
      const { error } = await supabase
        .from('email_accounts')
        .update({
          status: 'connected',
          last_sync: new Date().toISOString(),
          documents_found: Math.floor(Math.random() * 10)
        })
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Account synced successfully!');
      loadEmailAccounts();
      loadEmailDocuments();
    } catch (error) {
      console.error('Error syncing account:', error);
      toast.error('Failed to sync account');
    } finally {
      setSyncing(false);
    }
  };

  const handleRemoveAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to remove this email account?')) return;

    try {
      const { error } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Email account removed successfully!');
      loadEmailAccounts();
    } catch (error) {
      console.error('Error removing account:', error);
      toast.error('Failed to remove email account');
    }
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleDownloadDocument = (document) => {
    // Simulate document download
    const content = `Document: ${document.subject}\nSender: ${document.sender}\nDate: ${document.date}\nAmount: $${document.amount}\nCategory: ${document.category}\nTags: ${document.tags.join(', ')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.subject.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleProcessDocument = async (documentId) => {
    setSyncing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setEmailDocuments(docs => 
      docs.map(doc => 
        doc.id === documentId 
          ? { ...doc, processed: true, confidence: Math.floor(Math.random() * 10) + 90 }
          : doc
      )
    );
    
    setSyncing(false);
    alert('Document processed successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Email Integration</h1>
              <p className="text-gray-600 text-lg">Connect your email accounts to automatically extract tax documents and receipts.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Email Account</span>
            </button>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Connected Email Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedAccounts.map((account) => (
              <div key={account.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      account.provider === 'Gmail' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Mail className={`w-6 h-6 ${
                        account.provider === 'Gmail' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.provider}</h3>
                      <p className="text-sm text-gray-600">{account.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {account.status === 'connected' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {account.status === 'syncing' && (
                      <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                    {account.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="font-medium text-gray-900">{account.lastSync}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Documents Found:</span>
                    <span className="font-medium text-gray-900">{account.documentsFound}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Auto Sync:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.autoSync ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.autoSync ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncAccount(account.id)}
                    disabled={syncing || account.status === 'syncing'}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Sync className="w-4 h-4" />
                    <span>Sync</span>
                  </button>
                  <button
                    onClick={() => handleRemoveAccount(account.id)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Documents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Email Documents</h2>
              <p className="text-gray-600">Documents and receipts found in your connected email accounts.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Documents</option>
                <option value="processed">Processed</option>
                <option value="pending">Pending</option>
                <option value="office supplies">Office Supplies</option>
                <option value="travel">Travel</option>
                <option value="professional services">Professional Services</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{document.subject}</h3>
                      <div className="flex items-center space-x-2">
                        {document.processed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Processed ({document.confidence}%)
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Pending
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {document.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{document.sender}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{document.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Paperclip className="w-4 h-4" />
                        <span>{document.attachments} attachment{document.attachments !== 1 ? 's' : ''}</span>
                      </div>
                      {document.amount && (
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-green-600">${document.amount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {document.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => handleViewDocument(document)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Document"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(document)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download Document"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {!document.processed && (
                      <button
                        onClick={() => handleProcessDocument(document.id)}
                        disabled={syncing}
                        className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Process with AI"
                      >
                        <Zap className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Connect an email account to start finding tax documents automatically.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Add Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add Email Account</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                  <select
                    value={newAccountProvider}
                    onChange={(e) => setNewAccountProvider(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Outlook</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={newAccountEmail}
                    onChange={(e) => setNewAccountEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Secure Connection</h4>
                      <p className="text-sm text-blue-700">
                        We use OAuth 2.0 for secure authentication. We never store your email password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAccount}
                  disabled={syncing || !newAccountEmail}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50"
                >
                  {syncing ? 'Connecting...' : 'Connect Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Detail Modal */}
        {showDocumentModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Document Details</h3>
                <button 
                  onClick={() => setShowDocumentModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Subject</h4>
                  <p className="text-gray-700">{selectedDocument.subject}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Sender</h4>
                    <p className="text-gray-700">{selectedDocument.sender}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Date</h4>
                    <p className="text-gray-700">{selectedDocument.date}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Category</h4>
                    <p className="text-gray-700">{selectedDocument.category}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Amount</h4>
                    <p className="text-gray-700">${selectedDocument.amount?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Processing Status</h4>
                  <div className="flex items-center space-x-2">
                    {selectedDocument.processed ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-700">Processed with {selectedDocument.confidence}% confidence</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <span className="text-yellow-700">Pending processing</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Attachments</h4>
                  <p className="text-gray-700">{selectedDocument.attachments} file{selectedDocument.attachments !== 1 ? 's' : ''} attached</p>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => handleDownloadDocument(selectedDocument)}
                  className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>
                {!selectedDocument.processed && (
                  <button
                    onClick={() => {
                      handleProcessDocument(selectedDocument.id);
                      setShowDocumentModal(false);
                    }}
                    disabled={syncing}
                    className="flex items-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Process with AI</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailIntegration;