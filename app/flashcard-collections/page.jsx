'use client';
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { db } from '../../firebase';
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Link from 'next/link';
import Appbar from "../../components/pg/Appbar";

const FlashCardCollection = () => {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [isPro, setIsPro] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function getFlashcards() {
            if (!user) return;
            
            const userDocRef = doc(db, 'users', user.id);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const flashcardsData = userData.flashcards || [];
                setIsPro(userData.isPro || false);
                
                // Fetch the actual flashcard data for each collection
                const flashcardsWithData = await Promise.all(flashcardsData.map(async (fc) => {
                    const collectionRef = collection(userDocRef, fc.name);
                    const cardsSnap = await getDocs(collectionRef);
                    return {
                        name: fc.name,
                        cards: cardsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    };
                }));

                setFlashcards(flashcardsWithData);
            }
        }

        if (isLoaded && isSignedIn) {
            getFlashcards();
        }
    }, [isLoaded, isSignedIn, user]);

    if (!isLoaded || !isSignedIn) {
        return <div>Loading...</div>;
    }

    const handleCardClick = (name) => {
        router.push(`/flashcard-set?name=${encodeURIComponent(name)}`);
    }

    const isNearLimit = !isPro && flashcards.length >= 8; // Warning when near limit

    return (
        <Appbar>
        <section className="min-h-screen flex flex-col justify-center py-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
            <div className="container mx-auto px-4 md:px-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-8 text-center">
                    Your <span className="text-purple-600">F</span>lashcard Collections
                </h1>
                
                {!isPro && (
                    <div className="text-center mb-6">
                        <p className="text-gray-600">
                            {flashcards.length}/10 Collections Used
                        </p>
                        {isNearLimit && (
                            <p className="text-yellow-600 mt-2">
                                You&apos;re approaching the free plan limit. Upgrade to Pro for unlimited collections!
                            </p>
                        )}
                    </div>
                )}

                {flashcards.length === 0 ? (
                    <div className="text-center">
                        <p className="text-lg md:text-xl text-gray-600 mb-6">You don&apos;t have any flashcard collections yet.</p>
                        <Link 
                            href="/flashcard" 
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 md:py-3 md:px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block"
                        >
                            Create Your First Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {flashcards.map((collection) => (
                            <div 
                                key={collection.name}
                                onClick={() => handleCardClick(collection.name)}
                                className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                                <p className="text-gray-600 mb-4">{collection.cards.length} cards</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        {/* Add creation date if available */}
                                    </span>
                                    <button className="text-purple-600 hover:text-purple-700">Study Now</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {flashcards.length > 0 && (
                    <div className="text-center mt-12">
                        <Link 
                            href="/flashcard" 
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 md:py-3 md:px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block"
                        >
                            Create New Collection
                        </Link>
                    </div>
                )}
            </div>
        </section>
        </Appbar>
    );
};

export default FlashCardCollection;