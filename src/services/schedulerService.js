// src/services/schedulerService.js
import cron from 'node-cron';
import prisma from '../db/prisma.js';
import redisClient from '../config/redis.js';
import { publishToTwitter, publishToInstagram } from './socialMediaService.js';

const schedulePost = async (postId, scheduleTime) => {
  const job = cron.schedule(scheduleTime, async () => {
    const post = await prisma.scheduledPost.findUnique({ where: { id: postId } });
    if (!post) return;

    try {
      if (post.platform === 'twitter') {
        await publishToTwitter(post);
      } else if (post.platform === 'instagram') {
        await publishToInstagram(post);
      }

      await prisma.scheduledPost.update({
        where: { id: postId },
        data: { status: 'published' },
      });
    } catch (error) {
      console.error(`Failed to publish post ${postId}:`, error);
      await prisma.scheduledPost.update({
        where: { id: postId },
        data: { status: 'failed' },
      });
    }
  });

  await redisClient.set(`job:${postId}`, job.toString());
};

const cancelScheduledPost = async (postId) => {
  const jobString = await redisClient.get(`job:${postId}`);
  if (jobString) {
    const job = cron.schedule(jobString);
    job.stop();
    await redisClient.del(`job:${postId}`);
  }
};

export { schedulePost, cancelScheduledPost };
