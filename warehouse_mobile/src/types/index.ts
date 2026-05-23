export interface Product {
    id: number;
    name: string;
    sku: string;
    price: number; 
    description?: string;
    initial_stock?: number;
}

export interface Inventory {
    id: number;
    product: number; 
    product_name: string;
    quantity_available: number;
    last_updated: string;
}

export interface OrderItem {
    id: number;
    order: number;
    product: number;
    product_name?: string;
    quantity: number;
}

export interface Order {
    id: number;
    customer_name: string;
    status: string;
    order_date: string;
    location: string;
    assigned_deliverer: string | null;
    shipped_at: string | null;
    items: OrderItem[]; 
}

export interface Transaction {
    id: number;
    timestamp: string;
    type: 'RESTOCK' | 'SHIPMENT';
    product_name: string;
    quantity: number;
    customer_name?: string;
}

export interface User {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
}
