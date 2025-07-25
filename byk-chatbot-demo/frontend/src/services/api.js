import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// チャット関連API
export const chatAPI = {
  sendMessage: async (question, userId = 'demo-user') => {
    const response = await api.post('/chat/message', { question, userId });
    return response.data;
  },
  
  getHistory: async (userId = 'demo-user') => {
    const response = await api.get(`/chat/history/${userId}`);
    return response.data;
  },
  
  // システムプロンプト関連のAPI
  getSystemPrompt: async () => {
    const response = await api.get('/chat/system-prompt');
    return response.data;
  },
  
  updateSystemPrompt: async (prompt) => {
    const response = await api.post('/chat/system-prompt', { prompt });
    return response.data;
  },
};

// ファイル関連API
export const fileAPI = {
  upload: async (file, category, tags) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category || '');
    formData.append('tags', tags || '');
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  list: async () => {
    const response = await api.get('/files/list');
    return response.data;
  },
  
  getFile: async (id) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },
  
  deleteFile: async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },
};

// 検索関連API
export const searchAPI = {
  search: async (query, category = null, limit = 20) => {
    const params = { q: query, limit };
    if (category) params.category = category;
    
    const response = await api.get('/search', { params });
    return response.data;
  },
  
  advancedSearch: async (filters) => {
    const response = await api.post('/search/advanced', filters);
    return response.data;
  },
  
  suggest: async (query) => {
    const response = await api.get('/search/suggest', { params: { q: query } });
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/search/categories');
    return response.data;
  },
};

// ヘルスチェック
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
};

export default api; 