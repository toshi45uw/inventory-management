import { MATERIAL_STATUS_LABELS } from "@/lib/constants";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  TRANSITIONING: "bg-blue-100 text-blue-800",
  SUSPENDED: "bg-yellow-100 text-yellow-800",
  DISCONTINUED: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"}`}>
      {MATERIAL_STATUS_LABELS[status] ?? status}
    </span>
  );
}
