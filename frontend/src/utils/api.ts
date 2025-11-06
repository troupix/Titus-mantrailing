import axios from 'axios';
import { Trail, HikingTrail, MantrailingTrail, MantrailingTrailPayload } from '../types/trail';
import { User, Dog, LoginCredentials, RegisterData } from './types';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Hike API
export const createHike = async (hikeData: HikingTrail) => {
    const response = await api.post('/api/hike', hikeData);
    return response.data;
};

export const getHikes = async (): Promise<HikingTrail[]> => {
    const response = await api.get<HikingTrail[]>('/api/hike/');
    return response.data;
};

export const getHikeById = async (id: string): Promise<HikingTrail> => {
    const response = await api.get<HikingTrail>(`/api/hike/${id}`);
    return response.data;
};

export const updateHike = async (id: string, hikeData: Partial<HikingTrail>) => {
    const payload = { ...hikeData };
    if (payload.userTrack === undefined) payload.userTrack = null;
    if (payload.dogTrack === undefined) payload.dogTrack = null;

    const response = await api.put(`/api/hike/${id}`, payload);
    return response.data;
};

export const deleteHike = async (id: string) => {
    const response = await api.delete(`/api/hike/${id}`);
    return response.data;
};

// Trail API
export const getAllTrail = async (): Promise<Trail[]> => {
    const trailResponse = (await api.get<MantrailingTrail[]>('/api/mantrailing/')).data;
    const hikeResponse = await getHikes();
    const mantrailingTrails = trailResponse.map(t => ({ ...t, category: 'mantrailing' as const }));
    const hikingTrails = hikeResponse.map(h => ({ ...h, category: 'hiking' as const }));
    const response = [...mantrailingTrails, ...hikingTrails];
    return response;
}

export const getTrails = async (): Promise<Trail[]> => {
    const trailResponse = (await api.get<MantrailingTrail[]>('/api/mantrailing/')).data;
    return trailResponse;
}

export const saveTrail = async (trail: Trail | MantrailingTrailPayload) => {
    const response = await api.post('/api/mantrailing/save', trail);
    return response.data;
}

export const deleteTrail = async (id: string) => {
    const response = await api.post(`/api/mantrailing/delete`, { id });
    return response.data;
}

export const updateTrail = async (id: string, trail: Trail | MantrailingTrailPayload) => {
    const payload = { ...trail };
    if (isMantrailingTrail(payload)) {
        if (payload.dogTrace === undefined) payload.dogTrace = null;
        if (payload.runnerTrace === undefined) payload.runnerTrace = null;
    }
    const response = await api.post('/api/mantrailing/update', { id, trail: payload });
    return response.data;
}

function isMantrailingTrail(trail: Trail | MantrailingTrailPayload): trail is MantrailingTrail {
    return trail.category === "mantrailing";
}

// User API
export const login = async (credentials: LoginCredentials): Promise<{ token: string, user: User }> => {
    const response = await api.post('/api/user/login', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
};

export const register = async (data: RegisterData): Promise<{ token: string }> => {
    const response = await api.post('/api/user/register', data);
    localStorage.setItem('token', response.data.token);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const checkAuth = async (): Promise<User> => {
    const response = await api.get('/api/user/check');
    return response.data;
};

export const getCurrentUser = async (): Promise<User | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }
    try {
        const user = await checkAuth();
        return user;
    } catch (error) {
        console.error("Failed to get current user:", error);
        return null;
    }
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/api/user/${id}`, updates);
    return response.data;
};

export const uploadProfilePicture = async (formData: FormData) => {
    const response = await api.post('/api/user/picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const uploadDogProfilePhoto = async (formData: FormData): Promise<{ url: string }> => {
    const response = await api.post('/api/dogs/upload-profile-photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateDogPresentation = async (id: string, formData: FormData): Promise<Dog> => {
    const response = await api.put<Dog>(`/api/dogs/${id}/presentation`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Dog API
export const createDog = async (dogData: Omit<Dog, '_id' | 'createdAt' | 'legend' | 'presentation' | 'profilePhoto' | 'presentationPhoto'>): Promise<Dog> => {
    const response = await api.post<Dog>('/api/dogs', dogData);
    return response.data;
};

export const getDogs = async (): Promise<Dog[]> => {
    const response = await api.get<Dog[]>('/api/dogs');
    return response.data;
};

export const getDogById = async (id: string): Promise<Dog> => {
    const response = await api.get<Dog>(`/api/dogs/${id}`);
    return response.data;
};

export const updateDog = async (id: string, updates: Partial<Dog>): Promise<Dog> => {
    const response = await api.put<Dog>(`/api/dogs/${id}`, updates);
    return response.data;
};

export const deleteDog = async (id: string): Promise<void> => {
    await api.delete(`/api/dogs/${id}`);
};

export const uploadHikePhotos = async (id: string, formData: FormData): Promise<string[]> => {
    const response = await api.post(`/api/hike/${id}/photos`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}