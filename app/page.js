import Navbar from '../components/pg/Navbar';
import MainSection from '../components/pg/MainSection';
import Footer from '../components/pg/Footer';
import Banner from '../components/pg/Banner';
import Pricing from '../components/pg/Pricing';

export default function Home() {
  return (
    <div className="flex-grow bg-gradient-to-br from-blue-50 to-pink-50 relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <MainSection />
        <Banner />
        <Pricing />
        <Footer />
      </div>
    </div>
  );
}