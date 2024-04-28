import axios, { AxiosInstance } from 'axios';
import { Trail } from './types';
// {
//     _id: {
//         type: mongoose.Schema.Types.ObjectId,
//         auto: true
//     },
//     dogName: {
//         type: String,
//         required: true
//     },
//     handlerName: {
//         type: String,
//         required: true
//     },
//     distance: {
//         type: Number,
//         required: false
//     },
//     location: {
//         type: String,
//         required: false
//     },
//     date: {
//         type: Date,
//         default: Date.now
//     },
//     duration: {
//         type: Number,
//         required: false
//     },
//     notes: {
//         type: String,
//         default: '',
//         required: false
//     },
//     trailType: {
//         type: String,
//         required: false
//     },
//     startType: {
//         type: Boolean,
//         required: false
//     }
// }



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