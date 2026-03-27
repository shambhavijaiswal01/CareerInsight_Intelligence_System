import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// We MUST export this to help Vercel/Inngest talk to each other
export const runtime = 'nodejs';

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/inngest(.*)", // Use (.*) to ensure all sub-paths are public
]);

export default clerkMiddleware(async (auth, req) => {
  // Check if it's a public route FIRST
  if (isPublicRoute(req)) {
    return; // Do nothing, let the request pass
  }
  
  // Otherwise, protect the route
  await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};