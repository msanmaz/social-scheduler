import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import axios from 'axios';
import { storeTwitterCredentials } from '../models/userModel.js';
import logger from '../utils/logger.js';
import prisma from '../db/prisma.js';

const callbackUrl = process.env.TWITTER_CALLBACK_URL;

const oauth = new OAuth({
  consumer: {
    key: process.env.TWITTER_CONSUMER_KEY,
    secret: process.env.TWITTER_CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(baseString, key) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64');
  },
});

export const getTwitterAuthUrl = async () => {
  const requestData = {
    url: 'https://api.twitter.com/oauth/request_token',
    method: 'POST',
    data: {
      oauth_callback: callbackUrl,
    },
  };

  try {
    console.log('Request Data:', requestData);
    const auth = oauth.authorize(requestData);
    console.log('OAuth Authorization:', auth);
    const headers = oauth.toHeader(auth);
    console.log('Request Headers:', headers);

    const response = await axios.post(requestData.url, null, {
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Response Data:', response.data);
    const responseData = new URLSearchParams(response.data);
    const oauthToken = responseData.get('oauth_token');
    return `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`;
  } catch (error) {
    console.error(
      'Error getting Twitter auth URL:',
      error.response ? error.response.data : error.message,
    );
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
    }
    throw error;
  }
};

export const handleTwitterCallback = async (userId, oauthToken, oauthVerifier) => {
  const requestData = {
    url: 'https://api.twitter.com/oauth/access_token',
    method: 'POST',
  };

  try {
    const auth = oauth.authorize(requestData);
    const response = await axios.post(
      `${requestData.url}?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`,
      null,
      { headers: oauth.toHeader(auth) },
    );

    const responseParams = new URLSearchParams(response.data);
    const accessToken = responseParams.get('oauth_token');
    const accessTokenSecret = responseParams.get('oauth_token_secret');
    const screenName = responseParams.get('screen_name');

    await storeTwitterCredentials(userId, accessToken, accessTokenSecret, screenName);

    return {
      accessToken, accessTokenSecret, screenName, userId,
    };
  } catch (error) {
    logger.error('Error in Twitter callback:', error);
    throw new Error('Failed to complete Twitter authentication');
  }
};

export const verifyTwitterCredentials = async (accessToken, accessTokenSecret) => {
  const requestData = {
    url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
    method: 'GET',
  };

  const authHeader = oauth.toHeader(oauth.authorize(requestData, {
    key: accessToken,
    secret: accessTokenSecret,
  }));

  try {
    const response = await axios.get(requestData.url, {
      headers: authHeader,
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying Twitter credentials:', error);
    throw error;
  }
};

export const sendTweet = async (accessToken, accessTokenSecret, tweetContent) => {
  const requestData = {
    url: 'https://api.twitter.com/2/tweets',
    method: 'POST',
    data: { text: tweetContent },
  };

  const authHeader = oauth.toHeader(oauth.authorize(requestData, {
    key: accessToken,
    secret: accessTokenSecret,
  }));

  try {
    const response = await axios.post(requestData.url, requestData.data, {
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error sending tweet:', error);
    throw error;
  }
};

export const verifyOAuthToken = async (oauthToken) => {
  try {
    const authRequest = await prisma.twitterAuthRequest.findUnique({
      where: { requestToken: oauthToken },
    });

    if (!authRequest) {
      return false;
    }

    // Check if the token is not older than 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (authRequest.createdAt < fifteenMinutesAgo) {
      // Token has expired, delete it
      await prisma.twitterAuthRequest.delete({
        where: { id: authRequest.id },
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error verifying OAuth token:', error);
    throw error;
  }
};
