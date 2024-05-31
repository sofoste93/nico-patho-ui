export interface Firm {
  id: number;
  name: string;
  headquarters: string;
  annualRevenue: number;
  annualTax: number;
  annualProfit: number;
}

export interface NewFirm {
  name: string;
  headquarters: string;
  annualRevenue: number;
  annualTax: number;
  annualProfit: number;
}
