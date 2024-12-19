'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';

const Appbar = ({ children }) => {
  const pathname = usePathname();
  const { isSignedIn, isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-gray-700 text-2xl font-bold">
            <span className='text-purple-600'>F</span>lashy.AI
          </Link>
          
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <NavLink href="/flashcard" active={pathname === '/flashcard'}>Create Flashcards</NavLink>
                <NavLink href="/flashcard-collections" active={pathname === '/flashcard-collections'}>Collections</NavLink>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link href="/sign-in" className="text-gray-600 hover:text-gray-900">Login</Link>
                <Link href="/sign-up" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

const NavLink = ({ href, children, active }) => {
  return (
    <Link 
      href={href} 
      className={`text-gray-600 hover:text-purple-600 transition-colors ${
        active ? 'font-bold border-b-2 border-purple-600' : ''
      }`}
    >
      {children}
    </Link>
  );
};

export default Appbar;