import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
/**
 * Checks if user is a Pro member
 * @param userId user's id used to identify their content in database
 * @returns true if user is a Pro member, false otherwise including errors
 */
export async function checkSubscription(userId: string) {
  try {
    // Obtaining user info from firestore database
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    // User not in database
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    return userData.isPro || false;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
} 