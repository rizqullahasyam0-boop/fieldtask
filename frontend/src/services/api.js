import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fieldtask-2qox.onrender.com/api',
});

export default api;