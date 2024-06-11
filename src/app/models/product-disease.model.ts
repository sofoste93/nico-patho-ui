// product-disease.model.ts
import { Product } from './product';
import { Disease } from './disease';

export interface ProductDisease {
  id: number;
  product: Product;
  disease: Disease;
  riskLevel: string;
}
