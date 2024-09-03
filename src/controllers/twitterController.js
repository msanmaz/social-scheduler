/* eslint-disable camelcase */
import {
  getTwitterAuthUrl, handleTwitterCallback as handleCallback,
  verifyTwitterCredentials, sendTweet as postTweet,
}
  from '../services/twitterAuthService.js';
import logger from '../utils/logger.js';

export const initiateTwitterAuth = async (req, res) => {
  try {
    const authUrl = await getTwitterAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    logger.error('Error initiating Twitter auth:', error);
    res.status(500).json({ message: 'Error initiating Twitter authentication' });
  }
};

export const sendTweet = async (req, res) => {
  try {
    const { content } = req.body;
    const { userId } = req.user;
    const result = await postTweet(userId, content);
    res.json({ message: 'Tweet sent successfully', tweet: result });
  } catch (error) {
    logger.error('Error sending tweet:', error);
    res.status(500).json({ message: 'Error sending tweet' });
  }
};

export const getTwitterUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const profile = await verifyTwitterCredentials(userId);
    res.json(profile);
  } catch (error) {
    logger.error('Error fetching Twitter profile:', error);
    res.status(500).json({ message: 'Error fetching Twitter profile' });
  }
};

export const handleTwitterCallbackController = async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  const { id: userId } = req.user;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).json({ error: 'Missing required OAuth parameters' });
  }

  try {
    const result = await handleCallback(userId, oauth_token, oauth_verifier);

    // Construct the frontend URL with query parameters
    const frontendUrl = new URL(process.env.FRONTEND_URL);
    frontendUrl.pathname = '/auth/twitter/callback'; // Adjust this path as needed
    frontendUrl.searchParams.append('status', 'success');
    frontendUrl.searchParams.append('screenName', result.screenName);
    frontendUrl.searchParams.append('userId', userId);

    // Redirect to the frontend
    res.redirect(frontendUrl.toString());
  } catch (error) {
    logger.error('Error handling Twitter callback:', error);

    // Redirect to frontend with error information
    const frontendUrl = new URL(process.env.FRONTEND_URL);
    frontendUrl.pathname = '/auth/twitter/callback'; // Adjust this path as needed
    frontendUrl.searchParams.append('status', 'error');
    frontendUrl.searchParams.append('message', 'Failed to complete Twitter authentication');

    res.redirect(frontendUrl.toString());
  }
};
