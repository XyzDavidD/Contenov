'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, CreditCard, Calendar, Package } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClientComponentClient();
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserData(data);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setPortalLoading(true);
      setError(null);

      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Error opening billing portal:', err);
      setError(err.message || 'Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanName = (planType: string) => {
    if (planType === 'starter') return 'Starter Plan';
    if (planType === 'pro') return 'Pro Plan';
    return planType;
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      canceled: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.inactive}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Inactive'}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF1B6B]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and subscription</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          {error}
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-gray-900">{user?.user_metadata?.name || 'Not set'}</p>
          </div>
          <Separator />
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user?.email}</p>
          </div>
          <Separator />
          <div>
            <label className="text-sm font-medium text-gray-700">Account Created</label>
            <p className="mt-1 text-gray-900">{formatDate(user?.created_at || '')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <CardTitle>Subscription</CardTitle>
          </div>
          <CardDescription>Your current plan and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Current Plan</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {userData ? getPlanName(userData.plan_type) : 'Loading...'}
              </p>
            </div>
            {userData?.subscription_status && getStatusBadge(userData.subscription_status)}
          </div>
          <Separator />
          <div>
            <label className="text-sm font-medium text-gray-700">Credits Remaining</label>
            <p className="mt-1 text-2xl font-bold text-[#FF1B6B]">
              {userData?.credits_remaining ?? 0} {' '}
              <span className="text-sm font-normal text-gray-600">credits</span>
            </p>
          </div>
          {userData?.current_period_end && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {userData?.subscription_status === 'canceled' ? 'Access Until' : 'Next Billing Date'}
                </label>
                <p className="mt-1 text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(userData.current_period_end)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Billing Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Billing</CardTitle>
          </div>
          <CardDescription>
            Manage your payment method, view invoices, and update billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleManageBilling}
            disabled={portalLoading || !userData?.stripe_customer_id}
            className="w-full sm:w-auto"
          >
            {portalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening...
              </>
            ) : (
              'Manage Billing'
            )}
          </Button>
          {!userData?.stripe_customer_id && (
            <p className="mt-2 text-sm text-gray-500">
              No active subscription. Subscribe to a plan to manage billing.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

