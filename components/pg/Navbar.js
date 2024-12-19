import Link from 'next/link';
import './MainSection.css';
const Navbar = () => (
  <header className="bg-white shadow-md py-4">
    <nav className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          <span className="text-purple-600">F</span>lashy.AI
        </Link>
        <ul className="flex flex-wrap justify-center space-x-4 md:space-x-6 mb-4 md:mb-0">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/#pricing">Product</Link></li>
        </ul>
        <div className="flex space-x-4">
          <Link href="/sign-in" className="px-4 py-2 text-gray-600 hover:text-gray-900">Login</Link>
          <Link href="/sign-up" className="btn bg-[#D9D8EE] text-black py-2 px-4 rounded-lg shadow-lg font-bold hover:bg-purple-300 transition-transform duration-300 transform hover:scale-105">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  </header>
);

export default Navbar;