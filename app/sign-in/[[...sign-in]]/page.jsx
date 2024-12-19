"use client";
import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  return (
    <>
      <SignedIn>
        <div className="flex items-center justify-center w-full h-screen">
          <p>Redirecting...</p>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center w-full h-screen">
          <SignIn afterSignInUrl="/flashcard" />
        </div>
      </SignedOut>
    </>
  );
}
