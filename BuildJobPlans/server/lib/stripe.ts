import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_SUBSCRIPTION_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

// Create a conditional export based on environment variables
let stripe: Stripe | null = null;
let SUBSCRIPTION_PRICE_ID: string | null = null;

if (STRIPE_SECRET_KEY) {
  // Only initialize Stripe if the key is available
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
  });

  SUBSCRIPTION_PRICE_ID = STRIPE_SUBSCRIPTION_PRICE_ID || null;

  // Log a warning if price ID is missing
  if (!STRIPE_SUBSCRIPTION_PRICE_ID) {
    console.warn('Warning: STRIPE_SUBSCRIPTION_PRICE_ID is not set in environment variables');
  }
} else {
  console.warn('Stripe integration disabled: STRIPE_SECRET_KEY not configured');
}

export { stripe, SUBSCRIPTION_PRICE_ID };