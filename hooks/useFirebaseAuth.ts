import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { auth, signInWithCustomToken } from '../firebase';

export function useFirebaseAuth() {
  const { user } = useUser();
  const [isFirebaseAuthed, setIsFirebaseAuthed] = useState(false);

  useEffect(() => {
    const authenticateFirebase = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/firebase-token');
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch token: ${response.status} ${text}`);
        }
        
        const data = await response.json();
        if (!data.token) {
          throw new Error('No token received from server');
        }

        await signInWithCustomToken(auth, data.token);
        setIsFirebaseAuthed(true);
      } catch (error) {
        console.error('Firebase authentication error:', error);
        setIsFirebaseAuthed(false);
      }
    };

    authenticateFirebase();
  }, [user]);

  return isFirebaseAuthed;
} 