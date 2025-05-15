
// Make sure getRarityColorClass is exported properly if it's being used elsewhere
export const getRarityColor = (rarity?: string) => {
  if (!rarity) return "#888888";
  
  switch (rarity?.toLowerCase()) {
    case "consumer grade":
    case "white":
      return "#B0C3D9";
    case "industrial grade":
    case "light blue":
      return "#5E98D9";
    case "mil-spec grade":
    case "blue":
      return "#4B69FF";
    case "restricted":
    case "purple":
      return "#8847FF";
    case "classified":
    case "pink":
      return "#D32CE6";
    case "covert":
    case "red":
      return "#EB4B4B";
    case "contraband":
    case "gold":
      return "#FFD700";
    case "extraordinary":
    case "rare special":
    case "knife":
    case "glove":
      return "#FFF99B";
    default:
      return "#888888";
  }
};

export const getRarityColorClass = (rarity?: string) => {
  if (!rarity) return "";
  
  switch (rarity?.toLowerCase()) {
    case "consumer grade":
    case "white":
      return "bg-[rgba(176,195,217,0.2)] border-[#B0C3D9]";
    case "industrial grade":
    case "light blue":
      return "bg-[rgba(94,152,217,0.2)] border-[#5E98D9]";
    case "mil-spec grade":
    case "blue":
      return "bg-[rgba(75,105,255,0.2)] border-[#4B69FF]";
    case "restricted":
    case "purple":
      return "bg-[rgba(136,71,255,0.2)] border-[#8847FF]";
    case "classified":
    case "pink":
      return "bg-[rgba(211,44,230,0.2)] border-[#D32CE6]";
    case "covert":
    case "red":
      return "bg-[rgba(235,75,75,0.2)] border-[#EB4B4B]";
    case "contraband":
    case "gold":
      return "bg-[rgba(255,215,0,0.2)] border-[#FFD700]";
    case "extraordinary":
    case "rare special":
    case "knife":
    case "glove":
      return "bg-[rgba(255,249,155,0.2)] border-[#FFF99B]";
    default:
      return "";
  }
};
