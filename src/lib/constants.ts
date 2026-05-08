export const MATERIAL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "使用中",
  TRANSITIONING: "移行中",
  SUSPENDED: "使用停止",
  DISCONTINUED: "廃止",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  INBOUND: "入庫",
  OUTBOUND: "出庫",
  ADJUSTMENT: "調整",
  CANCEL: "取消",
};

export const INBOUND_REASONS = ["通常入庫", "返品", "在庫調整", "その他"] as const;
export const OUTBOUND_REASONS = ["使用", "廃棄", "サンプル", "移動", "その他"] as const;

export const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "使用中" },
  { value: "TRANSITIONING", label: "移行中" },
  { value: "SUSPENDED", label: "使用停止" },
  { value: "DISCONTINUED", label: "廃止" },
];
