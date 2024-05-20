import axios from 'axios';
import { Trail } from './types';

const api = axios.create({
    baseURL: 'https://maliemaxtitus.fr/',
    });


export const getAllTrail = async () => {
    const response = await api.get('/api/mantrailing/');
    console.log(response.data);
    return response.data;
}

export const saveTrail = async (trail: Trail) => {
    const response = await api.post('/api/mantrailing/save', trail);
    return response.data;
}

export const deleteTrail = async (id: string) => {
    const response = await api.post(`/api/mantrailing/delete`, {id});
    return response.data;
}

export const updateTrail = async (id:string ,trail: Trail) => {
    const response = await api.post('/api/mantrailing/update', {id,trail});
    return response.data;
}

export const connect = async (password:string) => {
    const response = await api.post('/api/mantrailing/connect',{password});
    return response.data;
}