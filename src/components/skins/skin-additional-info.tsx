
import { InventoryItem } from "@/types/skin";

interface SkinAdditionalInfoProps {
  skin?: InventoryItem | null;
  item?: InventoryItem | null; // Adding item as optional to maintain backward compatibility
}

export const SkinAdditionalInfo = ({ skin, item }: SkinAdditionalInfoProps) => {
  // Use item if it exists, otherwise use skin, and ensure a default object if both are null
  const skinData = item || skin || {};
  
  // Safely access notes with a null check
  const notes = skinData && 'notes' in skinData ? skinData.notes : null;
  
  return (
    <div className="space-y-6">
      {/* Additional Information & Notes */}
      <div className="p-4 rounded-md border border-[#333] bg-[#221F26]/30">
        <h3 className="font-medium mb-2 text-[#8B5CF6]">Additional Information</h3>
        <p className="text-sm text-[#8A898C]">
          {notes || "No additional notes for this skin."}
        </p>
      </div>
    </div>
  );
};
