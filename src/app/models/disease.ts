import {Product} from "./product";

export interface Disease {
  id: number;
  name: string;
  description: string;
}

export interface NewDisease {
  name: string;
  description: string;
}

export interface ProductDisease {
  product: Product;
  disease: Disease;
  riskLevel: string;
}
