import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Inventory, Order, OrderItem } from "../types";

// Base URL - Use your computer's local IP for testing
const ROOT_URL = "http://192.168.1.15:8000/";

export const API = axios.create({ baseURL: ROOT_URL });

// --- AUTH INTERCEPTOR (REQUEST) ---
API.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        console.error("Error fetching token", e);
    }
    return config;
});

// --- AUTO-LOGOUT INTERCEPTOR (RESPONSE) ---
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            await AsyncStorage.removeItem('access_token');
        }
        return Promise.reject(error);
    }
);

// --- AUTH API CALLS ---
export const login = async (data: any) => {
    const response = await API.post("user/auth/jwt/create/", data);
    return response.data;
};

export const register = async (data: any) => {
    const response = await API.post("user/auth/users/", data);
    return response.data;
};

export const activate = async (uid: string, token: string) => {
    const response = await API.post("user/auth/users/activation/", { uid, token });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await API.get("user/auth/users/me/");
    return response.data;
};

// --- PRODUCT API CALLS ---
export const getProducts = async (): Promise<Product[]> => {
    const response = await API.get<Product[]>("api/products/");
    return response.data;
};

export const createProduct = async (data: Omit<Product, 'id'>): Promise<Product> => {
    const response = await API.post<Product>("api/products/", data);
    return response.data;
};

export const updateProduct = async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await API.put<Product>(`api/products/${id}/`, data);
    return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    await API.delete(`api/products/${id}/`);
};

// --- INVENTORY API CALLS ---
export const getInventory = async (): Promise<Inventory[]> => {
    const response = await API.get<Inventory[]>("api/inventory/");
    return response.data;
};

export const updateInventory = async (id: number, data: Partial<Inventory>): Promise<Inventory> => {
    const response = await API.patch<Inventory>(`api/inventory/${id}/`, data);
    return response.data;
};

// --- ORDER API CALLS ---
export const getOrders = async (): Promise<Order[]> => {
    const response = await API.get<Order[]>("api/orders/");
    return response.data;
};

export const createOrder = async (data: any): Promise<Order> => {
    const response = await API.post<Order>("api/orders/", data);
    return response.data;
};

export const createShipment = async (data: any): Promise<Order> => {
    const response = await API.post<Order>("api/orders/", data);
    return response.data;
};

export const fulfillOrder = async (id: number): Promise<{status: string}> => {
    const response = await API.post(`api/orders/${id}/fulfill/`);
    return response.data;
};

export const getFulfillmentReport = async (): Promise<any> => {
    const response = await API.get("api/reports/dashboard/");
    return response.data;
};
