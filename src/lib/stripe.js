import { loadStripe } from '@stripe/stripe-js';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise;
export const getStripe = () => {
  if (!stripePromise && STRIPE_KEY && STRIPE_KEY !== 'YOUR_STRIPE_KEY') {
    stripePromise = loadStripe(STRIPE_KEY);
  }
  return stripePromise;
};
