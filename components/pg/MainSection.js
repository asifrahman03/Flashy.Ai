import './MainSection.css';
import Link from 'next/link';

const MainSection = () => (
  <section className="main-section flex flex-col justify-center items-center min-h-screen px-4 py-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg shadow-lg">
    <div className="text-content max-w-3xl text-center">
      <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-center leading-tight mb-8 left_portion">
        Ready to swipe right on knowledge? 
        <img 
          src="/assets/flash-card.png" 
          className="w-12 md:w-16 inline-block align-middle m-3 left_portion" 
          alt="Flash Card"
        />
      </h1>
      <p className="text-base md:text-lg text-gray-800 mb-8 left_portion">
        Turn your notes into dynamic, unforgettable study tools. Dive into learning like never before!
      </p>
      <div className="buttons flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 justify-center right_portion">
        <Link href="#banner" className="btn bg-pink-100 text-black py-3 px-6 rounded-lg shadow-lg hover:bg-pink-300 transition-transform duration-300 transform hover:scale-105">
          How does it work?
        </Link>
        <Link href="/sign-up" className="btn bg-[#D9D8EE] text-black py-3 px-6 rounded-lg shadow-lg font-bold hover:bg-purple-300 transition-transform duration-300 transform hover:scale-105">
          Get Started
        </Link>
      </div>
    </div>
  </section>
);

export default MainSection;