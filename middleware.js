import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)", "/sign-up"],
  ignoredRoutes: ["/api/firebase-token"]
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ]
};
