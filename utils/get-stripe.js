import {loadStripe} from '@stripe/stripe-js';
let stripePromise;

/**
 * Loads Stripe script and initializes Stripe object
 * @returns Stripe object or error if something goes wrong (i.e. cancel payment)
 */
const getStripe = () => {
    if(!stripePromise){
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
}

export default getStripe;