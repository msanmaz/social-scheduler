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

export const handleTwitterCallback = async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  const { userId } = req.user;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).json({ error: 'Missing required OAuth parameters' });
  }

  try {
    const result = await handleCallback(oauth_token, oauth_verifier);
    res.json({
      success: true,
      message: 'Twitter authentication successful',
      data: {
        screenName: result.screenName,
      },
    });
  } catch (error) {
    logger.error('Error handling Twitter callback:', error);
    res.status(500).json({ error: 'Failed to complete Twitter authentication' });
  }
};
