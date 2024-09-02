// src/services/socialMediaService.js
import Twitter from 'twitter-lite';
import Instagram from 'instagram-private-api';
import prisma from '../db/prisma.js';

const getTwitterClient = async (userId) => {
  const twitterAuth = await prisma.twitterAuth.findUnique({ where: { userId } });
  if (!twitterAuth) throw new Error('Twitter auth not found');

  return new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: twitterAuth.accessToken,
    access_token_secret: twitterAuth.refreshToken,
  });
};

const getInstagramClient = async (userId) => {
  const instagramAuth = await prisma.instagramAuth.findUnique({ where: { userId } });
  if (!instagramAuth) throw new Error('Instagram auth not found');

  const ig = new Instagram.IgApiClient();
  ig.state.generateDevice(userId);
  await ig.account.login(instagramAuth.username, instagramAuth.accessToken);
  return ig;
};

export const publishToTwitter = async (post) => {
  const client = await getTwitterClient(post.userId);
  await client.post('statuses/update', { status: post.content });
};

export const publishToInstagram = async (post) => {
  const client = await getInstagramClient(post.userId);
  await client.publish.photo({
    file: post.imageUrl,
    caption: post.content,
  });
};
