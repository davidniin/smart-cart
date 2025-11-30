export interface ShoppingItem {
  id: string;
  name: string;
  category?: string;
  status: 'TO_BUY' | 'IN_PANTRY';
  notes?: string;
  price?: number;
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export enum AppTab {
  LIST = 'LIST',
  ADD = 'ADD',
  INSPIRE = 'INSPIRE'
}

export interface SearchResult {
  text: string;
  sources?: {
    uri: string;
    title: string;
  }[];
}

export const CATEGORIES = [
  'Frutas',
  'Verduras y Hortalizas',
  'Carne y Aves',
  'Pescado y Marisco',
  'Charcutería y Quesos',
  'Lácteos y Huevos',
  'Panadería y Pastelería',
  'Pasta, Arroz y Legumbres',
  'Aceites, Salsas y Especias',
  'Conservas y Caldos',
  'Desayuno y Dulces',
  'Agua, Refrescos y Zumos',
  'Vinos y Licores',
  'Congelados',
  'Limpieza y Hogar',
  'Cuidado Personal',
  'Bebé',
  'Mascotas',
  'Otros'
];