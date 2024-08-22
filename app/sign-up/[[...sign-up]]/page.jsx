import { SignedIn, SignedOut, SignUp} from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function SignUpPage() {
  return (
    <>
      <SignedIn>
        {redirect('/flashcard')}
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center w-full h-screen">
          <SignUp afterSignUpUrl="/flashcard" />
        </div>
      </SignedOut>
    </>
  );
}