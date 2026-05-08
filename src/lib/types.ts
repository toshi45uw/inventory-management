export interface MaterialWithStock {
  id: number;
  materialCode: string;
  materialName: string;
  category: string;
  specification: string;
  unit: string;
  status: string;
  previousMaterialCode: string | null;
  successorMaterialCode: string | null;
  minimumStock: number;
  storageLocation: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  stock: {
    currentQuantity: number;
  } | null;
}

export interface StockTransaction {
  id: number;
  transactionType: string;
  materialId: number;
  materialCodeSnapshot: string;
  materialNameSnapshot: string;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  reason: string;
  destinationOrSource: string;
  note: string;
  operatedBy: string;
  operatedAt: string;
}
