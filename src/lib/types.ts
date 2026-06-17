export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number; // in cents (EUR)
  compareAtPrice: number | null; // original price for showing discounts
  image: string;
  gallery: string[];
  category: string;
  stock: number;
  supplier: string;
  rating: number;
  reviews: number;
  featured: number; // 0 | 1
  createdAt: string;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: number;
  reference: string;
  createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  items?: OrderItem[];
}
