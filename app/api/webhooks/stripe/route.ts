import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover' as any,
});

// Initialize Supabase admin client (service role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  console.log('[WEBHOOK] ========================================');
  console.log('[WEBHOOK] Webhook received at:', new Date().toISOString());
  
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('[WEBHOOK] ❌ No signature provided');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[WEBHOOK] ❌ STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('[WEBHOOK] ✅ Signature verified');
  } catch (err: any) {
    console.error('[WEBHOOK] ❌ Signature verification failed:', err.message);
    console.error('[WEBHOOK] Webhook secret exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  console.log('[WEBHOOK] Received event:', event.type);
  console.log('[WEBHOOK] Event ID:', event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[WEBHOOK] Checkout completed:', session.id);

        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId || !planType) {
          console.error('[WEBHOOK] Missing metadata:', { userId, planType });
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

        // Determine credits based on plan type
        const credits = planType === 'starter' ? 20 : planType === 'pro' ? 100 : 0;

        // CRITICAL FIX: Check if user exists, create if not
        const { data: existingUser, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (!existingUser && !fetchError) {
          console.log('[WEBHOOK] ⚠️  User not found in users table, creating now...');
          
          // Get user details from Supabase Auth
          const { data: authUserData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
          
          if (authError || !authUserData?.user) {
            console.error('[WEBHOOK] Failed to get auth user:', authError);
          } else {
            const authUser = authUserData.user;
            // Create user in users table
            const { error: createError } = await supabaseAdmin
              .from('users')
              .insert({
                id: userId,
                email: authUser.email,
                name: authUser.user_metadata?.name || 
                      authUser.user_metadata?.full_name || 
                      authUser.email?.split('@')[0] || 
                      'User',
                avatar_url: authUser.user_metadata?.avatar_url,
                credits_remaining: 0,
                subscription_status: 'inactive',
                plan_type: 'none',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (createError) {
              console.error('[WEBHOOK] ❌ Failed to create user:', createError);
            } else {
              console.log('[WEBHOOK] ✅ User created successfully');
            }
          }
        }

        // Now update the user with subscription details
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            plan_type: planType,
            credits_remaining: credits,
            current_period_end: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('[WEBHOOK] ❌ Error updating user:', updateError);
        } else {
          console.log(`[WEBHOOK] ✅ User ${userId} subscription activated with ${credits} credits`);
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        console.log('[WEBHOOK] Invoice payment succeeded:', invoice.id);

        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          console.log('[WEBHOOK] No subscription ID in invoice');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

        // Find user by customer ID
        const { data: userData, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('id, plan_type')
          .eq('stripe_customer_id', customerId)
          .single();

        if (fetchError || !userData) {
          console.error('[WEBHOOK] User not found for customer:', customerId);
          break;
        }

        // Reset credits based on plan type (monthly renewal)
        const credits = userData.plan_type === 'starter' ? 20 : userData.plan_type === 'pro' ? 100 : 0;

        // Update user subscription status and reset credits
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            subscription_status: 'active',
            credits_remaining: credits,
            current_period_end: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userData.id);

        if (updateError) {
          console.error('[WEBHOOK] Error updating user on renewal:', updateError);
        } else {
          console.log('[WEBHOOK] Credits reset for user:', userData.id);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        console.log('[WEBHOOK] Subscription updated:', subscription.id);

        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: userData, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (fetchError || !userData) {
          console.error('[WEBHOOK] User not found for customer:', customerId);
          break;
        }

        // Update subscription status
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            subscription_status: subscription.status,
            current_period_end: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userData.id);

        if (updateError) {
          console.error('[WEBHOOK] Error updating subscription:', updateError);
        } else {
          console.log('[WEBHOOK] Subscription status updated:', subscription.status);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[WEBHOOK] Subscription deleted:', subscription.id);

        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: userData, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (fetchError || !userData) {
          console.error('[WEBHOOK] User not found for customer:', customerId);
          break;
        }

        // Update subscription status to canceled (user keeps credits until period end)
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userData.id);

        if (updateError) {
          console.error('[WEBHOOK] Error canceling subscription:', updateError);
        } else {
          console.log('[WEBHOOK] Subscription canceled for user:', userData.id);
        }

        break;
      }

      default:
        console.log('[WEBHOOK] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    // Return 200 to acknowledge receipt even if processing fails
    return NextResponse.json({ received: true, error: error.message });
  }
}

