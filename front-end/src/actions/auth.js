'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function registerUser(formData) {
  const username = formData.get('username');
  const email = formData.get('email');
  const password = formData.get('password');

  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  const user = await response.json();
  console.log('USER: ', user);
  redirect('/auth/login');
}

export async function loginUser(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  const user = await response.json();
  cookies().set({
    name: 'token',
    value: user.token,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  // revalidatePath('/dashboard');
  return { success: true, message: 'Login successful!' };
}
