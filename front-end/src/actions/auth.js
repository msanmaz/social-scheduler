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
  try {
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
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const respCookie = response.headers.get('set-cookie')?.split(';')[0].split('=')[1] || '';
    if (respCookie === '') {
      return { success: false, message: 'Not Authenticated!' };
    }

    cookies().set({
      name: 'token',
      value: respCookie,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidatePath('/dashboard');
    return { success: true, message: 'Login successful!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}