import React from 'react';
import { Settings, TestTube, Zap, Database } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const ModeToggle = () => {
  const { isTestMode, setTestMode, apiConnected, setApiConnected } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">App Mode</span>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => setTestMode(!isTestMode)}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isTestMode 
                ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}
          >
            <TestTube className="w-4 h-4" />
            <span>{isTestMode ? 'Demo Mode' : 'Production Mode'}</span>
          </button>
          
          <button
            onClick={() => setApiConnected(!apiConnected)}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              apiConnected 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{apiConnected ? 'API Connected' : 'API Offline'}</span>
          </button>
        </div>
        
        {isTestMode && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-orange-600">
              <Zap className="w-3 h-3" />
              <span>Demo data active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeToggle;