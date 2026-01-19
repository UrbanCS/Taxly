import { supabase } from './supabaseClient';

export class SeedService {
  static async seedSampleData(userId: string) {
    try {
      console.log('Seeding sample data for user:', userId);

      // 1. Seed sample documents with more variety
      const documents = [
        {
          user_id: userId,
          filename: 'receipt_starbucks_coffee.jpg',
          file_size: 245760,
          file_type: 'image/jpeg',
          document_type: 'Receipt',
          status: 'completed',
          amount: 12.45,
          vendor: 'Starbucks Coffee',
          transaction_date: '2025-01-15',
          category: 'Meals & Entertainment',
          confidence: 98,
          tax_deductible: true,
          receipt_type: 'business',
          processing_time: 2.3
        },
        {
          user_id: userId,
          filename: 'invoice_office_supplies_amazon.pdf',
          file_size: 512000,
          file_type: 'application/pdf',
          document_type: 'Invoice',
          status: 'completed',
          amount: 234.99,
          vendor: 'Amazon Business',
          transaction_date: '2025-01-14',
          category: 'Office Supplies',
          confidence: 96,
          tax_deductible: true,
          receipt_type: 'business',
          processing_time: 3.1
        },
        {
          user_id: userId,
          filename: 'hotel_receipt_business_trip.pdf',
          file_size: 387000,
          file_type: 'application/pdf',
          document_type: 'Receipt',
          status: 'completed',
          amount: 289.50,
          vendor: 'Marriott Hotel',
          transaction_date: '2025-01-13',
          category: 'Travel & Lodging',
          confidence: 96,
          tax_deductible: true,
          receipt_type: 'business',
          processing_time: 4.1
        },
        {
          user_id: userId,
          filename: 'gas_receipt_shell.jpg',
          file_size: 198000,
          file_type: 'image/jpeg',
          document_type: 'Receipt',
          status: 'completed',
          amount: 65.20,
          vendor: 'Shell Gas Station',
          transaction_date: '2025-01-12',
          category: 'Travel & Transport',
          confidence: 94,
          tax_deductible: true,
          receipt_type: 'business',
          processing_time: 1.8
        },
        {
          user_id: userId,
          filename: 'subscription_adobe_creative.pdf',
          file_size: 445000,
          file_type: 'application/pdf',
          document_type: 'Invoice',
          status: 'completed',
          amount: 52.99,
          vendor: 'Adobe Systems',
          transaction_date: '2025-01-11',
          category: 'Software & Technology',
          confidence: 99,
          tax_deductible: true,
          receipt_type: 'business',
          processing_time: 2.7
        },
        {
          user_id: userId,
          filename: 'utility_bill_january.pdf',
          file_size: 327000,
          file_type: 'application/pdf',
          document_type: 'Bill',
          status: 'processing',
          amount: 145.67,
          vendor: 'Comcast',
          transaction_date: '2025-01-10',
          category: 'Utilities',
          confidence: 92,
          tax_deductible: true,
          receipt_type: 'business',
          processing_time: 3.5
        },
        {
          user_id: userId,
          filename: 'conference_ticket_techsummit.pdf',
          file_size: 567000,
          file_type: 'application/pdf',
          document_type: 'Receipt',
          status: 'completed',
          amount: 499.00,
          vendor: 'Tech Summit 2025',
          transaction_date: '2025-01-09',
          category: 'Professional Development',
          confidence: 97,
          tax_deductible: true,
          receipt_type: 'business',
          processing_time: 2.9
        },
        {
          user_id: userId,
          filename: 'client_lunch_receipt.jpg',
          file_size: 276000,
          file_type: 'image/jpeg',
          document_type: 'Receipt',
          status: 'completed',
          amount: 127.50,
          vendor: 'The Capital Grille',
          transaction_date: '2025-01-08',
          category: 'Meals & Entertainment',
          confidence: 95,
          tax_deductible: true,
          receipt_type: 'business',
          processing_time: 2.1
        }
      ];

      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .insert(documents)
        .select();

      if (docsError) throw docsError;
      console.log('✅ Documents seeded:', docsData?.length);

      // 2. Seed sample alerts
      const alerts = [
        {
          user_id: userId,
          alert_type: 'deadline',
          severity: 'warning',
          title: 'Q4 Tax Filing Deadline',
          message: 'Q4 estimated tax payment due in 15 days',
          priority: 'high',
          action_required: 'Review pending documents',
          resolved: false
        },
        {
          user_id: userId,
          alert_type: 'compliance',
          severity: 'info',
          title: 'New Tax Regulation',
          message: 'IRS updated regulations for business meal deductions',
          priority: 'medium',
          action_required: 'Update tax rules',
          resolved: false
        }
      ];

      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .insert(alerts)
        .select();

      if (alertsError) throw alertsError;
      console.log('✅ Alerts seeded:', alertsData?.length);

      // 3. Seed analytics data for the last 12 months
      const analyticsData = [];
      const today = new Date();

      for (let i = 0; i < 12; i++) {
        const periodStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const periodEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

        analyticsData.push({
          user_id: userId,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          documents_processed: Math.floor(Math.random() * 50) + 20,
          documents_pending: Math.floor(Math.random() * 10),
          accuracy_rate: (Math.random() * 5 + 95).toFixed(2),
          cost_savings: Math.floor(Math.random() * 5000) + 2000,
          efficiency_score: Math.floor(Math.random() * 20) + 80,
          error_count: Math.floor(Math.random() * 5),
          active_clients: Math.floor(Math.random() * 30) + 10,
          revenue: Math.floor(Math.random() * 10000) + 5000,
          expenses: Math.floor(Math.random() * 5000) + 2000
        });
      }

      const { data: analyticsResult, error: analyticsError } = await supabase
        .from('analytics_data')
        .insert(analyticsData)
        .select();

      if (analyticsError) throw analyticsError;
      console.log('✅ Analytics data seeded:', analyticsResult?.length);

      // 4. Seed sample expenses with more variety
      const expenses = [
        {
          user_id: userId,
          amount: 3200,
          description: 'Office supplies and equipment',
          category: 'Office Supplies',
          vendor: 'Office Depot',
          transaction_date: '2025-01-10',
          tax_deductible: true
        },
        {
          user_id: userId,
          amount: 2800,
          description: 'Client meeting transportation',
          category: 'Travel & Transport',
          vendor: 'Uber',
          transaction_date: '2025-01-09',
          tax_deductible: true
        },
        {
          user_id: userId,
          amount: 1900,
          description: 'Business lunch with client',
          category: 'Meals & Entertainment',
          vendor: 'The Capital Grille',
          transaction_date: '2025-01-08',
          tax_deductible: true
        },
        {
          user_id: userId,
          amount: 4500,
          description: 'Software subscriptions and tools',
          category: 'Software & Technology',
          vendor: 'Adobe Creative Cloud',
          transaction_date: '2025-01-07',
          tax_deductible: true
        },
        {
          user_id: userId,
          amount: 6200,
          description: 'Marketing and advertising expenses',
          category: 'Marketing',
          vendor: 'Google Ads',
          transaction_date: '2025-01-06',
          tax_deductible: true
        },
        {
          user_id: userId,
          amount: 3800,
          description: 'Professional services and consulting',
          category: 'Professional Services',
          vendor: 'Legal Advisory',
          transaction_date: '2025-01-05',
          tax_deductible: true
        },
        {
          user_id: userId,
          amount: 2100,
          description: 'Business insurance payment',
          category: 'Insurance',
          vendor: 'State Farm',
          transaction_date: '2025-01-04',
          tax_deductible: true
        },
        {
          user_id: userId,
          amount: 1500,
          description: 'Utilities and internet',
          category: 'Utilities',
          vendor: 'Comcast',
          transaction_date: '2025-01-03',
          tax_deductible: true
        }
      ];

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .insert(expenses)
        .select();

      if (expensesError) throw expensesError;
      console.log('✅ Expenses seeded:', expensesData?.length);

      return {
        success: true,
        message: 'Sample data seeded successfully',
        counts: {
          documents: docsData?.length || 0,
          alerts: alertsData?.length || 0,
          analytics: analyticsResult?.length || 0,
          expenses: expensesData?.length || 0
        }
      };
    } catch (error) {
      console.error('Error seeding sample data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to seed data',
        error
      };
    }
  }

  static async clearAllData(userId: string) {
    try {
      console.log('Clearing all data for user:', userId);

      await supabase.from('documents').delete().eq('user_id', userId);
      await supabase.from('alerts').delete().eq('user_id', userId);
      await supabase.from('analytics_data').delete().eq('user_id', userId);
      await supabase.from('expenses').delete().eq('user_id', userId);
      await supabase.from('tax_calculations').delete().eq('user_id', userId);
      await supabase.from('email_accounts').delete().eq('user_id', userId);
      await supabase.from('email_documents').delete().eq('user_id', userId);
      await supabase.from('ai_conversations').delete().eq('user_id', userId);

      console.log('✅ All data cleared');
      return { success: true, message: 'All data cleared successfully' };
    } catch (error) {
      console.error('Error clearing data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to clear data',
        error
      };
    }
  }

  static async checkDataExists(userId: string) {
    try {
      const { count: docCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        hasData: (docCount || 0) > 0,
        documentCount: docCount || 0
      };
    } catch (error) {
      console.error('Error checking data:', error);
      return { hasData: false, documentCount: 0 };
    }
  }
}
