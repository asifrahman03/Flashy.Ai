"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { CircularProgress, Alert, AlertTitle, Grid, Button } from "@mui/material";
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ResultPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const session_id = searchParams.get('session_id');

    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCheckoutSession = async () => {
            if(!session_id){
                return;
            }else{
                try{
                    const res= await fetch(`/api/checkout-session?session_id=${session_id}`);
                    const sessionData = await res.json();
                    if(res.ok){
                        setSession(sessionData);
                    }else{
                        setSession(sessionData.error);
                    }
                }catch(err){
                    setError("Error occurred in somewhere");
                }finally{
                    setLoading(false);
                }
            }
        }
        fetchCheckoutSession();
    }, [session_id]);

    const handleGoBack = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    Something went wrong — <strong>please try again later!</strong>
                </Alert>
            </div>
        );
    }

    if (session.payment_status === 'paid') {
        // Update user's subscription status in Firestore
        const updateSubscription = async () => {
            const userDocRef = doc(db, 'users', user.id);
            await updateDoc(userDocRef, {
                isPro: true,
                subscriptionDate: new Date().toISOString()
            });
        };
        
        updateSubscription().catch(console.error);

        return (
            <Grid container direction="column" alignItems="center" justifyContent="center" style={{ height: '100vh' }}>
                <Grid item>
                    <Alert severity="success">
                        <AlertTitle>Payment Successful</AlertTitle>
                        Thank you for your purchase!
                    </Alert>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={handleGoBack}>
                        Go Back
                    </Button>
                </Grid>
            </Grid>
        );
    } else {
        return (
            <Grid container direction="column" alignItems="center" justifyContent="center" style={{ height: '100vh' }}>
                <Grid item>
                    <Alert severity="error">
                        <AlertTitle>Payment Failed</AlertTitle>
                        {session.error && session.error.message ? session.error.message : 'An error occurred during payment.'}
                    </Alert>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={handleGoBack}>
                        Go Back
                    </Button>
                </Grid>
            </Grid>
        );
    }

    return null;
};

export default ResultPage;