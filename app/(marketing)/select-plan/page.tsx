'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';

export default function SelectPlanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$97',
      period: '/month',
      description: 'Perfect for individual content creators',
      features: [
        '20 brief generations per month',
        'AI-powered content analysis',
        'SEO optimization',
        'Competitor analysis',
        'Email support',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$247',
      period: '/month',
      description: 'Best for agencies and teams',
      features: [
        '100 brief generations per month',
        'AI-powered content analysis',
        'Advanced SEO optimization',
        'Deep competitor analysis',
        'Priority email support',
        'Team collaboration (coming soon)',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited brief generations',
        'Dedicated account manager',
        'Custom integrations',
        'API access',
        '24/7 phone support',
        'Custom training',
      ],
      popular: false,
      disabled: true,
    },
  ];

  const handleSelectPlan = async (planType: 'starter' | 'pro') => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      setSelectedPlan(planType);
      setError(null);

      // Call API to create Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Failed to start checkout. Please try again.');
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF1B6B]" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Start your 3-day free trial. Cancel anytime.
          </p>
          {user.email && (
            <p className="text-sm text-gray-500 mt-2">
              Logged in as: {user.email}
            </p>
          )}
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? 'border-2 border-[#FF1B6B] shadow-lg'
                  : 'border-2 border-gray-200'
              } ${plan.disabled ? 'opacity-75' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.disabled ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled
                  >
                    Contact Us
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-primary hover:opacity-90'
                        : ''
                    }`}
                    onClick={() => handleSelectPlan(plan.id as 'starter' | 'pro')}
                    disabled={loading}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Start Free Trial'
                    )}
                  </Button>
                )}

                {!plan.disabled && (
                  <p className="text-xs text-center text-gray-500">
                    3-day free trial, then {plan.price}{plan.period}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>All plans include:</p>
          <p>✓ AI-powered analysis ✓ SEO optimization ✓ No commitment ✓ Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}





