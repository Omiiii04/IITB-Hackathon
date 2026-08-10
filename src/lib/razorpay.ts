import Razorpay from 'razorpay';

// Initialise only when both keys are present; export null otherwise so callers
// can guard against unconfigured payment providers rather than receiving a broken client.
export const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;
