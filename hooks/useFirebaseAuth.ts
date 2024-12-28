import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { auth, signInWithCustomToken } from '../firebase';

export function useFirebaseAuth() {
  const { user } = useUser();
  const [isFirebaseAuthed, setIsFirebaseAuthed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const authenticateFirebase = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/firebase-token');
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Token fetch error:', errorData);
          throw new Error(`Failed to fetch token: ${response.status} ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        if (!data.token) {
          throw new Error('No token received from server');
        }

        await signInWithCustomToken(auth, data.token);
        setIsFirebaseAuthed(true);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Firebase authentication error:', error);
        setIsFirebaseAuthed(false);
        
        // Implement retry logic
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff
        }
      }
    };

    authenticateFirebase();
  }, [user, retryCount]);

  return isFirebaseAuthed;
} 