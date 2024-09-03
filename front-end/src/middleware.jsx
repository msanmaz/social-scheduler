import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];
const API_VERIFY_TOKEN_URL = 'http://localhost:3000/auth/verify-token';

async function verifyToken(token) {
  try {
    const response = await fetch(API_VERIFY_TOKEN_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Token verification failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  let verifiedUser = null;

  if (token) {
    verifiedUser = await verifyToken(token);
  }

  // Handle protected routes (dashboard)
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!verifiedUser) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  // Handle auth routes (login, register)
  if (AUTH_ROUTES.includes(pathname) && verifiedUser) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [...PROTECTED_ROUTES, ...AUTH_ROUTES],
};