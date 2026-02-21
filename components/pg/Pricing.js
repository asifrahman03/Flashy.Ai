"use client";
import getStripe from '../../utils/get-stripe';
import { useUser, useAuth } from '@clerk/nextjs'; // Import useUser and useAuth from Clerk

const PricingCard = ({ tier, price, features, onClick }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 m-4 flex flex-col justify-between transition-transform duration-300 hover:scale-105">
    <div>
      <h3 className="text-2xl font-bold text-purple-600 mb-4">{tier}</h3>
      <p className="text-4xl font-bold mb-6">{price}</p>
      <ul className="text-gray-600 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
    <button onClick={onClick} className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition duration-300 text-center">
      Get Started
    </button>
  </div>
);

// Ensure we're only passing serializable data
const handleCheckoutSession = async (token) => {
  try {
    const response = await fetch('/api/checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Checkout session creation failed');
    }
    
    return data;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

/**
 * Handles transaction of user buying Pro subscription
 * @returns Stripe window for payment
 */
const Pricing = () => {
  const { user } = useUser(); // Get the user object
  const { getToken } = useAuth(); // Get the getToken function from useAuth

  const handleSubmit = async () => {
    if (!user) {
      console.error("User is not authenticated");
      return; // Exit if the user is not authenticated
    }

    try {
      const token = await getToken();
      const sessionData = await handleCheckoutSession(token);
      
      const stripe = await getStripe();
      await stripe.redirectToCheckout({
        sessionId: sessionData.id
      });
    } catch (error) {
      console.error('Payment error:', error);
    }
  }
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Choose Your Plan</h2>
        {!user && (
          <p className="text-red-500 text-center mb-4">
            You must be logged in to access payment for the Pro tier.
          </p>
        )}
        <div className="flex flex-col md:flex-row justify-center items-stretch">
          <PricingCard
            tier="Basic"
            price="Free"
            features={[
              "Save 10 collections",
              "Basic features"
            ]}
          />
          <PricingCard onClick={handleSubmit}
            tier="Pro"
            price="$1/month"
            features={[
              "Unlimited flashcards",
              "Unlimited collections",
              "Advanced features"
            ]}
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;