'use client';

/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { twitterApi } from '@/services/api';

const TwitterLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTwitterCallback = async (oauthToken, oauthVerifier) => {
    setIsLoading(true);
    setError(null);
    try {
      await twitterApi.handleCallback(oauthToken, oauthVerifier);
      setIsAuthenticated(true);
      router.push('/dashboard'); // Redirect to dashboard or appropriate page
    } catch (err) {
      setError('Failed to complete Twitter authentication');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const oauthToken = searchParams.get('oauth_token');
    const oauthVerifier = searchParams.get('oauth_verifier');
    if (oauthToken && oauthVerifier) {
      handleTwitterCallback(oauthToken, oauthVerifier);
    }
  }, [searchParams]);

  const initiateTwitterAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await twitterApi.initiateAuth();
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Failed to initiate Twitter authentication');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">Connect with Twitter</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isAuthenticated ? (
          <p className="text-green-600 font-semibold">Connected to Twitter</p>
        ) : (
          <Button
            onClick={initiateTwitterAuth}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Connecting...' : 'Connect Twitter Account'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TwitterLogin;
