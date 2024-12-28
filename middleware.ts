import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';


export default clerkMiddleware((req, res) => {
    // Example of setting a custom cookie
    const response = NextResponse.next();

    // Setting the cookie using headers
    response.headers.set('Set-Cookie', 'my-custom-cookie=value; SameSite=None; Secure');

    return response;
});

export const config = {
    matcher: '/((?!api|_next|.*\\..*).*)',
};