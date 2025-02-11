import axios from 'axios';
import { ChatRequest, ChatResponse, ApiKeyRequest, SessionResponse } from '../types/chat';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const registerApiKey = async (apiKey: string): Promise<SessionResponse> => {
    try {
        const response = await api.post<SessionResponse>('/register_api_key', {
            api_key: apiKey
        } as ApiKeyRequest);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(`API Error: ${error.response?.data?.detail || error.message}`);
        }
        throw error;
    }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
    try {
        await api.delete(`/session/${sessionId}`);
    } catch (error) {
        console.error('API Error:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(`API Error: ${error.response?.data?.detail || error.message}`);
        }
        throw error;
    }
};

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
