// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Update this if your backend is on a different port

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const twitterApi = {
  initiateAuth: () => api.get('/api/twitter/auth'),
  handleCallback: (oauthToken, oauthVerifier) => api.get(
    `/api/twitter/callback?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`,
  ),
  getProfile: () => api.get('/api/twitter/profile'),
  sendTweet: (content) => api.post('/api/twitter/tweet', { content }),
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

export const postApi = {
  createPost: (postData) => api.post('/api/posts', postData),
  getPosts: () => api.get('/api/posts'),
  updatePost: (id, postData) => api.put(`/api/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/api/posts/${id}`),
};

export default api;
