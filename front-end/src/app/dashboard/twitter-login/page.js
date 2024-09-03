import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TwitterLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleTwitterCallback = async (oauthToken, oauthVerifier) => {
    setIsLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line max-len
      const response = await axios.get(`/api/twitter/callback?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Handle successful authentication
      console.log('Twitter authentication successful:', response.data);
      navigate('/dashboard'); // Redirect to dashboard or appropriate page
    } catch (err) {
      setError('Failed to complete Twitter authentication');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const oauthToken = urlParams.get('oauth_token');
    const oauthVerifier = urlParams.get('oauth_verifier');

    if (oauthToken && oauthVerifier) {
      handleTwitterCallback(oauthToken, oauthVerifier);
    }
  }, [location]);

  const initiateTwitterAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/twitter/auth', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
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
        <Button
          onClick={initiateTwitterAuth}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Connecting...' : 'Connect Twitter Account'}
        </Button>
      </div>
    </div>
  );
};

export default TwitterLogin;
