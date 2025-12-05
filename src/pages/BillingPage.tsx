import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  current: boolean;
}

interface UsageData {
  feature: string;
  used: number;
  limit: number;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '3 sessions per month',
      'Basic meditation content',
      'Email support',
    ],
    current: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    features: [
      'Unlimited sessions',
      'All content library',
      'Priority support',
      'Progress tracking',
      'Therapist collaboration',
    ],
    current: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    features: [
      'Everything in Pro',
      'Custom content',
      'Dedicated support',
      'API access',
      'Team management',
      'HIPAA compliance',
    ],
    current: false,
  },
];

const BillingPage: React.FC = () => {
  const [_currentPlan, _setCurrentPlan] = useState('free');
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setUsage([
        { feature: 'Sessions', used: 2, limit: 3 },
        { feature: 'Storage', used: 150, limit: 500 },
        { feature: 'API Calls', used: 45, limit: 100 },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true);
    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'create-checkout',
          productId: planId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-slate-200 mb-2">Billing & Subscription</h1>
          <p className="text-slate-400">Manage your plan and usage</p>
        </div>

        {/* Current Plan Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-teal-600/20 to-violet-600/20 rounded-2xl border border-teal-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Current Plan</p>
              <h2 className="text-2xl font-semibold text-slate-200">Free Plan</h2>
              <p className="text-slate-400 mt-1">3 sessions per month</p>
            </div>
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={isUpgrading}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-violet-600 hover:from-teal-500 hover:to-violet-500 text-white rounded-lg transition-all font-medium disabled:opacity-50"
            >
              {isUpgrading ? 'Processing...' : 'Upgrade Plan'}
            </button>
          </div>
        </div>

        {/* Usage */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-slate-200 mb-4">Usage This Month</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-3 py-8 text-center">
                <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              usage.map((item) => (
                <div key={item.feature} className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-300 font-medium">{item.feature}</h3>
                    <span className="text-sm text-slate-500">
                      {item.used} / {item.limit}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.used / item.limit > 0.8
                          ? 'bg-red-500'
                          : item.used / item.limit > 0.5
                          ? 'bg-amber-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${(item.used / item.limit) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {Math.round((item.used / item.limit) * 100)}% used
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-xl font-medium text-slate-200 mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl border transition-all ${
                  plan.current
                    ? 'bg-teal-600/10 border-teal-500/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                {plan.current && (
                  <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-teal-500/20 text-teal-400 rounded-full">
                    Current Plan
                  </span>
                )}
                <h3 className="text-xl font-semibold text-slate-200 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-200">${plan.price}</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                      <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isUpgrading}
                    className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    {isUpgrading ? 'Processing...' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <div className="mt-8">
          <h2 className="text-xl font-medium text-slate-200 mb-4">Billing History</h2>
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-8 text-center text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No billing history yet</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;
