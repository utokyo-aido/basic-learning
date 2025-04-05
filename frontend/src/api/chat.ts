import axios from 'axios';
import { ChatRequest, ChatResponse} from '../types/chat';

const API_BASE_URL = 'http://127.0.0.1:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const sendMessage = async (request: ChatRequest): Promise<ChatResponse> => {
    try {
        console.log('API Request:', request);
        const response = await api.post<ChatResponse>('/chat', request);
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(`API Error: ${error.response?.data?.detail || error.message}`);
        }
        throw error;
    }
};
