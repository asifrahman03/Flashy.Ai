import { SignedIn, SignedOut, SignIn} from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function SignInPage() {
  return (
    <>
      <SignedIn>
        {redirect('/flashcard')}
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center w-full h-screen">
          <SignIn afterSignInUrl="/flashcard" />
        </div>
      </SignedOut>
    </>
  );
}