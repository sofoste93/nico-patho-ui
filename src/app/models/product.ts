export interface Product {
  id: number;
  brandName: string;
  nicotineContent: number;
  tarContent: number;
  condensateContent: number;
  firm: {
    id: number;
    name: string;
  } | null;
}

export interface NewProduct {
  brandName: string;
  nicotineContent: number;
  tarContent: number;
  condensateContent: number;
  firmId: number | null;
}
