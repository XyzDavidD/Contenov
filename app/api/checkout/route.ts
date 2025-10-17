import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover' as any,
});

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get plan type from request body
    const { planType } = await request.json();

    if (!planType || (planType !== 'starter' && planType !== 'pro')) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Get price ID based on plan type
    const priceId = planType === 'starter'
      ? process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      console.error('Missing Stripe price ID for plan:', planType);
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 3,
        metadata: {
          userId: user.id,
          planType: planType,
        },
      },
      metadata: {
        userId: user.id,
        planType: planType,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/select-plan`,
      allow_promotion_codes: true,
    });

    console.log('[CHECKOUT] Created session:', session.id, 'for user:', user.id);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[CHECKOUT] Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

