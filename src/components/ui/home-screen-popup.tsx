
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const HomeScreenPopup = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Verificar se o popup já foi mostrado antes
    const hasShownPopup = localStorage.getItem("homeScreenPopupShown");
    
    // Mostrar o popup apenas em dispositivos móveis e se não tiver sido mostrado antes
    if (isMobile && !hasShownPopup) {
      // Esperar alguns segundos antes de mostrar o popup para melhor experiência do usuário
      const timer = setTimeout(() => {
        setOpen(true);
        // Marcar o popup como mostrado
        localStorage.setItem("homeScreenPopupShown", "true");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // Detectar o sistema operacional
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Limpar o localStorage para testar novamente (apenas para desenvolvimento)
  const resetPopupState = () => {
    localStorage.removeItem("homeScreenPopupShown");
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Adicione o CS Skin Vault à tela inicial
          </DialogTitle>
          <DialogDescription className="text-center">
            Acesse rapidamente o aplicativo diretamente da sua tela inicial
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center p-4">
          <img 
            src="/lovable-uploads/bf94853c-aef8-4bc7-8ca6-60524a082ca0.png" 
            alt="CS Skin Vault" 
            className="w-16 h-16 mb-4 rounded-lg bg-black"
          />
          
          {isIOS ? (
            <div className="space-y-4 text-sm">
              <p><strong>Para iOS:</strong></p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Toque no ícone <span className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Compartilhar <span className="ml-1">↑</span></span> na barra inferior do Safari</li>
                <li>Deslize para cima e selecione <span className="font-semibold">Adicionar à Tela de Início</span></li>
                <li>Confirme tocando em <span className="font-semibold">Adicionar</span> no canto superior direito</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <p><strong>Para Android:</strong></p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Toque no ícone de menu <span className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">⋮</span> no Chrome</li>
                <li>Selecione <span className="font-semibold">Adicionar à tela inicial</span> ou <span className="font-semibold">Instalar aplicativo</span></li>
                <li>Confirme tocando em <span className="font-semibold">Adicionar</span> ou <span className="font-semibold">Instalar</span></li>
              </ol>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setOpen(false)}>Entendi</Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setOpen(false);
              // Reset para mostrar o popup novamente na próxima visita
              localStorage.removeItem("homeScreenPopupShown");
            }}
          >
            Lembrar depois
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
