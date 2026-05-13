export interface Product {
    id: number;
    name: string;
    sku: string;
    // Changed to number to match Django's DecimalField and avoid 400 errors
    price: number; 
    description?: string;
    initial_stock?: number;
}

export interface Inventory {
    id: number;
    // Added this field so the StockAllocation logic can find the product
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
    // Use the interface instead of 'any' for better error catching
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