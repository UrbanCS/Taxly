import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  description?: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  description,
  loading = false
}) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
    green: { bg: 'bg-green-100', text: 'text-green-600', gradient: 'from-green-500 to-emerald-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-pink-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', gradient: 'from-orange-500 to-red-500' },
    red: { bg: 'bg-red-100', text: 'text-red-600', gradient: 'from-red-500 to-pink-500' }
  };

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    down: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
    neutral: { icon: TrendingUp, color: 'text-gray-600', bg: 'bg-gray-100' }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
          <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
          <div className="w-32 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Extract the trend icon component to a properly capitalized variable for JSX
  const TrendIconComponent = trend ? trendConfig[trend].icon : null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 card-hover group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color].bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].text}`} />
        </div>
        {change && trend && TrendIconComponent && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${trendConfig[trend].bg} ${trendConfig[trend].color}`}>
            <TrendIconComponent className="w-3 h-3" />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
};

export default MetricCard;