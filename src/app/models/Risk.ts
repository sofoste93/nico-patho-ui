// model Risk
import { Product } from './product';
import { Disease } from './disease';

export interface Risk {
  product: Product;
  disease: Disease;
  riskLevel: string;
}
