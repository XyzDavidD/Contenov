'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Users, TrendingUp, ArrowRight, Download, Eye, Loader2 } from "lucide-react";

interface Brief {
  id: string;
  topic: string;
  created_at: string;
}

interface UserData {
  credits_remaining: number;
  plan_type: string;
  subscription_status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user data
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('credits_remaining, plan_type, subscription_status')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;
      setUserData(userInfo);

      // Fetch recent briefs (last 5)
      const { data: briefsData, error: briefsError } = await supabase
        .from('briefs')
        .select('id, topic, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (briefsError) throw briefsError;
      setBriefs(briefsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats based on real data
  const getPlanCredits = (planType: string) => {
    if (planType === 'starter') return 20;
    if (planType === 'pro') return 100;
    return 0;
  };

  const getPlanTeamMembers = (planType: string) => {
    if (planType === 'starter') return 1;
    if (planType === 'pro') return 3;
    return 0;
  };

  const totalPlanCredits = userData ? getPlanCredits(userData.plan_type) : 0;
  const briefsCreated = userData ? totalPlanCredits - userData.credits_remaining : 0;
  const creditsRemaining = userData?.credits_remaining || 0;
  const avgTimeSaved = briefsCreated > 0 ? (briefsCreated * 5.2).toFixed(1) : '0';
  const teamMembers = userData ? getPlanTeamMembers(userData.plan_type) : 0;

  const stats = [
    {
      name: "Briefs Created",
      value: briefsCreated.toString(),
      icon: FileText,
      change: `${briefsCreated} of ${totalPlanCredits} used`,
    },
    {
      name: "Credits Remaining",
      value: creditsRemaining.toString(),
      icon: Zap,
      description: `of ${totalPlanCredits} this month`,
    },
    {
      name: "Team Members",
      value: teamMembers.toString(),
      icon: Users,
      description: `${userData?.plan_type || 'No'} plan`,
    },
    {
      name: "Total Time Saved",
      value: `${avgTimeSaved}h`,
      icon: TrendingUp,
      description: `${briefsCreated} briefs × 5.2h each`,
    },
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF1B6B]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s your blog brief overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-secondary mb-1">{stat.name}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change || stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-1">Create New Brief</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a new blog content brief in minutes
                </p>
              </div>
              <Button 
                className="group"
                onClick={() => router.push('/find')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-1">View All Briefs</h3>
                <p className="text-sm text-muted-foreground">
                  Access your previously created briefs
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => router.push('/exports')}
              >
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Briefs */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">Recent Briefs</CardTitle>
        </CardHeader>
        <CardContent>
          {briefs.length > 0 ? (
            <div className="space-y-0">
              <div className="grid grid-cols-4 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground border-b">
                <div>Topic</div>
                <div>Created</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {briefs.map((brief) => (
                <div key={brief.id} className="grid grid-cols-4 gap-4 px-4 py-4 text-sm border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                  <div className="font-medium text-secondary truncate" title={brief.topic}>
                    {brief.topic}
                  </div>
                  <div className="text-muted-foreground">
                    {formatTimeAgo(brief.created_at)}
                  </div>
                  <div className="text-green-600 font-medium">Completed</div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3"
                      onClick={() => router.push(`/brief/${brief.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3"
                      onClick={() => {
                        // Export to PDF - open brief in new tab with print-friendly view
                        window.open(`/brief/${brief.id}?export=pdf`, '_blank');
                        // Trigger print dialog after brief loads
                        setTimeout(() => {
                          const printWindow = window.open(`/brief/${brief.id}?print=true`, '_blank');
                          if (printWindow) {
                            printWindow.onload = () => {
                              printWindow.print();
                            };
                          }
                        }, 500);
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No briefs created yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first brief to get started
              </p>
              <Button onClick={() => router.push('/find')}>
                Create Brief
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

