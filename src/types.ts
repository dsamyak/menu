export interface Ingredient {
  name: string;
  quantity: string;
  optional: boolean;
}

export type LightThemeType = 'warm' | 'cool' | 'cyberpunk' | 'candle';

export interface Dish {
  id: string;
  name: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  category: 'Burgers' | 'Ramen & Bowls' | 'Sushi & Raw' | 'Premium Desserts';
  calories: number;
  prepTime: string;
  rating: number;
  reviewsCount: number;
  ingredients: Ingredient[];
  chefTip: string;
  defaultTheme: LightThemeType;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  customizationNotes: string;
  selectedAdjustments: Record<string, boolean>; // e.g., { 'Extra Sauce': true, 'Spicy Shards': false }
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'add_to_cart' | 'toggle_wireframe' | 'set_theme' | 'explode_layers' | 'trigger_effect';
    value: string;
  };
}

export interface OrderDetails {
  items: CartItem[];
  customerName: string;
  customerEmail: string;
  tableNumber: string;
  paymentMethod: 'card' | 'apple_pay' | 'crypto';
  notes?: string;
}
