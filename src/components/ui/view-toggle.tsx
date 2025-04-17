
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
  className?: string;
}

export const ViewToggle: FC<ViewToggleProps> = ({
  view,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant={view === 'grid' ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange('grid')}
        title="Grid View"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange('list')}
        title="List View"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};
