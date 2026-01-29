import { NextResponse } from "next/server";

// Middleware is currently disabled/open for debugging.
// To re-enable auth, uncomment the withAuth imports and logic.

export function middleware() {
    return NextResponse.next();
}

export const config = {
    // Matcher is empty to avoid running on any routes (effectively disabling it)
    matcher: [],
};
