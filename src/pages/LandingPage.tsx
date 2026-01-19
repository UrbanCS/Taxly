import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Brain, 
  FileText, 
  Mail, 
  BarChart3, 
  Clock,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Play,
  Award,
  Globe,
  Sparkles,
  Target,
  Rocket,
  ChevronRight,
  Upload,
  Eye,
  DollarSign,
  Calculator,
  Smartphone,
  Monitor,
  MousePointer,
  Layers,
  Database,
  Cpu,
  Lightbulb
} from 'lucide-react';

const LandingPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (user: any) => {
    setShowAuthModal(false);
    // Redirect to dashboard after successful signup/login
    window.location.href = '/dashboard';
  };

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-play demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setDemoStep((prev) => (prev + 1) % demoSteps.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Document Parsing',
      description: 'State-of-the-art OCR and NLP technology extracts structured data from receipts, invoices, and tax forms with 99.7% accuracy.',
      color: 'from-primary-500 to-primary-700',
      stats: '99.7% Accuracy'
    },
    {
      icon: Mail,
      title: 'Intelligent Email Integration',
      description: 'Seamlessly connect Gmail/Outlook to automatically detect, fetch, and categorize tax-relevant documents using advanced ML algorithms.',
      color: 'from-accent-500 to-accent-700',
      stats: '50+ Email Types'
    },
    {
      icon: Shield,
      title: 'Real-time Data Validation',
      description: 'ML-powered validation engine instantly detects discrepancies, compliance issues, and potential audit flags in real-time.',
      color: 'from-green-500 to-emerald-600',
      stats: '100% Compliant'
    },
    {
      icon: BarChart3,
      title: 'Predictive Analytics Dashboard',
      description: 'Interactive dashboards with live financial KPIs, predictive insights, and automated compliance monitoring.',
      color: 'from-blue-500 to-indigo-600',
      stats: 'Real-time Insights'
    },
    {
      icon: Clock,
      title: 'Proactive Alert System',
      description: 'AI-powered deadline tracking, regulatory change notifications, and personalized tax optimization recommendations.',
      color: 'from-orange-500 to-red-600',
      stats: '24/7 Monitoring'
    },
    {
      icon: Users,
      title: 'Enterprise Collaboration',
      description: 'Multi-user access with granular role-based permissions, client portals, and real-time collaboration tools.',
      color: 'from-purple-500 to-pink-600',
      stats: 'Unlimited Users'
    }
  ];

  const benefits = [
    { text: 'Automate 85%+ of tax workflow', icon: Zap },
    { text: 'Reduce manual data entry by 95%', icon: Target },
    { text: 'Eliminate compliance errors completely', icon: Shield },
    { text: 'Real-time team collaboration', icon: Users },
    { text: 'Bank-level security & encryption', icon: Award },
    { text: '24/7 AI-powered assistance', icon: Sparkles }
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Senior CPA, Mitchell & Associates',
      company: 'Big Four Accounting Firm',
      content: 'TAXLY revolutionized our practice. We now process 5x more clients with the same team size. The AI accuracy is phenomenal.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      savings: '$50K+ saved annually'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CEO & Founder',
      company: 'TechStart Innovations',
      content: 'Finally, tax prep that doesn\'t give me headaches. The AI catches deductions I would have missed and saves me 20+ hours monthly.',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      savings: '20+ hours monthly'
    },
    {
      name: 'Jennifer Chen',
      role: 'Freelance Consultant',
      company: 'Independent Professional',
      content: 'The email integration is pure magic. All my receipts are automatically categorized and ready for filing. It\'s like having a personal tax assistant.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      savings: '95% less manual work'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Users', icon: Users },
    { value: '99.9%', label: 'Uptime', icon: Shield },
    { value: '2M+', label: 'Documents Processed', icon: FileText },
    { value: '$10M+', label: 'Tax Savings Generated', icon: TrendingUp }
  ];

  const demoSteps = [
    {
      title: 'Upload Documents',
      description: 'Drag and drop receipts, invoices, and tax forms',
      icon: Upload,
      image: '/api/placeholder/600/400',
      features: ['OCR Processing', 'Auto-categorization', 'Data Extraction']
    },
    {
      title: 'AI Processing',
      description: 'Advanced AI extracts and validates all data',
      icon: Brain,
      image: '/api/placeholder/600/400',
      features: ['99.7% Accuracy', 'Real-time Validation', 'Smart Insights']
    },
    {
      title: 'Smart Analytics',
      description: 'View comprehensive dashboards and insights',
      icon: BarChart3,
      image: '/api/placeholder/600/400',
      features: ['Live KPIs', 'Trend Analysis', 'Compliance Monitoring']
    },
    {
      title: 'Tax Optimization',
      description: 'Get AI-powered recommendations and savings',
      icon: DollarSign,
      image: '/api/placeholder/600/400',
      features: ['Deduction Finder', 'Compliance Alerts', 'Cost Savings']
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Trust Badge */}
          <div className="flex items-center justify-center space-x-2 mb-8 animate-bounce-soft">
            <div className="flex items-center space-x-1 glass-effect rounded-full px-6 py-3 border border-primary-200">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-secondary-700 text-sm font-semibold ml-2">Trusted by 50,000+ professionals</span>
              <Award className="w-4 h-4 text-primary-500 ml-2" />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight text-shadow">
            <span className="text-secondary-900">
              Revolutionary
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
              AI Tax Assistant
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-secondary-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Transform your tax preparation with cutting-edge AI that automates document parsing, 
            validates compliance, and delivers real-time insights. Built for the future of accounting.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <button
              onClick={() => openAuthModal('signup')}
              className="group flex items-center space-x-3 px-10 py-5 gradient-primary text-white rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 font-semibold text-lg"
            >
              <Rocket className="w-6 h-6" />
              <span>Start Free Trial</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            <button 
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center space-x-3 px-10 py-5 glass-effect text-primary-600 rounded-2xl hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 font-semibold text-lg border-2 border-primary-200"
            >
              <Play className="w-6 h-6" />
              <span>Try Live Demo</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 glass-effect rounded-2xl flex items-center justify-center border border-primary-200 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-3xl font-black text-secondary-900 mb-2">{stat.value}</div>
                <div className="text-secondary-600 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-32 bg-gradient-to-br from-secondary-900 via-primary-900 to-accent-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 glass-dark text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/20">
              <Monitor className="w-5 h-5" />
              <span>Interactive Demo</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6">
              See TAXLY in
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Action</span>
            </h2>
            <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Experience the power of AI-driven tax automation with our interactive demo. 
              Watch as documents are processed in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo Controls */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4 mb-8">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-large' 
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-large'
                  }`}
                >
                  {isPlaying ? 'Pause Demo' : 'Play Demo'}
                </button>
                <div className="text-white/80 font-medium">
                  Step {demoStep + 1} of {demoSteps.length}
                </div>
              </div>

              {demoSteps.map((step, index) => (
                <div
                  key={index}
                  onClick={() => setDemoStep(index)}
                  className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                    index === demoStep
                      ? 'glass-dark border-white/40'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      index === demoStep 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-large' 
                        : 'bg-white/20'
                    }`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-white/80 mb-4">{step.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {step.features.map((feature, featureIndex) => (
                          <span
                            key={featureIndex}
                            className="px-3 py-1 bg-white/10 text-white/90 rounded-full text-sm font-medium border border-white/20"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                to="/dashboard"
                className="block w-full px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-secondary-900 rounded-2xl hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-center font-bold text-lg"
              >
                Try Full App Now →
              </Link>
            </div>

            {/* Demo Visualization */}
            <div className="relative">
              <div className="glass-dark rounded-4xl p-8 border border-white/20 shadow-xl-soft">
                <div className="aspect-video bg-gradient-to-br from-secondary-800 to-secondary-900 rounded-3xl p-6 relative overflow-hidden">
                  {/* Simulated App Interface */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20"></div>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-6 h-6 text-primary-400" />
                      <span className="text-white font-bold">TAXLY Dashboard</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* Dynamic Content Based on Demo Step */}
                  <div className="space-y-4">
                    {demoStep === 0 && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-primary-400 rounded-2xl p-8 text-center">
                          <Upload className="w-12 h-12 text-primary-400 mx-auto mb-4 animate-bounce" />
                          <p className="text-white">Drop files here to upload</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-8 bg-primary-500/30 rounded animate-pulse"></div>
                          <div className="h-8 bg-green-500/30 rounded animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="h-8 bg-accent-500/30 rounded animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>
                      </div>
                    )}

                    {demoStep === 1 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-primary-500/20 rounded-2xl">
                          <Brain className="w-8 h-8 text-primary-400 animate-pulse" />
                          <div className="flex-1">
                            <div className="h-4 bg-white/20 rounded mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-2/3"></div>
                          </div>
                          <div className="text-green-400 font-bold">99.7%</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-green-500/20 rounded-xl">
                            <div className="h-3 bg-green-400/50 rounded mb-2"></div>
                            <div className="h-2 bg-green-400/30 rounded"></div>
                          </div>
                          <div className="p-3 bg-accent-500/20 rounded-xl">
                            <div className="h-3 bg-accent-400/50 rounded mb-2"></div>
                            <div className="h-2 bg-accent-400/30 rounded"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {demoStep === 2 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-primary-500/20 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                            <div className="text-white text-sm">$45K</div>
                          </div>
                          <div className="text-center p-3 bg-green-500/20 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                            <div className="text-white text-sm">+23%</div>
                          </div>
                          <div className="text-center p-3 bg-accent-500/20 rounded-xl">
                            <FileText className="w-6 h-6 text-accent-400 mx-auto mb-2" />
                            <div className="text-white text-sm">1,247</div>
                          </div>
                        </div>
                        <div className="h-20 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl flex items-end justify-around p-2">
                          {[...Array(7)].map((_, i) => (
                            <div
                              key={i}
                              className="bg-primary-400 rounded-t"
                              style={{ 
                                height: `${Math.random() * 60 + 20}%`,
                                width: '8px'
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}

                    {demoStep === 3 && (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-500/20 rounded-2xl border border-green-400/30">
                          <div className="flex items-center space-x-3 mb-3">
                            <Lightbulb className="w-6 h-6 text-yellow-400" />
                            <span className="text-white font-semibold">AI Recommendation</span>
                          </div>
                          <p className="text-white/90 text-sm mb-3">
                            Found $3,247 in additional deductions
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-green-400 font-bold">+$3,247 savings</span>
                            <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">
                              Apply
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-yellow-500/20 rounded-xl text-center">
                            <DollarSign className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                            <div className="text-white text-xs">Tax Savings</div>
                          </div>
                          <div className="p-3 bg-red-500/20 rounded-xl text-center">
                            <Shield className="w-5 h-5 text-red-400 mx-auto mb-1" />
                            <div className="text-white text-xs">Compliance</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce shadow-large">
                <Cpu className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full flex items-center justify-center animate-pulse shadow-large">
                <Database className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-br from-secondary-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Sparkles className="w-5 h-5" />
              <span>Powered by Advanced AI</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-secondary-900 mb-6">
              Intelligent Tax
              <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent"> Automation</span>
            </h2>
            <p className="text-2xl text-secondary-600 max-w-4xl mx-auto leading-relaxed">
              Experience the future of tax preparation with our revolutionary AI platform that 
              transforms complex workflows into seamless, automated processes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group card-modern relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-medium`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-secondary-900">
                      {feature.title}
                    </h3>
                    <span className="text-xs font-semibold bg-gradient-to-r from-primary-100 to-accent-100 text-primary-800 px-3 py-1 rounded-full">
                      {feature.stats}
                    </span>
                  </div>
                  <p className="text-secondary-600 leading-relaxed text-lg mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Learn more</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-gradient-to-br from-primary-900 via-secondary-900 to-accent-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 glass-dark text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/20">
                <Target className="w-5 h-5" />
                <span>Why Choose TAXLY?</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-white mb-8">
                Transform Your
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Tax Practice</span>
              </h2>
              <p className="text-xl text-white/90 mb-10 leading-relaxed">
                Our revolutionary AI platform eliminates tedious manual work, reduces errors to zero, 
                and empowers you to focus on strategic advisory services that grow your practice.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 glass-dark rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300 shadow-medium">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white font-semibold text-lg">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="glass-dark rounded-4xl p-10 border border-white/20 shadow-xl-soft">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-medium">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-black text-white mb-2">5x</div>
                    <div className="text-white/80 font-medium">Faster Processing</div>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-medium">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-black text-white mb-2">100%</div>
                    <div className="text-white/80 font-medium">Secure & Compliant</div>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-accent-400 to-accent-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-medium">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-black text-white mb-2">100+</div>
                    <div className="text-white/80 font-medium">Document Types</div>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-medium">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-black text-white mb-2">AI</div>
                    <div className="text-white/80 font-medium">Powered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-br from-secondary-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Globe className="w-5 h-5" />
              <span>Trusted Worldwide</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-secondary-900 mb-6">
              Loved by
              <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent"> Professionals</span>
            </h2>
            <p className="text-2xl text-secondary-600 max-w-4xl mx-auto">
              See how TAXLY is revolutionizing tax preparation for accountants and businesses globally.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="card-modern relative overflow-hidden shadow-large">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-accent-50/50"></div>
              <div className="relative z-10 p-12">
                <div className="flex items-center space-x-2 mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl text-secondary-800 mb-8 leading-relaxed font-medium">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-medium"
                    />
                    <div>
                      <p className="font-bold text-secondary-900 text-lg">{testimonials[currentTestimonial].name}</p>
                      <p className="text-secondary-600">{testimonials[currentTestimonial].role}</p>
                      <p className="text-sm text-secondary-500">{testimonials[currentTestimonial].company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                      {testimonials[currentTestimonial].savings}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial Navigation */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 scale-125' 
                      : 'bg-secondary-300 hover:bg-secondary-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-primary-900 via-secondary-900 to-accent-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-accent-400/20 to-primary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 glass-dark text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/20">
            <Rocket className="w-5 h-5" />
            <span>Ready to Transform Your Practice?</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-8">
            Join the Tax
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Revolution</span>
          </h2>
          
          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the future of tax preparation with our revolutionary AI platform. 
            Start your free trial today and see the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
            <button
              onClick={() => openAuthModal('signup')}
              className="group flex items-center space-x-3 px-12 py-6 bg-white text-secondary-900 rounded-2xl hover:bg-secondary-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 font-bold text-lg"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center space-x-3 px-12 py-6 glass-dark text-white rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 font-bold text-lg border border-white/20"
            >
              <Play className="w-6 h-6" />
              <span>Try Demo Again</span>
            </button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">14 Days</div>
              <div className="text-white/80">Free Trial</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">No Setup</div>
              <div className="text-white/80">Fees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">24/7</div>
              <div className="text-white/80">Support</div>
            </div>
          </div>
        </div>
      </section>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default LandingPage;