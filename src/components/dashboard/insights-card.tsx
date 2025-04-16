
import { FC, useState } from "react";
import { Lightbulb, X, Eye, EyeOff, XCircle } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InsightsCardProps {
  message: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export const InsightsCard: FC<InsightsCardProps> = ({
  message,
  className = "",
  style,
  id = "insight-1"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false); // Use this if you want to animate on hover

  // Toggle read status
  const toggleReadStatus = () => {
    setIsRead(!isRead);
    // Save read status in localStorage
    localStorage.setItem(`insight-${id}-read`, (!isRead).toString());
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsPulsing(true)}
        onMouseLeave={() => setIsPulsing(false)}
        className={`cs-insights-card p-4 flex items-start gap-3 cursor-pointer transition-all ${className} ${
          isRead ? 'opacity-80' : 'shadow-[0_0_15px_rgba(0,157,255,0.3)]'
        } hover:shadow-[0_0_20px_rgba(0,157,255,0.5)]`} 
        style={style}
      >
        <Lightbulb className={`h-6 w-6 text-white shrink-0 mt-0.5 ${!isRead && 'animate-glow-soft'}`} />
        <div>
          <div className="font-medium mb-1">Insights {isRead && <span className="text-xs opacity-70">(Lido)</span>}</div>
          <div className="text-sm">{message}</div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Insights
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4 bg-secondary/30 rounded-md my-2">
            {message}
          </div>
          
          <DialogFooter className="flex sm:justify-between items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleReadStatus}
              className="flex items-center gap-1"
            >
              {isRead ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Marcar como não lido
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Marcar como lido
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
