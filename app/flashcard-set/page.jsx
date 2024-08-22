'use client';
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from '../../firebase';
import { doc, collection, getDocs } from "firebase/firestore";
import Link from 'next/link';
import Appbar from "../../components/pg/Appbar";
import styles from './FlashcardSet.module.css'; // You'll need to create this CSS module

const FlashcardSet = () => {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [setName, setSetName] = useState("");
    const [currentCard, setCurrentCard] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const searchParams = useSearchParams();
    const name = searchParams.get('name');

    useEffect(() => {
        async function getFlashcardSet() {
            if (!user || !name) return;
            
            const userDocRef = doc(db, 'users', user.id);
            const collectionRef = collection(userDocRef, name);
            const cardsSnap = await getDocs(collectionRef);
            
            setFlashcards(cardsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setSetName(name);
        }

        if (isLoaded && isSignedIn) {
            getFlashcardSet();
        }
    }, [isLoaded, isSignedIn, user, name]);

    if (!isLoaded || !isSignedIn) {
        return <div>Loading...</div>;
    }

    const handleCardFlip = () => setFlipped(!flipped);

    const handleNextCard = () => {
        setCurrentCard((prev) => (prev + 1) % flashcards.length);
        setFlipped(false);
    };

    const handlePreviousCard = () => {
        setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        setFlipped(false);
    };

    return (
        <Appbar>
            <section className="min-h-screen flex flex-col justify-center py-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mb-8">
                        <Link 
                            href="/flashcard-collections"
                            className="text-purple-600 hover:text-purple-700 font-semibold"
                        >
                            ← Back to Collections
                        </Link>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-8 text-center">
                        {setName} <span className="text-purple-600">Flashcards</span>
                    </h1>
                    
                    {flashcards.length === 0 ? (
                        <div className="text-center">
                            <p className="text-lg md:text-xl text-gray-600 mb-6">This flashcard set is empty.</p>
                        </div>
                    ) : (
                        <div className={styles.flashcardContainer}>
                            <div
                                className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`}
                                onClick={handleCardFlip}
                            >
                                <div className={styles.front}>
                                    <div className={styles.content}>{flashcards[currentCard].front}</div>
                                </div>
                                <div className={styles.back}>
                                    <div className={styles.content}>{flashcards[currentCard].back}</div>
                                </div>
                            </div>
                            <div className={styles.navigationButtons}>
                                <button
                                    onClick={handlePreviousCard}
                                    className={styles.navButton}
                                >
                                    &lt;
                                </button>
                                <span className={styles.cardCount}>
                                    {currentCard + 1} / {flashcards.length}
                                </span>
                                <button
                                    onClick={handleNextCard}
                                    className={styles.navButton}
                                >
                                    &gt;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Appbar>
    );
};

export default FlashcardSet;