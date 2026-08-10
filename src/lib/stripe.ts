import Stripe from 'stripe';

// Initialise only when the secret key is present; export null otherwise so callers
// can guard against unconfigured payment providers rather than receiving a broken client.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
