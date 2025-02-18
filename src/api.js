import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://your-backend.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;
