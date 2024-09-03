import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED_ROUTES = ['/dashboard'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

const JWT_SECRET = new Uint8Array(Buffer.from(process.env.JWT_SECRET, 'base64'));

console.log('Middleware JWT_SECRET length:', JWT_SECRET.length);
console.log('Middleware JWT_SECRET first 10 bytes:', Buffer.from(JWT_SECRET).slice(0, 10).toString('hex'));

async function verifyToken(token) {
  try {
    console.log('Attempting to verify token:', token);
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    console.log('Token verified successfully');
    console.log('Decoded payload:', payload);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    console.error('Error details:', error);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log('All cookies:', request.cookies);
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
