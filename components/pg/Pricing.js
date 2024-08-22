"use client";
import getStripe from '../../utils/get-stripe';


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

const Pricing = () => {
  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout-session', {
      method: 'POST',
      headers: {
        origin: "http://localhost:3000"
      },
    });

    const checkoutSessionJSON = await checkoutSession.json();

    if(checkoutSessionJSON.statusCode === 500){
      console.error(checkoutSession.message);
      return;
    }
    const stripe = await getStripe();
    const {error} = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJSON.id
    });

    if(error){
      console.warn(error.message);
    }
  }
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Choose Your Plan</h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch">
          <PricingCard
            tier="Basic"
            price="Free"
            features={[
              "Create 10 flashcards",
              "Save 10 collections",
              "Basic features"
            ]}
          />
          <PricingCard onClick={handleSubmit}
            tier="Pro"
            price="$10/month"
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