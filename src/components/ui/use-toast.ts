
// Corrige a exportação para evitar conflito com sonner
import { useToast as useOriginalToast, toast as originalToast } from "@/hooks/use-toast";

export { useOriginalToast as useToast, originalToast as toast };
