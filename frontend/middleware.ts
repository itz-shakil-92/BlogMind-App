import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define protected routes
  const protectedRoutes = ["/profile"]

  // Check if the path starts with any protected route
  const isProtectedRoute = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`))

  // Get the token from cookies
  const token = request.cookies.get("token")?.value

  // If it's a protected route and there's no token, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", path)
    return NextResponse.redirect(url)
  }

  // If it's a login/signup page and user is already logged in, redirect to profile
  if ((path === "/login" || path === "/signup") && token) {
    return NextResponse.redirect(new URL("/profile", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/profile/:path*", "/login", "/signup"],
}

