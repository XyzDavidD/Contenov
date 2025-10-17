import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/select-plan';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Get authenticated user
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Check if user exists in our custom users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .maybeSingle();

    // If user doesn't exist in users table, create them now
    if (!userData && !userError) {
      console.log('[AUTH_CALLBACK] Creating user in users table:', user.id);
      
      const { error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 
                user.user_metadata?.full_name || 
                user.email?.split('@')[0] || 
                'User',
          avatar_url: user.user_metadata?.avatar_url,
          credits_remaining: 0,
          subscription_status: 'inactive',
          plan_type: 'none',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (createError) {
        console.error('[AUTH_CALLBACK] Failed to create user:', createError);
      } else {
        console.log('[AUTH_CALLBACK] User created successfully');
      }
    }

    // Check subscription status
    if (userData?.subscription_status === 'active') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Default to plan selection
  return NextResponse.redirect(new URL(next, request.url));
}

