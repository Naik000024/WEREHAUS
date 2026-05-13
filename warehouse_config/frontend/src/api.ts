import axios from "axios";
import { Product, Inventory, Order, OrderItem } from "./types";

export const API = axios.create({ baseURL: "http://127.0.0.1:8000/api/" });

// --- AUTH INTERCEPTOR (REQUEST) ---
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- AUTO-LOGOUT INTERCEPTOR (RESPONSE) ---
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

// --- PRODUCT API CALLS ---
export const getproducts = async (): Promise<Product[]> => {
    const response = await API.get<Product[]>("products/");
    return response.data;
};

export const createproducts = async (data: Omit<Product, 'id'>): Promise<Product> => {
    const response = await API.post<Product>("products/", data);
    return response.data;
};

export const updateproducts = async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await API.put<Product>(`products/${id}/`, data);
    return response.data;
};

export const deleteproducts = async (id: number): Promise<void> => {
    await API.delete(`products/${id}/`);
};

// --- INVENTORY API CALLS ---
export const getinventory = async (): Promise<Inventory[]> => {
    const response = await API.get<Inventory[]>("inventory/");
    return response.data;
};

// --- ORDER API CALLS ---
export const getorders = async (): Promise<Order[]> => {
    const response = await API.get<Order[]>("orders/");
    return response.data;
};

export const createshipment = async (data: any): Promise<Order> => {
    const response = await API.post<Order>("orders/", data);
    return response.data;
};

export const createorder = async (data: Omit<Order, 'id' | 'status' | 'order_date'>): Promise<Order> => {
    const response = await API.post<Order>("orders/", data);
    return response.data;
};

export const deleteorder = async (id: number): Promise<void> => {
    await API.delete(`orders/${id}/`);
};

// --- ORDER ITEM API CALLS ---
export const getorderitems = async (): Promise<OrderItem[]> => {
    const response = await API.get<OrderItem[]>("order-items/");
    return response.data;
};

export const createorderitem = async (data: Omit<OrderItem, 'id'>): Promise<OrderItem> => {
    const response = await API.post<OrderItem>("order-items/", data);
    return response.data;
};

export const updateorderitem = async (id: number, data: Partial<OrderItem>): Promise<OrderItem> => {
    const response = await API.put<OrderItem>(`order-items/${id}/`, data);
    return response.data;
};

export const deleteorderitem = async (id: number): Promise<void> => {
    await API.delete(`order-items/${id}/`);
};

// --- CORE LOGIC: FULFILLMENT & REPORTS ---
export const fulfillorder = async (id: number): Promise<{status: string}> => {
    const response = await API.post(`orders/${id}/fulfill/`);
    return response.data;
};

export const getfulfillmentreport = async (): Promise<any> => {
    const response = await API.get("reports/dashboard/");
    return response.data;
};