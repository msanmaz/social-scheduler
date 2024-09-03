'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RedirectAfterAuth = () => {
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const screenName = searchParams.get('screenName');
    const userId = searchParams.get('userId');
    const errorMessage = searchParams.get('message');

    if (status === 'success') {
      setIsSuccess(true);
      setMessage(`Successfully authenticated with Twitter as ${screenName}`);
      // Here you might want to store the screenName and userId in your app's state or context
      // For example:
      // localStorage.setItem('twitterScreenName', screenName);
      // localStorage.setItem('userId', userId);
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } else if (status === 'error') {
      setIsSuccess(false);
      setMessage(errorMessage || 'An error occurred during Twitter authentication');
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">Twitter Authentication</h1>
        {message && (
          <Alert variant={isSuccess ? "default" : "destructive"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {isSuccess && (
          <p className="mt-4 text-center text-gray-600">
            Redirecting to dashboard...
          </p>
        )}
      </div>
    </div>
  );
};

export default RedirectAfterAuth;