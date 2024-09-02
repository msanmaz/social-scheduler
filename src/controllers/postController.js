// src/controllers/postController.js
import prisma from '../db/prisma.js';
import { schedulePost, cancelScheduledPost } from '../services/schedulerService.js';
import logger from '../utils/logger.js';

export const createPost = async (req, res) => {
  try {
    const { content, platform, scheduleTime } = req.body;
    const userId = req.user.userId;

    const post = await prisma.scheduledPost.create({
      data: {
        userId,
        content,
        platform,
        scheduleTime,
        status: 'pending'
      }
    });

    await schedulePost(post.id, scheduleTime);

    res.status(201).json(post);
  } catch (error) {
    logger.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
};

export const getPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const posts = await prisma.scheduledPost.findMany({
      where: { userId },
      orderBy: { scheduleTime: 'asc' }
    });
    res.json(posts);
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const post = await prisma.scheduledPost.findUnique({
      where: { id, userId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    logger.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, platform, scheduleTime } = req.body;
    const userId = req.user.userId;

    const existingPost = await prisma.scheduledPost.findUnique({
      where: { id, userId }
    });

    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (existingPost.status === 'published') {
      return res.status(400).json({ message: 'Cannot update published post' });
    }

    const updatedPost = await prisma.scheduledPost.update({
      where: { id },
      data: { content, platform, scheduleTime }
    });

    await cancelScheduledPost(id);
    await schedulePost(id, scheduleTime);

    res.json(updatedPost);
  } catch (error) {
    logger.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const existingPost = await prisma.scheduledPost.findUnique({
      where: { id, userId }
    });

    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await prisma.scheduledPost.delete({ where: { id } });
    await cancelScheduledPost(id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
};

export const getPostAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await prisma.scheduledPost.findUnique({
      where: { id, userId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Here you would integrate with the social media APIs to fetch actual analytics
    // For now, we'll return placeholder data
    const analytics = {
      likes: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 30)
    };

    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching post analytics:', error);
    res.status(500).json({ message: 'Error fetching post analytics' });
  }
};
