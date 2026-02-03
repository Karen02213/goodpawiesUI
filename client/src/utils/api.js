// client/src/utils/api.js - API Client for GoodPawies
import { useState, useEffect } from 'react';
import authService from './auth';

const normalizeApiBaseUrl = (url) => {
  const fallback = 'http://localhost:5000/api';
  if (!url || typeof url !== 'string') return fallback;

  let normalized = url.trim().replace(/\/+$/, '');
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }
  return normalized;
};

class ApiClient {
  constructor() {
    this.baseURL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);
  }

  // User API methods
  async getUser(userId) {
    return await authService.apiRequest(`/users/${userId}`);
  }

  async updateUserProfile(userId, profileData) {
    return await authService.apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserPets(userId, page = 1, limit = 20) {
    return await authService.apiRequest(`/users/${userId}/pets?page=${page}&limit=${limit}`);
  }

  async createPet(userId, petData) {
    return await authService.apiRequest(`/users/${userId}/pets`, {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  }

  // Pet API methods
  async getPet(petId) {
    return await authService.apiRequest(`/pets/${petId}`);
  }

  async updatePet(petId, petData) {
    return await authService.apiRequest(`/pets/${petId}`, {
      method: 'PUT',
      body: JSON.stringify(petData),
    });
  }

  async deletePet(petId) {
    return await authService.apiRequest(`/pets/${petId}`, {
      method: 'DELETE',
    });
  }

  // Enhanced Pet Registration API methods
  async createPetEnhanced(petData) {
    return await authService.apiRequest('/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  }

  async getPetTypes() {
    try {
      const response = await fetch(`${this.baseURL}/pets/types`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  async getPetBreeds() {
    try {
      const response = await fetch(`${this.baseURL}/pets/breeds`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  async getPetGenders() {
    try {
      const response = await fetch(`${this.baseURL}/pets/genders`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  async getPetSizes() {
    try {
      const response = await fetch(`${this.baseURL}/pets/sizes`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  // QR Code API methods
  async generateQRCode(qrData) {
    return await authService.apiRequest('/qr/generate', {
      method: 'POST',
      body: JSON.stringify(qrData),
    });
  }

  getQRCodeImageUrl(filename) {
    return `${this.baseURL}/qr/image/${filename}`;
  }

  // Session management
  async getSessions() {
    return await authService.apiRequest('/auth/sessions');
  }

  async revokeSession(sessionId) {
    return await authService.apiRequest(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  // Chat API methods
  async sendChatMessage(messages, petId = null) {
    return await authService.apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, petId }),
    });
  }

  async getChatStatus() {
    return await authService.apiRequest('/chat/status');
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;

// React Hooks for API operations
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      
      if (!result.success) {
        setError(result.error || 'API_ERROR');
        return result;
      }
      
      return result;
    } catch (err) {
      setError('NETWORK_ERROR');
      return { success: false, error: 'NETWORK_ERROR' };
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};

// Custom hooks for pet dropdown data
export const usePetDropdowns = () => {
  const [breeds, setBreeds] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all dropdown data in parallel
        const [breedsData, typesData, gendersData, sizesData] = await Promise.all([
          apiClient.getPetBreeds(),
          apiClient.getPetTypes(),
          apiClient.getPetGenders(),
          apiClient.getPetSizes()
        ]);
        
        setBreeds(breedsData.breeds || []);
        setPetTypes(typesData.types || []);
        setGenders(gendersData.genders || []);
        setSizes(sizesData.sizes || []);
        
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
        setError('Failed to load dropdown data');
        setBreeds([]);
        setPetTypes([]);
        setGenders([]);
        setSizes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDropdownData();
  }, []);

  return { breeds, petTypes, genders, sizes, loading, error };
};

// Custom hook for pet registration
export const usePetRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPet = async (petData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.createPetEnhanced(petData);
      
      if (!result.success) {
        setError(result.message || 'Error al registrar la mascota');
        return result;
      }
      
      return result;
    } catch (err) {
      console.error('Error creating pet:', err);
      setError('Error al registrar la mascota');
      return { success: false, error: 'NETWORK_ERROR' };
    } finally {
      setLoading(false);
    }
  };

  return { createPet, loading, error };
};
