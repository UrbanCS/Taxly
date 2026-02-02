// Codex note: example comment added at user's request.
import React from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface AIInsightCardProps {
  type: 'optimization' | 'warning' | 'success' | 'suggestion';
  title: string;
  description: string;
  impact?: string;
  confidence?: number;
  action?: string;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({
  type,
  title,
  description,
  impact,
  confidence,
  action
}) => {
  const getConfig = () => {
    switch (type) {
      case 'optimization':
        return {
          icon: TrendingUp,
          bgColor: 'from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900'
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900'
        };
      case 'suggestion':
        return {
          icon: Lightbulb,
          bgColor: 'from-purple-50 to-pink-50',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600',
          titleColor: 'text-purple-900'
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  return (
    <div className={`p-6 rounded-xl bg-gradient-to-r ${config.bgColor} border ${config.borderColor} card-hover`}>
      <div className="flex items-start space-x-4">
        <div className={`w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center`}>
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-bold ${config.titleColor}`}>{title}</h4>
            {confidence && (
              <div className="flex items-center space-x-1">
                <Brain className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{confidence}%</span>
              </div>
            )}
          </div>
          <p className="text-gray-700 mb-3">{description}</p>
          {impact && (
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-600">Potential Impact: </span>
              <span className="text-sm font-bold text-gray-900">{impact}</span>
            </div>
          )}
          {action && (
            <button 
              onClick={() => {
                switch (action) {
                  case 'Review Recommendations':
                    window.location.href = '/analytics?view=insights';
                    break;
                  case 'Update Tax Rules':
                    window.location.href = '/settings';
                    break;
                  case 'View Details':
                    window.location.href = '/analytics?view=performance';
                    break;
                  case 'Set Up Automation':
                    window.location.href = '/email';
                    break;
                  default:
                    window.alert(`Action: ${action} - Feature coming soon!`);
                }
              }}
              className={`px-4 py-2 bg-white/80 hover:bg-white border ${config.borderColor} rounded-lg text-sm font-medium ${config.titleColor} transition-colors hover:scale-105 transform`}
            >
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsightCard;
