import axios from 'axios';
import { Trail, HikingTrail, MantrailingTrail } from '../types/trail';

const api = axios.create({
    baseURL: 'http://localhost:5000/',
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
    const response = await api.put(`/api/hike/${id}`, hikeData);
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
    console.log(response);
    return response;
}

export const getTrails = async (): Promise<Trail[]> => {
    const trailResponse = (await api.get<MantrailingTrail[]>('/api/mantrailing/')).data;
    return trailResponse;
}

export const saveTrail = async (trail: Trail) => {
    const response = await api.post('/api/mantrailing/save', trail);
    return response.data;
}

export const deleteTrail = async (id: string) => {
    const response = await api.post(`/api/mantrailing/delete`, { id });
    return response.data;
}

export const updateTrail = async (id: string, trail: Trail) => {
    const response = await api.post('/api/mantrailing/update', { id, trail });
    return response.data;
}

export const connect = async (password: string) => {
    const response = await api.post('/api/mantrailing/connect', { password });
    return response.data;
}