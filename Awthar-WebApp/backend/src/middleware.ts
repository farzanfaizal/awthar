import { NextRequest, NextResponse } from "next/server";

/**
 * Handle CORS preflight (OPTIONS) requests.
 * The actual CORS response headers are set in next.config.ts headers(),
 * but OPTIONS requests need an explicit 200 response.
 */
export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": frontendUrl,
        "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
