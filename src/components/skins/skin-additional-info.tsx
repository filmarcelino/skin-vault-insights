
import { InventoryItem } from "@/types/skin";

interface SkinAdditionalInfoProps {
  item: InventoryItem;
}

export const SkinAdditionalInfo = ({ item }: SkinAdditionalInfoProps) => {
  return (
    <div className="space-y-6">
      {/* Additional Information & Notes */}
      <div className="p-4 rounded-md border border-[#333] bg-[#221F26]/30">
        <h3 className="font-medium mb-2 text-[#8B5CF6]">Additional Information</h3>
        <p className="text-sm text-[#8A898C]">
          {item.notes || "No additional notes for this skin."}
        </p>
      </div>
    </div>
  );
};
