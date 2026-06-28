import axios from 'axios';
import { Platform } from 'react-native';

// Set backend target URL based on Platform environment
// In React Native development, localhost/127.0.0.1 points to the mobile device loopback,
// so for Android simulators we route to 10.0.2.2.
let BASE_URL = 'http://localhost:5000/api';

if (Platform.OS === 'android') {
  BASE_URL = 'http://10.0.2.2:5000/api';
}

// Fallback to Render production URL when built/hosted
if (process.env.NODE_ENV === 'production') {
  BASE_URL = 'https://jersey-customizer-backend-8ipc.onrender.com/api';
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const designService = {
  save: async (designData) => {
    const response = await api.post('/designs', designData);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/designs/${id}`);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/designs');
    return response.data;
  },
};

export const orderService = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};

export const uploadService = {
  uploadLogo: async (fileUri, fileName) => {
    const formData = new FormData();
    formData.append('logo', {
      uri: fileUri,
      name: fileName || 'logo.png',
      type: 'image/png',
    });

    const response = await axios.post(`${BASE_URL}/upload/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadFont: async (fileUri, fileName) => {
    const formData = new FormData();
    formData.append('font', {
      uri: fileUri,
      name: fileName || 'font.ttf',
      type: 'font/ttf',
    });

    const response = await axios.post(`${BASE_URL}/upload/font`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const authService = {
  loginWithGoogle: async (token) => {
    const response = await api.post('/auth/google', { token });
    return response.data;
  }
};

export default api;
