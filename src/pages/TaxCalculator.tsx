import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Save, 
  Download,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Minus,
  Percent,
  Target,
  Award,
  Zap,
  Brain,
  BarChart3
} from 'lucide-react';
import { TaxCalculatorService, TaxCalculationResult } from '../services/TaxCalculatorService';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabaseClient';
import toast from 'react-hot-toast';

interface Deduction {
  id: string;
  name: string;
  amount: number;
  category: string;
  aiSuggested?: boolean;
  fromDocument?: boolean;
  documentId?: string;
}

const TaxCalculator = () => {
  const { isTestMode, user } = useApp();
  const [income, setIncome] = useState(75000);
  const [filingStatus, setFilingStatus] = useState<'single' | 'marriedJoint' | 'marriedSeparate' | 'headOfHousehold'>('single');
  const [state, setState] = useState('CA');
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [calculation, setCalculation] = useState<TaxCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  useEffect(() => {
    if (user) {
      loadTaxDeductibleDocuments();
    }
  }, [user]);

  const loadTaxDeductibleDocuments = async () => {
    if (!user) return;

    setIsLoadingDocuments(true);
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('tax_deductible', true)
        .eq('status', 'completed');

      if (error) throw error;

      const documentDeductions: Deduction[] = (documents || []).map(doc => ({
        id: doc.id,
        name: doc.vendor || doc.description || doc.filename || 'Expense',
        amount: parseFloat(doc.amount?.toString() || '0'),
        category: doc.category || 'Business',
        fromDocument: true,
        documentId: doc.id
      }));

      setDeductions(documentDeductions);
      if (documentDeductions.length > 0) {
        toast.success(`Loaded ${documentDeductions.length} deductions from your uploaded documents`);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const performCalculation = () => {
    setIsCalculating(true);

    setTimeout(() => {
      const totalItemizedDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
      const result = TaxCalculatorService.calculateTax(income, filingStatus, state, totalItemizedDeductions);
      setCalculation(result);
      setIsCalculating(false);
    }, isTestMode ? 1500 : 100);
  };

  useEffect(() => {
    if (!isLoadingDocuments) {
      performCalculation();
    }
  }, [income, filingStatus, state, deductions, isLoadingDocuments]);

  const addDeduction = () => {
    const newDeduction: Deduction = {
      id: Date.now().toString(),
      name: 'New Deduction',
      amount: 0,
      category: 'Other'
    };
    setDeductions([...deductions, newDeduction]);
  };

  const updateDeduction = (id: string, field: string, value: any) => {
    setDeductions(deductions.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const removeDeduction = (id: string) => {
    setDeductions(deductions.filter(d => d.id !== id));
  };

  // Get REAL AI suggestions based on income and profession
  const aiSuggestions = TaxCalculatorService.getDeductionSuggestions(income, 'consultant');

  const saveCalculation = async () => {
    if (!calculation || !user) return;

    try {
      const deductionsData = deductions.reduce((acc, d) => {
        acc[d.id] = {
          name: d.name,
          amount: d.amount,
          category: d.category,
          fromDocument: d.fromDocument
        };
        return acc;
      }, {} as Record<string, any>);

      const { error } = await supabase
        .from('tax_calculations')
        .insert({
          user_id: user.id,
          name: `Tax Calculation ${new Date().toLocaleDateString()}`,
          filing_status: filingStatus,
          state: state,
          gross_income: income,
          adjusted_gross_income: calculation.adjustedGrossIncome,
          taxable_income: calculation.taxableIncome,
          federal_tax: calculation.federalTax,
          state_tax: calculation.stateTax,
          fica_tax: calculation.ficaTax,
          total_tax: calculation.totalTax,
          effective_rate: calculation.effectiveRate,
          marginal_rate: calculation.marginalRate,
          after_tax_income: calculation.afterTaxIncome,
          deductions: deductionsData,
          calculation_data: calculation
        });

      if (error) throw error;

      toast.success('Calculation saved successfully!');
    } catch (error) {
      console.error('Error saving calculation:', error);
      toast.error('Failed to save calculation');
    }
  };

  const exportCalculation = () => {
    if (!calculation) return;
    
    const exportData = {
      calculation,
      deductions,
      filingStatus,
      state,
      exportDate: new Date().toISOString()
    };
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-calculation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {isTestMode ? '🧪 ' : ''}Tax Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                {isTestMode 
                  ? 'Demo mode - Using real tax calculations with simulated features'
                  : 'Production-ready tax calculator with 2024 tax brackets and real calculations'
                }
              </p>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                      placeholder="75,000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filing Status</label>
                  <select
                    value={filingStatus}
                    onChange={(e) => setFilingStatus(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="single">Single</option>
                    <option value="marriedJoint">Married Filing Jointly</option>
                    <option value="marriedSeparate">Married Filing Separately</option>
                    <option value="headOfHousehold">Head of Household</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    <option value="WA">Washington</option>
                    <option value="NV">Nevada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Deductions</h3>
                </div>
                <button
                  onClick={addDeduction}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Deduction</span>
                </button>
              </div>

              {isLoadingDocuments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading your uploaded documents...</span>
                </div>
              ) : deductions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No deductions yet. Add manually or upload tax-deductible documents in the Upload section.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deductions.map((deduction) => (
                    <div key={deduction.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      deduction.fromDocument
                        ? 'border-blue-200 bg-blue-50'
                        : deduction.aiSuggested
                        ? 'border-purple-200 bg-purple-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-4">
                        {deduction.fromDocument && (
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        {deduction.aiSuggested && !deduction.fromDocument && (
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Brain className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={deduction.name}
                          onChange={(e) => updateDeduction(deduction.id, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Deduction name"
                        />
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={deduction.amount}
                            onChange={(e) => updateDeduction(deduction.id, 'amount', Number(e.target.value))}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                        <select
                          value={deduction.category}
                          onChange={(e) => updateDeduction(deduction.id, 'category', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Business">Business</option>
                          <option value="Education">Education</option>
                          <option value="Medical">Medical</option>
                          <option value="Charitable">Charitable</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removeDeduction(deduction.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                    {deduction.fromDocument && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-blue-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>From uploaded document - Ready to claim</span>
                      </div>
                    )}
                    {deduction.aiSuggested && !deduction.fromDocument && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-purple-700">
                        <Lightbulb className="w-4 h-4" />
                        <span>AI Suggested - Based on your income profile</span>
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Suggestions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Smart Deduction Suggestions</h3>
              </div>
              
              <div className="space-y-4">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{suggestion.name}</p>
                        <p className="text-sm text-gray-600">{suggestion.category} • ${suggestion.estimatedAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">{suggestion.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          const newDeduction: Deduction = {
                            id: Date.now().toString(),
                            name: suggestion.name,
                            amount: suggestion.estimatedAmount,
                            category: suggestion.category,
                            aiSuggested: true
                          };
                          setDeductions([...deductions, newDeduction]);
                          window.alert(`Added "${suggestion.name}" deduction for $${suggestion.estimatedAmount.toLocaleString()}`);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Tax Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-24">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Tax Summary</h3>
              </div>

              {isCalculating ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : calculation ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm font-medium text-blue-600">Gross Income</p>
                      <p className="text-2xl font-black text-blue-900">${calculation.grossIncome.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm font-medium text-purple-600">Taxable Income</p>
                      <p className="text-2xl font-black text-purple-900">${calculation.taxableIncome.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-xl">
                      <p className="text-sm font-medium text-red-600">Federal Tax</p>
                      <p className="text-xl font-black text-red-900">${calculation.federalTax.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-xl">
                      <p className="text-sm font-medium text-orange-600">State Tax</p>
                      <p className="text-xl font-black text-orange-900">${calculation.stateTax.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-xl">
                      <p className="text-sm font-medium text-yellow-600">FICA Tax</p>
                      <p className="text-xl font-black text-yellow-900">${calculation.ficaTax.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                      <p className="text-sm font-medium text-green-100">After-Tax Income</p>
                      <p className="text-3xl font-black">${calculation.afterTaxIncome.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Effective Rate</p>
                        <p className="text-xl font-bold text-gray-900">{calculation.effectiveRate.toFixed(1)}%</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Marginal Rate</p>
                        <p className="text-xl font-bold text-gray-900">{calculation.marginalRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      onClick={saveCalculation}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button 
                      onClick={exportCalculation}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Tax Breakdown */}
            {calculation && calculation.breakdown && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Tax Bracket Breakdown</h4>
                <div className="space-y-3">
                  {calculation.breakdown.map((bracket, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{bracket.bracket} bracket</p>
                        <p className="text-sm text-gray-600">${bracket.income.toLocaleString()} taxable</p>
                      </div>
                      <p className="font-bold text-gray-900">${bracket.tax.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;