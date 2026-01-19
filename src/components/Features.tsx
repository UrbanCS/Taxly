import React from 'react';
import { Zap, Shield, Users, BarChart3, Clock, Smartphone } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Automation',
      description: 'Automate repetitive tasks in seconds with our intuitive drag-and-drop workflow builder.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and compliance with SOC 2, GDPR, and HIPAA standards.',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Real-time collaboration tools that keep your team aligned and productive.',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Gain insights with powerful analytics and reporting tools to optimize your workflows.',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Automatic time tracking and productivity insights to help you optimize your day.',
      color: 'from-red-400 to-pink-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access your workflows anywhere with our native mobile apps for iOS and Android.',
      color: 'from-indigo-400 to-purple-500'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools helps you streamline processes, boost productivity, 
            and scale your business efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;