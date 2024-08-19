import Image from "next/image";
import React from 'react'
import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Grid,
} from "@mui/material";
import Head from "next/head";
import Link from 'next/link'

export default function Home() {
  return (
    <Container maxWidth="">
      <Head>
        <title gutterBottom>FlashCard Saas</title>
        <meta name="description" content="create flashcard from your text" />
      </Head>

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }} >
            FlashCard saas
          </Typography>
        </Toolbar>
        <SignedOut>
          <Button color="inherit" href="/sign-in" >Login</Button>
          <Button color="inherit" href="/sign-up">Sign Up</Button>
        </SignedOut>
        <SignedIn>
          <UserButton>UserName</UserButton>
        </SignedIn>
      </AppBar>
      <Box textAlign={"center"}>
        <Typography variant="h2">Welcome to flashcard saas</Typography>
        <Typography variant="h5">
          {''}
          The Easiest way to make flashcards from Scratch
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Get Started
        </Button>
      </Box>

      <Box sx={{ my: 6 }}>
        <Typography variant="h4" gutterBottom>Features</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Easy Text Input</Typography>
            <Typography>
              {''} Simply input your text and let our software do the rest.
              Creating Flashcards has never been easier.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Smart Flashcards</Typography>
            <Typography>
              {''} Our AI intelligently breaks down your text into concise
              flashcards, perfect for studying.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Access Anywhere</Typography>
            <Typography>
              {''} Access your flashcards from any device at any time.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ my: 6, textAlign: "center" }}>
        <Typography variant="h4">Pricing</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6">Basic Plan</Typography>
              <Typography variant="h6" gutterBottom>$1 a month</Typography>
              <Typography>
                {''} Access to basic flash card features and limited storage.
                
              </Typography>
              <Button variant="contained" color="primary"  sx={{margin: 2}}>Choose basic</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6">Pro Plan</Typography>
              <Typography variant="h6" gutterBottom>$3 a month</Typography>
              <Typography>
                {''} More storage and access
              </Typography>
              <Button variant="contained" color="primary" sx={{margin: 2}} >Choose Pro</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6">Enterprise Plan</Typography>
              <Typography variant="h6" gutterBottom>$5 a month</Typography>
              
              <Typography>
                {''} Access your flashcards from any device at any time. Unlimited storage
              </Typography>
              <Button variant="contained" color="primary" sx={{margin: 2}}>Choose Enterprise</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
