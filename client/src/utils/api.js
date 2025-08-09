// client/src/utils/api.js - API Client for GoodPawies
import { useState, useEffect, useCallback } from 'react';
import authService from './auth';

class ApiClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
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

// Specific hooks for common operations
export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    const result = await apiClient.getUser(userId);
    
    if (result.success) {
      setProfile(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const updateProfile = async (profileData) => {
    const result = await apiClient.updateUserProfile(userId, profileData);
    
    if (result.success) {
      await fetchProfile(); // Refresh profile data
    }
    
    return result;
  };

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
};

export const useUserPets = (userId, page = 1, limit = 20) => {
  const [pets, setPets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchPets();
    }
  }, [userId, page, limit]);

  const fetchPets = async () => {
    setLoading(true);
    const result = await apiClient.getUserPets(userId, page, limit);
    
    if (result.success) {
      setPets(result.data.pets);
      setPagination(result.data.pagination);
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const createPet = async (petData) => {
    const result = await apiClient.createPet(userId, petData);
    
    if (result.success) {
      await fetchPets(); // Refresh pets list
    }
    
    return result;
  };

  return { pets, pagination, loading, error, createPet, refetch: fetchPets };
};

export const usePet = (petId) => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (petId) {
      fetchPet();
    }
  }, [petId]);

  const fetchPet = async () => {
    setLoading(true);
    const result = await apiClient.getPet(petId);
    
    if (result.success) {
      setPet(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const updatePet = async (petData) => {
    const result = await apiClient.updatePet(petId, petData);
    
    if (result.success) {
      await fetchPet(); // Refresh pet data
    }
    
    return result;
  };

  const deletePet = async () => {
    return await apiClient.deletePet(petId);
  };

  return { pet, loading, error, updatePet, deletePet, refetch: fetchPet };
};

// Example usage in components:
/*
// User Profile Component
import { useUserProfile } from './utils/api';

function UserProfile({ userId }) {
  const { profile, loading, error, updateProfile } = useUserProfile(userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleUpdateProfile = async (newData) => {
    const result = await updateProfile(newData);
    if (result.success) {
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile: ' + result.message);
    }
  };

  return (
    <div>
      <h1>{profile.fullName}</h1>
      <p>{profile.description}</p>
      // ... rest of component
    </div>
  );
}

// Pets List Component
import { useUserPets } from './utils/api';

function PetsList({ userId }) {
  const { pets, pagination, loading, error, createPet } = useUserPets(userId);

  const handleCreatePet = async (petData) => {
    const result = await createPet(petData);
    if (result.success) {
      alert('Pet created successfully!');
    }
  };

  return (
    <div>
      {pets.map(pet => (
        <div key={pet.id}>
          <h3>{pet.name}</h3>
          <p>{pet.type} - {pet.breed}</p>
        </div>
      ))}
    </div>
  );
}
*/
