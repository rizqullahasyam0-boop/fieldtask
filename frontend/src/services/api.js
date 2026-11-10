import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fieldtask-2qox.onrender.com/api', // <-- Ganti ke link Render
});

export default api;