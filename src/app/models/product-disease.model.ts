export interface ProductDisease {
  id: number;
  productId: number;
  diseaseId: number;
  riskLevel: string;
  product?: { id: number, brandName: string };
  disease?: { id: number, name: string };
}

export interface NewProductDisease {
  productId: number | null;
  diseaseId: number | null;
  riskLevel: string;
}
